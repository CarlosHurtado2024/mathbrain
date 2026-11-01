const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { compileLesson } = require('../scripts/build-content.cjs');

const src = path.join(__dirname, '../src');
const context = vm.createContext({});
vm.runInContext(fs.readFileSync(path.join(src, 'visuals.js'), 'utf8'), context);
const visuals = context.ZUKA_VISUALS;
const lesson = body => `---\ntitulo: Prueba\ndescripcion: Lección de prueba\n---\n\n:::idea\nIdea.\n:::\n\n${body}\n`;

test('Cada escena usa uno de los tres motores, con descripción accesible y parámetros válidos', () => {
  const engines = new Set(Object.keys(visuals.LIBRARIES));
  assert.deepEqual([...engines].sort(), ['jsxgraph', 'p5', 'three']);
  const scenes = Object.entries(visuals.SCENES);
  assert.ok(scenes.length >= 10);
  for (const [name, scene] of scenes) {
    assert.ok(engines.has(scene.engine), name);
    assert.ok(scene.description.length > 40, `${name} necesita una descripción`);
    assert.equal(typeof scene.create, 'function', name);
    for (const [param, spec] of Object.entries(scene.params)) assert.ok(spec.min <= spec.value && spec.value <= spec.max && spec.label, `${name}.${param}`);
  }
  for (const engine of engines) assert.ok(scenes.some(([, scene]) => scene.engine === engine), `Hay escenas de ${engine}`);
});

test('Las librerías están en src/vendor con su licencia y el service worker las guarda al usarlas', () => {
  for (const [engine, library] of Object.entries(visuals.LIBRARIES)) {
    const file = (library.script || library.module).replace(/^\.\//, '');
    assert.ok(fs.statSync(path.join(src, file)).size > 100000, engine);
    assert.ok(fs.readdirSync(path.join(src, path.dirname(file))).some(name => /^LICENSE/i.test(name)), `${engine} conserva su licencia`);
  }
  const worker = fs.readFileSync(path.join(src, 'sw.js'), 'utf8');
  for (const file of ['vendor/p5/p5.min.js', 'vendor/jsxgraph/jsxgraphcore.js', 'vendor/three/three.module.min.js']) {
    assert.match(worker, new RegExp(`RUNTIME_FILES = \\[[^\\]]*'\\./${file.replace(/[./]/g, '\\$&')}'`), file);
    assert.doesNotMatch(worker.match(/const SHELL_FILES = \[[\s\S]*?\];/)[0], new RegExp(file.replace(/[./]/g, '\\$&')), `${file} no se descarga al instalar`);
  }
});

test('La figura trae controles etiquetados, lectura en vivo y descripción para lectores de pantalla', () => {
  const html = visuals.render({ scene: 'riemann', params: { n: 8 }, caption: 'Pie' }, 'leccion-1-visual-2');
  assert.match(html, /^<figure class="visual visual-jsxgraph" data-visual="leccion-1-visual-2" data-scene="riemann"/);
  assert.match(html, /class="visual-stage" role="img" aria-label="El área bajo/);
  assert.match(html, /<label class="visual-param"><span>Rectángulos <output data-visual-output="n">8<\/output><\/span><input type="range" data-visual-param="n" min="1" max="60" step="1" value="8"><\/label>/);
  assert.match(html, /data-visual-action="middle">Punto medio<\/button>/);
  assert.match(html, /<p class="visual-readout" data-visual-readout aria-live="polite"><\/p>/);
  assert.match(html, /<figcaption>Pie<\/figcaption><\/figure>$/);
  assert.match(visuals.render({ scene: 'surface' }, 'x'), /tabindex="0"/, 'Las escenas 3D se giran con el teclado');
});

test('La validación rechaza escenas, motores y parámetros inexistentes', () => {
  assert.deepEqual(Array.from(visuals.validate({ engine: 'p5', scene: 'galton', params: { rows: 8 } })), []);
  assert.match(visuals.validate({ scene: 'magia' })[0], /Escena «magia» desconocida/);
  assert.match(visuals.validate({ engine: 'three', scene: 'galton' })[0], /usa el motor p5/);
  assert.match(visuals.validate({ scene: 'galton', params: { filas: 3 } })[0], /no tiene el parámetro «filas»/);
  assert.match(visuals.validate({ scene: 'galton', params: { rows: 40 } })[0], /entre 4 y 14/);
  assert.match(visuals.validate({ engine: 'manim', src: 'video.gif' })[0], /\.mp4/);
});

test(':::visual compila escenas como bloques de simulación o gráfica, y Manim como video con subtítulos', () => {
  const result = compileLesson(lesson(':::visual\n{ "engine": "p5", "scene": "galton", "text": "Mira la **campana**.", "caption": "Con $n$ filas." }\n:::\n\n:::visual\n{ "engine": "manim", "src": "assets/videos/suma-riemann.mp4", "captions": "assets/videos/suma-riemann.vtt", "poster": "assets/videos/suma-riemann.jpg", "title": "Sumas" }\n:::'), 'content/prueba/01-prueba.md', 'prueba-1');
  const [simulation, video] = result.steps.filter(step => step.data);
  assert.equal(simulation.type, 'simulation');
  assert.match(simulation.html, /<strong>campana<\/strong>/);
  assert.deepEqual(simulation.data.visual.scene, 'galton');
  assert.match(simulation.data.visual.caption, /class="katex"/);
  assert.equal(video.type, 'video');
  assert.deepEqual(video.data, { src: 'assets/videos/suma-riemann.mp4', variant: 'manim', format: 'horizontal', captions: 'assets/videos/suma-riemann.vtt', poster: 'assets/videos/suma-riemann.jpg', title: 'Sumas' });
  assert.throws(() => compileLesson(lesson(':::visual\n{ "engine": "manim", "src": "assets/videos/no-existe.mp4" }\n:::'), 'a.md', 'a-1'), /No existe src\/assets\/videos\/no-existe\.mp4/);
  assert.throws(() => compileLesson(lesson(':::visual\n{ "scene": "galton", "block": "exercise" }\n:::'), 'a.md', 'a-1'), /«block» debe ser uno de/);
});

test('Los videos de Manim duran entre 30 y 90 segundos y traen subtítulos en español y portada', () => {
  const folder = path.join(src, 'assets/videos');
  const videos = fs.readdirSync(folder).filter(name => name.endsWith('.mp4'));
  assert.ok(videos.length >= 2);
  for (const video of videos) {
    const name = video.replace(/\.mp4$/, '');
    const captions = fs.readFileSync(path.join(folder, `${name}.vtt`), 'utf8');
    assert.match(captions, /^WEBVTT/);
    const end = [...captions.matchAll(/--> (\d\d):(\d\d):(\d\d\.\d+)/g)].map(([, h, m, s]) => h * 3600 + m * 60 + Number(s)).at(-1);
    assert.ok(end >= 30 && end <= 90, `${name} dura ${end} s`);
    assert.ok(fs.existsSync(path.join(folder, `${name}.jpg`)), `${name} tiene portada`);
    assert.ok(fs.statSync(path.join(folder, video)).size < 4e6, `${name} pesa menos de 4 MB`);
  }
});
