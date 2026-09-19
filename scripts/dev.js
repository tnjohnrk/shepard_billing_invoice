import { spawn } from 'child_process';
import http from 'http';

const VITE_PORT = 5173;
const DEV_URL = `http://localhost:${VITE_PORT}`;

console.log('🚀 Starting Vite frontend development server...');
const viteProcess = spawn('npx vite', {
  stdio: 'inherit',
  shell: true
});

function checkViteReady(timeout = 20000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const req = http.get(DEV_URL, () => {
        resolve();
      });
      req.on('error', () => {
        if (Date.now() - start > timeout) {
          reject(new Error('Timed out waiting for Vite dev server'));
        } else {
          setTimeout(tryConnect, 300);
        }
      });
    };
    tryConnect();
  });
}

async function start() {
  try {
    await checkViteReady();
    console.log('⚡ Vite dev server is ready! Launching Electron...');

    const electronProcess = spawn('npx electron .', {
      stdio: 'inherit',
      shell: true
    });

    electronProcess.on('close', (code) => {
      console.log('🛑 Electron window closed. Stopping Vite...');
      viteProcess.kill();
      process.exit(code || 0);
    });
  } catch (err) {
    console.error('❌ Failed to start dev environment:', err);
    viteProcess.kill();
    process.exit(1);
  }
}

start();
