/* Live web search via Jina (s.jina.ai), restricted to three official finance
   sources, always US region + English.

   This module imports nothing from the other data services on purpose: a search
   failure, timeout or bad key must never reach the Binance/CoinGecko/
   CoinPaprika/OpenRouter path. It follows blockchain.js' non-fatal contract —
   across the module boundary these functions never throw; they return [] or a
   { ok:false } result. The API key is a runtime parameter only and is never
   echoed into a returned object or a console line. */

const ENDPOINT = 'https://s.jina.ai/';
/* Longer than http.js' 10 s default: Jina answers a real query in ~1.2–1.6 s but
   the whole card is lost if one of the three queries is cut off at 10 s. */
const TIMEOUT_MS = 15000;
/* 5 per query, not 2: the allowlist filter discards many raw candidates and a
   query bills a flat ~10,000 tokens whatever num says, so asking for less only
   starves the card. */
const NUM_RESULTS = 5;
const SNIPPET_LIMIT = 300;
const PER_SOURCE_LIMIT = 3;
const TOTAL_LIMIT = 9;

/* Tokenized stocks trade on crypto rails, but users need the REAL equity pages
   (Yahoo/Barchart/Perplexity list the underlying, not the token). An explicit map
   beats a "strip trailing X" heuristic: TTWO has no X, and future xStocks could
   break that pattern silently. Keys are catalog tickers. */
const TOKENIZED_STOCKS = {
  GOOGLX: 'GOOGL', NVDAX: 'NVDA', AAPLX: 'AAPL', TSLAX: 'TSLA', CRCLX: 'CRCL',
  MSTRX: 'MSTR',  SPYX: 'SPY',  METAX: 'META', CSCOX: 'CSCO', AVGOX: 'AVGO',
  CRWDX: 'CRWD',  AMZNX: 'AMZN', TTWO: 'TTWO',
};

/* Per-source symbol formats are verified against the live URLs: Yahoo pages are
   /quote/BNB-USD/, Barchart crypto pages are /crypto/quotes/^BNBUSD, Perplexity
   finance pages are /finance/BNBUSD. */
const QUERIES = [
  { source: 'yahoo', build: t => `site:finance.yahoo.com/quote ${t}-USD price` },
  { source: 'barchart', build: t => `site:www.barchart.com/crypto/quotes ${t}USD technical opinion` },
  { source: 'perplexity', build: t => `site:www.perplexity.ai/finance ${t}USD forecast news` },
];

/* Stock pages carry the plain ticker in every one of the three URL shapes —
   finance.yahoo.com/quote/TTWO/, barchart.com/stocks/quotes/TTWO,
   perplexity.ai/finance/TTWO — so no -USD / USD suffix is appended. */
const STOCK_QUERIES = [
  { source: 'yahoo', build: t => `site:finance.yahoo.com/quote ${t}` },
  { source: 'barchart', build: t => `site:www.barchart.com/stocks/quotes ${t} technical opinion` },
  { source: 'perplexity', build: t => `site:www.perplexity.ai/finance ${t} forecast news` },
];

const SOURCE_ORDER = ['yahoo', 'barchart', 'perplexity'];

/* Canonical host per source. Jina also returns regional mirrors
   (uk.finance.yahoo.com, ca.finance.yahoo.com, ...), so the match is on the
   trailing domain and the mirror is folded back onto the canonical host. */
const HOST_RULES = [
  { source: 'yahoo', suffix: 'finance.yahoo.com', canonical: 'finance.yahoo.com', paths: ['/quote/'] },
  { source: 'barchart', suffix: 'barchart.com', canonical: 'www.barchart.com', paths: ['/crypto/quotes/', '/stocks/quotes/'] },
  { source: 'perplexity', suffix: 'perplexity.ai', canonical: 'www.perplexity.ai', paths: ['/finance/'] },
];

class SearchError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

function decode(raw) {
  /* A percent-encoded redirect wrapper would otherwise hide the real host from
     the allowlist, and a malformed escape must not throw out of the module. */
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function hostMatches(host, suffix) {
  return host === suffix || host.endsWith(`.${suffix}`);
}

/* Returns { canonicalHost, pathname, href } or null when the URL is outside the
   allowlist (R7). Parsing with URL also rejects javascript:/data: payloads. */
function parseAllowed(rawUrl) {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) return null;
  let u;
  try {
    u = new URL(decode(rawUrl));
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  const host = u.hostname.toLowerCase();
  const path = u.pathname;
  for (const rule of HOST_RULES) {
    if (!hostMatches(host, rule.suffix)) continue;
    if (!rule.paths.some(p => path.toLowerCase().startsWith(p))) continue;
    /* Only the query string is dropped from the identity; the path is what the
       card links to, so keep the URL the engine actually returned. */
    return {
      canonicalHost: rule.canonical,
      canonical: host === rule.canonical,
      source: rule.source,
      pathname: path,
      key: `${rule.canonical}${path.toLowerCase().replace(/\/+$/, '')}`,
      href: u.toString(),
    };
  }
  return null;
}

function asSnippet(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, SNIPPET_LIMIT);
}

function asText(value, limit) {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim().slice(0, limit);
}

async function runQuery({ apiKey, query, numResults, signal }) {
  const url = `${ENDPOINT}?q=${encodeURIComponent(query)}&gl=US&hl=en&num=${numResults}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const forwardAbort = () => ctrl.abort();
  if (signal) {
    /* http.js owns its own timeout controller and cannot be reused here, so the
       caller's signal is chained onto the local one instead. */
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }

  let res;
  try {
    res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-No-Cache': 'true',
        /* Snippets only: cuts the bill from ~52,000 to a flat ~10,000 tokens. */
        'X-Respond-With': 'no-content',
        Accept: 'application/json',
      },
    });
  } catch (e) {
    if (e?.name === 'AbortError') throw new SearchError('SEARCH_FAILED', 'timeout');
    throw new SearchError('SEARCH_FAILED', e?.message || 'network error');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }

  if (res.status === 401 || res.status === 403) throw new SearchError('INVALID_SEARCH_KEY', `HTTP ${res.status}`);
  if (res.status === 429) throw new SearchError('SEARCH_RATE_LIMIT', 'HTTP 429');
  if (!res.ok) throw new SearchError('SEARCH_FAILED', `HTTP ${res.status}`);

  let payload;
  try {
    payload = await res.json();
  } catch {
    throw new SearchError('SEARCH_FAILED', 'non-JSON response');
  }
  /* A captive portal or a rate-limit page arrives as HTTP 200 + HTML. */
  const data = payload && Array.isArray(payload.data) ? payload.data : [];
  return data.map(item => ({
    title: asText(item?.title, 200),
    url: typeof item?.url === 'string' ? item.url : '',
    description: asSnippet(item?.description),
    date: asText(item?.date, 60),
  }));
}

/* One query, raw and unfiltered — the caller in main.js never uses this; it is
   the unit-test seam described in the design brief. */
export async function searchWeb({ apiKey, query, numResults = NUM_RESULTS, signal } = {}) {
  if (!apiKey || !query) return [];
  try {
    return await runQuery({ apiKey, query, numResults, signal });
  } catch (e) {
    console.warn('Jina search query failed:', e.code || e.message);
    return [];
  }
}

/* Keep ONLY official-source, symbol-matching items, so an engine leak
   (e.g. /finance/FUTU returned for a BNB query) never reaches the card. */
function matchesSymbol(parsed, symbol) {
  const variants = [`${symbol}-USD`, `${symbol}USD`, `/${symbol}/`].map(v => v.toLowerCase());
  const haystack = `${parsed.canonicalHost}${parsed.pathname}`.toLowerCase();
  return variants.some(v => haystack.includes(v));
}

function matchesTicker(parsed, realTicker) {
  /* Alphanumeric boundary, so /quote/TTWO/ , /quotes/ttwo and /finance/TTWO
     match while the tokenized /quote/TTWOX/ page does not. The host+path is the
     decoded URL minus the query string, which is where a ticker can false-match
     a `?comparing=` list.
     The second lookahead is what keeps the CRYPTO format out of a stock card:
     `-` is not alphanumeric, so /quote/TTWO-USD/ passes the boundary alone and
     would otherwise be labelled a stock page. */
  const re = new RegExp(`/${realTicker}(?![A-Za-z0-9])(?!-?USD)`, 'i');
  return re.test(`${parsed.canonicalHost}${parsed.pathname}`);
}

function filterItems(rawItems, isMatch) {
  const out = [];
  for (const item of rawItems) {
    const parsed = parseAllowed(item.url);
    if (!parsed) continue;
    if (!isMatch(parsed)) continue;
    if (!item.description) continue;
    out.push({
      title: item.title,
      url: parsed.href,
      description: item.description,
      date: item.date,
      /* Badged from the URL, not from the query that produced it: when Jina
         answers one query with another allowed source, the badge has to
         describe the page the user will actually land on. */
      source: parsed.source,
      _key: parsed.key,
      _canonical: parsed.canonical,
    });
  }
  return out;
}

function dominantFailure(codes) {
  if (codes.includes('INVALID_SEARCH_KEY')) return 'INVALID_SEARCH_KEY';
  if (codes.includes('SEARCH_RATE_LIMIT')) return 'SEARCH_RATE_LIMIT';
  return 'SEARCH_FAILED';
}

export async function runWebSearch({ apiKey, cryptoInfo, lang, signal } = {}) {
  const symbol = String(cryptoInfo?.symbol || '').trim().toUpperCase();
  /* `lang` is accepted for call-site symmetry with the other services, but the
     query stays English with gl=US&hl=en whatever the UI language is (R7). */
  if (!apiKey) return { ok: false, error: 'NO_SEARCH_KEY' };
  if (!symbol) return { ok: false, error: 'SEARCH_FAILED' };

  const realTicker = TOKENIZED_STOCKS[symbol];
  const plans = (realTicker ? STOCK_QUERIES : QUERIES).map(q => ({ source: q.source, q: q.build(realTicker || symbol) }));
  const isMatch = realTicker
    ? parsed => matchesTicker(parsed, realTicker)
    : parsed => matchesSymbol(parsed, symbol);

  const settled = await Promise.allSettled(
    plans.map(p => runQuery({ apiKey, query: p.q, numResults: NUM_RESULTS, signal })));

  const failures = [];
  const byUrl = new Map();
  settled.forEach(res => {
    if (res.status !== 'fulfilled') {
      failures.push(res.reason?.code || 'SEARCH_FAILED');
      console.warn('Jina search query failed:', res.reason?.code || res.reason);
      return;
    }
    for (const item of filterItems(res.value, isMatch)) {
      const prev = byUrl.get(item._key);
      /* Same page under a regional mirror (uk.finance.yahoo.com) and under the
         canonical host: keep the canonical one, in the slot it first took. */
      if (!prev || (!prev._canonical && item._canonical)) byUrl.set(item._key, item);
    }
  });

  const kept = [...byUrl.values()];
  if (!kept.length) return { ok: false, error: dominantFailure(failures) };

  /* Source order, ~3 per source, hard cap 9 items. */
  const items = [];
  for (const source of SOURCE_ORDER) {
    for (const item of kept.filter(x => x.source === source).slice(0, PER_SOURCE_LIMIT)) {
      if (items.length >= TOTAL_LIMIT) break;
      items.push({ title: item.title, url: item.url, description: item.description, date: item.date, source: item.source });
    }
  }
  return { ok: true, items, queries: plans.length, plan: realTicker ? 'stock' : 'crypto' };
}
