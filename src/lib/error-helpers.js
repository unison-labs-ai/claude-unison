/**
 * Map a BrainApiError (or any Error) to a concise, actionable message.
 *
 * @param {Error & { status?: number, code?: string }} err
 * @returns {string}
 */
function getUserFriendlyError(err) {
  const status = err?.status;
  const code = err?.code;

  if (code === 'unauthenticated' || status === 401) {
    return 'Authentication failed — your UNISON_TOKEN may be expired or revoked. Run `/claude-unison:auth` to re-authenticate.';
  }
  if (code === 'forbidden' || status === 403) {
    return 'Permission denied — your token may lack the required scope. Check your token at https://app.unisonlabs.ai.';
  }
  if (code === 'not_found' || status === 404) {
    return 'Not found — no brain document exists at this path yet.';
  }
  if (code === 'invalid_path' || status === 400) {
    return 'Invalid path — brain document paths must end in .md and start with /private/, /tenant/, or /teams/<slug>/.';
  }
  if (code === 'rate_limited' || status === 429) {
    return 'Rate limited — too many requests. Will retry next session.';
  }
  if (typeof status === 'number' && status >= 500) {
    return 'Unison brain service is temporarily unavailable. Will retry next session.';
  }

  return err?.message || 'Unknown error';
}

/**
 * Is this error expected / harmless (no data yet, transient network)?
 *
 * @param {Error & { status?: number, code?: string }} err
 * @returns {boolean}
 */
function isBenignError(err) {
  const status = err?.status;
  const code = err?.code;
  if (code === 'not_found' || status === 404) return true;
  if (status === undefined || status === null) return true;
  return false;
}

/**
 * Is this error retryable?
 *
 * @param {Error & { status?: number }} err
 * @returns {boolean}
 */
function isRetryableError(err) {
  const status = err?.status;
  if (status === 429) return true;
  if (typeof status === 'number' && status >= 500) return true;
  if (status === undefined || status === null) return true;
  return false;
}

module.exports = { getUserFriendlyError, isBenignError, isRetryableError };
