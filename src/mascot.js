// Zuka es un destello verde: el pequeño impulso que acompaña cada paso del aprendizaje.
// Conserva los cinco estados y la API de la mascota para lecciones, perfil y mensajes.
(() => {
  'use strict';

  const moods = ['saluda', 'feliz', 'piensa', 'animo', 'celebra'];
  let drawing = 0;
  const escapeAttribute = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
  const spark = (x, y, size) => `<path transform="translate(${x} ${y}) scale(${size})" d="M0-6Q1-1 6 0 1 1 0 6-1 1-6 0-1-1 0-6Z"/>`;

  function svg(mood = 'feliz', { label = 'Zuka, tu impulso para aprender' } = {}) {
    const state = moods.includes(mood) ? mood : 'feliz';
    const id = `zuka-spark-${++drawing}`;
    const ink = '#174d37';
    const eyes = {
      saluda: '<ellipse cx="62" cy="69" rx="3.5" ry="4.5"/><ellipse cx="94" cy="69" rx="3.5" ry="4.5"/>',
      feliz: '<path d="M57 70q5-7 10 0m22 0q5-7 10 0"/>',
      piensa: '<ellipse cx="64" cy="69" rx="3.5" ry="4.5"/><ellipse cx="96" cy="69" rx="3.5" ry="4.5"/><path d="m88 58 12-3"/>',
      animo: '<ellipse cx="62" cy="69" rx="3.5" ry="4.5"/><path d="M89 70q5-7 10 0"/>',
      celebra: '<path d="m56 69 6-5 6 5m20 0 6-5 6 5"/>'
    }[state];
    const mouth = state === 'piensa'
      ? '<path d="M73 87q6-3 12 0"/>'
      : state === 'celebra'
        ? `<path d="M66 84q12 20 24 0Z" fill="${ink}" stroke="none"/><path d="M73 93q5-4 10 0" stroke="#8df2b3"/>`
        : '<path d="M65 83q13 13 26 0"/>';
    const extras = state === 'celebra'
      ? `<g fill="#24ad65">${spark(23, 35, 1)}${spark(137, 22, .8)}${spark(134, 101, .65)}${spark(28, 110, .65)}</g>`
      : state === 'piensa'
        ? '<path d="M124 33c0-8 12-9 12-1 0 5-6 5-6 10m0 7v1" fill="none" stroke="#7950d3" stroke-width="3" stroke-linecap="round"/>'
        : `<g fill="#7950d3">${spark(132, 36, .7)}</g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" class="zuka-spark" data-mood="${state}" viewBox="0 0 160 168" fill="none" role="img" aria-label="${escapeAttribute(label)}">`
      + `<defs><linearGradient id="${id}" x1="69" y1="26" x2="93" y2="124" gradientUnits="userSpaceOnUse"><stop stop-color="#4cdb88"/><stop offset="1" stop-color="#a6ee79"/></linearGradient></defs>`
      + `<ellipse cx="80" cy="151" rx="52" ry="11" fill="#7950d3" opacity=".09"/><ellipse cx="80" cy="147" rx="37" ry="10" fill="#7950d3"/><ellipse cx="80" cy="144" rx="30" ry="7" fill="#cbb5f7"/><ellipse cx="80" cy="143" rx="22" ry="4" stroke="#f2ebff" stroke-width="2"/>${extras}`
      + `<g class="zuka-spark-body"><path d="M78 22c14 0 18 16 27 24s27 13 27 28-17 20-26 29-13 26-28 26-19-17-28-26-26-14-26-29 18-20 27-28 13-24 27-24Z" fill="url(#${id})"/>`
      + `<path d="M48 55c9-8 14-23 27-26" stroke="#d9ffc4" stroke-width="4" stroke-linecap="round" opacity=".6"/>`
      + `<g stroke="${ink}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${eyes}${mouth}</g>`
      + '<ellipse cx="52" cy="82" rx="6" ry="3" fill="#1aa56d" opacity=".18"/><ellipse cx="105" cy="82" rx="6" ry="3" fill="#1aa56d" opacity=".18"/></g></svg>';
  }

  function say(mood, html, className = '') {
    return `<div class="nebi-say mascot-say ${className}"><span class="nebi-figure mascot-figure">${svg(mood, { label: 'Zuka' })}</span><p class="nebi-bubble mascot-bubble">${html}</p></div>`;
  }

  window.MATHBRAIN_MASCOT = { name: 'Zuka', moods, svg, say };
})();
