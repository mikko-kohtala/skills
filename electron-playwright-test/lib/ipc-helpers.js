/**
 * IPC Testing Helpers
 * Utilities for testing Electron IPC communication
 * @module ipc-helpers
 */

/** @typedef {import('playwright').Page} Page */

/**
 * Invoke an IPC handler from the renderer context
 * @param {Page} page - Playwright page
 * @param {string} channel - IPC channel (e.g., 'project:list', 'workspace:create')
 * @param {...any} args - Arguments to pass to the IPC handler
 * @returns {Promise<any>} - Result from the IPC handler
 */
async function invokeIpc(page, channel, ...args) {
  return page.evaluate(async ({ channel, args }) => {
    // Parse the channel to navigate the electronAPI object
    // e.g., 'project:list' -> window.electronAPI.project.list()
    // e.g., 'workspace:spawnTool' -> window.electronAPI.workspace.spawnTool()
    const parts = channel.split(':');

    if (parts.length !== 2) {
      throw new Error(`Invalid channel format: ${channel}. Expected 'namespace:method'`);
    }

    const [namespace, method] = parts;
    const api = window.electronAPI[namespace];

    if (!api) {
      throw new Error(`Unknown IPC namespace: ${namespace}`);
    }

    const fn = api[method];
    if (typeof fn !== 'function') {
      throw new Error(`Unknown IPC method: ${channel}`);
    }

    return fn(...args);
  }, { channel, args });
}

// =============================================================================
// Project Shortcuts
// =============================================================================

/**
 * List all projects
 * @param {Page} page - Playwright page
 * @returns {Promise<Project[]>}
 */
async function listProjects(page) {
  return invokeIpc(page, 'project:list');
}

/**
 * Get a specific project by ID
 * @param {Page} page - Playwright page
 * @param {string} projectId - Project ID
 * @returns {Promise<Project|undefined>}
 */
async function getProject(page, projectId) {
  return invokeIpc(page, 'project:get', projectId);
}

/**
 * Add a new project
 * @param {Page} page - Playwright page
 * @param {Object} data - Project data
 * @param {string} data.path - Project path
 * @param {string} data.name - Project name
 * @returns {Promise<{success: boolean, project?: Project, error?: string}>}
 */
async function addProject(page, data) {
  return invokeIpc(page, 'project:add', data);
}

/**
 * Remove a project
 * @param {Page} page - Playwright page
 * @param {string} projectId - Project ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function removeProject(page, projectId) {
  return invokeIpc(page, 'project:remove', projectId);
}

// =============================================================================
// Workspace Shortcuts
// =============================================================================

/**
 * List all workspaces
 * @param {Page} page - Playwright page
 * @returns {Promise<Workspace[]>}
 */
async function listWorkspaces(page) {
  return invokeIpc(page, 'workspace:list');
}

/**
 * Get a specific workspace by ID
 * @param {Page} page - Playwright page
 * @param {string} workspaceId - Workspace ID
 * @returns {Promise<Workspace|undefined>}
 */
async function getWorkspace(page, workspaceId) {
  return invokeIpc(page, 'workspace:get', workspaceId);
}

/**
 * Create a new workspace
 * @param {Page} page - Playwright page
 * @param {Object} data - Workspace data
 * @param {string} data.projectId - Project ID
 * @param {string} data.definitionId - Workspace definition ID
 * @returns {Promise<{success: boolean, workspace?: Workspace, error?: string}>}
 */
async function createWorkspace(page, data) {
  return invokeIpc(page, 'workspace:create', data);
}

/**
 * Delete a workspace
 * @param {Page} page - Playwright page
 * @param {string} workspaceId - Workspace ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function deleteWorkspace(page, workspaceId) {
  return invokeIpc(page, 'workspace:delete', workspaceId);
}

/**
 * Spawn a tool terminal in workspace
 * @param {Page} page - Playwright page
 * @param {string} workspaceId - Workspace ID
 * @param {string} toolId - Tool ID
 * @returns {Promise<{success: boolean, terminal?: Terminal, error?: string}>}
 */
async function spawnTool(page, workspaceId, toolId) {
  return invokeIpc(page, 'workspace:spawnTool', workspaceId, toolId);
}

/**
 * Spawn a shell terminal in workspace
 * @param {Page} page - Playwright page
 * @param {string} workspaceId - Workspace ID
 * @param {string} cwd - Optional working directory
 * @returns {Promise<{success: boolean, terminal?: Terminal, error?: string}>}
 */
async function spawnShell(page, workspaceId, cwd) {
  return invokeIpc(page, 'workspace:spawnShell', workspaceId, cwd);
}

// =============================================================================
// Tool Shortcuts
// =============================================================================

/**
 * List all AI tools
 * @param {Page} page - Playwright page
 * @returns {Promise<AiTool[]>}
 */
async function listTools(page) {
  return invokeIpc(page, 'tool:list');
}

/**
 * Add a new AI tool
 * @param {Page} page - Playwright page
 * @param {Object} data - Tool data
 * @param {string} data.name - Tool name
 * @param {string} data.command - Tool command
 * @param {string} data.tag - Optional tag
 * @returns {Promise<{success: boolean, tool?: AiTool, error?: string}>}
 */
async function addTool(page, data) {
  return invokeIpc(page, 'tool:add', data);
}

/**
 * Remove an AI tool
 * @param {Page} page - Playwright page
 * @param {string} toolId - Tool ID
 * @returns {Promise<{success: boolean, error?: string}>}
 */
async function removeTool(page, toolId) {
  return invokeIpc(page, 'tool:remove', toolId);
}

// =============================================================================
// Workspace Definition Shortcuts
// =============================================================================

/**
 * List workspace definitions
 * @param {Page} page - Playwright page
 * @param {string} projectId - Optional project ID filter
 * @returns {Promise<WorkspaceDefinition[]>}
 */
async function listWorkspaceDefinitions(page, projectId) {
  return invokeIpc(page, 'workspaceDefinition:list', projectId);
}

/**
 * Create a workspace definition
 * @param {Page} page - Playwright page
 * @param {Object} data - Definition data
 * @param {string} data.projectId - Project ID
 * @param {string} data.name - Definition name
 * @returns {Promise<{success: boolean, definition?: WorkspaceDefinition, error?: string}>}
 */
async function createWorkspaceDefinition(page, data) {
  return invokeIpc(page, 'workspaceDefinition:create', data);
}

// =============================================================================
// Broadcast Shortcuts
// =============================================================================

/**
 * Send a broadcast message to terminals
 * @param {Page} page - Playwright page
 * @param {string} workspaceId - Workspace ID
 * @param {Object} request - Broadcast request
 * @param {string} request.content - Message content
 * @param {string[]} request.targetTags - Target tags (empty for all)
 * @returns {Promise<{success: boolean, sentCount: number, error?: string}>}
 */
async function sendBroadcast(page, workspaceId, request) {
  return invokeIpc(page, 'broadcast:send', workspaceId, request);
}

module.exports = {
  invokeIpc,
  // Project
  listProjects,
  getProject,
  addProject,
  removeProject,
  // Workspace
  listWorkspaces,
  getWorkspace,
  createWorkspace,
  deleteWorkspace,
  spawnTool,
  spawnShell,
  // Tool
  listTools,
  addTool,
  removeTool,
  // Workspace Definition
  listWorkspaceDefinitions,
  createWorkspaceDefinition,
  // Broadcast
  sendBroadcast
};
