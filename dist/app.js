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
  const legacyLessons = { 'algebra-1': 8, 'algebra-2': 11, 'algebra-3': 9, 'algebra-4': 13, 'algebra-5': 12, 'trigonometria-1': 19, 'trigonometria-2': 20, 'trigonometria-3': 21, 'trigonometria-4': 22, 'trigonometria-5': 25 };
  const currentId = id => legacyLessons[id] ? `fundamentos-matematicas-${legacyLessons[id]}` : id;
  const saved = new Set(loadList('mathbrain-saved'));
  let recent = loadList('mathbrain-recent');
  // Lecciones que la persona marcó como completadas en este navegador. El progreso de cada curso se calcula con ellas.
  const completed = new Set(loadList('mathbrain-progress'));
  const instructor = { name: 'Carlos Hurtado', role: 'Estadístico de la Universidad Nacional de Colombia', photo: 'assets/autor-carlos.jpeg' };
  const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm}`;
  let currentLessonId = null;
  let outlineOpen = false;
  // Zuka, la mascota (src/mascot.js). Sin ese archivo, los mensajes se muestran sin el dibujo.
  const mascot = window.MATHBRAIN_MASCOT || { svg: () => '', say: (mood, html, className = '') => `<div class="nebi-say ${className}"><p class="nebi-bubble">${html}</p></div>` };
  // Puntos (XP) y racha: días seguidos en los que se completó al menos una lección.
  const stats = loadStats();
  // Estado de la lección paso a paso que está abierta.
  let player = null;
  let page = 'inicio';
  let filters = { query: '', type: 'all', topic: 'all', level: 'all' };
  let courseFilters = { topic: 'all', level: 'all' };
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
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    flame: '<path d="M12 3c1 3.6 5.2 5.6 5.2 10.2a5.2 5.2 0 0 1-10.4 0c0-2.3 1-3.8 2.3-5 .2 1.8 1 2.9 2.4 3.4C10.9 9.1 10.6 5.9 12 3Z"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1.2-4 4.3-6 8-6s6.8 2 8 6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>'
  };

  function icon(name) {
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.book}</svg>`;
  }

  function loadList(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || '[]');
      return Array.isArray(value) ? [...new Set(value.map(currentId).filter(id => resourceById.has(id)))].slice(0, 200) : [];
    } catch {
      return [];
    }
  }

  function dayKey(date = new Date()) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }

  function loadStats() {
    try {
      const value = JSON.parse(localStorage.getItem('mathbrain-stats') || '{}');
      const days = Array.isArray(value.days) ? value.days.filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day)).slice(-120) : [];
      const reviews = Array.isArray(value.reviews) ? value.reviews.filter(item => typeof item === 'string').slice(0, 200) : [];
      return { xp: Number.isFinite(value.xp) && value.xp > 0 ? Math.round(value.xp) : 0, streak: Number.isInteger(value.streak) && value.streak > 0 ? value.streak : 0, lastDay: typeof value.lastDay === 'string' ? value.lastDay : null, days, reviews };
    } catch {
      return { xp: 0, streak: 0, lastDay: null, days: [], reviews: [] };
    }
  }

  function saveStats() {
    try { localStorage.setItem('mathbrain-stats', JSON.stringify(stats)); return true; }
    catch { return false; }
  }

  // La racha sigue viva si la última lección completada fue hoy o ayer.
  function currentStreak() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return [dayKey(), dayKey(yesterday)].includes(stats.lastDay) ? stats.streak : 0;
  }

  function recordStudyDay() {
    const today = dayKey();
    if (stats.lastDay === today) return;
    stats.streak = currentStreak() + 1;
    stats.lastDay = today;
    stats.days = [...stats.days, today].slice(-120);
  }

  function addXp(points) {
    stats.xp += points;
    saveStats();
    updateStatsChip();
  }

  function updateStatsChip() {
    const streak = select('#streak-count');
    const xp = select('#xp-count');
    if (streak) streak.textContent = String(currentStreak());
    if (xp) xp.textContent = `${stats.xp} XP`;
    select('#stats-chip')?.setAttribute('aria-label', `Racha de ${plural(currentStreak(), 'día', 'días')} y ${stats.xp} puntos de experiencia`);
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

  function artwork(resource, square = false) {
    artworkSequence += 1;
    // En el tema claro, las ilustraciones usan fondos suaves y trazos de colores vivos.
    const light = document.documentElement?.dataset?.theme === 'light';
    const palette = (light ? {
      blue: ['#e1f5fe', '#1899d6', '#ff9f1c'], sand: ['#fff2e0', '#f08a00', '#7c5cff'],
      green: ['#e3f9ec', '#1a9e56', '#1cb0f6'], purple: ['#f1ecff', '#6d3fe0', '#ff6f91'],
      rose: ['#ffe6f1', '#e0457f', '#1cb0f6'], slate: ['#ddf7f3', '#0f9488', '#ff9f1c']
    } : {
      blue: ['#11263d', '#8dc8ed', '#b0e7df'], sand: ['#30253b', '#e1bd99', '#b7a9ed'],
      green: ['#12312f', '#9fd6be', '#d8d9a1'], purple: ['#241e42', '#bca5ed', '#8adbd8'],
      rose: ['#322039', '#e2a6c4', '#9ac8e9'], slate: ['#12313c', '#9bd7d5', '#dcd0a5']
    })[resource.color];
    const [background, primary, accent] = palette;
    const patternId = `art-grid-${artworkSequence}`;
    const grid = `<defs><pattern id="${patternId}" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="${primary}" stroke-opacity=".085" stroke-width=".7"/></pattern></defs><rect y="${square ? -85 : 0}" width="400" height="${square ? 400 : 230}" fill="${background}"/><rect y="${square ? -85 : 0}" width="400" height="${square ? 400 : 230}" fill="url(#${patternId})"/>`;
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
    return `<svg viewBox="${square ? '0 -85 400 400' : '0 0 400 230'}" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${grid}${drawing}</svg>`;
  }

  function saveButton(resource, detailed = false) {
    const active = saved.has(resource.id);
    return `<button class="save-button" type="button" data-save="${resource.id}" data-detailed="${detailed}" aria-pressed="${active}" aria-label="${active ? 'Quitar de' : 'Guardar en'} mi biblioteca: ${escape(resource.title)}">${icon('bookmark')}${detailed ? `<span class="save-label">${active ? 'Guardado en mi biblioteca' : 'Guardar en mi biblioteca'}</span>` : ''}</button>`;
  }

  function card(resource) {
    const format = library.formats[resource.type];
    return `<article class="content-card ${resource.color}"><a href="#contenido/${resource.id}" class="card-art" tabindex="-1" aria-hidden="true">${artwork(resource)}<span class="art-label">ZUKA / EXPLORA LAS IDEAS</span><span class="art-type">${icon(format.icon)}${format.title}</span><span class="card-open">↗</span></a>${saveButton(resource)}<div class="card-copy"><p class="card-topic">${topicName(resource.topic)}</p><h3><a href="#contenido/${resource.id}">${escape(resource.title)}</a></h3><p>${escape(resource.description)}</p><div class="card-meta"><span class="level-indicator ${resource.level === 'Inicial' ? 'initial' : ''}" aria-hidden="true"><i></i><i></i><i></i></span>${resource.level}<span>${resource.type === 'exercise' ? `${resource.steps.length} pasos` : resource.type === 'simulation' ? 'Interactiva' : resource.practice ? 'Lectura y práctica' : 'Lectura'}</span></div></div></article>`;
  }

  function courseSymbol(course) {
    return { derivative: 'f′', integral: '∫', probability: 'P(A)', inference: 'x̄', algebra: 'x²', trigonometry: 'θ' }[course.art] || 'π';
  }

  // Portada: la mascota en las ilustraciones y la franja de cursos bajo el héroe.
  function renderLanding() {
    selectAll('[data-mascot]').forEach(element => { element.innerHTML = mascot.svg(element.dataset.mascot); });
    const strip = select('#course-strip');
    if (strip) strip.innerHTML = `<div class="course-strip-track">${courses.map(course => `<a class="strip-course ${course.color}" href="#curso/${course.id}"><span class="strip-icon" aria-hidden="true">${courseSymbol(course)}</span><span>${escape(course.title)}</span></a>`).join('')}</div>`;
  }

  function courseCard(course) {
    const resources = library.resources.filter(resource => resource.courseId === course.id);
    const count = type => resources.filter(resource => resource.type === type).length;
    const simulations = count('simulation');
    const exercises = count('exercise');
    const symbol = courseSymbol(course);
    const progress = courseProgress(course);
    const modules = courseModules(course);
    const challenges = courseLessons(course).reduce((total, lesson) => total + (lesson.practice || 0), 0);
    // Fila de catálogo: icono del curso, nivel, título, descripción y sus niveles, como un temario de un vistazo.
    return `<article class="course-album course-row ${course.color}"><a class="course-album-link" href="#curso/${course.id}" aria-labelledby="course-name-${course.id}"><span class="course-row-icon" aria-hidden="true">${artwork(course, true)}<span class="course-cover-symbol">${symbol}</span></span><div class="course-album-copy"><p class="course-album-topic">NIVEL ${course.level.toUpperCase()} · ${escape(course.label)}</p><div class="course-row-title"><h3 id="course-name-${course.id}">${escape(course.title)}</h3>${progress.done === progress.total ? `<span class="course-row-badge is-done">${icon('check')}Completado</span>` : progress.done ? `<span class="course-row-badge">${progress.percent} %</span>` : ''}</div><p class="course-album-description">${escape(course.description)}</p><div class="course-album-meta"><span>${plural(modules.length, 'nivel', 'niveles')}</span><span>${count('explanation')} explicaciones</span><span>${plural(challenges, 'reto', 'retos')}</span></div><div class="course-album-extras">${simulations ? `<span>${simulations} ${simulations === 1 ? 'simulación' : 'simulaciones'}</span>` : ''}${exercises ? `<span>${exercises} ${exercises === 1 ? 'ejercicio' : 'ejercicios'}</span>` : ''}</div><div class="course-row-levels">${modules.map(module => `<span>${escape(module.name)}</span>`).join('')}</div>${progress.done ? `<div class="course-album-progress">${progressBar(progress, false)}<span>${progress.percent} % completado</span></div>` : ''}</div><span class="course-row-go" aria-hidden="true">${icon('right')}</span></a></article>`;
  }

  function renderCourses() {
    const visibleCourses = courses.filter(course => (courseFilters.topic === 'all' || (course.id === 'probabilidad' ? 'probabilidad' : course.category) === courseFilters.topic) && (courseFilters.level === 'all' || course.level === courseFilters.level));
    select('.course-browser-total strong').textContent = String(courses.length).padStart(2, '0');
    select('#course-level-filter').value = courseFilters.level;
    selectAll('[data-course-topic]').forEach(button => {
      const active = button.dataset.courseTopic === courseFilters.topic;
      button.setAttribute('aria-pressed', String(active));
    });
    select('#course-collection-title').textContent = courseFilters.topic === 'all' ? courseFilters.level === 'all' ? 'Todos los cursos' : 'Cursos de nivel ' + courseFilters.level.toLowerCase() : topicName(courseFilters.topic);
    select('#course-results').textContent = `${visibleCourses.length} ${visibleCourses.length === 1 ? 'curso' : 'cursos'} · Explicaciones y práctica a tu ritmo`;
    // Los cursos se agrupan por área; cada área lista sus cursos en orden.
    const areas = { fundamentos: 'Fundamentos', calculo: 'Cálculo', estadistica: 'Probabilidad y estadística' };
    const groups = [...new Set(visibleCourses.map(course => course.category))].map(category => ({ category, items: visibleCourses.filter(course => course.category === category) }));
    select('#course-grid').classList.add('is-list');
    select('#course-grid').innerHTML = groups.map(({ category, items }) => `${groups.length > 1 ? `<h3 class="course-area">${escape(areas[category] || category)}</h3>` : ''}${items.map(courseCard).join('')}`).join('');
    select('#course-empty').hidden = visibleCourses.length > 0;
    document.title = 'Explorar cursos | Zuka';
  }

  function updateCourseCatalog(changes) {
    courseFilters = { ...courseFilters, ...changes };
    const parameters = new URLSearchParams();
    if (courseFilters.topic !== 'all') parameters.set('curso_tema', courseFilters.topic);
    if (courseFilters.level !== 'all') parameters.set('curso_nivel', courseFilters.level);
    history.pushState(null, '', `#explorar${parameters.size ? `?${parameters}` : ''}`);
    route(false);
  }

  // Panel del día en el inicio: la mascota saluda (por su nombre, si la persona lo dio en su perfil) según la racha, y se muestran XP, lecciones y los cursos en marcha.
  function continueLearning() {
    const active = courses.map(course => ({ course, progress: courseProgress(course) })).filter(({ progress }) => progress.done > 0 && progress.done < progress.total);
    const streak = currentStreak();
    const studiedToday = stats.lastDay === dayKey();
    const suggestions = active.length ? active : [{ course: courses[0], progress: courseProgress(courses[0]) }];
    const name = loadProfile().name;
    const hello = name ? `, ${escape(name)}` : '';
    const mood = studiedToday ? 'celebra' : streak ? 'animo' : active.length ? 'feliz' : 'saluda';
    const message = studiedToday ? `<strong>¡Meta de hoy cumplida${hello}!</strong> Llevas ${plural(streak, 'día', 'días')} de racha.` : streak ? `Llevas <strong>${plural(streak, 'día', 'días')} de racha</strong>. Una lección hoy y la mantienes.` : active.length ? `<strong>¡Qué bueno verte${hello}!</strong> Sigamos donde lo dejaste.` : `<strong>¡Hola! Soy ${mascot.name || 'Zuka'}.</strong> Cada lección toma unos minutos: aprende resolviendo, una idea a la vez.`;
    return `<section class="shelf today-panel" aria-labelledby="continue-title"><div class="today-greeting">${mascot.say(mood, message, 'today-nebi')}<ul class="today-stats" aria-label="Tu progreso"><li>${icon('flame')}<strong>${streak}</strong><span>${streak === 1 ? 'día de racha' : 'días de racha'}</span></li><li>${icon('star')}<strong>${stats.xp}</strong><span>XP</span></li><li>${icon('check')}<strong>${completed.size}</strong><span>${completed.size === 1 ? 'lección' : 'lecciones'}</span></li></ul></div><div class="section-heading"><div><h2 id="continue-title">${active.length ? 'Continúa aprendiendo' : 'Empieza tu camino'}</h2><p>${active.length ? 'Retoma tus cursos donde los dejaste.' : 'Te recomendamos empezar por aquí.'}</p></div></div><div class="continue-grid">${suggestions.map(({ course, progress }) => `<a class="continue-card ${course.color}" href="#contenido/${progress.next.id}"><small>${escape(course.label)}</small><strong>${escape(course.title)}</strong><span class="continue-next">${progress.done ? 'Siguiente' : 'Primera lección'}: ${escape(progress.next.title)}</span>${progress.done ? progressBar(progress) : `<span class="continue-start">${icon('play')}Empezar</span>`}</a>`).join('')}</div></section>`;
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
      const featured = ['calculo-diferencial-3', 'fundamentos-matematicas-11', 'probabilidad-1', 'fundamentos-matematicas-20', 'calculo-integral-2', 'inferencia-estadistica-3', 'fundamentos-matematicas-13', 'probabilidad-4'].map(id => resourceById.get(id));
      // Quien ya empezó ve su panel del día arriba; quien llega por primera vez lo ve después de la portada.
      const today = continueLearning();
      select('#today-panel').innerHTML = completed.size ? today : '';
      // Quien ya empezó ve su panel y sus cursos; la presentación de la portada es para quien llega por primera vez.
      select('#home-view').dataset.returning = String(completed.size > 0);
      select('#recent-shelf').innerHTML = (completed.size ? '' : today) + shelf('recent', 'Vuelve a tus ideas', 'Los contenidos que exploraste recientemente en este navegador.', recent.slice(0, 6).map(id => resourceById.get(id)), '');
      select('#catalog-content').innerHTML = shelf('start', 'Empieza por una idea', 'Explicaciones que van directo al «¿por qué?».', featured, '#explorar?tipo=explanation')
        + shelf('simulations', 'Menos imaginar. Más experimentar.', 'Mueve, cambia, prueba. Aquí tú tienes el control.', library.search({ type: 'simulation' }), '#simulaciones')
        + shelf('exercises', 'Del «no entiendo» al «ahora sí»', 'Ejercicios resueltos, una decisión a la vez.', library.search({ type: 'exercise' }), '#ejercicios')
        + `<section class="shelf" aria-labelledby="topics-title"><div class="section-heading"><div><h2 id="topics-title">¿Qué te da curiosidad hoy?</h2><p>Encuentra todas las formas de explorar un tema.</p></div></div><div class="topic-grid">${library.topics.map(topic => `<a class="topic-tile ${topic.color}" href="#explorar?tema=${topic.id}"><span class="topic-symbol" aria-hidden="true">${topic.symbol}</span><strong>${topic.title}</strong><small>${library.search({ topic: topic.id }).length} contenidos para explorar</small></a>`).join('')}</div></section>`;
    } else {
      const resources = library.search({ ...filters, ids: page === 'biblioteca' ? saved : null });
      const title = page === 'biblioteca' ? 'Tu biblioteca de ideas.' : filters.query ? `Resultados para «${filters.query}»` : filters.type === 'simulation' ? 'Aprende haciendo.' : filters.type === 'exercise' ? 'Una solución, paso a paso.' : filters.topic !== 'all' ? `Explora ${topicName(filters.topic).toLowerCase()}.` : 'Encuentra esa idea.';
      select('#catalog-title').textContent = title;
      select('#catalog-eyebrow').textContent = page === 'biblioteca' ? 'LO QUE QUIERES TENER CERCA' : filters.type === 'simulation' ? 'EL LABORATORIO ZUKA' : 'EXPLORA A TU MANERA';
      select('#catalog-description').textContent = page === 'biblioteca' ? 'Tus contenidos guardados en este navegador. Vuelve a ellos cuando quieras.' : 'Elige un tema, encuentra la explicación y pasa de entender a experimentar.';
      select('#results-count').textContent = `${resources.length} ${resources.length === 1 ? 'contenido encontrado' : 'contenidos encontrados'}`;
      select('#catalog-content').innerHTML = `<div class="resource-grid">${resources.map(card).join('')}</div>`;
      if (!resources.length) {
        select('#empty-state').hidden = false;
        select('#empty-title').textContent = page === 'biblioteca' && !saved.size ? 'Tu próxima gran idea puede empezar aquí.' : 'Todavía no encontramos esa idea.';
        select('#empty-description').textContent = page === 'biblioteca' && !saved.size ? 'Pulsa el marcador de cualquier contenido para guardarlo en tu biblioteca.' : 'Prueba con «derivadas», «ecuaciones» o «probabilidad», o cambia los filtros.';
      }
      document.title = `${title} | Zuka`;
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
    if (destination === 'explorar' && !parameters.size) parameters.set('vista', 'contenidos');
    const address = `#${destination}${parameters.size ? `?${parameters}` : ''}`;
    history[replace && !['inicio', 'cursos'].includes(page) ? 'replaceState' : 'pushState'](null, '', address);
    route(false);
  }

  function relatedPanel(resource) {
    const candidates = library.resources.filter(candidate => candidate.id !== resource.id && candidate.courseId === resource.courseId);
    const otherFormats = ['simulation', 'exercise', 'explanation'].filter(type => type !== resource.type).map(type => candidates.find(candidate => candidate.type === type)).filter(Boolean);
    const selectedIds = new Set(otherFormats.map(candidate => candidate.id));
    const distance = candidate => Number.isInteger(candidate.lessonIndex) && Number.isInteger(resource.lessonIndex) ? Math.abs(candidate.lessonIndex - resource.lessonIndex) : Infinity;
    const related = [...otherFormats, ...candidates.filter(candidate => !selectedIds.has(candidate.id)).sort((first, second) => distance(first) - distance(second))].slice(0, 4);
    const course = courses.find(candidate => candidate.id === resource.courseId);
    return `<aside class="detail-aside"><div class="related-panel"><h2>Conecta esta idea</h2><p>Otra forma de entender el mismo tema.</p>${related.map(candidate => `<a class="related-link" href="#contenido/${candidate.id}"><small>${library.formats[candidate.type].title}</small><strong>${escape(candidate.title)} <span aria-hidden="true">↗</span></strong></a>`).join('')}<a class="related-link" href="#curso/${course.id}"><small>Curso</small><strong>${escape(course.title)} →</strong></a></div><p class="prerequisite"><strong>Un buen punto de partida</strong>${escape(course.prerequisite)}</p></aside>`;
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

  function renderResource(resource, parameters = new URLSearchParams()) {
    recent = [resource.id, ...recent.filter(id => id !== resource.id)].slice(0, 8);
    storeList('mathbrain-recent', recent);
    const format = library.formats[resource.type];
    const source = videoSource(resource.video);
    const video = !source ? '' : `<div class="video-stage">${source.type === 'iframe' ? `<iframe title="${escape(resource.title)}" src="${escape(source.src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>` : `<video controls playsinline preload="metadata" aria-label="${escape(resource.title)}"><source src="${escape(source.src)}"></video>`}</div>`;
    const course = courses.find(candidate => candidate.id === resource.courseId);
    // Las lecciones se recorren paso a paso; «?vista=lectura» las muestra completas en una sola página.
    if (resource.type === 'explanation' && course) return parameters.get('vista') === 'lectura' ? renderLesson(resource, course, video) : renderPlayer(resource, course, video);
    currentLessonId = null;
    let body;
    if (resource.type === 'simulation') {
      body = `<div class="simulation-panel">${simulationControls(resource)}</div><div class="reader-body"><h2>La idea detrás de lo que ves</h2><div class="key-concept"><h3>Quédate con esto</h3><p>${escape(resource.key)}</p></div><p>Modifica los controles y observa cómo cambian la gráfica y sus valores. Conecta lo que ves con las explicaciones y los ejercicios de esta misma ruta.</p></div>`;
    } else if (resource.type === 'exercise') {
      body = `<div class="reader-art">${artwork(resource)}</div><div class="reader-body"><h2>Tu reto</h2><p>${escape(resource.statement)}</p><div class="key-concept"><h3>La herramienta que necesitas</h3><p>${escape(resource.key)}</p></div><p>Inténtalo a tu ritmo. Cuando quieras, abre la solución y compara el razonamiento con el tuyo.</p>${resource.check ? `<form id="answer-check" class="answer-check" novalidate><label for="answer-input">Comprueba tu resultado <span>${escape(resource.check.label)}</span></label><div class="answer-row"><input id="answer-input" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="40" placeholder="Ej.: 3/4, 0,75 o 75 %" aria-describedby="answer-feedback"><button class="button button-secondary" type="submit">Comprobar</button></div><p id="answer-feedback" class="answer-feedback" role="status" aria-live="polite"></p></form>` : ''}<details class="solution"><summary>Ver solución paso a paso · ${resource.steps.length} pasos</summary><ol class="solution-steps">${resource.steps.map(step => `<li><h3>${escape(step.title)}</h3><p>${escape(step.text)}</p><span class="step-equation">${escape(step.equation)}</span></li>`).join('')}</ol><p class="solution-answer"><strong>Resultado:</strong> ${escape(resource.answer)}</p></details></div>`;
    } else {
      const next = resourceById.get(`${resource.courseId}-${resource.lessonIndex + 2}`);
      body = `${video || `<div class="reader-art">${artwork(resource)}</div>`}<div class="reader-body lesson-content">${resource.html}<div class="reader-next">${next ? `<a class="button button-secondary" href="#contenido/${next.id}">Siguiente idea ${icon('right')}</a>` : `<a class="button button-secondary" href="#curso/${resource.courseId}">Volver a la ruta ${icon('right')}</a>`}</div></div>`;
    }
    select('#detail-view').innerHTML = `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="#">Inicio</a><span aria-hidden="true">/</span><a href="#explorar?tema=${resource.topic}">${topicName(resource.topic)}</a><span aria-hidden="true">/</span><span>${format.title}</span></nav><header class="detail-header"><p class="eyebrow">${topicName(resource.topic).toUpperCase()} · ${format.title.toUpperCase()} · ${resource.level.toUpperCase()}</p><h1 id="detail-title" tabindex="-1">${escape(resource.title)}</h1><p>${escape(resource.description)}</p><div class="detail-actions">${saveButton(resource, true)}<button type="button" class="text-button" data-copy>${icon('link')}Copiar enlace</button></div></header><div class="detail-layout"><article class="reader ${resource.color}">${body}</article>${relatedPanel(resource)}</div>`;
    document.title = `${resource.title} | Zuka`;
    if (resource.type === 'simulation') bindSimulation(resource);
    if (resource.type === 'exercise') bindAnswerCheck(resource);
    if (resource.type === 'explanation') bindLessonExercises(resource);
  }

  // Comprueba la respuesta de un ejercicio de lección y escribe la retroalimentación. Devuelve true, false o null (respuesta no válida).
  function checkExercise(form) {
    const feedback = select('.answer-feedback', form);
    let result;
    if (form.dataset.kind === 'choice') {
      const chosen = select('input[type="radio"]:checked', form);
      result = chosen ? chosen.hasAttribute('data-correct') : null;
      if (result === null) { form.dataset.state = 'invalid'; feedback.textContent = 'Elige una de las opciones.'; return null; }
    } else {
      const input = select('input', form);
      result = library.checkAnswer({ value: library.parseAnswer(form.dataset.answer), tolerance: Number(form.dataset.tolerance) || 1e-6, percent: /%\s*$/.test(form.dataset.answer) }, input.value);
      input.setAttribute('aria-invalid', String(result !== true));
      if (result === null) { form.dataset.state = 'invalid'; feedback.textContent = 'Escribe un número, una fracción como 8/3 o un porcentaje como 25 %.'; return null; }
    }
    form.dataset.state = result ? 'correct' : 'incorrect';
    feedback.textContent = result ? '¡Correcto! Abre la solución si quieres comparar tu razonamiento.' : select('.lesson-hint', form) ? 'Todavía no. Abre la pista e inténtalo de nuevo.' : 'Todavía no. Revisa la explicación e inténtalo de nuevo.';
    return result;
  }

  function bindLessonExercises(resource) {
    const forms = selectAll('.lesson-exercise');
    forms.forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const result = checkExercise(form);
      if (result === null) return;
      // Resolver toda la práctica completa la lección, como al terminar un cuestionario.
      if (result && forms.every(entry => entry.dataset.state === 'correct') && !completed.has(resource.id)) {
        setCompleted(resource.id, true, false);
        toast('¡Práctica superada! Marcamos esta lección como completada.');
      }
    }));
  }

  function courseLessons(course) {
    return library.resources.filter(resource => resource.courseId === course.id && resource.type === 'explanation');
  }

  // Módulos del curso con sus lecciones. Cada lección se numera como 1.1, 1.2… salvo que su archivo indique «modulo».
  function courseModules(course) {
    const lessons = courseLessons(course);
    const definitions = course.modules?.length ? course.modules : [{ title: course.title, summary: course.intro, objectives: [], extras: [] }];
    return definitions.map((definition, index) => {
      const [kicker, ...rest] = definition.title.split(' · ');
      const items = course.modules?.length ? lessons.filter(lesson => lesson.unit === definition.title) : lessons;
      return {
        index,
        kicker: rest.length ? kicker : `Módulo ${index + 1}`,
        name: rest.length ? rest.join(' · ') : definition.title,
        summary: definition.summary || '',
        objectives: definition.objectives || [],
        lessons: items.map((lesson, position) => ({ lesson, label: lesson.module || `${index + 1}.${position + 1}` })),
        extras: (definition.extras || []).map(id => resourceById.get(id)).filter(Boolean)
      };
    });
  }

  function courseProgress(course) {
    const lessons = courseLessons(course);
    const done = lessons.filter(lesson => completed.has(lesson.id)).length;
    // Para continuar se propone la primera lección pendiente después de la más avanzada que se completó.
    const furthest = lessons.reduce((last, lesson, index) => completed.has(lesson.id) ? index : last, -1);
    const next = lessons.slice(furthest + 1).find(lesson => !completed.has(lesson.id)) || lessons.find(lesson => !completed.has(lesson.id)) || lessons[0];
    return { done, total: lessons.length, percent: lessons.length ? Math.round(done / lessons.length * 100) : 0, next };
  }

  function progressBar(progress, label = true) {
    return `<div class="course-progress"><span class="course-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}" aria-label="Progreso del curso: ${progress.percent} %"><span style="width:${progress.percent}%"></span></span>${label ? `<span class="course-progress-label">${progress.percent} % completado · ${progress.done} de ${progress.total} lecciones</span>` : ''}</div>`;
  }

  // Estimación real a partir del contenido: minutos de lectura de cada lección y unos tres minutos por ejercicio.
  function studyHours(course) {
    const minutes = courseLessons(course).reduce((total, lesson) => total + (lesson.minutes || 3) + (lesson.practice || 0) * 3, 0);
    return Math.max(1, Math.round(minutes / 60));
  }

  function lessonMeta(lesson) {
    return [lesson.video ? 'Video y lectura' : 'Lectura', `${lesson.minutes || 3} min`, lesson.practice ? plural(lesson.practice, 'ejercicio', 'ejercicios') : ''].filter(Boolean).join(' · ');
  }

  function extraMeta(resource) {
    return `${library.formats[resource.type].title} · ${resource.type === 'simulation' ? 'Interactiva' : plural(resource.steps.length, 'paso', 'pasos')}`;
  }

  function renderCourse(course) {
    currentLessonId = null;
    const modules = courseModules(course);
    const lessons = courseLessons(course);
    const progress = courseProgress(course);
    const exercises = lessons.reduce((total, lesson) => total + (lesson.practice || 0), 0);
    const extras = modules.reduce((total, module) => total + module.extras.length, 0);
    const started = progress.done > 0;
    const finished = progress.done === progress.total;
    const current = finished ? null : progress.next.id;
    // Las lecciones se dibujan como un camino en zigzag de nodos: completadas, la actual (con su tarjeta para empezar) y las siguientes.
    const offsets = [0, 1, 1.6, 1, 0, -1, -1.6, -1];
    let position = 0;
    const node = (className, href, disc, label, title, popup = '') => `<li class="path-node ${className}" style="--offset:${offsets[position++ % offsets.length]}"><a class="path-node-link" href="${href}"><span class="path-node-disc">${disc}</span><span class="path-node-label"><small>${label}</small>${title}</span></a>${popup}</li>`;
    const level = module => {
      const done = module.lessons.filter(({ lesson }) => completed.has(lesson.id)).length;
      const challenges = reviewSteps(module).length;
      const reviewed = stats.reviews.includes(`${course.id}:${module.index}`);
      const lessonNodes = module.lessons.map(({ lesson, label }) => {
        const isDone = completed.has(lesson.id);
        const isCurrent = lesson.id === current;
        return node(`${isDone ? 'is-done' : ''}${isCurrent ? ' is-current' : ''}`, `#contenido/${lesson.id}`, `${icon(isDone ? 'check' : isCurrent ? 'play' : lesson.video ? 'play' : 'book')}${isDone ? '<span class="sr-only">Completada:</span>' : ''}`, `<span class="module-item-number">${escape(label)}</span> · ${lessonMeta(lesson)}`, escape(lesson.title), isCurrent ? `<div class="path-node-pop" role="group" aria-label="Lección actual"><strong>${escape(lesson.title)}</strong><small>${escape(lesson.description)}</small><a class="button button-primary" href="#contenido/${lesson.id}">${icon('play')}${started ? 'Continuar' : 'Empezar'}</a></div>` : '');
      }).join('');
      const review = challenges ? node(`path-review${reviewed ? ' is-done' : ''}`, `#repaso/${course.id}/${module.index + 1}`, icon(reviewed ? 'check' : 'star'), plural(challenges, 'reto', 'retos'), 'Repaso del nivel') : '';
      const extraNodes = module.extras.map(resource => node('path-extra', `#contenido/${resource.id}`, icon(library.formats[resource.type].icon), extraMeta(resource), escape(resource.title))).join('');
      return `<section class="path-level" aria-labelledby="level-${module.index}"><header class="path-level-head"><span class="course-module-kicker">${escape(module.kicker)}</span><h2 class="course-module-title" id="level-${module.index}">${escape(module.name)}</h2><span class="path-level-count${done === module.lessons.length ? ' is-done' : ''}">${done}/${module.lessons.length}</span>${module.summary ? `<p>${escape(module.summary)}</p>` : ''}</header><ol class="path-nodes">${lessonNodes}${review}${extraNodes}</ol></section>`;
    };
    select('#detail-view').innerHTML = `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="#">Inicio</a><span aria-hidden="true">/</span><a href="#explorar">Explorar</a><span aria-hidden="true">/</span><span>Curso</span></nav>`
      + `<div class="course-layout"><aside class="course-card ${course.color}"><div class="course-card-art" aria-hidden="true">${artwork(course, true)}<span class="course-card-symbol">${courseSymbol(course)}</span></div><p class="eyebrow">${escape(course.label)} · NIVEL ${course.level.toUpperCase()}</p><h1 id="detail-title" tabindex="-1">${escape(course.title)}</h1><p class="course-card-description">${escape(course.description)}</p><ul class="course-card-facts"><li>${icon('book')}${plural(lessons.length, 'lección', 'lecciones')}</li><li>${icon('exercise')}${plural(exercises, 'reto', 'retos')}</li><li>${icon('star')}${plural(modules.length, 'nivel', 'niveles')} · ≈ ${studyHours(course)} h</li></ul>${started ? progressBar(progress) : ''}<a class="button button-primary course-card-start" href="#contenido/${progress.next.id}">${icon('play')}${started ? (finished ? 'Repasar el curso' : 'Continuar el curso') : 'Empezar el curso'}</a><div class="course-instructor"><img src="${instructor.photo}" alt="" width="40" height="40" loading="lazy" decoding="async"><span><small>Impartido por</small><strong>${instructor.name}</strong></span></div><button class="text-button" type="button" data-download="${course.id}">${icon('download')}Descargar programa</button></aside>`
      + `<div class="course-path-column"><h2 class="sr-only">Hay ${plural(modules.length, 'módulo', 'módulos')} en este curso</h2>${modules.map(level).join('')}`
      + `<section class="course-about" aria-labelledby="about-course-title"><h2 id="about-course-title">Sobre este curso</h2><p>${escape(course.intro)}</p>${course.outcomes?.length ? `<h3>Lo que aprenderás</h3><ul class="course-outcomes">${course.outcomes.map(outcome => `<li>${icon('check')}<span>${escape(outcome)}</span></li>`).join('')}</ul>` : ''}${course.skills?.length ? `<h3>Habilidades que desarrollarás</h3><ul class="course-skills">${course.skills.map(skill => `<li>${escape(skill)}</li>`).join('')}</ul>` : ''}<p class="prerequisite"><strong>Antes de empezar</strong>${escape(course.prerequisite)}</p></section></div></div>`;
    document.title = `${course.title} | Zuka`;
  }

  function lessonOutline(course, current) {
    const progress = courseProgress(course);
    return `<div class="player-outline${outlineOpen ? ' is-open' : ''}" id="player-outline"><a class="outline-course" href="#curso/${course.id}">${icon('left')}<span><small>Curso</small><strong>${escape(course.title)}</strong></span></a>${progressBar(progress)}<button class="outline-toggle" type="button" data-outline-toggle aria-expanded="${outlineOpen}" aria-controls="outline-modules">${icon('list')}<span>Contenido del curso</span><span class="outline-toggle-count">${progress.done}/${progress.total}</span></button><div class="outline-modules" id="outline-modules">${courseModules(course).map(module => `<section class="outline-module"><h2><small>${escape(module.kicker)}</small>${escape(module.name)}</h2><ol>${module.lessons.map(({ lesson, label }) => `<li><a class="outline-item${lesson.id === current.id ? ' is-current' : ''}${completed.has(lesson.id) ? ' is-done' : ''}" href="#contenido/${lesson.id}"${lesson.id === current.id ? ' aria-current="page"' : ''}><span class="outline-state">${completed.has(lesson.id) ? `${icon('check')}<span class="sr-only">Completada:</span>` : escape(label)}</span><span>${escape(lesson.title)}</span></a></li>`).join('')}${module.extras.map(resource => `<li><a class="outline-item outline-extra" href="#contenido/${resource.id}"><span class="outline-state">${icon(library.formats[resource.type].icon)}</span><span>${escape(resource.title)}</span></a></li>`).join('')}</ol></section>`).join('')}</div></div>`;
  }

  function lessonPager(course, lesson) {
    const lessons = courseLessons(course);
    const index = lessons.findIndex(candidate => candidate.id === lesson.id);
    const previous = lessons[index - 1];
    const next = lessons[index + 1];
    const done = completed.has(lesson.id);
    return `<nav class="lesson-pager" aria-label="Lecciones del curso">${previous ? `<a class="pager-link" href="#contenido/${previous.id}">${icon('left')}<span><small>Anterior</small><strong>${escape(previous.title)}</strong></span></a>` : `<a class="pager-link" href="#curso/${course.id}">${icon('left')}<span><small>Inicio</small><strong>Página del curso</strong></span></a>`}<button class="button ${done ? 'button-secondary' : 'button-primary'} pager-complete" type="button" data-complete="${lesson.id}" aria-pressed="${done}">${icon('check')}${done ? 'Completada' : 'Marcar como completada'}</button>${next ? `<a class="pager-link pager-next" href="#contenido/${next.id}" data-complete-on-leave="${lesson.id}"><span><small>Siguiente</small><strong>${escape(next.title)}</strong></span>${icon('right')}</a>` : `<a class="pager-link pager-next" href="#curso/${course.id}" data-complete-on-leave="${lesson.id}"><span><small>Última lección</small><strong>Terminar y volver al curso</strong></span>${icon('right')}</a>`}</nav>`;
  }

  function refreshLessonProgress() {
    const lesson = resourceById.get(currentLessonId);
    const course = lesson && courses.find(candidate => candidate.id === lesson.courseId);
    if (!course) return;
    const outline = select('#lesson-outline');
    const pager = select('#lesson-pager');
    if (outline) outline.innerHTML = lessonOutline(course, lesson);
    if (pager) pager.innerHTML = lessonPager(course, lesson);
  }

  function setCompleted(id, value, announce = true) {
    const lesson = resourceById.get(id);
    if (!lesson || lesson.type !== 'explanation' || completed.has(id) === value) return;
    if (value) completed.add(id); else completed.delete(id);
    const persisted = storeList('mathbrain-progress', [...completed]);
    if (id === currentLessonId) refreshLessonProgress();
    if (!announce) return;
    const progress = courseProgress(courses.find(course => course.id === lesson.courseId));
    toast(!persisted ? 'Progreso guardado durante esta visita. El navegador no permite guardarlo para la próxima.' : !value ? 'Lección marcada como pendiente.' : progress.done === progress.total ? '¡Completaste todas las lecciones del curso!' : `Lección completada. Llevas el ${progress.percent} % del curso.`);
  }

  function renderLesson(resource, course, video) {
    currentLessonId = resource.id;
    const module = courseModules(course).find(candidate => candidate.lessons.some(({ lesson }) => lesson.id === resource.id));
    const label = module.lessons.find(({ lesson }) => lesson.id === resource.id).label;
    select('#detail-view').innerHTML = `<nav class="breadcrumbs" aria-label="Ruta de navegación"><a href="#">Inicio</a><span aria-hidden="true">/</span><a href="#curso/${course.id}">${escape(course.title)}</a><span aria-hidden="true">/</span><span>${escape(module.kicker)}</span></nav>`
      + `<div class="course-player"><aside class="player-aside" id="lesson-outline" aria-label="Contenido del curso">${lessonOutline(course, resource)}</aside><div class="player-main">`
      + `<header class="detail-header player-header"><p class="eyebrow">${escape(module.kicker.toUpperCase())} · LECCIÓN ${escape(label)}</p><h1 id="detail-title" tabindex="-1">${escape(resource.title)}</h1><p>${escape(resource.description)}</p><ul class="lesson-items" aria-label="Contenido de la lección">${video ? `<li>${icon('play')}Video</li>` : ''}<li>${icon('book')}Lectura · ${resource.minutes || 3} min</li>${resource.practice ? `<li>${icon('exercise')}Práctica · ${plural(resource.practice, 'ejercicio', 'ejercicios')}</li>` : ''}</ul><div class="detail-actions">${saveButton(resource, true)}<button type="button" class="text-button" data-copy>${icon('link')}Copiar enlace</button></div></header>`
      + `<article class="reader ${resource.color}">${video || `<div class="reader-art">${artwork(resource)}</div>`}<div class="reader-body lesson-content">${resource.html}</div></article><div id="lesson-pager">${lessonPager(course, resource)}</div></div></div>`;
    document.title = `${resource.title} · ${course.title} | Zuka`;
    bindLessonExercises(resource);
    // En cursos largos, el temario lateral se desplaza hasta la lección actual.
    const aside = select('#lesson-outline');
    const current = document.querySelector('#lesson-outline .is-current');
    if (aside && current && aside.scrollHeight > aside.clientHeight) aside.scrollTop = Math.max(0, current.offsetTop - aside.clientHeight / 3);
  }

  // ── Lección paso a paso ─────────────────────────────────────────────────────────────
  // Cada lección se recorre una idea a la vez: un paso en pantalla, una barra de avance y,
  // en los retos, retroalimentación inmediata de la mascota. Responder bien da XP; terminar la lección
  // la completa, suma un bono y mantiene la racha.

  function lessonPosition(course, resource) {
    const module = courseModules(course).find(candidate => candidate.lessons.some(({ lesson }) => lesson.id === resource.id));
    return { module, label: module.lessons.find(({ lesson }) => lesson.id === resource.id).label };
  }

  function startPlayer(state) {
    player = { index: 0, results: {}, gains: {}, xp: 0, firstTry: 0, ...state };
    select('#detail-view').innerHTML = `<section class="lesson-player ${player.color}" aria-labelledby="detail-title"><header class="player-top"><a class="player-close" href="${player.exit}" aria-label="Salir y volver al curso">${icon('close')}</a><div class="player-meter" id="player-meter"></div><span class="player-xp" id="player-xp" aria-live="polite"></span></header><div class="player-heading"><p class="eyebrow">${escape(player.eyebrow)}</p><h1 id="detail-title" tabindex="-1">${escape(player.title)}</h1>${player.reading ? `<a class="player-reading" href="${player.reading}">${icon('book')}Ver toda la lección en una página</a>` : ''}</div><div class="player-stage" id="player-stage"></div><div class="player-bar" id="player-bar"></div></section>`;
    renderPlayerStep();
  }

  function renderPlayer(resource, course, video) {
    currentLessonId = null;
    const { module, label } = lessonPosition(course, resource);
    document.title = `${resource.title} · ${course.title} | Zuka`;
    startPlayer({ kind: 'lesson', resource, course, color: resource.color, title: resource.title, eyebrow: `${module.kicker.toUpperCase()} · LECCIÓN ${label}`, exit: `#curso/${course.id}`, reading: `#contenido/${resource.id}?vista=lectura`, steps: [...(video ? [{ type: 'video', html: `<h2>Mira la clase</h2>${video}` }] : []), ...resource.steps] });
  }

  // Repaso del nivel: un reto de cada lección del módulo, para comprobar lo aprendido antes de seguir.
  function reviewSteps(module) {
    return module.lessons.map(({ lesson }) => (lesson.steps || []).find(step => step.type === 'exercise')).filter(Boolean).slice(0, 8)
      .map(step => ({ type: 'exercise', html: step.html.replace(/^(?:<h2>[\s\S]*?<\/h2>)+/, '') }));
  }

  function renderReview(course, index) {
    const module = courseModules(course)[index];
    const steps = module && reviewSteps(module);
    if (!steps?.length) return false;
    document.title = `Repaso: ${module.name} · ${course.title} | Zuka`;
    startPlayer({ kind: 'review', course, module, color: course.color, title: `Repaso: ${module.name}`, eyebrow: `${module.kicker.toUpperCase()} · REPASO DEL NIVEL`, exit: `#curso/${course.id}`, reading: '', steps: [{ type: 'intro', html: `<h2>Pon a prueba este nivel</h2><p>${plural(steps.length, 'reto', 'retos')} de las lecciones de «${escape(module.name)}». Resuélvelos sin mirar la explicación; si te atascas, puedes ver la solución y seguir.</p>` }, ...steps] });
    return true;
  }

  function playerMeter() {
    const total = player.steps.length;
    return `<ol class="player-segments" role="progressbar" aria-label="Avance de la lección" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${Math.min(player.index, total)}">${player.steps.map((step, index) => `<li class="${index < player.index ? 'is-done' : index === player.index ? 'is-current' : ''}${step.type === 'exercise' ? ' is-challenge' : ''}"></li>`).join('')}</ol>`;
  }

  function renderPlayerStep() {
    const step = player.steps[player.index];
    select('#player-meter').innerHTML = playerMeter();
    select('#player-xp').textContent = player.xp ? `+${player.xp} XP` : '';
    if (!step) return finishPlayer();
    const labels = { exercise: 'Tu turno', idea: 'Idea clave', example: 'Ejemplo', note: 'Atención', video: 'Video', intro: 'Repaso' };
    select('#player-stage').innerHTML = `<article class="player-card reader-body lesson-content step-${step.type}" id="player-card" tabindex="-1">${labels[step.type] ? `<p class="player-step-label">${labels[step.type]}</p>` : ''}${step.html}</article>`;
    const form = document.querySelector('#player-stage .lesson-exercise');
    form?.addEventListener('submit', event => {
      event.preventDefault();
      const result = checkExercise(form);
      if (result !== null) answerStep(result);
    });
    renderPlayerBar();
  }

  function answerStep(result) {
    const index = player.index;
    const previous = player.results[index];
    if (previous === 'correct' || previous === 'revealed') return renderPlayerBar();
    if (result) {
      const gain = previous === 'retry' ? 5 : 10;
      if (!previous) player.firstTry += 1;
      player.results[index] = 'correct';
      player.gains[index] = gain;
      player.xp += gain;
      addXp(gain);
      select('#player-xp').textContent = `+${player.xp} XP`;
    } else {
      player.results[index] = 'retry';
    }
    renderPlayerBar();
  }

  function revealStep() {
    const form = document.querySelector('#player-stage .lesson-exercise');
    if (player.results[player.index] !== 'correct') player.results[player.index] = 'revealed';
    if (form) {
      const solution = select('.lesson-solution', form);
      if (solution) solution.open = true;
      else if (form.dataset.kind === 'choice') select('input[data-correct]', form)?.closest('label')?.classList.add('is-answer');
      else select('.answer-feedback', form).textContent = `La respuesta es ${form.dataset.answer}.`;
    }
    renderPlayerBar();
  }

  function renderPlayerBar() {
    const step = player.steps[player.index];
    const result = player.results[player.index];
    const last = player.index === player.steps.length - 1;
    const open = step.type !== 'exercise' || result === 'correct' || result === 'revealed';
    const hint = step.type === 'exercise' && /lesson-hint/.test(step.html);
    const back = player.index > 0 ? `<button class="player-back" type="button" data-player-back="1" aria-label="Paso anterior">${icon('left')}</button>` : '';
    let message = '';
    let state = '';
    if (step.type === 'exercise') {
      if (result === 'correct') { state = 'is-correct'; message = mascot.say('feliz', `<strong>¡Correcto!</strong> +${player.gains[player.index]} XP`); }
      else if (result === 'revealed') { state = 'is-revealed'; message = mascot.say('animo', 'Revisa la solución con calma. El próximo reto sale.'); }
      else if (result === 'retry') { state = 'is-retry'; message = mascot.say('animo', hint ? '<strong>Casi.</strong> Abre la pista y vuelve a intentarlo.' : '<strong>Casi.</strong> Revisa el planteamiento y vuelve a intentarlo.'); }
      else message = mascot.say('piensa', 'Tu turno: resuelve el reto para continuar.');
    }
    const actions = open
      ? `<button class="button button-primary player-continue" type="button" data-player-next="1">${last ? 'Terminar' : 'Continuar'}${icon('right')}</button>`
      : '<button class="button button-secondary player-reveal" type="button" data-player-reveal="1">Ver solución</button>';
    select('#player-bar').innerHTML = `<div class="player-bar-inner ${state}">${back}<div class="player-feedback" role="status" aria-live="polite">${message}</div><div class="player-actions">${actions}</div></div>`;
  }

  function movePlayer(step) {
    if (!player) return;
    const current = player.steps[player.index];
    if (step > 0 && current?.type === 'exercise' && !['correct', 'revealed'].includes(player.results[player.index])) return;
    player.index = Math.max(0, Math.min(player.steps.length, player.index + step));
    renderPlayerStep();
    window.scrollTo({ top: 0, behavior: 'instant' });
    (select('#player-card') || select('#detail-title'))?.focus({ preventScroll: true });
  }

  function finishPlayer() {
    const challenges = player.steps.filter(step => step.type === 'exercise').length;
    let title;
    let detail;
    let actions;
    if (player.kind === 'lesson') {
      const { resource, course } = player;
      const firstTime = !completed.has(resource.id);
      setCompleted(resource.id, true, false);
      if (firstTime) { player.xp += 20; addXp(20); }
      recordStudyDay();
      saveStats();
      const lessons = courseLessons(course);
      const next = lessons[lessons.findIndex(lesson => lesson.id === resource.id) + 1];
      const progress = courseProgress(course);
      title = '¡Lección completada!';
      detail = progress.done === progress.total ? `Completaste todas las lecciones de ${escape(course.title)}.` : `Llevas el ${progress.percent} % de ${escape(course.title)}.`;
      actions = `${next ? `<a class="button button-primary" href="#contenido/${next.id}">Siguiente lección${icon('right')}</a>` : ''}<a class="button ${next ? 'button-secondary' : 'button-primary'}" href="#curso/${course.id}">Volver al curso</a><a class="text-button" href="#contenido/${resource.id}?vista=lectura">${icon('book')}Repasar la lección completa</a>`;
    } else {
      const { course, module } = player;
      const key = `${course.id}:${module.index}`;
      const correct = Object.values(player.results).filter(result => result === 'correct').length;
      const passed = challenges && correct / challenges >= .7;
      if (passed && !stats.reviews.includes(key)) { stats.reviews = [...stats.reviews, key]; player.xp += 30; addXp(30); }
      recordStudyDay();
      saveStats();
      title = passed ? '¡Nivel superado!' : 'Repaso terminado';
      detail = passed ? `Resolviste ${correct} de ${challenges} retos de «${escape(module.name)}».` : `Resolviste ${correct} de ${challenges} retos. Repasa las lecciones del nivel y vuelve a intentarlo.`;
      actions = `<a class="button button-primary" href="#curso/${course.id}">Volver al curso</a>`;
    }
    updateStatsChip();
    select('#player-xp').textContent = player.xp ? `+${player.xp} XP` : '';
    select('#player-meter').innerHTML = playerMeter();
    select('#player-stage').innerHTML = `<div class="player-end" id="player-card" tabindex="-1"><span class="player-end-mascot">${mascot.svg('celebra')}</span><h2>${title}</h2><p>${detail}</p><ul class="player-stats"><li><strong>+${player.xp}</strong><span>XP ganados</span></li><li><strong>${icon('flame')}${currentStreak()}</strong><span>${currentStreak() === 1 ? 'día de racha' : 'días de racha'}</span></li><li><strong>${player.firstTry}/${challenges}</strong><span>retos a la primera</span></li></ul></div>`;
    select('#player-bar').innerHTML = `<div class="player-bar-inner is-finished"><div class="player-actions player-end-actions">${actions}</div></div>`;
    player.finished = true;
  }

  // Perfil del estudiante (#perfil). No hay cuentas: todo se calcula con los datos guardados en este navegador.
  const storageKeys = ['mathbrain-progress', 'mathbrain-stats', 'mathbrain-saved', 'mathbrain-recent', 'mathbrain-profile', 'mathbrain-theme'];

  function loadProfile() {
    try {
      const value = JSON.parse(localStorage.getItem('mathbrain-profile') || '{}');
      return { name: typeof value.name === 'string' ? value.name.trim().slice(0, 40) : '' };
    } catch {
      return { name: '' };
    }
  }

  // Cada nivel pide 50 XP más que el anterior: 100 para el nivel 2, 150 más para el 3…
  function xpLevel(xp) {
    let level = 1;
    let floor = 0;
    let need = 100;
    while (xp >= floor + need) { floor += need; level++; need += 50; }
    return { level, into: xp - floor, need, percent: Math.round((xp - floor) / need * 100) };
  }

  function bestStreak() {
    let best = 0;
    let run = 0;
    let previous = null;
    for (const day of [...new Set(stats.days)].sort()) {
      const date = new Date(`${day}T12:00:00`);
      run = previous && Math.round((date - previous) / 86400000) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      previous = date;
    }
    return Math.max(best, currentStreak());
  }

  function weekActivity() {
    const studied = new Set(stats.days);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - 6 + index);
      return { short: new Intl.DateTimeFormat('es-CO', { weekday: 'narrow' }).format(date), long: new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric' }).format(date), done: studied.has(dayKey(date)), today: index === 6 };
    });
  }

  function renderProfile() {
    const profile = loadProfile();
    const level = xpLevel(stats.xp);
    const streak = currentStreak();
    const week = weekActivity();
    const studiedWeek = week.filter(day => day.done).length;
    const progress = courses.map(course => ({ course, progress: courseProgress(course) })).sort((a, b) => Number(b.progress.done > 0) - Number(a.progress.done > 0));
    const statItems = [['flame', streak, streak === 1 ? 'día de racha' : 'días de racha'], ['star', bestStreak(), 'mejor racha'], ['check', completed.size, completed.size === 1 ? 'lección completada' : 'lecciones completadas'], ['bookmark', saved.size, saved.size === 1 ? 'contenido guardado' : 'contenidos guardados']];
    select('#detail-view').innerHTML = `<section class="profile-view" aria-labelledby="detail-title">`
      + `<header class="profile-header"><span class="profile-avatar" aria-hidden="true">${mascot.svg(streak ? 'celebra' : 'feliz')}</span><div class="profile-identity"><p class="eyebrow">TU PERFIL</p><h1 id="detail-title" tabindex="-1">${profile.name ? `Hola, ${escape(profile.name)}` : 'Hola'}</h1><p class="profile-level"><strong>Nivel ${level.level}</strong> · ${stats.xp} XP</p><div class="profile-level-bar"><span class="course-progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="${level.need}" aria-valuenow="${level.into}" aria-label="Progreso hacia el nivel ${level.level + 1}"><span style="width:${level.percent}%"></span></span><small>${level.need - level.into} XP para el nivel ${level.level + 1}</small></div></div></header>`
      + `<form class="profile-name" data-profile-form="1"><label for="profile-name">¿Cómo quieres que te llamemos?</label><div><input id="profile-name" name="name" type="text" maxlength="40" autocomplete="nickname" placeholder="Tu nombre o apodo" value="${escape(profile.name)}"><button class="button button-secondary" type="submit">Guardar</button></div></form>`
      + `<ul class="profile-stats" aria-label="Tus números">${statItems.map(([name, value, label]) => `<li>${icon(name)}<strong>${value}</strong><span>${label}</span></li>`).join('')}</ul>`
      + `<section class="profile-card" aria-labelledby="profile-week-title"><div class="profile-card-heading"><h2 id="profile-week-title">Esta semana</h2><p>${studiedWeek ? `Estudiaste ${plural(studiedWeek, 'día', 'días')} de 7.` : 'Completa una lección para empezar tu racha.'}</p></div><ol class="profile-week">${week.map(day => `<li class="${day.done ? 'is-done' : ''}${day.today ? ' is-today' : ''}"><span aria-hidden="true">${day.done ? icon('check') : ''}</span><small aria-hidden="true">${escape(day.short)}</small><span class="sr-only">${escape(day.long)}: ${day.done ? 'estudiaste' : 'sin estudio'}</span></li>`).join('')}</ol></section>`
      + `<section class="profile-card" aria-labelledby="profile-courses-title"><div class="profile-card-heading"><h2 id="profile-courses-title">Tus cursos</h2><p>${progress.some(item => item.progress.done) ? 'Tu avance en cada ruta.' : 'Todavía no empiezas ningún curso. Elige uno y da el primer paso.'}</p></div><ul class="profile-courses">${progress.map(({ course, progress: courseState }) => `<li class="${course.color}"><span class="profile-course-symbol" aria-hidden="true">${courseSymbol(course)}</span><div><a href="#curso/${course.id}"><strong>${escape(course.title)}</strong></a>${progressBar(courseState)}</div><a class="text-button" href="#contenido/${courseState.next.id}">${courseState.done === courseState.total ? 'Repasar' : courseState.done ? 'Continuar' : 'Empezar'}${icon('right')}</a></li>`).join('')}</ul></section>`
      + `<section class="profile-card profile-data" aria-labelledby="profile-data-title"><div class="profile-card-heading"><h2 id="profile-data-title">Tus datos</h2><p>Zuka no necesita cuenta: tu progreso se guarda solo en este dispositivo. Descarga una copia para pasarla a otro celular o computador.</p></div><div class="profile-actions"><button type="button" class="button button-secondary" data-profile-export="1">${icon('download')}Descargar copia</button><label class="button button-secondary profile-import">${icon('book')}Restaurar copia<input class="sr-only" type="file" accept=".json,application/json" data-profile-import="1"></label><button type="button" class="text-button profile-reset" data-profile-reset="1">Borrar mi progreso</button></div></section>`
      + `</section>`;
    document.title = 'Tu perfil | Zuka';
  }

  function exportProgress() {
    const data = Object.fromEntries(storageKeys.map(key => [key, localStorage.getItem(key)]).filter(([, value]) => value !== null));
    const contents = JSON.stringify({ app: 'zuka', version: 1, exportedAt: new Date().toISOString(), data }, null, 2);
    const address = URL.createObjectURL(new Blob([contents], { type: 'application/json' }));
    const anchor = document.createElement('a');
    anchor.href = address;
    anchor.download = `zuka-progreso-${dayKey()}.json`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(address), 1000);
    toast('Copia descargada. Ábrela desde Perfil en el otro dispositivo.');
  }

  async function importProgress(file) {
    try {
      const backup = JSON.parse(await file.text());
      if (backup?.app !== 'zuka' || typeof backup.data !== 'object' || !backup.data) throw new Error('formato');
      const entries = Object.entries(backup.data).filter(([key, value]) => storageKeys.includes(key) && typeof value === 'string');
      if (!entries.length) throw new Error('vacía');
      if (!window.confirm('¿Reemplazar el progreso de este dispositivo por el de la copia?')) return;
      for (const [key, value] of entries) localStorage.setItem(key, value);
      location.reload();
    } catch {
      toast('Ese archivo no es una copia de Zuka.');
    }
  }

  function resetProgress() {
    if (!window.confirm('Se borrarán tus lecciones completadas, tu racha, tus XP y tus guardados en este dispositivo. ¿Continuar?')) return;
    try { for (const key of storageKeys.filter(key => key !== 'mathbrain-theme')) localStorage.removeItem(key); } catch { /* Sin almacenamiento no hay nada que borrar. */ }
    location.reload();
  }

  function missingResource() {
    select('#detail-view').innerHTML = '<div class="empty-state">' + mascot.svg('piensa') + '<h1 id="detail-title" tabindex="-1">Esta idea no está en ese enlace.</h1><p>El enlace puede estar incompleto. Encuentra el tema en el catálogo.</p><a class="button button-primary" href="#explorar">Explorar contenidos</a></div>';
    document.title = 'Contenido no encontrado | Zuka';
  }

  // Los cursos de Álgebra y Trigonometría forman ahora Fundamentos de Matemáticas: sus enlaces antiguos siguen funcionando.
  function legacyHash(hash) {
    const updated = hash.replace(/^#contenido\/((?:algebra|trigonometria)-\d)(?=$|\?)/, (match, id) => legacyLessons[id] ? `#contenido/${currentId(id)}` : match)
      .replace(/^#curso\/(?:algebra|trigonometria)(?:\/\d+)?(?=$|\?)/, '#curso/fundamentos-matematicas')
      .replace(/([?&](?:curso_)?tema=)(?:algebra|trigonometria)(?=&|$)/g, '$1fundamentos');
    return updated === hash ? null : updated;
  }

  function route(shouldFocus = true) {
    const legacy = legacyHash(location.hash);
    if (legacy) history.replaceState(null, '', legacy);
    if (shouldFocus && lastRoutedHash === location.hash) return;
    lastRoutedHash = location.hash;
    const [rawPath, rawParameters = ''] = location.hash.slice(1).split('?');
    let destination;
    try { destination = decodeURIComponent(rawPath); } catch { destination = 'invalid'; }
    const parameters = new URLSearchParams(rawParameters);
    filters = { query: (parameters.get('q') || '').slice(0, 160), type: library.formats[parameters.get('tipo')] ? parameters.get('tipo') : 'all', topic: library.topics.some(topic => topic.id === parameters.get('tema')) ? parameters.get('tema') : 'all', level: ['Inicial', 'Intermedio'].includes(parameters.get('nivel')) ? parameters.get('nivel') : 'all' };
    courseFilters = { topic: library.topics.some(topic => topic.id === parameters.get('curso_tema')) ? parameters.get('curso_tema') : 'all', level: ['Inicial', 'Intermedio'].includes(parameters.get('curso_nivel')) ? parameters.get('curso_nivel') : 'all' };
    page = !destination || destination === 'inicio' ? 'inicio' : destination === 'biblioteca' ? 'biblioteca' : destination === 'nosotros' ? 'nosotros' : destination === 'perfil' ? 'perfil' : ['explorar', 'cursos', 'enfoque', 'simulaciones', 'ejercicios'].includes(destination) ? 'explorar' : 'detalle';
    if (['explorar', 'cursos'].includes(destination) && !filters.query && filters.type === 'all' && filters.topic === 'all' && filters.level === 'all' && parameters.get('vista') !== 'contenidos') page = 'cursos';
    if (destination === 'simulaciones') filters.type = 'simulation';
    if (destination === 'ejercicios') filters.type = 'exercise';
    select('#home-view').hidden = page !== 'inicio';
    select('#courses-view').hidden = page !== 'cursos';
    select('.discovery').hidden = !['inicio', 'explorar', 'biblioteca'].includes(page);
    select('#learning-paths').hidden = page !== 'inicio';
    select('#detail-view').hidden = !['detalle', 'perfil'].includes(page);
    select('#about-view').hidden = page !== 'nosotros';
    select('#content-search').value = filters.query;
    player = null;
    if (page === 'detalle') {
      const resourceMatch = destination.match(/^contenido\/([\w-]+)$/);
      const courseMatch = destination.match(/^curso\/([\w-]+)(?:\/(\d+))?$/);
      const reviewMatch = destination.match(/^repaso\/([\w-]+)\/(\d+)$/);
      const course = courseMatch && courses.find(candidate => candidate.id === courseMatch[1]);
      const reviewCourse = reviewMatch && courses.find(candidate => candidate.id === reviewMatch[1]);
      const resource = resourceMatch ? resourceById.get(resourceMatch[1]) : course && courseMatch[2] ? resourceById.get(`${course.id}-${Math.min(course.lessons.length, Math.max(1, Number(courseMatch[2])))}`) : null;
      if (resource) renderResource(resource, parameters);
      else if (course) renderCourse(course);
      else if (reviewCourse && renderReview(reviewCourse, Number(reviewMatch[2]) - 1)) { /* repaso del nivel */ }
      else missingResource();
    } else if (page === 'cursos') {
      select('#detail-view').replaceChildren();
      renderCourses();
    } else if (page === 'perfil') {
      renderProfile();
    } else if (page === 'nosotros') {
      select('#detail-view').replaceChildren();
      document.title = 'Sobre Zuka | Zuka';
    } else {
      select('#detail-view').replaceChildren();
      renderCatalog();
      if (page === 'inicio') document.title = 'Zuka — Aprende matemáticas paso a paso';
    }
    // Durante una lección paso a paso, la interfaz se concentra en la lección, como en una app de aprendizaje.
    document.body?.classList.toggle('lesson-mode', Boolean(player));
    updateStatsChip();
    const activeNav = page === 'cursos' || (page === 'detalle' && destination.startsWith('curso/')) ? 'explorar' : page === 'explorar' ? filters.type === 'simulation' ? 'simulaciones' : filters.type === 'exercise' ? 'ejercicios' : 'explorar' : page;
    selectAll('[data-nav]').forEach(link => {
      const active = link.dataset.nav === activeNav;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
      link.setAttribute('aria-label', link.dataset.nav === 'biblioteca' ? 'Mi biblioteca' : link.textContent.trim());
    });
    if (shouldFocus) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      const heading = ['detalle', 'perfil'].includes(page) ? select('#detail-title') : page === 'nosotros' ? select('#about-title') : page === 'inicio' ? select('#main') : page === 'cursos' ? select('#courses-title') : select('#catalog-title');
      heading?.focus({ preventScroll: true });
    }
  }

  function simulationControls(resource) {
    const config = {
      derivative: { label: 'Posición del punto, x', min: -2, max: 2, step: .05, value: 1 },
      riemann: { label: 'Número de rectángulos', min: 1, max: 50, step: 1, value: 8 },
      circle: { label: 'Ángulo del giro', min: 0, max: 360, step: 1, value: 45 },
      probability: { label: 'Probabilidad de obtener cara', min: 0, max: 1, step: .05, value: .5 },
      system: { label: 'Pendiente m de la recta y = mx + 1', min: -2, max: 3, step: .25, value: 1 },
      confidence: { label: 'Tamaño de cada muestra, n', min: 5, max: 100, step: 5, value: 25 }
    }[resource.simulation];
    return `<div id="simulation-graph" class="simulation-graph"></div><div class="simulation-controls"><label class="slider-label" for="simulation-slider"><span>${config.label}</span><output id="simulation-value" for="simulation-slider"></output></label><input id="simulation-slider" type="range" min="${config.min}" max="${config.max}" step="${config.step}" value="${config.value}">${resource.simulation === 'riemann' ? '<label class="simulation-select" for="riemann-method">Altura de cada rectángulo<select id="riemann-method"><option value="left">Extremo izquierdo</option><option value="right">Extremo derecho</option><option value="midpoint" selected>Punto medio</option></select></label>' : ''}${resource.simulation === 'probability' ? '<div class="simulation-buttons"><button type="button" id="toss-coins" class="button button-primary">Lanzar 100 veces</button><button type="button" id="reset-coins" class="button button-secondary">Reiniciar</button></div>' : ''}${resource.simulation === 'confidence' ? '<div class="simulation-buttons"><button type="button" id="sample-intervals" class="button button-primary">Tomar 20 muestras</button><button type="button" id="reset-intervals" class="button button-secondary">Reiniciar</button></div>' : ''}<div id="simulation-stats" class="simulation-stats" aria-live="polite" aria-atomic="true"></div><p id="simulation-explanation" class="simulation-explanation"></p></div>`;
  }

  function graphFrame(label, drawing) {
    return `<svg viewBox="0 0 600 300" role="img" aria-label="${escape(label)}"><defs><pattern id="simulation-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" stroke="#a7c9d5" stroke-opacity=".08" fill="none"/></pattern><clipPath id="simulation-clip"><rect x="35" y="20" width="530" height="245"/></clipPath></defs><rect width="600" height="300" fill="url(#simulation-grid)"/>${drawing}</svg>`;
  }

  function stat(label, value) { return `<div class="simulation-stat"><small>${label}</small><strong>${value}</strong></div>`; }

  function bindSimulation(resource) {
    const slider = select('#simulation-slider');
    let flips = [];
    let intervals = [];
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
      } else if (resource.simulation === 'system') {
        const horizontal = input => 65 + (input + 2) * 47;
        const vertical = output => 250 - (output + 2) * 23;
        const segment = (slope, intercept) => linePath([-3, 9].map(input => [horizontal(input), vertical(slope * input + intercept)]));
        const solution = library.lineIntersection(-1, 5, value, 1);
        const equation = value === 0 ? '1' : `${value === 1 ? '' : value === -1 ? '−' : number(value, 2)}x + 1`;
        const visible = solution.solutions === 1 && solution.x >= -2 && solution.x <= 8 && solution.y >= -2 && solution.y <= 8;
        const ticks = [0, 2, 4, 6, 8].map(tick => `<text x="${horizontal(tick) - 3}" y="${vertical(0) + 16}">${tick}</text>`).join('') + [2, 4, 6, 8].map(tick => `<text x="${horizontal(0) - 14}" y="${vertical(tick) + 4}">${tick}</text>`).join('');
        graph = graphFrame(solution.solutions === 1 ? `Rectas x + y = 5 e y = ${equation}. Se cruzan en (${number(solution.x, 2)}, ${number(solution.y, 2)}).` : 'Rectas paralelas y distintas: el sistema no tiene solución.', `<path d="M55 ${vertical(0)}H552M${horizontal(0)} 262V28" stroke="#8ba8bd" stroke-opacity=".4"/><g clip-path="url(#simulation-clip)" fill="none" stroke-width="2.2"><path d="${segment(-1, 5)}" stroke="#e9cd9c"/><path d="${segment(value, 1)}" stroke="#9adfd2"/></g>${visible ? `<path d="M${horizontal(solution.x)} ${vertical(0)}V${vertical(solution.y)}H${horizontal(0)}" stroke="#d8e6c7" stroke-dasharray="4 6" opacity=".35" fill="none"/><circle cx="${horizontal(solution.x)}" cy="${vertical(solution.y)}" r="5" fill="#d8e6c7"/><circle cx="${horizontal(solution.x)}" cy="${vertical(solution.y)}" r="12" fill="none" stroke="#d8e6c7" opacity=".3"/>` : ''}<g fill="#8ba8bd" font-family="Arial,sans-serif" font-size="11">${ticks}</g><g font-family="Georgia,serif" font-size="17" paint-order="stroke" stroke="#0a1626" stroke-width="6" stroke-linejoin="round"><text x="440" y="40" fill="#e9cd9c">x + y = 5</text><text x="440" y="64" fill="#9adfd2">y = ${equation}</text></g>`);
        statistics = stat('Pendiente m', number(value, 2)) + stat('Solución x', solution.solutions === 1 ? number(solution.x, 2) : '—') + stat('Solución y', solution.solutions === 1 ? number(solution.y, 2) : '—');
        explanation = solution.solutions === 0 ? 'Con m = −1 las rectas son paralelas y distintas: nunca se cruzan, así que ningún par (x, y) cumple las dos ecuaciones. El sistema no tiene solución.' : `Las rectas se cruzan en un único punto: (${number(solution.x, 2)}, ${number(solution.y, 2)}) cumple las dos ecuaciones a la vez.${visible ? '' : ' El cruce queda fuera de la ventana: cuanto más se parecen las pendientes, más lejos está.'}`;
        controlValue = number(value, 2);
      } else if (resource.simulation === 'confidence') {
        const horizontal = input => 65 + (input - 30) / 40 * 470;
        const rowHeight = 225 / Math.max(intervals.length, 20);
        const covered = intervals.filter(interval => interval.covers).length;
        const margin = 1.96 * 10 / Math.sqrt(value);
        const rows = intervals.map((interval, index) => { const vertical = 25 + (index + .5) * rowHeight; const color = interval.covers ? '#9adfd2' : '#e2a6c4'; return `<path d="M${horizontal(interval.lower)} ${vertical}H${horizontal(interval.upper)}" stroke="${color}" stroke-width="${Math.min(3, rowHeight * .55).toFixed(2)}" stroke-linecap="round"/><circle cx="${horizontal(interval.center)}" cy="${vertical}" r="${Math.min(2.6, rowHeight * .4).toFixed(2)}" fill="${color}"/>`; }).join('');
        graph = graphFrame(intervals.length ? `${intervals.length} intervalos del 95 % con muestras de tamaño ${value}. ${covered} contienen la media real 50.` : 'Sin muestras. Pulsa Tomar 20 muestras para construir intervalos.', `<path d="M55 255H552" stroke="#8ba8bd" stroke-opacity=".4"/><g clip-path="url(#simulation-clip)">${rows}</g><path d="M${horizontal(50)} 22V255" stroke="#e9cd9c" stroke-width="1.4" stroke-dasharray="5 5"/>${intervals.length ? '' : '<text x="300" y="140" text-anchor="middle" fill="#94aec8" font-size="14" font-family="Arial,sans-serif">Cada muestra produce un intervalo distinto.</text>'}<g fill="#8ba8bd" font-family="Arial,sans-serif" font-size="11">${[30, 40, 50, 60, 70].map(tick => `<text x="${horizontal(tick) - 7}" y="275">${tick}</text>`).join('')}<text x="${horizontal(50) + 8}" y="18" fill="#e9cd9c">MEDIA REAL μ = 50</text><text x="65" y="292" fill="#9adfd2">CONTIENE μ</text><text x="160" y="292" fill="#e2a6c4">NO CONTIENE μ</text></g>`);
        statistics = stat('Intervalos', number(intervals.length, 0)) + stat('Contienen μ', number(covered, 0)) + stat('Cobertura', intervals.length ? `${number(covered / intervals.length * 100, 1)} %` : '—');
        explanation = `Población normal con μ = 50 y σ = 10. Con n = ${value}, cada intervalo es x̄ ± ${number(margin, 2)}. Muestras más grandes producen intervalos más estrechos, pero la cobertura a largo plazo sigue cerca del 95 %. Al cambiar n, el experimento se reinicia. Límite: 100 intervalos.`;
        controlValue = String(value);
        select('#sample-intervals').disabled = intervals.length >= 100;
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
    slider.addEventListener('input', () => { flips = []; intervals = []; render(); });
    select('#riemann-method')?.addEventListener('change', render);
    select('#toss-coins')?.addEventListener('click', () => { flips.push(...library.coinExperiment(Number(slider.value), Math.min(100, 5000 - flips.length))); render(); });
    select('#reset-coins')?.addEventListener('click', () => { flips = []; render(); });
    select('#sample-intervals')?.addEventListener('click', () => { intervals.push(...library.confidenceIntervals({ size: Number(slider.value), count: Math.min(20, 100 - intervals.length) })); render(); });
    select('#reset-intervals')?.addEventListener('click', () => { intervals = []; render(); });
    render();
  }

  function bindAnswerCheck(resource) {
    const form = select('#answer-check');
    if (!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = select('#answer-input');
      const feedback = select('#answer-feedback');
      const result = library.checkAnswer(resource.check, input.value);
      form.dataset.state = result === null ? 'invalid' : result ? 'correct' : 'incorrect';
      input.setAttribute('aria-invalid', String(result !== true));
      feedback.textContent = result === null ? 'Escribe un número, una fracción como 8/3 o un porcentaje como 25 %.' : result ? '¡Exacto! Abre la solución para comparar tu razonamiento con el nuestro.' : 'Todavía no. Revisa la herramienta que necesitas e inténtalo de nuevo, o abre el primer paso de la solución.';
      if (result) select('.solution summary').textContent = `Compara tu razonamiento · ${resource.steps.length} pasos`;
    });
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
    const outcomes = course.outcomes?.length ? `\nLO QUE APRENDERÁS\n${course.outcomes.map(outcome => `- ${outcome}`).join('\n')}\n` : '';
    const modules = courseModules(course).map(module => `${module.kicker.toUpperCase()} · ${module.name}\n${module.summary ? `${module.summary}\n` : ''}${module.objectives.map(objective => `- ${objective}`).join('\n')}${module.objectives.length ? '\n' : ''}\n${module.lessons.map(({ lesson, label }) => `${label}. ${lesson.title}\n${lesson.description}\nIdea clave: ${lesson.key}\n`).join('\n')}${module.extras.length ? `\nPráctica interactiva: ${module.extras.map(resource => resource.title).join('; ')}\n` : ''}`).join('\n\n');
    const contents = `ZUKA — ${course.title}\n\n${course.description}\n${course.intro}\nNivel: ${course.level}\nImpartido por: ${instructor.name}\nAntes de empezar: ${course.prerequisite}\n${outcomes}\n${modules}`;
    const address = URL.createObjectURL(new Blob([contents], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = address;
    anchor.download = `Zuka-${id}-programa.txt`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(address), 1000);
    toast('Programa descargado. Una idea a la vez.');
  }

  selectAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
  renderLanding();
  select('#library-stats').textContent = `${library.search({ type: 'explanation' }).length} explicaciones · ${library.search({ type: 'simulation' }).length} simulaciones · ${library.search({ type: 'exercise' }).length} ejercicios`;
  select('#course-paths').innerHTML = courses.map(course => `<a class="path-card ${course.color}" href="#curso/${course.id}"><span class="path-symbol" aria-hidden="true">${course.art === 'derivative' ? 'f′' : course.art === 'integral' ? '∫' : course.art === 'probability' ? 'P' : course.art === 'inference' ? 'x̄' : course.art === 'algebra' ? 'x²' : 'θ'}</span><span><strong>${course.title}</strong><small>${course.lessons.length} explicaciones · ${course.level}</small></span><span aria-hidden="true">↗</span></a>`).join('');
  select('#saved-count').textContent = saved.size;
  select('#course-topics').innerHTML = [{ id: 'all', title: 'Todos' }, ...library.topics].map(topic => `<button class="course-topic" type="button" data-course-topic="${topic.id}" aria-pressed="${topic.id === 'all'}">${escape(topic.title)}</button>`).join('');
  selectAll('[data-course-topic]').forEach(button => button.addEventListener('click', () => updateCourseCatalog({ topic: button.dataset.courseTopic })));
  select('#course-level-filter').addEventListener('change', event => updateCourseCatalog({ level: event.target.value }));
  select('[data-reset-courses]').addEventListener('click', () => { updateCourseCatalog({ topic: 'all', level: 'all' }); select('[data-course-topic="all"]').focus(); });
  select('#content-search').addEventListener('input', event => updateCatalog({ query: event.target.value }, true));
  select('#search-form').addEventListener('submit', event => { event.preventDefault(); updateCatalog({ query: select('#content-search').value }); select(page === 'cursos' ? '#courses-title' : '#catalog-title').focus(); });
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
    if (event.target.closest('[data-player-next]')) { movePlayer(1); return; }
    if (event.target.closest('[data-player-back]')) { movePlayer(-1); return; }
    if (event.target.closest('[data-player-reveal]')) { revealStep(); return; }
    const complete = event.target.closest('[data-complete]');
    if (complete) { setCompleted(complete.dataset.complete, !completed.has(complete.dataset.complete)); select('[data-complete]')?.focus(); return; }
    // Avanzar a la siguiente lección completa la actual, sin interrumpir la navegación.
    const leaving = event.target.closest('[data-complete-on-leave]');
    if (leaving) setCompleted(leaving.dataset.completeOnLeave, true, false);
    if (event.target.closest('[data-outline-toggle]')) {
      outlineOpen = !outlineOpen;
      select('#player-outline')?.classList.toggle('is-open', outlineOpen);
      select('[data-outline-toggle]')?.setAttribute('aria-expanded', String(outlineOpen));
      return;
    }
    const arrow = event.target.closest('[data-rail]');
    if (arrow) {
      const rail = document.getElementById(arrow.dataset.rail);
      rail.scrollBy({ left: Number(arrow.dataset.direction) * rail.clientWidth * .9, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
      return;
    }
    if (event.target.closest('[data-profile-export]')) { exportProgress(); return; }
    if (event.target.closest('[data-profile-reset]')) { resetProgress(); return; }
    const download = event.target.closest('[data-download]');
    if (download) downloadCourse(download.dataset.download);
    if (event.target.closest('[data-copy]')) {
      try { await navigator.clipboard.writeText(location.href); toast('Enlace copiado. Comparte esta idea.'); }
      catch { toast('Puedes copiar el enlace desde la barra de direcciones.'); }
    }
  });
  document.addEventListener('submit', event => {
    if (!event.target.closest('[data-profile-form]')) return;
    event.preventDefault();
    const name = select('#profile-name').value.trim().slice(0, 40);
    storeList('mathbrain-profile', { name });
    renderProfile();
    select('#detail-title').focus();
    toast(name ? `Listo, ${name}. Así te saludará Zuka.` : 'Nombre borrado.');
  });
  document.addEventListener('change', event => {
    const input = event.target.closest('[data-profile-import]');
    if (input?.files?.[0]) importProgress(input.files[0]);
  });
  // Al cambiar de tema se vuelve a dibujar la página para que las ilustraciones usen su paleta, salvo en mitad de una lección.
  document.addEventListener('mathbrain:themechange', () => {
    if (player) return;
    lastRoutedHash = null;
    route(false);
  });
  window.addEventListener('hashchange', () => route());
  window.addEventListener('popstate', () => route());
  window.addEventListener('resize', updateRails, { passive: true });
  route(false);
})();
