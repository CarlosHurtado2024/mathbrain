// Motor de lecciones de Zuka. Una lección es una secuencia de bloques independientes y reutilizables
// (reto, video, concepto, fórmula, ejemplo resuelto, ejercicio…). Cada tipo de bloque tiene su componente
// en este registro: la etiqueta, cómo se dibuja y, si lo necesita, su comportamiento al mostrarse.
// El reproductor de app.js no conoce los tipos: le pide al motor el HTML y si el bloque se califica.
// Los tipos interactivos que llegan en fases siguientes (gráficas, simulaciones…) se añaden con register().
(() => {
  'use strict';

  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  // Los 14 tipos que acepta la base de datos (lesson_blocks.type). «intro» es interno: abre repasos y simulacros.
  const TYPES = ['challenge', 'video', 'concept', 'formula', 'worked_example', 'interactive_graph', 'simulation', 'exercise', 'step_by_step', 'visual_proof', 'application', 'assessment', 'summary', 'spaced_review'];
  // Nombres del compilador de Markdown (scripts/build-content.cjs) → tipos del motor.
  const LEGACY = { idea: { type: 'concept', variant: 'key' }, note: { type: 'concept', variant: 'note' }, example: { type: 'worked_example' } };

  function videoSource(value) {
    if (!value) return null;
    let url;
    try { url = new URL(value, location.href); } catch { return null; }
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    let videoId;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) videoId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    if (url.hostname === 'youtu.be') videoId = url.pathname.slice(1);
    if (videoId && /^[\w-]{11}$/.test(videoId)) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&playsinline=1&cc_load_policy=1&cc_lang_pref=es&hl=es` };
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const match = url.pathname.match(/(?:\/video)?\/(\d+)/);
      if (match) return { type: 'iframe', src: `https://player.vimeo.com/video/${match[1]}` };
    }
    return /\.(mp4|webm)$/i.test(url.pathname) ? { type: 'video', src: url.href } : null;
  }

  // Video de YouTube o Vimeo, o un MP4 propio (por ejemplo, una animación de Manim) con subtítulos opcionales.
  function videoHtml(src, { title = 'Video de la lección', vertical = false, captions = '' } = {}) {
    const source = videoSource(src);
    if (!source) return '';
    const isVertical = vertical || /\/shorts\//.test(src);
    const track = captions ? `<track kind="subtitles" srclang="es" label="Español" src="${escape(captions)}" default>` : '';
    return `<div class="video-stage${isVertical ? ' is-vertical' : ''}">${source.type === 'iframe' ? `<iframe title="${escape(title)}" src="${escape(source.src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<video controls playsinline preload="metadata" aria-label="${escape(title)}"><source src="${escape(source.src)}">${track}</video>`}</div>`;
  }

  // Contenido común: un título opcional y el HTML del bloque (con LaTeX ya compilado por KaTeX).
  const content = block => `${block.data.title ? `<h2>${escape(block.data.title)}</h2>` : ''}${block.html}`;

  const registry = new Map();

  function register(type, definition) {
    registry.set(type, { label: '', render: content, ...definition });
  }

  register('challenge', { label: 'Reto inicial' });
  register('video', {
    label: 'Video',
    render: (block, context) => {
      const player = videoHtml(block.data.src, { title: block.data.title || context.title, vertical: block.data.format === 'vertical', captions: block.data.captions });
      return player ? `<h2>${escape(block.data.heading || 'Mira la clase')}</h2>${player}${block.html}` : block.html;
    },
    immersive: block => block.data.format === 'vertical' || /\/shorts\//.test(block.data.src || '')
  });
  register('concept', { label: '', variants: { key: 'Idea clave', note: 'Atención' } });
  register('formula', { label: 'Fórmula' });
  register('worked_example', { label: 'Ejemplo' });
  // Ejercicio: si trae una especificación (data.exercise), lo dibuja el sistema de ejercicios (src/exercises.js);
  // los ejercicios antiguos llegan ya como HTML.
  const exerciseKey = (block, context) => block.data.exercise?.id || `${context.lessonId || 'leccion'}-bloque-${context.index ?? 0}`;
  register('exercise', {
    label: 'Tu turno',
    graded: true,
    render: (block, context) => block.data.exercise && window.ZUKA_EXERCISES ? `${block.html}${window.ZUKA_EXERCISES.render(block.data.exercise, { key: exerciseKey(block, context), lessonId: context.lessonId })}` : block.html,
    mount: element => { const form = element.querySelector('form[data-exercise]'); if (form) window.ZUKA_EXERCISES?.mount(form); }
  });
  // Paso a paso: los pasos aparecen de uno en uno, para pensar el siguiente antes de verlo.
  register('step_by_step', {
    label: 'Paso a paso',
    render: block => {
      const steps = Array.isArray(block.data.steps) ? block.data.steps.filter(step => step && (step.html || step.title)) : [];
      if (!steps.length) return content(block);
      return `${content(block)}<ol class="block-steps" data-block-steps>${steps.map((step, index) => `<li${index ? ' hidden' : ''}>${step.title ? `<h3>${escape(step.title)}</h3>` : ''}${step.html || ''}</li>`).join('')}</ol>${steps.length > 1 ? '<button type="button" class="button button-secondary block-steps-next" data-block-step-next>Ver el siguiente paso</button>' : ''}`;
    },
    mount: element => {
      const button = element.querySelector('[data-block-step-next]');
      button?.addEventListener('click', () => {
        const hidden = element.querySelector('[data-block-steps] > li[hidden]');
        if (hidden) { hidden.hidden = false; hidden.setAttribute('tabindex', '-1'); hidden.focus({ preventScroll: false }); }
        if (!element.querySelector('[data-block-steps] > li[hidden]')) button.remove();
      });
    }
  });
  register('visual_proof', { label: 'Demostración visual' });
  register('application', { label: 'Aplicación' });
  register('summary', { label: 'Resumen' });
  register('intro', { label: 'Repaso' });

  // Bloque canónico: { type, html, data }. Acepta los pasos del compilador (idea, note, example…).
  function normalize(step) {
    const legacy = LEGACY[step?.type];
    const data = step?.data && typeof step.data === 'object' ? { ...step.data } : {};
    if (legacy?.variant && !data.variant) data.variant = legacy.variant;
    return { type: legacy ? legacy.type : String(step?.type || ''), html: typeof step?.html === 'string' ? step.html : '', data };
  }

  // Bloques de una lección compilada: el video (si lo hay) abre la lección, como en la base de datos.
  function fromLesson(lesson) {
    const video = lesson.video ? [{ type: 'video', html: '', data: { src: lesson.video, format: lesson.videoFormat || 'horizontal' } }] : [];
    return [...video, ...(lesson.steps || [])].map(normalize);
  }

  // Solo se muestran los bloques que este motor sabe dibujar y que tienen algo que mostrar.
  function playable(blocks) {
    return blocks.map(normalize).filter(block => registry.has(block.type) && (block.html || block.data.src || block.data.steps || block.data.exercise));
  }

  function definition(block) { return registry.get(block.type) || registry.get('concept'); }

  const graded = block => Boolean(definition(block).graded) || Boolean(block.data?.exercise) || /class="lesson-exercise"/.test(block.html);
  // ¿El bloque trae una explicación de la solución? Habilita «¿Por qué?» al acertar.
  const hasSolution = block => /lesson-solution/.test(block.html) || Boolean(block.data?.exercise?.solution);
  const label = block => definition(block).variants?.[block.data.variant] || definition(block).label;
  const render = (block, context = {}) => definition(block).render(block, context);
  const immersive = block => Boolean(definition(block).immersive?.(block));
  const mount = (block, element, context = {}) => { definition(block).mount?.(element, block, context); };

  // HTML de la lectura completa (una página): los bloques con componente propio se dibujan igual que en la lección.
  const reading = (step, context = {}) => { const block = normalize(step); return block.data.exercise ? render(block, context) : block.html; };

  window.ZUKA_ENGINE = { TYPES, register, normalize, fromLesson, playable, graded, hasSolution, label, render, reading, immersive, mount, videoSource, videoHtml, has: type => registry.has(type) };
})();
