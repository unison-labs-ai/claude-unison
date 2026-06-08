const CONTEXT_INTRO =
  'The following is recalled context from the Unison brain. Reference it only when relevant to the conversation.';
const CONTEXT_DISCLAIMER =
  "Use these memories naturally when relevant — including indirect connections — but don't force them into every response or make assumptions beyond what's stated.";

function formatRelativeTime(isoTimestamp) {
  try {
    const dt = new Date(isoTimestamp);
    const now = new Date();
    const seconds = (now.getTime() - dt.getTime()) / 1000;
    const minutes = seconds / 60;
    const hours = seconds / 3600;
    const days = seconds / 86400;

    if (minutes < 30) return 'just now';
    if (minutes < 60) return `${Math.floor(minutes)}mins ago`;
    if (hours < 24) return `${Math.floor(hours)}hrs ago`;
    if (days < 7) return `${Math.floor(days)}d ago`;

    const month = dt.toLocaleString('en', { month: 'short' });
    if (dt.getFullYear() === now.getFullYear()) {
      return `${dt.getDate()} ${month}`;
    }
    return `${dt.getDate()} ${month}, ${dt.getFullYear()}`;
  } catch {
    return '';
  }
}

/**
 * Format brain search results into a context block.
 *
 * @param {Array<{doc: {title?: string, tldr?: string}, score: number, highlight?: string}>} results
 * @param {number} maxResults
 * @param {boolean} wrapWithTags
 */
function formatSearchContext(results, maxResults = 10, wrapWithTags = true) {
  if (!results || results.length === 0) return null;

  const items = results.slice(0, maxResults).map((r) => {
    const doc = r.doc || {};
    const title = doc.title || doc.path || '';
    const summary = r.highlight || doc.tldr || '';
    const pct = r.score != null ? `[${Math.round(r.score * 100)}%]` : '';
    const parts = [title, summary].filter(Boolean).join(' — ');
    return `- ${parts} ${pct}`.trim();
  });

  const content = `## Recent Memories\n${items.join('\n')}`;

  if (!wrapWithTags) return content;

  return `<unison-context>\n${CONTEXT_INTRO}\n\n${content}\n\n${CONTEXT_DISCLAIMER}\n</unison-context>`;
}

/**
 * Combine multiple context sections.
 */
function combineContexts(contexts) {
  const valid = contexts.filter((c) => c.content);
  if (valid.length === 0) return null;

  const sections = valid.map((c) => (c.label ? `${c.label}\n\n${c.content}` : c.content));

  return `<unison-context>\n${CONTEXT_INTRO}\n\n${sections.join('\n\n---\n\n')}\n\n${CONTEXT_DISCLAIMER}\n</unison-context>`;
}

/**
 * Format search results for CLI output.
 */
function formatSearchResults(query, results, label) {
  const header = label ? `${label} memories for "${query}"` : `Memories for "${query}"`;

  if (!results || results.length === 0) {
    return `No ${label ? `${label.toLowerCase()} ` : ''}memories found for "${query}"`;
  }

  const lines = results.map((r) => {
    const doc = r.doc || {};
    const title = doc.title || doc.path || '';
    const summary = r.highlight || doc.tldr || '';
    const pct = r.score != null ? `[${Math.round(r.score * 100)}%]` : '';
    const text = [title, summary].filter(Boolean).join(' — ');
    return `${text} ${pct}`.trim();
  });

  return `${header}\n${lines.join('\n')}`;
}

module.exports = {
  formatRelativeTime,
  formatSearchContext,
  combineContexts,
  formatSearchResults,
};
