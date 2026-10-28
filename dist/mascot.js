// Nebi, la mascota de MathBrain: un pequeño cerebro de cristal facetado, como el símbolo de la marca,
// con una chispa de idea encima. window.MATHBRAIN_MASCOT.svg(estado) devuelve su dibujo SVG.
// Estados: saluda, feliz, piensa, animo, celebra.
(() => {
  'use strict';

  const moods = ['saluda', 'feliz', 'piensa', 'animo', 'celebra'];
  let sequence = 0;

  function svg(mood = 'feliz', { label = 'Nebi, la mascota de MathBrain' } = {}) {
    const state = moods.includes(mood) ? mood : 'feliz';
    sequence += 1;
    const body = `nebi-body-${sequence}`;
    const glow = `nebi-glow-${sequence}`;
    const look = { piensa: [2, -3], animo: [0, 1], saluda: [1, 0], feliz: [0, 0], celebra: [0, 0] }[state];
    const eyes = state === 'celebra'
      ? '<path d="M41 63q7-8 14 0M65 63q7-8 14 0" fill="none" stroke="#0b1426" stroke-width="3.4" stroke-linecap="round"/>'
      : `<g><circle cx="48" cy="62" r="9.5" fill="#fff"/><circle cx="72" cy="62" r="9.5" fill="#fff"/><circle cx="${48 + look[0]}" cy="${62 + look[1]}" r="4.8" fill="#0b1426"/><circle cx="${72 + look[0]}" cy="${62 + look[1]}" r="4.8" fill="#0b1426"/><circle cx="${49.6 + look[0]}" cy="${60.2 + look[1]}" r="1.7" fill="#fff"/><circle cx="${73.6 + look[0]}" cy="${60.2 + look[1]}" r="1.7" fill="#fff"/></g>`;
    const brows = state === 'animo' ? '<path d="M41 50l12 3M79 50l-12 3" stroke="#0b1426" stroke-width="2.6" stroke-linecap="round"/>' : state === 'piensa' ? '<path d="M42 49q6-4 12-1" fill="none" stroke="#0b1426" stroke-width="2.4" stroke-linecap="round"/>' : '';
    const mouth = {
      feliz: '<path d="M52 76q8 8 16 0" fill="none" stroke="#0b1426" stroke-width="3.2" stroke-linecap="round"/>',
      saluda: '<path d="M51 75q9 10 18 0z" fill="#0b1426"/><path d="M56 80q4 3 8 0" fill="#f28fb0"/>',
      piensa: '<circle cx="62" cy="79" r="3.2" fill="#0b1426"/>',
      animo: '<path d="M53 78q7 5 14-1" fill="none" stroke="#0b1426" stroke-width="3.2" stroke-linecap="round"/>',
      celebra: '<path d="M49 73q11 15 22 0z" fill="#0b1426"/><path d="M55 80q5 4 10 0" fill="#f28fb0"/>'
    }[state];
    const arms = {
      feliz: '<path d="M24 70q-8 7-6 16M96 70q8 7 6 16"/>',
      saluda: '<path d="M24 70q-8 7-6 16M97 66q12-9 9-24"/>',
      piensa: '<path d="M24 70q-8 7-6 16M95 76q-6 9-17 7"/>',
      animo: '<path d="M24 72q-10 2-12-8M96 72q10 2 12-8"/>',
      celebra: '<path d="M25 64q-12-8-10-24M95 64q12-8 10-24"/>'
    }[state];
    const extras = state === 'celebra'
      ? '<g fill="#e9cd9c"><path d="M14 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M104 18l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/><circle cx="20" cy="104" r="2.4"/><circle cx="104" cy="100" r="2"/></g>'
      : state === 'piensa' ? '<text x="98" y="30" fill="#e9cd9c" font-size="20" font-weight="700" font-family="Georgia,serif">?</text>' : '';
    return `<svg class="nebi" data-mood="${state}" viewBox="0 0 120 124" role="img" aria-label="${label}"><defs><linearGradient id="${body}" x1="20" y1="14" x2="100" y2="110" gradientUnits="userSpaceOnUse"><stop stop-color="#a4ecdc"/><stop offset=".55" stop-color="#63b7e6"/><stop offset="1" stop-color="#4f73e3"/></linearGradient><radialGradient id="${glow}"><stop stop-color="#fff6c9"/><stop offset="1" stop-color="#e9cd9c" stop-opacity="0"/></radialGradient></defs>${extras}<circle cx="60" cy="6" r="9" fill="url(#${glow})" class="nebi-spark"/><path d="M60 14V6" stroke="#a4ecdc" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="5" r="3" fill="#fff6c9"/><g class="nebi-arms" fill="none" stroke="url(#${body})" stroke-width="7" stroke-linecap="round">${arms}</g><ellipse cx="47" cy="112" rx="9" ry="5" fill="#3f5fc4"/><ellipse cx="73" cy="112" rx="9" ry="5" fill="#3f5fc4"/><path d="M60 15 91 27l12 31-13 35-30 14-30-14-13-35 12-31z" fill="url(#${body})" stroke="url(#${body})" stroke-width="8" stroke-linejoin="round"/><g fill="none" stroke="#fff" stroke-opacity=".32" stroke-width="1.5" stroke-linejoin="round"><path d="M60 15v24M29 27l15 16M91 27 76 43M17 58l20 3M103 58l-20 3"/><path d="M44 43h32l8 18-8 22H44l-8-22z"/></g><path d="M36 30 52 22" stroke="#fff" stroke-opacity=".55" stroke-width="3" stroke-linecap="round"/><circle cx="38" cy="73" r="4.5" fill="#f28fb0" opacity=".45"/><circle cx="82" cy="73" r="4.5" fill="#f28fb0" opacity=".45"/>${brows}${eyes}${mouth}</svg>`;
  }

  // Nebi con un globo de diálogo. El texto llega ya escapado desde quien lo usa.
  function say(mood, html, className = '') {
    return `<div class="nebi-say ${className}"><span class="nebi-figure">${svg(mood, { label: 'Nebi' })}</span><p class="nebi-bubble">${html}</p></div>`;
  }

  window.MATHBRAIN_MASCOT = { name: 'Nebi', moods, svg, say };
})();
