const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { loadCredentials } = require('./auth');
const { loadProjectConfig } = require('./project-config');

const SETTINGS_DIR = path.join(os.homedir(), '.unison-claude');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');

const DEFAULT_SETTINGS = {
  maxSearchResults: 5,
  debug: false,
  signalExtraction: false,
  signalKeywords: [
    'remember',
    'implementation',
    'refactor',
    'architecture',
    'decision',
    'important',
    'bug',
    'fix',
    'solved',
    'solution',
    'pattern',
    'approach',
    'design',
    'tradeoff',
    'migrate',
    'upgrade',
    'deprecate',
  ],
  signalTurnsBefore: 3,
  includeTools: [],
};

function ensureSettingsDir() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

function loadSettings() {
  const settings = { ...DEFAULT_SETTINGS };
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      Object.assign(settings, JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8')));
    }
  } catch (err) {
    console.error(`Unison: Failed to load settings: ${err.message}`);
  }
  if (process.env.UNISON_TOKEN) settings.token = process.env.UNISON_TOKEN;
  if (process.env.UNISON_DEBUG === 'true') settings.debug = true;
  return settings;
}

function saveSettings(settings) {
  ensureSettingsDir();
  const toSave = { ...settings };
  delete toSave.token;
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(toSave, null, 2));
}

function getToken(settings, cwd) {
  // Priority: env var > global settings > project config > credentials file
  if (process.env.UNISON_TOKEN) return process.env.UNISON_TOKEN;
  if (settings.token) return settings.token;

  const projectConfig = loadProjectConfig(cwd || process.cwd());
  if (projectConfig?.apiToken) return projectConfig.apiToken;

  const credentials = loadCredentials();
  if (credentials?.token) return credentials.token;

  throw new Error('NO_TOKEN');
}

function debugLog(settings, message, data) {
  if (settings.debug) {
    const ts = new Date().toISOString();
    console.error(
      data ? `[${ts}] unison: ${message}: ${JSON.stringify(data)}` : `[${ts}] unison: ${message}`,
    );
  }
}

function getSignalConfig(cwd) {
  const settings = loadSettings();
  const projectConfig = loadProjectConfig(cwd || process.cwd());

  const globalEnabled = settings.signalExtraction || false;
  const projectEnabled = projectConfig?.signalExtraction;
  const enabled = projectEnabled !== undefined ? projectEnabled : globalEnabled;

  const globalKeywords = settings.signalKeywords || DEFAULT_SETTINGS.signalKeywords;
  const projectKeywords = projectConfig?.signalKeywords || [];
  const keywords = [...new Set([...globalKeywords, ...projectKeywords])].map((k) =>
    k.toLowerCase(),
  );

  const turnsBefore =
    projectConfig?.signalTurnsBefore ||
    settings.signalTurnsBefore ||
    DEFAULT_SETTINGS.signalTurnsBefore;

  return { enabled, keywords, turnsBefore };
}

function getIncludeTools(cwd) {
  const settings = loadSettings();
  const projectConfig = loadProjectConfig(cwd || process.cwd());
  const globalInclude = settings.includeTools || [];
  const projectInclude = projectConfig?.includeTools || [];
  return [...new Set([...globalInclude, ...projectInclude])].map((t) => t.toLowerCase());
}

function shouldIncludeTool(toolName, includeList) {
  if (includeList.length === 0) return false;
  return includeList.includes(toolName.toLowerCase());
}

module.exports = {
  SETTINGS_DIR,
  SETTINGS_FILE,
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  getToken,
  debugLog,
  getSignalConfig,
  getIncludeTools,
  shouldIncludeTool,
};
