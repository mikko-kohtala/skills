---
name: electron-playwright-test
description: "Use this skill to E2E test Electron applications with Playwright. Helps verify UI changes, test IPC communication, and validate terminal interactions. Use when user wants to test the app after changes, verify agent work, or run E2E tests."
version: 1.0.0
author: Mikko Kohtala
tags: [electron, e2e, playwright, testing]
---

**Path Resolution:**
When you run the skill, it outputs its directory path. Use that path in subsequent commands. The skill auto-detects its location - no manual path substitution needed.

# Electron E2E Testing

E2E testing skill for Electron apps using Playwright's experimental Electron support. Designed for testing the multi-ai-app but works with any Electron application.

**Use this skill when:**
- User asks to "test the app" or "verify changes"
- User wants to verify agent work after code changes
- Testing terminal interactions, IPC handlers, or UI flows
- Taking screenshots to verify app state

## How It Works

1. Write test code to `/tmp/electron-test-*.js`
2. Execute via: `cd $SKILL_DIR && node run.js /tmp/electron-test-*.js`
3. Playwright launches the Electron app
4. Test interacts with windows and IPC handlers
5. Results displayed in real-time

## Prerequisites

The skill will **auto-start** the Vite dev server if it's not running. No manual setup required!

If you prefer to run the dev server manually (for faster test cycles):
```bash
# In a separate terminal:
cd /Users/mikko/code/multi-ai-app
bun run dev
```

The skill checks port 5173 and auto-starts Vite when needed, then cleans up after tests.

## Setup (First Time)

```bash
cd $SKILL_DIR
npm run setup
```

This installs Playwright and Chromium browser. Only needed once.

## Quick Verification Pattern

The most common use case - verify app works after changes:

```javascript
// /tmp/electron-test-verify.js
const { launchApp, waitForAppReady, screenshot, closeApp } = require('./lib/electron-helpers');

(async () => {
  const app = await launchApp();
  const page = await waitForAppReady(app);

  // Take screenshot of current state
  await screenshot(page, 'app-state');

  // Basic checks
  const title = await page.title();
  console.log('Window title:', title);

  // Check sidebar is visible (uses data-testid for stability)
  const sidebar = await page.locator('[data-testid="sidebar"]');
  if (await sidebar.isVisible()) {
    console.log('Sidebar is visible');
  }

  await closeApp(app);
  console.log('Verification complete!');
})();
```

Execute:
```bash
cd $SKILL_DIR && node run.js /tmp/electron-test-verify.js
```

## Available Helpers

### electron-helpers.js
```javascript
const {
  launchApp,        // Launch Electron app
  waitForAppReady,  // Wait for window + React hydration
  screenshot,       // Take timestamped screenshot to /tmp
  closeApp,         // Clean shutdown
  evaluateMain,     // Run code in main process
  setWindowSize     // Resize window
} = require('./lib/electron-helpers');
```

### ipc-helpers.js
```javascript
const {
  invokeIpc,        // Generic IPC call: invokeIpc(page, 'project:list')
  listProjects,     // Shortcut for project:list
  addProject,       // Add a project
  removeProject,    // Remove a project
  listWorkspaces,   // List workspaces
  createWorkspace,  // Create workspace
  spawnTool,        // Spawn AI tool terminal
  spawnShell,       // Spawn shell terminal
  listTools,        // List AI tools
  sendBroadcast     // Send broadcast message
} = require('./lib/ipc-helpers');
```

### terminal-helpers.js
```javascript
const {
  getTerminalOutput,       // Get terminal buffer content
  writeToTerminal,         // Write text to terminal
  waitForTerminalOutput,   // Wait for pattern in output
  waitForShellPrompt,      // Wait for shell prompt ($)
  runCommand,              // Run command and wait for completion
  captureTerminalScreenshot // Screenshot terminal canvas
} = require('./lib/terminal-helpers');
```

### fixtures.js
```javascript
const {
  createTestGitRepo,   // Create temp git repo for testing
  setupTestProject,    // Add test project to app
  setupTestTool,       // Add test tool to app
  cleanupTestData,     // Remove all test data
  withTestProject      // Run test with auto setup/cleanup
} = require('./lib/fixtures');
```

## Common Test Patterns

### Test Project CRUD

```javascript
// /tmp/electron-test-project.js
const { launchApp, waitForAppReady, closeApp } = require('./lib/electron-helpers');
const { listProjects, addProject, removeProject } = require('./lib/ipc-helpers');
const { createTestGitRepo, cleanupTestGitRepo } = require('./lib/fixtures');

(async () => {
  const app = await launchApp();
  const page = await waitForAppReady(app);

  // Create test repo
  const repoPath = '/tmp/test-project';
  createTestGitRepo(repoPath);

  // Add project
  const addResult = await addProject(page, {
    path: repoPath,
    name: 'Test Project'
  });
  console.log('Add result:', addResult);

  // List projects
  const projects = await listProjects(page);
  console.log('Projects:', projects.map(p => p.name));

  // Remove project
  if (addResult.success) {
    await removeProject(page, addResult.project.id);
    console.log('Project removed');
  }

  // Cleanup
  cleanupTestGitRepo(repoPath);
  await closeApp(app);
})();
```

### Test Terminal Flow

```javascript
// /tmp/electron-test-terminal.js
const { launchApp, waitForAppReady, closeApp } = require('./lib/electron-helpers');
const { spawnShell, listWorkspaces, createWorkspace, listWorkspaceDefinitions } = require('./lib/ipc-helpers');
const { waitForShellPrompt, runCommand, getTerminalOutput } = require('./lib/terminal-helpers');
const { setupTestProject, cleanupTestData } = require('./lib/fixtures');

(async () => {
  const app = await launchApp();
  const page = await waitForAppReady(app);

  try {
    // Setup test project
    const project = await setupTestProject(page);
    console.log('Created project:', project.name);

    // Get workspace definition
    const definitions = await listWorkspaceDefinitions(page, project.id);
    const definition = definitions[0];
    console.log('Using definition:', definition.name);

    // Create workspace
    const wsResult = await createWorkspace(page, {
      projectId: project.id,
      definitionId: definition.id
    });
    console.log('Created workspace:', wsResult.workspace?.id);

    // Spawn shell
    const shellResult = await spawnShell(page, wsResult.workspace.id);
    console.log('Spawned shell:', shellResult.terminal?.sessionId);

    if (shellResult.success) {
      const sessionId = shellResult.terminal.sessionId;

      // Wait for prompt
      await waitForShellPrompt(page, sessionId);
      console.log('Shell is ready');

      // Run a command
      await runCommand(page, sessionId, 'echo "Hello from E2E test"');

      // Check output
      const output = await getTerminalOutput(page, sessionId);
      if (output.includes('Hello from E2E test')) {
        console.log('Terminal test passed!');
      }
    }

  } finally {
    await cleanupTestData(page);
    await closeApp(app);
  }
})();
```

### Test IPC Handler

```javascript
// /tmp/electron-test-ipc.js
const { launchApp, waitForAppReady, closeApp } = require('./lib/electron-helpers');
const { invokeIpc } = require('./lib/ipc-helpers');

(async () => {
  const app = await launchApp();
  const page = await waitForAppReady(app);

  // Test various IPC handlers
  const projects = await invokeIpc(page, 'project:list');
  console.log('Projects count:', projects.length);

  const tools = await invokeIpc(page, 'tool:list');
  console.log('Tools count:', tools.length);

  const templates = await invokeIpc(page, 'template:list');
  console.log('Templates count:', templates.length);

  const gitCheck = await invokeIpc(page, 'worktree:checkGit');
  console.log('Git installed:', gitCheck.installed);

  await closeApp(app);
  console.log('IPC tests complete!');
})();
```

### Test UI Interaction

```javascript
// /tmp/electron-test-ui.js
const { launchApp, waitForAppReady, screenshot, closeApp } = require('./lib/electron-helpers');

(async () => {
  const app = await launchApp();
  const page = await waitForAppReady(app);

  // Screenshot initial state
  await screenshot(page, 'initial');

  // Click on sidebar item (if projects exist)
  const projectItem = page.locator('[class*="hover:bg"]').first();
  if (await projectItem.isVisible()) {
    await projectItem.click();
    await page.waitForTimeout(500);
    await screenshot(page, 'after-click');
  }

  // Check for specific elements (prefer data-testid when available)
  const elements = {
    sidebar: await page.locator('[data-testid="sidebar"]').isVisible(),
    mainArea: await page.locator('.flex-1').first().isVisible(),
  };
  console.log('Visible elements:', elements);

  await closeApp(app);
})();
```

### Full Flow with Cleanup

```javascript
// /tmp/electron-test-full.js
const { launchApp, waitForAppReady, screenshot, closeApp } = require('./lib/electron-helpers');
const { withTestProject } = require('./lib/fixtures');
const { createWorkspace, spawnShell, listWorkspaceDefinitions } = require('./lib/ipc-helpers');
const { waitForShellPrompt, runCommand } = require('./lib/terminal-helpers');

(async () => {
  const app = await launchApp();
  const page = await waitForAppReady(app);

  await withTestProject(page, async ({ project, tool }) => {
    console.log('Testing with project:', project.name);

    // Get default workspace definition
    const defs = await listWorkspaceDefinitions(page, project.id);
    const ws = await createWorkspace(page, {
      projectId: project.id,
      definitionId: defs[0].id
    });

    // Spawn shell and run command
    const shell = await spawnShell(page, ws.workspace.id);
    await waitForShellPrompt(page, shell.terminal.sessionId);
    await runCommand(page, shell.terminal.sessionId, 'pwd');

    await screenshot(page, 'test-complete');
    console.log('Full flow test passed!');
  });

  await closeApp(app);
})();
```

## Tips

- **Always use /tmp for test files** - Write scripts to `/tmp/electron-test-*.js`
- **Clean up test data** - Use `cleanupTestData()` or `withTestProject()` wrapper
- **Terminal testing** - ghostty-web renders to canvas, use `getTerminalOutput()` via IPC
- **Take screenshots** - `screenshot(page, 'name')` saves to `/tmp/e2e-name-{timestamp}.png`
- **Use fixtures** - `setupTestProject()` creates a test git repo automatically
- **Prefer data-testid** - Use `[data-testid="sidebar"]` instead of CSS classes for stability
- **Set app path** - Set `ELECTRON_APP_PATH` env var or pass `cwd` option to `launchApp()`

## Troubleshooting

**Vite auto-start taking too long:**
- The skill auto-starts Vite within 10 seconds
- If it times out, try running `bun run dev` manually in another terminal

**"Dev server not running" error:**
- This only happens if auto-start is disabled or fails
- Start `bun run dev` in a separate terminal as a fallback

**App doesn't launch:**
- Ensure multi-ai-app dependencies are installed: `cd /Users/mikko/code/multi-ai-app && bun install`
- Check Electron is available in node_modules

**Playwright not installed:**
```bash
cd $SKILL_DIR && npm run setup
```

**Terminal output empty:**
- Wait longer for shell to initialize: `waitForShellPrompt(page, sessionId, { timeout: 15000 })`
- Check session ID is valid

**Test data not cleaning up:**
- Call `cleanupTestData(page)` explicitly
- Or use `withTestProject()` wrapper which handles cleanup automatically
