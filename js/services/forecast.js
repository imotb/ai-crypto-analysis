/* Analyst price-target forecast via the Jina Reader (r.jina.ai), with a
   site-search fallback through the SAME key and the existing searchWeb seam.

   Same contract as websearch.js: nothing is imported from the market/blockchain
   services, TOKENIZED_STOCKS comes from websearch.js so the asset-type decision
   has exactly one source of truth, and across this module boundary the exported
   functions never throw — they return { ok:false, error }. The API key is a
   runtime parameter only: it is never echoed into a returned object, a log line
   or the parsed forecast. */

import { TOKENIZED_STOCKS, searchWeb } from './websearch.js';

const READER = 'https://r.jina.ai/';
/* Reader renders a real browser page, so it is slower than a search query; 20 s
   matches the brief without letting a hung page stall the parallel batch. */
const READER_TIMEOUT_MS = 20000;
const SNIPPET_BUDGET = 1800;

const TIPRANKS_RATING = 'strong buy|moderate buy|buy|hold|sell|moderate sell|strong sell';
/* Prices arrive as "$289.87", "5,096.94" or bare "210" depending on the page. */
const MONEY = '[$]?\\s?([0-9][0-9,]*(?:\\.[0-9]+)?)';

class ForecastError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code;
  }
}

/* Markdown noise (bold markers inside the money strings, headings, table pipes,
   link URLs repeating the anchor text) is what made the raw pages unreadable to
   a regex; flattening it once keeps every anchor below short and literal. */
function plainText(md) {
  return String(md || '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[*_`#>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function grab(text, patterns) {
  for (const re of patterns) {
    const m = re.exec(text);
    if (m) return m[1];
  }
  return null;
}

function money(text, patterns) {
  const raw = grab(text, patterns);
  if (raw == null) return null;
  const n = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function whole(text, patterns) {
  const raw = grab(text, patterns);
  if (raw == null) return null;
  const n = Number(String(raw).replace(/,/g, ''));
  return Number.isFinite(n) ? n : null;
}

function words(text, re) {
  const m = re.exec(text);
  if (!m) return null;
  return m[1].replace(/\s+/g, ' ').trim().toLowerCase() || null;
}

/* Pure parser — the unit-test seam. `source` selects the anchor set because the
   two pages word the same numbers differently; an unknown source gets the
   TipRanks anchors (that is where the target sentences live). */
export function parseForecastPage(markdown, source = 'tipranks') {
  const text = plainText(markdown);
  const empty = {
    currentPrice: null, week52Low: null, week52High: null,
    targetHigh: null, targetAvg: null, targetLow: null,
    upsidePct: null, rating: null, buy: null, hold: null, sell: null, analysts: null,
    buyPct: null, holdPct: null, sellPct: null,
  };
  if (!text) return empty;

  if (source === 'cnn') {
    const week = /52[- ]week range\s+\$?([0-9][0-9,]*(?:\.[0-9]+)?)\s+\$?([0-9][0-9,]*(?:\.[0-9]+)?)/i.exec(text)
      || /low of\s+\$?([0-9][0-9,]*(?:\.[0-9]+)?)\s+to a high of\s+\$?([0-9][0-9,]*(?:\.[0-9]+)?)/i.exec(text);
    /* CNN writes this as "High $150.00 / Median $130.00 / Low $110.00" — the
       separators are slashes and whitespace, never plain spaces. */
    const targets = /1[- ]year stock price forecast\s+high[^\d$]{0,4}\$?([0-9][0-9,]*(?:\.[0-9]+)?)[^\d$]{0,6}median[^\d$]{0,4}\$?([0-9][0-9,]*(?:\.[0-9]+)?)[^\d$]{0,6}low[^\d$]{0,4}\$?([0-9][0-9,]*(?:\.[0-9]+)?)/i.exec(text);
    const pair = m => (m ? Number(m.replace(/,/g, '')) : null);
    return {
      ...empty,
      currentPrice: money(text, [new RegExp(`Closed at\\s+${MONEY}`, 'i')]),
      week52Low: week ? pair(week[1]) : null,
      week52High: week ? pair(week[2]) : null,
      targetHigh: targets ? pair(targets[1]) : null,
      targetAvg: targets ? pair(targets[2]) : null,
      targetLow: targets ? pair(targets[3]) : null,
      analysts: whole(text, [/(\d+)\s+analyst ratings/i]),
      buyPct: whole(text, [/buy\s+(\d+(?:\.\d+)?)\s*%/i]),
      holdPct: whole(text, [/hold\s+(\d+(?:\.\d+)?)\s*%/i]),
      sellPct: whole(text, [/sell\s+(\d+(?:\.\d+)?)\s*%/i]),
    };
  }

  /* The page states the split twice — a rolling-month count ("received 36 Buy
     Ratings") and the 3-month consensus that matches the analyst count
     ("based on 16 buy ratings, 0 hold ratings and 0 sell ratings"). Take the
     consensus sentence first, otherwise the bar would not sum to `analysts`. */
  const consensus = /based on\s+(\d+)\s+buy ratings?,\s*(\d+)\s+hold ratings?\s*(?:and|,)\s*(\d+)\s+sell ratings?/i.exec(text);
  const count = (fallback, taken) => (taken !== null ? Number(taken) : whole(text, [fallback]));

  return {
    ...empty,
    targetAvg: money(text, [
      new RegExp(`average price target (?:is|of)\\s*${MONEY}`, 'i'),
      new RegExp(`average price target[^$0-9]{0,14}${MONEY}`, 'i'),
    ]),
    targetHigh: money(text, [
      new RegExp(`high forecast of\\s*${MONEY}`, 'i'),
      new RegExp(`highest(?: analyst price target)?[^$0-9]{0,14}${MONEY}`, 'i'),
    ]),
    targetLow: money(text, [
      new RegExp(`low forecast of\\s*${MONEY}`, 'i'),
      new RegExp(`lowest(?: forecast)?[^$0-9]{0,14}${MONEY}`, 'i'),
    ]),
    upsidePct: money(text, [
      new RegExp(`represents a\\s*${MONEY}\\s*%`, 'i'),
      /([0-9][0-9,]*(?:\.[0-9]+)?)\s*%\s*(?:change|increase|upside)/i,
    ]),
    currentPrice: money(text, [
      new RegExp(`last price of\\s*${MONEY}`, 'i'),
      new RegExp(`current price of\\s*${MONEY}`, 'i'),
    ]),
    rating: words(text, new RegExp(`consensus(?: rating)? (?:of|is)(?: a)?\\s+(${TIPRANKS_RATING})`, 'i')),
    buy: count(/(\d+)\s+buy ratings/i, consensus && consensus[1]),
    hold: count(/(\d+)\s+hold ratings/i, consensus && consensus[2]),
    sell: count(/(\d+)\s+sell ratings/i, consensus && consensus[3]),
    analysts: whole(text, [
      /based on\s+(\d+)\s+(?:wall street\s+)?analysts/i,
      /the ratings of\s+(\d+)\s+wall street analysts/i,
    ]),
  };
}

const FORECAST_FIELDS = ['currentPrice', 'week52Low', 'week52High', 'targetHigh', 'targetAvg',
  'targetLow', 'upsidePct', 'rating', 'buy', 'hold', 'sell', 'analysts', 'buyPct', 'holdPct', 'sellPct'];

/* TipRanks is the forecast-native source, so it wins wherever it has a value;
   CNN fills the gaps (current price, 52-week range, the consensus split when
   TipRanks gave no counts). Provenance is kept per field, not per page, because
   a merged forecast is quoted field by field in the report. */
export function mergeForecast(...parts) {
  const ordered = parts.filter(Boolean);
  const out = {};
  const provenance = {};
  for (const field of FORECAST_FIELDS) {
    out[field] = null;
    for (const part of ordered) {
      if (!part) continue;
      const value = part[field];
      if (value !== null && value !== undefined && value !== '') {
        out[field] = value;
        provenance[field] = part._source || provenance[field] || null;
        break;
      }
    }
  }
  out.provenance = provenance;
  return out;
}

function tag(part, source) {
  if (!part) return null;
  return { ...part, _source: source };
}

/* A Reader call that reaches the page but gets the Cloudflare interstitial back
   still answers 200, so the block has to be detected in the body — otherwise the
   parser would "succeed" on a page with no numbers and the fallback never runs. */
function looksBlocked(text) {
  const head = String(text || '').slice(0, 1200).toLowerCase();
  return head.includes('just a moment') || head.includes('performing security verification')
    || head.includes('captcha') || head.includes('enable javascript and cookies');
}

async function fetchReader({ apiKey, url, signal }) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), READER_TIMEOUT_MS);
  const forwardAbort = () => ctrl.abort();
  if (signal) {
    if (signal.aborted) ctrl.abort();
    else signal.addEventListener('abort', forwardAbort, { once: true });
  }
  let res;
  try {
    res = await fetch(READER + url, {
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-Retain-Images': 'none',
        'X-No-Cache': true,
        Accept: 'text/plain',
      },
    });
  } catch (e) {
    if (e?.name === 'AbortError') throw new ForecastError('FORECAST_FAILED', 'timeout');
    throw new ForecastError('FORECAST_FAILED', e?.message || 'network error');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
  if (res.status === 401 || res.status === 403) throw new ForecastError('INVALID_SEARCH_KEY', `HTTP ${res.status}`);
  if (res.status === 429) throw new ForecastError('SEARCH_RATE_LIMIT', 'HTTP 429');
  if (!res.ok) throw new ForecastError('FORECAST_FAILED', `HTTP ${res.status}`);

  let text;
  try {
    text = await res.text();
  } catch {
    throw new ForecastError('FORECAST_FAILED', 'unreadable response');
  }
  /* A captive portal or bot wall arrives as HTTP 200 + HTML-shaped text. */
  if (looksBlocked(text)) throw new ForecastError('FORECAST_FAILED', 'blocked');
  if (String(text).replace(/\s+/g, '').length < 200) throw new ForecastError('FORECAST_FAILED', 'empty page');
  return text;
}

/* Fallback: ask the search engine for the same page and parse the snippets.
   The engine returns the forecast sentence verbatim, just truncated, so the
   concatenated snippets are a legitimate (if thinner) input for the parser. */
async function searchFallback({ apiKey, page, symbol, signal }) {
  const items = await searchWeb({
    apiKey,
    query: `site:${page.url} ${symbol} forecast price target`,
    signal,
  });
  const wanted = page.url.toLowerCase().replace(/\/+$/, '');
  const text = items
    .filter(it => typeof it.url === 'string' && it.url.toLowerCase().replace(/\/+$/, '').startsWith(wanted))
    .map(it => it.description)
    .filter(Boolean)
    .join('. ')
    .slice(0, SNIPPET_BUDGET);
  if (!text) return null;
  return tag(parseForecastPage(text, page.source), page.source);
}

function pagesFor(symbol) {
  const realTicker = TOKENIZED_STOCKS[symbol];
  if (realTicker) {
    return [
      { source: 'tipranks', url: `https://www.tipranks.com/stocks/${realTicker.toLowerCase()}/forecast` },
      { source: 'cnn', url: `https://www.cnn.com/markets/stocks/${realTicker.toUpperCase()}` },
    ];
  }
  /* Crypto lives under the SINGULAR /cryptocurrency/ hub and often carries no
     analyst targets at all — the caller degrades on the parsed result, not here. */
  return [{ source: 'tipranks', url: `https://www.tipranks.com/cryptocurrency/${symbol.toLowerCase()}-usd` }];
}

/* One page: Reader first, search snippets when Reader is blocked or empty. */
async function resolvePage({ apiKey, page, symbol, signal }) {
  try {
    const text = await fetchReader({ apiKey, url: page.url, signal });
    const parsed = tag(parseForecastPage(text, page.source), page.source);
    if (Object.keys(parsed).some(k => k !== '_source' && parsed[k] !== null)) {
      return { parsed, via: 'reader' };
    }
  } catch (e) {
    if (e?.code === 'INVALID_SEARCH_KEY' || e?.code === 'SEARCH_RATE_LIMIT') throw e;
  }
  return { parsed: await searchFallback({ apiKey, page, symbol, signal }), via: 'search' };
}

export async function runAnalystForecast({ apiKey, cryptoInfo, signal } = {}) {
  const symbol = String(cryptoInfo?.symbol || '').trim().toUpperCase();
  if (!apiKey) return { ok: false, error: 'NO_SEARCH_KEY' };
  if (!symbol) return { ok: false, error: 'FORECAST_FAILED' };

  const pages = pagesFor(symbol);
  let settled;
  try {
    settled = await Promise.allSettled(pages.map(page => resolvePage({ apiKey, page, symbol, signal })));
  } catch (e) {
    return { ok: false, error: e?.code === 'SEARCH_RATE_LIMIT' ? 'SEARCH_RATE_LIMIT' : 'FORECAST_FAILED' };
  }

  const parts = [];
  let readerWon = false;
  for (const res of settled) {
    if (res.status !== 'fulfilled') {
      console.warn('Analyst forecast page failed:', res.reason?.code || res.reason);
      continue;
    }
    if (res.value?.parsed) parts.push(res.value.parsed);
    if (res.value?.via === 'reader') readerWon = true;
  }

  const forecast = mergeForecast(...parts);
  /* A page that only yielded the spot price is not a forecast; telling the user
     "no data" beats drawing an empty range bar around a Binance number the
     panel already shows. */
  const hasSignal = forecast.targetHigh !== null || forecast.targetAvg !== null
    || forecast.targetLow !== null || forecast.rating !== null
    || forecast.buy !== null || forecast.buyPct !== null;
  if (!hasSignal) return { ok: false, error: 'FORECAST_FAILED' };

  return {
    ok: true,
    forecast,
    fetchedAt: new Date().toISOString(),
    mode: readerWon ? 'reader' : 'search',
    plan: TOKENIZED_STOCKS[symbol] ? 'stock' : 'crypto',
    sources: pages.map(p => p.url),
  };
}
