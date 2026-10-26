const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({ window: {} });
for (const filename of ['courses.js', 'library.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../dist', filename), 'utf8'), context);
}
const library = context.window.MATHBRAIN_LIBRARY;

test('El catálogo contiene explicaciones completas, simulaciones y ejercicios con identificadores únicos', () => {
  assert.equal(library.resources.length, 40);
  assert.equal(new Set(library.resources.map(resource => resource.id)).size, 40);
  assert.equal(library.search({ type: 'explanation' }).length, 30);
  assert.equal(library.search({ type: 'simulation' }).length, 4);
  assert.equal(library.search({ type: 'exercise' }).length, 6);
  for (const resource of library.resources) {
    assert.ok(library.topics.some(topic => topic.id === resource.topic));
    assert.ok(resource.title && resource.description && resource.key);
    if (resource.type === 'explanation') {
      assert.ok(resource.paragraphs.length >= 1);
      assert.ok(resource.paragraphs.every(paragraph => paragraph.length > 80));
      assert.ok(resource.example.length > 40);
    }
    if (resource.type === 'exercise') {
      assert.ok(resource.steps.length >= 3);
      assert.ok(resource.answer);
      assert.ok(resource.steps.every(step => step.title && step.text && step.equation));
    }
  }
});

test('La búsqueda ignora tildes, mayúsculas, signos y palabras de enlace', () => {
  const ids = query => Array.from(library.search({ query }), resource => resource.id);
  assert.deepEqual(ids('¿QUÉ ES UNA DERIVADA?'), ids('derivada'));
  assert.deepEqual(ids('álgebra'), ids('algebra'));
  assert.deepEqual(ids('ángulos'), ids('angulos'));
});

test('Encuentra conceptos por títulos y sinónimos en singular o plural', () => {
  assert.ok(library.search({ query: 'derivadas' }).some(resource => resource.id === 'sim-derivada'));
  assert.ok(library.search({ query: 'ecuaciones' }).some(resource => resource.id === 'ej-ecuacion'));
  assert.ok(library.search({ query: 'seno coseno' }).some(resource => resource.id === 'sim-circulo'));
  assert.ok(library.search({ query: 'intervalo confianza' }).some(resource => resource.id === 'inferencia-estadistica-3'));
  assert.equal(library.search({ query: 'tema-inexistente-xyz' }).length, 0);
});

test('Tema, formato y nivel se combinan y no devuelven materiales de otros filtros', () => {
  const results = library.search({ type: 'simulation', topic: 'calculo', level: 'Intermedio', query: 'integrales' });
  assert.deepEqual(Array.from(results, resource => resource.id), ['sim-riemann']);
  assert.equal(library.search({ type: 'simulation', topic: 'calculo', level: 'Inicial' }).length, 0);
  const probability = library.search({ topic: 'probabilidad' });
  assert.equal(probability.length, 7);
  assert.ok(probability.every(resource => resource.courseId === 'probabilidad'));
});

test('Mi biblioteca limita resultados a los guardados y respeta los demás filtros', () => {
  const ids = new Set(['ej-ecuacion', 'sim-derivada']);
  assert.equal(library.search({ ids }).length, 2);
  assert.deepEqual(Array.from(library.search({ ids, type: 'exercise' }), resource => resource.id), ['ej-ecuacion']);
  assert.equal(library.search({ ids: new Set() }).length, 0);
});

test('Las sumas de Riemann usan alturas izquierdas, derechas y medias correctas', () => {
  assert.equal(library.riemannSum(2, 'left'), .125);
  assert.equal(library.riemannSum(2, 'right'), .625);
  assert.equal(library.riemannSum(2, 'midpoint'), .3125);
  for (const method of ['left', 'right', 'midpoint']) {
    const initialError = Math.abs(library.riemannSum(2, method) - 1 / 3);
    assert.ok(Math.abs(library.riemannSum(50, method) - 1 / 3) < initialError);
  }
});

test('El círculo unitario conserva los signos, los ángulos notables y la identidad', () => {
  assert.equal(library.unitCircle(0).cosine, 1);
  assert.equal(library.unitCircle(90).cosine, 0);
  assert.equal(library.unitCircle(90).sine, 1);
  assert.equal(library.unitCircle(180).cosine, -1);
  assert.equal(library.unitCircle(270).sine, -1);
  assert.equal(library.unitCircle(360).sine, 0);
  for (const degrees of [17, 54, 125, 215, 310]) {
    const point = library.unitCircle(degrees);
    assert.ok(Math.abs(point.sine ** 2 + point.cosine ** 2 - 1) < 1e-12);
    assert.ok(Math.abs(point.radians - degrees * Math.PI / 180) < 1e-12);
  }
});

test('Los lanzamientos de moneda respetan la probabilidad y usan cada ensayo independiente', () => {
  assert.deepEqual(Array.from(library.coinExperiment(0, 4, () => 0)), [0, 0, 0, 0]);
  assert.deepEqual(Array.from(library.coinExperiment(1, 4, () => .999)), [1, 1, 1, 1]);
  const draws = [.1, .7, .4, .5];
  let index = 0;
  assert.deepEqual(Array.from(library.coinExperiment(.5, 4, () => draws[index++])), [1, 0, 1, 0]);
  assert.equal(index, 4);
});
