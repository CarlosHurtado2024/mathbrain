const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const directory = path.resolve(__dirname, '../dist');
const markup = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(directory, 'app.js'), 'utf8');

function environment(hash = '#explorar', prepareLibrary = () => {}) {
  const target = extra => {
    const listeners = new Map();
    return Object.assign({
      addEventListener(name, listener) {
        const entries = listeners.get(name) || [];
        entries.push(listener);
        listeners.set(name, entries);
      },
      emit(name, event = {}) {
        event.preventDefault ||= () => {};
        for (const listener of listeners.get(name) || []) listener(event);
      }
    }, extra);
  };
  const elements = new Map();
  const staticElements = [];
  const dynamicElements = new Map();
  let document;
  function element(tagName, attributes = '') {
    const attributeValues = new Map();
    for (const match of attributes.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) attributeValues.set(match[1], match[2] ?? '');
    const classes = new Set((attributeValues.get('class') || '').split(/\s+/).filter(Boolean));
    const node = target({
      tagName: tagName.toUpperCase(),
      id: attributeValues.get('id') || '',
      dataset: Object.fromEntries([...attributeValues].filter(([name]) => name.startsWith('data-')).map(([name, value]) => [name.slice(5).replace(/-([a-z])/g, (_, character) => character.toUpperCase()), value])),
      hidden: attributeValues.has('hidden'),
      disabled: attributeValues.has('disabled'),
      value: attributeValues.get('value') || 'all',
      textContent: '',
      classList: {
        add(name) { classes.add(name); },
        remove(name) { classes.delete(name); },
        contains(name) { return classes.has(name); },
        toggle(name, force) {
          const active = force ?? !classes.has(name);
          if (active) classes.add(name); else classes.delete(name);
          return active;
        }
      },
      setAttribute(name, value) { attributeValues.set(name, String(value)); },
      removeAttribute(name) { attributeValues.delete(name); },
      getAttribute(name) { return attributeValues.get(name) ?? null; },
      focus() { document.activeElement = node; },
      replaceChildren() { node.innerHTML = ''; },
      querySelector() { return null; },
      querySelectorAll() { return []; },
      closest(selector) {
        const dataMatch = selector.match(/^\[([\w-]+)\]$/);
        return dataMatch && attributeValues.has(dataMatch[1]) ? node : null;
      }
    });
    let content = '';
    Object.defineProperty(node, 'innerHTML', {
      get() { return content; },
      set(value) {
        content = value;
        const children = [];
        for (const match of value.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) {
          if (!/\b(?:id|data-[\w-]+)=/.test(match[2])) continue;
          const child = element(match[1], match[2]);
          children.push(child);
        }
        dynamicElements.set(node, children);
      }
    });
    if (node.id) elements.set(node.id, node);
    return node;
  }
  for (const match of markup.matchAll(/<([a-z][\w-]*)\b([^>]*)>/gi)) staticElements.push(element(match[1], match[2]));
  const courseTotal = element('strong');
  const location = { hash, href: `http://localhost/${hash}` };
  const historyCalls = [];
  const history = Object.fromEntries(['pushState', 'replaceState'].map(method => [method, (_, title, address) => {
    historyCalls.push({ method, address });
    location.hash = address;
    location.href = `http://localhost/${address}`;
  }]));
  const window = target({ location, scrollTo() {}, matchMedia: () => ({ matches: false }) });
  document = target({
    activeElement: { tagName: 'BODY' },
    title: '',
    querySelector(selector) {
      if (selector.startsWith('#')) return elements.get(selector.slice(1)) || null;
      if (selector.startsWith('[')) return this.querySelectorAll(selector)[0] || null;
      if (selector === '.course-browser-total strong') return courseTotal;
      return staticElements.find(node => selector.startsWith('.') && node.classList.contains(selector.slice(1))) || null;
    },
    querySelectorAll(selector) {
      const dataMatch = selector.match(/^\[([\w-]+)(?:="([^"]*)")?\]$/);
      if (!dataMatch) return [];
      return [...staticElements, ...[...dynamicElements.values()].flat()].filter(node => node.getAttribute(dataMatch[1]) !== null && (dataMatch[2] === undefined || node.getAttribute(dataMatch[1]) === dataMatch[2]));
    },
    getElementById(id) { return elements.get(id) || null; }
  });
  const stored = new Map();
  const context = vm.createContext({
    window, document, history, location, URL, URLSearchParams, Intl,
    localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) },
    requestAnimationFrame: callback => callback(),
    setTimeout: () => 1,
    clearTimeout() {}
  });
  for (const filename of ['courses.js', 'content.js', 'library.js']) vm.runInContext(fs.readFileSync(path.join(directory, filename), 'utf8'), context);
  prepareLibrary(window.MATHBRAIN_LIBRARY, window.MATHBRAIN_COURSES);
  vm.runInContext(source, context);
  return {
    document, location, historyCalls, courseTotal,
    courses: window.MATHBRAIN_COURSES,
    library: window.MATHBRAIN_LIBRARY,
    node: selector => document.querySelector(selector),
    all: selector => document.querySelectorAll(selector),
    navigate(address, event = 'hashchange') {
      location.hash = address;
      location.href = `http://localhost/${address}`;
      window.emit(event);
    },
    click(node) {
      node.emit('click', { target: node });
      document.emit('click', { target: node });
    },
    change(node, value) {
      node.value = value;
      node.emit('change', { target: node });
    }
  };
}

function albums(environment) {
  return [...environment.node('#course-grid').innerHTML.matchAll(/<article\b[^>]*class="[^"]*\bcourse-album\b[^"]*"[^>]*>([\s\S]*?)<\/article>/g)].map(match => match[0]);
}

function assertCourses(environment, count) {
  assert.equal(environment.node('#courses-view').hidden, false);
  assert.equal(environment.node('.discovery').hidden, true);
  assert.equal(environment.node('#home-view').hidden, true);
  assert.equal(environment.node('#detail-view').hidden, true);
  assert.equal(albums(environment).length, count);
  assert.match(environment.node('#course-results').textContent, new RegExp(`^${count}\\b`));
  assert.equal(environment.node('#course-empty').hidden, count !== 0);
}

test('Explorar y su alias Cursos muestran primero el catálogo de cursos', () => {
  for (const address of ['#explorar', '#cursos']) {
    const app = environment(address);
    assertCourses(app, app.courses.length);
    assert.equal(Number(app.courseTotal.textContent), app.courses.length);
    assert.equal(app.node('#learning-paths').hidden, true);
    for (const course of app.courses) assert.ok(albums(app).some(album => album.includes(`href="#curso/${course.id}"`)));
  }
});

test('Las tarjetas calculan los formatos reales de cada curso y no inventan extras', () => {
  const app = environment('#explorar', library => {
    const explanation = library.resources.find(resource => resource.courseId === 'fundamentos-matematicas' && resource.type === 'explanation');
    library.resources.push({ ...explanation, id: 'fundamentos-conteo-regresion' });
  });
  for (const course of app.courses) {
    const album = albums(app).find(value => value.includes(`href="#curso/${course.id}"`));
    const text = album.replace(/<[^>]*>/g, ' ');
    const resources = app.library.resources.filter(resource => resource.courseId === course.id);
    for (const [type, label] of [['explanation', 'explicaci(?:ón|ones)'], ['simulation', 'simulaci(?:ón|ones)'], ['exercise', 'ejercicio(?:s)?']]) {
      const count = resources.filter(resource => resource.type === type).length;
      if (count) assert.match(text, new RegExp(`\\b${count}\\s+${label}`, 'i'), course.id);
      else assert.doesNotMatch(text, new RegExp(`\\b\\d+\\s+${label}`, 'i'), course.id);
    }
  }
});

test('Los filtros por tema y nivel se combinan conservando el total general', () => {
  const app = environment('#explorar?curso_tema=calculo&curso_nivel=Intermedio');
  assertCourses(app, 2);
  assert.equal(Number(app.courseTotal.textContent), app.courses.length);
  assert.equal(app.node('#course-level-filter').value, 'Intermedio');
  assert.ok(albums(app).every(album => album.includes('#curso/calculo-')));
  const active = app.all('[data-course-topic]').filter(button => button.getAttribute('aria-pressed') === 'true');
  assert.equal(active.length, 1);
  assert.equal(active[0].dataset.courseTopic, 'calculo');
});

test('Probabilidad se clasifica por su tema real y no como Estadística', () => {
  const app = environment('#explorar?curso_tema=probabilidad');
  assertCourses(app, 1);
  assert.match(albums(app)[0], /href="#curso\/probabilidad"/);
  app.navigate('#explorar?curso_tema=estadistica');
  assertCourses(app, 1);
  assert.match(albums(app)[0], /href="#curso\/inferencia-estadistica"/);
  assert.doesNotMatch(app.node('#course-grid').innerHTML, /href="#curso\/probabilidad"/);
});

test('Una combinación sin cursos muestra el estado vacío y se puede restablecer', () => {
  const app = environment('#explorar?curso_tema=calculo&curso_nivel=Inicial');
  assertCourses(app, 0);
  app.change(app.node('#course-level-filter'), 'all');
  assertCourses(app, 2);
  assert.equal(app.location.hash, '#explorar?curso_tema=calculo');
});

test('Restablecer cursos limpia ambos filtros y devuelve el foco a Todos', () => {
  const app = environment('#explorar?curso_tema=calculo&curso_nivel=Inicial');
  app.click(app.node('[data-reset-courses]'));
  assert.equal(app.location.hash, '#explorar');
  assertCourses(app, app.courses.length);
  assert.equal(app.node('#course-level-filter').value, 'all');
  assert.equal(app.document.activeElement.dataset.courseTopic, 'all');
  assert.equal(app.document.activeElement.getAttribute('aria-pressed'), 'true');
});

test('Los controles de cursos actualizan la URL y el historial sin perder filtros', () => {
  const app = environment();
  const topic = app.all('[data-course-topic]').find(button => button.dataset.courseTopic === 'fundamentos');
  app.click(topic);
  assert.equal(app.location.hash, '#explorar?curso_tema=fundamentos');
  assertCourses(app, 1);
  app.change(app.node('#course-level-filter'), 'Inicial');
  assert.equal(app.location.hash, '#explorar?curso_tema=fundamentos&curso_nivel=Inicial');
  assertCourses(app, 1);
  assert.ok(app.historyCalls.every(call => call.method === 'pushState'));
  app.navigate('#explorar?curso_tema=calculo', 'popstate');
  assertCourses(app, 2);
  assert.equal(app.node('#course-level-filter').value, 'all');
});

test('Los filtros de cursos desconocidos no rompen la navegación', () => {
  const app = environment('#explorar?curso_tema=inexistente&curso_nivel=Avanzado');
  assertCourses(app, app.courses.length);
  assert.equal(app.node('#course-level-filter').value, 'all');
});

test('Las búsquedas y enlaces de contenidos no se convierten en cursos', () => {
  for (const address of ['#explorar?q=derivadas', '#explorar?tipo=explanation', '#explorar?tema=fundamentos', '#explorar?nivel=Inicial', '#explorar?vista=contenidos', '#simulaciones', '#ejercicios', '#biblioteca']) {
    const app = environment(address);
    assert.equal(app.node('#courses-view').hidden, true, address);
    assert.equal(app.node('.discovery').hidden, false, address);
    assert.match(app.node('#catalog-content').innerHTML, /class="resource-grid"/, address);
    if (address === '#explorar?q=derivadas') assert.match(app.node('#catalog-content').innerHTML, /href="#contenido\/sim-derivada"/);
  }
});

test('La búsqueda global desde los cursos abre contenidos y enfoca su título', () => {
  const app = environment();
  app.node('#content-search').value = 'derivadas';
  app.node('#search-form').emit('submit');
  assert.equal(app.node('#courses-view').hidden, true);
  assert.equal(app.node('.discovery').hidden, false);
  assert.match(app.location.hash, /^#explorar\?q=derivadas/);
  assert.match(app.node('#catalog-content').innerHTML, /href="#contenido\/sim-derivada"/);
  assert.equal(app.document.activeElement, app.node('#catalog-title'));
  app.change(app.node('#topic-filter'), 'all');
  app.node('#content-search').value = '';
  app.node('#content-search').emit('input', { target: app.node('#content-search') });
  assert.equal(app.node('#courses-view').hidden, true);
  assert.equal(app.node('.discovery').hidden, false);
  assert.equal(app.location.hash, '#explorar?vista=contenidos');
});

test('Escribir desde cursos conserva esa vista en Atrás y reemplaza solo las pulsaciones siguientes', () => {
  const app = environment();
  const search = app.node('#content-search');
  search.value = 'd';
  search.emit('input', { target: search });
  assert.equal(app.historyCalls[0].method, 'pushState');
  assert.equal(app.historyCalls[0].address, '#explorar?q=d');
  search.value = 'derivadas';
  search.emit('input', { target: search });
  assert.equal(app.historyCalls[1].method, 'replaceState');
  assert.equal(app.historyCalls[1].address, '#explorar?q=derivadas');
  assert.equal(app.node('#courses-view').hidden, true);
  app.navigate('#explorar', 'popstate');
  assertCourses(app, app.courses.length);
  assert.equal(search.value, '');
  assert.equal(app.document.activeElement, app.node('#courses-title'));
});

test('La navegación a Explorar enfoca el encabezado de cursos', () => {
  const app = environment('#');
  app.navigate('#explorar');
  assert.equal(app.document.activeElement, app.node('#courses-title'));
  assertCourses(app, app.courses.length);
});

test('Inicio, detalle del curso y recursos siguen siendo accesibles', () => {
  const app = environment('#');
  assert.equal(app.node('#home-view').hidden, false);
  assert.equal(app.node('#courses-view').hidden, true);
  assert.match(app.node('#catalog-content').innerHTML, /Empieza por una idea/);
  app.navigate('#curso/fundamentos-matematicas');
  assert.equal(app.node('#courses-view').hidden, true);
  assert.equal(app.node('#detail-view').hidden, false);
  assert.match(app.node('#detail-view').innerHTML, /href="#contenido\/fundamentos-matematicas-1"/);
  app.navigate('#contenido/fundamentos-matematicas-1');
  assert.equal(app.node('#detail-view').hidden, false);
  assert.match(app.node('#detail-view').innerHTML, /Primero, la intuición/);
  assert.equal(app.document.activeElement, app.node('#detail-title'));
});

test('Fundamentos de Matemáticas agrupa sus módulos por unidad en el orden del programa', () => {
  const app = environment('#curso/fundamentos-matematicas');
  const html = app.node('#detail-view').innerHTML;
  const units = [...html.matchAll(/<h2 class="lesson-unit">([^<]+)<\/h2>/g)].map(match => match[1]);
  assert.deepEqual(units, ['Unidad 1 · Números reales y aritmética', 'Unidad 2 · Álgebra fundamental', 'Unidad 3 · Funciones', 'Unidad 4 · Trigonometría', 'Unidad 5 · Números complejos']);
  const modules = [...html.matchAll(/<span class="lesson-number">([^<]+)<\/span>/g)].map(match => match[1]);
  assert.equal(modules.length, 31);
  assert.deepEqual([modules[0], modules[5], modules[11], modules[18], modules[30]], ['1.1', '2.1', '3.1', '4.1', '5.4']);
});

test('Los enlaces de Álgebra y Trigonometría llevan a su módulo en Fundamentos de Matemáticas', () => {
  for (const [address, expected] of [
    ['#contenido/algebra-2', '#contenido/fundamentos-matematicas-11'],
    ['#contenido/trigonometria-3', '#contenido/fundamentos-matematicas-21'],
    ['#curso/algebra', '#curso/fundamentos-matematicas'],
    ['#curso/trigonometria/2', '#curso/fundamentos-matematicas'],
    ['#explorar?tema=trigonometria&nivel=Inicial', '#explorar?tema=fundamentos&nivel=Inicial'],
    ['#explorar?curso_tema=algebra', '#explorar?curso_tema=fundamentos']
  ]) {
    const app = environment(address);
    assert.equal(app.location.hash, expected, address);
    assert.ok(app.historyCalls.length && app.historyCalls.every(call => call.method === 'replaceState'), address);
  }
  const app = environment('#contenido/algebra-2');
  assert.match(app.node('#detail-view').innerHTML, /<h1 id="detail-title" tabindex="-1">Ecuaciones y desigualdades<\/h1>/);
});
