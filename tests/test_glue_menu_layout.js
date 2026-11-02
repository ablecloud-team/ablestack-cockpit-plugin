// Run with: node tests/test_glue_menu_layout.js
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('src/features/glue/main-glue.js', 'utf8');
const context = {};
vm.createContext(context);
vm.runInContext(source.slice(source.indexOf('function glueMenuPosition('),
  source.indexOf('function closeAblestackMenus(')), context);
const position = context.glueMenuPosition;

// A table action near the bottom opens upward and aligns to the right.
let result = position({ left: 900, right: 940, top: 450, bottom: 480 }, 240, 100, 960, 500, true);
assert.equal(result.left, 700);
assert.equal(result.top, 346);
assert.equal(result.maxHeight, 100);

// A host selector can extend past the dialog while staying in the viewport.
result = position({ left: 400, right: 600, top: 220, bottom: 252 }, 200, 180, 960, 600, false);
assert.equal(result.top, 256);
assert.equal(result.maxHeight, 180);

// On a short screen the longer side is used and the menu becomes scrollable.
result = position({ left: 400, right: 600, top: 170, bottom: 202 }, 200, 300, 960, 320, false);
assert.equal(result.top, 8);
assert.equal(result.maxHeight, 158);

// Wide menus fit narrow viewports, including anchors at either edge.
for (const left of [0, 280]) {
  result = position({ left, right: left + 32, top: 20, bottom: 52 }, 400, 100, 320, 480, true);
  assert.equal(result.left, 8);
  assert.equal(result.width, 304);
  assert.ok(result.top + result.maxHeight <= 472);
}

// Reproduce a selector whose old percent min-width measures as 1020px.
// Opening it must follow each popup's toggle instead of imposing one width.
vm.runInContext(source.slice(source.indexOf('function openAblestackMenu('),
  source.indexOf('// Close when the anchor moves;')), context);
context.document = { documentElement: { clientWidth: 1702, clientHeight: 740 } };
const html = fs.readFileSync('main-glue.html', 'utf8');
const selectorIds = [...html.matchAll(/class="pf-v6-c-menu ablestack-menu"[^>]*id="([^"]+)"/g)]
  .map((match) => match[1]);
assert.equal(selectorIds.length, 16, 'Exercise every Glue checkbox selector');
for (const [index, id] of selectorIds.entries()) {
  const toggleWidth = [160, 195, 240, 311][index % 4];
  const properties = new Map();
  const attributes = new Map([['style', 'min-width: 60%; display: none;']]);
  const storedData = new Map();
  const classes = new Set();
  let displayed = false;
  let revealed = false;
  const menu = {
    0: {
      style: { setProperty: (name, value) => properties.set(name, value) },
      getBoundingClientRect() {
        assert.ok(displayed, id + ': measurable only after display');
        assert.ok(classes.has('glue-menu-measuring'), id + ': hidden during measurement');
        return { width: 1020, height: 116 };
      }
    },
    length: 1,
    data(name, value) { storedData.set(name, value); return this; },
    attr(name) { return attributes.get(name); },
    removeAttr(name) { attributes.delete(name); return this; },
    show() {
      assert.ok(classes.has('glue-menu-measuring'), id + ': no visible intermediate frame');
      assert.ok(classes.has('glue-floating-menu'), id + ': transitions disabled before display');
      assert.equal(properties.get('--glue-menu-width'), toggleWidth + 'px', id + ': sized before display');
      displayed = true;
      return this;
    },
    addClass(names) { names.split(' ').forEach((name) => classes.add(name)); return this; },
    removeClass(name) {
      if (name === 'glue-menu-measuring') {
        for (const property of ['width', 'left', 'top', 'max-height']) {
          assert.ok(properties.has('--glue-menu-' + property), id + ': final ' + property + ' before reveal');
        }
        revealed = true;
      }
      classes.delete(name);
      return this;
    },
    hasClass() { return false; }
  };
  const anchor = { left: 771, right: 771 + toggleWidth, top: 501, bottom: 533, width: toggleWidth };
  const toggle = {
    0: { getBoundingClientRect: () => anchor },
    length: 1,
    attr() { return this; },
    closest() { return { length: 1, addClass() {} }; }
  };
  context.openAblestackMenu(toggle, menu);
  assert.ok(revealed, id + ': reveal after layout completes');
  assert.equal(properties.get('--glue-menu-width'), toggleWidth + 'px', id + ': width matches toggle');
  assert.equal(properties.get('--glue-menu-left'), '771px', id + ': aligned with toggle');
  assert.equal(properties.get('--glue-menu-top'), '537px', id + ': below toggle');
  assert.equal(storedData.get('glue-original-style'), 'min-width: 60%; display: none;');
}
console.log('Glue menu layout: 5 viewport scenarios and all 16 selectors passed');
