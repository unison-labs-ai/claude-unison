const { BrainClient } = require('./lib/brain-client');
const { getPersonalSessionPrefix, getRepoDocPrefix, getProjectName } = require('./lib/doc-path');
const { loadSettings, getToken } = require('./lib/settings');
const { formatSearchResults } = require('./lib/format-context');
const { getUserFriendlyError } = require('./lib/error-helpers');

function parseArgs(args) {
  let scope = 'both';
  const queryParts = [];

  for (const arg of args) {
    if (arg === '--personal') {
      scope = 'personal';
    } else if (arg === '--repo') {
      scope = 'repo';
    } else if (arg === '--both') {
      scope = 'both';
    } else {
      queryParts.push(arg);
    }
  }

  return { scope, query: queryParts.join(' ') };
}

async function main() {
  const { scope, query } = parseArgs(process.argv.slice(2));

  if (!query?.trim()) {
    console.log('No search query provided. Please specify what you want to search for.');
    return;
  }

  const settings = loadSettings();

  let token;
  try {
    token = getToken(settings);
  } catch {
    console.log('Unison brain token not configured.');
    console.log('Set UNISON_TOKEN=usk_... in your environment to enable memory search.');
    console.log('Or run /claude-unison:auth to authenticate interactively.');
    return;
  }

  const cwd = process.cwd();
  const projectName = getProjectName(cwd);
  const personalPrefix = getPersonalSessionPrefix(cwd);
  const repoPrefix = getRepoDocPrefix(cwd);

  const baseUrl = process.env.UNISON_API_URL || 'https://api.unisonlabs.ai';
  const client = new BrainClient({ token, baseUrl });

  console.log(`Project: ${projectName}\n`);

  try {
    if (scope === 'both') {
      const searchResult = await client.search(query, { k: 10 }).catch(() => ({ results: [] }));
      const allResults = searchResult.results || [];

      // Session docs for this project
      const personalHits = allResults.filter((r) => r.doc?.path?.startsWith(personalPrefix));
      // Project knowledge docs
      const repoHits = allResults.filter((r) => r.doc?.path?.startsWith(repoPrefix));

      if (personalHits.length > 0) {
        console.log(formatSearchResults(query, personalHits, 'Personal'));
      }
      if (repoHits.length > 0) {
        if (personalHits.length > 0) console.log('');
        console.log(formatSearchResults(query, repoHits, 'Project'));
      }
      if (personalHits.length === 0 && repoHits.length === 0) {
        // Fall back to showing all results when no prefix-filtered hits
        if (allResults.length > 0) {
          console.log(formatSearchResults(query, allResults, 'Brain'));
        } else {
          console.log(`No memories found for "${query}"`);
        }
      }
    } else {
      const prefix = scope === 'personal' ? personalPrefix : repoPrefix;
      const label = scope === 'personal' ? 'Personal' : 'Project';
      const searchResult = await client.search(query, { k: 10 });
      const hits = (searchResult.results || []).filter((r) => r.doc?.path?.startsWith(prefix));
      if (hits.length > 0) {
        console.log(formatSearchResults(query, hits, label));
      } else {
        console.log(formatSearchResults(query, searchResult.results || [], label));
      }
    }
  } catch (err) {
    console.log(`Error searching memories: ${getUserFriendlyError(err)}`);
  }
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(1);
});
