const { BrainClient } = require('./lib/brain-client');
const { getSessionDocPath, getProjectName } = require('./lib/doc-path');
const { loadSettings, getToken, debugLog, getSignalConfig } = require('./lib/settings');
const { readStdin, writeOutput } = require('./lib/stdin');
const { formatNewEntries, formatSignalEntries } = require('./lib/transcript-formatter');
const { getUserFriendlyError } = require('./lib/error-helpers');
const { saveLastSession } = require('./lib/last-session');

async function main() {
  const settings = loadSettings();

  try {
    const input = await readStdin();
    const cwd = input.cwd || process.cwd();
    const sessionId = input.session_id;
    const transcriptPath = input.transcript_path;

    debugLog(settings, 'Stop', { sessionId, transcriptPath });

    if (!transcriptPath || !sessionId) {
      debugLog(settings, 'Missing transcript path or session id');
      writeOutput({ continue: true });
      return;
    }

    let token;
    try {
      token = getToken(settings, cwd);
    } catch {
      writeOutput({ continue: true });
      return;
    }

    const signalConfig = getSignalConfig(cwd);
    const useSignalExtraction = signalConfig.enabled;

    debugLog(settings, 'Signal extraction', { enabled: useSignalExtraction });

    let formatted;
    if (useSignalExtraction) {
      formatted = formatSignalEntries(transcriptPath, sessionId, cwd);
      debugLog(settings, 'Signal extraction result', { hasContent: !!formatted });
    } else {
      formatted = formatNewEntries(transcriptPath, sessionId, cwd);
    }

    if (!formatted) {
      debugLog(settings, 'No new content to save');
      writeOutput({ continue: true });
      return;
    }

    const baseUrl = process.env.UNISON_API_URL || 'https://api.unisonlabs.ai';
    const client = new BrainClient({ token, baseUrl });

    const projectName = getProjectName(cwd);
    const docPath = getSessionDocPath(cwd, sessionId);

    const title = `Session: ${projectName} — ${new Date().toISOString().split('T')[0]}`;
    const tags = ['session', 'claude-code', projectName];

    // Try to patch an existing doc or write a new one
    let written = false;
    try {
      // Check if a doc already exists for this session
      const existing = await client.getDoc(docPath);
      if (existing) {
        // Append new content via PATCH — find the end of the doc and append
        const currentBody = existing.body || '';
        const newBody = `${currentBody}\n\n---\n\n${formatted}`;
        await client.writeDoc({
          path: docPath,
          bodyMd: newBody,
          kind: 'note',
          title,
          tags,
        });
        written = true;
      }
    } catch (err) {
      if (err.code !== 'not_found' && err.status !== 404) {
        throw err;
      }
    }

    if (!written) {
      const heading = `# ${title}\n\nProject: ${projectName}  \nDate: ${new Date().toISOString()}  \nSession: ${sessionId}\n\n---\n\n`;
      await client.writeDoc({
        path: docPath,
        bodyMd: heading + formatted,
        kind: 'note',
        title,
        tags,
        visibility: 'private',
      });
    }

    saveLastSession({ docPath, projectName });

    debugLog(settings, 'Session saved', { docPath, length: formatted.length });
    writeOutput({ continue: true });
  } catch (err) {
    const friendly = getUserFriendlyError(err);
    debugLog(settings, 'Error', { error: friendly });
    console.error(`Unison: ${friendly}`);
    writeOutput({ continue: true });
  }
}

main().catch((err) => {
  console.error(`Unison fatal: ${err.message}`);
  process.exit(1);
});
