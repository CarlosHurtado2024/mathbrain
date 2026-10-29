// Octavio, la mascota de MathBrain: un pulpo curioso con gafas redondas. Los pulpos tienen un cerebro central
// y neuronas en cada uno de sus ocho brazos, por eso se dice que tienen «nueve cerebros».
// window.MATHBRAIN_MASCOT.svg(estado) devuelve su dibujo SVG. Estados: saluda, feliz, piensa, animo, celebra.
(() => {
  'use strict';

  const moods = ['saluda', 'feliz', 'piensa', 'animo', 'celebra'];
  let sequence = 0;

  // Brazos que asoman bajo la cabeza. Cada estado levanta o mueve algunos.
  const arms = {
    resting: ['M34 80c-9 9-17 15-25 12-4-2-3-7 1-7', 'M44 84c-3 12-8 21-16 24-4 1-6-3-3-6', 'M55 86c0 12-2 22-7 27-3 3-7 0-5-3', 'M65 86c0 12 2 22 7 27 3 3 7 0 5-3', 'M76 84c3 12 8 21 16 24 4 1 6-3 3-6', 'M86 80c9 9 17 15 25 12 4-2 3-7-1-7'],
    saluda: ['M34 80c-9 9-17 15-25 12-4-2-3-7 1-7', 'M44 84c-3 12-8 21-16 24-4 1-6-3-3-6', 'M55 86c0 12-2 22-7 27-3 3-7 0-5-3', 'M65 86c0 12 2 22 7 27 3 3 7 0 5-3', 'M76 84c3 12 8 21 16 24 4 1 6-3 3-6', 'M88 74c10-6 18-16 20-28 1-5 6-5 7-1'],
    celebra: ['M32 74c-10-6-18-16-20-28-1-5-6-5-7-1', 'M44 84c-3 12-8 21-16 24-4 1-6-3-3-6', 'M55 86c0 12-2 22-7 27-3 3-7 0-5-3', 'M65 86c0 12 2 22 7 27 3 3 7 0 5-3', 'M76 84c3 12 8 21 16 24 4 1 6-3 3-6', 'M88 74c10-6 18-16 20-28 1-5 6-5 7-1'],
    piensa: ['M34 80c-9 9-17 15-25 12-4-2-3-7 1-7', 'M44 84c-3 12-8 21-16 24-4 1-6-3-3-6', 'M55 86c0 12-2 22-7 27-3 3-7 0-5-3', 'M65 86c0 12 2 22 7 27 3 3 7 0 5-3', 'M76 84c3 12 8 21 16 24 4 1 6-3 3-6', 'M86 78c6 6 6 14-2 16-6 1-10-3-12-7']
  };

  function svg(mood = 'feliz', { label = 'Octavio, la mascota de MathBrain' } = {}) {
    const state = moods.includes(mood) ? mood : 'feliz';
    sequence += 1;
    const skin = `octavio-skin-${sequence}`;
    const shine = `octavio-shine-${sequence}`;
    const look = { piensa: [2, -3], animo: [0, 1], saluda: [1, 0], feliz: [0, 0], celebra: [0, 0] }[state];
    const eyes = state === 'celebra'
      ? '<path d="M39 54q7-8 14 0M67 54q7-8 14 0" fill="none" stroke="#2b2240" stroke-width="3.4" stroke-linecap="round"/>'
      : `<circle cx="46" cy="54" r="9.5" fill="#fff"/><circle cx="74" cy="54" r="9.5" fill="#fff"/><circle cx="${46 + look[0]}" cy="${54 + look[1]}" r="5" fill="#2b2240"/><circle cx="${74 + look[0]}" cy="${54 + look[1]}" r="5" fill="#2b2240"/><circle cx="${47.8 + look[0]}" cy="${52 + look[1]}" r="1.8" fill="#fff"/><circle cx="${75.8 + look[0]}" cy="${52 + look[1]}" r="1.8" fill="#fff"/>`;
    const glasses = '<g fill="none" stroke="#2b2240" stroke-width="2.6"><circle cx="46" cy="54" r="12.5"/><circle cx="74" cy="54" r="12.5"/><path d="M58.5 53q1.5-2 3 0M33.5 52l-6-3M86.5 52l6-3" stroke-linecap="round"/></g>';
    const brows = state === 'animo' ? '<path d="M38 37l12 3M82 37l-12 3" stroke="#2b2240" stroke-width="2.8" stroke-linecap="round"/>' : state === 'piensa' ? '<path d="M38 38q7-5 14-1" fill="none" stroke="#2b2240" stroke-width="2.6" stroke-linecap="round"/>' : '';
    const mouth = {
      feliz: '<path d="M52 71q8 8 16 0" fill="none" stroke="#2b2240" stroke-width="3.2" stroke-linecap="round"/>',
      saluda: '<path d="M51 70q9 11 18 0z" fill="#2b2240"/><path d="M56 75q4 3 8 0" fill="#ff8fb3"/>',
      piensa: '<ellipse cx="62" cy="73" rx="3.4" ry="3" fill="#2b2240"/>',
      animo: '<path d="M53 73q7 5 14-1" fill="none" stroke="#2b2240" stroke-width="3.2" stroke-linecap="round"/>',
      celebra: '<path d="M48 68q12 16 24 0z" fill="#2b2240"/><path d="M54 75q6 4 12 0" fill="#ff8fb3"/>'
    }[state];
    const extras = state === 'celebra'
      ? '<g fill="#ffc233"><path d="M12 18l2.2 5.2 5.2 2.2-5.2 2.2L12 33l-2.2-5.2-5.2-2.2 5.2-2.2z"/><path d="M108 12l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z"/></g><circle cx="22" cy="44" r="2.6" fill="#1cb0f6"/><circle cx="100" cy="40" r="2.4" fill="#23c16b"/>'
      : state === 'piensa' ? '<text x="96" y="26" fill="#6c4df6" font-size="22" font-weight="800" font-family="Nunito,Arial,sans-serif">?</text>'
        : state === 'saluda' ? '<path d="M106 30q4 2 5 6M110 24q6 3 7 9" fill="none" stroke="#ffc233" stroke-width="2.4" stroke-linecap="round"/>' : '';
    const pose = arms[state] || arms.resting;
    return `<svg class="octavio" data-mood="${state}" viewBox="0 0 120 124" role="img" aria-label="${label}"><defs><linearGradient id="${skin}" x1="24" y1="8" x2="96" y2="112" gradientUnits="userSpaceOnUse"><stop stop-color="#ff9a6b"/><stop offset=".6" stop-color="#ff6f61"/><stop offset="1" stop-color="#f2507a"/></linearGradient><radialGradient id="${shine}" cx="42" cy="22" r="30" gradientUnits="userSpaceOnUse"><stop stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><ellipse cx="60" cy="118" rx="34" ry="4.5" fill="#2b2240" opacity=".08"/>${extras}<g class="octavio-arms" fill="none" stroke="url(#${skin})" stroke-width="9" stroke-linecap="round" stroke-linejoin="round">${pose.map(path => `<path d="${path}"/>`).join('')}</g><g fill="#ffd2c2">${state === 'celebra' ? '' : '<circle cx="12" cy="88" r="1.6"/><circle cx="108" cy="88" r="1.6"/>'}<circle cx="31" cy="102" r="1.6"/><circle cx="89" cy="102" r="1.6"/></g><path d="M60 8C83 8 99 26 99 50c0 18-9 30-23 35H44C30 80 21 68 21 50 21 26 37 8 60 8Z" fill="url(#${skin})"/><path d="M60 8C83 8 99 26 99 50c0 18-9 30-23 35H44C30 80 21 68 21 50 21 26 37 8 60 8Z" fill="url(#${shine})"/><g fill="#ffb59a" opacity=".85"><circle cx="77" cy="22" r="4"/><circle cx="87" cy="31" r="2.6"/><circle cx="33" cy="30" r="2.2"/></g><circle cx="35" cy="66" r="5" fill="#ff8fb3" opacity=".55"/><circle cx="85" cy="66" r="5" fill="#ff8fb3" opacity=".55"/>${brows}${eyes}${glasses}${mouth}${state === 'piensa' ? '<g transform="rotate(-35 70 92)"><rect x="66" y="78" width="6" height="22" rx="1.5" fill="#ffc233"/><path d="M66 100h6l-3 6z" fill="#2b2240"/><rect x="66" y="78" width="6" height="4" rx="1" fill="#ff8fb3"/></g>' : ''}</svg>`;
  }

  // Octavio con un globo de diálogo. El texto llega ya escapado desde quien lo usa.
  function say(mood, html, className = '') {
    return `<div class="nebi-say mascot-say ${className}"><span class="nebi-figure mascot-figure">${svg(mood, { label: 'Octavio' })}</span><p class="nebi-bubble mascot-bubble">${html}</p></div>`;
  }

  window.MATHBRAIN_MASCOT = { name: 'Octavio', moods, svg, say };
})();
