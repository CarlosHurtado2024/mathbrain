const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const zlib = require('node:zlib');
const { execFileSync } = require('node:child_process');

const directory = path.resolve(__dirname, '../dist');
const workerSource = fs.readFileSync(path.join(directory, 'sw.js'), 'utf8');
const appRoot = 'https://mathbrain.test/';

function environment({ root = appRoot, network = async () => { throw new Error('Sin conexión'); }, initial = {} } = {}) {
  const listeners = new Map();
  const stores = new Map(Object.entries(initial).map(([name, entries]) => [name, new Map(entries)]));
  const calls = { fetched: [], added: [], deleted: [], skipped: 0, claimed: 0 };
  const keyFor = value => new URL(typeof value === 'string' ? value : value.url, root).href;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(addresses) {
          calls.added.push([...addresses]);
          const responses = await Promise.all(addresses.map(async address => {
            const response = await network(address);
            if (!response.ok) throw new Error(`No se pudo guardar ${address}`);
            return response;
          }));
          addresses.forEach((address, index) => store.set(keyFor(address), responses[index].clone()));
        },
        async match(address) { return store.get(keyFor(address))?.clone(); },
        async put(address, response) { store.set(keyFor(address), response.clone()); }
      };
    },
    async keys() { return [...stores.keys()]; },
    async delete(name) { calls.deleted.push(name); return stores.delete(name); }
  };
  const self = {
    location: { href: new URL('sw.js', root).href },
    clients: { async claim() { calls.claimed++; } },
    async skipWaiting() { calls.skipped++; },
    addEventListener(name, handler) { listeners.set(name, handler); }
  };
  const context = vm.createContext({
    self, caches, URL, Response,
    async fetch(request) { calls.fetched.push(request); return network(request); }
  });
  vm.runInContext(workerSource, context);
  const state = vm.runInContext('({ cacheName: CACHE_NAME, shellUrls: SHELL_URLS })', context);
  return {
    ...state, stores, calls,
    async emit(name, properties = {}) {
      const pending = [];
      let response;
      listeners.get(name)({
        ...properties,
        waitUntil(promise) { pending.push(Promise.resolve(promise)); },
        respondWith(promise) { response = Promise.resolve(promise); }
      });
      const result = await response;
      await Promise.all(pending);
      return result;
    },
    async seed(address, contents, name = state.cacheName) {
      const cache = await caches.open(name);
      await cache.put(address, new Response(contents));
    }
  };
}

function request(address, { mode = 'cors', method = 'GET', headers = {} } = {}) {
  return { url: new URL(address, appRoot).href, mode, method, headers: new Headers(headers) };
}

function pngDetails(filename) {
  const contents = fs.readFileSync(filename);
  assert.deepEqual(contents.subarray(0, 8), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  assert.equal(contents.toString('ascii', 12, 16), 'IHDR');
  const width = contents.readUInt32BE(16);
  const height = contents.readUInt32BE(20);
  const channels = { 2: 3, 6: 4 }[contents[25]];
  assert.equal(contents[24], 8, 'Los iconos usan ocho bits por canal');
  assert.ok(channels, 'Los iconos son PNG RGB o RGBA');
  assert.equal(contents[28], 0, 'Los iconos no están entrelazados');
  const compressed = [];
  let ended = false;
  for (let offset = 8; offset < contents.length;) {
    const length = contents.readUInt32BE(offset);
    const type = contents.toString('ascii', offset + 4, offset + 8);
    if (type === 'IDAT') compressed.push(contents.subarray(offset + 8, offset + 8 + length));
    if (type === 'IEND') ended = true;
    offset += length + 12;
  }
  assert.ok(ended, 'El PNG incluye su bloque final');
  assert.equal(zlib.inflateSync(Buffer.concat(compressed)).length, height * (width * channels + 1));
  return { width, height };
}

test('El manifiesto instala MathBrain como aplicación con iconos PNG válidos y accesos locales', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'manifest.webmanifest'), 'utf8'));
  assert.equal(manifest.name, 'MathBrain');
  assert.equal(manifest.short_name, 'MathBrain');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.lang, 'es');
  assert.notEqual(manifest.prefer_related_applications, true);
  for (const member of ['id', 'start_url', 'scope']) assert.equal(new URL(manifest[member], appRoot).href, appRoot);
  for (const size of [192, 512]) assert.ok(manifest.icons.some(icon => icon.sizes === `${size}x${size}` && icon.purpose === 'any'));
  assert.ok(manifest.icons.some(icon => icon.purpose === 'maskable'));
  for (const icon of manifest.icons) {
    const address = new URL(icon.src, appRoot);
    assert.equal(address.origin, new URL(appRoot).origin);
    assert.equal(icon.type, 'image/png');
    const dimensions = pngDetails(path.join(directory, address.pathname));
    assert.equal(icon.sizes, `${dimensions.width}x${dimensions.height}`);
  }
  assert.deepEqual(pngDetails(path.join(directory, 'assets/icons/apple-touch-icon.png')), { width: 180, height: 180 });
  for (const shortcut of manifest.shortcuts) assert.equal(new URL(shortcut.url, appRoot).origin, new URL(appRoot).origin);
});

test('La instalación prepara únicamente archivos locales existentes, incluyendo el catálogo y sus iconos', async () => {
  const env = environment({ network: async () => new Response('contenido') });
  await env.emit('install');
  assert.equal(env.calls.added.length, 1);
  const addresses = env.calls.added[0];
  for (const address of addresses) {
    const parsed = new URL(address);
    assert.equal(parsed.origin, new URL(appRoot).origin);
    assert.ok(fs.statSync(path.join(directory, parsed.pathname === '/' ? 'index.html' : parsed.pathname)).isFile(), address);
  }
  for (const filename of ['index.html', 'app.js', 'library.js', 'courses.js', 'space.js', 'install.js', 'manifest.webmanifest', 'assets/icons/icon-192.png', 'assets/icons/icon-512.png']) {
    assert.ok(addresses.includes(new URL(filename, appRoot).href), filename);
  }
  assert.equal(env.stores.get(env.cacheName).size, addresses.length);
  assert.equal(env.calls.skipped, 0);
  assert.equal(env.calls.claimed, 0);
});

test('La foto del autor está identificada y disponible sin conexión', async () => {
  const html = fs.readFileSync(path.join(directory, 'index.html'), 'utf8');
  const photoTag = html.match(/<img\b[^>]*src="assets\/autor-carlos\.jpeg"[^>]*>/);
  assert.ok(photoTag);
  assert.match(photoTag[0], /alt="Carlos Hurtado, autor de MathBrain"/);
  const photo = fs.readFileSync(path.join(directory, 'assets/autor-carlos.jpeg'));
  assert.deepEqual(photo.subarray(0, 2), Buffer.from([255, 216]));
  assert.deepEqual(photo.subarray(-2), Buffer.from([255, 217]));
  const env = environment();
  assert.ok(env.shellUrls.includes(new URL('assets/autor-carlos.jpeg', appRoot).href));
  await env.seed('assets/autor-carlos.jpeg', photo);
  const response = await env.emit('fetch', { request: request('assets/autor-carlos.jpeg') });
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), photo);
  assert.equal(env.calls.fetched.length, 0);
});

test('Un fallo del precache rechaza la instalación completa y conserva la versión anterior', async () => {
  const previousCache = 'mathbrain-shell-previous';
  const env = environment({
    initial: { [previousCache]: [[new URL('index.html', appRoot).href, new Response('versión anterior')]] },
    network: async address => new Response('contenido', { status: address.endsWith('app.js') ? 503 : 200 })
  });
  await assert.rejects(env.emit('install'), /No se pudo guardar/);
  assert.equal(env.stores.get(env.cacheName).size, 0);
  assert.equal(env.stores.get(previousCache).size, 1);
  assert.equal(env.calls.skipped, 0);
  assert.equal(env.calls.claimed, 0);
});

test('La activación elimina solo caches antiguas propias y reclama los clientes', async () => {
  const env = environment({ initial: { 'mathbrain-shell-previous': [], 'mathbrain-preferences': [], 'other-app-shell-old': [] } });
  await env.seed('index.html', 'versión actual');
  await env.emit('activate');
  assert.deepEqual(env.calls.deleted, ['mathbrain-shell-previous']);
  assert.ok(env.stores.has(env.cacheName));
  assert.ok(env.stores.has('mathbrain-preferences'));
  assert.ok(env.stores.has('other-app-shell-old'));
  assert.equal(env.calls.claimed, 1);
  assert.equal(env.calls.skipped, 0);
});

test('Las rutas de contenido y los assets precargados abren sin conexión', async () => {
  const env = environment();
  await env.seed('index.html', '<html>Biblioteca de MathBrain</html>');
  await env.seed('library.js', 'const catalogo = true;');
  const navigation = await env.emit('fetch', { request: request('/#contenido/sim-derivada', { mode: 'navigate' }) });
  const asset = await env.emit('fetch', { request: request('/library.js?version=nueva') });
  assert.equal(await navigation.text(), '<html>Biblioteca de MathBrain</html>');
  assert.equal(await asset.text(), 'const catalogo = true;');
  assert.equal(env.calls.fetched.length, 0);
});

test('Un recurso local ausente se descarga y guarda para la siguiente apertura offline', async () => {
  let connected = true;
  const env = environment({ network: async () => {
    if (!connected) throw new Error('Sin conexión');
    return new Response('catálogo descargado');
  } });
  const online = await env.emit('fetch', { request: request('/library.js') });
  assert.equal(await online.text(), 'catálogo descargado');
  connected = false;
  const offline = await env.emit('fetch', { request: request('/library.js') });
  assert.equal(await offline.text(), 'catálogo descargado');
  assert.equal(env.calls.fetched.length, 1);
});

test('Las respuestas de error de la red no se guardan como parte del shell', async () => {
  const env = environment({ network: async () => new Response('No encontrado', { status: 404 }) });
  const response = await env.emit('fetch', { request: request('/app.js') });
  assert.equal(response.status, 404);
  assert.equal(env.stores.get(env.cacheName).size, 0);
});

test('Sin precache ni red se muestra ayuda en navegación y se rechazan assets ausentes', async () => {
  const env = environment();
  const navigation = await env.emit('fetch', { request: request('/', { mode: 'navigate' }) });
  assert.equal(navigation.status, 503);
  assert.match(navigation.headers.get('Content-Type'), /^text\/html/);
  assert.match(await navigation.text(), /Conéctate a internet/);
  const asset = await env.emit('fetch', { request: request('/app.js') });
  assert.equal(asset.type, 'error');
});

test('No se interceptan terceros, escrituras, rangos ni archivos ajenos al shell', async () => {
  const env = environment();
  const ignored = [
    request('https://fonts.googleapis.com/css2?family=DM+Sans'),
    request('/app.js', { method: 'POST' }),
    request('/app.js', { method: 'HEAD' }),
    request('/app.js', { headers: { Range: 'bytes=0-10' } }),
    request('/assets/video.mp4'),
    request('/api/profile')
  ];
  for (const incoming of ignored) assert.equal(await env.emit('fetch', { request: incoming }), undefined);
  assert.equal(env.calls.fetched.length, 0);
  assert.equal(env.stores.size, 0);
});

test('El worker respeta su subdirectorio y sirve la página de inicio correcta', async () => {
  const root = 'https://mathbrain.test/aprender/';
  const env = environment({ root });
  await env.seed(new URL('index.html', root).href, 'MathBrain en subdirectorio');
  assert.equal(await env.emit('fetch', { request: request('/otra-app/', { mode: 'navigate' }) }), undefined);
  const response = await env.emit('fetch', { request: request('/aprender/#explorar', { mode: 'navigate' }) });
  assert.equal(await response.text(), 'MathBrain en subdirectorio');
});

test('La actualización solo salta la espera al recibir el mensaje explícito de activación', async () => {
  const env = environment();
  await env.emit('message', { data: { type: 'OTHER_MESSAGE' } });
  await env.emit('message', { data: null });
  assert.equal(env.calls.skipped, 0);
  await env.emit('message', { data: { type: 'ACTIVATE_UPDATE' } });
  assert.equal(env.calls.skipped, 1);
});

test('El builder conserva la versión al repetirse y la cambia al modificar un asset', context => {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'mathbrain-pwa-test-'));
  context.after(() => fs.rmSync(temporary, { recursive: true, force: true }));
  fs.mkdirSync(path.join(temporary, 'scripts'));
  fs.mkdirSync(path.join(temporary, 'dist/assets'), { recursive: true });
  const builder = path.join(temporary, 'scripts/build-pwa.cjs');
  const worker = path.join(temporary, 'dist/sw.js');
  const html = path.join(temporary, 'dist/index.html');
  fs.copyFileSync(path.join(__dirname, '../scripts/build-pwa.cjs'), builder);
  fs.writeFileSync(worker, workerSource);
  fs.writeFileSync(html, '<html>MathBrain</html>\n');
  fs.writeFileSync(path.join(temporary, 'dist/assets/icon.png'), Buffer.from([137, 80, 78, 71]));
  const build = () => {
    execFileSync(process.execPath, [builder], { cwd: temporary, stdio: 'pipe' });
    return fs.readFileSync(worker, 'utf8');
  };
  const first = build();
  assert.match(first, /const CACHE_NAME = 'mathbrain-shell-[a-f0-9]{16}';/);
  assert.equal(build(), first);
  fs.writeFileSync(html, '<html>MathBrain</html>\r\n');
  assert.equal(build(), first);
  fs.writeFileSync(path.join(temporary, 'dist/assets/icon.png'), Buffer.from([137, 80, 78, 71, 1]));
  const changed = build();
  assert.notEqual(changed, first);
  assert.equal(build(), changed);
});
