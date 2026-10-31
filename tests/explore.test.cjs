const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const directory = path.resolve(__dirname, '../dist');
const markup = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
const source = fs.readFileSync(path.join(directory, 'app.js'), 'utf8');

function registeredCloud() {
  return { state: { available: true, ready: true, user: { id: 'estudiante', email: 'ana@ejemplo.com' }, message: '', status: 'synced' }, record: async () => {} };
}

const guestCloud = () => ({ ...registeredCloud(), state: { ...registeredCloud().state, user: null } });

function environment(hash = '#explorar', prepareLibrary = () => {}, cloud = registeredCloud()) {
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
  const window = target({ location, ZUKA_CLOUD: cloud, scrollTo() {}, matchMedia: () => ({ matches: false }) });
  document = target({
    body: staticElements.find(node => node.tagName === 'BODY'),
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
  const session = new Map();
  const context = vm.createContext({
    window, document, history, location, URL, URLSearchParams, Intl,
    localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) },
    sessionStorage: { getItem: key => session.get(key) ?? null, setItem: (key, value) => session.set(key, value), removeItem: key => session.delete(key) },
    requestAnimationFrame: callback => callback(),
    setTimeout: () => 1,
    clearTimeout() {}
  });
  for (const filename of ['courses.js', 'content.js', 'library.js', 'landing.js']) vm.runInContext(fs.readFileSync(path.join(directory, filename), 'utf8'), context);
  prepareLibrary(window.MATHBRAIN_LIBRARY, window.MATHBRAIN_COURSES);
  vm.runInContext(source, context);
  return {
    document, location, historyCalls, courseTotal, stored, session,
    emitCloud(reason = 'auth') { window.emit('zuka:cloud', { detail: { reason } }); },
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
    for (const course of app.courses) assert.ok(albums(app).some(album => album.includes(`href="#curso/${course.id}"`)));
  }
});

test('Las tarjetas muestran lecciones, nivel y duración reales sin inventar extras', () => {
  const app = environment('#explorar', library => {
    const explanation = library.resources.find(resource => resource.courseId === 'fundamentos-matematicas' && resource.type === 'explanation');
    library.resources.push({ ...explanation, id: 'fundamentos-conteo-regresion' });
  });
  for (const course of app.courses) {
    const album = albums(app).find(value => value.includes(`href="#curso/${course.id}"`));
    const text = album.replace(/<[^>]*>/g, ' ');
    const resources = app.library.resources.filter(resource => resource.courseId === course.id);
    const lessons = resources.filter(resource => resource.type === 'explanation').length;
    assert.match(text, new RegExp(`\\b${lessons}\\s+lecci(?:ón|ones)`), course.id);
    assert.match(text, new RegExp(`Nivel ${course.level.toLowerCase()}`), course.id);
    assert.match(text, /≈ \d+ h/, course.id);
    assert.doesNotMatch(text, /simulaci|ejercicio/i, course.id);
  }
});

test('Los filtros por tema y nivel se combinan conservando el total general', () => {
  const app = environment('#explorar?curso_tema=calculo&curso_nivel=Intermedio');
  assertCourses(app, 2);
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
  const home = app.node('#today-panel').innerHTML;
  assert.match(home, /Primera lección · 1\.1<\/small>Sistemas numéricos y números reales/);
  assert.equal((home.match(/class="button button-primary/g) || []).length, 1, 'El inicio tiene un solo botón principal');
  assert.match(home, /href="#contenido\/fundamentos-matematicas-1">[\s\S]*Empezar a aprender/);
  assert.match(home, /Tu camino[\s\S]*Números reales y aritmética/);
  assert.doesNotMatch(home, /znode-pop/);
  app.navigate('#curso/fundamentos-matematicas');
  assert.equal(app.node('#courses-view').hidden, true);
  assert.equal(app.node('#detail-view').hidden, false);
  assert.match(app.node('#detail-view').innerHTML, /href="#contenido\/fundamentos-matematicas-1"/);
  app.navigate('#contenido/fundamentos-matematicas-1');
  assert.equal(app.node('#detail-view').hidden, false);
  // La lección 1.1 abre con su video vertical (short 9:16), incrustado desde youtube-nocookie y a pantalla completa en el celular.
  assert.match(app.node('#player-stage').innerHTML, /Mira la clase[\s\S]*<div class="video-stage is-vertical"><iframe [^>]*src="https:\/\/www\.youtube-nocookie\.com\/embed\/9OhYP2QqRiw\?rel=0&amp;playsinline=1&amp;cc_load_policy=1&amp;cc_lang_pref=es&amp;hl=es"/);
  assert.equal(app.node('#lesson-player').classList.contains('is-immersive'), true);
  assert.equal(app.document.activeElement, app.node('#detail-title'));
  app.click(app.all('[data-player-next]').at(-1));
  assert.equal(app.node('#lesson-player').classList.contains('is-immersive'), false, 'Después del video la lección vuelve a su vista normal');
  assert.match(app.node('#player-stage').innerHTML, /Primero, la intuición/);
  app.navigate('#contenido/fundamentos-matematicas-1?vista=lectura');
  assert.match(app.node('#detail-view').innerHTML, /Primero, la intuición[\s\S]*Practica/);
});

test('La página del curso es un camino de niveles con lecciones, repasos y la descripción del curso', () => {
  const app = environment('#curso/fundamentos-matematicas');
  const html = app.node('#detail-view').innerHTML;
  assert.match(html, /Lo que aprenderás/);
  assert.match(html, /Habilidades que desarrollarás/);
  assert.match(html, /Hay 5 módulos en este curso/);
  assert.match(html, /Impartido por<\/small><strong>Carlos Hurtado/);
  assert.match(html, />Empezar el curso</);
  const levels = [...html.matchAll(/<p class="zunit-kicker">([^<]+)<\/p><h2 id="unit-[\w-]+-\d+">([^<]+)<\/h2>/g)].map(match => `${match[1]} · ${match[2]}`);
  assert.deepEqual(levels, ['Unidad 1 · Números reales y aritmética', 'Unidad 2 · Álgebra fundamental', 'Unidad 3 · Funciones', 'Unidad 4 · Trigonometría', 'Unidad 5 · Números complejos']);
  const numbers = [...html.matchAll(/<span class="module-item-number">([^<]+)<\/span>/g)].map(match => match[1]);
  assert.equal(numbers.length, 31);
  assert.deepEqual([numbers[0], numbers[5], numbers[11], numbers[18], numbers[30]], ['1.1', '2.1', '3.1', '4.1', '5.4']);
  assert.equal((html.match(/class="znode is-current"/g) || []).length, 1);
  assert.match(html, /class="znode is-current"><a class="znode-link" href="#contenido\/fundamentos-matematicas-1"/);
  // Con una cuenta todas las unidades, lecciones y repasos están disponibles desde el comienzo.
  assert.equal((html.match(/Repaso de la unidad/g) || []).length, 5);
  assert.match(html, /href="#repaso\/fundamentos-matematicas\/1"/);
  assert.match(html, /href="#repaso\/fundamentos-matematicas\/2"/);
  assert.match(html, /href="#contenido\/fundamentos-matematicas-6"/);
  assert.doesNotMatch(html, /class="znode is-locked"/);
  assert.doesNotMatch(html, /class="zunit is-locked"/);
  assert.match(html, /href="#contenido\/sim-circulo"/);
});

test('Los cursos sin módulo indicado en la lección numeran sus lecciones por módulo', () => {
  const app = environment('#curso/calculo-diferencial');
  const html = app.node('#detail-view').innerHTML;
  const numbers = [...html.matchAll(/<span class="module-item-number">([^<]+)<\/span>/g)].map(match => match[1]);
  assert.deepEqual(numbers, ['1.1', '1.2', '2.1', '2.2', '2.3']);
  assert.match(html, /<p class="zunit-kicker">Módulo 2<\/p><h2 id="unit-calculo-diferencial-1">La derivada y sus aplicaciones/);
});

test('La lección se recorre paso a paso y los retos piden respuesta antes de continuar', () => {
  const app = environment('#contenido/fundamentos-matematicas-6');
  const lesson = app.library.resources.find(resource => resource.id === 'fundamentos-matematicas-6');
  assert.match(app.node('#detail-view').innerHTML, /UNIDAD 2 · LECCIÓN 2\.1/);
  assert.match(app.node('#detail-view').innerHTML, /href="#contenido\/fundamentos-matematicas-6\?vista=lectura"/);
  assert.equal((app.node('#player-meter').innerHTML.match(/<li /g) || []).length, lesson.steps.length);
  const next = () => app.click(app.all('[data-player-next]').at(-1));
  const firstChallenge = lesson.steps.findIndex(step => step.type === 'exercise');
  for (let step = 0; step < firstChallenge; step += 1) {
    assert.match(app.node('#player-bar').innerHTML, /data-player-next/);
    next();
  }
  assert.match(app.node('#player-stage').innerHTML, /Tu turno/);
  assert.match(app.node('#player-bar').innerHTML, /data-player-reveal/);
  assert.doesNotMatch(app.node('#player-bar').innerHTML, /data-player-next/, 'Sin responder no se puede continuar');
  app.click(app.all('[data-player-back]').at(-1));
  assert.doesNotMatch(app.node('#player-stage').innerHTML, /Tu turno/);
  next();
  for (let step = firstChallenge; step < lesson.steps.length; step += 1) {
    if (lesson.steps[step].type === 'exercise') app.click(app.all('[data-player-reveal]').at(-1));
    next();
  }
  assert.match(app.node('#player-stage').innerHTML, /¡Lección completada!/);
  assert.match(app.node('#player-stage').innerHTML, /Practicaste <strong>Potenciación y leyes de los exponentes<\/strong>/);
  assert.match(app.node('#player-stage').innerHTML, /<p class="player-end-xp">\+20 XP<\/p>/);
  assert.equal((app.node('#player-bar').innerHTML.match(/button-primary/g) || []).length, 1);
  assert.match(app.node('#player-bar').innerHTML, /href="#contenido\/fundamentos-matematicas-7">Continuar/);
  assert.equal(app.node('#streak-count').textContent, '1');
  assert.equal(app.node('#xp-count').textContent, '20 XP');
  app.navigate('#curso/fundamentos-matematicas');
  assert.match(app.node('#detail-view').innerHTML, /class="znode is-done"><a class="znode-link" href="#contenido\/fundamentos-matematicas-6"/);
  // Avanzar en la unidad 2 la deja abierta, aunque la unidad 1 siga pendiente.
  assert.match(app.node('#detail-view').innerHTML, /href="#contenido\/fundamentos-matematicas-7"/);
});

test('El repaso del nivel reúne un reto por lección de cada nivel', () => {
  const app = environment('#repaso/fundamentos-matematicas/2');
  assert.match(app.node('#detail-view').innerHTML, /UNIDAD 2 · REPASO DEL NIVEL/);
  assert.equal((app.node('#player-meter').innerHTML.match(/is-challenge/g) || []).length, 6);
  assert.match(app.node('#player-stage').innerHTML, /Pon a prueba este nivel/);
  app.navigate('#repaso/calculo-diferencial/1');
  assert.match(app.node('#detail-view').innerHTML, /MÓDULO 1 · REPASO DEL NIVEL/);
  assert.equal((app.node('#player-meter').innerHTML.match(/is-challenge/g) || []).length, 2);
  app.navigate('#repaso/calculo-diferencial/9');
  assert.match(app.node('#detail-view').innerHTML, /Esta idea no está en ese enlace/);
});

test('Todas las lecciones de los cursos tienen al menos dos retos y cada nivel tiene repaso', () => {
  for (const course of environment('#').courses) {
    const app = environment(`#curso/${course.id}`);
    const html = app.node('#detail-view').innerHTML;
    assert.equal((html.match(/Repaso de la unidad/g) || []).length, course.modules.length, course.id);
    assert.match(html, new RegExp(`href="#repaso/${course.id}/1"`), course.id);
    for (const lesson of app.library.resources.filter(resource => resource.courseId === course.id && resource.type === 'explanation')) assert.ok(lesson.practice >= 2, lesson.id);
  }
});

test('La vista de lectura conserva el temario, la posición y la navegación entre lecciones', () => {
  const app = environment('#contenido/fundamentos-matematicas-6?vista=lectura');
  const html = app.node('#detail-view').innerHTML;
  assert.match(html, /UNIDAD 2 · LECCIÓN 2\.1/);
  assert.match(html, /class="outline-item is-current" href="#contenido\/fundamentos-matematicas-6" aria-current="page"/);
  assert.match(html, /Práctica · 3 ejercicios/);
  assert.match(html, /href="#contenido\/fundamentos-matematicas-7" data-complete-on-leave="fundamentos-matematicas-6"/);
  assert.match(html, /data-complete="fundamentos-matematicas-6" aria-pressed="false"/);
});

test('Completar lecciones actualiza el camino, el catálogo y el panel del inicio', () => {
  const app = environment('#contenido/probabilidad-1?vista=lectura');
  app.click(app.all('[data-complete="probabilidad-1"]').at(-1));
  assert.match(app.node('#lesson-pager').innerHTML, /data-complete="probabilidad-1" aria-pressed="true"/);
  assert.match(app.node('#lesson-outline').innerHTML, /20 % completado · 1 de 5 lecciones/);
  app.click(app.all('[data-complete-on-leave="probabilidad-1"]').at(-1));
  app.navigate('#contenido/probabilidad-2?vista=lectura');
  app.click(app.all('[data-complete-on-leave="probabilidad-2"]').at(-1));
  app.navigate('#curso/probabilidad');
  const course = app.node('#detail-view').innerHTML;
  assert.match(course, />Continuar el curso</);
  assert.match(course, /class="znode is-current"><a class="znode-link" href="#contenido\/probabilidad-3"/);
  assert.match(course, /40 % completado · 2 de 5 lecciones/);
  assert.match(course, /<span class="zunit-count">2\/2<\/span>/);
  // Terminar la unidad 1 abre la unidad 2.
  assert.doesNotMatch(course, /class="zunit is-locked"/);
  app.navigate('#explorar');
  assert.match(app.node('#course-grid').innerHTML, /<span class="zcard-status">40 %<\/span>/);
  app.navigate('#');
  assert.match(app.node('#today-panel').innerHTML, /Siguiente lección · 2\.1<\/small>Probabilidad condicional e independencia[\s\S]*Continuar aprendiendo/);
  app.navigate('#contenido/probabilidad-1?vista=lectura');
  app.click(app.all('[data-complete="probabilidad-1"]').at(-1));
  assert.match(app.node('#lesson-pager').innerHTML, /aria-pressed="false"/);
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

test('El perfil resume el progreso, guarda el nombre y saluda con él en el inicio', () => {
  const app = environment('#contenido/probabilidad-1?vista=lectura');
  app.click(app.all('[data-complete="probabilidad-1"]').at(-1));
  app.navigate('#perfil');
  assert.equal(app.node('#detail-view').hidden, false);
  assert.equal(app.node('#home-view').hidden, true);
  assert.equal(app.document.title, 'Tu perfil | Zuka');
  assert.equal(app.document.activeElement, app.node('#detail-title'));
  const profile = app.node('#detail-view').innerHTML;
  assert.match(profile, /<strong>Nivel 1<\/strong>/);
  assert.match(profile, /<strong>1<\/strong><span>lección completada<\/span>/);
  assert.match(profile, /<strong>0<\/strong><span>días de racha<\/span>/);
  assert.match(profile, /Completa una lección y aparecerá aquí\./);
  assert.match(profile, /<li class="is-earned">[\s\S]*?<strong>Primer paso<\/strong>/);
  assert.match(profile, /1 de 6 conseguidos/);
  assert.match(profile, /<option value="0" selected>Sin meta<\/option>/);
  assert.match(profile, /Probabilidad<\/strong><\/a><div class="course-progress">[\s\S]*?20 % completado/);
  assert.match(app.node('[data-nav="perfil"]').getAttribute('aria-current') || '', /page/);
  app.node('#profile-name').value = '  Ana <b>  ';
  app.node('#profile-goal').value = '3';
  app.document.emit('submit', { target: app.all('[data-profile-form]').at(-1) });
  assert.match(app.node('#detail-view').innerHTML, /<h1 id="detail-title" tabindex="-1">Hola, Ana &lt;b&gt;<\/h1>/);
  assert.match(app.node('#detail-view').innerHTML, /<option value="3" selected>/);
  app.navigate('#');
  assert.match(app.node('#today-panel').innerHTML, /(?:Buenos días|Buenas tardes|Buenas noches), Ana &lt;b&gt;<\/h1>/);
  assert.match(app.node('#today-panel').innerHTML, /Meta semanal: 0 de 3 días/);
});

test('El perfil ofrece registro e inicio solo con correo y contraseña, incluso si Google está activo en Supabase', () => {
  const cloud = { state: { available: true, ready: true, user: null, message: '', providers: { google: true } } };
  const app = environment('#perfil', undefined, cloud);
  assert.equal(app.node('#auth-email').getAttribute('type'), 'email');
  assert.equal(app.node('#auth-email').getAttribute('autocomplete'), 'email');
  assert.equal(app.node('#auth-password').getAttribute('type'), 'password');
  assert.equal(app.node('#auth-password').getAttribute('autocomplete'), 'new-password');
  assert.equal(app.node('#auth-password').getAttribute('minlength'), '8');
  assert.match(app.node('#detail-view').innerHTML, /Correo electrónico/);
  assert.equal(app.all('[data-auth-google]').length, 0);
  assert.doesNotMatch(app.node('#detail-view').innerHTML, /Google/);

  app.click(app.all('[data-auth-mode="signin"]').at(-1));
  assert.equal(app.all('[data-auth-form="signin"]').length, 1);
  assert.equal(app.node('#auth-password').getAttribute('autocomplete'), 'current-password');
  assert.equal(app.node('#auth-password').getAttribute('minlength'), null);
  assert.match(app.node('#detail-view').innerHTML, /¿Olvidaste tu contraseña\?/);
  assert.doesNotMatch(app.node('#detail-view').innerHTML, /Google/);

  app.click(app.all('[data-auth-mode="reset"]').at(-1));
  assert.equal(app.all('[data-auth-form="reset"]').length, 1);
  assert.doesNotMatch(app.node('#detail-view').innerHTML, /id="auth-password"/);
  assert.match(app.node('#detail-view').innerHTML, /Enviar enlace/);
});

test('El formulario registra con correo y contraseña y pide confirmar el correo antes de entrar', async () => {
  const requests = [];
  const cloud = {
    state: { available: true, ready: true, user: null, message: '' },
    signUp: async (email, password) => { requests.push({ email, password }); return { needsConfirmation: true }; }
  };
  const app = environment('#perfil', undefined, cloud);
  app.node('#auth-email').value = '  ana@ejemplo.com  ';
  app.node('#auth-password').value = 'segura-123';
  app.document.emit('submit', { target: app.all('[data-auth-form="signup"]').at(-1) });
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(requests, [{ email: 'ana@ejemplo.com', password: 'segura-123' }]);
  assert.equal(app.all('[data-auth-form="signin"]').length, 1);
  assert.match(app.node('#detail-view').innerHTML, /Te enviamos un correo a ana@ejemplo.com/);
});

test('El formulario valida el correo y la longitud de la contraseña antes de registrar', () => {
  let requests = 0;
  const cloud = {
    state: { available: true, ready: true, user: null, message: '' },
    signUp: async () => { requests += 1; return { needsConfirmation: true }; }
  };
  const app = environment('#perfil', undefined, cloud);
  app.node('#auth-email').value = 'correo-invalido';
  app.node('#auth-password').value = 'segura-123';
  const form = app.all('[data-auth-form="signup"]').at(-1);
  app.document.emit('submit', { target: form });
  assert.equal(app.node('#profile-auth-notice').textContent, 'Revisa que el correo esté bien escrito.');
  app.node('#auth-email').value = 'ana@ejemplo.com';
  app.node('#auth-password').value = 'corta';
  app.document.emit('submit', { target: form });
  assert.equal(app.node('#profile-auth-notice').textContent, 'La contraseña debe tener al menos 8 caracteres.');
  assert.equal(requests, 0);
});

test('La bienvenida ofrece explorar, crear una cuenta por correo y entrar con una cuenta existente', () => {
  const app = environment('#', undefined, guestCloud());
  const html = app.node('#today-panel').innerHTML;
  assert.match(html, /href="#explorar">Explorar la plataforma/);
  assert.match(html, /href="#registro">Crear mi cuenta/);
  assert.match(html, /href="#ingresar">Inicia sesión/);
    assert.match(html, /primera lección de cada curso/);
  assert.equal(app.node('#explore-notice').hidden, true);
  app.navigate('#explorar');
  assertCourses(app, app.courses.length);
  assert.equal(app.node('#explore-notice').hidden, false);
  app.navigate('#registro');
  assert.equal(app.all('[data-auth-form="signup"]').length, 1);
  assert.equal(app.node('#auth-email').getAttribute('type'), 'email');
  assert.equal(app.node('#auth-password').getAttribute('minlength'), '8');
  assert.doesNotMatch(app.node('#detail-view').innerHTML, /Google/);
});

test('Al explorar solo la primera lección de cada curso abre el reproductor y la lectura', () => {
  const app = environment('#explorar', undefined, guestCloud());
  for (const course of app.courses) {
    const first = app.library.resources.find(resource => resource.courseId === course.id && resource.type === 'explanation');
    app.navigate(`#contenido/${first.id}`);
    assert.match(app.node('#detail-view').innerHTML, /id="lesson-player"/, first.id);
    app.navigate(`#contenido/${first.id}?vista=lectura`);
    assert.match(app.node('#detail-view').innerHTML, /class="reader-body lesson-content"/, first.id);
    assert.match(app.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/);
    assert.doesNotMatch(app.node('#detail-view').innerHTML, new RegExp(`href="#contenido/${course.id}-2"`));
  }
});

test('Los enlaces directos, la lectura, los alias y los repasos no evitan el registro', () => {
  const app = environment('#explorar', undefined, guestCloud());
  const firstIds = new Set(app.courses.map(course => app.library.resources.find(resource => resource.courseId === course.id && resource.type === 'explanation').id));
  for (const resource of app.library.resources.filter(resource => !firstIds.has(resource.id))) {
    for (const suffix of ['', '?vista=lectura']) {
      app.navigate(`#contenido/${resource.id}${suffix}`);
      const html = app.node('#detail-view').innerHTML;
      assert.match(html, /Crea tu cuenta para continuar/, resource.id);
      assert.doesNotMatch(html, /id="lesson-player"|class="reader-body lesson-content"|<iframe|<video|simulation-controls/, resource.id);
    }
  }
  for (const address of ['#curso/fundamentos-matematicas/2', '#contenido/algebra-2', '#repaso/probabilidad/1']) {
    app.navigate(address);
    assert.match(app.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/, address);
  }
});

test('Los temarios y el buscador muestran qué contenido requiere cuenta', () => {
  const app = environment('#curso/fundamentos-matematicas', undefined, guestCloud());
  const html = app.node('#detail-view').innerHTML;
  assert.match(html, /href="#contenido\/fundamentos-matematicas-1"/);
  assert.doesNotMatch(html, /href="#contenido\/fundamentos-matematicas-2"/);
  assert.match(html, /href="#registro\?continuar=contenido%2Ffundamentos-matematicas-2"/);
  assert.equal((html.match(/class="znode is-locked"/g) || []).length, 30 + 5);
  app.navigate('#explorar?vista=contenidos');
  const catalog = app.node('#catalog-content').innerHTML;
  assert.match(catalog, /Primera lección · acceso libre/);
  assert.match(catalog, /Disponible al crear tu cuenta/);
  assert.doesNotMatch(catalog, /href="#contenido\/sim-derivada"/);
  app.navigate('#explorar?q=derivadas');
  assert.match(app.node('#catalog-content').innerHTML, /#registro\?continuar=contenido%2Fsim-derivada/);
});

test('El progreso previo del visitante no desbloquea más lecciones', () => {
  const app = environment('#contenido/probabilidad-1?vista=lectura', undefined, guestCloud());
  app.click(app.all('[data-complete="probabilidad-1"]').at(-1));
  assert.deepEqual(JSON.parse(app.stored.get('mathbrain-progress')), ['probabilidad-1']);
  app.navigate('#contenido/probabilidad-2');
  assert.match(app.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/);
  app.navigate('#curso/probabilidad');
  assert.match(app.node('#detail-view').innerHTML, /class="znode is-locked"/);
});

test('Con sesión se puede entrar a cualquier lección, simulación, ejercicio y repaso', () => {
  const app = environment('#explorar');
  assert.equal(app.node('#explore-notice').hidden, true);
  for (const resource of app.library.resources) {
    app.navigate(`#contenido/${resource.id}?vista=lectura`);
    assert.doesNotMatch(app.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/, resource.id);
    assert.match(app.node('#detail-view').innerHTML, /id="detail-title"/, resource.id);
  }
  app.navigate('#repaso/fundamentos-matematicas/5');
  assert.match(app.node('#detail-view').innerHTML, /id="lesson-player"/);
});

test('La sesión se comprueba antes de mostrar bienvenida o bloquear una lección', () => {
  const cloud = guestCloud();
  cloud.state.ready = false;
  const app = environment('#', undefined, cloud);
  assert.match(app.node('#today-panel').innerHTML, /Preparando tu espacio/);
  assert.doesNotMatch(app.node('#today-panel').innerHTML, /Explorar la plataforma/);
  app.navigate('#contenido/probabilidad-2');
  assert.match(app.node('#detail-view').innerHTML, /Comprobando tu sesión/);
  cloud.state.user = { id: 'ana', email: 'ana@ejemplo.com' };
  cloud.state.ready = true;
  app.emitCloud();
  assert.match(app.node('#detail-view').innerHTML, /id="lesson-player"/);
});

test('Cerrar sesión durante una lección restringida vuelve a pedir una cuenta inmediatamente', () => {
  const cloud = registeredCloud();
  const app = environment('#contenido/probabilidad-2', undefined, cloud);
  assert.match(app.node('#detail-view').innerHTML, /id="lesson-player"/);
  cloud.state.user = null;
  app.emitCloud();
  assert.match(app.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/);
  assert.doesNotMatch(app.node('#detail-view').innerHTML, /id="lesson-player"/);
  app.navigate('#contenido/probabilidad-1');
  assert.match(app.node('#detail-view').innerHTML, /id="lesson-player"/);
});

test('El registro conserva la lección elegida y solo la desbloquea al iniciar sesión', async () => {
  const cloud = guestCloud();
  cloud.signUp = async () => ({ needsConfirmation: true });
  const app = environment('#registro?continuar=contenido%2Fprobabilidad-2%3Fvista%3Dlectura', undefined, cloud);
  app.node('#auth-email').value = 'ana@ejemplo.com';
  app.node('#auth-password').value = 'segura-123';
  app.document.emit('submit', { target: app.all('[data-auth-form="signup"]').at(-1) });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(cloud.state.user, null);
  assert.match(app.node('#detail-view').innerHTML, /Te enviamos un correo/);
  assert.equal(app.all('[data-auth-form="signin"]').length, 1);
  assert.equal(app.session.get('zuka-auth-return'), 'contenido/probabilidad-2?vista=lectura');
  cloud.state.user = { id: 'ana', email: 'ana@ejemplo.com' };
  app.emitCloud();
  assert.equal(app.location.hash, '#contenido/probabilidad-2?vista=lectura');
  assert.match(app.node('#detail-view').innerHTML, /class="reader-body lesson-content"/);
  assert.equal(app.session.has('zuka-auth-return'), false);
});

test('La recuperación de contraseña no redirige hasta guardar la contraseña y los destinos externos se ignoran', () => {
  const cloud = registeredCloud();
  cloud.state.recovery = true;
  const app = environment('#ingresar?continuar=contenido%2Fprobabilidad-2', undefined, cloud);
  assert.equal(app.all('[data-auth-form="recovery"]').length, 1);
  cloud.state.recovery = false;
  app.emitCloud();
  assert.equal(app.location.hash, '#contenido/probabilidad-2');
  const other = environment('#registro?continuar=https%3A%2F%2Fejemplo.com', undefined, registeredCloud());
  assert.equal(other.location.hash, '#');
  assert.match(other.node('#today-panel').innerHTML, /Empezar a aprender/);
});

test('Sin Supabase se puede explorar la primera lección pero no se habilita todo el contenido', () => {
  const app = environment('#', undefined, null);
  assert.match(app.node('#today-panel').innerHTML, /Explorar la plataforma/);
  app.navigate('#contenido/probabilidad-1');
  assert.match(app.node('#detail-view').innerHTML, /id="lesson-player"/);
  app.navigate('#contenido/probabilidad-2');
  assert.match(app.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/);
});

test('La landing presenta el propósito, los seis servicios y las cuatro escuelas', () => {
  const app = environment('#', undefined, guestCloud());
  const html = app.node('#today-panel').innerHTML;
  assert.match(html, /Tus sueños/);
  assert.match(html, /merecen/);
  assert.match(html, /ingresar a la universidad/);
  assert.equal(app.document.body.classList.contains('marketing-mode'), true);
  for (const id of ['preicfes', 'preuniversitario', 'preingeniero', 'ingenieria', 'tutorias', 'asesorias']) {
    assert.ok(html.includes(`href="#programa/${id}"`), id);
    app.navigate(`#programa/${id}`);
    assert.match(app.node('#detail-view').innerHTML, /id="detail-title"/);
    assert.doesNotMatch(app.node('#detail-view').innerHTML, /No encontramos/);
    assert.equal(app.document.body.classList.contains('marketing-mode'), true);
  }
  for (const school of ['matematicas', 'fisica', 'estadistica', 'programacion']) assert.ok(html.includes(`href="#escuela/${school}"`), school);
});

test('PreICFES presenta exactamente las cinco pruebas de Saber 11 y enlaza al Icfes', () => {
  const app = environment('#programa/preicfes', undefined, guestCloud());
  const html = app.node('#detail-view').innerHTML;
  const subjects = [...html.matchAll(/data-subject="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(subjects, ['Lectura Crítica', 'Matemáticas', 'Sociales y Ciudadanas', 'Ciencias Naturales', 'Inglés']);
  assert.match(html, /href="https:\/\/www\.icfes\.gov\.co\/evaluaciones-icfes\/saber-11\/"/);
  assert.match(html, /href="#curso\/fundamentos-matematicas"/);
  assert.equal(app.node('#explore-notice').hidden, true, 'La descripción del servicio es pública');
});

test('Preuniversitario ofrece Razonamiento lógico y Comprensión lectora con consulta por WhatsApp', () => {
  const app = environment('#programa/preuniversitario', undefined, guestCloud());
  const html = app.node('#detail-view').innerHTML;
  const subjects = [...html.matchAll(/data-subject="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(subjects, ['Razonamiento lógico', 'Comprensión lectora']);
  assert.equal((html.match(/Consultar este curso/g) || []).length, 2);
  assert.match(html, /Los cursos con acompañamiento se consultan por WhatsApp/);
  assert.doesNotMatch(html, /href="#curso\/(?:razonamiento-logico|comprension-lectora)"/, 'No se inventan lecciones publicadas');
});

test('Preingeniero conecta las bases matemáticas, de física y de programación', () => {
  const app = environment('#programa/preingeniero', undefined, guestCloud());
  const html = app.node('#detail-view').innerHTML;
  assert.match(html, /Fundamentos matemáticos/);
  assert.match(html, /Bases de física/);
  assert.match(html, /Pensamiento computacional/);
  for (const destination of ['#curso/fundamentos-matematicas', '#escuela/fisica', '#escuela/programacion']) assert.ok(html.includes(`href="${destination}"`));
});

test('Los cursos se agrupan por escuelas conservando su contenido y su progreso', () => {
  const app = environment('#explorar');
  const html = app.node('#course-grid').innerHTML;
  assertCourses(app, 5);
  for (const school of ['matematicas', 'fisica', 'estadistica', 'programacion']) assert.ok(html.includes(`data-school="${school}"`), school);
  const math = html.match(/<section class="course-school" data-school="matematicas"[\s\S]*?<\/section>/)[0];
  const stats = html.match(/<section class="course-school" data-school="estadistica"[\s\S]*?<\/section>/)[0];
  for (const id of ['fundamentos-matematicas', 'calculo-diferencial', 'calculo-integral']) assert.ok(math.includes(`href="#curso/${id}"`), id);
  for (const id of ['probabilidad', 'inferencia-estadistica']) assert.ok(stats.includes(`href="#curso/${id}"`), id);
  assert.doesNotMatch(math, /href="#curso\/probabilidad"/);
  assert.match(html, /CURSO CON ACOMPAÑAMIENTO/);
  app.navigate('#explorar?curso_tema=calculo&curso_nivel=Intermedio');
  assertCourses(app, 2);
  assert.doesNotMatch(app.node('#course-grid').innerHTML, /data-school="fisica"|CURSO CON ACOMPAÑAMIENTO/);
});

test('Cada escuela abre sus cursos reales o las opciones de acompañamiento correspondientes', () => {
  const app = environment('#escuelas', undefined, guestCloud());
  assert.equal((app.node('#detail-view').innerHTML.match(/class="m-school-card/g) || []).length, 4);
  for (const [id, title] of [['matematicas', 'Matemáticas'], ['fisica', 'Física'], ['estadistica', 'Estadística'], ['programacion', 'Programación']]) {
    app.navigate(`#escuela/${id}`);
    const html = app.node('#detail-view').innerHTML;
    assert.ok(html.includes(`Escuela de ${title}`));
    for (const course of app.courses.filter(course => course.school === id)) assert.ok(html.includes(`href="#curso/${course.id}"`));
    if (['fisica', 'programacion'].includes(id)) {
      assert.match(html, /Cursos con acompañamiento/);
      assert.match(html, /Consultar curso/);
    }
  }
});

test('Sobre Zuka presenta la visión y el objetivo sin la biografía ni la foto del fundador', () => {
  const app = environment('#nosotros', undefined, guestCloud());
  const html = app.node('#about-view').innerHTML;
  assert.match(html, /NUESTRA VISIÓN/);
  assert.match(html, /NUESTRO OBJETIVO/);
  assert.match(html, /ingresar a la universidad y culminar una carrera/);
  assert.match(html, /razón para abandonar/);
  assert.doesNotMatch(html, /Carlos Hurtado|autor-carlos|creator-section|fundador/);
  assert.equal(app.document.body.classList.contains('marketing-mode'), true);
  app.navigate('#explorar');
  assert.equal(app.document.body.classList.contains('marketing-mode'), false);
});

test('Los contactos de los programas y servicios usan el WhatsApp colombiano indicado y conservan el tema', () => {
  const app = environment('#programas', undefined, guestCloud());
  for (const route of ['#programas', '#programa/tutorias', '#programa/asesorias', '#escuela/programacion']) {
    app.navigate(route);
    const html = app.node('#detail-view').innerHTML;
    const contacts = [...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"([^>]*)/g)];
    assert.ok(contacts.length >= 2, route);
    for (const [, address, attributes] of contacts) {
      const url = new URL(address);
      assert.equal(url.pathname, '/573243546355');
      assert.match(url.searchParams.get('text'), /^Hola, equipo Zuka\./);
      assert.match(attributes, /target="_blank"/);
      assert.match(attributes, /rel="noopener noreferrer"/);
    }
  }
  assert.match(app.node('#detail-view').innerHTML, /324 354 6355/);
});

test('Las páginas públicas conservan el panel del estudiante y el acceso limitado de visitantes', () => {
  const app = environment('#programas');
  assert.match(app.node('#detail-view').innerHTML, /Mi aprendizaje/);
  app.navigate('#');
  assert.equal(app.document.body.classList.contains('marketing-mode'), false);
  assert.match(app.node('#today-panel').innerHTML, /Empezar a aprender/);
  const guest = environment('#programa/ingenieria', undefined, guestCloud());
  guest.navigate('#contenido/calculo-diferencial-2');
  assert.equal(guest.document.body.classList.contains('marketing-mode'), false);
  assert.match(guest.node('#detail-view').innerHTML, /Crea tu cuenta para continuar/);
  guest.navigate('#contenido/calculo-diferencial-1');
  assert.match(guest.node('#detail-view').innerHTML, /id="lesson-player"/);
});
