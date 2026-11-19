// Legacy GFS settings behavior with fake DOM and commands; no host is contacted.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

async function main() {
  const source = fs.readFileSync(path.join(__dirname, '../src/features/gfs-storage-configure-wizard.js'), 'utf8');
  const settings = source.slice(source.indexOf('var gfsStripeSettingsReady'), source.indexOf('// Document.ready 시작'));
  const validation = source.match(/^function validateGfsStorage\(\) \{[\s\S]*?^\}/m)[0];
  const elements = new Map(), calls = [], alerts = [];
  let stored = 512, fail = false;
  const $ = (selector) => {
    if (typeof selector === 'object' && selector !== document) return selector;
    if (!elements.has(selector)) elements.set(selector, {
      value: '128', properties: {}, visible: false,
      prop(key, value) { this.properties[key] = value; return this; },
      text(value) { if (value === undefined) return this.value; this.value = value; return this; },
      val(value) { if (value === undefined) return this.value; this.value = value; return this; },
      hide() { this.visible = false; return this; }, show() { this.visible = true; return this; },
      on() { return this; },
    });
    return elements.get(selector);
  };
  const document = {};
  const command = { async spawn(args) {
    calls.push(args);
    if (fail) return JSON.stringify({code: 500, val: 'simulated write failure'});
    if (args.includes('--set-gfs-settings')) stored = Number(args[args.indexOf('--stripe-size-kib') + 1]);
    return JSON.stringify({code: 200, val: {stripe_size_kib: stored}});
  } };
  const context = vm.createContext({$, document, cockpit: command, ablestack: command,
    pluginpath: '/fixture', alert: (value) => alerts.push(value)});
  vm.runInContext(settings + '\n' + validation, context);
  const select = $('#gfs-stripe-size-kib');
  await context.loadGfsStripeSettings();
  assert.equal(select.value, '512');
  assert.equal(context.gfsStripeSettingsReady, true);
  for (const value of [64, 128, 256, 512]) {
    const pending = context.loadGfsStripeSettings(value);
    assert.equal(context.gfsStripeSettingsReady, false);
    assert.equal(select.properties.disabled, true);
    await pending;
    assert.equal(stored, value);
    assert.equal(select.value, String(value));
    assert.equal(context.gfsStripeSavedSize, value);
    assert.equal(select.properties.disabled, false);
  }
  fail = true;
  await context.loadGfsStripeSettings(256);
  assert.equal(stored, 512);
  assert.equal(select.value, '512');
  assert.equal(context.gfsStripeSettingsReady, false);
  assert.equal($('#gfs-stripe-error').visible, true);
  assert.match($('#gfs-stripe-error-text').value, /simulated write failure/);
  assert.equal(await context.validateGfsStorage(), false);
  assert.equal(alerts.length, 1);
  fail = false;
  await context.loadGfsStripeSettings();
  assert.equal(context.gfsStripeSettingsReady, true);
  assert.equal(calls.filter((args) => args.includes('--set-gfs-settings')).length, 5);
  assert.equal((source.match(/'--stripe-size-kib', String\(gfsStripeSavedSize\)/g) || []).length, 2);
  console.log('GFS legacy settings: load, four saves, failure rollback, retry and deployment guard passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
