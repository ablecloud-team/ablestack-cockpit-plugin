"""GFS stripe persistence and command construction; never access real disks."""
import importlib.util
import io
import json
from pathlib import Path
import shlex
import sys
import tempfile
import types
import unittest
from contextlib import redirect_stdout
from unittest.mock import Mock, patch

ROOT = Path(__file__).resolve().parents[1]


class GfsStripeTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory(prefix='gfs stripe ')
        self.root = Path(self.temporary.name)
        properties = self.root / 'tools/properties'
        properties.mkdir(parents=True)
        (properties / 'cluster.json').write_text(json.dumps({'clusterConfig': {'type': 'ablestack-hci-filesystem'}}))
        self.config = properties / 'ablestack.json'
        self.original = {'bootstrap': {'ccvm': 'true'}, 'gfs': {'journal_size_mb': 512, 'resource_group_size_mb': 1024}}
        self.config.write_text(json.dumps(self.original))
        self.config.chmod(0o640)
        package = types.ModuleType('ablestack')
        package.pluginpath = str(self.root)
        package.createReturn = lambda **values: json.dumps(values)
        remote = types.ModuleType('remote_session')
        remote.RemoteHost = Mock()
        with patch.dict(sys.modules, {'ablestack': package, 'remote_session': remote, 'paramiko': types.ModuleType('paramiko')}):
            spec = importlib.util.spec_from_file_location('gfs_test_module', ROOT / 'python/gfs/gfs_manage.py')
            self.module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(self.module)
        self.commands = []
        self.module.run_command = Mock(side_effect=self.command)
        self.module.connect_to_host = Mock(return_value=Mock())
        self.module.get_lv_path = Mock(return_value='/dev/vg_test/lv_test')

    def tearDown(self):
        self.temporary.cleanup()

    def command(self, command, *args, **kwargs):
        self.commands.append((command, kwargs))
        return 'sdb sdc' if command.startswith('lsblk ') else ''

    def create(self, disks, size=None):
        output = io.StringIO()
        with patch.object(self.module.time, 'sleep'), patch.object(self.module.subprocess, 'call', return_value=0), redirect_stdout(output):
            self.module.create_gfs(disks, 'vg_test', 'lv_test', 'data-gfs', '/mnt/data', 'test-cluster', 2,
                                   ['node-1'], stripe_size_kib=size)
        return json.loads(output.getvalue())

    def test_default_missing_key_is_128_and_existing_mkfs_defaults_are_unchanged(self):
        self.assertEqual(self.module.get_gfs_stripe_size(), 128)
        self.assertEqual(self.module.get_gfs_mkfs_sizes(), (512, 1024))
        defaults = json.loads((ROOT / 'tools/properties/ablestack.json').read_text())['gfs']
        self.assertEqual(defaults['stripe_size_kib'], 128)
        self.assertEqual(defaults['journal_size_mb'], 512)
        self.assertEqual(defaults['resource_group_size_mb'], 1024)

    def test_all_supported_selections_persist_as_numbers_and_keep_other_config(self):
        for value in (64, 128, 256, 512):
            with self.subTest(value=value):
                self.module.set_gfs_stripe_size(value)
                saved = json.loads(self.config.read_text())
                self.assertEqual(saved['gfs']['stripe_size_kib'], value)
                self.assertIs(type(saved['gfs']['stripe_size_kib']), int)
                self.assertEqual(saved['bootstrap'], self.original['bootstrap'])
                self.assertEqual(saved['gfs']['journal_size_mb'], 512)
                self.assertEqual(saved['gfs']['resource_group_size_mb'], 1024)
                self.assertEqual(self.config.stat().st_mode & 0o777, 0o640)
                self.assertEqual(self.module.get_gfs_stripe_size(), value)

    def test_disk_selection_count_becomes_i_and_saved_size_becomes_I(self):
        for count, size in ((1, 64), (2, 128), (3, 256), (10, 512)):
            with self.subTest(count=count, size=size):
                self.commands.clear()
                self.module.set_gfs_stripe_size(size)
                result = self.create(['/dev/rbd' + str(index) for index in range(count)])
                self.assertEqual(result['code'], 200, result)
                command, options = next((cmd, opts) for cmd, opts in self.commands if cmd.startswith('lvcreate '))
                args = shlex.split(command)
                self.assertEqual(args[args.index('-i') + 1], str(count))
                self.assertEqual(args[args.index('-I') + 1], str(size) + 'k')
                self.assertEqual(args[args.index('-l') + 1], '100%FREE')
                self.assertIn('--activate', args)
                self.assertFalse(options['suppress_errors'])
                mkfs = next(cmd for cmd, _ in self.commands if cmd.startswith('mkfs.gfs2 '))
                self.assertIn('-J 512 -r 1024', mkfs)

    def test_create_persists_the_submitted_choice_then_reads_it_from_json(self):
        self.module.set_gfs_stripe_size(64)
        read = Mock(wraps=self.module.get_gfs_stripe_size)
        with patch.object(self.module, 'get_gfs_stripe_size', read):
            result = self.create(['/dev/rbd0', '/dev/rbd1'], 256)
        self.assertEqual(result['code'], 200, result)
        read.assert_called_once_with()
        self.assertEqual(json.loads(self.config.read_text())['gfs']['stripe_size_kib'], 256)
        self.assertTrue(any('-i 2 -I 256k' in cmd for cmd, _ in self.commands))

    def test_invalid_values_and_empty_or_duplicate_disks_fail_before_partitioning(self):
        for value in (0, 32, 127, 129, 1024, True, 128.0, '128; false'):
            with self.subTest(value=value):
                self.commands.clear()
                result = self.create(['/dev/rbd0'], value)
                self.assertEqual(result['code'], 500)
                self.assertEqual(self.commands, [])
                self.assertEqual(json.loads(self.config.read_text()), self.original)
        for disks in ([], [''], ['/dev/rbd0', '/dev/rbd0']):
            self.assertEqual(self.create(disks, 128)['code'], 500)
            self.assertEqual(self.commands, [])

    def test_atomic_save_failure_preserves_json_and_prevents_storage_commands(self):
        before = self.config.read_bytes()
        with patch.object(self.module.os, 'replace', side_effect=OSError('simulated write failure')):
            result = self.create(['/dev/rbd0'], 512)
        self.assertEqual(result['code'], 500)
        self.assertEqual(self.config.read_bytes(), before)
        self.assertFalse(list(self.config.parent.glob('.ablestack-gfs-*')))
        self.assertEqual(self.commands, [])

    def test_failed_lvcreate_stops_before_mkfs(self):
        def command(value, *args, **kwargs):
            if value.startswith('lvcreate '):
                raise RuntimeError('simulated stripe allocation failure')
            return self.command(value, *args, **kwargs)
        self.module.run_command.side_effect = command
        result = self.create(['/dev/rbd0', '/dev/rbd1'], 128)
        self.assertEqual(result['code'], 500)
        self.assertIn('stripe allocation failure', result['val'])
        self.assertFalse(any(cmd.startswith('mkfs.gfs2 ') for cmd, _ in self.commands))

    def test_raw_disks_get_partition_names_before_lv_creation(self):
        self.module.os_type = 'ablestack-vm'
        result = self.create(['/dev/sdb', '/dev/sdc'], 128)
        self.assertEqual(result['code'], 200, result)
        self.assertIn('pvcreate -ff --yes /dev/sdb1', [cmd for cmd, _ in self.commands])
        self.assertIn('pvcreate -ff --yes /dev/sdc1', [cmd for cmd, _ in self.commands])

    def test_settings_cli_reads_and_writes_without_running_storage_commands(self):
        for arguments, expected in ((['--get-gfs-settings'], 128),
                                    (['--set-gfs-settings', '--stripe-size-kib', '512'], 512),
                                    (['--get-gfs-settings'], 512)):
            output = io.StringIO()
            with patch.object(sys, 'argv', ['gfs_manage.py', *arguments]), redirect_stdout(output):
                self.module.main()
            response = json.loads(output.getvalue())
            self.assertEqual(response['code'], 200)
            self.assertEqual(response['val']['stripe_size_kib'], expected)
            self.assertEqual(self.commands, [])


if __name__ == '__main__':
    unittest.main()
