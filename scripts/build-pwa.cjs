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

const worker = fs.readFileSync(workerPath, 'utf8').replace(/\r\n/g, '\n');
if (!workerPattern.test(worker)) throw new Error('No se encontró la versión de la caché de MathBrain.');
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
console.log(`MathBrain PWA preparada: ${revision}`);
