const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(__dirname, '../src/exercises.js'), 'utf8'), context);
const system = context.ZUKA_EXERCISES;
const check = (spec, value) => system.checkAnswer(spec, value);
const json = value => JSON.parse(JSON.stringify(value));

test('Hay doce tipos de ejercicio, cada uno con validación propia', () => {
  assert.deepEqual(json(system.KINDS), ['choice', 'numeric', 'symbolic', 'equation', 'order', 'classify', 'graph', 'parameters', 'proof', 'simulation', 'error', 'context']);
  for (const kind of system.KINDS) assert.equal(typeof system.TYPES[kind].check, 'function', kind);
  assert.match(system.validate({ kind: 'magia', statement: 'x' })[0], /desconocido/);
  assert.match(system.validate({ kind: 'numeric', answer: '3' })[0], /Falta el enunciado/);
});

test('Los números aceptan fracciones, comas, porcentajes y «x = …»', () => {
  assert.equal(system.parseNumber('3/4'), 0.75);
  assert.equal(system.parseNumber('0,75'), 0.75);
  assert.equal(system.parseNumber('75 %'), 0.75);
  assert.equal(system.parseNumber('x = -2'), -2);
  assert.equal(system.parseNumber('tres'), null);
  assert.equal(system.parseNumber('1/0'), null);
});

test('El analizador de expresiones entiende la notación habitual y explica sus errores', () => {
  const value = (text, x = 2) => system.parseExpression(text).evaluate({ x });
  assert.equal(value('3x^2 - 2x + 1'), 9);
  assert.equal(value('2(x+1)^2'), 18);
  assert.equal(value('-x^2'), -4);
  assert.equal(value('x²·3'), 12);
  assert.equal(value('y = 1/2x'), 1);
  assert.ok(Math.abs(value('sen(x)^2 + cos(x)^2') - 1) < 1e-12);
  assert.ok(Math.abs(value('√(x) * √(x)') - 2) < 1e-12);
  assert.ok(Math.abs(value('2π') - 2 * Math.PI) < 1e-12);
  assert.throws(() => system.parseExpression('(x+1'), /Falta cerrar un paréntesis/);
  assert.throws(() => system.parseExpression('x$2'), /No reconozco el símbolo «\$»/);
  assert.throws(() => system.parseExpression(''), /Escribe una expresión/);
});

test('1 · Opción múltiple: explica por qué la opción elegida no es la respuesta', () => {
  const spec = { kind: 'choice', statement: '¿2 + 2?', options: [{ html: 'Tres', why: 'Te falta una unidad.' }, { html: 'Cuatro', correct: true }, { html: '<span>Veintidós</span>' }] };
  assert.equal(check(spec, [1]).correct, true);
  assert.equal(check(spec, [0]).message, 'Te falta una unidad.');
  assert.match(check(spec, [2]).message, /«Veintidós» no es la respuesta/);
  const multiple = { ...spec, multiple: true, options: [{ html: 'A', correct: true }, { html: 'B', correct: true }, { html: 'C' }] };
  assert.match(check(multiple, [0]).message, /falta 1 opción correcta/);
  assert.equal(check(multiple, [0, 1]).correct, true);
});

test('2 · Respuesta numérica: tolerancia y diagnóstico de errores frecuentes', () => {
  const spec = { kind: 'numeric', statement: 'x', answer: '8/3', tolerance: 0.01, mistakes: [{ answer: '8', why: 'Olvidaste dividir entre 3.' }] };
  assert.equal(check(spec, 2.667).correct, true);
  assert.equal(check(spec, 8).message, 'Olvidaste dividir entre 3.');
  assert.match(check(spec, -8 / 3).message, /signo contrario/);
  assert.match(check(spec, 3 / 8).message, /inverso/);
  assert.match(check(spec, 26.67).message, /cifra decimal/);
  assert.match(check(spec, 2.7).message, /muy cerca/);
  assert.match(check(spec, 16 / 3).message, /doble/);
  assert.match(check({ kind: 'numeric', answer: '0,25' }, 25).message, /porcentaje y decimal/);
  assert.equal(check({ kind: 'numeric', answer: '40%' }, 0.4).correct, true);
  assert.equal(check({ kind: 'numeric', answer: '40%' }, 40).correct, true);
  assert.match(check({ kind: 'numeric', answer: '10' }, 50).message, /mayor que el correcto/);
});

test('3 · Respuesta simbólica: acepta expresiones equivalentes y explica la diferencia', () => {
  const spec = { kind: 'symbolic', statement: 'Deriva x^3 + 3x', answer: '3x^2 + 3', mistakes: [{ answer: 'x^4/4 + 3x^2/2', why: 'Eso es una primitiva, no la derivada.' }] };
  const read = text => ({ text, parsed: system.parseExpression(text) });
  assert.equal(check(spec, read('3(x^2 + 1)')).correct, true);
  assert.equal(check(spec, read('x^4/4 + 3x^2/2')).message, 'Eso es una primitiva, no la derivada.');
  assert.match(check(spec, read('-3x^2 - 3')).message, /signo contrario/);
  assert.match(check(spec, read('3x^2 + 5')).message, /constante \(2\)/);
  assert.match(check(spec, read('6x^2 + 6')).message, /2 veces la correcta/);
  assert.match(check(spec, read('3x + 3')).message, /con x = 2 tu expresión vale 9 y debería valer 15/);
  assert.equal(check({ ...spec, answer: 'x^3', validation: 'constant' }, read('x^3 + 7')).correct, true, 'Las primitivas admiten + C');
});

test('4 · Completar ecuaciones: revisa cada espacio y dice cuál falla', () => {
  const spec = { kind: 'equation', statement: 'Completa', template: '(x + 3)^2 = x^2 + {{0}}x + {{1}}', blanks: [{ answer: '6', why: 'El término central es 2·3·x.' }, { answer: '9' }] };
  assert.equal(check(spec, [6, 9]).correct, true);
  const wrong = check(spec, [3, 9]);
  assert.equal(wrong.message, 'El espacio 1 no es correcto. El término central es 2·3·x.');
  assert.deepEqual(json(wrong.marks), [0]);
  assert.match(check(spec, [6, 6]).message, /^El espacio 2 no es correcto\./);
  assert.deepEqual(json(system.validate({ ...spec, template: 'x = {{0}}' })), ['La plantilla no tiene el espacio {{1}}.']);
});

test('5 · Ordenar pasos: indica qué paso va en la primera posición equivocada', () => {
  const spec = { kind: 'order', statement: 'Ordena', steps: [{ html: 'Resta 3' }, { html: 'Divide entre 2', why: 'Solo se divide cuando x queda con su coeficiente.' }, { html: 'Comprueba' }] };
  assert.equal(check(spec, [0, 1, 2]).correct, true);
  assert.equal(check(spec, [0, 2, 1]).message, 'Solo se divide cuando x queda con su coeficiente.');
  assert.match(check(spec, [1, 0, 2]).message, /En la posición 1 va «Resta 3», no «Divide entre 2»/);
  const order = system.shuffled(3, 'clave');
  assert.notDeepEqual(json(order), [0, 1, 2], 'El orden inicial nunca es el correcto');
  assert.deepEqual(json(system.shuffled(3, 'clave')), json(order), 'El barajado es estable');
});

test('6 · Arrastrar y soltar: señala el elemento mal clasificado', () => {
  const spec = { kind: 'classify', statement: 'Clasifica', categories: [{ id: 'q', label: 'Racionales' }, { id: 'i', label: 'Irracionales' }], items: [{ html: '1/2', category: 'q' }, { html: '√2', category: 'i', why: '√2 no se puede escribir como fracción.' }, { html: 'π', category: 'i' }] };
  assert.equal(check(spec, ['q', 'i', 'i']).correct, true);
  assert.equal(check(spec, ['q', 'q', 'i']).message, '√2 no se puede escribir como fracción.');
  assert.match(check(spec, ['q', 'i', 'q']).message, /«π» no va en «Racionales»/);
  assert.match(check(spec, ['i', 'q', 'i']).message, /Hay 2 elementos/);
  assert.match(system.validate({ ...spec, items: [{ html: 'x', category: 'z' }] })[0], /categoría que no existe/);
});

test('7 · Construir gráficas: dice qué punto no está en la gráfica y cuánto vale la función', () => {
  const spec = { kind: 'graph', statement: 'Grafica y = 2x - 1', function: '2x - 1', points: 2 };
  assert.equal(check(spec, [[0, -1], [2, 3]]).correct, true);
  assert.equal(check(spec, [[0, -1], [2, 2]]).message, 'El punto (2, 2) no está en la gráfica: con x = 2, la función vale 3.');
  assert.match(check({ ...spec, function: '1/x' }, [[0, 1], [1, 1]]).message, /no está definida en x = 0/);
});

test('8 · Manipular parámetros: compara la curva con los puntos pedidos y orienta el ajuste', () => {
  const spec = { kind: 'parameters', statement: 'Ajusta', expression: 'a*x + b', params: [{ name: 'a', min: -3, max: 3, target: 2, high: 'La recta está demasiado inclinada.' }, { name: 'b', min: -3, max: 3, target: 1 }], points: [[0, 1], [1, 3]] };
  assert.equal(check(spec, { a: 2, b: 1 }).correct, true);
  const steep = check(spec, { a: 3, b: 1 });
  assert.equal(steep.message, 'Con estos valores, la curva pasa por (1, 4), no por (1, 3). La recta está demasiado inclinada.');
  assert.match(check({ ...spec, points: undefined }, { a: 2, b: 0 }).message, /b es demasiado pequeño/);
});

test('9 · Demostraciones: explica qué justificación no corresponde', () => {
  const spec = { kind: 'proof', statement: 'Demuestra', reasons: [{ id: 'dist', label: 'Propiedad distributiva' }, { id: 'conm', label: 'Conmutatividad' }], steps: [{ html: 'a(b + c) = ab + ac', reason: 'dist' }, { html: 'ab + ac = ac + ab', reason: 'conm', why: 'Solo se cambió el orden de los sumandos.' }] };
  assert.equal(check(spec, ['dist', 'conm']).correct, true);
  assert.equal(check(spec, ['dist', 'dist']).message, 'Solo se cambió el orden de los sumandos.');
  assert.match(check(spec, ['conm', 'conm']).message, /El paso 1 no se justifica con «Conmutatividad»/);
});

test('10 · Simulaciones: calcula la probabilidad exacta y compara con la frecuencia simulada', () => {
  const dice = { kind: 'dice', count: 2, event: { op: '=', value: 7 } };
  assert.ok(Math.abs(system.exactProbability(dice) - 1 / 6) < 1e-12);
  assert.equal(system.exactProbability({ kind: 'coins', count: 3, event: { op: '>=', value: 2 } }), 0.5);
  let seed = 1;
  const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const hits = system.simulate(dice, 6000, random);
  assert.ok(Math.abs(hits / 6000 - 1 / 6) < 0.03, 'La frecuencia se acerca a la probabilidad');
  const spec = { kind: 'simulation', statement: 'Estima', model: dice, mistakes: [{ answer: '1/11', why: 'Las 11 sumas posibles no son igual de probables.' }] };
  assert.equal(check(spec, { value: 1 / 6, frequency: null }).correct, true);
  assert.equal(check(spec, { value: 1 / 11, frequency: 0.17 }).message, 'Las 11 sumas posibles no son igual de probables.');
  assert.match(check(spec, { value: 0.5, frequency: 0.168 }).message, /frecuencia cercana a 0,168; tu respuesta está lejos/);
  assert.match(check(spec, { value: 0.5, frequency: null }).message, /Simula el experimento/);
});

test('11 · Identificar errores: orienta hacia antes o después de la línea elegida', () => {
  const spec = { kind: 'error', statement: 'Encuentra el error', lines: ['2(x + 3) = 10', '2x + 3 = 10', 'x = 3,5'], wrong: 1, lineWhy: [undefined, undefined, 'Esta línea despeja bien, pero arrastra el error anterior.'] };
  assert.equal(check(spec, 1).correct, true);
  assert.match(check(spec, 0).message, /La línea 1 está bien\. El error aparece más adelante/);
  assert.equal(check(spec, 2).message, 'Esta línea despeja bien, pero arrastra el error anterior.');
});

test('12 · Problemas en contexto: delegan en la pregunta y validan su especificación', () => {
  const spec = { kind: 'context', context: '<p>Un taxi cobra 4.000 de arranque y 1.200 por km.</p>', ask: { kind: 'numeric', statement: '¿Cuántos km recorre con 16.000?', answer: '10' } };
  assert.equal(check(spec, 10).correct, true);
  assert.match(check(spec, 13.33).message, /mayor que el correcto/);
  assert.deepEqual(json(system.validate(spec)), []);
  assert.match(system.validate({ kind: 'context', context: 'x', ask: { kind: 'context' } })[0], /pregunta \(ask\) de otro tipo/);
});

test('El ejercicio se dibuja con enunciado, pistas progresivas ocultas y solución', () => {
  const html = system.render({ kind: 'numeric', statement: '<p>¿Cuánto es 2 + 2?</p>', answer: '4', hints: ['Suma.', 'Cuenta.'], solution: '<p>4</p>', visual: { html: '<svg></svg>', caption: 'Figura' } }, { key: 'leccion-1-ejercicio-1', lessonId: 'leccion-1' });
  assert.match(html, /^<form class="lesson-exercise exercise exercise-numeric" data-exercise="leccion-1-ejercicio-1" data-kind="numeric" data-lesson="leccion-1" novalidate>/);
  assert.match(html, /<figure class="exercise-visual"><svg><\/svg><figcaption>Figura<\/figcaption><\/figure>/);
  assert.equal((html.match(/<li hidden>/g) || []).length, 2);
  assert.match(html, /data-exercise-hint>Pedir una pista</);
  assert.match(html, /<details class="lesson-solution"><summary>Ver solución<\/summary><p>4<\/p><\/details>/);
  assert.match(html, /data-exercise-feedback role="status" aria-live="polite" hidden/);
});
