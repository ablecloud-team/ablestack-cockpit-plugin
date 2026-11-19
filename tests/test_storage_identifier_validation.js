// Run with: node tests/test_storage_identifier_validation.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('src/common/validation.js', 'utf8');
const context = vm.createContext({});
for (const name of ['checkIqn', 'checkNqn']) {
  const definition = source.match(new RegExp('function ' + name + '\\([^)]*\\)\\s*\\{[\\s\\S]*?\\n\\}'));
  assert.ok(definition, name + ' exists');
  vm.runInContext(definition[0], context);
}

// Regression: the generated October IQN in the reported screenshot was rejected.
assert.equal(context.checkIqn('iqn.2026-10.ablecloud.io:1792997261'), true);

for (const [prefix, validate] of [['iqn', context.checkIqn], ['nqn', context.checkNqn]]) {
  for (let month = 1; month <= 12; month++) {
    const value = `${prefix}.2026-${String(month).padStart(2, '0')}.ablecloud.io:1792997261`;
    assert.equal(validate(value), true, value);
  }
  for (const month of ['00', '13', '99']) {
    const value = `${prefix}.2026-${month}.ablecloud.io:1792997261`;
    assert.equal(validate(value), false, value);
  }
}
console.log('IQN/NQN validation: October regression, all 12 months, and invalid months passed');
