"""ISO validation and copy/run regression tests; RPM commands are simulated."""
import importlib.util
import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch


MODULE_PATH = Path(__file__).resolve().parents[1] / "python/host/ablestack_update.py"
SPEC = importlib.util.spec_from_file_location("ablestack_update", MODULE_PATH)
update = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(update)


class UpdateIsoTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="mold helper tests ")
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.mount = self.root / "iso"
        self.mount.mkdir()
        self.work = self.root / "work"
        os_release = self.root / "os-release"
        os_release.write_text('PRETTY_NAME="ABLESTACK Current"\n')
        self.addCleanup(patch.stopall)
        patch.object(update, "OS_RELEASE_PATH", os_release).start()
        patch.object(update, "UPDATE_WORK_DIR", self.work).start()
        self.commands = []
        self.available = {"rpm"}
        self.blocked = set()
        self.installed = True
        self.installed_versions = {"cloudstack-common": "1.0-1", "cloudstack-agent": "9.9-1"}
        patch.object(update.shutil, "which", side_effect=lambda cmd: cmd if cmd in self.available else None).start()
        self.real_run = subprocess.run
        patch.object(update.subprocess, "run", side_effect=self.run_command).start()

    def run_command(self, args, **kwargs):
        self.commands.append(args)
        if args[0] not in ("rpm", "aspkg"):
            return self.real_run(args, **kwargs)
        if "--version" in args:
            return subprocess.CompletedProcess(args, int(args[0] in self.blocked), "", "")
        if "-qp" in args:
            text = Path(args[-1]).read_text()
            if text == "broken":
                return subprocess.CompletedProcess(args, 1, "", "not an RPM")
            return subprocess.CompletedProcess(args, 0, text, "")
        return subprocess.CompletedProcess(args, 0 if self.installed else 1,
                                           self.installed_versions[args[-1]] + "\n" if self.installed else "", "")

    def add_rpm(self, name, filename=None, directory="rpms"):
        path = self.mount / directory / (filename or f"{name}-2.0-1.noarch.rpm")
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"{name}\t2.0-1\tnoarch\n")
        return path

    def mold_iso(self, directory="rpms"):
        (self.mount / "update-mold.sh").write_text(
            '#!/bin/bash\nset -eu\n'
            'test -f rpms/cloudstack-common-2.0-1.noarch.rpm\n'
            'printf "mold:%s:%s" "$PWD" "$ABLESTACK_UPDATE_TYPE"\n')
        for package in update.MOLD_PACKAGES:
            self.add_rpm(package, directory=directory)

    def full_iso(self):
        ks = self.mount / update.TARGET_KS_PATH
        ks.parent.mkdir(parents=True, exist_ok=True)
        ks.write_text('ABLESTACK_VERSION="ABLESTACK Next"\n')
        (self.mount / "update-all.sh").write_text(
            '#!/bin/bash\nset -eu\ntest -f ks/ablestack-ks.cfg\n'
            'printf "all:%s:%s" "$PWD" "$ABLESTACK_UPDATE_TYPE"\n')

    def test_mold_reads_five_headers_without_ks_config_or_appstream(self):
        self.mold_iso()
        info = update.read_update_info(str(self.mount), "mold")
        self.assertEqual(info["target_mold_version"], "2.0-1")
        self.assertEqual(info["current_mold_version"], "1.0-1")
        self.assertEqual(info["current_ablestack_version"], info["target_ablestack_version"])
        self.assertEqual([p["name"] for p in info["mold_packages"]], list(update.MOLD_PACKAGES))
        self.assertEqual(info["work_update_script"], str(self.work / "update-mold.sh"))
        self.assertTrue(all(command[0] == "rpm" for command in self.commands))

    def test_mold_ignores_ks_version_even_if_present(self):
        self.mold_iso()
        self.full_iso()
        (self.mount / update.TARGET_KS_PATH).write_text("no OS version here")
        self.assertEqual(update.read_update_info(str(self.mount), "mold")["target_mold_version"], "2.0-1")

    def test_mold_versions_use_common_version_release_without_epoch_or_arch(self):
        self.mold_iso()
        current = "4.23.0.0-Mold.Europa.202609111701.1"
        target = "4.23.0.0-Mold.Europa.202609141701.1"
        self.installed_versions["cloudstack-common"] = current
        common = next((self.mount / "rpms").glob("cloudstack-common-*.rpm"))
        common.write_text(f"cloudstack-common\t{target}\tx86_64\n")
        info = update.read_update_info(str(self.mount), "mold")
        self.assertEqual(info["current_mold_version"], current)
        self.assertEqual(info["target_mold_version"], target)
        current_query = next(command for command in self.commands if "-q" in command)
        self.assertEqual(current_query[-1], "cloudstack-common")
        self.assertEqual(current_query[current_query.index("--qf") + 1], "%{VERSION}-%{RELEASE}\n")
        self.assertNotIn("EPOCHNUM", update.MOLD_RPM_QUERY_FORMAT)

    def test_mold_supports_script_root_and_legacy_rpm_layout(self):
        for layout in (".", "AppStream/Packages/mold"):
            with self.subTest(layout=layout):
                self.mold_iso(directory=layout)
                info = update.read_update_info(str(self.mount), "mold")
                self.assertEqual(info["mold_rpm_dir"], str((self.mount / layout).resolve()))

    def test_mold_missing_script_is_rejected(self):
        self.mold_iso()
        (self.mount / "update-mold.sh").unlink()
        with self.assertRaisesRegex(FileNotFoundError, "update-mold.sh"):
            update.read_update_info(str(self.mount), "mold")

    def test_mold_script_directory_is_rejected(self):
        self.mold_iso()
        script = self.mount / "update-mold.sh"
        script.unlink()
        script.mkdir()
        with self.assertRaises(FileNotFoundError):
            update.read_update_info(str(self.mount), "mold")

    def test_mold_missing_ccvm_package_is_rejected(self):
        self.mold_iso()
        next((self.mount / "rpms").glob("cloudstack-ui-*.rpm")).unlink()
        with self.assertRaisesRegex(FileNotFoundError, "cloudstack-ui"):
            update.read_update_info(str(self.mount), "mold")

    def test_mold_no_rpms_is_rejected(self):
        (self.mount / "update-mold.sh").write_text("#!/bin/bash\n")
        with self.assertRaisesRegex(FileNotFoundError, "RPM 파일"):
            update.read_update_info(str(self.mount), "mold")

    def test_duplicate_package_header_is_rejected_despite_filename(self):
        self.mold_iso()
        self.add_rpm("cloudstack-common", filename="unrelated-filename.rpm")
        with self.assertRaisesRegex(ValueError, "cloudstack-common RPM이 중복"):
            update.read_update_info(str(self.mount), "mold")

    def test_misleading_filename_does_not_satisfy_missing_package(self):
        self.mold_iso()
        path = next((self.mount / "rpms").glob("cloudstack-ui-*.rpm"))
        path.write_text("another-package\t0:2.0-1\tnoarch\n")
        with self.assertRaisesRegex(FileNotFoundError, "cloudstack-ui"):
            update.read_update_info(str(self.mount), "mold")

    def test_corrupt_rpm_is_rejected(self):
        self.mold_iso()
        next((self.mount / "rpms").glob("*.rpm")).write_text("broken")
        with self.assertRaisesRegex(ValueError, "RPM 정보를 읽을 수 없습니다"):
            update.read_update_info(str(self.mount), "mold")

    def test_invalid_metadata_format_is_rejected(self):
        self.mold_iso()
        next((self.mount / "rpms").glob("*.rpm")).write_text("invalid header output")
        with self.assertRaisesRegex(ValueError, "RPM 정보 형식"):
            update.read_update_info(str(self.mount), "mold")

    def test_aspkg_is_preferred_and_blocked_command_falls_back(self):
        self.mold_iso()
        self.available.add("aspkg")
        update.read_update_info(str(self.mount), "mold")
        self.assertTrue(all(command[0] == "aspkg" for command in self.commands))
        self.commands.clear()
        self.blocked.add("aspkg")
        update.read_update_info(str(self.mount), "mold")
        self.assertTrue(all(command[0] == "rpm" for command in self.commands if "-qp" in command))

    def test_no_rpm_command_reports_requirement(self):
        self.mold_iso()
        self.available.clear()
        with self.assertRaisesRegex(RuntimeError, "rpm/aspkg"):
            update.read_update_info(str(self.mount), "mold")

    def test_uninstalled_current_version_does_not_invalidate_iso(self):
        self.mold_iso()
        self.installed = False
        self.assertEqual(update.read_update_info(str(self.mount), "mold")["current_mold_version"], "N/A")

    def test_full_update_keeps_ks_version_and_does_not_query_rpm(self):
        self.full_iso()
        info = update.read_update_info(str(self.mount))
        self.assertEqual(info["target_ablestack_version"], "ABLESTACK Next")
        self.assertEqual(info["current_ablestack_version"], "ABLESTACK Current")
        self.assertNotIn("target_mold_version", info)
        self.assertEqual(self.commands, [])

    def test_full_update_still_requires_ks_and_version(self):
        self.full_iso()
        ks = self.mount / update.TARGET_KS_PATH
        ks.write_text("ABLESTACK_VERSION=\n")
        with self.assertRaisesRegex(ValueError, "ABLESTACK_VERSION"):
            update.read_update_info(str(self.mount), "all")
        ks.unlink()
        with self.assertRaisesRegex(FileNotFoundError, "ks/ablestack-ks.cfg"):
            update.read_update_info(str(self.mount), "all")

    def test_full_update_does_not_accept_mold_only_iso(self):
        self.mold_iso()
        with self.assertRaises(FileNotFoundError):
            update.read_update_info(str(self.mount), "all")

    def test_mold_run_copies_small_iso_and_executes_its_script(self):
        self.mold_iso()
        result = update.run_update(str(self.mount), "mold")
        self.assertEqual(result["stdout"], f"mold:{self.work}:mold")
        self.assertEqual(len(list((self.work / "rpms").glob("*.rpm"))), 5)
        self.assertFalse((self.work / "ks").exists())
        self.assertFalse((self.work / "AppStream").exists())

    def test_mold_run_revalidates_before_replacing_previous_work(self):
        self.mold_iso()
        update.read_update_info(str(self.mount), "mold")
        self.work.mkdir()
        marker = self.work / "previous-update"
        marker.write_text("keep")
        next((self.mount / "rpms").glob("cloudstack-ui-*.rpm")).unlink()
        with self.assertRaises(FileNotFoundError):
            update.run_update(str(self.mount), "mold")
        self.assertEqual(marker.read_text(), "keep")
        self.assertTrue(all(command[0] == "rpm" for command in self.commands))

    def test_full_run_keeps_existing_copy_and_execution_flow(self):
        self.full_iso()
        self.work.mkdir()
        (self.work / "previous-file").write_text("old")
        result = update.run_update(str(self.mount), "all")
        self.assertEqual(result["stdout"], f"all:{self.work}:all")
        self.assertTrue((self.work / update.TARGET_KS_PATH).is_file())
        self.assertFalse((self.work / "previous-file").exists())
        self.assertFalse(any(command[0] in ("rpm", "aspkg") for command in self.commands))

    def test_script_failure_is_reported(self):
        self.mold_iso()
        (self.mount / "update-mold.sh").write_text('echo "update failed" >&2\nexit 7\n')
        with self.assertRaisesRegex(RuntimeError, "update failed"):
            update.run_update(str(self.mount), "mold")


if __name__ == "__main__":
    unittest.main()
