const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function mascot() {
  const window = {};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/mascot.js'), 'utf8'), { window });
  return window.MATHBRAIN_MASCOT;
}

test('La nueva mascota conserva los estados usados por toda la plataforma', () => {
  const character = mascot();
  assert.equal(character.name, 'Zuka');
  for (const mood of ['saluda', 'feliz', 'piensa', 'animo', 'celebra']) {
    const drawing = character.svg(mood);
    assert.ok(drawing.includes(`data-mood="${mood}"`));
    assert.match(drawing, /role="img" aria-label="Zuka, tu impulso para aprender"/);
  }
  assert.match(character.svg('desconocido'), /data-mood="feliz"/);
  assert.match(character.say('animo', '<strong>Sigue aprendiendo.</strong>'), /<strong>Sigue aprendiendo\.<\/strong>/);
});

test('Varias mascotas no comparten identificadores y sus etiquetas se escapan', () => {
  const character = mascot();
  const first = character.svg('saluda');
  const second = character.svg('feliz', { label: 'Zuka <amigo> "verde" & morado' });
  const firstId = first.match(/id="([^"]+)"/)[1];
  const secondId = second.match(/id="([^"]+)"/)[1];
  assert.notEqual(firstId, secondId);
  assert.ok(first.includes(`fill="url(#${firstId})"`));
  assert.ok(second.includes(`fill="url(#${secondId})"`));
  assert.match(second, /aria-label="Zuka &lt;amigo&gt; &quot;verde&quot; &amp; morado"/);
});
