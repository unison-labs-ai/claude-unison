const DEFAULT_BASE_URL = 'https://api.unisonlabs.ai';

function stripTrailingSlash(url) {
  return url.replace(/\/+$/, '');
}

class BrainApiError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'BrainApiError';
    this.status = status;
    this.code = code;
  }
}

class BrainClient {
  constructor({ token, baseUrl } = {}) {
    if (!token) throw new Error('UNISON_TOKEN is required');
    this.token = token;
    this.baseUrl = stripTrailingSlash(baseUrl || DEFAULT_BASE_URL);
  }

  async _request(method, path, { params, body } = {}) {
    let url = `${this.baseUrl}/v1${path}`;

    if (params) {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          for (const v of value) qs.append(key, String(v));
        } else {
          qs.set(key, String(value));
        }
      }
      const s = qs.toString();
      if (s) url += `?${s}`;
    }

    const headers = {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      'X-Source': 'claude-unison',
    };

    const init = { method, headers };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      const errPayload = typeof data === 'object' ? data : {};
      const code = errPayload?.error?.code || 'unknown';
      const msg = errPayload?.error?.message || res.statusText;
      throw new BrainApiError(res.status, code, msg);
    }

    return data;
  }

  // Auth
  async whoami() {
    return this._request('GET', '/auth/whoami');
  }

  // Search
  async search(q, { k = 10, kind, tag, memoryType, asOf } = {}) {
    return this._request('GET', '/brain/search', {
      params: { q, k, kind, tag, memoryType, asOf },
    });
  }

  // Document CRUD
  async getDoc(path) {
    return this._request('GET', '/brain/doc', { params: { path } });
  }

  async writeDoc({
    path,
    bodyMd,
    kind,
    title,
    tldr,
    tags,
    visibility,
    expectedContentHash,
    source,
  }) {
    return this._request('PUT', '/brain/doc', {
      body: { path, bodyMd, kind, title, tldr, tags, visibility, expectedContentHash, source },
    });
  }

  async editDoc({ path, oldStr, newStr, expectedContentHash }) {
    return this._request('PATCH', '/brain/doc', {
      body: { path, oldStr, newStr, expectedContentHash },
    });
  }

  async deleteDoc(path) {
    return this._request('DELETE', '/brain/doc', { params: { path } });
  }

  async listDocs({ prefix, kind, tag, limit } = {}) {
    return this._request('GET', '/brain/list', {
      params: { prefix, kind, tag, limit },
    });
  }

  // Status
  async status() {
    return this._request('GET', '/brain/status');
  }
}

module.exports = { BrainClient, BrainApiError };
