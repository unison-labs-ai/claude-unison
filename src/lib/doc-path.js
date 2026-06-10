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
 * Returns the /private/notes/ root; the hash is embedded in each document
 * slug rather than used as a subfolder, so all session docs land at the
 * flat /private/notes/<slug>.md level required by the brain FS contract.
 *
 * The returned value is still a "prefix" string — callers append their
 * per-document discriminator to it via getSessionDocPath().
 */
function getPersonalSessionPrefix(cwd) {
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.personalDocPath) return projectConfig.personalDocPath;

  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  const hash = sha256Short(basePath);
  // Embed hash in slug prefix; no subfolder.
  return `/private/notes/session-${hash}-`;
}

/**
 * Returns the /tenant/projects/ root with the repo name embedded in the
 * slug prefix. Documents land at /tenant/projects/<reponame>-<slug>.md —
 * a single slug segment as required by the brain FS contract.
 */
function getRepoDocPrefix(cwd) {
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.repoDocPath) return projectConfig.repoDocPath;

  const gitRoot = getGitRoot(cwd);
  const basePath = gitRoot || cwd;
  const repoName = getGitRemoteName(basePath) || basePath.split('/').pop() || 'unknown';
  const slug = slugify(repoName);
  return `/tenant/projects/${slug}-`;
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
 * sessionId is used as the filename suffix; the project hash is already
 * embedded in the prefix so the full slug is session-<hash>-<sessionId>.md.
 */
function getSessionDocPath(cwd, sessionId) {
  const prefix = getPersonalSessionPrefix(cwd);
  const safe = sessionId.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
