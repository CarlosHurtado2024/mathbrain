const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../dist/install.js'), 'utf8');
const qrSource = fs.readFileSync(path.join(__dirname, '../dist/vendor/qrcode/qrcodegen.js'), 'utf8');

function environment({ userAgent = 'Chrome Windows', platform = 'Win32', maxTouchPoints = 0, standalone = false, navigatorStandalone = false, serviceWorker = true, secure = true, controlled = false, waiting = false, registerFails = false, readyState = 'loading', installingState = null, activeState = null, address = 'https://zuka.test/app/' } = {}) {
  const target = extra => {
    const listeners = new Map();
    return Object.assign({
      addEventListener(name, listener, options = {}) {
        const entries = listeners.get(name) || [];
        entries.push({ listener, once: options.once === true });
        listeners.set(name, entries);
      },
      emit(name, value = {}) {
        const entries = listeners.get(name) || [];
        listeners.set(name, entries.filter(entry => !entry.once));
        return Promise.all(entries.map(entry => entry.listener(value)));
      }
    }, extra);
  };
  const classes = new Set();
  const elements = new Map([
    'install-dialog', 'install-native', 'install-feedback', 'app-update', 'update-app',
    'install-guide-title', 'install-steps', 'install-note', 'install-offline', 'close-install', 'dismiss-update', 'toast',
    'install-phone', 'install-device', 'install-title', 'install-description', 'install-qr', 'install-address', 'install-qr-note'
  ].map(id => [id, target({
    hidden: id === 'install-native' || id === 'app-update', disabled: false, textContent: '',
    children: [], replaceChildren(...children) { this.children = children; },
    classList: { add: name => classes.add(name), remove: name => classes.delete(name) }
  })]));
  const dialog = elements.get('install-dialog');
  Object.assign(dialog, {
    open: false,
    showModal() { this.open = true; },
    close() { this.open = false; },
    getBoundingClientRect: () => ({ left: 100, right: 500, top: 100, bottom: 500 })
  });
  const buttons = [target({ hidden: false, disabled: false }), target({ hidden: false, disabled: false })];
  const tryButton = target({ hidden: false, disabled: false });
  for (const button of [...buttons, tryButton]) {
    button.closest = selector => selector === (button === tryButton ? '[data-try-app]' : '[data-install]') ? button : null;
    button.emit = (name, event = {}) => document.emit(name, { target: button, ...event });
  }
  const media = target({ matches: standalone });
  const worker = target({ state: installingState || 'installed', messages: [], postMessage(message) { this.messages.push(message); } });
  const registration = target({ waiting: waiting ? worker : null, installing: installingState ? worker : null, active: activeState ? { state: activeState } : null });
  const registerCalls = [];
  const serviceWorkerContainer = target({
    controller: controlled ? {} : null,
    async register(url, options) {
      registerCalls.push({ url, options });
      if (registerFails) throw new Error('Unavailable');
      return registration;
    }
  });
  const navigator = { userAgent, platform, maxTouchPoints, standalone: navigatorStandalone };
  if (serviceWorker) navigator.serviceWorker = serviceWorkerContainer;
  let reloadCount = 0;
  const window = target({
    isSecureContext: secure,
    matchMedia: () => media,
    location: { href: address, hash: new URL(address).hash, reload() { reloadCount++; } }
  });
  const document = target({
    readyState,
    querySelectorAll: () => [...buttons, tryButton],
    getElementById: id => elements.get(id),
    createElement: tagName => ({ tagName, textContent: '' })
  });
  const timers = new Map();
  let timerNumber = 0;
  const context = vm.createContext({
    window, document, navigator, URL,
    setTimeout(callback) { timers.set(++timerNumber, callback); return timerNumber; },
    clearTimeout(timer) { timers.delete(timer); }
  });
  vm.runInContext(qrSource, context);
  const encodedQr = [];
  const encodeText = context.qrcodegen.QrCode.encodeText;
  context.qrcodegen.QrCode.encodeText = function (text, ...options) {
    encodedQr.push(text);
    return encodeText.call(this, text, ...options);
  };
  vm.runInContext(source, context);
  return {
    buttons, tryButton, document, dialog, elements, media, window, registration, worker, registerCalls, serviceWorkerContainer, encodedQr,
    get reloadCount() { return reloadCount; },
    offerPrompt({ outcome = 'dismissed', promptFails = false, promptPromise, choicePromise } = {}) {
      const event = {
        prevented: false, calls: 0,
        preventDefault() { this.prevented = true; },
        prompt() {
          this.calls++;
          if (promptFails) return Promise.reject(new Error('Unavailable'));
          return promptPromise || Promise.resolve();
        },
        userChoice: choicePromise || Promise.resolve({ outcome })
      };
      window.emit('beforeinstallprompt', event);
      return event;
    }
  };
}

test('Probar desde computador muestra el QR público y no consume la invitación de instalación', async () => {
  const env = environment({ address: 'https://zuka.test/campus/?token=privado#perfil' });
  const invitation = env.offerPrompt();
  await env.tryButton.emit('click');
  assert.equal(env.dialog.open, true);
  assert.equal(invitation.calls, 0);
  assert.equal(env.elements.get('install-phone').hidden, false);
  assert.equal(env.elements.get('install-device').hidden, true);
  assert.equal(env.elements.get('install-address').href, 'https://mathbrain-psi.vercel.app/#descargar');
  assert.deepEqual(env.encodedQr, ['https://mathbrain-psi.vercel.app/#descargar']);
  const svg = env.elements.get('install-qr').innerHTML;
  assert.match(svg, /viewBox="0 0 \d+ \d+"/);
  assert.match(svg, /shape-rendering="crispEdges"/);
  assert.ok((svg.match(/h1v1h-1z/g) || []).length > 100, 'El código contiene una matriz QR real');
  const modules = [...svg.matchAll(/M(\d+),(\d+)h1v1h-1z/g)];
  assert.ok(modules.every(match => Number(match[1]) >= 4 && Number(match[2]) >= 4), 'El QR conserva una zona blanca de cuatro módulos');
});

test('Probar desde Android utiliza la instalación nativa y, sin ella, muestra los pasos del dispositivo', async () => {
  const env = environment({ userAgent: 'Mozilla/5.0 Android Chrome' });
  assert.equal(env.window.ZUKA_INSTALL.isMobile(), true);
  const invitation = env.offerPrompt({ outcome: 'dismissed' });
  await env.tryButton.emit('click');
  assert.equal(invitation.calls, 1);
  await env.tryButton.emit('click');
  assert.equal(env.elements.get('install-device').hidden, false);
  assert.equal(env.elements.get('install-phone').hidden, true);
  assert.equal(env.elements.get('install-guide-title').textContent, 'En tu celular o tableta');
});

test('El enlace del QR abre la guía para iPad y los botones nuevos funcionan después de navegar', async () => {
  const env = environment({ userAgent: 'Mozilla/5.0 Macintosh Safari', platform: 'MacIntel', maxTouchPoints: 5, address: 'https://zuka.test/#descargar' });
  assert.equal(env.window.ZUKA_INSTALL.isMobile(), true);
  await env.document.emit('zuka:routechange');
  assert.equal(env.dialog.open, true);
  assert.equal(env.elements.get('install-guide-title').textContent, 'En tu iPhone o iPad');
  env.dialog.close();
  const dynamicButton = { closest: selector => selector === '[data-try-app]' ? dynamicButton : null };
  await env.document.emit('click', { target: dynamicButton });
  assert.equal(env.dialog.open, true);
});

test('El QR siempre codifica producción, incluso desde localhost, subcarpetas o vistas previas protegidas', async () => {
  for (const address of [
    'http://localhost:4177/',
    'http://127.0.0.1:4180/#perfil',
    'https://mathbrain-git-preview-equipo.vercel.app/?token=privado#perfil',
    'https://mathbrain-deployment-equipo.vercel.app/campus/?token=privado#descargar',
    'https://mathbrain-psi.vercel.app/?campana=prueba#perfil'
  ]) {
    const env = environment({ address });
    await env.tryButton.emit('click');
    assert.equal(env.elements.get('install-address').href, 'https://mathbrain-psi.vercel.app/#descargar', address);
    assert.deepEqual(env.encodedQr, ['https://mathbrain-psi.vercel.app/#descargar'], 'La matriz QR debe codificar el mismo destino público que el enlace');
    assert.equal(env.elements.get('install-address').textContent, 'mathbrain-psi.vercel.app/');
    assert.doesNotMatch(env.elements.get('install-qr-note').textContent, /vista local|dirección pública/);
  }
});

test('Cerrar la descarga se respeta al cambiar tema; salir y volver permite abrirla de nuevo', async () => {
  for (const userAgent of ['Android Chrome', 'Chrome Windows']) {
    const env = environment({ userAgent, address: 'https://zuka.test/#descargar' });
    await env.document.emit('zuka:routechange');
    assert.equal(env.dialog.open, true);
    await env.elements.get('close-install').emit('click');
    assert.equal(env.dialog.open, false);
    // El cambio de tema vuelve a dibujar la misma ruta y emite este evento.
    await env.document.emit('zuka:routechange');
    assert.equal(env.dialog.open, false, 'Redibujar no debe repetir la invitación');
    env.window.location.hash = '#inicio';
    await env.document.emit('zuka:routechange');
    env.window.location.hash = '#descargar';
    await env.document.emit('zuka:routechange');
    assert.equal(env.dialog.open, true, 'Una nueva visita a la ruta sí abre la descarga');
  }
});

const platforms = [
  { name: 'iPhone', userAgent: 'Mozilla/5.0 (iPhone) AppleWebKit Safari', title: 'En tu iPhone o iPad', step: /pantalla de inicio/ },
  { name: 'iPad', userAgent: 'Mozilla/5.0 (iPad) AppleWebKit Safari', title: 'En tu iPhone o iPad', step: /pantalla de inicio/ },
  { name: 'iPad con agente de escritorio', userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit Safari', platform: 'MacIntel', maxTouchPoints: 5, title: 'En tu iPhone o iPad', step: /pantalla de inicio/ },
  { name: 'Safari de Mac', userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit Version/17 Safari', title: 'En Safari para Mac', step: /Añadir al Dock/ },
  { name: 'Android', userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome Safari', title: 'En tu celular o tableta', step: /Instalar app/ },
  { name: 'Chrome de escritorio', userAgent: 'Mozilla/5.0 (Macintosh) AppleWebKit Chrome Safari', title: 'En tu computador', step: /Instalar Zuka/ }
];

for (const platform of platforms) {
  test(`Sin invitación nativa, ${platform.name} muestra instrucciones y no simula una instalación`, async () => {
    const env = environment(platform);
    assert.equal(env.dialog.open, false);
    assert.equal(env.elements.get('install-native').hidden, true);
    await env.buttons[0].emit('click');
    assert.equal(env.dialog.open, true);
    assert.equal(env.elements.get('install-guide-title').textContent, platform.title);
    assert.equal(env.elements.get('install-steps').children.length, 3);
    assert.ok(env.elements.get('install-steps').children.some(step => platform.step.test(step.textContent)));
    assert.equal(env.elements.get('install-feedback').textContent, '');
    assert.ok(env.buttons.every(button => !button.hidden && !button.disabled));
  });
}

test('La invitación nativa espera un clic y se consume una sola vez aunque se pulse repetidamente', async () => {
  const env = environment();
  let finishPrompt;
  const promptPromise = new Promise(resolve => { finishPrompt = resolve; });
  const invitation = env.offerPrompt({ promptPromise });
  assert.equal(invitation.prevented, true);
  assert.equal(invitation.calls, 0);
  assert.equal(env.elements.get('install-native').hidden, false);
  const request = env.buttons[0].emit('click');
  assert.equal(invitation.calls, 1);
  assert.ok(env.buttons.every(button => button.disabled));
  await env.buttons[1].emit('click');
  assert.equal(invitation.calls, 1);
  finishPrompt();
  await request;
  assert.ok(env.buttons.every(button => !button.disabled));
  assert.equal(env.elements.get('install-native').hidden, true);
  await env.buttons[1].emit('click');
  assert.equal(invitation.calls, 1);
  assert.equal(env.dialog.open, true);
});

test('Rechazar la instalación conserva los accesos y permite recibir una nueva invitación', async () => {
  const env = environment();
  env.offerPrompt({ outcome: 'dismissed' });
  await env.buttons[0].emit('click');
  assert.match(env.elements.get('install-feedback').textContent, /cuando quieras/);
  assert.ok(env.buttons.every(button => !button.hidden));
  const nextInvitation = env.offerPrompt({ outcome: 'dismissed' });
  await env.buttons[1].emit('click');
  assert.equal(nextInvitation.calls, 1);
});

test('Aceptar la invitación cierra la ayuda y espera appinstalled antes de ocultar los accesos', async () => {
  const env = environment();
  await env.buttons[0].emit('click');
  env.offerPrompt({ outcome: 'accepted' });
  await env.elements.get('install-native').emit('click');
  assert.equal(env.dialog.open, false);
  assert.match(env.elements.get('install-feedback').textContent, /Instalación aceptada/);
  assert.ok(env.buttons.every(button => !button.hidden));
  await env.window.emit('appinstalled');
  assert.ok(env.buttons.every(button => button.hidden));
  assert.equal(env.elements.get('install-native').hidden, true);
  assert.match(env.elements.get('install-feedback').textContent, /ya está lista/);
});

test('appinstalled cierra cualquier ayuda abierta y descarta una invitación pendiente', async () => {
  const env = environment();
  await env.buttons[0].emit('click');
  const invitation = env.offerPrompt();
  await env.window.emit('appinstalled');
  await env.buttons[0].emit('click');
  assert.equal(env.dialog.open, false);
  assert.equal(invitation.calls, 0);
  assert.ok(env.buttons.every(button => button.hidden));
});

for (const settings of [{ standalone: true }, { navigatorStandalone: true }]) {
  test(`Abrir la app en modo ${settings.standalone ? 'standalone' : 'independiente de iOS'} oculta la instalación`, async () => {
    const env = environment(settings);
    const invitation = env.offerPrompt();
    await env.buttons[0].emit('click');
    assert.ok(env.buttons.every(button => button.hidden));
    assert.equal(env.elements.get('install-native').hidden, true);
    assert.equal(env.dialog.open, false);
    assert.equal(invitation.calls, 0);
  });
}

test('Cambiar al modo standalone actualiza los accesos de instalación', async () => {
  const env = environment();
  await env.media.emit('change', { matches: true });
  assert.ok(env.buttons.every(button => button.hidden));
  await env.media.emit('change', { matches: false });
  assert.ok(env.buttons.every(button => !button.hidden));
});

test('Un fallo de la invitación muestra ayuda y recupera los botones', async () => {
  const env = environment({ userAgent: 'Android Chrome' });
  const invitation = env.offerPrompt({ promptFails: true });
  await env.buttons[0].emit('click');
  assert.equal(invitation.calls, 1);
  assert.equal(env.dialog.open, true);
  assert.equal(env.elements.get('install-guide-title').textContent, 'En tu celular o tableta');
  assert.match(env.elements.get('install-feedback').textContent, /No se pudo abrir/);
  assert.ok(env.buttons.every(button => !button.disabled));
  assert.equal(env.elements.get('install-native').hidden, true);
});

test('La ayuda puede cerrarse con su botón o pulsando fuera del diálogo', async () => {
  const env = environment();
  await env.buttons[0].emit('click');
  await env.dialog.emit('click', { clientX: 200, clientY: 200 });
  assert.equal(env.dialog.open, true);
  await env.elements.get('close-install').emit('click');
  assert.equal(env.dialog.open, false);
  await env.buttons[0].emit('click');
  await env.dialog.emit('click', { clientX: 20, clientY: 20 });
  assert.equal(env.dialog.open, false);
});

test('El service worker se registra sin caché de actualización y su primera activación no recarga', async () => {
  const env = environment();
  assert.equal(env.registerCalls.length, 0);
  await env.window.emit('load');
  assert.equal(env.registerCalls.length, 1);
  assert.equal(env.registerCalls[0].url, './sw.js');
  assert.equal(env.registerCalls[0].options.updateViaCache, 'none');
  await env.serviceWorkerContainer.emit('controllerchange');
  assert.equal(env.reloadCount, 0);
  assert.equal(env.elements.get('app-update').hidden, true);
});

test('Una actualización espera el clic de confirmación y recarga solo una vez al activarse', async () => {
  const env = environment({ controlled: true, waiting: true });
  await env.window.emit('load');
  assert.equal(env.elements.get('app-update').hidden, false);
  assert.equal(env.worker.messages.length, 0);
  await env.serviceWorkerContainer.emit('controllerchange');
  assert.equal(env.reloadCount, 0);
  await env.elements.get('update-app').emit('click');
  assert.equal(env.worker.messages.length, 1);
  assert.equal(env.worker.messages[0].type, 'ACTIVATE_UPDATE');
  assert.equal(env.elements.get('update-app').disabled, true);
  assert.equal(env.reloadCount, 0);
  await env.serviceWorkerContainer.emit('controllerchange');
  await env.serviceWorkerContainer.emit('controllerchange');
  assert.equal(env.reloadCount, 1);
});

test('Un worker nuevo ofrece la actualización cuando termina y permite posponerla', async () => {
  const env = environment({ controlled: true });
  await env.window.emit('load');
  env.registration.installing = env.worker;
  env.worker.state = 'installing';
  await env.registration.emit('updatefound');
  await env.worker.emit('statechange');
  assert.equal(env.elements.get('app-update').hidden, true);
  env.registration.waiting = env.worker;
  env.worker.state = 'installed';
  await env.worker.emit('statechange');
  assert.equal(env.elements.get('app-update').hidden, false);
  await env.elements.get('dismiss-update').emit('click');
  assert.equal(env.elements.get('app-update').hidden, true);
  assert.equal(env.worker.messages.length, 0);
  assert.equal(env.reloadCount, 0);
});

test('Un worker de primera instalación no presenta una actualización', async () => {
  const env = environment({ waiting: true });
  await env.window.emit('load');
  assert.equal(env.elements.get('app-update').hidden, true);
  assert.equal(env.worker.messages.length, 0);
  await env.serviceWorkerContainer.emit('controllerchange');
  assert.equal(env.reloadCount, 0);
});

test('Sin soporte o contexto seguro no se intenta registrar el service worker', async () => {
  for (const settings of [{ serviceWorker: false }, { secure: false }]) {
    const env = environment(settings);
    await env.window.emit('load');
    assert.equal(env.registerCalls.length, 0);
    await env.buttons[0].emit('click');
    assert.equal(env.dialog.open, true);
  }
});

test('Un registro fallido informa del problema sin bloquear la ayuda de instalación', async () => {
  const env = environment({ registerFails: true });
  await env.window.emit('load');
  assert.match(env.elements.get('install-feedback').textContent, /No se pudo preparar/);
  await env.buttons[0].emit('click');
  assert.equal(env.dialog.open, true);
});

test('Un precaché inicial fallido no anuncia contenido sin conexión aunque el registro termine', async () => {
  const env = environment({ installingState: 'installing' });
  await env.window.emit('load');
  assert.equal(env.registerCalls.length, 1);
  assert.doesNotMatch(env.elements.get('install-offline').textContent, /ya está preparado/);
  env.worker.state = 'redundant';
  await env.worker.emit('statechange');
  assert.match(env.elements.get('install-offline').textContent, /aún no está preparado/);
  assert.match(env.elements.get('install-feedback').textContent, /No se pudo completar la descarga/);
  assert.equal(env.reloadCount, 0);
});

test('La primera activación confirma el contenido sin conexión sin recargar la página', async () => {
  const env = environment({ installingState: 'installing' });
  await env.window.emit('load');
  assert.doesNotMatch(env.elements.get('install-offline').textContent, /ya está preparado/);
  env.worker.state = 'activated';
  await env.worker.emit('statechange');
  assert.match(env.elements.get('install-offline').textContent, /ya está preparado/);
  assert.match(env.elements.get('install-offline').textContent, /vídeos externos necesitan internet/);
  assert.equal(env.reloadCount, 0);
  assert.equal(env.elements.get('app-update').hidden, true);
});

test('Un worker ya activado informa que el contenido sin conexión está preparado', async () => {
  const env = environment({ activeState: 'activated', controlled: true });
  await env.window.emit('load');
  assert.match(env.elements.get('install-offline').textContent, /ya está preparado/);
  assert.equal(env.reloadCount, 0);
});

test('controllerchange confirma el contenido solo cuando hay un controlador y no recarga inicialmente', async () => {
  const env = environment();
  await env.window.emit('load');
  await env.serviceWorkerContainer.emit('controllerchange');
  assert.doesNotMatch(env.elements.get('install-offline').textContent, /ya está preparado/);
  env.serviceWorkerContainer.controller = {};
  await env.serviceWorkerContainer.emit('controllerchange');
  assert.match(env.elements.get('install-offline').textContent, /ya está preparado/);
  assert.equal(env.reloadCount, 0);
});
