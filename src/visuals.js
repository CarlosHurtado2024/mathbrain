// Motores de visualización de Zuka. Cada escena es un componente con su motor:
//   p5      → simulaciones, partículas, experimentos de probabilidad y procesos estocásticos
//   jsxgraph→ funciones, límites, derivadas, integrales, geometría dinámica y vectores
//   three   → superficies, sólidos y transformaciones en 3D
// Las librerías (src/vendor/) se cargan solo cuando una lección las necesita, sin recargar la página.
// Los controles son HTML (deslizadores y botones con etiqueta) y una lectura en texto (aria-live) dice
// lo que muestra la figura: todo se puede usar con teclado y lector de pantalla.
// Los videos de Manim no pasan por aquí: son bloques de video (MP4 con subtítulos) y no se convierten en escenas.
(() => {
  'use strict';

  const root = typeof window !== 'undefined' ? window : globalThis;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
  const format = (value, digits = 3) => new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits }).format(Math.abs(value) < 1e-10 ? 0 : value);

  // ── Carga diferida de librerías ───────────────────────────────────────────────────────────
  const LIBRARIES = {
    p5: { script: 'vendor/p5/p5.min.js', global: 'p5' },
    jsxgraph: { script: 'vendor/jsxgraph/jsxgraphcore.js', style: 'vendor/jsxgraph/jsxgraph.css', global: 'JXG' },
    three: { module: './vendor/three/three.module.min.js' }
  };
  const loading = {};

  function addScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => { script.remove(); reject(new Error(`No se pudo cargar ${src}`)); };
      document.head.appendChild(script);
    });
  }

  function load(engine) {
    const library = LIBRARIES[engine];
    if (!loading[engine]) {
      loading[engine] = (async () => {
        if (library.style && !document.querySelector(`link[href="${library.style}"]`)) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = library.style;
          document.head.appendChild(link);
        }
        if (library.module) return import(new URL(library.module, document.baseURI).href);
        if (!root[library.global]) await addScript(library.script);
        return root[library.global];
      })().catch(error => { delete loading[engine]; throw error; });
    }
    return loading[engine];
  }

  // Colores de la identidad (src/identity.css) en el tema activo.
  function palette() {
    const style = getComputedStyle(document.documentElement);
    const read = (name, fallback) => style.getPropertyValue(name).trim() || fallback;
    return {
      primary: read('--brand-primary', '#59f7bd'), ink: read('--brand-ink', '#f0f7f2'), secondary: read('--brand-secondary', '#b7c9bd'),
      line: read('--brand-line', '#213b2c'), strong: read('--brand-line-strong', '#345540'), surface: read('--brand-surface', '#0b120e'),
      inset: read('--brand-inset', '#111c15'), warning: read('--brand-warning', '#e2ce94'), danger: read('--brand-danger', '#ffaaa1'), accent: read('--brand-accent-text', '#7af6c3')
    };
  }

  const reducedMotion = () => Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  // p5 con un ciclo propio: la escena se dibuja con redraw() en cada cuadro de requestAnimationFrame.
  // Así pausar fuera de la pantalla y reanudar no depende del ciclo interno de p5, y ctx.dt (milisegundos
  // desde el cuadro anterior) mantiene la misma velocidad en cualquier equipo.
  function p5Runner(p5, ctx, sketch) {
    let running = true;
    let frame = 0;
    let last = performance.now();
    const instance = new p5(p => {
      sketch(p);
      const setup = p.setup;
      p.setup = () => { setup(); p.noLoop(); };
    });
    const tick = now => {
      if (!running) return;
      ctx.dt = Math.min(100, Math.max(0, now - last));
      last = now;
      instance.redraw();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const stop = () => { running = false; cancelAnimationFrame(frame); };
    return {
      sketch: instance,
      destroy: () => { stop(); instance.remove(); },
      resize: (w, h) => { instance.resizeCanvas(w, h); instance.redraw(); },
      pause: stop,
      resume: () => { if (!running) { running = true; last = performance.now(); frame = requestAnimationFrame(tick); } }
    };
  }

  // ── Escenas ───────────────────────────────────────────────────────────────────────────────
  // Cada escena declara su motor, una descripción accesible, sus parámetros (deslizadores), sus acciones
  // (botones) y create(stage, lib, ctx), que devuelve { destroy, resize?, pause?, resume? }.
  const SCENES = {};

  // p5 · Tablero de Galton: cada bola elige izquierda o derecha en cada fila; la forma de campana aparece sola.
  SCENES.galton = {
    engine: 'p5', aspect: 1.05,
    title: 'Tablero de Galton',
    description: 'Bolas que caen por un triángulo de clavos y se acumulan en casillas; el histograma se compara con la distribución binomial esperada.',
    params: { rows: { label: 'Filas de clavos', min: 4, max: 14, step: 1, value: 10 } },
    actions: [{ id: 'drop', label: 'Soltar 100 bolas' }, { id: 'reset', label: 'Vaciar' }],
    create(stage, p5, ctx) {
      let bins = [];
      let balls = [];
      let total = 0;
      let rows = ctx.params.rows;
      const reset = () => { rows = ctx.params.rows; bins = Array(rows + 1).fill(0); balls = []; total = 0; report(); };
      const choose = (n, k) => { let result = 1; for (let i = 1; i <= k; i += 1) result = result * (n - i + 1) / i; return result; };
      const report = () => {
        const mode = bins.indexOf(Math.max(...bins));
        ctx.say(total ? `${total} bolas en ${rows + 1} casillas. La casilla con más bolas es la ${mode + 1}; en el centro se acumulan más porque hay más caminos que llegan ahí.` : `Tablero vacío con ${rows} filas. Suelta bolas para ver cómo se reparten.`);
      };
      const land = path => { bins[path.reduce((sum, step) => sum + step, 0)] += 1; total += 1; };
      ctx.onAction(id => {
        if (id === 'reset') return reset();
        for (let index = 0; index < 100; index += 1) {
          const path = Array.from({ length: rows }, () => (Math.random() < .5 ? 0 : 1));
          if (ctx.reduced) land(path); else balls.push({ path, start: index * 3, t: 0 });
        }
        if (ctx.reduced) report(); else ctx.say('Cayendo 100 bolas…');
      });
      ctx.onChange(reset);
      reset();
      const sketch = p => {
        p.setup = () => { p.createCanvas(ctx.width, ctx.height).parent(stage); p.textFont('Manrope'); };
        p.draw = () => {
          const colors = ctx.colors;
          p.background(colors.inset);
          const top = 30;
          const bottom = p.height * .62;
          const gap = Math.min(p.width / (rows + 3), (bottom - top) / rows);
          const pegX = (row, index) => p.width / 2 + (index - row / 2) * gap;
          p.noStroke();
          p.fill(colors.strong);
          for (let row = 0; row < rows; row += 1) for (let index = 0; index <= row; index += 1) p.circle(pegX(row, index), top + row * gap, 5);
          // Bolas en caída: en cada fila se desplazan media separación a la izquierda o a la derecha.
          // Entre una fila y la siguiente, la bola se mueve media separación a la izquierda (0) o a la derecha (1).
          p.fill(colors.primary);
          const falling = balls.length;
          // El avance depende del tiempo transcurrido, no de los cuadros: igual de rápido en cualquier equipo.
          const tick = (ctx.dt || 16.7) / 16.7;
          balls = balls.filter(ball => {
            ball.t += tick;
            const progress = (ball.t - ball.start) / 6;
            if (progress < 0) return true;
            if (progress >= rows) { land(ball.path); return false; }
            const row = Math.floor(progress);
            const offset = ball.path.slice(0, row).reduce((sum, step) => sum + step, 0);
            const x = pegX(row, offset) + (ball.path[row] ? 1 : -1) * gap / 2 * (progress - row);
            p.circle(x, top + progress * gap - 6, 7);
            return true;
          });
          if (falling && !balls.length) report();
          // Histograma y binomial esperada.
          const base = p.height - 22;
          const width = Math.min(gap, (p.width - 20) / (rows + 1));
          const left = p.width / 2 - width * (rows + 1) / 2;
          const tallest = Math.max(1, ...bins, ...bins.map((_, k) => total * choose(rows, k) / 2 ** rows));
          const scale = (base - bottom - 10) / tallest;
          bins.forEach((count, k) => { p.fill(colors.primary); p.rect(left + k * width + 2, base - count * scale, width - 4, count * scale, 3); });
          if (total) {
            p.noFill(); p.stroke(colors.warning); p.strokeWeight(2);
            p.drawingContext.setLineDash([5, 4]);
            p.beginShape();
            bins.forEach((_, k) => p.vertex(left + (k + .5) * width, base - total * choose(rows, k) / 2 ** rows * scale));
            p.endShape();
            p.drawingContext.setLineDash([]);
          }
          p.noStroke(); p.fill(colors.secondary); p.textSize(12); p.textAlign(p.LEFT, p.BASELINE);
          p.text(`${total} bolas`, 10, p.height - 6);
          p.textAlign(p.RIGHT, p.BASELINE); p.fill(colors.warning);
          p.text('binomial esperada', p.width - 10, p.height - 6);
        };
      };
      return p5Runner(p5, ctx, sketch);
    }
  };

  // p5 · Paseos aleatorios: la distancia típica al origen crece como la raíz del número de pasos.
  SCENES['random-walk'] = {
    engine: 'p5', aspect: .7,
    title: 'Paseos aleatorios',
    description: 'Varios caminantes avanzan un paso arriba o abajo al azar; las curvas punteadas marcan más y menos la raíz del número de pasos.',
    params: { walkers: { label: 'Caminantes', min: 5, max: 120, step: 5, value: 40 }, steps: { label: 'Pasos', min: 50, max: 400, step: 50, value: 200 } },
    actions: [{ id: 'run', label: 'Nuevos paseos' }],
    create(stage, p5, ctx) {
      let paths = [];
      let shown = 0;
      const run = () => {
        paths = Array.from({ length: ctx.params.walkers }, () => { let y = 0; return [0, ...Array.from({ length: ctx.params.steps }, () => (y += Math.random() < .5 ? -1 : 1))]; });
        shown = ctx.reduced ? ctx.params.steps : 0;
        if (shown) report();
      };
      const report = () => {
        const n = ctx.params.steps;
        const finals = paths.map(path => path[n]);
        const rms = Math.sqrt(finals.reduce((sum, value) => sum + value * value, 0) / finals.length);
        const inside = finals.filter(value => Math.abs(value) <= Math.sqrt(n)).length;
        ctx.say(`Tras ${n} pasos, la distancia típica al origen es ${format(rms, 1)}; la raíz de ${n} es ${format(Math.sqrt(n), 1)}. ${inside} de ${finals.length} caminantes terminan entre las curvas punteadas.`);
      };
      ctx.onAction(run);
      ctx.onChange(run);
      run();
      const sketch = p => {
        p.setup = () => { p.createCanvas(ctx.width, ctx.height).parent(stage); p.textFont('Manrope'); };
        p.draw = () => {
          const colors = ctx.colors;
          const n = ctx.params.steps;
          if (!ctx.paused && shown < n) { shown = Math.min(n, Math.round(shown + Math.max(1, n / 120) * (ctx.dt || 16.7) / 16.7)); if (shown === n) report(); }
          p.background(colors.inset);
          const limit = Math.max(3 * Math.sqrt(n), 10);
          const x = step => 14 + step / n * (p.width - 28);
          const y = value => p.height / 2 - value / limit * (p.height / 2 - 16);
          p.stroke(colors.strong); p.strokeWeight(1); p.line(14, p.height / 2, p.width - 14, p.height / 2);
          p.stroke(colors.warning); p.strokeWeight(2); p.noFill();
          p.drawingContext.setLineDash([5, 4]);
          for (const sign of [1, -1]) { p.beginShape(); for (let step = 0; step <= n; step += Math.max(1, n / 60)) p.vertex(x(step), y(sign * Math.sqrt(step))); p.endShape(); }
          p.drawingContext.setLineDash([]);
          p.strokeWeight(1.2);
          const stroke = p.color(colors.primary); stroke.setAlpha(110);
          p.stroke(stroke);
          for (const path of paths) { p.beginShape(); for (let step = 0; step <= shown; step += 1) p.vertex(x(step), y(path[step])); p.endShape(); }
          p.noStroke(); p.fill(colors.secondary); p.textSize(12);
          p.text(`paso ${shown} de ${n}`, 14, p.height - 8);
        };
      };
      return p5Runner(p5, ctx, sketch);
    }
  };

  // p5 · Monte Carlo: puntos al azar en un cuadrado; la fracción dentro del cuarto de círculo estima π/4.
  SCENES['monte-carlo-pi'] = {
    engine: 'p5', aspect: 1,
    title: 'Estimar π con puntos al azar',
    description: 'Puntos al azar en un cuadrado de lado 1. Los que caen dentro del cuarto de círculo se cuentan; cuatro veces esa proporción estima π.',
    params: {},
    actions: [{ id: 'add100', label: 'Lanzar 100 puntos' }, { id: 'add1000', label: 'Lanzar 1.000' }, { id: 'reset', label: 'Borrar' }],
    create(stage, p5, ctx) {
      let points = [];
      let inside = 0;
      let instance = null;
      const report = () => ctx.say(points.length ? `${inside} de ${points.length} puntos dentro del cuarto de círculo. Estimación: 4 × ${inside}/${points.length} = ${format(4 * inside / points.length, 4)}; π vale ${format(Math.PI, 4)}.` : 'Todavía no hay puntos. Lanza algunos para estimar π.');
      ctx.onAction(id => {
        if (id === 'reset') { points = []; inside = 0; }
        else for (let index = 0; index < (id === 'add100' ? 100 : 1000); index += 1) {
          const point = [Math.random(), Math.random()];
          if (point[0] ** 2 + point[1] ** 2 <= 1) inside += 1;
          if (points.length < 6000) points.push(point); else points[Math.floor(Math.random() * points.length)] = point;
        }
        report();
        instance?.redraw();
      });
      report();
      const sketch = p => {
        p.setup = () => { p.createCanvas(ctx.width, ctx.height).parent(stage); p.textFont('Manrope'); p.noLoop(); };
        p.draw = () => {
          const colors = ctx.colors;
          const size = Math.min(p.width, p.height) - 32;
          const left = (p.width - size) / 2;
          const top = (p.height - size) / 2;
          p.background(colors.inset);
          p.noFill(); p.stroke(colors.strong); p.strokeWeight(1.5); p.rect(left, top, size, size);
          p.stroke(colors.warning); p.strokeWeight(2); p.arc(left, top + size, size * 2, size * 2, -p.HALF_PI, 0);
          p.noStroke();
          for (const [x, y] of points) { p.fill(x * x + y * y <= 1 ? colors.primary : colors.secondary); p.circle(left + x * size, top + size - y * size, 3.2); }
        };
      };
      instance = new p5(sketch);
      return { destroy: () => instance.remove(), resize: (w, h) => { instance.resizeCanvas(w, h); instance.redraw(); }, redraw: () => instance.redraw() };
    }
  };

  // JSXGraph: tablero con los colores del tema y sin botones de navegación.
  function board(JXG, stage, box) {
    stage.id = stage.id || `visual-${Math.random().toString(36).slice(2)}`;
    const colors = palette();
    JXG.Options.text.cssDefaultStyle = 'font-family: Manrope, sans-serif;';
    const created = JXG.JSXGraph.initBoard(stage.id, {
      boundingbox: box, axis: true, showNavigation: false, showCopyright: false, keepAspectRatio: false, pan: { enabled: false }, zoom: { enabled: false },
      defaultAxes: { x: { strokeColor: colors.strong, ticks: { strokeColor: colors.line, label: { color: colors.secondary } } }, y: { strokeColor: colors.strong, ticks: { strokeColor: colors.line, label: { color: colors.secondary } } } }
    });
    return { board: created, colors };
  }

  const jsxResize = (JXG, created) => (w, h) => { created.resizeContainer(w, h); created.fullUpdate(); };

  // JSXGraph · De la secante a la tangente: la pendiente de la secante se acerca a la derivada cuando h → 0.
  SCENES['derivative-tangent'] = {
    engine: 'jsxgraph', aspect: .72,
    title: 'De la secante a la tangente',
    description: 'La gráfica de f(x) = 0,5x³ − 2x con un punto P, un segundo punto a distancia h, la recta secante y la recta tangente en P.',
    params: { x0: { label: 'Posición de P (x)', min: -2.5, max: 2.5, step: .1, value: 1 }, h: { label: 'Distancia h', min: .05, max: 2, step: .05, value: 1.5 } },
    create(stage, JXG, ctx) {
      const { board: b, colors } = board(JXG, stage, [-3.5, 5, 3.5, -5]);
      const f = x => .5 * x ** 3 - 2 * x;
      const df = x => 1.5 * x ** 2 - 2;
      b.create('functiongraph', [f], { strokeColor: colors.ink, strokeWidth: 2.5 });
      const P = b.create('point', [() => ctx.params.x0, () => f(ctx.params.x0)], { name: 'P', size: 4, fillColor: colors.primary, strokeColor: colors.primary, label: { color: colors.ink } });
      const Q = b.create('point', [() => ctx.params.x0 + ctx.params.h, () => f(ctx.params.x0 + ctx.params.h)], { name: 'Q', size: 3, fillColor: colors.warning, strokeColor: colors.warning, label: { color: colors.ink } });
      b.create('line', [P, Q], { strokeColor: colors.warning, strokeWidth: 2, dash: 2 });
      b.create('line', [P, [() => ctx.params.x0 + 1, () => f(ctx.params.x0) + df(ctx.params.x0)]], { strokeColor: colors.primary, strokeWidth: 2.5 });
      const report = () => {
        const { x0, h } = ctx.params;
        const secant = (f(x0 + h) - f(x0)) / h;
        ctx.say(`Con h = ${format(h, 2)}, la pendiente de la secante es ${format(secant)}; la derivada en x = ${format(x0, 1)} es ${format(df(x0))}. Diferencia: ${format(Math.abs(secant - df(x0)))}.`);
      };
      ctx.onChange(() => { b.update(); report(); });
      report();
      return { destroy: () => JXG.JSXGraph.freeBoard(b), resize: jsxResize(JXG, b) };
    }
  };

  // JSXGraph · Sumas de Riemann: más rectángulos, más cerca del área exacta.
  SCENES.riemann = {
    engine: 'jsxgraph', aspect: .72,
    title: 'Sumas de Riemann',
    description: 'El área bajo f(x) = 0,25x² + 1 entre 0 y 4 aproximada con rectángulos; se compara la suma con la integral exacta.',
    params: { n: { label: 'Rectángulos', min: 1, max: 60, step: 1, value: 4 } },
    actions: [{ id: 'left', label: 'Izquierda' }, { id: 'middle', label: 'Punto medio' }, { id: 'right', label: 'Derecha' }],
    create(stage, JXG, ctx) {
      const { board: b, colors } = board(JXG, stage, [-.6, 6.2, 4.6, -.8]);
      const f = x => .25 * x * x + 1;
      const exact = 16 / 3 + 4;
      let rule = 'left';
      b.create('functiongraph', [f, -.5, 4.5], { strokeColor: colors.ink, strokeWidth: 2.5 });
      const sum = b.create('riemannsum', [f, () => ctx.params.n, () => rule, 0, 4], { fillColor: colors.primary, fillOpacity: .28, strokeColor: colors.primary });
      const report = () => {
        const value = sum.Value();
        ctx.say(`${ctx.params.n} ${ctx.params.n === 1 ? 'rectángulo' : 'rectángulos'} (${rule === 'left' ? 'extremo izquierdo' : rule === 'right' ? 'extremo derecho' : 'punto medio'}): suma ${format(value, 4)}. Área exacta: ${format(exact, 4)}. Error: ${format(Math.abs(value - exact), 4)}.`);
      };
      ctx.onAction(id => { rule = id; b.update(); report(); });
      ctx.onChange(() => { b.update(); report(); });
      b.update();
      report();
      return { destroy: () => JXG.JSXGraph.freeBoard(b), resize: jsxResize(JXG, b) };
    }
  };

  // JSXGraph · Límite con un hueco: la función no está definida en x = 1, pero sus valores se acercan a 2.
  SCENES.limit = {
    engine: 'jsxgraph', aspect: .72,
    title: 'Acercarse a un límite',
    description: 'La gráfica de f(x) = (x² − 1)/(x − 1), con un hueco en x = 1, y dos puntos que se acercan a ese valor por la izquierda y por la derecha.',
    params: { d: { label: 'Distancia a x = 1', min: .02, max: 1.5, step: .02, value: 1 } },
    create(stage, JXG, ctx) {
      const { board: b, colors } = board(JXG, stage, [-1.5, 4.5, 3.5, -1]);
      const f = x => (x * x - 1) / (x - 1);
      b.create('functiongraph', [f, -1.4, .999], { strokeColor: colors.ink, strokeWidth: 2.5 });
      b.create('functiongraph', [f, 1.001, 3.4], { strokeColor: colors.ink, strokeWidth: 2.5 });
      b.create('point', [1, 2], { name: '', size: 4, fillColor: colors.inset, strokeColor: colors.ink, strokeWidth: 2, fixed: true });
      const left = b.create('point', [() => 1 - ctx.params.d, () => f(1 - ctx.params.d)], { name: 'izq.', size: 3, fillColor: colors.primary, strokeColor: colors.primary, label: { color: colors.secondary } });
      const right = b.create('point', [() => 1 + ctx.params.d, () => f(1 + ctx.params.d)], { name: 'der.', size: 3, fillColor: colors.warning, strokeColor: colors.warning, label: { color: colors.secondary } });
      b.create('segment', [left, [() => left.X(), 0]], { strokeColor: colors.primary, dash: 2, strokeWidth: 1 });
      b.create('segment', [right, [() => right.X(), 0]], { strokeColor: colors.warning, dash: 2, strokeWidth: 1 });
      const report = () => {
        const { d } = ctx.params;
        ctx.say(`f(${format(1 - d, 2)}) = ${format(f(1 - d), 3)} y f(${format(1 + d, 2)}) = ${format(f(1 + d), 3)}. Los dos valores se acercan a 2, aunque f(1) no existe.`);
      };
      ctx.onChange(() => { b.update(); report(); });
      report();
      return { destroy: () => JXG.JSXGraph.freeBoard(b), resize: jsxResize(JXG, b) };
    }
  };

  // JSXGraph · Vectores: suma por la regla del paralelogramo, producto punto y ángulo. Se arrastran o se usan los deslizadores.
  SCENES.vectors = {
    engine: 'jsxgraph', aspect: .8,
    title: 'Suma de vectores',
    description: 'Dos vectores u y v desde el origen, su suma u + v como diagonal del paralelogramo, el producto punto y el ángulo entre ellos.',
    params: { ux: { label: 'u, componente x', min: -4, max: 4, step: .5, value: 3 }, uy: { label: 'u, componente y', min: -4, max: 4, step: .5, value: 1 }, vx: { label: 'v, componente x', min: -4, max: 4, step: .5, value: 1 }, vy: { label: 'v, componente y', min: -4, max: 4, step: .5, value: 2.5 } },
    create(stage, JXG, ctx) {
      const { board: b, colors } = board(JXG, stage, [-5.5, 5.5, 5.5, -5.5]);
      const O = b.create('point', [0, 0], { visible: false, fixed: true });
      const U = b.create('point', [ctx.params.ux, ctx.params.uy], { name: 'u', size: 4, fillColor: colors.primary, strokeColor: colors.primary, snapToGrid: true, snapSizeX: .5, snapSizeY: .5, label: { color: colors.ink } });
      const V = b.create('point', [ctx.params.vx, ctx.params.vy], { name: 'v', size: 4, fillColor: colors.warning, strokeColor: colors.warning, snapToGrid: true, snapSizeX: .5, snapSizeY: .5, label: { color: colors.ink } });
      const S = b.create('point', [() => U.X() + V.X(), () => U.Y() + V.Y()], { name: 'u + v', size: 3, fillColor: colors.ink, strokeColor: colors.ink, label: { color: colors.ink } });
      b.create('arrow', [O, U], { strokeColor: colors.primary, strokeWidth: 3 });
      b.create('arrow', [O, V], { strokeColor: colors.warning, strokeWidth: 3 });
      b.create('arrow', [O, S], { strokeColor: colors.ink, strokeWidth: 2.5 });
      b.create('segment', [U, S], { strokeColor: colors.warning, dash: 2, strokeWidth: 1.5 });
      b.create('segment', [V, S], { strokeColor: colors.primary, dash: 2, strokeWidth: 1.5 });
      const report = () => {
        const [ux, uy, vx, vy] = [U.X(), U.Y(), V.X(), V.Y()];
        const dot = ux * vx + uy * vy;
        const lengths = Math.hypot(ux, uy) * Math.hypot(vx, vy);
        const angle = lengths ? Math.acos(Math.max(-1, Math.min(1, dot / lengths))) * 180 / Math.PI : 0;
        ctx.say(`u = (${format(ux, 1)}, ${format(uy, 1)}), v = (${format(vx, 1)}, ${format(vy, 1)}), u + v = (${format(ux + vx, 1)}, ${format(uy + vy, 1)}). Producto punto: ${format(dot, 2)}; ángulo: ${format(angle, 1)}°.${Math.abs(dot) < 1e-9 && lengths ? ' Son perpendiculares.' : ''}`);
      };
      // Arrastrar mueve los deslizadores; los deslizadores mueven los puntos.
      const sync = () => { ctx.set({ ux: U.X(), uy: U.Y(), vx: V.X(), vy: V.Y() }); report(); };
      U.on('drag', sync);
      V.on('drag', sync);
      ctx.onChange(() => { U.moveTo([ctx.params.ux, ctx.params.uy]); V.moveTo([ctx.params.vx, ctx.params.vy]); b.update(); report(); });
      report();
      return { destroy: () => JXG.JSXGraph.freeBoard(b), resize: jsxResize(JXG, b) };
    }
  };

  // Three.js: escena con cámara, luces, arrastre para girar y animación que respeta el movimiento reducido.
  function threeScene(THREE, stage, ctx, { distance = 9, autoRotate = true } = {}) {
    const colors = palette();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(2, root.devicePixelRatio || 1));
    renderer.setSize(ctx.width, ctx.height);
    stage.appendChild(renderer.domElement);
    renderer.domElement.style.touchAction = 'none';
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, ctx.width / ctx.height, .1, 100);
    camera.position.set(distance * .8, distance * .55, distance * .8);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.AmbientLight(0xffffff, .55));
    const light = new THREE.DirectionalLight(0xffffff, 1.6);
    light.position.set(4, 8, 6);
    scene.add(light);
    const pivot = new THREE.Group();
    scene.add(pivot);
    const axes = new THREE.AxesHelper(3.2);
    axes.material.transparent = true;
    axes.material.opacity = .55;
    pivot.add(axes);
    let rotating = autoRotate && !ctx.reduced;
    let dragging = null;
    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', event => { dragging = { x: event.clientX, y: event.clientY }; rotating = false; canvas.setPointerCapture(event.pointerId); });
    canvas.addEventListener('pointermove', event => {
      if (!dragging) return;
      pivot.rotation.y += (event.clientX - dragging.x) * .01;
      pivot.rotation.x = Math.max(-1.2, Math.min(1.2, pivot.rotation.x + (event.clientY - dragging.y) * .01));
      dragging = { x: event.clientX, y: event.clientY };
      draw();
    });
    canvas.addEventListener('pointerup', () => { dragging = null; });
    let frame = 0;
    let running = true;
    const draw = () => renderer.render(scene, camera);
    const loop = () => {
      if (!running) return;
      if (rotating) pivot.rotation.y += .004;
      draw();
      frame = requestAnimationFrame(loop);
    };
    loop();
    return {
      THREE, scene, pivot, colors, draw,
      rotate: (dx, dy) => { rotating = false; pivot.rotation.y += dx; pivot.rotation.x = Math.max(-1.2, Math.min(1.2, pivot.rotation.x + dy)); draw(); },
      controls: {
        destroy: () => { running = false; cancelAnimationFrame(frame); scene.traverse(object => { object.geometry?.dispose?.(); object.material?.dispose?.(); }); renderer.dispose(); canvas.remove(); },
        resize: (w, h) => { renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); draw(); },
        pause: () => { running = false; cancelAnimationFrame(frame); },
        resume: () => { if (!running) { running = true; loop(); } }
      }
    };
  }

  // Three.js · Superficies z = f(x, y): paraboloide, silla de montar y onda.
  SCENES.surface = {
    engine: 'three', aspect: .8,
    title: 'Superficies en el espacio',
    description: 'Una superficie z = f(x, y) en 3D. Arrástrala para girarla. El paraboloide tiene un mínimo; la silla de montar sube en una dirección y baja en otra.',
    params: { a: { label: 'Altura (a)', min: -1.5, max: 1.5, step: .1, value: .6 } },
    actions: [{ id: 'paraboloid', label: 'Paraboloide' }, { id: 'saddle', label: 'Silla de montar' }, { id: 'wave', label: 'Onda' }],
    create(stage, THREE, ctx) {
      const view = threeScene(THREE, stage, ctx);
      const shapes = {
        paraboloid: { formula: 'z = a(x² + y²)/4', f: (x, y, a) => a * (x * x + y * y) / 4 },
        saddle: { formula: 'z = a(x² − y²)/4', f: (x, y, a) => a * (x * x - y * y) / 4 },
        wave: { formula: 'z = a·sen(x)·cos(y)', f: (x, y, a) => a * Math.sin(x) * Math.cos(y) }
      };
      let shape = 'paraboloid';
      const geometry = new THREE.PlaneGeometry(6, 6, 48, 48);
      geometry.rotateX(-Math.PI / 2);
      const base = geometry.attributes.position.array.slice();
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: view.colors.primary, side: THREE.DoubleSide, roughness: .55, metalness: .05, transparent: true, opacity: .92 }));
      const wire = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), new THREE.LineBasicMaterial({ color: view.colors.inset, transparent: true, opacity: .35 }));
      view.pivot.add(mesh, wire);
      const update = () => {
        const positions = geometry.attributes.position.array;
        for (let index = 0; index < positions.length; index += 3) positions[index + 1] = Math.max(-3, Math.min(3, shapes[shape].f(base[index], base[index + 2], ctx.params.a)));
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        wire.geometry.dispose();
        wire.geometry = new THREE.WireframeGeometry(geometry);
        view.draw();
        ctx.say(`${ctx.actionLabel(shape)}: ${shapes[shape].formula} con a = ${format(ctx.params.a, 1)}. ${shape === 'paraboloid' ? (ctx.params.a > 0 ? 'Tiene un mínimo en el origen.' : ctx.params.a < 0 ? 'Tiene un máximo en el origen.' : 'Es un plano.') : shape === 'saddle' ? 'El origen es un punto de silla: sube en x y baja en y.' : 'Las crestas y los valles se repiten.'} Arrastra la figura o usa las flechas para girarla.`);
      };
      ctx.onAction(id => { shape = id; update(); });
      ctx.onChange(update);
      ctx.onKey(view.rotate);
      update();
      return view.controls;
    }
  };

  // Three.js · Sólido de revolución: girar y = √x alrededor del eje x forma un sólido de volumen 8π.
  SCENES.revolution = {
    engine: 'three', aspect: .75,
    title: 'Sólido de revolución',
    description: 'La curva y = √x entre 0 y 4 gira alrededor del eje x. El deslizador controla cuánto gira; con una vuelta completa se forma el sólido de volumen 8π.',
    params: { angle: { label: 'Giro (grados)', min: 0, max: 360, step: 10, value: 220 } },
    create(stage, THREE, ctx) {
      const view = threeScene(THREE, stage, ctx, { distance: 10, autoRotate: false });
      view.pivot.rotation.set(.35, -.6, 0);
      const profile = Array.from({ length: 41 }, (_, index) => { const x = index / 10; return new THREE.Vector2(Math.sqrt(x), x - 2); });
      const material = new THREE.MeshStandardMaterial({ color: view.colors.primary, side: THREE.DoubleSide, roughness: .5, transparent: true, opacity: .85 });
      let solid = null;
      const curve = new THREE.Line(new THREE.BufferGeometry().setFromPoints(profile.map(point => new THREE.Vector3(point.y, point.x, 0))), new THREE.LineBasicMaterial({ color: view.colors.warning }));
      view.pivot.add(curve);
      const update = () => {
        if (solid) { view.pivot.remove(solid); solid.geometry.dispose(); }
        const phi = ctx.params.angle * Math.PI / 180;
        if (phi > 0) {
          const geometry = new THREE.LatheGeometry(profile, 64, 0, phi);
          geometry.rotateZ(-Math.PI / 2);
          solid = new THREE.Mesh(geometry, material);
          view.pivot.add(solid);
        } else solid = null;
        view.draw();
        const volume = 8 * Math.PI * ctx.params.angle / 360;
        ctx.say(`Giro de ${ctx.params.angle}°. Volumen barrido: ${format(volume, 2)} unidades cúbicas${ctx.params.angle === 360 ? ', es decir, π∫₀⁴ x dx = 8π' : ` de 8π ≈ ${format(8 * Math.PI, 2)}`}.`);
      };
      ctx.onChange(update);
      ctx.onKey(view.rotate);
      update();
      return view.controls;
    }
  };

  // Three.js · Transformaciones lineales: el cubo unitario y su imagen; el determinante mide el volumen.
  SCENES.transform = {
    engine: 'three', aspect: .8,
    title: 'Transformaciones lineales en 3D',
    description: 'El cubo unitario (líneas) y su imagen bajo una matriz de escala, cizalla y giro (sólido). El volumen del sólido es el valor absoluto del determinante.',
    params: { scale: { label: 'Escala en x', min: 0, max: 2.5, step: .1, value: 1.5 }, shear: { label: 'Cizalla (x según y)', min: -1.5, max: 1.5, step: .1, value: .6 }, turn: { label: 'Giro en z (grados)', min: -90, max: 90, step: 5, value: 20 } },
    create(stage, THREE, ctx) {
      const view = threeScene(THREE, stage, ctx, { distance: 9 });
      const box = new THREE.BoxGeometry(1, 1, 1).translate(.5, .5, .5);
      const original = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: view.colors.secondary }));
      const image = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: view.colors.primary, transparent: true, opacity: .55, roughness: .4 }));
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: view.colors.primary }));
      image.matrixAutoUpdate = false;
      edges.matrixAutoUpdate = false;
      view.pivot.add(original, image, edges);
      const update = () => {
        const { scale, shear, turn } = ctx.params;
        const angle = turn * Math.PI / 180;
        const rotation = new THREE.Matrix4().makeRotationZ(angle);
        const linear = new THREE.Matrix4().set(scale, shear, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
        const matrix = rotation.multiply(linear);
        image.matrix.copy(matrix);
        edges.matrix.copy(matrix);
        view.draw();
        ctx.say(`Matriz = giro de ${turn}° · [[${format(scale, 1)}, ${format(shear, 1)}, 0], [0, 1, 0], [0, 0, 1]]. ${scale === 0 ? 'Determinante: 0. El cubo se aplana en un plano: puntos distintos van al mismo lugar y la transformación no tiene inversa.' : `Determinante: ${format(scale, 2)}, así que el volumen pasa de 1 a ${format(Math.abs(scale), 2)}. La cizalla y el giro no cambian el volumen.`}`);
      };
      ctx.onChange(update);
      ctx.onKey(view.rotate);
      update();
      return view.controls;
    }
  };

  // ── Bloque visual ─────────────────────────────────────────────────────────────────────────
  function validate(visual) {
    if (!visual || typeof visual !== 'object') return ['La visualización no es un objeto.'];
    if (visual.engine === 'manim') return /\.mp4$/i.test(visual.src || '') ? [] : ['Un video de Manim necesita src con un archivo .mp4.'];
    const scene = SCENES[visual.scene];
    if (!scene) return [`Escena «${visual.scene}» desconocida. Usa: ${Object.keys(SCENES).join(', ')}.`];
    if (visual.engine && visual.engine !== scene.engine) return [`La escena «${visual.scene}» usa el motor ${scene.engine}, no ${visual.engine}.`];
    return Object.entries(visual.params || {}).flatMap(([name, value]) => {
      const param = scene.params[name];
      if (!param) return [`La escena «${visual.scene}» no tiene el parámetro «${name}».`];
      return typeof value === 'number' && value >= param.min && value <= param.max ? [] : [`«${name}» debe estar entre ${param.min} y ${param.max}.`];
    });
  }

  function render(visual, key = 'visual') {
    const scene = SCENES[visual.scene];
    if (!scene) return '';
    const id = String(key).replace(/[^\w-]/g, '-');
    const params = { ...Object.fromEntries(Object.entries(scene.params).map(([name, param]) => [name, param.value])), ...(visual.params || {}) };
    const sliders = Object.entries(scene.params).map(([name, param]) => `<label class="visual-param"><span>${escape(param.label)} <output data-visual-output="${name}">${format(params[name], 2)}</output></span><input type="range" data-visual-param="${name}" min="${param.min}" max="${param.max}" step="${param.step}" value="${params[name]}"></label>`).join('');
    const actions = (scene.actions || []).map(action => `<button type="button" class="button button-secondary visual-action" data-visual-action="${action.id}">${escape(action.label)}</button>`).join('');
    return `<figure class="visual visual-${scene.engine}" data-visual="${escape(id)}" data-scene="${escape(visual.scene)}" data-params="${escape(JSON.stringify(params))}">`
      + `<div class="visual-stage" role="img" aria-label="${escape(visual.description || scene.description)}" style="aspect-ratio: ${1 / scene.aspect}" tabindex="${scene.engine === 'three' ? 0 : -1}"><p class="visual-loading">Preparando la visualización…</p></div>`
      + (sliders || actions ? `<div class="visual-controls">${sliders}${actions ? `<div class="visual-actions">${actions}</div>` : ''}</div>` : '')
      + `<p class="visual-readout" data-visual-readout aria-live="polite"></p>`
      + `${visual.caption ? `<figcaption>${visual.caption}</figcaption>` : ''}</figure>`;
  }

  const instances = new Map();

  function cleanup() {
    for (const [figure, instance] of instances) {
      if (figure.isConnected) continue;
      try { instance.controls?.destroy?.(); } catch { /* Ya se liberó. */ }
      instance.observers?.forEach(observer => observer.disconnect());
      instances.delete(figure);
    }
  }

  async function mount(figure) {
    if (!figure || instances.has(figure)) return;
    cleanup();
    const scene = SCENES[figure.dataset.scene];
    if (!scene) return;
    const stage = figure.querySelector('.visual-stage');
    const readout = figure.querySelector('[data-visual-readout]');
    const instance = { observers: [] };
    instances.set(figure, instance);
    const params = JSON.parse(figure.dataset.params || '{}');
    const changeListeners = [];
    const actionListeners = [];
    const keyListeners = [];
    let lastSay = '';
    const ctx = {
      params, reduced: reducedMotion(), paused: false, colors: palette(),
      get width() { return Math.max(240, stage.clientWidth); },
      get height() { return Math.max(180, Math.round(stage.clientWidth * scene.aspect)); },
      say: text => { if (text !== lastSay) { lastSay = text; readout.textContent = text; } },
      onChange: listener => changeListeners.push(listener),
      onAction: listener => actionListeners.push(listener),
      onKey: listener => keyListeners.push(listener),
      actionLabel: id => scene.actions?.find(action => action.id === id)?.label || id,
      // Actualiza parámetros desde la figura (por ejemplo, al arrastrar un punto) sin volver a avisar.
      set: values => {
        for (const [name, value] of Object.entries(values)) {
          params[name] = value;
          const input = figure.querySelector(`[data-visual-param="${name}"]`);
          if (input) input.value = String(value);
          const output = figure.querySelector(`[data-visual-output="${name}"]`);
          if (output) output.textContent = format(value, 2);
        }
      }
    };
    figure.addEventListener('input', event => {
      const input = event.target.closest('[data-visual-param]');
      if (!input) return;
      params[input.dataset.visualParam] = Number(input.value);
      figure.querySelector(`[data-visual-output="${input.dataset.visualParam}"]`).textContent = format(Number(input.value), 2);
      changeListeners.forEach(listener => listener());
    });
    figure.addEventListener('click', event => {
      const button = event.target.closest('[data-visual-action]');
      if (!button) return;
      figure.querySelectorAll('[data-visual-action]').forEach(other => other.removeAttribute('aria-pressed'));
      if (!['drop', 'run', 'add100', 'add1000', 'reset'].includes(button.dataset.visualAction)) button.setAttribute('aria-pressed', 'true');
      actionListeners.forEach(listener => listener(button.dataset.visualAction));
    });
    stage.addEventListener('keydown', event => {
      const moves = { ArrowLeft: [-.15, 0], ArrowRight: [.15, 0], ArrowUp: [0, -.15], ArrowDown: [0, .15] };
      if (!moves[event.key] || !keyListeners.length) return;
      event.preventDefault();
      keyListeners.forEach(listener => listener(...moves[event.key]));
    });
    try {
      const library = await load(scene.engine);
      if (!figure.isConnected) return instances.delete(figure);
      stage.querySelector('.visual-loading')?.remove();
      instance.controls = scene.create(stage, library, ctx);
      figure.classList.add('is-ready');
      // Se ajusta al ancho disponible y se pausa fuera de la pantalla.
      if (typeof ResizeObserver === 'function') {
        let width = stage.clientWidth;
        const resize = new ResizeObserver(() => { if (Math.abs(stage.clientWidth - width) > 2) { width = stage.clientWidth; instance.controls?.resize?.(ctx.width, ctx.height); } });
        resize.observe(stage);
        instance.observers.push(resize);
      }
      if (typeof IntersectionObserver === 'function' && instance.controls.pause) {
        const visible = new IntersectionObserver(([entry]) => { ctx.paused = !entry.isIntersecting; if (entry.isIntersecting) instance.controls.resume?.(); else instance.controls.pause(); });
        visible.observe(stage);
        instance.observers.push(visible);
      }
    } catch (error) {
      instances.delete(figure);
      stage.innerHTML = '<div class="visual-error"><p>Esta visualización necesita conexión la primera vez que se abre.</p><button type="button" class="button button-secondary" data-visual-retry>Intentar de nuevo</button></div>';
      stage.querySelector('[data-visual-retry]').addEventListener('click', () => { stage.innerHTML = '<p class="visual-loading">Preparando la visualización…</p>'; mount(figure); }, { once: true });
    }
  }

  // Al cambiar de vista se liberan las escenas que ya no están en pantalla (lienzos, WebGL y animaciones).
  if (typeof root.addEventListener === 'function') root.addEventListener('hashchange', () => setTimeout(cleanup, 0));

  root.ZUKA_VISUALS = { SCENES, LIBRARIES, render, mount, cleanup, validate, load, instances };
})();
