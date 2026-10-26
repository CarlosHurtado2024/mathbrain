(() => {
  'use strict';

  const buttons = [...document.querySelectorAll('[data-install]')];
  const dialog = document.getElementById('install-dialog');
  if (!buttons.length || !dialog) return;
  const nativeButton = document.getElementById('install-native');
  const feedback = document.getElementById('install-feedback');
  const offlineNote = document.getElementById('install-offline');
  const updateBanner = document.getElementById('app-update');
  const updateButton = document.getElementById('update-app');
  const standalone = window.matchMedia('(display-mode: standalone)');
  let installed = standalone.matches || navigator.standalone === true;
  let installPrompt = null;
  let prompting = false;
  let registration = null;
  let refreshRequested = false;
  let reloading = false;
  let toastTimer;

  function syncButtons() {
    for (const button of buttons) {
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
      steps = ['Abre el menú de tu navegador, normalmente ⋮.', 'Busca Instalar app o Añadir a pantalla de inicio.', 'Confirma para añadir MathBrain con su icono a la pantalla de inicio.'];
      note = 'Si estás dentro de otra aplicación o no ves la opción, abre este sitio en Chrome. Según el navegador y el dispositivo, se añadirá como aplicación o como acceso directo.';
    } else if (macSafari) {
      title = 'En Safari para Mac';
      steps = ['Abre el menú Archivo o Compartir de Safari.', 'Elige Añadir al Dock.', 'Confirma el nombre MathBrain y pulsa Añadir.'];
      note = 'Si no aparece esa opción, utiliza una versión de Safari compatible con apps web o abre este sitio en Chrome o Edge.';
    } else {
      title = 'En tu computador';
      steps = ['Abre el menú de tu navegador o busca el icono de instalación junto a la dirección.', 'Elige Instalar MathBrain o la opción de instalar este sitio como aplicación.', 'Confirma la instalación para abrir MathBrain en su propia ventana y con su icono.'];
      note = 'Si no aparece la instalación, prueba con un navegador compatible, como Chrome o Edge. Puedes seguir utilizando MathBrain desde la web.';
    }
    document.getElementById('install-guide-title').textContent = title;
    const list = document.getElementById('install-steps');
    list.replaceChildren(...steps.map(text => { const item = document.createElement('li'); item.textContent = text; return item; }));
    document.getElementById('install-note').textContent = note;
  }

  function showInstructions() {
    prepareInstructions();
    syncButtons();
    if (!dialog.open) dialog.showModal();
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
        if (!installed) announce('Instalación aceptada. El navegador terminará de añadir MathBrain con su icono.');
      } else {
        announce('Puedes instalar MathBrain cuando quieras desde el menú de tu navegador.');
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
    announce('MathBrain ya está lista. Ábrela desde su nuevo icono.');
  });
  standalone.addEventListener('change', event => {
    installed = event.matches || navigator.standalone === true;
    syncButtons();
  });
  buttons.forEach(button => button.addEventListener('click', requestInstallation));
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
        offlineNote.textContent = 'El contenido sin conexión aún no está preparado. Vuelve a abrir MathBrain con conexión para intentarlo de nuevo.';
        feedback.textContent = 'No se pudo completar la descarga del contenido. Puedes seguir utilizando la web con conexión.';
      }
    };
    worker.addEventListener('statechange', updateState);
    updateState();
  }

  async function prepareOfflineApp() {
    if (!('serviceWorker' in navigator)) {
      offlineNote.textContent = 'Puedes utilizar MathBrain en línea. Este navegador no permite preparar el contenido sin conexión.';
      return;
    }
    if (!window.isSecureContext) {
      offlineNote.textContent = 'Abre la versión HTTPS de MathBrain para preparar el contenido sin conexión y utilizar la instalación del navegador.';
      return;
    }
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      if (registration.active?.state === 'activated') offlineReady();
      observeWorker(registration.installing);
      offerUpdate();
      registration.addEventListener('updatefound', () => observeWorker(registration.installing));
    } catch {
      offlineNote.textContent = 'El contenido sin conexión aún no está preparado. Vuelve a abrir MathBrain con conexión para intentarlo de nuevo.';
      feedback.textContent = 'No se pudo preparar el uso sin conexión. Puedes seguir navegando y volver a intentarlo al abrir MathBrain.';
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
