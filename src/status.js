const os = require('node:os');
const { CREDENTIALS_FILE, loadCredentials } = require('./lib/auth');
const { SETTINGS_FILE, loadSettings } = require('./lib/settings');
const { getConfigPath, loadProjectConfig } = require('./lib/project-config');
const { getProjectName } = require('./lib/doc-path');
const { BrainClient } = require('./lib/brain-client');

function maskToken(token) {
  if (!token) return 'not set';
  if (token.length <= 12) return `${token.slice(0, 6)}... masked`;
  return `${token.slice(0, 10)}...${token.slice(-4)} masked`;
}

function displayPath(filePath) {
  if (!filePath) return 'not found';
  const home = os.homedir();
  return filePath.startsWith(`${home}/`) ? `~/${filePath.slice(home.length + 1)}` : filePath;
}

function resolveToken(cwd) {
  const envToken = process.env.UNISON_TOKEN;
  if (envToken) {
    return { token: envToken, source: 'UNISON_TOKEN environment variable' };
  }

  const settings = loadSettings();
  if (settings.token) {
    return { token: settings.token, source: SETTINGS_FILE };
  }

  const projectConfigPath = getConfigPath(cwd);
  const projectConfig = loadProjectConfig(cwd);
  if (projectConfig?.apiToken) {
    return { token: projectConfig.apiToken, source: projectConfigPath };
  }

  const credentials = loadCredentials();
  if (credentials?.token) {
    return { token: credentials.token, source: CREDENTIALS_FILE };
  }

  return { token: null, source: null };
}

async function main() {
  const cwd = process.cwd();
  const projectName = getProjectName(cwd);
  const { token, source } = resolveToken(cwd);

  const isTokenSet = token?.startsWith('usk_');
  const statusLabel = isTokenSet ? 'connected' : 'not authenticated';

  console.log(`Unison brain is ${statusLabel}.`);
  console.log('');
  console.log('Status:');
  console.log(`  Project:      ${projectName}`);
  console.log(`  Token source: ${displayPath(source)}`);
  console.log(`  Token:        ${maskToken(token)}`);

  if (isTokenSet) {
    const baseUrl = process.env.UNISON_API_URL || 'https://brain.unisonlabs.ai';
    const client = new BrainClient({ token, baseUrl });
    try {
      const whoami = await client.whoami();
      const user = whoami.user || {};
      const tenant = whoami.tenant || {};
      const scopes = (whoami.scopes || []).join(', ');
      console.log('');
      console.log('Brain connection:');
      console.log(`  Email:    ${user.email || 'unknown'}`);
      console.log(`  Tenant:   ${tenant.name || tenant.id || 'unknown'}`);
      console.log(`  Verified: ${tenant.verified ? 'yes' : 'no (verify via /claude-unison:auth)'}`);
      console.log(`  Scopes:   ${scopes}`);
    } catch (err) {
      console.log('');
      console.log(`  Brain API: unreachable (${err.message})`);
    }
  } else {
    console.log('');
    console.log('To authenticate:');
    console.log('  Run /claude-unison:auth inside Claude Code');
    console.log('  Or set UNISON_TOKEN=usk_... in your environment');
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
