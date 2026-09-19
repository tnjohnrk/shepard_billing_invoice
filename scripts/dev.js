import { spawn, execSync } from 'child_process';
import http from 'http';

const VITE_PORT = 5173;
const DEV_URL = `http://localhost:${VITE_PORT}`;

function freePort(port) {
  if (process.platform === 'win32') {
    try {
      const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf8' });
      const lines = output.trim().split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && line.includes('LISTENING')) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid !== String(process.pid)) {
            try {
              execSync(`taskkill /F /PID ${pid}`, { stdio: 'ignore' });
            } catch {}
          }
        }
      }
    } catch {}
  }
}

// Clean any stale process holding port 5173
freePort(VITE_PORT);

console.log('🚀 Starting Vite frontend development server...');
const viteProcess = spawn('npx vite --port 5173 --strictPort', {
  stdio: 'inherit',
  shell: true
});

function checkViteReady(timeout = 25000) {
  const start = Date.now();
  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const req = http.get(DEV_URL, (res) => {
        if (res.statusCode < 500) {
          resolve();
        } else {
          setTimeout(tryConnect, 300);
        }
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
      try {
        if (process.platform === 'win32') {
          execSync(`taskkill /F /T /PID ${viteProcess.pid}`, { stdio: 'ignore' });
        } else {
          viteProcess.kill();
        }
      } catch {}
      freePort(VITE_PORT);
      process.exit(code || 0);
    });
  } catch (err) {
    console.error('❌ Failed to start dev environment:', err);
    try {
      viteProcess.kill();
    } catch {}
    freePort(VITE_PORT);
    process.exit(1);
  }
}

start();

