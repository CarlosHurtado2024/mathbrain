// Comprueba la sintaxis de todo el JavaScript de src/ y scripts/ sin ejecutarlo.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const folders = ['src', 'scripts'];
let checked = 0;
for (const folder of folders) {
  for (const entry of fs.readdirSync(path.join(root, folder), { recursive: true })) {
    if (!/\.c?js$/.test(entry) || entry.includes('vendor')) continue;
    const filename = path.join(root, folder, entry);
    const code = fs.readFileSync(filename, 'utf8').replace(/^#!.*/, '');
    // Los .cjs se envuelven como módulos de Node para admitir require y return de nivel superior.
    new vm.Script(filename.endsWith('.cjs') ? `(function (exports, require, module, __filename, __dirname) {${code}\n})` : code, { filename });
    checked++;
  }
}
console.log(`Sintaxis correcta en ${checked} archivos.`);
