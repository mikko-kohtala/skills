/**
 * Test Fixtures
 * Setup and teardown helpers for E2E tests
 * @module fixtures
 */

/** @typedef {import('playwright').Page} Page */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { invokeIpc, addProject, removeProject, listProjects } = require('./ipc-helpers');

/**
 * Default test project path
 */
const TEST_PROJECT_PATH = '/tmp/e2e-test-project';

/**
 * Test tool configuration
 */
const TEST_TOOL = {
  name: 'echo-test',
  command: 'echo "Tool started" && cat',
  tag: 'test'
};

/**
 * Create a test git repository
 * @param {string} repoPath - Path to create the repo
 * @returns {string} Path to the created repo
 */
function createTestGitRepo(repoPath = TEST_PROJECT_PATH) {
  // Clean up if exists
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
  }

  // Create directory
  fs.mkdirSync(repoPath, { recursive: true });

  // Initialize git repo
  execSync('git init', { cwd: repoPath, stdio: 'pipe' });
  execSync('git config user.email "test@example.com"', { cwd: repoPath, stdio: 'pipe' });
  execSync('git config user.name "Test User"', { cwd: repoPath, stdio: 'pipe' });

  // Create initial commit
  fs.writeFileSync(path.join(repoPath, 'README.md'), '# Test Project\n');
  execSync('git add .', { cwd: repoPath, stdio: 'pipe' });
  execSync('git commit -m "Initial commit"', { cwd: repoPath, stdio: 'pipe' });

  console.log(`Test git repo created at: ${repoPath}`);
  return repoPath;
}

/**
 * Clean up test git repository
 * @param {string} repoPath - Path to the repo to clean
 */
function cleanupTestGitRepo(repoPath = TEST_PROJECT_PATH) {
  if (fs.existsSync(repoPath)) {
    fs.rmSync(repoPath, { recursive: true, force: true });
    console.log(`Test repo cleaned up: ${repoPath}`);
  }
}

/**
 * Setup a test project in the app
 * @param {Page} page - Playwright page
 * @param {Object} options - Project options
 * @param {string} options.path - Project path
 * @param {string} options.name - Project name
 * @returns {Promise<Project>} Created project
 */
async function setupTestProject(page, options = {}) {
  const projectPath = options.path || TEST_PROJECT_PATH;
  const projectName = options.name || 'E2E Test Project';

  // Create git repo if needed
  if (!fs.existsSync(projectPath)) {
    createTestGitRepo(projectPath);
  }

  // Add project via IPC
  const result = await addProject(page, {
    path: projectPath,
    name: projectName
  });

  if (!result.success) {
    throw new Error(`Failed to create test project: ${result.error}`);
  }

  console.log(`Test project created: ${result.project.name} (${result.project.id})`);
  return result.project;
}

/**
 * Setup a test tool in the app
 * @param {Page} page - Playwright page
 * @param {Object} options - Tool options
 * @returns {Promise<AiTool>} Created tool
 */
async function setupTestTool(page, options = {}) {
  const toolData = {
    name: options.name || TEST_TOOL.name,
    command: options.command || TEST_TOOL.command,
    tag: options.tag || TEST_TOOL.tag
  };

  const result = await invokeIpc(page, 'tool:add', toolData);

  if (!result.success) {
    throw new Error(`Failed to create test tool: ${result.error}`);
  }

  console.log(`Test tool created: ${result.tool.name} (${result.tool.id})`);
  return result.tool;
}

/**
 * Clean up all test data from the app
 * @param {Page} page - Playwright page
 */
async function cleanupTestData(page) {
  console.log('Cleaning up test data...');

  // Remove test projects
  const projects = await listProjects(page);
  for (const project of projects) {
    if (project.name.includes('Test') || project.name.includes('E2E') ||
        project.path.includes('/tmp/')) {
      await removeProject(page, project.id);
      console.log(`  Removed project: ${project.name}`);
    }
  }

  // Remove test tools
  const tools = await invokeIpc(page, 'tool:list');
  for (const tool of tools) {
    if (tool.name.includes('test') || tool.name.includes('Test')) {
      await invokeIpc(page, 'tool:remove', tool.id);
      console.log(`  Removed tool: ${tool.name}`);
    }
  }

  // Clean up test git repos
  cleanupTestGitRepo(TEST_PROJECT_PATH);

  console.log('Cleanup complete');
}

/**
 * Run a test with automatic setup and cleanup
 * @param {Page} page - Playwright page
 * @param {Function} testFn - Test function receiving { project, tool }
 */
async function withTestProject(page, testFn) {
  let project = null;
  let tool = null;

  try {
    // Setup
    project = await setupTestProject(page);
    tool = await setupTestTool(page);

    // Run test
    await testFn({ project, tool });

  } finally {
    // Cleanup
    await cleanupTestData(page);
  }
}

/**
 * Assert helper for IPC results
 * @param {Object} result - IPC result with success field
 * @param {string} operation - Operation name for error message
 */
function assertSuccess(result, operation) {
  if (!result.success) {
    throw new Error(`${operation} failed: ${result.error || 'Unknown error'}`);
  }
}

/**
 * Wait and retry helper
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.retries - Max retries (default: 3)
 * @param {number} options.delay - Delay between retries in ms (default: 1000)
 */
async function retry(fn, options = {}) {
  const retries = options.retries || 3;
  const delay = options.delay || 1000;
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < retries - 1) {
        console.log(`Retry ${i + 1}/${retries} failed, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

module.exports = {
  TEST_PROJECT_PATH,
  TEST_TOOL,
  createTestGitRepo,
  cleanupTestGitRepo,
  setupTestProject,
  setupTestTool,
  cleanupTestData,
  withTestProject,
  assertSuccess,
  retry
};
