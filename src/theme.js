(() => {
  'use strict';

  const storageKey = 'mathbrain-theme';
  const preferences = ['dark', 'light'];
  const root = document.documentElement;
  const validPreference = value => preferences.includes(value) ? value : 'light';
  let preference = 'light';
  try {
    const saved = localStorage.getItem(storageKey);
    preference = saved === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : validPreference(saved);
    if (saved === 'system') localStorage.setItem(storageKey, preference);
  } catch {}

  function applyTheme(announce = false, emit = true) {
    const theme = preference;
    root.dataset.theme = theme;
    root.dataset.themePreference = preference;
    root.style.colorScheme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#ffffff' : '#0e1424');
    document.querySelectorAll('[data-theme-select]').forEach(control => { control.value = preference; });
    document.querySelectorAll('[data-theme-toggle]').forEach(control => {
      const label = `Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`;
      control.setAttribute('aria-label', label);
      control.title = label;
    });
    document.querySelectorAll('[data-theme-icon]').forEach(element => {
      if (element.dataset.themeIcon === theme) element.removeAttribute('hidden');
      else element.setAttribute('hidden', '');
    });
    if (announce) {
      const status = document.getElementById('theme-status');
      if (status) status.textContent = `Tema ${theme === 'light' ? 'claro' : 'oscuro'} activado.`;
    }
    if (emit) document.dispatchEvent(new CustomEvent('mathbrain:themechange', { detail: { theme, preference } }));
  }

  function chooseTheme(value) {
    if (!preferences.includes(value)) return;
    const restoreFocus = document.activeElement?.closest?.('[data-theme-toggle]');
    preference = value;
    let persisted = true;
    try { localStorage.setItem(storageKey, preference); } catch { persisted = false; }
    applyTheme(true);
    if (restoreFocus) (document.querySelector('.m-header [data-theme-toggle]') || document.querySelector('.topbar [data-theme-toggle]'))?.focus();
    const status = document.getElementById('theme-status');
    if (!persisted && status) status.textContent += ' La preferencia se conserva durante esta visita.';
  }

  document.addEventListener('click', event => {
    if (event.target.closest?.('[data-theme-toggle]')) chooseTheme(preference === 'light' ? 'dark' : 'light');
  });
  document.addEventListener('change', event => {
    if (event.target.matches?.('[data-theme-select]')) chooseTheme(event.target.value);
  });
  document.addEventListener('zuka:routechange', () => applyTheme(false, false));
  window.addEventListener('storage', event => {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validPreference(event.newValue);
    applyTheme(true);
  });
  applyTheme();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => applyTheme(), { once: true });
  else applyTheme();
})();
