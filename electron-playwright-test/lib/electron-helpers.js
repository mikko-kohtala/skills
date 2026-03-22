/**
 * Electron E2E Helpers
 * Core utilities for launching and testing Electron applications
 * @module electron-helpers
 */

/**
 * @typedef {import('playwright').ElectronApplication} ElectronApplication
 * @typedef {import('playwright').Page} Page
 */

/**
 * @typedef {Object} LaunchOptions
 * @property {string} [cwd] - Working directory (app path)
 * @property {string} [executablePath] - Custom electron executable path
 * @property {Object} [env] - Additional environment variables
 * @property {number} [timeout] - Launch timeout in ms (default: 60000)
 * @property {boolean} [recordVideo] - Record video to /tmp/e2e-videos
 * @property {boolean} [skipDevServer] - Skip dev server check (default: false)
 * @property {number} [slowMo] - Slow down operations by ms (default: from SLOW_MO env)
 */

/**
 * @typedef {Object} WaitOptions
 * @property {number} [timeout] - Max wait time in ms
 * @property {string} [readySelector] - Selector to wait for (optional)
 */

const { _electron: electron } = require('playwright');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

/**
 * Default app path - uses environment variable or falls back to cwd
 * Set ELECTRON_APP_PATH environment variable to override
 */
const DEFAULT_APP_PATH = process.env.ELECTRON_APP_PATH || process.cwd();

/**
 * Default Vite dev server port
 */
const DEV_SERVER_PORT = 5173;

/**
 * Check if the dev server is running (TCP port check)
 * @param {number} port - Port to check
 * @returns {Promise<boolean>}
 */
async function isDevServerRunning(port = DEV_SERVER_PORT) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    socket.setTimeout(1000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });

    socket.connect(port, 'localhost');
  });
}

// Track spawned Vite process for cleanup
let spawnedViteProcess = null;

/**
 * Start Vite dev server directly (without electron-forge)
 * @param {string} appPath - Path to the app
 * @returns {Promise<ChildProcess>}
 */
async function startViteServer(appPath) {
  console.log('Starting Vite dev server...');

  const viteProcess = spawn('npx', ['vite', '--config', 'vite.renderer.config.mts'], {
    cwd: appPath,
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  spawnedViteProcess = viteProcess;

  // Wait for Vite to be ready (max 10s)
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 1000));
    if (await isDevServerRunning()) {
      console.log('✓ Vite dev server started on port 5173');
      return viteProcess;
    }
  }

  // Kill if failed to start
  viteProcess.kill();
  spawnedViteProcess = null;
  throw new Error('Failed to start Vite dev server within 10 seconds');
}

/**
 * Stop the spawned Vite server if we started one
 */
function stopViteServer() {
  if (spawnedViteProcess) {
    console.log('Stopping Vite dev server...');
    spawnedViteProcess.kill();
    spawnedViteProcess = null;
  }
}

/**
 * Ensure dev server is running, auto-starting if needed
 * @param {string} appPath - Path to the app
 * @param {boolean} autoStart - Auto-start Vite if not running (default: true)
 * @returns {Promise<void>}
 */
async function ensureDevServer(appPath, autoStart = true) {
  // Quick initial check
  if (await isDevServerRunning()) {
    console.log('✓ Dev server running on port 5173');
    return;
  }

  // Wait a bit in case it's just starting up
  console.log('Checking for dev server on port 5173...');
  await new Promise(r => setTimeout(r, 1000));

  if (await isDevServerRunning()) {
    console.log('✓ Dev server is ready on port 5173');
    return;
  }

  // Auto-start Vite if enabled
  if (autoStart) {
    await startViteServer(appPath);
    return;
  }

  // Not running - provide clear instructions
  throw new Error(
    '\n┌─────────────────────────────────────────────────────────┐\n' +
    '│  DEV SERVER NOT RUNNING                                 │\n' +
    '├─────────────────────────────────────────────────────────┤\n' +
    '│  The Vite dev server is required for E2E tests.        │\n' +
    '│                                                         │\n' +
    '│  Start it in another terminal:                         │\n' +
    `│    cd ${appPath}                      │\n` +
    '│    bun run dev                                         │\n' +
    '│                                                         │\n' +
    '│  Then run this test again.                             │\n' +
    '└─────────────────────────────────────────────────────────┘\n'
  );
}

/**
 * Get the Electron executable path based on platform
 */
function getElectronPath(appPath) {
  const electronPath = path.join(appPath, 'node_modules/electron/dist');

  if (process.platform === 'darwin') {
    return path.join(electronPath, 'Electron.app/Contents/MacOS/Electron');
  } else if (process.platform === 'win32') {
    return path.join(electronPath, 'electron.exe');
  }
  return path.join(electronPath, 'electron');
}

/**
 * Launch Electron app with test configuration
 * @param {LaunchOptions} [options] - Launch options
 * @returns {Promise<ElectronApplication>}
 */
async function launchApp(options = {}) {
  const appPath = options.cwd || DEFAULT_APP_PATH;

  // Ensure dev server is running (unless skipped)
  if (!options.skipDevServer) {
    await ensureDevServer(appPath);
  }

  // Support SLOW_MO environment variable for debugging
  const slowMo = options.slowMo ?? (process.env.SLOW_MO ? parseInt(process.env.SLOW_MO) : 0);

  const launchOptions = {
    executablePath: options.executablePath || getElectronPath(appPath),
    args: ['.'],
    cwd: appPath,
    env: {
      ...process.env,
      NODE_ENV: 'test',
      ELECTRON_IS_E2E_TEST: '1',
      ...options.env
    },
    timeout: options.timeout || 60000,
    ...(slowMo > 0 && { slowMo })
  };

  if (options.recordVideo) {
    launchOptions.recordVideo = {
      dir: '/tmp/e2e-videos',
      size: { width: 1280, height: 720 }
    };
  }

  console.log(`Launching Electron app from: ${appPath}`);
  const app = await electron.launch(launchOptions);
  console.log('Electron app launched successfully');

  return app;
}

/**
 * Wait for app to be fully ready (window loaded + React hydrated)
 * @param {ElectronApplication} app - Electron application
 * @param {WaitOptions} [options] - Wait options
 * @returns {Promise<Page>}
 */
async function waitForAppReady(app, options = {}) {
  const timeout = options.timeout || 15000;

  // Get the first window
  console.log('Waiting for main window...');
  const page = await app.firstWindow();

  // Wait for load state
  await page.waitForLoadState('domcontentloaded', { timeout });

  // Wait for React to hydrate - look for sidebar with data-testid
  try {
    await page.waitForSelector('[data-testid="sidebar"]', { timeout: timeout / 2 });
    console.log('App UI loaded');
  } catch (e) {
    // Fallback: try legacy selector for apps without data-testid
    try {
      await page.waitForSelector('.flex.h-screen', { timeout: 2000 });
      console.log('App UI loaded (legacy selector)');
    } catch (e2) {
      console.log('Warning: Could not detect app ready state, proceeding anyway');
    }
  }

  // If custom ready selector provided, wait for it
  if (options.readySelector) {
    await page.waitForSelector(options.readySelector, { timeout });
  }

  console.log('App is ready');
  return page;
}

/**
 * Evaluate code in the Electron main process
 * @param {ElectronApplication} app - Electron application
 * @param {Function} fn - Function to evaluate
 * @param {...any} args - Arguments to pass to function
 * @returns {Promise<any>}
 */
async function evaluateMain(app, fn, ...args) {
  return app.evaluate(fn, ...args);
}

/**
 * Get all windows in the Electron app
 * @param {ElectronApplication} app - Electron application
 * @returns {Promise<Page[]>}
 */
async function getAllWindows(app) {
  return app.windows();
}

/**
 * Take a timestamped screenshot
 * @param {Page} page - Playwright page
 * @param {string} name - Screenshot name (without extension)
 * @param {Object} options - Screenshot options
 * @returns {Promise<string>} Path to saved screenshot
 */
async function screenshot(page, name, options = {}) {
  const timestamp = Date.now();
  const filename = `/tmp/e2e-${name}-${timestamp}.png`;

  await page.screenshot({
    path: filename,
    fullPage: options.fullPage !== false,
    ...options
  });

  console.log(`Screenshot saved: ${filename}`);
  return filename;
}

/**
 * Clean shutdown of the Electron app (and Vite server if we started one)
 * @param {ElectronApplication} app - Electron application
 * @param {Object} options - Close options
 * @param {boolean} options.keepVite - Don't stop Vite server (default: false)
 */
async function closeApp(app, options = {}) {
  console.log('Closing Electron app...');
  await app.close();
  console.log('App closed');

  // Stop Vite server if we started it (unless keepVite is true)
  if (!options.keepVite) {
    stopViteServer();
  }
}

/**
 * Check if the app is packaged (production) or development
 * @param {ElectronApplication} app - Electron application
 * @returns {Promise<boolean>}
 */
async function isPackaged(app) {
  return app.evaluate(async ({ app }) => app.isPackaged);
}

/**
 * Get app version from main process
 * @param {ElectronApplication} app - Electron application
 * @returns {Promise<string>}
 */
async function getAppVersion(app) {
  return app.evaluate(async ({ app }) => app.getVersion());
}

/**
 * Set window size
 * @param {Page} page - Playwright page
 * @param {number} width - Window width
 * @param {number} height - Window height
 */
async function setWindowSize(page, width, height) {
  await page.setViewportSize({ width, height });
}

module.exports = {
  DEFAULT_APP_PATH,
  DEV_SERVER_PORT,
  getElectronPath,
  isDevServerRunning,
  startViteServer,
  stopViteServer,
  ensureDevServer,
  launchApp,
  waitForAppReady,
  evaluateMain,
  getAllWindows,
  screenshot,
  closeApp,
  isPackaged,
  getAppVersion,
  setWindowSize
};
