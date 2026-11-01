(() => {
  'use strict';

  const buttons = () => [...document.querySelectorAll('[data-install], [data-try-app]')];
  const dialog = document.getElementById('install-dialog');
  if (!dialog) return;
  const nativeButton = document.getElementById('install-native');
  const feedback = document.getElementById('install-feedback');
  const offlineNote = document.getElementById('install-offline');
  const updateBanner = document.getElementById('app-update');
  const updateButton = document.getElementById('update-app');
  const standalone = window.matchMedia('(display-mode: standalone)');
  const isMobile = () => /Android|iPad|iPhone|iPod/i.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  window.ZUKA_INSTALL = { isMobile, isStandalone: () => standalone.matches || navigator.standalone === true };
  let installed = standalone.matches || navigator.standalone === true;
  let installPrompt = null;
  let prompting = false;
  let registration = null;
  let refreshRequested = false;
  let reloading = false;
  let toastTimer;
  let downloadRouteActive = false;

  function syncButtons() {
    for (const button of buttons()) {
      button.hidden = installed;
      button.disabled = prompting;
    }
    nativeButton.hidden = installed || !installPrompt;
    nativeButton.disabled = prompting;
  }

  function announce(message) {
    feedback.textContent = message;
    const toast = document.getElementById('toast');
    if (!toast) return;
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 5000);
  }

  function prepareInstructions() {
    const userAgent = navigator.userAgent || '';
    const appleMobile = /iPad|iPhone|iPod/i.test(userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const macSafari = /Macintosh/i.test(userAgent) && /Safari/i.test(userAgent) && !/Chrome|Chromium|Edg|OPR/i.test(userAgent);
    let title;
    let steps;
    let note;
    if (appleMobile) {
      title = 'En tu iPhone o iPad';
      steps = ['Abre el menú Compartir de tu navegador.', 'Elige Añadir a pantalla de inicio.', 'Activa Abrir como app web si aparece y pulsa Añadir.'];
      note = 'Si no encuentras la opción, abre esta página en Safari y utiliza su menú Compartir.';
    } else if (/Android/i.test(userAgent)) {
      title = 'En tu celular o tableta';
      steps = ['Abre el menú de tu navegador, normalmente ⋮.', 'Busca Instalar app o Añadir a pantalla de inicio.', 'Confirma para añadir Zuka con su icono a la pantalla de inicio.'];
      note = 'Si estás dentro de otra aplicación o no ves la opción, abre este sitio en Chrome. Según el navegador y el dispositivo, se añadirá como aplicación o como acceso directo.';
    } else if (macSafari) {
      title = 'En Safari para Mac';
      steps = ['Abre el menú Archivo o Compartir de Safari.', 'Elige Añadir al Dock.', 'Confirma el nombre Zuka y pulsa Añadir.'];
      note = 'Si no aparece esa opción, utiliza una versión de Safari compatible con apps web o abre este sitio en Chrome o Edge.';
    } else {
      title = 'En tu computador';
      steps = ['Abre el menú de tu navegador o busca el icono de instalación junto a la dirección.', 'Elige Instalar Zuka o la opción de instalar este sitio como aplicación.', 'Confirma la instalación para abrir Zuka en su propia ventana y con su icono.'];
      note = 'Si no aparece la instalación, prueba con un navegador compatible, como Chrome o Edge. Puedes seguir utilizando Zuka desde la web.';
    }
    document.getElementById('install-guide-title').textContent = title;
    const list = document.getElementById('install-steps');
    list.replaceChildren(...steps.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
    document.getElementById('install-note').textContent = note;
  }

  function showInstructions() {
    document.getElementById('install-phone').hidden = true;
    document.getElementById('install-device').hidden = false;
    document.getElementById('install-title').textContent = 'Instalar Zuka';
    document.getElementById('install-description').textContent = 'Zuka aparecerá con su nombre e icono en tu pantalla de inicio. Ábrela desde allí para seguir aprendiendo.';
    prepareInstructions();
    syncButtons();
    if (!dialog.open) dialog.showModal();
  }

  function showPhoneDownload() {
    const address = new URL('./', window.location.href);
    address.hash = 'descargar';
    const link = document.getElementById('install-address');
    link.href = address.href;
    link.textContent = `${address.host}${address.pathname}`;
    document.getElementById('install-title').textContent = 'Lleva Zuka a tu celular';
    document.getElementById('install-description').textContent = 'Tu próxima lección, a un escaneo de distancia.';
    document.getElementById('install-phone').hidden = false;
    document.getElementById('install-device').hidden = true;
    const note = document.getElementById('install-qr-note');
    note.textContent = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(address.hostname) ? 'Esta es una vista local. Abre la dirección pública de Zuka para escanear el QR desde otro dispositivo.' : 'Funciona en Android, iPhone y tabletas. La instalación se completa desde el navegador del dispositivo.';
    const container = document.getElementById('install-qr');
    try {
      const qr = qrcodegen.QrCode.encodeText(address.href, qrcodegen.QrCode.Ecc.MEDIUM);
      const modules = [];
      for (let y = 0; y < qr.size; y++) for (let x = 0; x < qr.size; x++) if (qr.getModule(x, y)) modules.push(`M${x + 4},${y + 4}h1v1h-1z`);
      const size = qr.size + 8;
      container.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="224" height="224" aria-hidden="true" shape-rendering="crispEdges"><path fill="#fff" d="M0,0h${size}v${size}H0z"/><path fill="#17203a" d="${modules.join('')}"/></svg>`;
    } catch {
      container.replaceChildren();
      note.textContent = 'No se pudo generar el QR. Abre el enlace en tu celular para instalar Zuka.';
    }
    if (!dialog.open) dialog.showModal();
  }

  function tryApp() {
    if (isMobile()) return requestInstallation();
    showPhoneDownload();
  }

  async function requestInstallation() {
    if (installed || prompting) return;
    if (!installPrompt) { showInstructions(); return; }
    const promptEvent = installPrompt;
    installPrompt = null;
    prompting = true;
    syncButtons();
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === 'accepted') {
        if (dialog.open) dialog.close();
        if (!installed) announce('Instalación aceptada. El navegador terminará de añadir Zuka con su icono.');
      } else {
        announce('Puedes instalar Zuka cuando quieras desde el menú de tu navegador.');
      }
    } catch {
      showInstructions();
      announce('No se pudo abrir la instalación automática. Sigue los pasos de tu navegador.');
    } finally {
      prompting = false;
      syncButtons();
    }
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    syncButtons();
  });
  window.addEventListener('appinstalled', () => {
    installed = true;
    installPrompt = null;
    if (dialog.open) dialog.close();
    syncButtons();
    announce('Zuka ya está lista. Ábrela desde su nuevo icono.');
  });
  standalone.addEventListener('change', event => {
    installed = event.matches || navigator.standalone === true;
    syncButtons();
  });
  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-try-app]')) return tryApp();
    else if (event.target.closest?.('[data-install]')) return requestInstallation();
    else if (event.target.closest?.('[data-open-app]')) dialog.close();
  });
  document.addEventListener('zuka:routechange', () => {
    syncButtons();
    const downloadRoute = window.location.hash === '#descargar';
    const enteringDownload = downloadRoute && !downloadRouteActive;
    downloadRouteActive = downloadRoute;
    if (enteringDownload) isMobile() ? showInstructions() : showPhoneDownload();
  });
  nativeButton.addEventListener('click', requestInstallation);
  document.getElementById('close-install').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });

  function offerUpdate() {
    if (registration.waiting && navigator.serviceWorker.controller) updateBanner.hidden = false;
  }

  function offlineReady() {
    offlineNote.textContent = 'El contenido ya está preparado para usar las explicaciones, los ejercicios y las simulaciones sin conexión. Los vídeos externos necesitan internet.';
  }

  function observeWorker(worker) {
    if (!worker) return;
    const updateState = () => {
      if (worker.state === 'activated') offlineReady();
      if (worker.state === 'installed') offerUpdate();
      if (worker.state === 'redundant' && !navigator.serviceWorker.controller) {
        offlineNote.textContent = 'El contenido sin conexión aún no está preparado. Vuelve a abrir Zuka con conexión para intentarlo de nuevo.';
        feedback.textContent = 'No se pudo completar la descarga del contenido. Puedes seguir utilizando la web con conexión.';
      }
    };
    worker.addEventListener('statechange', updateState);
    updateState();
  }

  async function prepareOfflineApp() {
    if (!('serviceWorker' in navigator)) {
      offlineNote.textContent = 'Puedes utilizar Zuka en línea. Este navegador no permite preparar el contenido sin conexión.';
      return;
    }
    if (!window.isSecureContext) {
      offlineNote.textContent = 'Abre la versión HTTPS de Zuka para preparar el contenido sin conexión y utilizar la instalación del navegador.';
      return;
    }
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      if (registration.active?.state === 'activated') offlineReady();
      observeWorker(registration.installing);
      offerUpdate();
      registration.addEventListener('updatefound', () => observeWorker(registration.installing));
    } catch {
      offlineNote.textContent = 'El contenido sin conexión aún no está preparado. Vuelve a abrir Zuka con conexión para intentarlo de nuevo.';
      feedback.textContent = 'No se pudo preparar el uso sin conexión. Puedes seguir navegando y volver a intentarlo al abrir Zuka.';
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (navigator.serviceWorker.controller) offlineReady();
      if (refreshRequested && !reloading) { reloading = true; window.location.reload(); }
    });
  }
  updateButton.addEventListener('click', () => {
    if (!registration?.waiting) { updateBanner.hidden = true; return; }
    refreshRequested = true;
    updateButton.disabled = true;
    registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
  });
  document.getElementById('dismiss-update').addEventListener('click', () => { updateBanner.hidden = true; });
  syncButtons();
  if (document.readyState === 'complete') prepareOfflineApp();
  else window.addEventListener('load', prepareOfflineApp, { once: true });
})();
