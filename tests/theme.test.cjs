const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const directory = path.resolve(__dirname, '../dist');
const source = fs.readFileSync(path.join(directory, 'theme.js'), 'utf8');
const storageKey = 'mathbrain-theme';

function environment({ saved = null, systemDark = false, readFails = false, writeFails = false, readyState = 'complete', mounted = true } = {}) {
  const target = extra => {
    const listeners = new Map();
    return Object.assign({
      addEventListener(name, listener, options = {}) {
        const entries = listeners.get(name) || [];
        entries.push({ listener, once: options.once === true });
        listeners.set(name, entries);
      },
      emit(name, event = {}) {
        const entries = listeners.get(name) || [];
        listeners.set(name, entries.filter(entry => !entry.once));
        entries.forEach(entry => entry.listener(event));
      }
    }, extra);
  };
  const root = { dataset: {}, style: {} };
  const meta = { content: '#070b18', setAttribute(name, value) { this[name] = value; } };
  const controls = [target({ value: 'dark' }), target({ value: 'dark' })];
  const icons = ['dark', 'light', 'system'].map(preference => ({
    dataset: { themeIcon: preference }, hidden: preference !== 'dark',
    setAttribute(name) { if (name === 'hidden') this.hidden = true; },
    removeAttribute(name) { if (name === 'hidden') this.hidden = false; }
  }));
  const status = { textContent: '' };
  const events = [];
  const stored = new Map(saved === null ? [] : [[storageKey, saved]]);
  const writes = [];
  const localStorage = {
    getItem(key) {
      if (readFails) throw new Error('Unavailable');
      return stored.get(key) ?? null;
    },
    setItem(key, value) {
      if (writeFails) throw new Error('Unavailable');
      stored.set(key, value);
      writes.push({ key, value });
    }
  };
  const media = target({ matches: systemDark });
  const window = target({
    matchMedia(query) {
      assert.equal(query, '(prefers-color-scheme: dark)');
      return media;
    }
  });
  const document = target({
    readyState, documentElement: root,
    querySelector: selector => selector === 'meta[name="theme-color"]' ? meta : null,
    querySelectorAll: selector => !mounted ? [] : selector === '[data-theme-select]' ? controls : selector === '[data-theme-icon]' ? icons : [],
    getElementById: id => mounted && id === 'theme-status' ? status : null,
    dispatchEvent(event) { events.push(event); return true; }
  });
  vm.runInNewContext(source, {
    window, document, localStorage,
    CustomEvent: class CustomEvent {
      constructor(type, options) { this.type = type; this.detail = options.detail; }
    }
  });
  return {
    root, meta, controls, icons, status, events, stored, writes, document, window, media,
    ready() {
      mounted = true;
      document.readyState = 'interactive';
      document.emit('DOMContentLoaded');
    },
    select(preference, index = 0) {
      controls[index].value = preference;
      controls[index].emit('change');
    },
    setSystem(dark) {
      media.matches = dark;
      media.emit('change', { matches: dark });
    }
  };
}

function assertTheme(env, theme, preference = theme, controlsMounted = true) {
  assert.equal(env.root.dataset.theme, theme);
  assert.equal(env.root.dataset.themePreference, preference);
  assert.equal(env.root.style.colorScheme, theme);
  assert.equal(env.meta.content, theme === 'light' ? '#edf3fa' : '#070b18');
  if (controlsMounted) {
    assert.ok(env.controls.every(control => control.value === preference));
    assert.deepEqual(env.icons.filter(icon => !icon.hidden).map(icon => icon.dataset.themeIcon), [preference === 'system' ? 'system' : theme]);
  }
  const event = env.events.at(-1);
  assert.equal(event.type, 'mathbrain:themechange');
  assert.equal(event.detail.theme, theme);
  assert.equal(event.detail.preference, preference);
}

test('Sin preferencia guardada conserva el tema oscuro independientemente del sistema', () => {
  for (const systemDark of [false, true]) {
    const env = environment({ systemDark });
    assertTheme(env, 'dark');
    assert.equal(env.status.textContent, '');
    assert.equal(env.writes.length, 0);
  }
});

test('La preferencia clara se aplica antes de cargar el cuerpo y sincroniza los controles al iniciar', () => {
  const env = environment({ saved: 'light', readyState: 'loading', mounted: false });
  assertTheme(env, 'light', 'light', false);
  assert.equal(env.status.textContent, '');
  env.ready();
  assertTheme(env, 'light');
  env.select('dark');
  assertTheme(env, 'dark');
  assert.equal(env.stored.get(storageKey), 'dark');
});

test('Una preferencia guardada inválida vuelve al tema oscuro', () => {
  for (const saved of ['', 'sepia', 'LIGHT', 'null']) {
    assertTheme(environment({ saved }), 'dark');
  }
});

test('Leer un almacenamiento bloqueado no impide cargar ni cambiar el tema', () => {
  const env = environment({ saved: 'light', readFails: true });
  assertTheme(env, 'dark');
  env.select('light');
  assertTheme(env, 'light');
  assert.equal(env.stored.get(storageKey), 'light');
});

test('Guardar un almacenamiento bloqueado aplica el tema durante la visita e informa de su alcance', () => {
  const env = environment({ readFails: true, writeFails: true });
  env.select('light');
  assertTheme(env, 'light');
  assert.match(env.status.textContent, /Tema claro activado/);
  assert.match(env.status.textContent, /durante esta visita/);
  assert.equal(env.writes.length, 0);
  env.select('dark', 1);
  assertTheme(env, 'dark');
  assert.match(env.status.textContent, /Tema oscuro activado/);
});

test('Los controles permiten elegir claro, oscuro y sistema y guardan la elección', () => {
  const env = environment();
  for (const [preference, theme, message] of [
    ['light', 'light', 'Tema claro activado.'],
    ['dark', 'dark', 'Tema oscuro activado.'],
    ['system', 'light', 'Tema del sistema: claro.']
  ]) {
    env.select(preference, 1);
    assertTheme(env, theme, preference);
    assert.equal(env.stored.get(storageKey), preference);
    assert.equal(env.status.textContent, message);
  }
  assert.deepEqual(env.writes, ['light', 'dark', 'system'].map(value => ({ key: storageKey, value })));
});

test('Volver a abrir la app recupera una selección guardada sin anunciar un cambio', () => {
  for (const [saved, systemDark, theme] of [['dark', false, 'dark'], ['light', true, 'light'], ['system', false, 'light'], ['system', true, 'dark']]) {
    const env = environment({ saved, systemDark });
    assertTheme(env, theme, saved);
    assert.equal(env.status.textContent, '');
    assert.equal(env.writes.length, 0);
  }
});

test('El modo sistema responde a cambios del dispositivo sin sobrescribir la preferencia', () => {
  const env = environment({ saved: 'system' });
  env.setSystem(true);
  assertTheme(env, 'dark', 'system');
  assert.equal(env.status.textContent, 'Tema del sistema: oscuro.');
  env.setSystem(false);
  assertTheme(env, 'light', 'system');
  assert.equal(env.status.textContent, 'Tema del sistema: claro.');
  assert.equal(env.stored.get(storageKey), 'system');
  assert.equal(env.writes.length, 0);
});

test('Los temas elegidos explícitamente ignoran los cambios de apariencia del dispositivo', () => {
  for (const saved of ['dark', 'light']) {
    const env = environment({ saved });
    const eventCount = env.events.length;
    env.setSystem(true);
    env.setSystem(false);
    assertTheme(env, saved);
    assert.equal(env.events.length, eventCount);
    assert.equal(env.status.textContent, '');
  }
});

test('Salir del modo sistema mantiene el tema elegido ante cambios posteriores del dispositivo', () => {
  const env = environment({ saved: 'system', systemDark: true });
  env.select('light');
  env.setSystem(false);
  env.setSystem(true);
  assertTheme(env, 'light');
  assert.equal(env.status.textContent, 'Tema claro activado.');
});

test('Otra pestaña sincroniza la preferencia y el borrado de almacenamiento recupera el tema oscuro', () => {
  const env = environment();
  env.window.emit('storage', { key: storageKey, newValue: 'light' });
  assertTheme(env, 'light');
  assert.equal(env.status.textContent, 'Tema claro activado.');
  env.window.emit('storage', { key: storageKey, newValue: 'system' });
  assertTheme(env, 'light', 'system');
  env.setSystem(true);
  assertTheme(env, 'dark', 'system');
  env.window.emit('storage', { key: storageKey, newValue: null });
  assertTheme(env, 'dark');
  env.window.emit('storage', { key: storageKey, newValue: 'light' });
  env.window.emit('storage', { key: null, newValue: null });
  assertTheme(env, 'dark');
  assert.equal(env.writes.length, 0);
});

test('Un evento de almacenamiento ajeno no altera el tema y un valor inválido vuelve al oscuro', () => {
  const env = environment({ saved: 'light' });
  const eventCount = env.events.length;
  env.window.emit('storage', { key: 'mathbrain-saved', newValue: 'dark' });
  assertTheme(env, 'light');
  assert.equal(env.events.length, eventCount);
  env.window.emit('storage', { key: storageKey, newValue: 'sepia' });
  assertTheme(env, 'dark');
  assert.equal(env.writes.length, 0);
});

test('La página aplica el tema antes del CSS y ofrece un selector con etiqueta y estado accesible', () => {
  const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
  const script = html.match(/<script\b[^>]*\bsrc=["'](?:\.\/)?theme\.js["'][^>]*><\/script>/i);
  assert.ok(script);
  assert.doesNotMatch(script[0], /\b(?:defer|async|type\s*=\s*["']module["'])/i);
  assert.ok(script.index < html.search(/<link\b[^>]*\brel=["']stylesheet["']/i));
  assert.match(html, /<link\b[^>]*rel="stylesheet"[^>]*href="themes\.css"/);
  const control = html.match(/<label\b[^>]*class="theme-control"[^>]*>([\s\S]*?)<\/label>/);
  assert.ok(control);
  assert.match(control[1], /Tema de la aplicación/);
  assert.match(control[1], /<select\b[^>]*data-theme-select/);
  for (const preference of ['dark', 'light', 'system']) {
    assert.ok(control[1].includes(`<option value="${preference}">`));
    assert.ok(control[1].includes(`data-theme-icon="${preference}"`));
  }
  const status = html.match(/<[^>]+\bid="theme-status"[^>]*>/);
  assert.ok(status);
  assert.match(status[0], /role="status"/);
  assert.match(status[0], /aria-live="polite"/);
});

test('El service worker prepara el script y los estilos del tema para usarlos sin conexión', () => {
  const workerSource = fs.readFileSync(path.join(directory, 'sw.js'), 'utf8');
  const context = vm.createContext({ URL, self: { location: { href: 'https://mathbrain.test/sw.js' }, addEventListener() {} } });
  vm.runInContext(workerSource, context);
  const files = vm.runInContext('SHELL_FILES', context);
  for (const filename of ['./theme.js', './themes.css']) {
    assert.ok(files.includes(filename), `${filename} está incluido en el caché sin conexión`);
    assert.ok(fs.statSync(path.join(directory, filename)).isFile());
  }
});
