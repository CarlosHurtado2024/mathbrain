// Sistema de ejercicios de Zuka. Cada ejercicio es una especificación (JSON) con enunciado, visual opcional,
// respuesta esperada, método de validación, explicación de la solución, pistas progresivas y errores
// frecuentes. Cada tipo es un componente independiente con cuatro partes:
//   render(spec, key)   → HTML del área de respuesta
//   mount(form, state)  → interacción (arrastrar, ordenar, marcar puntos…)
//   read(form, state)   → la respuesta, o { invalid: mensaje } si está incompleta
//   check(spec, value)  → { correct, message }: si falla, el mensaje explica por qué
// Las funciones check no tocan el DOM: se prueban en tests/exercises.test.cjs y el compilador de contenido
// las usa para validar cada ejercicio antes de publicarlo.
(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const plain = html => String(html ?? '').replace(/<annotation[\s\S]*?<\/annotation>/g, '').replace(/<span class="katex-mathml">[\s\S]*?<\/math><\/span>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const format = value => Number.isInteger(value) ? String(value) : String(Math.round(value * 10000) / 10000).replace('.', ',');
  const close = (first, second, tolerance = 1e-9) => Math.abs(first - second) <= tolerance;

  // ── Números ───────────────────────────────────────────────────────────────────────────────
  // Acepta enteros, decimales con coma o punto, fracciones (8/3) y porcentajes (25 %). «x = 3» también vale.
  function parseNumber(value) {
    const text = String(value ?? '').trim().toLowerCase().replace(/[−–]/g, '-').replace(/\s+/g, '').replace(/^[a-z]\w*=/, '');
    const percent = text.endsWith('%');
    const clean = (percent ? text.slice(0, -1) : text).replace(/,/g, '.');
    const parts = clean.match(/^(-?\d+(?:\.\d+)?|-?\.\d+)(?:\/(-?\d+(?:\.\d+)?))?$/);
    if (!parts || Number(parts[2]) === 0) return null;
    const number = Number(parts[1]) / (parts[2] === undefined ? 1 : Number(parts[2]));
    return percent ? number / 100 : number;
  }

  // ── Expresiones simbólicas ────────────────────────────────────────────────────────────────
  // Analizador pequeño para expresiones como 3x^2 - 2x + 1, sen(x)/x o 2(x+1)^3. Admite multiplicación
  // implícita, · × ÷ −, ², ³, π, √ y las funciones habituales en español o en inglés.
  const FUNCTIONS = { sin: Math.sin, sen: Math.sin, cos: Math.cos, tan: Math.tan, tg: Math.tan, asin: Math.asin, arcsen: Math.asin, arcsin: Math.asin, acos: Math.acos, arccos: Math.acos, atan: Math.atan, arctan: Math.atan, sqrt: Math.sqrt, raiz: Math.sqrt, ln: Math.log, log: Math.log10, exp: Math.exp, abs: Math.abs };
  const CONSTANTS = { pi: Math.PI, e: Math.E };
  const NAMES = [...Object.keys(FUNCTIONS), ...Object.keys(CONSTANTS)].sort((first, second) => second.length - first.length);

  class ExpressionError extends Error {}

  function tokenize(source) {
    const text = String(source ?? '').toLowerCase().trim()
      .replace(/^(?:[a-z]\s*(?:\([a-z]\))?\s*=)/, '')
      .replace(/[·×]/g, '*').replace(/÷/g, '/').replace(/[−–]/g, '-').replace(/²/g, '^2').replace(/³/g, '^3').replace(/π/g, 'pi').replace(/√/g, 'sqrt')
      .replace(/(\d),(\d)/g, '$1.$2').replace(/\*\*/g, '^');
    const tokens = [];
    let index = 0;
    while (index < text.length) {
      const character = text[index];
      if (/\s/.test(character)) { index += 1; continue; }
      const number = text.slice(index).match(/^(\d+(?:\.\d+)?|\.\d+)/);
      if (number) { tokens.push({ type: 'number', value: Number(number[1]) }); index += number[1].length; continue; }
      if (/[a-z]/.test(character)) {
        const name = NAMES.find(candidate => text.startsWith(candidate, index));
        if (name) tokens.push({ type: FUNCTIONS[name] ? 'function' : 'constant', value: name });
        else tokens.push({ type: 'variable', value: character });
        index += name ? name.length : 1;
        continue;
      }
      if ('+-*/^()'.includes(character)) { tokens.push({ type: 'operator', value: character }); index += 1; continue; }
      throw new ExpressionError(`No reconozco el símbolo «${character}».`);
    }
    if (!tokens.length) throw new ExpressionError('Escribe una expresión.');
    return tokens;
  }

  // Árbol → función de JavaScript. Precedencia: + − < × ÷ (y multiplicación implícita) < signo < potencia.
  function parseExpression(source) {
    const tokens = tokenize(source);
    let position = 0;
    const peek = () => tokens[position];
    const take = () => tokens[position++];
    const isOperator = (token, value) => token?.type === 'operator' && token.value === value;
    const variables = new Set();

    function expression() {
      let node = term();
      while (isOperator(peek(), '+') || isOperator(peek(), '-')) {
        const operator = take().value;
        const left = node;
        const right = term();
        node = operator === '+' ? scope => left(scope) + right(scope) : scope => left(scope) - right(scope);
      }
      return node;
    }
    function term() {
      let node = unary();
      for (;;) {
        const token = peek();
        if (isOperator(token, '*') || isOperator(token, '/')) {
          const operator = take().value;
          const left = node;
          const right = unary();
          node = operator === '*' ? scope => left(scope) * right(scope) : scope => left(scope) / right(scope);
        } else if (token && (token.type !== 'operator' || token.value === '(')) {
          const left = node;
          const right = power();
          node = scope => left(scope) * right(scope);
        } else return node;
      }
    }
    function unary() {
      if (isOperator(peek(), '-')) { take(); const value = unary(); return scope => -value(scope); }
      if (isOperator(peek(), '+')) { take(); return unary(); }
      return power();
    }
    function power() {
      const base = primary();
      if (!isOperator(peek(), '^')) return base;
      take();
      const exponent = unary();
      return scope => base(scope) ** exponent(scope);
    }
    function primary() {
      const token = take();
      if (!token) throw new ExpressionError('La expresión está incompleta.');
      if (token.type === 'number') return () => token.value;
      if (token.type === 'constant') return () => CONSTANTS[token.value];
      if (token.type === 'variable') { variables.add(token.value); return scope => scope[token.value]; }
      if (token.type === 'function') {
        const argument = isOperator(peek(), '(') ? primary() : power();
        const fn = FUNCTIONS[token.value];
        return scope => fn(argument(scope));
      }
      if (isOperator(token, '(')) {
        const inner = expression();
        if (!isOperator(take(), ')')) throw new ExpressionError('Falta cerrar un paréntesis.');
        return inner;
      }
      throw new ExpressionError(token.value === ')' ? 'Sobra un paréntesis de cierre.' : `Falta un número o una variable antes de «${token.value}».`);
    }

    const evaluate = expression();
    if (position < tokens.length) throw new ExpressionError(isOperator(peek(), ')') ? 'Sobra un paréntesis de cierre.' : 'Revisa la expresión: algo sobra al final.');
    return { evaluate: scope => evaluate(scope), variables: [...variables] };
  }

  function tryParse(source) {
    try { return parseExpression(source); } catch { return null; }
  }

  // Puntos de prueba no enteros: dos expresiones distintas casi nunca coinciden en todos.
  const SAMPLES = [0.37, 1.29, -0.83, 2.41, -1.77, 0.91, 1.63, -2.13, 2.87, -0.41];

  function samples(variables) {
    return SAMPLES.map((value, index) => Object.fromEntries(variables.map((name, offset) => [name, offset ? SAMPLES[(index + offset * 3) % SAMPLES.length] : value])));
  }

  // Compara dos expresiones en puntos de prueba. relation: 'same' (iguales), 'constant' (difieren en una
  // constante), 'opposite' (signo contrario) o 'ratio' (proporcionales). Devuelve null si no hay relación.
  function relate(given, expected, variables) {
    const pairs = samples(variables).map(scope => [given.evaluate(scope), expected.evaluate(scope)]).filter(([first, second]) => Number.isFinite(first) && Number.isFinite(second));
    if (pairs.length < 4) return null;
    const near = (first, second) => Math.abs(first - second) <= 1e-6 * (1 + Math.abs(second));
    if (pairs.every(([first, second]) => near(first, second))) return { relation: 'same' };
    if (pairs.every(([first, second]) => near(first, -second))) return { relation: 'opposite' };
    const difference = pairs[0][0] - pairs[0][1];
    if (pairs.every(([first, second]) => near(first - second, difference))) return { relation: 'constant', value: difference };
    const ratio = pairs.find(([, second]) => Math.abs(second) > 1e-9);
    if (ratio) {
      const factor = ratio[0] / ratio[1];
      if (pairs.every(([first, second]) => near(first, factor * second))) return { relation: 'ratio', value: factor };
    }
    return null;
  }

  function equivalent(first, second, variables, upToConstant = false) {
    const relation = relate(first, second, variables)?.relation;
    return relation === 'same' || (upToConstant && relation === 'constant');
  }

  // ── Diagnóstico de errores frecuentes ─────────────────────────────────────────────────────
  // Explica por qué un número no es la respuesta: errores escritos por el autor primero, después patrones
  // típicos (signo, porcentaje, fracción invertida, cifra decimal, redondeo) y, al final, la dirección.
  function diagnoseNumber(value, expected, tolerance, mistakes = []) {
    const nearTo = target => Math.abs(value - target) <= Math.max(tolerance, 1e-9 * (1 + Math.abs(target)));
    const authored = mistakes.find(mistake => { const number = parseNumber(mistake.answer); return number !== null && nearTo(number); });
    if (authored) return authored.why;
    if (expected !== 0 && nearTo(-expected)) return 'Tu resultado tiene el signo contrario. Revisa los signos al operar o al despejar.';
    if (expected !== 0 && (nearTo(expected * 100) || nearTo(expected / 100))) return 'Parece que mezclaste porcentaje y decimal: 25 % equivale a 0,25. Revisa en qué forma va la respuesta.';
    if (expected !== 0 && Math.abs(expected) !== 1 && nearTo(1 / expected)) return 'Tu resultado es el inverso del correcto: parece que el numerador y el denominador quedaron al revés.';
    if (expected !== 0 && (nearTo(expected * 10) || nearTo(expected / 10))) return 'Tu resultado está desplazado una cifra decimal. Revisa dónde va la coma o un factor de 10.';
    if (expected !== 0 && nearTo(expected * 2)) return 'Tu resultado es el doble del correcto. Revisa si contaste algo dos veces o te faltó dividir entre 2.';
    if (expected !== 0 && nearTo(expected / 2)) return 'Tu resultado es la mitad del correcto. Revisa si te faltó un factor 2 o un caso.';
    if (expected !== 0 && Math.abs(value - expected) / Math.abs(expected) < 0.05) return `Estás muy cerca. Revisa el redondeo o un paso intermedio: se acepta una diferencia de hasta ${format(tolerance)}.`;
    return value > expected ? 'Tu resultado es mayor que el correcto. Revisa cada operación y compárala con la pista.' : 'Tu resultado es menor que el correcto. Revisa cada operación y compárala con la pista.';
  }

  function diagnoseExpression(given, expected, variables, mistakes = []) {
    const authored = mistakes.find(mistake => { const parsed = tryParse(mistake.answer); return parsed && equivalent(given, parsed, variables); });
    if (authored) return authored.why;
    const relation = relate(given, expected, variables);
    if (relation?.relation === 'opposite') return 'Tu expresión tiene el signo contrario al correcto. Revisa los signos término por término.';
    if (relation?.relation === 'constant') return `Tu expresión difiere de la correcta en una constante (${format(relation.value)}). Revisa el término independiente.`;
    if (relation?.relation === 'ratio') return `Tu expresión es ${format(relation.value)} veces la correcta. Revisa los coeficientes.`;
    const scope = Object.fromEntries(variables.map(name => [name, 2]));
    const mine = given.evaluate(scope);
    const right = expected.evaluate(scope);
    if (variables.length && Number.isFinite(mine) && Number.isFinite(right)) return `No es equivalente. Por ejemplo, con ${variables.map(name => `${name} = 2`).join(' y ')} tu expresión vale ${format(mine)} y debería valer ${format(right)}.`;
    return 'Tu expresión no es equivalente a la respuesta. Compara término por término con la pista.';
  }

  const variablesOf = spec => spec.variables?.length ? spec.variables : (tryParse(spec.answer)?.variables || ['x']);

  function readExpression(text, spec) {
    if (!String(text ?? '').trim()) return { invalid: 'Escribe tu expresión.' };
    try {
      const parsed = parseExpression(text);
      const allowed = variablesOf(spec);
      const extra = parsed.variables.find(name => !allowed.includes(name));
      if (extra) return { invalid: `Usa solo ${allowed.length === 1 ? 'la variable' : 'las variables'} ${allowed.join(', ')}; «${extra}» no aparece en el problema.` };
      return { value: { text: String(text).trim(), parsed } };
    } catch (error) {
      return { invalid: `${error.message} Usa * o un espacio para multiplicar y ^ para las potencias.` };
    }
  }

  // ── Gráficas en SVG ───────────────────────────────────────────────────────────────────────
  const PLOT = { width: 320, height: 240, pad: 18 };

  function view(domain = {}) {
    const [xMin, xMax] = domain.x || [-5, 5];
    const [yMin, yMax] = domain.y || [-5, 5];
    const sx = value => PLOT.pad + (value - xMin) / (xMax - xMin) * (PLOT.width - 2 * PLOT.pad);
    const sy = value => PLOT.height - PLOT.pad - (value - yMin) / (yMax - yMin) * (PLOT.height - 2 * PLOT.pad);
    const fromX = pixel => xMin + (pixel - PLOT.pad) / (PLOT.width - 2 * PLOT.pad) * (xMax - xMin);
    const fromY = pixel => yMin + (PLOT.height - PLOT.pad - pixel) / (PLOT.height - 2 * PLOT.pad) * (yMax - yMin);
    return { xMin, xMax, yMin, yMax, sx, sy, fromX, fromY };
  }

  function curvePath(evaluate, frame) {
    let path = '';
    let open = false;
    for (let step = 0; step <= 240; step += 1) {
      const x = frame.xMin + (frame.xMax - frame.xMin) * step / 240;
      const y = evaluate(x);
      const inside = Number.isFinite(y) && y > frame.yMin - (frame.yMax - frame.yMin) && y < frame.yMax + (frame.yMax - frame.yMin);
      if (!inside) { open = false; continue; }
      path += `${open ? 'L' : 'M'}${frame.sx(x).toFixed(1)},${frame.sy(y).toFixed(1)}`;
      open = true;
    }
    return path;
  }

  function plane(domain, inner, label) {
    const frame = view(domain);
    const grid = [];
    for (let x = Math.ceil(frame.xMin); x <= frame.xMax; x += 1) grid.push(`<line x1="${frame.sx(x)}" y1="${PLOT.pad}" x2="${frame.sx(x)}" y2="${PLOT.height - PLOT.pad}" class="${x === 0 ? 'plot-axis' : 'plot-grid'}"/>`);
    for (let y = Math.ceil(frame.yMin); y <= frame.yMax; y += 1) grid.push(`<line x1="${PLOT.pad}" y1="${frame.sy(y)}" x2="${PLOT.width - PLOT.pad}" y2="${frame.sy(y)}" class="${y === 0 ? 'plot-axis' : 'plot-grid'}"/>`);
    return `<svg class="exercise-plot" viewBox="0 0 ${PLOT.width} ${PLOT.height}" role="img" aria-label="${escape(label)}" data-plot>${grid.join('')}<text x="${PLOT.width - PLOT.pad + 4}" y="${frame.sy(0) - 4}" class="plot-label">x</text><text x="${frame.sx(0) + 4}" y="${PLOT.pad - 4}" class="plot-label">y</text><g data-plot-layer>${inner}</g></svg>`;
  }

  // ── Simulaciones probabilísticas ─────────────────────────────────────────────────────────
  // Modelos: monedas (número de caras) y dados (suma de los puntos). El evento compara ese número.
  const OPERATORS = { '=': (first, second) => first === second, '>=': (first, second) => first >= second, '<=': (first, second) => first <= second, '>': (first, second) => first > second, '<': (first, second) => first < second };

  function outcomes(model) {
    const faces = model.kind === 'coins' ? [0, 1] : [1, 2, 3, 4, 5, 6];
    let totals = [0];
    for (let index = 0; index < model.count; index += 1) totals = totals.flatMap(total => faces.map(face => total + face));
    return totals;
  }

  function exactProbability(model) {
    const all = outcomes(model);
    return all.filter(total => OPERATORS[model.event.op](total, model.event.value)).length / all.length;
  }

  function simulate(model, trials, random = Math.random) {
    let hits = 0;
    for (let trial = 0; trial < trials; trial += 1) {
      let total = 0;
      for (let index = 0; index < model.count; index += 1) total += model.kind === 'coins' ? (random() < .5 ? 1 : 0) : 1 + Math.floor(random() * 6);
      if (OPERATORS[model.event.op](total, model.event.value)) hits += 1;
    }
    return hits;
  }

  function describeModel(model) {
    const what = model.kind === 'coins' ? `el número de caras al lanzar ${model.count} ${model.count === 1 ? 'moneda' : 'monedas'}` : `la suma al lanzar ${model.count} ${model.count === 1 ? 'dado' : 'dados'}`;
    const words = { '=': 'es igual a', '>=': 'es al menos', '<=': 'es como mucho', '>': 'es mayor que', '<': 'es menor que' };
    return `${what} ${words[model.event.op]} ${model.event.value}`;
  }

  // ── Tipos de ejercicio ────────────────────────────────────────────────────────────────────
  const field = (form, selector) => form.querySelector(selector);
  const fieldsOf = (form, selector) => [...form.querySelectorAll(selector)];

  // Barajado estable (el mismo para cada ejercicio) que nunca deja el orden correcto.
  function shuffled(count, seed) {
    const order = [...Array(count).keys()];
    let state = [...String(seed)].reduce((total, character) => (total * 31 + character.charCodeAt(0)) >>> 0, 7) || 1;
    const random = () => { state = (state * 1103515245 + 12345) >>> 0; return state / 4294967296; };
    for (let index = count - 1; index > 0; index -= 1) {
      const other = Math.floor(random() * (index + 1));
      [order[index], order[other]] = [order[other], order[index]];
    }
    if (count > 1 && order.every((value, index) => value === index)) order.push(order.shift());
    return order;
  }

  // Iconos de trazo (mismo grosor que el resto de la app) para mover los pasos.
  const chevron = path => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`;
  const CHEVRON_UP = chevron('m6 15 6-6 6 6');
  const CHEVRON_DOWN = chevron('m6 9 6 6 6-6');

  const TYPES = {};

  // 1. Opción múltiple: cada opción incorrecta puede explicar por qué no es (why).
  TYPES.choice = {
    label: 'Opción múltiple',
    validate: spec => (spec.options?.length >= 2 ? [] : ['Necesita al menos dos opciones.']).concat(spec.multiple || spec.options?.filter(option => option.correct).length === 1 ? [] : ['Marca exactamente una opción correcta.']),
    render: (spec, key) => `<fieldset class="lesson-choices${spec.options.length === 2 ? ' is-pair' : ''}"><legend class="sr-only">${spec.multiple ? 'Elige todas las opciones correctas' : 'Elige una opción'}</legend>${spec.options.map((option, index) => `<label><input type="${spec.multiple ? 'checkbox' : 'radio'}" name="${escape(key)}" value="${index}"><span>${option.html}</span></label>`).join('')}</fieldset>`,
    read: form => {
      const chosen = fieldsOf(form, 'input:checked').map(input => Number(input.value));
      return chosen.length ? { value: chosen } : { invalid: 'Elige una de las opciones.' };
    },
    check: (spec, chosen) => {
      const correct = spec.options.map((option, index) => option.correct ? index : -1).filter(index => index >= 0);
      const wrong = chosen.filter(index => !spec.options[index].correct);
      const missing = correct.filter(index => !chosen.includes(index));
      if (!wrong.length && !missing.length) return { correct: true };
      if (wrong.length) {
        const option = spec.options[wrong[0]];
        return { correct: false, message: option.why || `«${plain(option.html)}» no es la respuesta. Revisa la condición que pide el enunciado.`, marks: wrong };
      }
      return { correct: false, message: `Vas bien, pero falta${missing.length === 1 ? '' : 'n'} ${missing.length} ${missing.length === 1 ? 'opción correcta' : 'opciones correctas'}.` };
    },
    retry: form => fieldsOf(form, 'input:checked').forEach(input => { input.checked = false; }),
    reveal: (form, spec) => spec.options.forEach((option, index) => { if (option.correct) field(form, `input[value="${index}"]`)?.closest('label')?.classList.add('is-answer'); }),
    summary: (spec, chosen) => chosen.map(index => plain(spec.options[index].html)).join(' | ')
  };

  // 2. Respuesta numérica: número, fracción o porcentaje, con tolerancia.
  TYPES.numeric = {
    label: 'Respuesta numérica',
    validate: spec => parseNumber(spec.answer) === null ? [`La respuesta «${spec.answer}» no es un número, una fracción ni un porcentaje.`] : [],
    render: (spec, key) => `<div class="answer-row exercise-number"><label class="lesson-answer-label" for="${escape(key)}-valor">${spec.label || 'Tu respuesta'}</label><input id="${escape(key)}-valor" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="40" placeholder="${escape(spec.placeholder || 'Ej.: 3/4, 0,75 o 75 %')}">${spec.unit ? `<span class="exercise-unit">${escape(spec.unit)}</span>` : ''}</div>`,
    read: form => {
      const value = parseNumber(field(form, 'input[type="text"]')?.value);
      return value === null ? { invalid: 'Escribe un número, una fracción como 8/3 o un porcentaje como 25 %.' } : { value };
    },
    check: (spec, value) => {
      const expected = parseNumber(spec.answer);
      const tolerance = Number(spec.tolerance) || 1e-6;
      const percent = /%\s*$/.test(String(spec.answer));
      if ([value, ...(percent ? [value / 100] : [])].some(candidate => close(candidate, expected, tolerance))) return { correct: true };
      return { correct: false, message: diagnoseNumber(value, expected, tolerance, spec.mistakes) };
    },
    retry: form => { const input = field(form, 'input[type="text"]'); if (input) { input.value = ''; input.focus(); } },
    reveal: (form, spec) => { const input = field(form, 'input[type="text"]'); if (input) input.value = String(spec.answer); },
    summary: (spec, value) => format(value)
  };

  // 3. Respuesta simbólica: se acepta cualquier expresión equivalente (validation: 'equivalent'), o
  //    equivalente salvo una constante para las primitivas (validation: 'constant').
  TYPES.symbolic = {
    label: 'Respuesta simbólica',
    validate: spec => tryParse(spec.answer) ? [] : [`No se puede leer la expresión «${spec.answer}».`],
    render: (spec, key) => `<div class="answer-row exercise-expression"><label class="lesson-answer-label" for="${escape(key)}-expresion">${spec.label || 'Tu expresión'}</label><input id="${escape(key)}-expresion" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="120" placeholder="${escape(spec.placeholder || 'Ej.: 3x^2 - 2x + 1')}"><p class="exercise-help">Escribe ^ para las potencias, por ejemplo x^2, y usa paréntesis en las funciones: sen(x).</p></div>`,
    read: (form, state) => readExpression(field(form, 'input[type="text"]')?.value, state.spec),
    check: (spec, value) => {
      const expected = parseExpression(spec.answer);
      const variables = variablesOf(spec);
      if (equivalent(value.parsed, expected, variables, spec.validation === 'constant')) return { correct: true };
      return { correct: false, message: diagnoseExpression(value.parsed, expected, variables, spec.mistakes) };
    },
    reveal: (form, spec) => { const input = field(form, 'input[type="text"]'); if (input) input.value = String(spec.answer); },
    summary: (spec, value) => value.text
  };

  // 4. Completar ecuaciones: la plantilla tiene espacios {{0}}, {{1}}… con respuesta numérica o simbólica.
  TYPES.equation = {
    label: 'Completar la ecuación',
    validate: spec => {
      const errors = [];
      if (!spec.blanks?.length) errors.push('Necesita al menos un espacio en blanco (blanks).');
      spec.blanks?.forEach((blank, index) => {
        if (!String(spec.template).includes(`{{${index}}}`)) errors.push(`La plantilla no tiene el espacio {{${index}}}.`);
        if (blank.symbolic ? !tryParse(blank.answer) : parseNumber(blank.answer) === null) errors.push(`La respuesta del espacio ${index + 1} no es válida.`);
      });
      return errors;
    },
    render: (spec, key) => `<p class="exercise-equation">${String(spec.template).replace(/\{\{(\d+)\}\}/g, (match, index) => `<input class="exercise-blank" type="text" data-blank="${index}" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="40" aria-label="${escape(plain(spec.blanks[index]?.label) || `Espacio ${Number(index) + 1}`)}" size="${spec.blanks[index]?.size || 4}">`)}</p>`,
    read: (form, state) => {
      const values = [];
      for (const [index, blank] of state.spec.blanks.entries()) {
        const text = field(form, `[data-blank="${index}"]`)?.value ?? '';
        if (!text.trim()) return { invalid: `Completa el espacio ${index + 1}.` };
        if (blank.symbolic) {
          const read = readExpression(text, { ...blank, variables: blank.variables || state.spec.variables });
          if (read.invalid) return { invalid: `Espacio ${index + 1}: ${read.invalid}` };
          values.push(read.value);
        } else {
          const number = parseNumber(text);
          if (number === null) return { invalid: `En el espacio ${index + 1} escribe un número o una fracción.` };
          values.push(number);
        }
      }
      return { value: values };
    },
    check: (spec, values) => {
      const wrong = [];
      let message = '';
      spec.blanks.forEach((blank, index) => {
        const ok = blank.symbolic ? equivalent(values[index].parsed, parseExpression(blank.answer), blank.variables || spec.variables || values[index].parsed.variables) : close(values[index], parseNumber(blank.answer), Number(blank.tolerance) || 1e-6);
        if (ok) return;
        wrong.push(index);
        if (!message) {
          const reason = blank.why || (blank.symbolic ? diagnoseExpression(values[index].parsed, parseExpression(blank.answer), blank.variables || spec.variables || ['x'], blank.mistakes) : diagnoseNumber(values[index], parseNumber(blank.answer), Number(blank.tolerance) || 1e-6, blank.mistakes));
          message = spec.blanks.length > 1 ? `El espacio ${index + 1} no es correcto. ${reason}` : reason;
        }
      });
      return wrong.length ? { correct: false, message, marks: wrong } : { correct: true };
    },
    mark: (form, marks = []) => fieldsOf(form, '[data-blank]').forEach(input => input.setAttribute('aria-invalid', String(marks.includes(Number(input.dataset.blank))))),
    reveal: (form, spec) => spec.blanks.forEach((blank, index) => { const input = field(form, `[data-blank="${index}"]`); if (input) input.value = String(blank.answer); }),
    summary: (spec, values) => values.map(value => typeof value === 'number' ? format(value) : value.text).join(' | ')
  };

  // 5. Ordenar los pasos de una solución. Se mueven con los botones (teclado y pantalla táctil) o arrastrando.
  TYPES.order = {
    label: 'Ordenar los pasos',
    validate: spec => spec.steps?.length >= 2 ? [] : ['Necesita al menos dos pasos.'],
    render: (spec, key) => `<ol class="exercise-order" data-order>${shuffled(spec.steps.length, key).map(index => `<li data-item="${index}" draggable="true"><span class="exercise-order-text">${spec.steps[index].html}</span><span class="exercise-order-moves"><button type="button" class="exercise-move" data-move="-1" aria-label="Subir este paso">${CHEVRON_UP}</button><button type="button" class="exercise-move" data-move="1" aria-label="Bajar este paso">${CHEVRON_DOWN}</button></span></li>`).join('')}</ol>`,
    mount: form => {
      const list = field(form, '[data-order]');
      if (!list) return;
      list.addEventListener('click', event => {
        const button = event.target.closest('[data-move]');
        if (!button) return;
        const item = button.closest('li');
        const sibling = button.dataset.move === '-1' ? item.previousElementSibling : item.nextElementSibling;
        if (!sibling) return;
        if (button.dataset.move === '-1') list.insertBefore(item, sibling); else list.insertBefore(sibling, item);
        item.querySelector(`[data-move="${button.dataset.move}"]`)?.focus();
        clearMarks(form);
      });
      let dragged = null;
      list.addEventListener('dragstart', event => { dragged = event.target.closest('li'); dragged?.classList.add('is-dragging'); });
      list.addEventListener('dragend', () => { dragged?.classList.remove('is-dragging'); dragged = null; clearMarks(form); });
      list.addEventListener('dragover', event => {
        event.preventDefault();
        const over = event.target.closest('li');
        if (!dragged || !over || over === dragged) return;
        const box = over.getBoundingClientRect();
        list.insertBefore(dragged, event.clientY > box.top + box.height / 2 ? over.nextElementSibling : over);
      });
    },
    read: form => ({ value: fieldsOf(form, '[data-order] > li').map(item => Number(item.dataset.item)) }),
    check: (spec, order) => {
      const position = order.findIndex((value, index) => value !== index);
      if (position < 0) return { correct: true };
      const expected = spec.steps[position];
      const placed = spec.steps[order[position]];
      return { correct: false, message: expected.why || `En la posición ${position + 1} va «${plain(expected.html)}», no «${plain(placed.html)}». Piensa qué necesitas tener antes de dar cada paso.`, marks: order.map((value, index) => value === index ? -1 : value).filter(value => value >= 0), good: position };
    },
    mark: (form, marks = [], outcome) => fieldsOf(form, '[data-order] > li').forEach((item, index) => { item.classList.toggle('is-ok', outcome?.good !== undefined && index < outcome.good); item.classList.toggle('is-wrong', index === outcome?.good); }),
    reveal: form => {
      const list = field(form, '[data-order]');
      fieldsOf(form, '[data-order] > li').sort((first, second) => first.dataset.item - second.dataset.item).forEach(item => list.appendChild(item));
    },
    summary: (spec, order) => order.join(',')
  };

  // 6. Arrastrar y soltar: clasificar elementos en categorías. Funciona arrastrando (ratón o dedo) y también
  //    tocando el elemento y después su categoría, o con el teclado.
  TYPES.classify = {
    label: 'Arrastrar y soltar',
    validate: spec => {
      const ids = new Set((spec.categories || []).map(category => category.id));
      return (spec.categories?.length >= 2 ? [] : ['Necesita al menos dos categorías.']).concat((spec.items || []).filter(item => !ids.has(item.category)).map(item => `«${plain(item.html)}» tiene una categoría que no existe.`)).concat(spec.items?.length ? [] : ['Necesita elementos para clasificar.']);
    },
    render: (spec, key) => `<p class="exercise-help">Arrastra cada elemento a su grupo, o tócalo y después toca el grupo.</p><div class="exercise-pool" data-zone="" aria-label="Elementos sin clasificar" role="group">${shuffled(spec.items.length, key).map(index => `<button type="button" class="exercise-chip" data-chip="${index}" aria-pressed="false">${spec.items[index].html}</button>`).join('')}</div><div class="exercise-zones">${spec.categories.map(category => `<div class="exercise-zone" data-zone="${escape(category.id)}" role="group" aria-label="${escape(plain(category.label))}"><p class="exercise-zone-title">${category.label}</p><div class="exercise-zone-items" data-zone-items></div><button type="button" class="exercise-zone-drop" data-drop="${escape(category.id)}">Colocar aquí</button></div>`).join('')}</div>`,
    mount: form => {
      let selected = null;
      const select = chip => {
        selected?.setAttribute('aria-pressed', 'false');
        selected = chip === selected ? null : chip;
        selected?.setAttribute('aria-pressed', 'true');
        form.classList.toggle('is-placing', Boolean(selected));
      };
      const place = (chip, zoneId) => {
        const target = zoneId ? field(form, `[data-zone="${CSS.escape(zoneId)}"] [data-zone-items]`) : field(form, '.exercise-pool');
        if (!chip || !target) return;
        target.appendChild(chip);
        chip.dataset.placed = zoneId;
        chip.setAttribute('aria-pressed', 'false');
        selected = null;
        form.classList.remove('is-placing');
        clearMarks(form);
      };
      form.addEventListener('click', event => {
        if (form.dataset.dragged) { delete form.dataset.dragged; return; }
        const chip = event.target.closest('[data-chip]');
        if (chip) { select(chip); return; }
        const drop = event.target.closest('[data-drop]');
        const zone = drop || event.target.closest('[data-zone]');
        if (selected && zone) place(selected, drop ? drop.dataset.drop : zone.dataset.zone);
      });
      // Arrastre con puntero: el elemento sigue al dedo y se suelta sobre el grupo que queda debajo.
      form.addEventListener('pointerdown', event => {
        const chip = event.target.closest('[data-chip]');
        if (!chip || event.button > 0) return;
        const start = { x: event.clientX, y: event.clientY };
        let moving = false;
        const move = moveEvent => {
          const dx = moveEvent.clientX - start.x;
          const dy = moveEvent.clientY - start.y;
          if (!moving && Math.hypot(dx, dy) < 8) return;
          moving = true;
          chip.classList.add('is-dragging');
          chip.style.transform = `translate(${dx}px, ${dy}px)`;
        };
        const up = upEvent => {
          chip.removeEventListener('pointermove', move);
          chip.removeEventListener('pointerup', up);
          chip.removeEventListener('pointercancel', up);
          if (!moving) return;
          chip.style.transform = '';
          chip.classList.remove('is-dragging');
          chip.style.visibility = 'hidden';
          const zone = document.elementFromPoint(upEvent.clientX, upEvent.clientY)?.closest('[data-zone]');
          chip.style.visibility = '';
          // El clic que el navegador genera al soltar no debe seleccionar la ficha; el siguiente toque sí cuenta.
          form.dataset.dragged = '1';
          setTimeout(() => { delete form.dataset.dragged; }, 0);
          if (zone && form.contains(zone)) place(chip, zone.dataset.zone);
        };
        chip.setPointerCapture?.(event.pointerId);
        chip.addEventListener('pointermove', move);
        chip.addEventListener('pointerup', up);
        chip.addEventListener('pointercancel', up);
      });
    },
    read: (form, state) => {
      const placed = Object.fromEntries(fieldsOf(form, '[data-chip]').map(chip => [chip.dataset.chip, chip.dataset.placed || '']));
      const missing = Object.values(placed).filter(zone => !zone).length;
      return missing ? { invalid: `Te falta${missing === 1 ? '' : 'n'} ${missing} ${missing === 1 ? 'elemento' : 'elementos'} por colocar.` } : { value: state.spec.items.map((item, index) => placed[index]) };
    },
    check: (spec, placed) => {
      const wrong = spec.items.map((item, index) => placed[index] === item.category ? -1 : index).filter(index => index >= 0);
      if (!wrong.length) return { correct: true };
      const item = spec.items[wrong[0]];
      const zone = spec.categories.find(category => category.id === placed[wrong[0]]);
      const others = wrong.length > 1 ? ` Hay ${wrong.length} elementos en un grupo que no les corresponde.` : '';
      return { correct: false, message: `${item.why || `«${plain(item.html)}» no va en «${plain(zone?.label)}».`}${others}`, marks: wrong };
    },
    mark: (form, marks = []) => fieldsOf(form, '[data-chip]').forEach(chip => chip.classList.toggle('is-wrong', marks.includes(Number(chip.dataset.chip)))),
    reveal: (form, spec) => spec.items.forEach((item, index) => {
      const chip = field(form, `[data-chip="${index}"]`);
      const target = field(form, `[data-zone="${CSS.escape(item.category)}"] [data-zone-items]`);
      if (chip && target) { target.appendChild(chip); chip.dataset.placed = item.category; }
    }),
    summary: (spec, placed) => placed.join(',')
  };

  // 7. Construir gráficas: marcar puntos que pertenezcan a la función pedida.
  TYPES.graph = {
    label: 'Construir la gráfica',
    validate: spec => tryParse(spec.function) ? [] : [`No se puede leer la función «${spec.function}».`],
    render: (spec, key) => `${plane(spec.domain, '', 'Plano cartesiano: toca para marcar un punto')}<div class="exercise-graph-tools"><p class="exercise-help" data-graph-count>Marca ${spec.points || 2} puntos de la gráfica. Toca un punto para quitarlo.</p><div class="exercise-graph-input"><label>x <input type="text" inputmode="decimal" data-graph-x maxlength="6" aria-label="Coordenada x"></label><label>y <input type="text" inputmode="decimal" data-graph-y maxlength="6" aria-label="Coordenada y"></label><button type="button" class="button button-secondary" data-graph-add>Añadir punto</button><button type="button" class="text-button" data-graph-clear>Borrar</button></div></div>`,
    mount: (form, state) => {
      state.points = state.points || [];
      const svg = field(form, '[data-plot]');
      const frame = view(state.spec.domain);
      const snap = Number(state.spec.snap) || 1;
      const draw = () => {
        const sorted = [...state.points].sort((first, second) => first[0] - second[0]);
        const line = sorted.length > 1 && state.spec.connect !== false ? `<polyline class="plot-student" points="${sorted.map(([x, y]) => `${frame.sx(x)},${frame.sy(y)}`).join(' ')}"/>` : '';
        const target = state.revealed ? `<path class="plot-target" d="${curvePath(x => parseExpression(state.spec.function).evaluate({ x }), frame)}"/>` : '';
        field(form, '[data-plot-layer]').innerHTML = target + line + state.points.map(([x, y], index) => `<circle class="plot-point${state.wrongPoints?.includes(index) ? ' is-wrong' : ''}" cx="${frame.sx(x)}" cy="${frame.sy(y)}" r="7" data-point="${index}"><title>(${format(x)}, ${format(y)})</title></circle>`).join('');
        field(form, '[data-graph-count]').textContent = `${state.points.length} de ${state.spec.points || 2} puntos marcados. Toca un punto para quitarlo.`;
      };
      state.draw = draw;
      const add = (x, y) => {
        if (state.points.some(point => close(point[0], x) && close(point[1], y))) return;
        state.points.push([x, y]);
        state.wrongPoints = [];
        clearMarks(form);
        draw();
      };
      svg?.addEventListener('click', event => {
        const point = event.target.closest('[data-point]');
        if (point) { state.points.splice(Number(point.dataset.point), 1); state.wrongPoints = []; draw(); return; }
        const box = svg.getBoundingClientRect();
        const x = Math.round(frame.fromX((event.clientX - box.left) / box.width * PLOT.width) / snap) * snap;
        const y = Math.round(frame.fromY((event.clientY - box.top) / box.height * PLOT.height) / snap) * snap;
        if (x >= frame.xMin && x <= frame.xMax && y >= frame.yMin && y <= frame.yMax) add(x, y);
      });
      field(form, '[data-graph-add]')?.addEventListener('click', () => {
        const x = parseNumber(field(form, '[data-graph-x]').value);
        const y = parseNumber(field(form, '[data-graph-y]').value);
        if (x === null || y === null) { field(form, '.answer-feedback').textContent = 'Escribe las dos coordenadas del punto.'; return; }
        add(x, y);
        field(form, '[data-graph-x]').value = '';
        field(form, '[data-graph-y]').value = '';
      });
      field(form, '[data-graph-clear]')?.addEventListener('click', () => { state.points = []; state.wrongPoints = []; draw(); });
      draw();
    },
    read: (form, state) => {
      const needed = state.spec.points || 2;
      const xs = new Set(state.points.map(point => point[0]));
      if (xs.size < needed) return { invalid: `Marca al menos ${needed} puntos con valores de x distintos.` };
      return { value: state.points.map(point => [...point]) };
    },
    check: (spec, points) => {
      const fn = parseExpression(spec.function);
      const tolerance = Number(spec.tolerance) || 0.01;
      const wrong = points.map(([x, y], index) => close(fn.evaluate({ x }), y, tolerance) ? -1 : index).filter(index => index >= 0);
      if (!wrong.length) return { correct: true };
      const [x, y] = points[wrong[0]];
      const value = fn.evaluate({ x });
      return { correct: false, message: Number.isFinite(value) ? `El punto (${format(x)}, ${format(y)}) no está en la gráfica: con x = ${format(x)}, la función vale ${format(value)}.` : `La función no está definida en x = ${format(x)}. Elige otro valor de x.`, marks: wrong };
    },
    mark: (form, marks = [], outcome, state) => { state.wrongPoints = marks; state.draw?.(); },
    reveal: (form, spec, state) => { state.revealed = true; state.draw?.(); },
    summary: (spec, points) => points.map(([x, y]) => `(${format(x)},${format(y)})`).join(' ')
  };

  // 8. Manipular parámetros: deslizadores que cambian la gráfica hasta cumplir la condición pedida.
  TYPES.parameters = {
    label: 'Manipular parámetros',
    validate: spec => (tryParse(spec.expression) ? [] : [`No se puede leer la expresión «${spec.expression}».`]).concat(spec.params?.length ? [] : ['Necesita al menos un parámetro.']).concat(spec.points?.length || spec.params?.every(param => param.target !== undefined) ? [] : ['Indica los puntos por los que debe pasar la curva o el valor objetivo de cada parámetro.']),
    render: (spec, key) => {
      const frame = view(spec.domain);
      const marks = (spec.points || []).map(([x, y]) => `<circle class="plot-goal" cx="${frame.sx(x)}" cy="${frame.sy(y)}" r="6"><title>Debe pasar por (${format(x)}, ${format(y)})</title></circle>`).join('');
      return `${plane(spec.domain, '', 'Gráfica que cambia con los parámetros').replace('<g data-plot-layer>', `${marks}<g data-plot-layer>`)}<div class="exercise-params">${spec.params.map(param => `<label class="exercise-param"><span>${param.label || escape(param.name)} = <output data-param-value="${escape(param.name)}">${format(param.value ?? param.min)}</output></span><input type="range" data-param="${escape(param.name)}" min="${param.min}" max="${param.max}" step="${param.step || 0.5}" value="${param.value ?? param.min}"></label>`).join('')}</div>`;
    },
    mount: (form, state) => {
      const frame = view(state.spec.domain);
      const fn = parseExpression(state.spec.expression);
      const draw = () => {
        const scope = Object.fromEntries(fieldsOf(form, '[data-param]').map(input => [input.dataset.param, Number(input.value)]));
        fieldsOf(form, '[data-param-value]').forEach(output => { output.textContent = format(scope[output.dataset.paramValue]); });
        field(form, '[data-plot-layer]').innerHTML = `<path class="plot-student" d="${curvePath(x => fn.evaluate({ ...scope, x }), frame)}"/>`;
      };
      form.addEventListener('input', event => { if (event.target.closest('[data-param]')) { clearMarks(form); draw(); } });
      draw();
    },
    read: form => ({ value: Object.fromEntries(fieldsOf(form, '[data-param]').map(input => [input.dataset.param, Number(input.value)])) }),
    check: (spec, values) => {
      const fn = parseExpression(spec.expression);
      if (spec.points?.length) {
        const tolerance = Number(spec.tolerance) || 0.05;
        const miss = spec.points.find(([x, y]) => !close(fn.evaluate({ ...values, x }), y, tolerance));
        if (!miss) return { correct: true };
        const [x, y] = miss;
        const param = spec.params.find(candidate => candidate.target !== undefined && !close(values[candidate.name], candidate.target, candidate.tolerance ?? 1e-6));
        const hint = param ? ` ${values[param.name] > param.target ? (param.high || `Prueba con un valor menor de ${param.name}.`) : (param.low || `Prueba con un valor mayor de ${param.name}.`)}` : '';
        return { correct: false, message: `Con estos valores, la curva pasa por (${format(x)}, ${format(fn.evaluate({ ...values, x }))}), no por (${format(x)}, ${format(y)}).${hint}` };
      }
      const param = spec.params.find(candidate => !close(values[candidate.name], candidate.target, candidate.tolerance ?? 1e-6));
      if (!param) return { correct: true };
      return { correct: false, message: values[param.name] > param.target ? (param.high || `${param.name} es demasiado grande.`) : (param.low || `${param.name} es demasiado pequeño.`) };
    },
    reveal: (form, spec) => {
      spec.params.forEach(param => { const input = field(form, `[data-param="${CSS.escape(param.name)}"]`); if (input && param.target !== undefined) input.value = String(param.target); });
      form.dispatchEvent(new Event('input', { bubbles: true }));
    },
    summary: (spec, values) => Object.entries(values).map(([name, value]) => `${name}=${format(value)}`).join(' ')
  };

  // 9. Demostraciones: elegir la justificación de cada paso.
  TYPES.proof = {
    label: 'Demostración',
    validate: spec => {
      const ids = new Set((spec.reasons || []).map(reason => reason.id));
      return (spec.steps?.length ? [] : ['Necesita pasos.']).concat((spec.steps || []).filter(step => !ids.has(step.reason)).map((step, index) => `El paso ${index + 1} usa una justificación que no existe.`));
    },
    render: (spec, key) => `<ol class="exercise-proof">${spec.steps.map((step, index) => `<li><div class="exercise-proof-statement">${step.html}</div><label class="exercise-proof-reason"><span class="sr-only">Justificación del paso ${index + 1}</span><select data-reason="${index}"><option value="">¿Por qué?</option>${spec.reasons.map(reason => `<option value="${escape(reason.id)}">${escape(plain(reason.label))}</option>`).join('')}</select></label></li>`).join('')}</ol>`,
    read: (form, state) => {
      const values = state.spec.steps.map((step, index) => field(form, `[data-reason="${index}"]`)?.value || '');
      const missing = values.findIndex(value => !value);
      return missing >= 0 ? { invalid: `Elige la justificación del paso ${missing + 1}.` } : { value: values };
    },
    check: (spec, values) => {
      const wrong = spec.steps.map((step, index) => values[index] === step.reason ? -1 : index).filter(index => index >= 0);
      if (!wrong.length) return { correct: true };
      const step = spec.steps[wrong[0]];
      const chosen = spec.reasons.find(reason => reason.id === values[wrong[0]]);
      return { correct: false, message: step.why || `El paso ${wrong[0] + 1} no se justifica con «${plain(chosen?.label)}». Pregúntate qué propiedad permite pasar de la línea anterior a esta.`, marks: wrong };
    },
    mark: (form, marks = []) => fieldsOf(form, '[data-reason]').forEach(select => select.setAttribute('aria-invalid', String(marks.includes(Number(select.dataset.reason))))),
    reveal: (form, spec) => spec.steps.forEach((step, index) => { const select = field(form, `[data-reason="${index}"]`); if (select) select.value = step.reason; }),
    summary: (spec, values) => values.join(',')
  };

  // 10. Simulaciones probabilísticas: estimar una probabilidad y contrastarla con un experimento.
  TYPES.simulation = {
    label: 'Simulación probabilística',
    validate: spec => {
      const model = spec.model || {};
      const errors = [];
      if (!['coins', 'dice'].includes(model.kind)) errors.push('El modelo debe ser coins (monedas) o dice (dados).');
      if (!(model.count >= 1 && model.count <= 6)) errors.push('Usa entre 1 y 6 monedas o dados.');
      if (!OPERATORS[model.event?.op]) errors.push('El evento necesita op (=, >=, <=, >, <) y value.');
      return errors;
    },
    answer: spec => spec.answer !== undefined ? parseNumber(spec.answer) : exactProbability(spec.model),
    render: (spec, key) => `<div class="exercise-sim" data-sim><p class="exercise-sim-event">Evento: ${escape(describeModel(spec.model))}.</p><div class="exercise-sim-actions"><button type="button" class="button button-secondary" data-sim-run="100">Simular 100 veces</button><button type="button" class="button button-secondary" data-sim-run="1000">Simular 1.000 veces</button></div><div class="exercise-sim-result" data-sim-result aria-live="polite"><p>Todavía no has simulado. Primero estima; después compara.</p></div></div><div class="answer-row exercise-number"><label class="lesson-answer-label" for="${escape(key)}-probabilidad">${spec.label || 'Tu probabilidad'}</label><input id="${escape(key)}-probabilidad" type="text" inputmode="decimal" autocomplete="off" spellcheck="false" maxlength="20" placeholder="Ej.: 1/6, 0,17 o 17 %"></div>`,
    mount: (form, state) => {
      state.trials = 0;
      state.hits = 0;
      form.addEventListener('click', event => {
        const run = event.target.closest('[data-sim-run]');
        if (!run) return;
        const trials = Number(run.dataset.simRun);
        state.trials += trials;
        state.hits += simulate(state.spec.model, trials);
        const frequency = state.hits / state.trials;
        field(form, '[data-sim-result]').innerHTML = `<p><strong>${state.hits.toLocaleString('es-CO')}</strong> de ${state.trials.toLocaleString('es-CO')} lanzamientos cumplen el evento: frecuencia ${format(frequency)}.</p><div class="exercise-sim-bar" aria-hidden="true"><span style="width:${(frequency * 100).toFixed(1)}%"></span></div>`;
      });
    },
    read: (form, state) => {
      const value = parseNumber(field(form, 'input[type="text"]')?.value);
      if (value === null) return { invalid: 'Escribe tu probabilidad como fracción, decimal o porcentaje.' };
      if (value < 0 || value > 1) return { invalid: 'Una probabilidad está entre 0 y 1 (o entre 0 % y 100 %).' };
      return { value: { value, frequency: state.trials ? state.hits / state.trials : null } };
    },
    check: (spec, { value, frequency }) => {
      const expected = TYPES.simulation.answer(spec);
      const tolerance = Number(spec.tolerance) || 0.01;
      if (close(value, expected, tolerance)) return { correct: true };
      const authored = (spec.mistakes || []).find(mistake => close(parseNumber(mistake.answer), value, tolerance));
      if (authored) return { correct: false, message: authored.why };
      const observed = frequency === null ? 'Simula el experimento y compara tu estimación con la frecuencia observada.' : `La simulación da una frecuencia cercana a ${format(frequency)}; ${Math.abs(frequency - value) > 0.05 ? 'tu respuesta está lejos de ese valor' : 'se parece a tu respuesta, pero la probabilidad exacta es otra'}.`;
      return { correct: false, message: `${observed} Cuenta los resultados posibles y cuántos cumplen el evento.` };
    },
    retry: form => { const input = field(form, 'input[type="text"]'); if (input) { input.value = ''; input.focus(); } },
    reveal: (form, spec) => { const input = field(form, 'input[type="text"]'); if (input) input.value = format(TYPES.simulation.answer(spec)); },
    summary: (spec, value) => format(value.value)
  };

  // 11. Identificar el error en un procedimiento: tocar la línea donde aparece.
  TYPES.error = {
    label: 'Encuentra el error',
    validate: spec => spec.lines?.length >= 2 && Number.isInteger(spec.wrong) && spec.lines[spec.wrong] !== undefined ? [] : ['Necesita al menos dos líneas y el índice de la línea con el error (wrong).'],
    render: (spec, key) => `<p class="exercise-help">Toca la línea donde aparece el primer error.</p><fieldset class="exercise-lines"><legend class="sr-only">Líneas del procedimiento</legend>${spec.lines.map((line, index) => `<label class="exercise-line"><input type="radio" name="${escape(key)}" value="${index}"><span class="exercise-line-number">${index + 1}</span><span class="exercise-line-text">${line}</span></label>`).join('')}</fieldset>`,
    read: form => {
      const chosen = field(form, 'input:checked');
      return chosen ? { value: Number(chosen.value) } : { invalid: 'Toca la línea donde está el error.' };
    },
    check: (spec, index) => {
      if (index === spec.wrong) return { correct: true };
      const explanation = spec.lineWhy?.[index];
      return { correct: false, message: explanation || (index < spec.wrong ? `La línea ${index + 1} está bien. El error aparece más adelante: revisa cada paso a partir de ella.` : `El error aparece antes de la línea ${index + 1}. Desde ahí todo arrastra un error anterior.`), marks: [index] };
    },
    retry: form => fieldsOf(form, 'input:checked').forEach(input => { input.checked = false; }),
    reveal: (form, spec) => field(form, `input[value="${spec.wrong}"]`)?.closest('label')?.classList.add('is-answer'),
    summary: (spec, index) => String(index + 1)
  };

  // 12. Problema contextualizado: una situación (texto, tabla o imagen) y una pregunta de otro tipo.
  TYPES.context = {
    label: 'Problema en contexto',
    validate: spec => spec.ask && TYPES[spec.ask.kind] && spec.ask.kind !== 'context' ? TYPES[spec.ask.kind].validate?.(spec.ask) || [] : ['Necesita una pregunta (ask) de otro tipo.'],
    render: (spec, key) => `<div class="exercise-context">${spec.context || ''}</div>${spec.ask.statement ? `<div class="exercise-ask">${spec.ask.statement}</div>` : ''}${TYPES[spec.ask.kind].render(spec.ask, key)}`,
    mount: (form, state) => TYPES[state.spec.ask.kind].mount?.(form, { ...state, spec: state.spec.ask }),
    read: (form, state) => TYPES[state.spec.ask.kind].read(form, { ...state, spec: state.spec.ask }),
    check: (spec, value) => TYPES[spec.ask.kind].check(spec.ask, value),
    mark: (form, marks, outcome, state) => TYPES[state.spec.ask.kind].mark?.(form, marks, outcome, { ...state, spec: state.spec.ask }),
    retry: (form, spec) => TYPES[spec.ask.kind].retry?.(form, spec.ask),
    reveal: (form, spec, state) => TYPES[spec.ask.kind].reveal?.(form, spec.ask, { ...state, spec: spec.ask }),
    summary: (spec, value) => TYPES[spec.ask.kind].summary?.(spec.ask, value) ?? ''
  };

  const KINDS = Object.keys(TYPES);

  // ── Especificación común ──────────────────────────────────────────────────────────────────
  function normalizeSpec(spec) {
    const hints = Array.isArray(spec.hints) ? spec.hints.filter(Boolean) : spec.hint ? [spec.hint] : [];
    return { ...spec, hints, mistakes: Array.isArray(spec.mistakes) ? spec.mistakes : [] };
  }

  // Lista de problemas de una especificación (vacía si es válida). La usa el compilador del contenido.
  function validate(spec) {
    if (!spec || typeof spec !== 'object') return ['El ejercicio no es un objeto.'];
    if (!TYPES[spec.kind]) return [`Tipo «${spec.kind}» desconocido. Usa: ${KINDS.join(', ')}.`];
    const errors = [];
    if (!spec.statement && !(spec.kind === 'context' && spec.context)) errors.push('Falta el enunciado (statement).');
    return errors.concat(TYPES[spec.kind].validate?.(normalizeSpec(spec)) || []);
  }

  const specs = new Map();
  const states = new WeakMap();

  // HTML completo del ejercicio. key identifica el ejercicio en el registro de desempeño.
  function render(rawSpec, { key, lessonId = '' } = {}) {
    const spec = normalizeSpec(rawSpec);
    const id = String(spec.id || key || `ejercicio-${specs.size + 1}`).replace(/[^\w-]/g, '-');
    specs.set(id, spec);
    const type = TYPES[spec.kind];
    if (!type) return `<p class="exercise-unknown">Este ejercicio usa un tipo que esta versión de Zuka no conoce.</p>`;
    const visual = spec.visual ? `<figure class="exercise-visual">${spec.visual.html || ''}${spec.visual.src ? `<img src="${escape(spec.visual.src)}" alt="${escape(spec.visual.alt || '')}" loading="lazy">` : ''}${spec.visual.caption ? `<figcaption>${spec.visual.caption}</figcaption>` : ''}</figure>` : '';
    const hints = spec.hints.length ? `<div class="exercise-hints"><ol data-exercise-hints>${spec.hints.map((hint, index) => `<li hidden><span class="exercise-hint-label">Pista ${index + 1}</span>${hint}</li>`).join('')}</ol><button type="button" class="text-button exercise-hint-button" data-exercise-hint>Pedir una pista</button></div>` : '';
    const solution = spec.solution ? `<details class="lesson-solution"><summary>Ver solución</summary>${spec.solution}</details>` : '';
    return `<form class="lesson-exercise exercise exercise-${spec.kind}" data-exercise="${escape(id)}" data-kind="${spec.kind}" data-lesson="${escape(lessonId)}" novalidate><p class="lesson-exercise-label">${type.label}</p><div class="lesson-exercise-statement">${spec.statement || ''}</div>${visual}<div class="exercise-answer">${type.render(spec, id)}</div><p class="answer-feedback" role="status" aria-live="polite"></p><div class="exercise-feedback" data-exercise-feedback role="status" aria-live="polite" hidden></div><p class="exercise-meta" data-exercise-meta></p>${hints}${solution}<div class="answer-row exercise-submit"><button class="button button-secondary" type="submit">Comprobar</button></div></form>`;
  }

  function clearMarks(form) {
    const state = states.get(form);
    if (!state) return;
    form.querySelectorAll('[aria-invalid="true"]').forEach(element => element.setAttribute('aria-invalid', 'false'));
    form.querySelectorAll('.is-wrong, .is-ok').forEach(element => element.classList.remove('is-wrong', 'is-ok'));
  }

  function showHint(form, state) {
    const hidden = form.querySelector('[data-exercise-hints] > li[hidden]');
    if (!hidden) return false;
    hidden.hidden = false;
    state.hintsUsed += 1;
    const button = form.querySelector('[data-exercise-hint]');
    if (button) {
      const left = state.spec.hints.length - state.hintsUsed;
      if (left <= 0) button.remove(); else button.textContent = `Pedir otra pista (${left} ${left === 1 ? 'queda' : 'quedan'})`;
    }
    updateMeta(form, state);
    return true;
  }

  function updateMeta(form, state) {
    const meta = form.querySelector('[data-exercise-meta]');
    if (!meta) return;
    const parts = [];
    if (state.attempts) parts.push(`Intento ${state.attempts}`);
    if (state.hintsUsed) parts.push(`${state.hintsUsed} ${state.hintsUsed === 1 ? 'pista usada' : 'pistas usadas'}`);
    meta.textContent = parts.join(' · ');
  }

  // Activa un ejercicio dibujado con render(). Se puede llamar varias veces sin duplicar nada.
  function mount(form) {
    if (!form || states.has(form)) return states.get(form);
    const spec = specs.get(form.dataset.exercise);
    if (!spec) return null;
    const state = { spec, attempts: 0, hintsUsed: 0, started: Date.now(), revealed: false };
    states.set(form, state);
    TYPES[spec.kind].mount?.(form, state);
    form.querySelector('[data-exercise-hint]')?.addEventListener('click', () => {
      if (showHint(form, state)) form.querySelector('[data-exercise-hints] > li:not([hidden]):last-of-type')?.focus?.();
    });
    return state;
  }

  function setFeedback(form, html, tone) {
    const box = form.querySelector('[data-exercise-feedback]');
    if (!box) return;
    box.hidden = !html;
    box.className = `exercise-feedback${tone ? ` is-${tone}` : ''}`;
    box.innerHTML = html;
  }

  // Comprueba la respuesta: escribe la retroalimentación, abre la siguiente pista tras un error y registra
  // el intento. Devuelve { result: true | false | null, message }.
  function check(form) {
    const state = mount(form);
    if (!state) return { result: null, message: '' };
    const type = TYPES[state.spec.kind];
    const feedback = form.querySelector('.answer-feedback');
    const read = type.read(form, state);
    if (read.invalid) {
      form.dataset.state = 'invalid';
      if (feedback) feedback.textContent = read.invalid;
      return { result: null, message: read.invalid };
    }
    if (feedback) feedback.textContent = '';
    state.attempts += 1;
    const outcome = type.check(state.spec, read.value);
    form.dataset.state = outcome.correct ? 'correct' : 'incorrect';
    clearMarks(form);
    if (!outcome.correct) type.mark?.(form, outcome.marks, outcome, state);
    if (outcome.correct) {
      setFeedback(form, `<p><strong>¡Correcto!</strong> ${state.spec.feedback?.correct || (state.spec.solution ? 'Abajo tienes la explicación completa.' : '')}</p>`, 'correct');
      const solution = form.querySelector('.lesson-solution');
      if (solution) solution.open = true;
    } else {
      setFeedback(form, `<p><strong>Todavía no.</strong> ${outcome.message}</p>`, 'incorrect');
      // Pistas progresivas: cada error abre la siguiente.
      if (showHint(form, state)) form.querySelector('[data-exercise-feedback]')?.insertAdjacentHTML('beforeend', '<p class="exercise-feedback-hint">Te dejé una pista más abajo.</p>');
    }
    updateMeta(form, state);
    report(form, state, { correct: outcome.correct, response: type.summary?.(state.spec, read.value) ?? '' });
    return { result: outcome.correct, message: outcome.message || '' };
  }

  function retry(form) {
    const state = states.get(form);
    if (!state) return;
    form.dataset.state = '';
    clearMarks(form);
    TYPES[state.spec.kind].retry?.(form, state.spec, state);
  }

  function reveal(form) {
    const state = mount(form);
    if (!state) return;
    state.revealed = true;
    form.dataset.revealed = 'true';
    clearMarks(form);
    TYPES[state.spec.kind].reveal?.(form, state.spec, state);
    const solution = form.querySelector('.lesson-solution');
    if (solution) solution.open = true;
    setFeedback(form, '<p><strong>Así se resuelve.</strong> Lee la explicación y compárala con tu razonamiento.</p>', 'revealed');
    report(form, state, { correct: false, revealed: true, response: '' });
  }

  // Registro de desempeño: la app recibe cada intento (o solución vista) con su contexto.
  const listeners = [];
  function report(form, state, outcome) {
    const entry = {
      exercise: form.dataset.exercise, lesson: form.dataset.lesson || '', kind: state.spec.kind,
      attempt: state.attempts, correct: outcome.correct, revealed: Boolean(outcome.revealed), hints: state.hintsUsed,
      ms: Math.max(0, Date.now() - state.started), response: String(outcome.response).slice(0, 300), at: new Date().toISOString()
    };
    for (const listener of listeners) { try { listener(entry); } catch { /* Un registro fallido no detiene el ejercicio. */ } }
  }

  root.ZUKA_EXERCISES = {
    KINDS, TYPES, render, mount, check, retry, reveal, validate, normalizeSpec,
    onAttempt: listener => listeners.push(listener),
    has: form => Boolean(form?.dataset?.exercise && specs.has(form.dataset.exercise)),
    // Funciones puras, para pruebas y para el compilador del contenido.
    parseNumber, parseExpression, equivalent, diagnoseNumber, diagnoseExpression, exactProbability, simulate, shuffled,
    checkAnswer: (spec, value) => TYPES[spec.kind].check(normalizeSpec(spec), value)
  };
})();
