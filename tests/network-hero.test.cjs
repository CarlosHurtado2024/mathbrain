const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function environment({ reduced = false, contextAvailable = true } = {}) {
  function target(extra = {}) {
    const listeners = new Map();
    return Object.assign({
      addEventListener(name, callback) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(callback); },
      removeEventListener(name, callback) { listeners.get(name)?.delete(callback); },
      emit(name) { listeners.get(name)?.forEach(callback => callback()); },
      count(name) { return listeners.get(name)?.size || 0; }
    }, extra);
  }
  let sequence = 0;
  let draws = 0;
  let canvas = {
    getBoundingClientRect: () => ({ width: 600, height: 600 }),
    parentElement: { classList: { add() {} } },
    getContext: () => contextAvailable ? {
      clearRect() { draws += 1; }, setTransform() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, arc() {}, fill() {}
    } : null
  };
  const frames = new Map();
  const motion = target({ matches: reduced });
  const document = target({ hidden: false, documentElement: { dataset: { theme: 'dark' } }, querySelector: () => canvas });
  const window = {
    devicePixelRatio: 3, matchMedia: () => motion,
    requestAnimationFrame(callback) { const id = ++sequence; frames.set(id, callback); return id; },
    cancelAnimationFrame(id) { frames.delete(id); }
  };
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; this.disconnected = false; observers.push(this); }
    observe() {}
    disconnect() { this.disconnected = true; }
  }
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../dist/network-hero.js'), 'utf8'), {
    window, document, ResizeObserver: Observer, IntersectionObserver: Observer
  });
  return {
    document, motion, observers, frames, get draws() { return draws; },
    mount() { document.emit('zuka:routechange'); },
    leave() { canvas = null; document.emit('zuka:routechange'); }
  };
}

test('La preferencia de movimiento reducido muestra la figura sin ejecutar una animación', () => {
  const env = environment({ reduced: true });
  env.mount();
  assert.ok(env.draws > 0);
  assert.equal(env.frames.size, 0);
  env.motion.matches = false;
  env.motion.emit('change');
  assert.equal(env.frames.size, 1);
  env.motion.matches = true;
  env.motion.emit('change');
  assert.equal(env.frames.size, 0);
});

test('La animación se pausa fuera de pantalla y con la pestaña oculta', () => {
  const env = environment();
  env.mount();
  assert.equal(env.frames.size, 1);
  env.observers[1].callback([{ isIntersecting: false }]);
  assert.equal(env.frames.size, 0);
  env.observers[1].callback([{ isIntersecting: true }]);
  assert.equal(env.frames.size, 1);
  env.document.hidden = true;
  env.document.emit('visibilitychange');
  assert.equal(env.frames.size, 0);
  env.document.hidden = false;
  env.document.emit('visibilitychange');
  assert.equal(env.frames.size, 1);
});

test('Navegar y cambiar el tema libera la animación anterior y sus observadores', () => {
  const env = environment();
  env.mount();
  env.mount();
  assert.ok(env.observers.slice(0, 2).every(observer => observer.disconnected));
  assert.equal(env.frames.size, 1);
  assert.equal(env.document.count('visibilitychange'), 1);
  assert.equal(env.motion.count('change'), 1);
  env.leave();
  assert.equal(env.frames.size, 0);
  assert.ok(env.observers.every(observer => observer.disconnected));
  assert.equal(env.document.count('visibilitychange'), 0);
  assert.equal(env.motion.count('change'), 0);
});

test('Sin contexto gráfico se conserva la alternativa estática y no se solicitan cuadros', () => {
  const env = environment({ contextAvailable: false });
  assert.doesNotThrow(() => env.mount());
  assert.equal(env.frames.size, 0);
  assert.equal(env.observers.length, 0);
});
