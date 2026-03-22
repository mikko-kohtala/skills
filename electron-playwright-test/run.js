#!/usr/bin/env node
/**
 * Universal Electron E2E Executor for Claude Code
 *
 * Executes Playwright Electron automation code from:
 * - File path: node run.js script.js
 * - Inline code: node run.js 'await page.click(...)'
 * - Stdin: cat script.js | node run.js
 *
 * Ensures proper module resolution by running from skill directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Save original CWD before changing to skill directory
const originalCwd = process.cwd();

// Skill directory path (useful for documentation)
const SKILL_DIR = __dirname;

// Track current temp file for cleanup
let currentTempFile = null;

// Change to skill directory for proper module resolution
process.chdir(__dirname);

// Cleanup temp file on exit (handles crashes and normal exit)
process.on('exit', () => {
  if (currentTempFile && fs.existsSync(currentTempFile)) {
    try {
      fs.unlinkSync(currentTempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
});

// Handle SIGINT (Ctrl+C) and SIGTERM
['SIGINT', 'SIGTERM'].forEach(signal => {
  process.on(signal, () => {
    process.exit(0);
  });
});

/**
 * Check if Playwright is installed
 */
function checkPlaywrightInstalled() {
  try {
    require.resolve('playwright');
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Install Playwright if missing
 */
function installPlaywright() {
  console.log('📦 Playwright not found. Installing...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
    execSync('npx playwright install chromium', { stdio: 'inherit', cwd: __dirname });
    console.log('✅ Playwright installed successfully');
    return true;
  } catch (e) {
    console.error('❌ Failed to install Playwright:', e.message);
    console.error('Please run manually: cd', __dirname, '&& npm run setup');
    return false;
  }
}

/**
 * Get code to execute from various sources
 */
function getCodeToExecute() {
  const args = process.argv.slice(2);

  // Case 1: File path provided
  if (args.length > 0 && fs.existsSync(args[0])) {
    const filePath = path.resolve(args[0]);
    console.log(`📄 Executing file: ${filePath}`);
    return fs.readFileSync(filePath, 'utf8');
  }

  // Case 2: Inline code provided as argument
  if (args.length > 0) {
    console.log('⚡ Executing inline code');
    return args.join(' ');
  }

  // Case 3: Code from stdin
  if (!process.stdin.isTTY) {
    console.log('📥 Reading from stdin');
    return fs.readFileSync(0, 'utf8');
  }

  // No input
  console.error('❌ No code to execute');
  console.error('Usage:');
  console.error('  node run.js script.js          # Execute file');
  console.error('  node run.js "code here"        # Execute inline');
  console.error('  cat script.js | node run.js    # Execute from stdin');
  process.exit(1);
}

/**
 * Clean up old temporary execution files from previous runs
 */
function cleanupOldTempFiles() {
  try {
    const files = fs.readdirSync(__dirname);
    const tempFiles = files.filter(f => f.startsWith('.temp-execution-') && f.endsWith('.js'));

    if (tempFiles.length > 0) {
      tempFiles.forEach(file => {
        const filePath = path.join(__dirname, file);
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          // Ignore errors - file might be in use or already deleted
        }
      });
    }
  } catch (e) {
    // Ignore directory read errors
  }
}

/**
 * Wrap code in async IIFE if not already wrapped
 */
function wrapCodeIfNeeded(code) {
  // Check if code already has require() and async structure
  const hasRequire = code.includes('require(');
  const hasAsyncIIFE = code.includes('(async () => {') || code.includes('(async()=>{');

  // If it's already a complete script, return as-is
  if (hasRequire && hasAsyncIIFE) {
    return code;
  }

  // If it's just Electron/Playwright commands, wrap in full template
  if (!hasRequire) {
    return `
const { _electron: electron } = require('playwright');
const electronHelpers = require('./lib/electron-helpers');
const ipcHelpers = require('./lib/ipc-helpers');
const terminalHelpers = require('./lib/terminal-helpers');
const fixtures = require('./lib/fixtures');

(async () => {
  try {
    ${code}
  } catch (error) {
    console.error('Automation error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
`;
  }

  // If has require but no async wrapper
  if (!hasAsyncIIFE) {
    return `
(async () => {
  try {
    ${code}
  } catch (error) {
    console.error('Automation error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
})();
`;
  }

  return code;
}

/**
 * Main execution
 */
async function main() {
  console.log('🖥️  Electron E2E Skill - Universal Executor');
  console.log(`📁 Skill directory: ${SKILL_DIR}\n`);

  // Clean up old temp files from previous runs (belt and suspenders)
  cleanupOldTempFiles();

  // Check Playwright installation
  if (!checkPlaywrightInstalled()) {
    const installed = installPlaywright();
    if (!installed) {
      process.exit(1);
    }
  }

  // Get code to execute
  const rawCode = getCodeToExecute();
  const code = wrapCodeIfNeeded(rawCode);

  // Create temporary file for execution
  currentTempFile = path.join(__dirname, `.temp-execution-${Date.now()}.js`);

  try {
    // Write code to temp file
    fs.writeFileSync(currentTempFile, code, 'utf8');

    // Execute the code
    console.log('🚀 Starting Electron automation...\n');
    require(currentTempFile);

    // Temp file will be cleaned up on process exit via the exit handler

  } catch (error) {
    console.error('❌ Execution failed:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Run main function
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});
