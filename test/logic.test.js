const test = require('node:test');
const assert = require('node:assert');
const { decide } = require('../decision/logic');

test('cools when occupied and too warm', () => {
  assert.strictEqual(decide({ temp: 27, occupied: true }).action, 'cool');
});
test('turns off when zone is empty', () => {
  assert.strictEqual(decide({ temp: 30, occupied: false }).action, 'off');
});
test('holds when inside comfort range', () => {
  assert.strictEqual(decide({ temp: 24.5, occupied: true }).action, 'hold');
});
test('turns off when already cool enough', () => {
  assert.strictEqual(decide({ temp: 21, occupied: true }).action, 'off');
});
test('manual override beats automatic logic', () => {
  const r = decide({ temp: 20, occupied: false, override: 'cool' });
  assert.strictEqual(r.action, 'cool');
  assert.strictEqual(r.triggered_by, 'manual');
});
test('custom target temperature is respected', () => {
  assert.strictEqual(decide({ temp: 25, occupied: true, target: 21 }).action, 'cool');
});
