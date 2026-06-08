const crypto = require('node:crypto');
const { getGitRoot, getGitRemoteName } = require('./git-utils');
const { loadProjectConfig } = require('./project-config');

function sha256Short(input) {
  return crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Returns the /private/sessions/<hash>/ prefix for the current project's
 * personal session documents. Consistent across sessions for the same repo.
 */
function getPersonalSessionPrefix(cwd) {
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.personalDocPath) return projectConfig.personalDocPath;

  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  const hash = sha256Short(basePath);
  return `/private/sessions/${hash}/`;
}

/**
 * Returns the /tenant/projects/<name>/ prefix for repo-level shared knowledge.
 */
function getRepoDocPrefix(cwd) {
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.repoDocPath) return projectConfig.repoDocPath;

  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  const repoName = getGitRemoteName(basePath) || basePath.split('/').pop() || 'unknown';
  const slug = slugify(repoName);
  return `/tenant/projects/${slug}/`;
}

/**
 * Returns a human-readable project name for display and tagging.
 */
function getProjectName(cwd) {
  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  return getGitRemoteName(basePath) || basePath.split('/').pop() || 'unknown';
}

/**
 * Returns the full document path for a session document.
 * sessionId is used as the filename.
 */
function getSessionDocPath(cwd, sessionId) {
  const prefix = getPersonalSessionPrefix(cwd);
  const safe = sessionId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return `${prefix}${safe}.md`;
}

module.exports = {
  sha256Short,
  slugify,
  getPersonalSessionPrefix,
  getRepoDocPrefix,
  getProjectName,
  getSessionDocPath,
};
