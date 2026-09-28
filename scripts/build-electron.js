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

// 3. Copy template assets to dist/main/templates/invoice and dist/main/
const templateSrc = path.join(rootDir, 'src', 'main', 'templates', 'invoice');
const templateDest = path.join(rootDir, 'dist', 'main', 'templates', 'invoice');
if (fs.existsSync(templateSrc)) {
  fs.mkdirSync(templateDest, { recursive: true });
  fs.cpSync(templateSrc, templateDest, { recursive: true });
  // Also copy directly to dist/main/ for flat bundled access
  fs.cpSync(templateSrc, distMainDir, { recursive: true });
  // Also copy to root dist/templates/invoice
  const rootTemplateDest = path.join(rootDir, 'dist', 'templates', 'invoice');
  fs.mkdirSync(rootTemplateDest, { recursive: true });
  fs.cpSync(templateSrc, rootTemplateDest, { recursive: true });
}

// 4. Copy renderer image assets to dist/renderer/assets & dist/main/
const rendererAssetsSrc = path.join(rootDir, 'src', 'renderer', 'assets');
const rendererAssetsDest = path.join(rootDir, 'dist', 'renderer', 'assets');
if (fs.existsSync(rendererAssetsSrc)) {
  fs.mkdirSync(rendererAssetsDest, { recursive: true });
  fs.cpSync(rendererAssetsSrc, rendererAssetsDest, { recursive: true });
  fs.cpSync(rendererAssetsSrc, distMainDir, { recursive: true });
}

console.log('✨ Build complete: All source code compiled and minified in dist/');
