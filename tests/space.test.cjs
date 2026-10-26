const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../dist/space.js'), 'utf8');

function environment({ reduced = false, savedPause = false, storageFails = false, theme } = {}) {
  const target = extra => {
    const listeners = new Map();
    return Object.assign({
      addEventListener(name, listener) { listeners.set(name, listener); },
      emit(name, value = {}) { listeners.get(name)?.(value); }
    }, extra);
  };
  const gradients = [];
  const createGradient = type => {
    const gradient = { type, stops: [], addColorStop(position, color) { this.stops.push({ position, color }); } };
    gradients.push(gradient);
    return gradient;
  };
  const ctx = {
    clearCount: 0,
    fills: [], strokes: [],
    setTransform() {}, clearRect() { this.clearCount++; }, fillRect() {},
    beginPath() {}, arc() {}, fill() { this.fills.push(this.fillStyle); }, moveTo() {}, lineTo() {},
    stroke() { this.strokes.push(this.strokeStyle); }, drawImage() {},
    createRadialGradient: () => createGradient('radial'), createLinearGradient: () => createGradient('linear')
  };
  const layer = { dataset: { state: 'static' } };
  const canvas = { getContext: () => ctx, width: 0, height: 0 };
  const label = { textContent: '' };
  const attrs = {};
  const toggle = target({ hidden: true, setAttribute: (name, value) => { attrs[name] = value; }, querySelector: () => label });
  const media = target({ matches: reduced });
  const pointer = target({ matches: true });
  const document = target({
    hidden: false, documentElement: target({ dataset: theme ? { theme } : {} }),
    getElementById: id => ({ 'space-background': layer, 'space-canvas': canvas, 'space-motion-toggle': toggle })[id],
    createElement: () => ({ getContext: () => ctx })
  });
  const window = target({
    innerWidth: 1280, innerHeight: 800, devicePixelRatio: 3, scrollY: 0,
    matchMedia: query => query.includes('reduced-motion') ? media : pointer
  });
  const stored = new Map(savedPause ? [['mathbrain-space-paused', 'true']] : []);
  const localStorage = {
    getItem(key) { if (storageFails) throw Error('Unavailable'); return stored.get(key); },
    setItem(key, value) { if (storageFails) throw Error('Unavailable'); stored.set(key, value); }
  };
  const frames = new Map();
  let frameNumber = 0;
  let now = 0;
  vm.runInNewContext(source, {
    window, document, localStorage, performance: { now: () => now },
    requestAnimationFrame(callback) { frames.set(++frameNumber, callback); return frameNumber; },
    cancelAnimationFrame(id) { frames.delete(id); }
  });
  return {
    layer, canvas, toggle, attrs, label, media, document, window, stored, frames, ctx, gradients,
    get frameRequests() { return frameNumber; },
    changeTheme(nextTheme) {
      document.documentElement.dataset.theme = nextTheme;
      document.emit('mathbrain:themechange', { detail: { theme: nextTheme } });
    },
    tick(milliseconds) {
      now += milliseconds;
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) callback(now);
    }
  };
}

function colorChannels(color) {
  return color.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/)?.slice(1).join(',') || color;
}

test('La pausa detiene la animación, se guarda y permite reanudarla', () => {
  const env = environment();
  assert.equal(env.layer.dataset.state, 'running');
  assert.equal(env.frames.size, 1);
  env.toggle.emit('click');
  assert.equal(env.layer.dataset.state, 'paused');
  assert.equal(env.frames.size, 0);
  assert.equal(env.attrs['aria-pressed'], 'true');
  assert.equal(env.label.textContent, 'Reanudar fondo');
  assert.equal(env.stored.get('mathbrain-space-paused'), 'true');
  env.toggle.emit('click');
  assert.equal(env.layer.dataset.state, 'running');
  assert.equal(env.frames.size, 1);
});

test('Una pausa guardada se respeta al volver a abrir la página', () => {
  const env = environment({ savedPause: true });
  assert.equal(env.layer.dataset.state, 'paused');
  assert.equal(env.frames.size, 0);
  assert.equal(env.toggle.hidden, false);
});

test('Movimiento reducido permanece estático y responde al cambio del sistema', () => {
  const env = environment({ reduced: true });
  assert.equal(env.layer.dataset.state, 'static');
  assert.equal(env.frames.size, 0);
  assert.equal(env.toggle.hidden, true);
  env.window.emit('pointermove', { clientX: 300, clientY: 200, pointerType: 'mouse' });
  assert.equal(env.frames.size, 0);
  env.media.matches = false;
  env.media.emit('change');
  assert.equal(env.layer.dataset.state, 'running');
  assert.equal(env.frames.size, 1);
  env.media.matches = true;
  env.media.emit('change');
  assert.equal(env.layer.dataset.state, 'static');
  assert.equal(env.frames.size, 0);
});

test('Ocultar o abandonar la página cancela los fotogramas sin duplicarlos al volver', () => {
  const env = environment();
  env.document.hidden = true;
  env.document.emit('visibilitychange');
  assert.equal(env.layer.dataset.state, 'idle');
  assert.equal(env.frames.size, 0);
  env.document.hidden = false;
  env.document.emit('visibilitychange');
  env.document.emit('visibilitychange');
  assert.equal(env.frames.size, 1);
  env.window.emit('pagehide');
  assert.equal(env.frames.size, 0);
  env.window.emit('pageshow');
  assert.equal(env.frames.size, 1);
});

test('El fondo sigue funcionando si el navegador bloquea el almacenamiento', () => {
  const env = environment({ storageFails: true });
  env.toggle.emit('click');
  assert.equal(env.layer.dataset.state, 'paused');
  env.toggle.emit('click');
  assert.equal(env.layer.dataset.state, 'running');
});

test('Las estrellas y estelas se dibujan, con resolución limitada en escritorio y móvil', () => {
  const env = environment();
  assert.equal(env.canvas.width, 1920);
  env.tick(16);
  env.window.emit('pointermove', { clientX: 320, clientY: 180, pointerType: 'mouse' });
  for (let i = 0; i < 100; i++) env.tick(34);
  assert.ok(env.ctx.clearCount > 50);
  assert.equal(env.frames.size, 1);
  env.window.innerWidth = 390;
  env.window.innerHeight = 844;
  env.window.emit('resize');
  assert.equal(env.canvas.width, Math.round(390 * 1.25));
  env.tick(34);
  assert.equal(env.frames.size, 1);
});

test('Las estrellas y el brillo utilizan una paleta diferente en el tema claro', () => {
  const dark = environment({ reduced: true, theme: 'dark' });
  const light = environment({ reduced: true, theme: 'light' });
  const defaultTheme = environment({ reduced: true });
  assert.ok(dark.ctx.fills.length > 0);
  assert.ok(light.ctx.fills.length > 0);
  assert.notEqual(colorChannels(light.ctx.fills.at(-1)), colorChannels(dark.ctx.fills.at(-1)));
  assert.equal(colorChannels(defaultTheme.ctx.fills.at(-1)), colorChannels(dark.ctx.fills.at(-1)));
  assert.notDeepEqual(light.gradients.find(gradient => gradient.type === 'radial').stops,
    dark.gradients.find(gradient => gradient.type === 'radial').stops);
});

test('Cambiar de tema repinta las estrellas pausadas sin reanudar el fondo', () => {
  const env = environment({ savedPause: true, theme: 'dark' });
  const clearCount = env.ctx.clearCount;
  const fillCount = env.ctx.fills.length;
  const darkColor = colorChannels(env.ctx.fills.at(-1));
  env.changeTheme('light');
  assert.ok(env.ctx.clearCount > clearCount);
  assert.ok(env.ctx.fills.length > fillCount);
  assert.notEqual(colorChannels(env.ctx.fills.at(-1)), darkColor);
  assert.equal(env.layer.dataset.state, 'paused');
  assert.equal(env.frames.size, 0);
  assert.equal(env.frameRequests, 0);
  assert.equal(env.stored.get('mathbrain-space-paused'), 'true');
  env.changeTheme('dark');
  assert.equal(colorChannels(env.ctx.fills.at(-1)), darkColor);
  assert.equal(env.frames.size, 0);
});

test('El cambio de tema respeta movimiento reducido y repinta inmediatamente', () => {
  const env = environment({ reduced: true, theme: 'dark' });
  const clearCount = env.ctx.clearCount;
  const darkColor = colorChannels(env.ctx.fills.at(-1));
  env.changeTheme('light');
  assert.ok(env.ctx.clearCount > clearCount);
  assert.notEqual(colorChannels(env.ctx.fills.at(-1)), darkColor);
  assert.equal(env.layer.dataset.state, 'static');
  assert.equal(env.toggle.hidden, true);
  assert.equal(env.frameRequests, 0);
  env.window.emit('pointermove', { clientX: 300, clientY: 200, pointerType: 'mouse' });
  assert.equal(env.frames.size, 0);
});

test('Cambiar de tema durante la animación no inicia ni duplica fotogramas', () => {
  const env = environment({ theme: 'dark' });
  env.tick(34);
  const pendingFrames = [...env.frames.keys()];
  const frameRequests = env.frameRequests;
  const clearCount = env.ctx.clearCount;
  env.changeTheme('light');
  env.changeTheme('dark');
  assert.ok(env.ctx.clearCount > clearCount);
  assert.equal(env.layer.dataset.state, 'running');
  assert.equal(env.frameRequests, frameRequests);
  assert.deepEqual([...env.frames.keys()], pendingFrames);
  env.tick(34);
  assert.equal(env.frames.size, 1);
});
