// Compila las lecciones de content/<curso>/NN-tema.md en dist/content.js.
// Las fórmulas LaTeX ($…$ y $$…$$) se convierten a HTML con KaTeX durante la compilación,
// así que el navegador solo necesita dist/vendor/katex/katex.min.css y sus fuentes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const katex = require('../vendor/katex/katex.min.js');

const root = path.resolve(__dirname, '..');
const contentDirectory = path.join(root, 'content');
const outputPath = path.join(root, 'dist', 'content.js');
const blockTitles = { idea: 'La idea clave', ejemplo: 'Veámoslo con un ejemplo', nota: 'Ten en cuenta' };
const frontMatterFields = new Set(['titulo', 'descripcion', 'video', 'etiquetas', 'unidad', 'modulo']);
// Notación en español disponible en todas las fórmulas: \sen x, \cis \theta, \arcsen x, \gr P, \Dom f, \Ran f.
const macros = { '\\sen': '\\operatorname{sen}', '\\arcsen': '\\operatorname{arcsen}', '\\cis': '\\operatorname{cis}', '\\gr': '\\operatorname{gr}', '\\Dom': '\\operatorname{Dom}', '\\Ran': '\\operatorname{Ran}' };

class ContentError extends Error {
  constructor(file, line, message) {
    super(`${file}${line ? `:${line}` : ''}: ${message}`);
  }
}

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function renderMath(tex, displayMode, where) {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: true, strict: 'ignore', output: 'htmlAndMathml', macros: { ...macros } });
  } catch (error) {
    throw new ContentError(where.file, where.line, `LaTeX no válido en «${tex}»: ${error.message.replace(/^KaTeX parse error: /, '')}`);
  }
}

// Una fórmula en bloque con varias partes separadas por \qquad se divide en piezas que,
// en pantallas estrechas, pasan a la línea siguiente en vez de obligar a desplazarse.
function displayMath(tex, where) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < tex.length; index += 1) {
    if (tex[index] === '\\') {
      if (depth === 0 && tex.startsWith('\\qquad', index) && !/[a-zA-Z]/.test(tex[index + 6] || '')) {
        parts.push(tex.slice(start, index));
        start = index + 6;
        index += 5;
      } else if (tex.startsWith('\\begin', index)) depth += 1;
      else if (tex.startsWith('\\end', index)) depth -= 1;
      else index += 1;
    } else if (tex[index] === '{') depth += 1;
    else if (tex[index] === '}') depth -= 1;
  }
  parts.push(tex.slice(start));
  const pieces = parts.map(part => part.trim()).filter(Boolean);
  if (pieces.length < 2) return `<div class="math-display">${renderMath(tex, true, where)}</div>`;
  return `<div class="math-display math-group">${pieces.map(piece => `<span class="math-part">${renderMath(piece, true, where)}</span>`).join('')}</div>`;
}

// Convierte una línea de Markdown en HTML: fórmulas, **negrita**, *cursiva*, `código` y [enlaces](https://…).
function inline(text, where) {
  const formulas = [];
  const protect = html => `\u0000${formulas.push(html) - 1}\u0000`;
  let source = text.replace(/\$\$([^$]+?)\$\$/g, (match, tex) => protect(renderMath(tex.trim(), true, where)));
  source = source.replace(/(^|[^\\])\$([^$\n]+?)\$/g, (match, before, tex) => before + protect(renderMath(tex.trim(), false, where)));
  if (/(^|[^\\])\$/.test(source)) throw new ContentError(where.file, where.line, 'Hay un signo $ sin cerrar. Escribe \\$ para mostrar un dólar.');
  let html = escapeHtml(source.replace(/\\\$/g, '$'));
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  return html.replace(/\u0000(\d+)\u0000/g, (match, index) => formulas[Number(index)]);
}

// Texto sin formato para la búsqueda y la descarga del programa.
function plainTex(tex) {
  const symbols = { to: '→', cdot: '·', cdots: '⋯', ldots: '…', dots: '…', times: '×', neq: '≠', ne: '≠', leq: '≤', le: '≤', geq: '≥', ge: '≥', pm: '±', mp: '∓', infty: '∞', iff: '⟺', Rightarrow: '⇒', circ: '∘', in: '∈', subset: '⊂', cup: '∪', pi: 'π', theta: 'θ', sigma: 'σ', mu: 'μ', alpha: 'α', beta: 'β', omega: 'ω', Delta: 'Δ', sqrt: '√', sum: 'Σ', prod: 'Π' };
  const operators = new Set(['sen', 'cos', 'tan', 'cot', 'sec', 'csc', 'cis', 'log', 'ln', 'lim', 'arcsen', 'gr', 'Dom', 'Ran']);
  const sets = { N: 'ℕ', Z: 'ℤ', Q: 'ℚ', R: 'ℝ', C: 'ℂ', I: '𝕀' };
  let text = tex.replace(/\\(?:left|right|,|;|!|quad|qquad|displaystyle)/g, ' ').replace(/\\text\{([^{}]*)\}/g, '$1')
    .replace(/\^\\circ/g, '°').replace(/\\mathbb\{([A-Z])\}/g, (match, letter) => sets[letter] || letter).replace(/\\overline\{([^{}]*)\}/g, '$1');
  for (let previous; previous !== text;) {
    previous = text;
    text = text.replace(/\\sqrt\{([^{}]*)\}/g, '√($1)').replace(/\\[dt]?frac\{([^{}]*)\}\{([^{}]*)\}/g, '($1)/($2)');
  }
  return text.replace(/_\{([^{}]*)\}/g, ' $1').replace(/\^\{([^{}]*)\}/g, '^$1')
    .replace(/\\([a-zA-Z]+)/g, (match, name) => operators.has(name) ? ` ${name} ` : symbols[name] || name).replace(/[{}]/g, '').replace(/ _/g, '_');
}

function plain(text) {
  return text.replace(/\$\$?([^$]+)\$\$?/g, (match, tex) => plainTex(tex))
    .replace(/[*`]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').replace(/\s+([,.:;])/g, '$1').trim();
}

function parseAnswer(value) {
  const text = String(value).trim().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/,/g, '.');
  const percent = text.endsWith('%');
  const parts = (percent ? text.slice(0, -1) : text).match(/^(-?\d+(?:\.\d+)?)(?:\/(-?\d+(?:\.\d+)?))?$/);
  if (!parts || Number(parts[2]) === 0) return null;
  return Number(parts[1]) / (parts[2] === undefined ? 1 : Number(parts[2])) / (percent ? 100 : 1);
}

// Convierte una secuencia de líneas Markdown (sin bloques :::) en HTML.
function blocks(lines, file, firstLine) {
  const html = [];
  let paragraph = [];
  let list = null;
  const flushParagraph = () => {
    if (paragraph.length) html.push(`<p>${inline(paragraph.map(entry => entry.text).join(' '), { file, line: paragraph[0].line })}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (list) html.push(`<${list.tag}>${list.items.map(item => `<li>${item}</li>`).join('')}</${list.tag}>`);
    list = null;
  };
  for (let index = 0; index < lines.length; index += 1) {
    const line = firstLine + index;
    const text = lines[index].trimEnd();
    const where = { file, line };
    if (!text.trim()) { flushParagraph(); flushList(); continue; }
    if (text.trim().startsWith('$$') && !/^\$\$.+\$\$$/.test(text.trim())) {
      flushParagraph(); flushList();
      const formula = [text.trim().slice(2)];
      while (++index < lines.length && !lines[index].trim().endsWith('$$')) formula.push(lines[index]);
      if (index >= lines.length) throw new ContentError(file, line, 'La fórmula $$ no tiene cierre.');
      formula.push(lines[index].trim().slice(0, -2));
      html.push(displayMath(formula.join('\n').trim(), where));
      continue;
    }
    if (/^\$\$.+\$\$$/.test(text.trim())) {
      flushParagraph(); flushList();
      html.push(displayMath(text.trim().slice(2, -2).trim(), where));
      continue;
    }
    const heading = text.match(/^(#{2,3})\s+(.+)$/);
    if (heading) { flushParagraph(); flushList(); html.push(`<h${heading[1].length}>${inline(heading[2], where)}</h${heading[1].length}>`); continue; }
    if (/^#\s/.test(text)) throw new ContentError(file, line, 'Usa ## o ### para los subtítulos: el título de la lección va en «titulo».');
    const item = text.match(/^\s*(?:([-*])|(\d+)\.)\s+(.+)$/);
    if (item) {
      flushParagraph();
      const tag = item[1] ? 'ul' : 'ol';
      if (list && list.tag !== tag) flushList();
      list = list || { tag, items: [] };
      list.items.push(inline(item[3], where));
      continue;
    }
    flushList();
    paragraph.push({ text: text.trim(), line });
  }
  flushParagraph();
  flushList();
  return html.join('');
}

function exercise(lines, file, firstLine, id, number) {
  const fields = {};
  const statement = [];
  const options = [];
  lines.forEach((text, index) => {
    const field = text.match(/^(respuesta|tolerancia|pista|solucion):\s*(.*)$/);
    const option = text.match(/^\s*-\s+\[( |x|X)\]\s+(.+)$/);
    if (field) fields[field[1]] = { value: field[2].trim(), line: firstLine + index };
    else if (option) options.push({ correct: option[1] !== ' ', text: option[2], line: firstLine + index });
    else statement.push({ text, line: firstLine + index });
  });
  const statementHtml = blocks(statement.map(entry => entry.text), file, statement[0]?.line ?? firstLine);
  if (!statementHtml) throw new ContentError(file, firstLine, 'El ejercicio necesita un enunciado.');
  const inputId = `${id}-ejercicio-${number}`;
  let answerHtml;
  let kind;
  if (options.length) {
    kind = 'choice';
    if (fields.respuesta) throw new ContentError(file, fields.respuesta.line, 'Un ejercicio de opción múltiple marca la respuesta con [x], no con «respuesta:».');
    if (options.filter(option => option.correct).length !== 1) throw new ContentError(file, firstLine, 'Marca exactamente una opción correcta con [x].');
    answerHtml = `<fieldset class="lesson-choices"><legend class="sr-only">Elige una opción</legend>${options.map((option, index) => `<label><input type="radio" name="${inputId}" value="${index}"${option.correct ? ' data-correct' : ''}><span>${inline(option.text, { file, line: option.line })}</span></label>`).join('')}</fieldset>`;
  } else {
    kind = 'number';
    if (!fields.respuesta) throw new ContentError(file, firstLine, 'Falta «respuesta:» (un número, una fracción como 8/3 o un porcentaje) o las opciones - [x].');
    if (parseAnswer(fields.respuesta.value) === null) throw new ContentError(file, fields.respuesta.line, `La respuesta «${fields.respuesta.value}» no es un número, una fracción ni un porcentaje.`);
    if (fields.tolerancia && !(Number(fields.tolerancia.value.replace(',', '.')) >= 0)) throw new ContentError(file, fields.tolerancia.line, 'La tolerancia debe ser un número mayor o igual que 0.');
    answerHtml = `<label class="lesson-answer-label" for="${inputId}">Tu respuesta</label><input id="${inputId}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="40" placeholder="Ej.: 3/4, 0,75 o 75 %">`;
  }
  const answerData = kind === 'number' ? ` data-answer="${escapeHtml(fields.respuesta.value)}"${fields.tolerancia ? ` data-tolerance="${escapeHtml(fields.tolerancia.value.replace(',', '.'))}"` : ''}` : '';
  const hint = fields.pista ? `<details class="lesson-hint"><summary>Ver una pista</summary><p>${inline(fields.pista.value, { file, line: fields.pista.line })}</p></details>` : '';
  const solution = fields.solucion ? `<details class="lesson-solution"><summary>Ver solución</summary><p>${inline(fields.solucion.value, { file, line: fields.solucion.line })}</p></details>` : '';
  return `<form class="lesson-exercise" data-kind="${kind}"${answerData} novalidate><p class="lesson-exercise-label">Práctica · Ejercicio ${number}</p><div class="lesson-exercise-statement">${statementHtml}</div><div class="answer-row">${answerHtml}<button class="button button-secondary" type="submit">Comprobar</button></div><p class="answer-feedback" role="status" aria-live="polite"></p>${hint}${solution}</form>`;
}

function compileLesson(source, file, id) {
  const lines = source.replace(/^﻿/, '').replace(/\r\n?/g, '\n').split('\n');
  if (lines[0].trim() !== '---') throw new ContentError(file, 1, 'La lección debe empezar con un bloque --- de datos (titulo, descripcion, video, etiquetas).');
  const end = lines.indexOf('---', 1);
  if (end < 0) throw new ContentError(file, 1, 'Falta la línea --- que cierra los datos de la lección.');
  const data = {};
  for (let index = 1; index < end; index += 1) {
    const text = lines[index].trim();
    if (!text || text.startsWith('#')) continue;
    const field = text.match(/^([a-z]+):\s*(.*)$/);
    if (!field || !frontMatterFields.has(field[1])) throw new ContentError(file, index + 1, `Campo no reconocido. Usa: ${[...frontMatterFields].join(', ')}.`);
    data[field[1]] = field[2].trim();
  }
  for (const required of ['titulo', 'descripcion']) if (!data[required]) throw new ContentError(file, 1, `Falta el campo «${required}».`);
  if (data.video && !/^(https:\/\/|assets\/videos\/)/.test(data.video)) throw new ContentError(file, 1, 'El video debe ser un enlace https:// (YouTube, Vimeo) o un archivo en assets/videos/.');

  const html = [];
  let key = '';
  let exercises = 0;
  let pending = [];
  let pendingLine = end + 2;
  const flush = () => { html.push(blocks(pending, file, pendingLine)); pending = []; };
  for (let index = end + 1; index < lines.length; index += 1) {
    const opening = lines[index].trim().match(/^:::\s*([a-z]+)$/);
    if (!opening) {
      if (!pending.length) pendingLine = index + 1;
      if (lines[index].trim() === ':::') throw new ContentError(file, index + 1, 'Cierre ::: sin un bloque abierto.');
      pending.push(lines[index]);
      continue;
    }
    flush();
    const type = opening[1];
    const start = index + 1;
    const inner = [];
    while (++index < lines.length && lines[index].trim() !== ':::') inner.push(lines[index]);
    if (index >= lines.length) throw new ContentError(file, start, `El bloque :::${type} no tiene cierre :::.`);
    if (type === 'ejercicio') {
      exercises += 1;
      html.push(exercise(inner, file, start + 1, id, exercises));
    } else if (blockTitles[type]) {
      if (type === 'idea') key = key || plain(inner.join(' '));
      html.push(`<div class="${type === 'idea' ? 'key-concept' : type === 'ejemplo' ? 'example-box' : 'lesson-note'}"><h3>${blockTitles[type]}</h3>${blocks(inner, file, start + 1)}</div>`);
    } else {
      throw new ContentError(file, start, `Bloque :::${type} desconocido. Usa :::idea, :::ejemplo, :::nota o :::ejercicio.`);
    }
    pendingLine = index + 2;
  }
  flush();
  if (!key) throw new ContentError(file, 1, 'Cada lección necesita un bloque :::idea con su idea clave.');
  // Tiempo estimado de lectura: unas 120 palabras por minuto, ritmo de estudio; cada fórmula cuenta como una palabra (cuatro si va en bloque).
  const words = lines.slice(end + 1).join('\n').replace(/\$\$[\s\S]*?\$\$/g, ' f f f f ').replace(/\$[^$\n]*\$/g, ' f ').split(/\s+/).filter(word => /[\p{L}\p{N}]/u.test(word)).length;
  const minutes = Math.max(2, Math.round(words / 120));
  return { id, title: data.titulo, description: data.descripcion, video: data.video || null, tags: data.etiquetas || '', unit: data.unidad || null, module: data.modulo || null, key, exercises, minutes, html: html.join('') };
}

function compileAll() {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(root, 'dist', 'courses.js'), 'utf8'), context);
  const courses = context.window.MATHBRAIN_COURSES;
  const folders = fs.readdirSync(contentDirectory, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
  for (const folder of folders) if (!courses.some(course => course.id === folder)) throw new ContentError(`content/${folder}`, 0, 'La carpeta no corresponde a ningún curso de dist/courses.js.');
  return courses.flatMap(course => {
    const folder = path.join(contentDirectory, course.id);
    const files = fs.existsSync(folder) ? fs.readdirSync(folder).filter(name => name.endsWith('.md')).sort() : [];
    if (!files.length) throw new ContentError(`content/${course.id}`, 0, 'El curso no tiene lecciones .md.');
    const lessons = files.map((name, index) => {
      if (!/^\d{2}-[a-z0-9-]+\.md$/.test(name)) throw new ContentError(`content/${course.id}/${name}`, 0, 'El nombre debe tener la forma 01-tema-en-minusculas.md.');
      const file = `content/${course.id}/${name}`;
      return { courseId: course.id, file, ...compileLesson(fs.readFileSync(path.join(folder, name), 'utf8'), file, `${course.id}-${index + 1}`) };
    });
    // Si el curso define módulos, cada lección pertenece a uno de ellos y los módulos se recorren en orden.
    if (course.modules?.length) {
      const titles = course.modules.map(module => module.title);
      let previous = 0;
      for (const lesson of lessons) {
        const position = titles.indexOf(lesson.unit);
        if (position < 0) throw new ContentError(lesson.file, 1, `«unidad: ${lesson.unit || ''}» no coincide con ningún módulo de ${course.id} en dist/courses.js. Usa uno de: ${titles.join(' | ')}.`);
        if (position < previous) throw new ContentError(lesson.file, 1, `La lección está en «${lesson.unit}», pero un archivo anterior ya pertenece a un módulo posterior. Ordena los archivos por módulo.`);
        previous = position;
      }
      const empty = titles.find(title => !lessons.some(lesson => lesson.unit === title));
      if (empty) throw new ContentError(`content/${course.id}`, 0, `El módulo «${empty}» no tiene lecciones.`);
    }
    return lessons.map(({ file, ...lesson }) => lesson);
  });
}

function render(lessons) {
  return `// Archivo generado por scripts/build-content.cjs a partir de content/. No lo edites a mano.\nwindow.MATHBRAIN_CONTENT = ${JSON.stringify(lessons, null, 1)};\n`;
}

if (require.main === module) {
  try {
    const lessons = compileAll();
    fs.writeFileSync(outputPath, render(lessons));
    console.log(`MathBrain contenido: ${lessons.length} lecciones, ${lessons.reduce((total, lesson) => total + lesson.exercises, 0)} ejercicios interactivos.`);
  } catch (error) {
    console.error(error instanceof ContentError ? `Error en el contenido · ${error.message}` : error);
    process.exit(1);
  }
}

module.exports = { compileLesson, compileAll, render, ContentError };
