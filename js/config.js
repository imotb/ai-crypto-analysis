/* API-key storage: the "OpenRouter API Key" input field is the single source of
   truth, persisted in localStorage. Never hardcode keys in shipped files —
   anything in JS on a public page (GitHub Pages) is readable by anyone. */

const LS_KEY = 'openrouter_api_key';
/* Kept separate from LS_KEY: the Jina search key is optional and must never be
   read or written by the OpenRouter code path. */
const LS_SEARCH_KEY = 'websearch_api_key';
const LS_THEME = 'theme';
const LS_LANG = 'lang';

/* Safari Private Browsing, "block all cookies" and enterprise policy can make
   localStorage throw on *access*. These helpers run at module scope in main.js,
   so an uncaught throw there aborts module evaluation and the app never boots. */
function read(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}

function write(key, value) {
  try {
    if (value == null || value === '') localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch { /* storage unavailable — keep running in memory only */ }
}

export function loadApiKey() {
  return read(LS_KEY) || '';
}

export function saveApiKey(key) { write(LS_KEY, key); }

export function loadWebSearchKey() {
  return read(LS_SEARCH_KEY) || '';
}

export function saveWebSearchKey(key) { write(LS_SEARCH_KEY, key); }

export function loadTheme() {
  try {
    return read(LS_THEME)
      || (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  } catch {
    return 'dark';
  }
}

export function saveTheme(t) { write(LS_THEME, t); }

export function loadLang() { return read(LS_LANG) || 'fa'; }
export function saveLang(l) { write(LS_LANG, l); }
