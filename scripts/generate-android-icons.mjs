import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(process.cwd());
const source = path.join(root, 'icon.png');
const resRoot = path.join(root, 'android', 'app', 'src', 'main', 'res');

const legacySizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

const foregroundSizes = {
  'mipmap-mdpi': 108,
  'mipmap-hdpi': 162,
  'mipmap-xhdpi': 216,
  'mipmap-xxhdpi': 324,
  'mipmap-xxxhdpi': 432,
};

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writePng(outPath, size) {
  await ensureDir(path.dirname(outPath));
  await sharp(source)
    .resize(size, size, { fit: 'cover', position: 'centre' })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
}

async function main() {
  if (!(await fileExists(source))) {
    throw new Error(`Source icon not found: ${source}`);
  }

  // Legacy + round icons
  for (const [dir, size] of Object.entries(legacySizes)) {
    const base = path.join(resRoot, dir);
    await writePng(path.join(base, 'ic_launcher.png'), size);
    await writePng(path.join(base, 'ic_launcher_round.png'), size);
  }

  // Adaptive foreground icons
  for (const [dir, size] of Object.entries(foregroundSizes)) {
    const base = path.join(resRoot, dir);
    await writePng(path.join(base, 'ic_launcher_foreground.png'), size);
  }

  process.stdout.write('Android launcher icons generated from icon.png\n');
}

await main();
