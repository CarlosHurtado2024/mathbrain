// Zuka es un destello verde con la silueta del logo: una figura sobria, sin boca, mejillas ni pedestal.
// Su ánimo se lee en los ojos (dos trazos) y en un único detalle verde oscuro. Conserva la API de la mascota.
(() => {
  'use strict';

  const moods = ['saluda', 'feliz', 'piensa', 'animo', 'celebra'];
  let drawing = 0;
  const escapeAttribute = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const ink = '#052316';
  const accent = '#159d63';

  function svg(mood = 'feliz', { label = 'Zuka, tu impulso para aprender' } = {}) {
    const state = moods.includes(mood) ? mood : 'feliz';
    const id = `zuka-spark-${++drawing}`;
    const open = (x, y) => `<rect x="${x - 2.75}" y="${y - 6}" width="5.5" height="12" rx="2.75" fill="${ink}"/>`;
    const smile = (x, y) => `<path d="M${x - 5} ${y + 1.5}q5-6 10 0" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>`;
    const eyes = {
      saluda: open(49, 58) + open(71, 58),
      feliz: smile(49, 57) + smile(71, 57),
      piensa: open(52, 55) + open(74, 55),
      animo: open(49, 58) + smile(71, 57),
      celebra: smile(49, 57) + smile(71, 57)
    }[state];
    const detail = {
      saluda: `<path d="M96 30q5 3 6 9" stroke="${accent}" stroke-width="3.5" stroke-linecap="round"/>`,
      feliz: '',
      piensa: `<circle cx="96" cy="31" r="2.6" fill="${accent}"/><circle cx="103" cy="24" r="2.1" fill="${accent}"/><circle cx="108.5" cy="17.5" r="1.6" fill="${accent}"/>`,
      animo: `<path d="m95 34 6-6 6 6" stroke="${accent}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`,
      celebra: `<g stroke="${accent}" stroke-width="3.5" stroke-linecap="round"><path d="M60 3v6"/><path d="m34 11 4 4.5"/><path d="m86 11-4 4.5"/></g>`
    }[state];
    return `<svg xmlns="http://www.w3.org/2000/svg" class="zuka-spark" data-mood="${state}" viewBox="0 0 120 120" fill="none" role="img" aria-label="${escapeAttribute(label)}">`
      + `<defs><linearGradient id="${id}" x1="30" y1="14" x2="92" y2="104" gradientUnits="userSpaceOnUse"><stop stop-color="#8bffd1"/><stop offset="1" stop-color="#39d994"/></linearGradient></defs>`
      + `<ellipse cx="60" cy="112" rx="28" ry="3.5" fill="#07130c" opacity=".1"/>${detail}`
      + `<g class="zuka-spark-body"><path transform="translate(-2.5 -6.5) scale(1.25)" d="M50 14c10 0 12 11 18 17s18 9 18 19-12 12-18 18-8 18-18 18-12-12-18-18-18-8-18-18 12-13 18-19 8-17 18-17Z" fill="url(#${id})"/>`
      + `<path d="M44 26c-4 5-9 9-15 13" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45"/>${eyes}</g></svg>`;
  }

  function say(mood, html, className = '') {
    return `<div class="nebi-say mascot-say ${className}"><span class="nebi-figure mascot-figure">${svg(mood, { label: 'Zuka' })}</span><p class="nebi-bubble mascot-bubble">${html}</p></div>`;
  }

  window.MATHBRAIN_MASCOT = { name: 'Zuka', moods, svg, say };
})();
