(() => {
  'use strict';

  const storageKey = 'mathbrain-theme';
  const preferences = ['dark', 'light', 'system'];
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const root = document.documentElement;
  const validPreference = value => preferences.includes(value) ? value : 'light';
  let preference = 'light';
  try { preference = validPreference(localStorage.getItem(storageKey)); } catch {}

  function applyTheme(announce = false) {
    const theme = preference === 'system' ? systemTheme.matches ? 'dark' : 'light' : preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#ffffff' : '#070b18');
    document.querySelectorAll('[data-theme-select]').forEach(control => { control.value = preference; });
    document.querySelectorAll('[data-theme-icon]').forEach(element => {
      if (element.dataset.themeIcon === (preference === 'system' ? 'system' : theme)) element.removeAttribute('hidden');
      else element.setAttribute('hidden', '');
    });
    if (announce) {
      const status = document.getElementById('theme-status');
      if (status) status.textContent = preference === 'system' ? `Tema del sistema: ${theme === 'light' ? 'claro' : 'oscuro'}.` : `Tema ${theme === 'light' ? 'claro' : 'oscuro'} activado.`;
    }
    document.dispatchEvent(new CustomEvent('mathbrain:themechange', { detail: { theme, preference } }));
  }

  function initializeControls() {
    document.querySelectorAll('[data-theme-select]').forEach(control => {
      control.addEventListener('change', () => {
        if (!preferences.includes(control.value)) return;
        preference = control.value;
        let persisted = true;
        try { localStorage.setItem(storageKey, preference); } catch { persisted = false; }
        applyTheme(true);
        const status = document.getElementById('theme-status');
        if (!persisted && status) status.textContent += ' La preferencia se conserva durante esta visita.';
      });
    });
    applyTheme();
  }

  systemTheme.addEventListener('change', () => { if (preference === 'system') applyTheme(true); });
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validPreference(event.newValue);
    applyTheme(true);
  });
  applyTheme();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeControls, { once: true });
  else initializeControls();
})();
