// Compila Zuka para publicar: copia src/ en dist/, genera dist/content.js a partir de content/
// y fija la versión de la caché del service worker. dist/ es desechable: no se edita ni se guarda en Git.
const fs = require('node:fs');
const path = require('node:path');
const { compileAll, render, ContentError } = require('./build-content.cjs');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'src');
const output = path.join(root, 'dist');

try {
  fs.rmSync(output, { recursive: true, force: true });
  fs.cpSync(source, output, { recursive: true });
  const lessons = compileAll();
  fs.writeFileSync(path.join(output, 'content.js'), render(lessons));
  console.log(`Zuka contenido: ${lessons.length} lecciones, ${lessons.reduce((total, lesson) => total + lesson.exercises, 0)} ejercicios interactivos.`);
  require('./build-pwa.cjs');
} catch (error) {
  console.error(error instanceof ContentError ? `Error en el contenido · ${error.message}` : error);
  process.exit(1);
}
