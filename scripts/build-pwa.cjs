const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const directory = path.resolve(__dirname, '../dist');
const workerPath = path.join(directory, 'sw.js');
const workerPattern = /const CACHE_NAME = 'mathbrain-shell-[^']+';/;
const textExtensions = new Set(['.html', '.css', '.js', '.json', '.webmanifest', '.svg']);

function filesIn(folder) {
  return fs.readdirSync(folder, { withFileTypes: true }).flatMap(entry => {
    const filename = path.join(folder, entry.name);
    return entry.isDirectory() ? filesIn(filename) : [filename];
  }).sort();
}

// Los navegadores identifican los cambios de icono por su URL. Emitir una URL
// por contenido evita conservar el logo anterior al actualizar la aplicación.
const installIcons = ['icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
const replacements = installIcons.map(filename => {
  const original = path.join(directory, 'assets', 'icons', filename);
  const revision = crypto.createHash('sha256').update(fs.readFileSync(original)).digest('hex').slice(0, 12);
  const stem = path.basename(filename, '.png');
  const versioned = `${stem}.${revision}.png`;
  fs.copyFileSync(original, path.join(path.dirname(original), versioned));
  return [new RegExp('assets/icons/' + stem + '(?:\\.[0-9a-f]{12})?\\.png', 'g'), `assets/icons/${versioned}`];
});
for (const filename of ['index.html', 'manifest.webmanifest', 'sw.js']) {
  const target = path.join(directory, filename);
  let contents = fs.readFileSync(target, 'utf8');
  for (const [pattern, replacement] of replacements) contents = contents.replace(pattern, replacement);
  fs.writeFileSync(target, contents);
}

const worker = fs.readFileSync(workerPath, 'utf8').replace(/\r\n/g, '\n');
if (!workerPattern.test(worker)) throw new Error('No se encontró la versión de la caché en dist/sw.js.');
const hash = crypto.createHash('sha256');
for (const filename of filesIn(directory)) {
  const relative = path.relative(directory, filename).split(path.sep).join('/');
  let contents = fs.readFileSync(filename);
  if (filename === workerPath) contents = Buffer.from(worker.replace(workerPattern, "const CACHE_NAME = 'mathbrain-shell-build';"));
  else if (textExtensions.has(path.extname(filename))) contents = Buffer.from(contents.toString('utf8').replace(/\r\n/g, '\n'));
  hash.update(relative).update('\0').update(contents).update('\0');
}
const revision = hash.digest('hex').slice(0, 16);
const output = worker.replace(workerPattern, `const CACHE_NAME = 'mathbrain-shell-${revision}';`);
fs.writeFileSync(workerPath, output);
console.log(`Zuka PWA preparada: ${revision}`);
