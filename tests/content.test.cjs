const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { compileLesson, compileAll, render } = require('../scripts/build-content.cjs');

const lesson = body => `---\ntitulo: Prueba\ndescripcion: Una lección de prueba.\nvideo:\netiquetas: prueba\n---\n${body}\n:::idea\nLa idea $x^2$.\n:::\n`;
const compile = body => compileLesson(lesson(body), 'content/prueba/01-prueba.md', 'prueba-1');

test('El contenido publicado coincide con los archivos Markdown de content/', () => {
  const published = fs.readFileSync(path.join(__dirname, '../dist/content.js'), 'utf8').replace(/\r\n/g, '\n');
  assert.equal(published, render(compileAll()), 'Ejecuta «npm run build» para regenerar dist/content.js');
});

test('Cada curso tiene lecciones con identificadores consecutivos e idea clave', () => {
  const lessons = compileAll();
  assert.equal(lessons.length, 51);
  const fundamentals = lessons.filter(lesson => lesson.courseId === 'fundamentos-matematicas');
  assert.equal(fundamentals.length, 31);
  assert.deepEqual(Array.from(fundamentals.slice(0, 6), lesson => lesson.module), ['1.1', '1.2', '1.3', '1.4', '1.5', '2.1']);
  assert.ok(fundamentals.every(lesson => lesson.unit && lesson.exercises >= 3));
  for (const lesson of lessons) {
    assert.match(lesson.id, new RegExp(`^${lesson.courseId}-\\d+$`));
    assert.ok(lesson.title && lesson.description && lesson.key && lesson.html);
  }
});

test('Las fórmulas en línea y en bloque se convierten con KaTeX y conservan MathML accesible', () => {
  const { html } = compile('Si $f(x) = x^2$ entonces\n\n$$\nf\'(x) = \\lim_{h \\to 0} \\frac{f(x+h)-f(x)}{h}\n$$\n\nTambién $$a^2 + b^2$$ en línea.');
  assert.equal((html.match(/class="katex"/g) || []).length, 4);
  assert.match(html, /<div class="math-display"><span class="katex-display">/);
  assert.match(html, /<math xmlns="http:\/\/www\.w3\.org\/1998\/Math\/MathML"/);
  assert.doesNotMatch(html, /\$/);
});

test('El Markdown se escapa y admite subtítulos, listas, negrita, cursiva, código y enlaces seguros', () => {
  const { html } = compile('## Sección\n\n<script>alert(1)</script> **fuerte** y *suave* con `código`.\n\n- uno\n- dos\n\n1. primero\n\n[Ver](https://example.com) y [mal](javascript:alert(1)). Cuesta \\$5.');
  assert.match(html, /<h2>Sección<\/h2>/);
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
  assert.match(html, /<strong>fuerte<\/strong> y <em>suave<\/em> con <code>código<\/code>/);
  assert.match(html, /<ul><li>uno<\/li><li>dos<\/li><\/ul><ol><li>primero<\/li><\/ol>/);
  assert.match(html, /<a href="https:\/\/example\.com" target="_blank" rel="noopener">Ver<\/a>/);
  assert.doesNotMatch(html, /href="javascript/);
  assert.match(html, /Cuesta \$5\./);
});

test('Los ejercicios numéricos y de opción múltiple generan formularios con pista y solución', () => {
  const result = compile(':::ejercicio\n¿Cuánto vale $2 + 2$?\nrespuesta: 4\ntolerancia: 0,01\npista: Suma.\nsolucion: $2 + 2 = 4$.\n:::\n\n:::ejercicio\nElige:\n- [ ] Tres\n- [x] Cuatro\n:::');
  assert.equal(result.exercises, 2);
  assert.match(result.html, /<form class="lesson-exercise" data-kind="number" data-answer="4" data-tolerance="0.01" novalidate>/);
  assert.match(result.html, /<details class="lesson-hint"><summary>Ver una pista<\/summary>/);
  assert.match(result.html, /<form class="lesson-exercise" data-kind="choice" novalidate>/);
  assert.equal((result.html.match(/type="radio"/g) || []).length, 2);
  assert.equal((result.html.match(/data-correct/g) || []).length, 1);
  assert.match(result.html, /id="prueba-1-ejercicio-1"/);
});

test('Los errores de contenido indican el archivo, la línea y el motivo', () => {
  assert.throws(() => compile('Fórmula rota $\\frac{1}{$ aquí.'), /01-prueba\.md:7: LaTeX no válido/);
  assert.throws(() => compile('Precio $5 sin cerrar.'), /signo \$ sin cerrar/);
  assert.throws(() => compile(':::ejercicio\nPregunta\nrespuesta: cuatro\n:::'), /no es un número/);
  assert.throws(() => compile(':::ejercicio\nPregunta\n- [x] A\n- [x] B\n:::'), /exactamente una opción correcta/);
  assert.throws(() => compile(':::resumen\nTexto\n:::'), /Bloque :::resumen desconocido/);
  assert.throws(() => compileLesson('---\ntitulo: X\n---\nTexto', 'a.md', 'a-1'), /Falta el campo «descripcion»/);
  assert.throws(() => compileLesson('---\ntitulo: X\ndescripcion: Y\nvideo: http://inseguro.com/v\n---\n:::idea\nZ\n:::', 'a.md', 'a-1'), /enlace https/);
});

test('Cada lección declara un módulo existente de su curso y estima su tiempo de lectura', () => {
  const context = require('node:vm').createContext({ window: {} });
  require('node:vm').runInContext(fs.readFileSync(path.join(__dirname, '../src/courses.js'), 'utf8'), context);
  const courses = context.window.MATHBRAIN_COURSES;
  for (const lesson of compileAll()) {
    const course = courses.find(candidate => candidate.id === lesson.courseId);
    assert.ok(course.modules.some(module => module.title === lesson.unit), lesson.id);
    assert.ok(lesson.minutes >= 2 && lesson.minutes <= 30, lesson.id);
  }
  for (const course of courses) {
    assert.ok(course.outcomes.length >= 3 && course.skills.length >= 3, course.id);
    assert.ok(course.modules.every(module => module.summary && module.objectives.length >= 2), course.id);
  }
});

test('La idea clave se guarda como texto legible para la búsqueda y la descarga', () => {
  const result = compileLesson('---\ntitulo: X\ndescripcion: Y\n---\n:::idea\nLa derivada es $\\frac{\\Delta y}{\\Delta x}$ cuando $h \\to 0$.\n:::', 'a.md', 'a-1');
  assert.equal(result.key, 'La derivada es (Δ y)/(Δ x) cuando h → 0.');
});
