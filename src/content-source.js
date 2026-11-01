// Fuente del contenido: las lecciones y sus bloques viven en Supabase (tablas lessons y lesson_blocks).
// La app arranca con el contenido compilado (content.js) para funcionar sin conexión y lo corrige con lo
// último que trajo de la base de datos:
// - El índice de lecciones (títulos, orden, lecciones nuevas o retiradas) se guarda en el dispositivo y
//   se aplica al arrancar, antes de que library.js arme los cursos. Se refresca en segundo plano.
// - Los bloques de una lección se piden al abrirla. Solo se guardan los que difieren del contenido
//   compilado, así el almacenamiento del dispositivo no se llena con copias idénticas.
(() => {
  'use strict';

  const INDEX_KEY = 'zuka-contenido-indice';
  const BLOCKS_KEY = 'zuka-contenido-bloques';
  const MAX_CACHE = 1500000;
  const TIMEOUT = 6000;
  const config = window.ZUKA_CONFIG || {};
  const engine = window.ZUKA_ENGINE;
  const bundled = new Map((window.MATHBRAIN_CONTENT || []).map(lesson => [lesson.id, lesson]));
  const memory = new Map();

  function readJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; }
  }

  const online = () => typeof fetch === 'function' && Boolean(config.supabaseUrl && config.supabaseKey) && navigator.onLine !== false;

  async function request(path) {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timer = controller && setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const response = await fetch(`${config.supabaseUrl}/rest/v1/${path}`, { headers: { apikey: config.supabaseKey, Accept: 'application/json' }, signal: controller?.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  // Aplica el índice de la base de datos sobre el contenido compilado: actualiza los datos de cada lección,
  // añade las lecciones nuevas cuyo módulo existe en courses.js, retira las despublicadas y respeta el orden.
  function applyIndex(index) {
    const content = window.MATHBRAIN_CONTENT;
    if (!Array.isArray(content) || !Array.isArray(index) || !index.length) return;
    const modules = new Map((window.MATHBRAIN_COURSES || []).map(course => [course.id, new Set((course.modules || []).map(module => module.title))]));
    const published = new Map();
    for (const row of index) {
      const unit = row.units?.title || bundled.get(row.id)?.unit || null;
      if (!modules.has(row.course_id) || (modules.get(row.course_id).size && !modules.get(row.course_id).has(unit))) continue;
      const base = bundled.get(row.id);
      published.set(row.id, {
        ...(base || { id: row.id, steps: [], exercises: 0, remote: true }),
        courseId: row.course_id, title: row.title, description: row.description || '', minutes: row.minutes || 3,
        video: row.video || null, ...(row.video_format === 'vertical' ? { videoFormat: 'vertical' } : { videoFormat: undefined }),
        tags: row.tags || '', key: row.key_idea || base?.key || '', unit, position: row.position
      });
    }
    // Un índice sin lecciones de un curso no lo deja vacío: ese curso conserva su contenido compilado.
    const coursesInIndex = new Set([...published.values()].map(lesson => lesson.courseId));
    const kept = content.filter(lesson => !coursesInIndex.has(lesson.courseId));
    const order = (window.MATHBRAIN_COURSES || []).map(course => course.id);
    const merged = [...kept, ...published.values()].sort((first, second) => order.indexOf(first.courseId) - order.indexOf(second.courseId) || (first.position ?? 0) - (second.position ?? 0));
    content.splice(0, content.length, ...merged.map(({ position, ...lesson }) => lesson));
  }

  async function refreshIndex() {
    if (!online()) return null;
    const index = await request('lessons?select=id,course_id,position,title,description,minutes,video,video_format,tags,key_idea,units(title)&order=course_id,position');
    if (Array.isArray(index) && index.length) writeJson(INDEX_KEY, index);
    return index;
  }

  const same = (first, second) => JSON.stringify(first) === JSON.stringify(second);

  function rememberBlocks(id, blocks) {
    const lesson = bundled.get(id);
    const cache = readJson(BLOCKS_KEY) || {};
    if (lesson && same(blocks, engine.fromLesson(lesson))) delete cache[id];
    else cache[id] = blocks;
    if (JSON.stringify(cache).length <= MAX_CACHE) writeJson(BLOCKS_KEY, cache);
  }

  // Bloques disponibles ya mismo, sin red: los últimos traídos de la base de datos o los compilados.
  function blocks(lesson) {
    const stored = memory.get(lesson.id) || readJson(BLOCKS_KEY)?.[lesson.id];
    return engine.playable(Array.isArray(stored) ? stored : engine.fromLesson(lesson));
  }

  // Pide los bloques de la lección a la base de datos. Devuelve null si no hay conexión o la lección no está.
  async function refreshLesson(lesson) {
    if (!online()) return null;
    const rows = await request(`lesson_blocks?select=type,html,data&lesson_id=eq.${encodeURIComponent(lesson.id)}&order=position`);
    if (!Array.isArray(rows) || !rows.length) return null;
    const fresh = rows.map(engine.normalize);
    memory.set(lesson.id, fresh);
    rememberBlocks(lesson.id, fresh);
    return engine.playable(fresh);
  }

  applyIndex(readJson(INDEX_KEY));
  window.ZUKA_CONTENT = { blocks, refreshLesson, refreshIndex: () => refreshIndex().catch(() => null), applyIndex };
  if (document.readyState === 'complete') refreshIndex().catch(() => null);
  else window.addEventListener('load', () => { refreshIndex().catch(() => null); }, { once: true });
})();
