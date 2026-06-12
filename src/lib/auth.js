const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const readline = require('node:readline');

const SETTINGS_DIR = path.join(os.homedir(), '.unison-claude');
const CREDENTIALS_FILE = path.join(SETTINGS_DIR, 'credentials.json');

const API_BASE_URL = process.env.UNISON_API_URL
  ? process.env.UNISON_API_URL.replace(/\/+$/, '')
  : 'https://brain.unisonlabs.ai';

function ensureDir() {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

function loadCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const data = JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
      if (data.token) return data;
    }
  } catch {}
  return null;
}

function saveCredentials(token, email) {
  ensureDir();
  const data = {
    token,
    email: email || null,
    savedAt: new Date().toISOString(),
  };
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2));
}

function clearCredentials() {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) fs.unlinkSync(CREDENTIALS_FILE);
  } catch {}
}

/**
 * POST /v1/auth/provision — creates an unverified account.
 * Returns { apiKey, tenantId, status, emailSent } or throws on 409 (email_registered).
 */
async function provision(email) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/provision`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || res.statusText);
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

/**
 * POST /v1/auth/request-key — triggers OTP for an existing verified account.
 */
async function requestKey(email) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/request-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || res.statusText);
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

/**
 * POST /v1/auth/verify — verifies OTP. Returns { verified, apiKey?, tenantId }.
 */
async function verify(email, code) {
  const res = await fetch(`${API_BASE_URL}/v1/auth/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || res.statusText);
    err.status = res.status;
    err.code = data?.error?.code;
    throw err;
  }
  return data;
}

/**
 * Interactive headless auth flow via stdin prompts.
 * Called when no token is found and a TTY is available.
 */
async function interactiveAuthFlow() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stderr,
    terminal: false,
  });

  const ask = (prompt) =>
    new Promise((resolve) => {
      process.stderr.write(prompt);
      rl.once('line', (line) => resolve(line.trim()));
    });

  try {
    const email = await ask('Unison brain: Enter your email to authenticate: ');
    if (!email) throw new Error('No email provided');

    let token;

    try {
      const provisionResult = await provision(email);
      // New account — token is already usable (unverified)
      token = provisionResult.apiKey;
      process.stderr.write(
        'Unison brain: Account created. Check your email for a verification code.\n',
      );
      process.stderr.write(
        'Verifying your account makes it permanent (unverified accounts expire in 72h).\n',
      );
    } catch (err) {
      if (err.code === 'email_registered') {
        // Existing account — request a recovery key
        await requestKey(email);
        process.stderr.write('Unison brain: Check your email for a verification code.\n');
      } else {
        throw err;
      }
    }

    const code = await ask('Enter the 6-digit OTP from your email: ');
    if (!code) throw new Error('No OTP provided');

    const verifyResult = await verify(email, code);

    // On first verify of a new account, we already have token from provision.
    // On recovery (existing account), verify returns a fresh apiKey.
    if (verifyResult.apiKey) {
      token = verifyResult.apiKey;
    }

    if (!token) throw new Error('No token received from Unison brain');

    saveCredentials(token, email);
    process.stderr.write('Unison brain: Authenticated successfully.\n');
    return token;
  } finally {
    rl.close();
  }
}

module.exports = {
  SETTINGS_DIR,
  CREDENTIALS_FILE,
  API_BASE_URL,
  loadCredentials,
  saveCredentials,
  clearCredentials,
  provision,
  requestKey,
  verify,
  interactiveAuthFlow,
};
