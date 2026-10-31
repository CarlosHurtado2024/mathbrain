const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const iconDirectory = path.join(__dirname, '..', 'src', 'assets', 'icons');

async function generateIcons() {
  const source = await fs.readFile(path.join(iconDirectory, 'app-icon.svg'), 'utf8');
  const variants = [
    { name: 'icon-192.png', size: 192, scale: 3.8 },
    { name: 'icon-512.png', size: 512, scale: 3.8 },
    { name: 'icon-maskable-512.png', size: 512, scale: 3.3 },
    { name: 'apple-touch-icon.png', size: 180, scale: 3.8 },
  ];

  for (const variant of variants) {
    const svg = source.replace('scale(3.8)', `scale(${variant.scale})`);
    const target = path.join(iconDirectory, variant.name);
    await sharp(Buffer.from(svg)).resize(variant.size, variant.size).removeAlpha().png().toFile(target);
    const metadata = await sharp(target).metadata();
    if (metadata.width !== variant.size || metadata.height !== variant.size || metadata.hasAlpha) {
      throw new Error(`El icono ${variant.name} tiene dimensiones o transparencia inesperadas.`);
    }
    console.log(`${variant.name}: ${metadata.width} × ${metadata.height}, opaco`);
  }
}

generateIcons().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
