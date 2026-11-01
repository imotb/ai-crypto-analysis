/* fetch with timeout — fixes the "hung request freezes pipeline" bug. */

export class HttpError extends Error {
  constructor(status, message, body) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export async function fetchJson(url, { timeoutMs = 10000, headers, ...init } = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...init,
      headers: { Accept: 'application/json', ...headers },
      signal: ctrl.signal,
    });
    if (!res.ok) {
      let body = '';
      try { body = await res.text(); } catch { /* ignore */ }
      throw new HttpError(res.status, `HTTP ${res.status} ${res.statusText}`, body);
    }
    /* Captive portals, rate-limit pages and proxies return HTTP 200 with an HTML
       body; a bare res.json() then throws SyntaxError and the caller reports a
       mysterious "no data" instead of a real HTTP error. */
    try {
      return await res.json();
    } catch {
      throw new HttpError(res.status, 'HTTP 200 with non-JSON response body', '');
    }
  } finally {
    clearTimeout(timer);
  }
}
