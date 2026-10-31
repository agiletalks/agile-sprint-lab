import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const slides = JSON.parse(readFileSync(new URL('../src/slides.json', import.meta.url), 'utf8'));
const bundle = readFileSync(new URL('../Agile-Sprint-Lab-Projection.html', import.meta.url), 'utf8');

test('26 stable pages, 13 steps, 7200 seconds total planned duration', () => {
  assert.deepEqual(slides.map(s => s.id), Array.from({length: 26}, (_, i) => `P${String(i).padStart(2, '0')}`));
  assert.equal(slides.reduce((n, s) => n + s.durationSec, 0), 7200);
  assert.equal(new Set(slides.slice(1).map(s => s.stepId)).size, 13);
});

test('standalone bundle has no facilitator console, embeds assets offline, and uses updated role title', () => {
  assert.ok(!bundle.includes('id="console"'), 'Facilitator console dialog must be removed');
  assert.ok(!bundle.includes('id="console-entry"'), 'Facilitator console trigger must be removed');
  assert.ok(bundle.includes('id="timer"'), 'Global floating timer must be present');
  assert.ok(bundle.includes('id="page-number"'), 'Slide page number must be present');
  assert.ok(bundle.includes('Enterprise Agile Coach & Facilitator'), 'English role title must be updated');
  assert.ok(bundle.includes('企业敏捷教练与引导师'), 'Simplified Chinese role title must be updated');
  assert.ok(bundle.includes('data:image/png;base64,'), 'Embedded PNG data URIs must be present');
  assert.ok(bundle.includes('data:image/jpeg;base64,'), 'Embedded JPEG logo data URI must be present');
});
