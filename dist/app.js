(() => {
  'use strict';

  const library = window.MATHBRAIN_LIBRARY;
  const courses = window.MATHBRAIN_COURSES;
  const select = (selector, root = document) => root.querySelector(selector);
  const selectAll = (selector, root = document) => [...root.querySelectorAll(selector)];
  const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const linePath = points => points.map((point, index) => `${index ? 'L' : 'M'}${point[0].toFixed(2)},${point[1].toFixed(2)}`).join(' ');
  const resourceById = new Map(library.resources.map(resource => [resource.id, resource]));
  const number = (value, digits = 3) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(Math.abs(value) < 1e-10 ? 0 : value);
  const topicName = topicId => library.topics.find(topic => topic.id === topicId)?.title || '';
  const saved = new Set(loadList('mathbrain-saved'));
  let recent = loadList('mathbrain-recent');
  let page = 'inicio';
  let filters = { query: '', type: 'all', topic: 'all', level: 'all' };
  let toastTimer;
  let artworkSequence = 0;
  let lastRoutedHash = null;

  const iconPaths = {
    home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
    search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    simulation: '<path d="M9 3h6M10 3v6l-6 10a1.4 1.4 0 0 0 1.2 2h13.6a1.4 1.4 0 0 0 1.2-2L14 9V3M7 15h10"/><path d="M10 18h.01M14 17h.01"/>',
    exercise: '<path d="M14 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9M8 15l1-4L18 2l4 4-9 9-4 1Z"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    book: '<path d="M12 5v16M12 5C9 3 5 3 2 4v15c4-1 7-1 10 2 3-3 6-3 10-2V4c-3-1-7-1-10 1Z"/>',
    play: '<path d="m9 5 11 7-11 7Z"/>',
    left: '<path d="m14 5-7 7 7 7"/>',
    right: '<path d="m10 5 7 7-7 7"/>',
    link: '<path d="m10 13 4-4M8 15l-2 2a3 3 0 0 1-4-4l5-5a3 3 0 0 1 4 0M13 11a3 3 0 0 0 4 0l5-5a3 3 0 0 0-4-4l-2 2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>'
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.book}</svg>`;
  }

  function loadList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? [...new Set(value.filter(id => resourceById.has(id)))].slice(0, 200) : [];
    } catch {
      return [];
    }
  }

  function storeList(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch { return false; }
  }

  function toast(message) {
    clearTimeout(toastTimer);
    select('#toast').textContent = message;
    select('#toast').classList.add('visible');
    toastTimer = setTimeout(() => select('#toast').classList.remove('visible'), 3500);
  }

  function artwork(resource) {
    artworkSequence += 1;
    const palette = {
      blue: ['#11263d', '#8dc8ed', '#b0e7df'], sand: ['#30253b', '#e1bd99', '#b7a9ed'],
      green: ['#12312f', '#9fd6be', '#d8d9a1'], purple: ['#241e42', '#bca5ed', '#8adbd8'],
      rose: ['#322039', '#e2a6c4', '#9ac8e9'], slate: ['#12313c', '#9bd7d5', '#dcd0a5']
    }[resource.color];
    const [background, primary, accent] = palette;
    const patternId = `art-grid-${artworkSequence}`;
    const grid = `<defs><pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${primary}" stroke-opacity=".085" stroke-width=".7"/></pattern></defs><rect width="400" height="230" fill="${background}"/><rect width="400" height="230" fill="url(#${patternId})"/>`;
    const axes = `<path d="M45 181H361M94 197V46" stroke="${primary}" stroke-opacity=".3" stroke-width="1" fill="none"/>`;
    let drawing;
    if (resource.art === 'derivative') {
      const curve = linePath(Array.from({ length: 81 }, (_, index) => { const horizontal = index * 3.4; return [62 + horizontal, 183 - .0017 * horizontal ** 2]; }));
      drawing = `${axes}<path d="${curve}" fill="none" stroke="${primary}" stroke-width="2.3"/><path d="M139 183 331 69" stroke="${accent}" stroke-width="1.5"/><circle cx="236" cy="132" r="4" fill="${accent}"/><circle cx="236" cy="132" r="10" fill="none" stroke="${accent}" opacity=".3"/><text x="120" y="84" fill="${accent}" font-size="31" font-family="Georgia,serif" font-style="italic">f′(x)</text><text x="291" y="165" fill="${primary}" opacity=".7" font-size="13" font-family="Georgia,serif">Δy / Δx</text>`;
    } else if (resource.art === 'probability') {
      const curve = Array.from({ length: 101 }, (_, index) => { const horizontal = 44 + index * 3.12; return [horizontal, 181 - 120 * Math.exp(-((horizontal - 200) ** 2) / (2 * 48 ** 2))]; });
      const area = curve.filter(point => point[0] > 156 && point[0] < 247);
      drawing = `<path d="M44 181H358" stroke="${primary}" stroke-opacity=".4"/><path d="M${area[0][0]} 181 ${linePath(area).replace(/^M/, 'L')} L${area.at(-1)[0]} 181Z" fill="${primary}" opacity=".18"/><path d="${linePath(curve)}" fill="none" stroke="${primary}" stroke-width="2.2"/><path d="M200 181V61" stroke="${accent}" stroke-dasharray="3 5" opacity=".5"/><text x="60" y="94" fill="${accent}" font-size="25" font-family="Georgia,serif" font-style="italic">P(A)</text><text x="282" y="89" fill="${primary}" font-size="16" font-family="Georgia,serif">∑ p = 1</text>`;
    } else if (resource.art === 'inference') {
      const dots = Array.from({ length: 26 }, (_, index) => { const horizontal = 70 + (index * 73) % 260; return `<circle cx="${horizontal}" cy="${177 - (horizontal - 60) * .32 + Math.sin(index * 9) * 25}" r="${index % 3 ? 2.5 : 3.5}" fill="${primary}" opacity=".7"/>`; }).join('');
      drawing = `${axes}<path d="M62 184 341 90V55L62 148Z" fill="${primary}" opacity=".09"/><path d="M62 167 341 73" stroke="${accent}" stroke-width="1.5"/>${dots}<text x="110" y="82" fill="${accent}" font-size="28" font-family="Georgia,serif">x̄ ± ?</text>`;
    } else if (resource.art === 'algebra') {
      drawing = `<g stroke="${primary}" fill="none" stroke-width="1.2"><path d="m129 153 72 29 83-50-72-29Z M129 153V80l83-47 72 27v72M201 182V109l83-49M129 80l72 29 11-76"/><path d="m129 80 83 23 72-43M212 103v-70" stroke-dasharray="3 4" opacity=".5"/></g><circle cx="201" cy="109" r="4" fill="${accent}"/><text x="44" y="174" fill="${accent}" font-size="22" font-family="Georgia,serif" font-style="italic">x + y</text>`;
    } else if (resource.art === 'trigonometry') {
      const wave = linePath(Array.from({ length: 81 }, (_, index) => [188 + index * 2.1, 119 - 45 * Math.sin(index / 80 * Math.PI * 2)]));
      drawing = `<g fill="none" stroke="${primary}"><path d="M35 119H365M109 189V49" opacity=".28"/><circle cx="109" cy="119" r="57" opacity=".6"/><path d="M109 119 149 79 149 119Z" stroke-width="1.5"/><path d="M149 79H228" stroke-dasharray="3 5" opacity=".4"/><path d="${wave}" stroke-width="2"/></g><circle cx="149" cy="79" r="4" fill="${accent}"/><text x="248" y="181" fill="${accent}" font-size="25" font-family="Georgia,serif" font-style="italic">sen θ</text>`;
    } else {
      const curve = linePath(Array.from({ length: 81 }, (_, index) => [70 + index * 3.3, 174 - 48 * Math.sin(index / 80 * Math.PI) - index * .6]));
      const rectangles = Array.from({ length: 14 }, (_, index) => { const horizontal = 92 + index * 16; const vertical = 174 - 48 * Math.sin((horizontal - 70) / 264 * Math.PI) - (horizontal - 70) / 3.3 * .6; return `<rect x="${horizontal}" y="${vertical}" width="15" height="${181 - vertical}" fill="${primary}" fill-opacity=".14" stroke="${primary}" stroke-opacity=".35" stroke-width=".7"/>`; }).join('');
      drawing = `${axes}${rectangles}<path d="${curve}" stroke="${primary}" stroke-width="2" fill="none"/><text x="108" y="88" fill="${accent}" font-size="36" font-family="Georgia,serif">∫</text><text x="134" y="84" fill="${accent}" font-size="18" font-family="Georgia,serif" font-style="italic">f(x) dx</text>`;
    }
    return `<svg viewBox="0 0 400 230" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}${drawing}</svg>`;
  }

  function heroArt() {
    const project = (horizontal, depth) => [250 + 44 * horizontal + 23 * depth, 217 - 29 * (.24 * horizontal ** 2 + .13 * depth ** 2) - 12 * depth];
    let mesh = '';
    for (let depth = -3; depth <= 3; depth += .5) mesh += `<path d="${linePath(Array.from({ length: 51 }, (_, index) => project(-3 + index * .12, depth)))}"/>`;
    for (let horizontal = -3; horizontal <= 3; horizontal += .5) mesh += `<path d="${linePath(Array.from({ length: 51 }, (_, index) => project(horizontal, -3 + index * .12)))}"/>`;
    return `<svg class="hero-diagram" viewBox="0 0 500 270" aria-hidden="true"><defs><linearGradient id="hero-mesh" x1="50" y1="220" x2="400" y2="30" gradientUnits="userSpaceOnUse"><stop stop-color="#3c7e94"/><stop offset=".5" stop-color="#89d7c2"/><stop offset="1" stop-color="#becab8"/></linearGradient><radialGradient id="hero-glow"><stop stop-color="#8ed7ca" stop-opacity=".08"/><stop offset="1" stop-color="#8ed7ca" stop-opacity="0"/></radialGradient></defs><ellipse cx="260" cy="150" rx="235" ry="120" fill="url(#hero-glow)"/><g fill="none" stroke="#a1c4c8" stroke-opacity=".19"><path d="M55 239H442M250 258V21M120 260 385 51" stroke-width=".7"/></g><g fill="none" stroke="url(#hero-mesh)" stroke-width=".8" opacity=".9">${mesh}</g><path d="M173 216 328 91" stroke="#d5d3aa" stroke-width="1.5"/><circle cx="250" cy="154" r="4" fill="#e0debb"/><circle cx="250" cy="154" r="11" fill="none" stroke="#cfe1c1" opacity=".25"/><path d="M258 151 335 122" stroke="#b9cdb5" stroke-dasharray="2 5" opacity=".5"/><text x="343" y="124" fill="#c0d3be" font-size="23" font-family="Georgia,serif" font-style="italic">f′(x)</text><text x="64" y="66" fill="#80acae" font-size="18" font-family="Georgia,serif" font-style="italic">Δy / Δx</text><text x="443" y="251" fill="#608898" font-size="12" font-family="Georgia,serif">x</text><text x="259" y="28" fill="#608898" font-size="12" font-family="Georgia,serif">y</text></svg>`;
  }

  function saveButton(resource, detailed = false) {
    const active = saved.has(resource.id);
    return `<button class="save-button" type="button" data-save="${resource.id}" data-detailed="${detailed}" aria-pressed="${active}" aria-label="${active ? 'Quitar de' : 'Guardar en'} mi biblioteca: ${escape(resource.title)}">${icon('bookmark')}${detailed ? `<span class="save-label">${active ? 'Guardado en mi biblioteca' : 'Guardar en mi biblioteca'}</span>` : ''}</button>`;
  }

  function card(resource) {
    const format = library.formats[resource.type];
    return `<article class="content-card ${resource.color}"><a href="#contenido/${resource.id}" class="card-art" tabindex="-1" aria-hidden="true">${artwork(resource)}<span class="art-label">MATHBRAIN / EXPLORA LAS IDEAS</span><span class="art-type">${icon(format.icon)}${format.title}</span><span class="card-open">↗</span></a>${saveButton(resource)}<div class="card-copy"><p class="card-topic">${topicName(resource.topic)}</p><h3><a href="#contenido/${resource.id}">${escape(resource.title)}</a></h3><p>${escape(resource.description)}</p><div class="card-meta"><span class="level-indicator ${resource.level === 'Inicial' ? 'initial' : ''}" aria-hidden="true"><i></i><i></i><i></i></span>${resource.level}<span>${resource.type === 'exercise' ? `${resource.steps.length} pasos` : resource.type === 'simulation' ? 'Interactiva' : 'Lectura'}</span></div></div></article>`;
  }

  function shelf(id, title, description, resources, destination) {
    if (!resources.length) return '';
    return `<section class="shelf" aria-labelledby="title-${id}"><div class="section-heading"><div><h2 id="title-${id}">${title}</h2><p>${description}</p></div><div class="shelf-actions">${destination ? `<a class="see-all" href="${destination}">Ver todo <span aria-hidden="true">↗</span></a>` : ''}<button type="button" class="rail-arrow" data-rail="rail-${id}" data-direction="-1" aria-label="Anterior en ${title}" disabled>${icon('left')}</button><button type="button" class="rail-arrow" data-rail="rail-${id}" data-direction="1" aria-label="Siguiente en ${title}">${icon('right')}</button></div></div><div class="content-rail" id="rail-${id}" tabindex="0" aria-label="${title}">${resources.map(card).join('')}</div></section>`;
  }

  function updateRails() {
    selectAll('.content-rail').forEach(rail => {
      const maximum = rail.scrollWidth - rail.clientWidth;
      selectAll(`[data-rail="${rail.id}"]`).forEach(button => { button.disabled = Number(button.dataset.direction) < 0 ? rail.scrollLeft <= 2 : rail.scrollLeft >= maximum - 2; });
    });
  }

  function bindRails() {
    selectAll('.content-rail').forEach(rail => {
      if (!rail.dataset.bound) { rail.addEventListener('scroll', updateRails, { passive: true }); rail.dataset.bound = 'true'; }
    });
    requestAnimationFrame(updateRails);
  }

  function renderCatalog() {
    select('#home-view').hidden = page !== 'inicio';
    select('#catalog-heading').hidden = page === 'inicio';
    select('#results-count').textContent = '';
    select('#empty-state').hidden = true;
    select('#learning-paths').hidden = page !== 'inicio';
    select('#saved-count').textContent = saved.size;
    select('#content-search').value = filters.query;
    select('#topic-filter').value = filters.topic;
    select('#level-filter').value = filters.level;
    selectAll('[data-format]').forEach(button => {
      const active = button.dataset.format === filters.type;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    if (page === 'inicio') {
      const featured = ['calculo-diferencial-3', 'algebra-2', 'probabilidad-1', 'trigonometria-2', 'calculo-integral-2', 'inferencia-estadistica-3', 'algebra-4', 'probabilidad-4'].map(id => resourceById.get(id));
      select('#recent-shelf').innerHTML = shelf('recent', 'Vuelve a tus ideas', 'Los contenidos que exploraste recientemente en este navegador.', recent.slice(0, 6).map(id => resourceById.get(id)), '');
      select('#catalog-content').innerHTML = shelf('start', 'Empieza por una idea', 'Explicaciones que van directo al «¿por qué?».', featured, '#explorar?tipo=explanation')
        + shelf('simulations', 'Menos imaginar. Más experimentar.', 'Mueve, cambia, prueba. Aquí tú tienes el control.', library.search({ type: 'simulation' }), '#simulaciones')
        + shelf('exercises', 'Del «no entiendo» al «ahora sí»', 'Ejercicios resueltos, una decisión a la vez.', library.search({ type: 'exercise' }), '#ejercicios')
        + `<section class="shelf" aria-labelledby="topics-title"><div class="section-heading"><div><h2 id="topics-title">¿Qué te da curiosidad hoy?</h2><p>Encuentra todas las formas de explorar un tema.</p></div></div><div class="topic-grid">${library.topics.map(topic => `<a class="topic-tile ${topic.color}" href="#explorar?tema=${topic.id}"><span class="topic-symbol" aria-hidden="true">${topic.symbol}</span><strong>${topic.title}</strong><small>${library.search({ topic: topic.id }).length} contenidos para explorar</small></a>`).join('')}</div></section>`;
    } else {
      const resources = library.search({ ...filters, ids: page === 'biblioteca' ? saved : null });
      const title = page === 'biblioteca' ? 'Tu biblioteca de ideas.' : filters.query ? `Resultados para «${filters.query}»` : filters.type === 'simulation' ? 'Aprende haciendo.' : filters.type === 'exercise' ? 'Una solución, paso a paso.' : filters.topic !== 'all' ? `Explora ${topicName(filters.topic).toLowerCase()}.` : 'Encuentra esa idea.';
      select('#catalog-title').textContent = title;
      select('#catalog-eyebrow').textContent = page === 'biblioteca' ? 'LO QUE QUIERES TENER CERCA' : filters.type === 'simulation' ? 'EL LABORATORIO MATHBRAIN' : 'EXPLORA A TU MANERA';
      select('#catalog-description').textContent = page === 'biblioteca' ? 'Tus contenidos guardados en este navegador. Vuelve a ellos cuando quieras.' : 'Elige un tema, encuentra la explicación y pasa de entender a experimentar.';
      select('#results-count').textContent = `${resources.length} ${resources.length === 1 ? 'contenido encontrado' : 'contenidos encontrados'}`;
      select('#catalog-content').innerHTML = `<div class="resource-grid">${resources.map(card).join('')}</div>`;
      if (!resources.length) {
        select('#empty-state').hidden = false;
        select('#empty-title').textContent = page === 'biblioteca' && !saved.size ? 'Tu próxima gran idea puede empezar aquí.' : 'Todavía no encontramos esa idea.';
        select('#empty-description').textContent = page === 'biblioteca' && !saved.size ? 'Pulsa el marcador de cualquier contenido para guardarlo en tu biblioteca.' : 'Prueba con «derivadas», «ecuaciones» o «probabilidad», o cambia los filtros.';
      }
      document.title = `${title} | MathBrain`;
    }
    bindRails();
  }

  function updateCatalog(changes = {}, replace = false) {
    filters = { ...filters, ...changes };
    const destination = page === 'biblioteca' ? 'biblioteca' : 'explorar';
    const parameters = new URLSearchParams();
    if (filters.query) parameters.set('q', filters.query);
    if (filters.type !== 'all') parameters.set('tipo', filters.type);
    if (filters.topic !== 'all') parameters.set('tema', filters.topic);
    if (filters.level !== 'all') parameters.set('nivel', filters.level);
    const address = `#${destination}${parameters.size ? `?${parameters}` : ''}`;
    history[replace && page !== 'inicio' ? 'replaceState' : 'pushState'](null, '', address);
    route(false);
  }

  function relatedPanel(resource) {
    const candidates = library.resources.filter(candidate => candidate.id !== resource.id && candidate.courseId === resource.courseId);
    const otherFormats = ['simulation', 'exercise', 'explanation'].filter(type => type !== resource.type).map(type => candidates.find(candidate => candidate.type === type)).filter(Boolean);
    const selectedIds = new Set(otherFormats.map(candidate => candidate.id));
    const related = [...otherFormats, ...candidates.filter(candidate => !selectedIds.has(candidate.id))].slice(0, 4);
    const course = courses.find(candidate => candidate.id === resource.courseId);
    return `<aside class="detail-aside"><div class="related-panel"><h2>Conecta esta idea</h2><p>Otra forma de entender el mismo tema.</p>${related.map(candidate => `<a class="related-link" href="#contenido/${candidate.id}"><small>${library.formats[candidate.type].title}</small><strong>${escape(candidate.title)} <span aria-hidden="true">↗</span></strong></a>`).join('')}<a class="related-link" href="#curso/${course.id}"><small>Ruta de aprendizaje</small><strong>${escape(course.title)} →</strong></a></div><p class="prerequisite"><strong>Un buen punto de partida</strong>${escape(course.prerequisite)}</p></aside>`;
  }

  function videoSource(value) {
    if (!value) return null;
    let url;
    try { url = new URL(value, location.href); } catch { return null; }
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    let videoId;
    if (['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'].includes(url.hostname)) videoId = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)/)?.[1];
    if (url.hostname === 'youtu.be') videoId = url.pathname.slice(1);
    if (videoId && /^[\w-]{11}$/.test(videoId)) return { type: 'iframe', src: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0` };
    if (['vimeo.com', 'www.vimeo.com', 'player.vimeo.com'].includes(url.hostname)) {
      const match = url.pathname.match(/(?:\/video)?\/(\d+)/);
      if (match) return { type: 'iframe', src: `https://player.vimeo.com/video/${match[1]}` };
    }
    return /\.(mp4|webm)$/i.test(url.pathname) ? { type: 'video', src: url.href } : null;
  }

  function renderResource(resource) {
    recent = [resource.id, ...recent.filter(id => id !== resource.id)].slice(0, 8);
    storeList('mathbrain-recent', recent);
    const format = library.formats[resource.type];
    const source = videoSource(resource.video);
    const video = !source ? '' : `<div class="video-stage">${source.type === 'iframe' ? `<iframe title="${escape(resource.title)}" src="${escape(source.src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<video controls playsinline preload="metadata" aria-label="${escape(resource.title)}"><source src="${escape(source.src)}"></video>`}</div>`;
    let body;
    if (resource.type === 'simulation') {
      body = `<div class="simulation-panel">${simulationControls(resource)}</div><div class="reader-body"><h2>La idea detrás de lo que ves</h2><div class="key-concept"><h3>Quédate con esto</h3><p>${escape(resource.key)}</p></div><p>Modifica los controles y observa cómo cambian la gráfica y sus valores. Conecta lo que ves con las explicaciones y los ejercicios de esta misma ruta.</p></div>`;
    } else if (resource.type === 'exercise') {
      body = `<div class="reader-art">${artwork(resource)}</div><div class="reader-body"><h2>Tu reto</h2><p>${escape(resource.statement)}</p><div class="key-concept"><h3>La herramienta que necesitas</h3><p>${escape(resource.key)}</p></div><p>Inténtalo a tu ritmo. Cuando quieras, abre la solución y compara el razonamiento con el tuyo.</p><details class="solution"><summary>Ver solución paso a paso · ${resource.steps.length} pasos</summary><ol class="solution-steps">${resource.steps.map(step => `<li><h3>${escape(step.title)}</h3><p>${escape(step.text)}</p><span class="step-equation">${escape(step.equation)}</span></li>`).join('')}</ol><p class="solution-answer"><strong>Resultado:</strong> ${escape(resource.answer)}</p></details></div>`;
    } else {
      const next = resourceById.get(`${resource.courseId}-${resource.lessonIndex + 2}`);
      body = `${video || `<div class="reader-art">${artwork(resource)}</div>`}<div class="reader-body"><h2>Primero, la intuición</h2>${resource.paragraphs.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}<div class="key-concept"><h3>La idea clave</h3><p>${escape(resource.key)}</p></div><div class="example-box"><h3>Veámoslo con un ejemplo</h3><p>${escape(resource.example)}</p></div><div class="reader-next">${next ? `<a class="button button-secondary" href="#contenido/${next.id}">Siguiente idea ${icon('right')}</a>` : `<a class="button button-secondary" href="#curso/${resource.courseId}">Volver a la ruta ${icon('right')}</a>`}</div></div>`;
    }
    select('#detail-view').innerHTML = `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="#">Inicio</a><span aria-hidden="true">/</span><a href="#explorar?tema=${resource.topic}">${topicName(resource.topic)}</a><span aria-hidden="true">/</span><span>${format.title}</span></nav><header class="detail-header"><p class="eyebrow">${topicName(resource.topic).toUpperCase()} · ${format.title.toUpperCase()} · ${resource.level.toUpperCase()}</p><h1 id="detail-title" tabindex="-1">${escape(resource.title)}</h1><p>${escape(resource.description)}</p><div class="detail-actions">${saveButton(resource, true)}<button type="button" class="text-button" data-copy>${icon('link')}Copiar enlace</button></div></header><div class="detail-layout"><article class="reader ${resource.color}">${body}</article>${relatedPanel(resource)}</div>`;
    document.title = `${resource.title} | MathBrain`;
    if (resource.type === 'simulation') bindSimulation(resource);
  }

  function renderCourse(course) {
    const lessons = library.resources.filter(resource => resource.courseId === course.id && resource.type === 'explanation');
    const extras = library.resources.filter(resource => resource.courseId === course.id && resource.type !== 'explanation');
    select('#detail-view').innerHTML = `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="#">Inicio</a><span aria-hidden="true">/</span><a href="#explorar">Explorar</a><span aria-hidden="true">/</span><span>Ruta de aprendizaje</span></nav><header class="detail-header"><p class="eyebrow">RUTA DE APRENDIZAJE · NIVEL ${course.level.toUpperCase()}</p><h1 id="detail-title" tabindex="-1">${escape(course.title)}</h1><p>${escape(course.intro)}</p><div class="detail-actions"><a class="button button-primary" href="#contenido/${lessons[0].id}">${icon('book')}Empezar la ruta</a><button class="text-button" type="button" data-download="${course.id}">${icon('download')}Descargar programa</button></div></header><div class="detail-layout"><div><div class="lesson-list">${lessons.map((lesson, index) => `<a href="#contenido/${lesson.id}"><span class="lesson-number">${String(index + 1).padStart(2, '0')}</span><span><strong>${escape(lesson.title)}</strong><small>${escape(lesson.description)}</small></span><span aria-hidden="true">↗</span></a>`).join('')}</div></div><aside class="detail-aside"><div class="related-panel"><h2>Practica esta ruta</h2><p>Entender, experimentar y resolver.</p>${extras.map(resource => `<a class="related-link" href="#contenido/${resource.id}"><small>${library.formats[resource.type].title}</small><strong>${escape(resource.title)} ↗</strong></a>`).join('')}</div><p class="prerequisite"><strong>Antes de empezar</strong>${escape(course.prerequisite)}</p></aside></div>`;
    document.title = `${course.title} | MathBrain`;
  }

  function missingResource() {
    select('#detail-view').innerHTML = '<div class="empty-state"><h1 id="detail-title" tabindex="-1">Esta idea no está en ese enlace.</h1><p>El enlace puede estar incompleto. Encuentra el tema en el catálogo.</p><a class="button button-primary" href="#explorar">Explorar contenidos</a></div>';
    document.title = 'Contenido no encontrado | MathBrain';
  }

  function route(shouldFocus = true) {
    if (shouldFocus && lastRoutedHash === location.hash) return;
    lastRoutedHash = location.hash;
    const [rawPath, rawParameters = ''] = location.hash.slice(1).split('?');
    let destination;
    try { destination = decodeURIComponent(rawPath); } catch { destination = 'invalid'; }
    const parameters = new URLSearchParams(rawParameters);
    filters = { query: (parameters.get('q') || '').slice(0, 160), type: library.formats[parameters.get('tipo')] ? parameters.get('tipo') : 'all', topic: library.topics.some(topic => topic.id === parameters.get('tema')) ? parameters.get('tema') : 'all', level: ['Inicial', 'Intermedio'].includes(parameters.get('nivel')) ? parameters.get('nivel') : 'all' };
    page = !destination || destination === 'inicio' ? 'inicio' : destination === 'biblioteca' ? 'biblioteca' : destination === 'nosotros' ? 'nosotros' : ['explorar', 'cursos', 'enfoque', 'simulaciones', 'ejercicios'].includes(destination) ? 'explorar' : 'detalle';
    if (destination === 'simulaciones') filters.type = 'simulation';
    if (destination === 'ejercicios') filters.type = 'exercise';
    select('#home-view').hidden = page !== 'inicio';
    select('.discovery').hidden = !['inicio', 'explorar', 'biblioteca'].includes(page);
    select('#learning-paths').hidden = page !== 'inicio';
    select('#detail-view').hidden = page !== 'detalle';
    select('#about-view').hidden = page !== 'nosotros';
    select('#content-search').value = filters.query;
    if (page === 'detalle') {
      const resourceMatch = destination.match(/^contenido\/([\w-]+)$/);
      const courseMatch = destination.match(/^curso\/([\w-]+)(?:\/(\d+))?$/);
      const course = courseMatch && courses.find(candidate => candidate.id === courseMatch[1]);
      const resource = resourceMatch ? resourceById.get(resourceMatch[1]) : course && courseMatch[2] ? resourceById.get(`${course.id}-${Math.min(course.lessons.length, Math.max(1, Number(courseMatch[2])))}`) : null;
      if (resource) renderResource(resource);
      else if (course) renderCourse(course);
      else missingResource();
    } else if (page === 'nosotros') {
      select('#detail-view').replaceChildren();
      document.title = 'Sobre MathBrain | MathBrain';
    } else {
      select('#detail-view').replaceChildren();
      renderCatalog();
      if (page === 'inicio') document.title = 'MathBrain — Dale play a tu curiosidad';
    }
    const activeNav = page === 'explorar' ? filters.type === 'simulation' ? 'simulaciones' : filters.type === 'exercise' ? 'ejercicios' : 'explorar' : page;
    selectAll('[data-nav]').forEach(link => {
      const active = link.dataset.nav === activeNav;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      link.setAttribute('aria-label', link.dataset.nav === 'biblioteca' ? 'Mi biblioteca' : link.textContent.trim());
    });
    if (shouldFocus) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const heading = page === 'detalle' ? select('#detail-title') : page === 'nosotros' ? select('#about-title') : page === 'inicio' ? select('#main') : select('#catalog-title');
      heading?.focus({ preventScroll: true });
    }
  }

  function simulationControls(resource) {
    const config = {
      derivative: { label: 'Posición del punto, x', min: -2, max: 2, step: .05, value: 1 },
      riemann: { label: 'Número de rectángulos', min: 1, max: 50, step: 1, value: 8 },
      circle: { label: 'Ángulo del giro', min: 0, max: 360, step: 1, value: 45 },
      probability: { label: 'Probabilidad de obtener cara', min: 0, max: 1, step: .05, value: .5 }
    }[resource.simulation];
    return `<div id="simulation-graph" class="simulation-graph"></div><div class="simulation-controls"><label class="slider-label" for="simulation-slider"><span>${config.label}</span><output id="simulation-value" for="simulation-slider"></output></label><input id="simulation-slider" type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.value}">${resource.simulation === 'riemann' ? '<label class="simulation-select" for="riemann-method">Altura de cada rectángulo<select id="riemann-method"><option value="left">Extremo izquierdo</option><option value="right">Extremo derecho</option><option value="midpoint" selected>Punto medio</option></select></label>' : ''}${resource.simulation === 'probability' ? '<div class="simulation-buttons"><button type="button" id="toss-coins" class="button button-primary">Lanzar 100 veces</button><button type="button" id="reset-coins" class="button button-secondary">Reiniciar</button></div>' : ''}<div id="simulation-stats" class="simulation-stats" aria-live="polite" aria-atomic="true"></div><p id="simulation-explanation" class="simulation-explanation"></p></div>`;
  }

  function graphFrame(label, drawing) {
    return `<svg viewBox="0 0 600 300" role="img" aria-label="${escape(label)}"><defs><pattern id="simulation-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#a7c9d5" stroke-opacity=".08" fill="none"/></pattern><clipPath id="simulation-clip"><rect x="35" y="20" width="530" height="245"/></clipPath></defs><rect width="600" height="300" fill="url(#simulation-grid)"/>${drawing}</svg>`;
  }

  function stat(label, value) { return `<div class="simulation-stat"><small>${label}</small><strong>${value}</strong></div>`; }

  function bindSimulation(resource) {
    const slider = select('#simulation-slider');
    let flips = [];
    function render() {
      const value = Number(slider.value);
      let graph;
      let statistics;
      let explanation;
      let controlValue;
      if (resource.simulation === 'derivative') {
        const horizontal = input => 300 + input * 100;
        const vertical = input => 250 - input * 45;
        const curve = linePath(Array.from({ length: 101 }, (_, index) => { const input = -2.4 + index * .048; return [horizontal(input), vertical(input ** 2)]; }));
        const tangent = linePath([-3, 3].map(input => [horizontal(input), vertical(value ** 2 + 2 * value * (input - value))]));
        graph = graphFrame(`Parábola f(x) = x². En x = ${number(value)}, la pendiente es ${number(2 * value)}.`, `<path d="M40 250H560M300 270V20" stroke="#8ba8bd" stroke-opacity=".4"/><g clip-path="url(#simulation-clip)" fill="none"><path d="${curve}" stroke="#9adfd2" stroke-width="2.5"/><path d="${tangent}" stroke="#e9cd9c" stroke-width="1.8"/><path d="M${horizontal(value)} 250V${vertical(value ** 2)}H300" stroke="#e9cd9c" stroke-dasharray="4 6" opacity=".3"/></g><circle cx="${horizontal(value)}" cy="${vertical(value ** 2)}" r="5" fill="#e9cd9c"/><circle cx="${horizontal(value)}" cy="${vertical(value ** 2)}" r="12" fill="none" stroke="#e9cd9c" opacity=".3"/><g fill="#8ba8bd" font-family="Arial,sans-serif" font-size="11"><text x="96" y="280">−2</text><text x="196" y="280">−1</text><text x="297" y="280">0</text><text x="397" y="280">1</text><text x="497" y="280">2</text></g><text x="415" y="40" fill="#9adfd2" font-family="Georgia,serif" font-size="18">f(x) = x²</text><text x="48" y="39" fill="#e9cd9c" font-family="Arial,sans-serif" font-size="10">RECTA TANGENTE</text>`);
        statistics = stat('Posición x', number(value)) + stat('Altura f(x)', number(value ** 2)) + stat('Pendiente f′(x)', number(2 * value));
        explanation = value < 0 ? 'La pendiente es negativa: al avanzar hacia la derecha, esta parte de la parábola desciende.' : value > 0 ? 'La pendiente es positiva: al avanzar hacia la derecha, esta parte de la parábola crece.' : 'La tangente es horizontal. La pendiente es cero y aquí la parábola alcanza su mínimo.';
        controlValue = number(value, 2);
      } else if (resource.simulation === 'riemann') {
        const method = select('#riemann-method').value;
        const offset = method === 'left' ? 0 : method === 'right' ? 1 : .5;
        const rectangles = Array.from({ length: value }, (_, index) => {
          const height = ((index + offset) / value) ** 2;
          return `<rect x="${65 + index / value * 470}" y="${250 - height * 200}" width="${470 / value}" height="${height * 200}" fill="#9adfd2" fill-opacity=".16" stroke="#9adfd2" stroke-opacity=".55" stroke-width=".7"/>`;
        }).join('');
        const curve = linePath(Array.from({ length: 101 }, (_, index) => [65 + index * 4.7, 250 - (index / 100) ** 2 * 200]));
        const area = library.riemannSum(value, method);
        graph = graphFrame(`${value} rectángulos aproximan el área bajo x² de 0 a 1. Suma ${number(area, 5)}.`, `<path d="M55 250H552M65 262V28" stroke="#8ba8bd" stroke-opacity=".4"/>${rectangles}<path d="${curve}" stroke="#e9cd9c" stroke-width="2.3" fill="none"/><g fill="#8ba8bd" font-size="12" font-family="Arial,sans-serif"><text x="60" y="280">0</text><text x="530" y="280">1</text><text x="40" y="55">1</text></g><text x="100" y="45" fill="#e9cd9c" font-size="18" font-family="Georgia,serif">∫₀¹ x² dx = 1/3</text>`);
        statistics = stat('Área aproximada', number(area, 5)) + stat('Área exacta', '1/3') + stat('Error absoluto', number(Math.abs(area - 1 / 3), 5));
        explanation = `Con ${value} ${value === 1 ? 'rectángulo' : 'rectángulos'} y ${method === 'left' ? 'extremos izquierdos, subestimas' : method === 'right' ? 'extremos derechos, sobreestimas' : 'puntos medios, subestimas'} el área de esta función. Aumenta el número de rectángulos para mejorar la aproximación.`;
        controlValue = String(value);
      } else if (resource.simulation === 'circle') {
        const { sine, cosine, radians } = library.unitCircle(value);
        const pointX = 162 + cosine * 95;
        const pointY = 153 - sine * 95;
        const wave = linePath(Array.from({ length: 121 }, (_, index) => [322 + index / 120 * 225, 153 - Math.sin(index / 120 * Math.PI * 2) * 70]));
        const waveX = 322 + value / 360 * 225;
        graph = graphFrame(`Círculo unitario. Ángulo ${value} grados, coseno ${number(cosine)} y seno ${number(sine)}.`, `<g stroke="#8ba8bd" stroke-opacity=".35" fill="none"><path d="M45 153H277M162 36V270M315 153H558"/><circle cx="162" cy="153" r="95"/></g><path d="M162 153H${pointX}V${pointY}Z" fill="#a6c5f1" fill-opacity=".07" stroke="#a6c5f1" stroke-width="1.8"/><path d="M162 153H${pointX}" stroke="#e9cd9c" stroke-width="3"/><path d="M${pointX} 153V${pointY}" stroke="#9adfd2" stroke-width="3"/><circle cx="${pointX}" cy="${pointY}" r="5" fill="#d8e6c7"/><path d="${wave}" fill="none" stroke="#9adfd2" stroke-width="2"/><path d="M${waveX} 153V${153 - sine * 70}" stroke="#9adfd2" stroke-dasharray="4 4" opacity=".6"/><circle cx="${waveX}" cy="${153 - sine * 70}" r="4" fill="#d8e6c7"/><g fill="#8ba8bd" font-family="Arial,sans-serif" font-size="10"><text x="324" y="252">0°</text><text x="420" y="252">180°</text><text x="525" y="252">360°</text><text x="322" y="45" fill="#9adfd2">SENO DEL ÁNGULO</text><text x="64" y="286" fill="#e9cd9c">cos θ</text><text x="205" y="286" fill="#9adfd2">sen θ</text></g>`);
        statistics = stat('Coseno', number(cosine)) + stat('Seno', number(sine)) + stat('Radianes', number(radians));
        explanation = 'El tramo horizontal muestra el coseno y el vertical, el seno. Sus signos cambian según el cuadrante. La onda muestra cómo varía el seno al completar una vuelta.';
        controlValue = `${value}°`;
      } else {
        let heads = 0;
        const points = flips.map((flip, index) => { heads += flip; return [65 + (index + 1) / Math.max(flips.length, 100) * 470, 250 - heads / (index + 1) * 205]; });
        const frequency = flips.length ? heads / flips.length : null;
        graph = graphFrame(flips.length ? `${flips.length} lanzamientos: ${heads} caras. Frecuencia ${number(frequency)} y probabilidad ${number(value)}.` : 'Sin lanzamientos. Pulsa Lanzar 100 veces para iniciar el experimento.', `<path d="M55 250H550M65 262V28" stroke="#8ba8bd" stroke-opacity=".4"/><path d="M65 ${250 - value * 205}H540" stroke="#e9cd9c" stroke-width="1.4" stroke-dasharray="5 5"/>${points.length ? `<path d="${linePath(points)}" stroke="#9adfd2" stroke-width="1.6" fill="none"/>` : '<text x="300" y="150" text-anchor="middle" fill="#94aec8" font-size="14" font-family="Arial,sans-serif">Tu experimento empieza con un lanzamiento.</text>'}<g fill="#8ba8bd" font-size="11" font-family="Arial,sans-serif"><text x="42" y="254">0</text><text x="42" y="49">1</text><text x="65" y="280">0</text><text x="511" y="280">${Math.max(flips.length, 100)}</text><text x="80" y="30" fill="#9adfd2">FRECUENCIA DE CARAS</text><text x="405" y="30" fill="#e9cd9c">PROBABILIDAD p</text></g>`);
        statistics = stat('Lanzamientos', number(flips.length, 0)) + stat('Caras', number(heads, 0)) + stat('Frecuencia', frequency === null ? '—' : `${number(frequency * 100, 1)} %`);
        explanation = 'Cada lanzamiento es independiente. La línea amarilla es la probabilidad elegida y la verde, la frecuencia observada. Pueden diferir, especialmente al principio. Al cambiar la probabilidad, el experimento se reinicia. Límite por experimento: 5.000 lanzamientos.';
        controlValue = `${number(value * 100, 0)} %`;
        select('#toss-coins').disabled = flips.length >= 5000;
      }
      select('#simulation-graph').innerHTML = graph;
      select('#simulation-stats').innerHTML = statistics;
      select('#simulation-explanation').textContent = explanation;
      select('#simulation-value').textContent = controlValue;
      slider.setAttribute('aria-valuetext', controlValue);
    }
    slider.addEventListener('input', () => { if (resource.simulation === 'probability') flips = []; render(); });
    select('#riemann-method')?.addEventListener('change', render);
    select('#toss-coins')?.addEventListener('click', () => { flips.push(...library.coinExperiment(Number(slider.value), Math.min(100, 5000 - flips.length))); render(); });
    select('#reset-coins')?.addEventListener('click', () => { flips = []; render(); });
    render();
  }

  function toggleSaved(id) {
    const resource = resourceById.get(id);
    if (!resource) return;
    if (saved.has(id)) saved.delete(id); else saved.add(id);
    const persisted = storeList('mathbrain-saved', [...saved]);
    select('#saved-count').textContent = saved.size;
    selectAll(`[data-save="${id}"]`).forEach(button => {
      button.setAttribute('aria-pressed', String(saved.has(id)));
      button.setAttribute('aria-label', `${saved.has(id) ? 'Quitar de' : 'Guardar en'} mi biblioteca: ${resource.title}`);
      const label = select('.save-label', button);
      if (label) label.textContent = saved.has(id) ? 'Guardado en mi biblioteca' : 'Guardar en mi biblioteca';
    });
    if (page === 'biblioteca') renderCatalog();
    toast(persisted ? saved.has(id) ? 'Idea guardada. Ya está en tu biblioteca.' : 'Contenido eliminado de tu biblioteca.' : 'Cambio guardado durante esta visita. El navegador no permite guardarlo para la próxima.');
  }

  function downloadCourse(id) {
    const course = courses.find(candidate => candidate.id === id);
    if (!course) return;
    const contents = `MATHBRAIN — ${course.title}\n\n${course.intro}\nNivel: ${course.level}\nAntes de empezar: ${course.prerequisite}\n\n${library.resources.filter(resource => resource.courseId === id && resource.type === 'explanation').map((resource, index) => `${index + 1}. ${resource.title}\n${resource.description}\nIdea clave: ${resource.key}\n`).join('\n')}`;
    const address = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = address;
    anchor.download = `MathBrain-${id}-programa.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(address), 1000);
    toast('Programa descargado. Una idea a la vez.');
  }

  selectAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
  select('#hero-art').innerHTML = heroArt();
  select('#library-stats').textContent = `${library.search({ type: 'explanation' }).length} explicaciones · ${library.search({ type: 'simulation' }).length} simulaciones · ${library.search({ type: 'exercise' }).length} ejercicios`;
  select('#course-paths').innerHTML = courses.map(course => `<a class="path-card ${course.color}" href="#curso/${course.id}"><span class="path-symbol" aria-hidden="true">${course.art === 'derivative' ? 'f′' : course.art === 'integral' ? '∫' : course.art === 'probability' ? 'P' : course.art === 'inference' ? 'x̄' : course.art === 'algebra' ? 'x²' : 'θ'}</span><span><strong>${course.title}</strong><small>${course.lessons.length} explicaciones · ${course.level}</small></span><span aria-hidden="true">↗</span></a>`).join('');
  select('#saved-count').textContent = saved.size;
  select('#content-search').addEventListener('input', event => updateCatalog({ query: event.target.value }, true));
  select('#search-form').addEventListener('submit', event => { event.preventDefault(); updateCatalog({ query: select('#content-search').value }); select('#catalog-title').focus(); });
  select('#topic-filter').addEventListener('change', event => updateCatalog({ topic: event.target.value }));
  select('#level-filter').addEventListener('change', event => updateCatalog({ level: event.target.value }));
  selectAll('[data-format]').forEach(button => button.addEventListener('click', () => updateCatalog({ type: button.dataset.format })));
  select('#reset-filters').addEventListener('click', () => { page = 'explorar'; updateCatalog({ query: '', type: 'all', topic: 'all', level: 'all' }); select('#content-search').focus(); });
  document.addEventListener('keydown', event => {
    if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) && !document.activeElement.isContentEditable) { event.preventDefault(); select('#content-search').focus(); }
  });
  document.addEventListener('click', async event => {
    if (event.target.closest('.skip')) {
      event.preventDefault();
      select('#main').focus();
      return;
    }
    const samePageLink = event.target.closest('a[href^="#"]');
    if (samePageLink && new URL(samePageLink.href).hash === location.hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    const save = event.target.closest('[data-save]');
    if (save) { toggleSaved(save.dataset.save); return; }
    const arrow = event.target.closest('[data-rail]');
    if (arrow) {
      const rail = document.getElementById(arrow.dataset.rail);
      rail.scrollBy({ left: Number(arrow.dataset.direction) * rail.clientWidth * .9, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    const download = event.target.closest('[data-download]');
    if (download) downloadCourse(download.dataset.download);
    if (event.target.closest('[data-copy]')) {
      try { await navigator.clipboard.writeText(location.href); toast('Enlace copiado. Comparte esta idea.'); }
      catch { toast('Puedes copiar el enlace desde la barra de direcciones.'); }
    }
  });
  window.addEventListener('hashchange', () => route());
  window.addEventListener('popstate', () => route());
  window.addEventListener('resize', updateRails, { passive: true });
  route(false);
})();
