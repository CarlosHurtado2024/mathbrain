// Euly, el zorro de Euly: un zorro sentado de formas planas y geométricas, naranja con máscara y pecho crema,
// patas negras y una cola grande con la punta clara. window.MATHBRAIN_MASCOT.svg(estado) devuelve su dibujo SVG.
// Estados: saluda, feliz, piensa, animo, celebra.
(() => {
  'use strict';

  const moods = ['saluda', 'feliz', 'piensa', 'animo', 'celebra'];
  const orange = '#e0601f';
  const shade = '#c24a14';
  const cream = '#f7e4cb';
  const creamShade = '#efd3ae';
  const ink = '#24262c';

  function svg(mood = 'feliz', { label = 'Euly, el zorro de Euly' } = {}) {
    const state = moods.includes(mood) ? mood : 'feliz';
    // La cabeza se inclina un poco al pensar y al celebrar, como en el dibujo de referencia.
    const tilt = { piensa: -8, celebra: 6, saluda: -3, feliz: -4, animo: 0 }[state];
    const eyes = {
      feliz: `<path d="M44 45q4-4 8-.5M64 44.5q4-3.5 8 .5" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>`,
      celebra: `<path d="M43 46q5-6 10-1M63 45q5-5 10 1" fill="none" stroke="${ink}" stroke-width="3.2" stroke-linecap="round"/>`,
      saluda: `<ellipse cx="48" cy="44.5" rx="3.2" ry="3.8" fill="${ink}"/><ellipse cx="68" cy="44.5" rx="3.2" ry="3.8" fill="${ink}"/><circle cx="49.2" cy="43.2" r="1.1" fill="#fff"/><circle cx="69.2" cy="43.2" r="1.1" fill="#fff"/>`,
      piensa: `<ellipse cx="49" cy="43.5" rx="3" ry="3.6" fill="${ink}"/><ellipse cx="69" cy="43.5" rx="3" ry="3.6" fill="${ink}"/><circle cx="50" cy="42.2" r="1" fill="#fff"/><circle cx="70" cy="42.2" r="1" fill="#fff"/>`,
      animo: `<path d="M44 46.5q4-4.5 8-.5M64 46q4-4 8 .5" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/><path d="M43 39.5l9 2.5M73 39.5l-9 2.5" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`
    }[state];
    const mouth = state === 'celebra'
      ? `<path d="M53 61q5 6 10 0z" fill="${ink}"/>`
      : state === 'piensa' ? `<path d="M55 62.5h6" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`
        : `<path d="M53.5 61.5q4.5 3.5 9 0" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linecap="round"/>`;
    // Una pata delantera levantada para saludar o celebrar.
    const paw = state === 'saluda'
      ? `<path d="M44 82c-7-4-11-12-10-21" fill="none" stroke="${orange}" stroke-width="9" stroke-linecap="round"/><ellipse cx="34.5" cy="59" rx="5" ry="6" fill="${ink}"/>`
      : state === 'celebra'
        ? `<path d="M44 82c-8-5-13-14-13-24" fill="none" stroke="${orange}" stroke-width="9" stroke-linecap="round"/><ellipse cx="31" cy="55" rx="5" ry="6" fill="${ink}"/><path d="M73 82c8-5 13-14 13-24" fill="none" stroke="${orange}" stroke-width="9" stroke-linecap="round"/><ellipse cx="86" cy="55" rx="5" ry="6" fill="${ink}"/>`
        : '';
    const frontLegs = state === 'celebra'
      ? ''
      : state === 'saluda'
        ? `<rect x="61" y="96" width="8.5" height="20" rx="4.2" fill="${ink}"/>`
        : `<rect x="47" y="96" width="8.5" height="20" rx="4.2" fill="${ink}"/><rect x="61" y="96" width="8.5" height="20" rx="4.2" fill="${ink}"/>`;
    const extras = state === 'celebra'
      ? '<g fill="#f2b33d"><path d="M16 22l1.8 4.2 4.2 1.8-4.2 1.8L16 34l-1.8-4.2-4.2-1.8 4.2-1.8z"/><path d="M102 14l1.5 3.5 3.5 1.5-3.5 1.5-1.5 3.5-1.5-3.5-3.5-1.5 3.5-1.5z"/></g>'
      : state === 'piensa' ? `<text x="94" y="24" fill="${orange}" font-size="20" font-weight="700" font-family="'Plus Jakarta Sans',Arial,sans-serif">?</text>` : '';
    return `<svg class="euly-fox" data-mood="${state}" viewBox="0 0 120 124" role="img" aria-label="${label}">${extras}<ellipse cx="62" cy="119" rx="40" ry="4" fill="${ink}" opacity=".08"/>`
      // Cola enroscada detrás del cuerpo, con la punta crema.
      + `<path d="M58 118c26 3 50-6 53-26 2-14-7-25-18-25 7 10 7 25-2 34-9 9-21 11-33 11z" fill="${orange}"/><path d="M93 67c11 0 20 11 18 25-1 7-4 13-8 17 2-15 0-30-10-42z" fill="${cream}"/><path d="M66 113c14-2 25-8 31-18" fill="none" stroke="${shade}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>`
      // Cuerpo sentado que sube hasta el cuello, con el pecho crema y la pata trasera.
      + `<path d="M40 117c-5-18-3-36 9-52 5-6 13-6 18 0 13 15 19 35 15 52z" fill="${orange}"/><path d="M49 65c-5 15-4 33 4 51h8c-3-18-1-35 7-51-6-6-14-6-19 0z" fill="${cream}"/><path d="M49 65c-4 13-4 27 0 41-2-14-2-28 4-41z" fill="${creamShade}"/><path d="M67 86c11 0 17 9 16 22l-1 9H67z" fill="${orange}"/><path d="M69 87c7 1 12 6 14 13" fill="none" stroke="${shade}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>${frontLegs}<rect x="68" y="110" width="17" height="7.5" rx="3.75" fill="${ink}"/>${paw}`
      // Cabeza con orejas grandes, máscara crema y hocico.
      + `<g transform="rotate(${tilt} 58 44)"><path d="M33 34 29 6c11 3 20 12 24 20z" fill="${orange}"/><path d="M35 30 33 13c6 3 12 8 15 13z" fill="${cream}"/><path d="M83 34l4-28c-11 3-20 12-24 20z" fill="${orange}"/><path d="M81 30l2-17c-6 3-12 8-15 13z" fill="${cream}"/><path d="M24 40c4-12 16-18 34-18s30 6 34 18c-5 13-18 24-34 28-16-4-29-15-34-28z" fill="${orange}"/><path d="M24 40c8 3 16 8 22 15 5 6 9 9 12 10 3-1 7-4 12-10 6-7 14-12 22-15-5 13-18 24-34 28-16-4-29-15-34-28z" fill="${cream}"/>${eyes}<path d="M53 56.5h10l-5 5.5z" fill="${ink}"/>${mouth}</g></svg>`;
  }

  // Euly con un globo de diálogo. El texto llega ya escapado desde quien lo usa.
  function say(mood, html, className = '') {
    return `<div class="nebi-say mascot-say ${className}"><span class="nebi-figure mascot-figure">${svg(mood, { label: 'Euly' })}</span><p class="nebi-bubble mascot-bubble">${html}</p></div>`;
  }

  window.MATHBRAIN_MASCOT = { name: 'Euly', moods, svg, say };
})();
