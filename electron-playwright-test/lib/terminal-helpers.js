/**
 * Terminal Testing Helpers
 * Utilities for testing WASM terminal (ghostty-web) interactions
 * @module terminal-helpers
 *
 * NOTE: ghostty-web renders to <canvas>, so we can't inspect DOM text directly.
 * Instead, we use the output buffer IPC to get terminal content.
 */

/** @typedef {import('playwright').Page} Page */

const { invokeIpc } = require('./ipc-helpers');

/**
 * Get terminal output from the output buffer
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @param {number} lastNBytes - Number of bytes to retrieve (default: 8192)
 * @returns {Promise<string>} Terminal output
 */
async function getTerminalOutput(page, sessionId, lastNBytes = 8192) {
  return invokeIpc(page, 'terminal:getOutput', sessionId, lastNBytes);
}

/**
 * Write text to a terminal
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @param {string} text - Text to write (include \n for enter)
 */
async function writeToTerminal(page, sessionId, text) {
  await invokeIpc(page, 'terminal:write', sessionId, text);
}

/**
 * Wait for terminal output to match a pattern
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @param {string|RegExp} pattern - Pattern to match
 * @param {Object} options - Wait options
 * @param {number} options.timeout - Max wait time in ms (default: 10000)
 * @param {number} options.interval - Poll interval in ms (default: 200)
 * @returns {Promise<string>} Matching terminal output
 */
async function waitForTerminalOutput(page, sessionId, pattern, options = {}) {
  const timeout = options.timeout || 10000;
  const interval = options.interval || 200;
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const output = await getTerminalOutput(page, sessionId);

    const matches = pattern instanceof RegExp
      ? pattern.test(output)
      : output.includes(pattern);

    if (matches) {
      return output;
    }

    await page.waitForTimeout(interval);
  }

  // Get final output for error message
  const finalOutput = await getTerminalOutput(page, sessionId);
  throw new Error(
    `Terminal output did not match pattern "${pattern}" within ${timeout}ms.\n` +
    `Last output (last 500 chars): ${finalOutput.slice(-500)}`
  );
}

/**
 * Wait for terminal to show a shell prompt
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @param {Object} options - Wait options
 * @returns {Promise<string>} Terminal output
 */
async function waitForShellPrompt(page, sessionId, options = {}) {
  // Common shell prompt patterns
  const promptPattern = /[$#%>]\s*$/;
  return waitForTerminalOutput(page, sessionId, promptPattern, {
    timeout: options.timeout || 10000,
    ...options
  });
}

/**
 * Run a command in terminal and wait for completion
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @param {string} command - Command to run
 * @param {Object} options - Options
 * @param {number} options.timeout - Max wait time for command output
 * @param {string|RegExp} options.waitFor - Pattern to wait for after command
 * @returns {Promise<string>} Terminal output after command
 */
async function runCommand(page, sessionId, command, options = {}) {
  // Write the command
  await writeToTerminal(page, sessionId, command + '\n');

  // Wait for expected output or shell prompt
  const waitFor = options.waitFor || /[$#%>]\s*$/;

  // Add small delay to allow command to start
  await page.waitForTimeout(100);

  return waitForTerminalOutput(page, sessionId, waitFor, {
    timeout: options.timeout || 10000
  });
}

/**
 * Capture terminal screenshot (visual fallback for canvas content)
 * @param {Page} page - Playwright page
 * @param {string} containerSelector - Terminal container selector
 * @param {string} name - Screenshot name
 * @returns {Promise<string>} Path to saved screenshot
 */
async function captureTerminalScreenshot(page, containerSelector, name) {
  const container = page.locator(containerSelector);
  const timestamp = Date.now();
  const filename = `/tmp/terminal-${name}-${timestamp}.png`;

  await container.screenshot({ path: filename });
  console.log(`Terminal screenshot saved: ${filename}`);

  return filename;
}

/**
 * Resize terminal
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @param {number} cols - Number of columns
 * @param {number} rows - Number of rows
 */
async function resizeTerminal(page, sessionId, cols, rows) {
  await invokeIpc(page, 'terminal:resize', sessionId, cols, rows);
}

/**
 * Kill a terminal session
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 * @returns {Promise<{success: boolean}>}
 */
async function killTerminal(page, sessionId) {
  return invokeIpc(page, 'terminal:kill', sessionId);
}

/**
 * Clear terminal output by sending clear command
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 */
async function clearTerminal(page, sessionId) {
  await writeToTerminal(page, sessionId, 'clear\n');
  await page.waitForTimeout(100);
}

/**
 * Send Ctrl+C to terminal
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 */
async function sendCtrlC(page, sessionId) {
  await writeToTerminal(page, sessionId, '\x03'); // ETX character (Ctrl+C)
}

/**
 * Send Ctrl+D to terminal (EOF)
 * @param {Page} page - Playwright page
 * @param {string} sessionId - Terminal session ID
 */
async function sendCtrlD(page, sessionId) {
  await writeToTerminal(page, sessionId, '\x04'); // EOT character (Ctrl+D)
}

module.exports = {
  getTerminalOutput,
  writeToTerminal,
  waitForTerminalOutput,
  waitForShellPrompt,
  runCommand,
  captureTerminalScreenshot,
  resizeTerminal,
  killTerminal,
  clearTerminal,
  sendCtrlC,
  sendCtrlD
};
