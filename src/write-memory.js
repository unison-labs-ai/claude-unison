const { BrainClient } = require('./lib/brain-client');
const { getPersonalSessionPrefix, getProjectName, sha256Short } = require('./lib/doc-path');
const { loadSettings, getToken } = require('./lib/settings');
const { getUserFriendlyError } = require('./lib/error-helpers');

async function main() {
  const content = process.argv.slice(2).join(' ');

  if (!content?.trim()) {
    console.log('No content provided. Usage: node write-memory.cjs "content to save"');
    return;
  }

  const settings = loadSettings();

  let token;
  try {
    token = getToken(settings);
  } catch {
    console.log('Unison brain token not configured.');
    console.log('Set UNISON_TOKEN=usk_... in your environment.');
    return;
  }

  const cwd = process.cwd();
  const prefix = getPersonalSessionPrefix(cwd);
  const projectName = getProjectName(cwd);
  const slug = sha256Short(`manual-${Date.now()}`);
  const docPath = `${prefix}manual-${slug}.md`;

  const baseUrl = process.env.UNISON_API_URL || 'https://brain.unisonlabs.ai';
  const client = new BrainClient({ token, baseUrl });

  try {
    const title = `Note: ${projectName} — ${new Date().toISOString().split('T')[0]}`;
    const bodyMd = `# ${title}\n\nProject: ${projectName}  \nSaved: ${new Date().toISOString()}\n\n---\n\n${content}`;

    await client.writeDoc({
      path: docPath,
      bodyMd,
      kind: 'note',
      title,
      tags: ['manual', 'claude-code', projectName],
      visibility: 'private',
    });

    console.log(`Memory saved to project: ${projectName}`);
    console.log(`Path: ${docPath}`);
  } catch (err) {
    console.log(`Error saving memory: ${getUserFriendlyError(err)}`);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
