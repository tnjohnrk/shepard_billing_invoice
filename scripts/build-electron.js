import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('🚀 Step 1: Building React Renderer with Vite...');
execSync('npx vite build', { cwd: rootDir, stdio: 'inherit' });

console.log('🔒 Step 2: Bundling & Minifying Electron Main Process with esbuild...');
const distMainDir = path.join(rootDir, 'dist', 'main');
if (!fs.existsSync(distMainDir)) {
  fs.mkdirSync(distMainDir, { recursive: true });
}

// 1. Bundle main process
execSync(
  'npx esbuild src/main/main.js --bundle --platform=node --target=node20 --format=esm --outfile=dist/main/main.js --external:electron --external:better-sqlite3 --external:nodemailer --external:adm-zip --external:electron-updater --external:exceljs --external:jszip --minify --drop:debugger',
  { cwd: rootDir, stdio: 'inherit' }
);

// 2. Bundle preload script
execSync(
  'npx esbuild src/main/preload.cjs --bundle --platform=node --target=node20 --format=cjs --outfile=dist/main/preload.cjs --external:electron --minify',
  { cwd: rootDir, stdio: 'inherit' }
);

// 3. Copy template assets to dist/main/templates/invoice
const templateSrc = path.join(rootDir, 'src', 'main', 'templates', 'invoice');
const templateDest = path.join(rootDir, 'dist', 'main', 'templates', 'invoice');
if (fs.existsSync(templateSrc)) {
  fs.mkdirSync(templateDest, { recursive: true });
  fs.cpSync(templateSrc, templateDest, { recursive: true });
}

console.log('✨ Build complete: All source code compiled and minified in dist/');
