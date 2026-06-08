const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const SETTINGS_DIR = path.join(os.homedir(), '.unison-claude');
const LAST_SESSION_FILE = path.join(SETTINGS_DIR, 'last-session.json');

function ensureDir() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

function saveLastSession({ docPath, projectName }) {
  if (!docPath) return;
  ensureDir();
  const data = {
    docPath,
    projectName: projectName || null,
    savedAt: new Date().toISOString(),
  };
  fs.writeFileSync(LAST_SESSION_FILE, JSON.stringify(data, null, 2));
}

function loadLastSession() {
  try {
    if (fs.existsSync(LAST_SESSION_FILE)) {
      return JSON.parse(fs.readFileSync(LAST_SESSION_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

module.exports = { saveLastSession, loadLastSession, LAST_SESSION_FILE };
