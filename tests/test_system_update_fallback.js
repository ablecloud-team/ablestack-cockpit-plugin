// Run with: node tests/test_system_update_fallback.js
// Cockpit commands and DOM updates are simulated; no update script is executed.
async function testSystemUpdateFallback(source) {
  const names = ['cloudstack-common', 'cloudstack-agent', 'cloudstack-management', 'cloudstack-usage', 'cloudstack-ui'];
  const tests = [];
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }
  async function rejects(action, pattern) {
    try { await action(); } catch (error) {
      assert(pattern.test(error.message), 'Unexpected error: ' + error.message);
      return;
    }
    throw new Error('Expected validation failure');
  }
  function fixture(options = {}) {
    const calls = [];
    const elements = new Map();
    const records = names.map((name) => ({ name, version: '2.0-1', arch: 'noarch', path: '/mnt/iso/rpms/' + name + '.rpm' }));
    let executions = 0;
    function $(selector) {
      if (!elements.has(selector)) elements.set(selector, {
        value: '',
        text(value) { if (value === undefined) return this.value; this.value = value; return this; },
        val() { return options.type || 'all'; },
        prop() { return this; }, attr() { return this; }, on() { return this; },
        removeAttr() { return this; }, css() { return this; }
      });
      return elements.get(selector);
    }
    $.trim = (value) => String(value || '').trim();
    const cockpit = { async spawn(args) {
      calls.push(args);
      if (args[0] === 'test') {
        if (args[1] === '-f' && options.missingScript) throw new Error('missing update-mold.sh');
        return '';
      }
      if (args[0] === 'cat') {
        if (args[1] === '/etc/os-release') return 'PRETTY_NAME="ABLESTACK Current"\n';
        if (options.ks === undefined) throw new Error('missing ks/ablestack-ks.cfg');
        return options.ks;
      }
      if (args[0] === 'rpm' || args[0] === 'aspkg') {
        if (args.includes('--version')) {
          if ((args[0] === 'aspkg' && !options.aspkg) || options.noRpm) throw new Error('command unavailable');
          return 'RPM';
        }
        if (args.includes('-qp')) {
          if (options.brokenRpm) throw new Error('not an RPM');
          if (options.malformed) return 'bad header';
          const record = records.find((entry) => entry.path === args[args.length - 1]);
          return [record.name, record.version, record.arch].join('\t') + '\n';
        }
        if (options.uninstalled) throw new Error('not installed');
        return (args[args.length - 1] === 'cloudstack-common' ? (options.installedVersion || '1.0-1') : '9.9-1') + '\n';
      }
      if (args[0] === '/bin/bash' && args[3] === 'mold-iso-info') {
        return ['/mnt/iso/rpms', ...records.map((record) => record.path), ''].join('\0');
      }
      if (args[0] === '/bin/bash' && args[3] === 'ablestack-update') {
        executions++;
        return 'update complete';
      }
      throw new Error('Unexpected command: ' + JSON.stringify(args));
    } };
    const api = new Function('$', 'cockpit', 'document', source + '\nreturn {' +
      'loadSystemUpdateInfoFallback, runSystemUpdateFallback, updateSystemUpdateInfo, clearSystemUpdateLoadedInfo, resetSystemUpdateConfirmModal};')($, cockpit, {});
    return { api, calls, records, $, get executions() { return executions; } };
  }
  function test(name, run) { tests.push({ name, run }); }

  test('Mold info accepts five RPMs without reading KS or executing updater', async () => {
    const f = fixture();
    const info = await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold');
    assert(info.target_mold_version === '2.0-1', 'target RPM version');
    assert(info.current_mold_version === '1.0-1', 'current RPM version');
    assert(info.target_ablestack_version === info.current_ablestack_version, 'OS unchanged');
    assert(info.mold_packages.length === 5, 'five packages');
    assert(!f.calls.some((args) => args[0] === 'cat' && args[1].includes('/ks/')), 'must not read KS');
    assert(f.executions === 0, 'must not execute ISO script during info');
  });
  test('Full update keeps KS version validation without RPM queries', async () => {
    const f = fixture({ ks: 'ABLESTACK_VERSION="ABLESTACK Next"\n' });
    const info = await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'all');
    assert(info.target_ablestack_version === 'ABLESTACK Next', 'KS target version');
    assert(!f.calls.some((args) => ['rpm', 'aspkg'].includes(args[0])), 'no RPM requirement for all');
  });
  test('Mold label and versions use common VERSION-RELEASE without epoch or architecture', async () => {
    const current = '4.23.0.0-Mold.Europa.202609111701.1';
    const target = '4.23.0.0-Mold.Europa.202609141701.1';
    const f = fixture({ type: 'mold', installedVersion: current });
    f.records.find((pkg) => pkg.name === 'cloudstack-common').version = target;
    f.api.clearSystemUpdateLoadedInfo();
    assert(f.$('#system-update-version-label').text() === 'Mold', 'label on type selection');
    const info = await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold');
    f.api.updateSystemUpdateInfo(info);
    assert(f.$('#system-update-version-label').text() === 'Mold', 'label after info loaded');
    assert(f.$('#system-update-current-ablestack-version').text() === current, 'installed common version');
    assert(f.$('#system-update-target-ablestack-version').text() === target, 'ISO common version');
    const query = f.calls.find((args) => args.includes('-q'));
    assert(query[query.length - 1] === 'cloudstack-common', 'query common package');
    assert(query[query.indexOf('--qf') + 1] === '%{VERSION}-%{RELEASE}\n', 'query VERSION-RELEASE only');
    assert(!f.calls.some((args) => args.some((arg) => arg.includes('EPOCHNUM'))), 'no epoch in version query');
  });
  test('Full update still rejects absent or empty KS versions', async () => {
    await rejects(() => fixture().api.loadSystemUpdateInfoFallback('/mnt/iso', 'all'), /ks/);
    await rejects(() => fixture({ ks: '' }).api.loadSystemUpdateInfoFallback('/mnt/iso', 'all'), /ABLESTACK_VERSION/);
  });
  test('Mold rejects missing package headers despite expected filenames', async () => {
    const f = fixture();
    f.records[4].name = 'unrelated-package';
    await rejects(() => f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /cloudstack-ui/);
  });
  test('Mold rejects duplicate package headers', async () => {
    const f = fixture();
    f.records.push({ ...f.records[0], path: '/mnt/iso/rpms/misleading-name.rpm' });
    await rejects(() => f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /중복/);
  });
  test('Mold rejects empty payload', async () => {
    const f = fixture();
    f.records.length = 0;
    await rejects(() => f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /RPM 파일/);
  });
  test('Mold rejects corrupt and malformed RPMs', async () => {
    await rejects(() => fixture({ brokenRpm: true }).api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /not an RPM/);
    await rejects(() => fixture({ malformed: true }).api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /정보 형식/);
  });
  test('Mold rejects missing update script', async () => {
    await rejects(() => fixture({ missingScript: true }).api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /update-mold/);
  });
  test('Mold reports unavailable RPM commands', async () => {
    await rejects(() => fixture({ noRpm: true }).api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold'), /rpm\/aspkg/);
  });
  test('Mold uses existing aspkg', async () => {
    const f = fixture({ aspkg: true });
    await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold');
    assert(!f.calls.some((args) => args[0] === 'rpm'), 'aspkg should be used');
  });
  test('Missing installed version does not reject valid ISO', async () => {
    const info = await fixture({ uninstalled: true }).api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold');
    assert(info.current_mold_version === 'N/A', 'unknown installed version');
  });
  test('Mold run revalidates media before copying or executing', async () => {
    const f = fixture();
    await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold');
    f.records.pop();
    await rejects(() => f.api.runSystemUpdateFallback('/mnt/iso', 'mold'), /cloudstack-ui/);
    assert(f.executions === 0, 'invalid ISO must not reach copy/execute');
  });
  test('Mold run uses the selected updater after validation', async () => {
    const f = fixture();
    const result = await f.api.runSystemUpdateFallback('/mnt/iso', 'mold');
    assert(result.code === 200 && result.val.update_type === 'mold', 'successful result');
    const command = f.calls.find((args) => args[3] === 'ablestack-update');
    assert(command[6] === 'update-mold.sh' && command[7] === 'mold', 'Mold script and type');
    assert(f.executions === 1, 'one execution');
  });
  test('Version and confirmation text follow the selected update type', async () => {
    const f = fixture({ ks: 'ABLESTACK_VERSION="ABLESTACK Next"\n' });
    const mold = await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'mold');
    f.api.updateSystemUpdateInfo(mold);
    f.api.resetSystemUpdateConfirmModal();
    assert(f.$('#system-update-target-ablestack-version').text() === '2.0-1', 'show Mold version');
    assert(!f.$('#system-update-warning-restart').text().includes('재부팅'), 'no reboot requirement for Mold');
    const all = await f.api.loadSystemUpdateInfoFallback('/mnt/iso', 'all');
    f.api.updateSystemUpdateInfo(all);
    f.api.resetSystemUpdateConfirmModal();
    assert(f.$('#system-update-target-ablestack-version').text() === 'ABLESTACK Next', 'show OS version');
    assert(f.$('#system-update-version-label').text() === 'ABLESTACK', 'reset version label');
    assert(f.$('#system-update-warning-restart').text().includes('재부팅'), 'retain full update reboot notice');
  });
  for (const item of tests) {
    try { await item.run(); } catch (error) { throw new Error(item.name + ': ' + error.message); }
  }
  return tests.length;
}

if (typeof module !== 'undefined' && require.main === module) {
  const fs = require('fs');
  const path = require('path');
  const source = fs.readFileSync(path.join(__dirname, '../src/features/main.js'), 'utf8');
  const section = source.slice(source.indexOf('/** ABLESTACK Version 업데이트 제어 관련 action start */'),
    source.indexOf('/** ABLESTACK Version 업데이트 제어 관련 action end */'));
  testSystemUpdateFallback(section).then((count) => console.log(count + ' tests passed'))
    .catch((error) => { console.error(error); process.exitCode = 1; });
}
