const { BrainClient } = require('./lib/brain-client');
const { getPersonalSessionPrefix, getRepoDocPrefix, getProjectName } = require('./lib/doc-path');
const { loadSettings, getToken, debugLog } = require('./lib/settings');
const { readStdin, writeOutput } = require('./lib/stdin');
const { formatSearchContext, combineContexts } = require('./lib/format-context');
const { getUserFriendlyError, isBenignError } = require('./lib/error-helpers');

async function main() {
  const settings = loadSettings();

  try {
    const input = await readStdin();
    const cwd = input.cwd || process.cwd();
    const projectName = getProjectName(cwd);

    debugLog(settings, 'SessionStart', { cwd, projectName });

    let token;
    try {
      token = getToken(settings, cwd);
    } catch {
      writeOutput({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: `<unison-status>
Unison brain is not authenticated.
Set UNISON_TOKEN=usk_... in your environment, or run /claude-unison:auth to authenticate.
Memory recall is disabled for this session.
</unison-status>`,
        },
      });
      return;
    }

    const baseUrl = process.env.UNISON_API_URL || 'https://api.unisonlabs.ai';
    const client = new BrainClient({ token, baseUrl });

    const personalPrefix = getPersonalSessionPrefix(cwd);
    const repoPrefix = getRepoDocPrefix(cwd);

    debugLog(settings, 'Searching brain', { personalPrefix, repoPrefix, projectName });

    const apiErrors = [];

    const handleSearchError = (label) => (err) => {
      if (isBenignError(err)) {
        debugLog(settings, `Benign error fetching ${label} context`, {
          status: err.status,
          message: err.message,
        });
        return null;
      }
      const friendly = getUserFriendlyError(err);
      debugLog(settings, `Error fetching ${label} context`, {
        status: err.status,
        message: friendly,
      });
      apiErrors.push(friendly);
      return null;
    };

    const shouldInject = settings.injectProfile !== false;

    if (!shouldInject) {
      writeOutput({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext: '',
        },
      });
      return;
    }

    const [personalResult, repoResult] = await Promise.all([
      client
        .search(projectName, {
          k: settings.maxSearchResults || 5,
          kind: ['note', 'wiki_page'],
        })
        .then((r) => r.results || [])
        .catch(handleSearchError('personal')),
      client
        .listDocs({ prefix: repoPrefix, limit: settings.maxSearchResults || 5 })
        .then((r) => {
          // Map listDocs response into search-result shape for formatting
          return (r.documents || []).map((doc) => ({ doc, score: 1 }));
        })
        .catch(handleSearchError('repo')),
    ]);

    const personalContext =
      personalResult && personalResult.length > 0
        ? formatSearchContext(personalResult, settings.maxSearchResults || 5, false)
        : null;

    const repoContext =
      repoResult && repoResult.length > 0
        ? formatSearchContext(repoResult, settings.maxSearchResults || 5, false)
        : null;

    const additionalContext = combineContexts([
      { label: '### Personal Memories', content: personalContext },
      { label: '### Project Knowledge (Shared across team)', content: repoContext },
    ]);

    const errorNotice =
      apiErrors.length > 0
        ? `<unison-status>\n${[...new Set(apiErrors)].join('\n')}\n</unison-status>\n`
        : '';

    if (!additionalContext) {
      writeOutput({
        hookSpecificOutput: {
          hookEventName: 'SessionStart',
          additionalContext:
            apiErrors.length > 0
              ? errorNotice
              : `<unison-context>
No previous memories found for project: ${projectName}.
Memories will be saved as you work.
</unison-context>`,
        },
      });
      return;
    }

    debugLog(settings, 'Context generated', {
      length: additionalContext.length,
      hasPersonal: !!personalContext,
      hasRepo: !!repoContext,
    });

    writeOutput({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: errorNotice + additionalContext,
      },
    });
  } catch (err) {
    const friendly = getUserFriendlyError(err);
    debugLog(settings, 'Error', { error: friendly });
    console.error(`Unison: ${friendly}`);
    writeOutput({
      hookSpecificOutput: {
        hookEventName: 'SessionStart',
        additionalContext: `<unison-status>
Failed to load memories: ${friendly}
Session will continue without memory context.
</unison-status>`,
      },
    });
  }
}

main().catch((err) => {
  console.error(`Unison fatal: ${err.message}`);
  process.exit(1);
});
