'use strict';

const CACHE_PREFIX = 'mathbrain-shell-';
const CACHE_NAME = 'mathbrain-shell-4dcdaab21720eb80';
const APP_ROOT = new URL('./', self.location.href);
const SHELL_FILES = [
  './', './index.html', './styles.css', './space.css', './themes.css', './explore.css', './theme.js',
  './courses.js', './content.js', './library.js', './app.js', './space.js', './install.js',
  './manifest.webmanifest', './assets/mark.svg', './assets/stars.svg',
  './assets/autor-carlos.jpeg', './assets/icons/icon-192.png',
  './assets/icons/icon-512.png', './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './vendor/katex/katex.min.css',
  './vendor/katex/fonts/KaTeX_AMS-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Caligraphic-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Fraktur-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Main-Bold.woff2',
  './vendor/katex/fonts/KaTeX_Main-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Italic.woff2',
  './vendor/katex/fonts/KaTeX_Main-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Math-BoldItalic.woff2',
  './vendor/katex/fonts/KaTeX_Math-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Bold.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Italic.woff2',
  './vendor/katex/fonts/KaTeX_SansSerif-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Script-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size1-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size2-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size3-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Size4-Regular.woff2',
  './vendor/katex/fonts/KaTeX_Typewriter-Regular.woff2'
];
const SHELL_URLS = SHELL_FILES.map(filename => new URL(filename, APP_ROOT).href);
const SHELL_PATHS = new Set(SHELL_URLS.map(address => new URL(address).pathname));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_URLS)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const address = new URL(request.url);
  if (request.method !== 'GET' || address.origin !== APP_ROOT.origin || request.headers.has('range')) return;
  if (!address.pathname.startsWith(APP_ROOT.pathname)) return;
  const navigation = request.mode === 'navigate';
  if (!navigation && !SHELL_PATHS.has(address.pathname)) return;
  const cacheKey = navigation ? new URL('./index.html', APP_ROOT).href : new URL(address.pathname, APP_ROOT.origin).href;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(cacheKey);
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok) event.waitUntil(cache.put(cacheKey, response.clone()));
      return response;
    } catch {
      if (!navigation) return Response.error();
      return new Response('<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>MathBrain · Sin conexión</title><body style="background:#070b18;color:#edf3ff;font:16px/1.7 system-ui;padding:10vw"><h1>Tu universo de ideas estará aquí.</h1><p>Conéctate a internet y vuelve a abrir MathBrain para preparar el contenido de la aplicación.</p><a href="./" style="color:#8ce5df">Volver a intentar</a></body></html>', { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
    }
  })());
});
