import { T } from '../i18n.js';
import { formatPrice } from '../format.js';
import { skeletonLines, skeletonBlock, attachIconFallback } from './fx.js';

/* ---------- formatting ---------- */

export function formatCompact(usd) {
  if (usd == null || isNaN(usd)) return '—';
  const n = Number(usd);
  const abs = Math.abs(n);
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  return `$${n.toLocaleString()}`;
}

export function fearGreedLabel(value, lang) {
  if (value > 75) return lang === 'fa' ? 'طمع شدید' : 'Extreme Greed';
  if (value > 50) return lang === 'fa' ? 'طمع' : 'Greed';
  if (value > 25) return lang === 'fa' ? 'ترس' : 'Fear';
  return lang === 'fa' ? 'ترس شدید' : 'Extreme Fear';
}

/* ---------- safe html ---------- */

const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:', 'about:blank'];

/* `javascript:` / `data:` written as `jav&#9;ascript:` or with control chars
   defeats a plain startsWith() check, because the browser decodes the entity
   before navigating. Resolve against the page URL and allowlist the scheme. */
export function safeHref(raw) {
  if (!raw) return null;
  try {
    const u = new URL(String(raw), location.href);
    return SAFE_PROTOCOLS.includes(u.protocol) ? u.href : null;
  } catch {
    return null;
  }
}

function sanitize(html) {
  if (window.DOMPurify) {
    return window.DOMPurify.sanitize(html, { USE_PROFILES: { html: true }, FORBID_TAGS: ['style', 'form'], FORBID_ATTR: ['style'] });
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  doc.querySelectorAll('script, style, iframe, object, embed, form, base, link, meta, svg, math').forEach(el => el.remove());
  doc.querySelectorAll('*').forEach(el => {
    for (const attr of [...el.attributes]) {
      const name = attr.name.toLowerCase();
      if (/^on/i.test(name) || name === 'srcdoc' || name === 'formaction') {
        el.removeAttribute(attr.name);
      } else if (name === 'href' || name === 'src' || name === 'xlink:href' || name === 'action') {
        if (!safeHref(attr.value)) el.removeAttribute(attr.name);
      }
    }
  });
  return doc.body.innerHTML;
}

function setHTML(el, html) { if (el) el.innerHTML = sanitize(html); }
function setText(el, text) { if (el) el.textContent = text ?? ''; }

const $ = id => document.getElementById(id);

/* ---------- pipeline ---------- */

const STEPS = ['price', 'indicators', 'chain', 'news', 'search', 'ai'];

export function buildPipeline(lang) {
  const wrap = $('pipeline');
  if (!wrap) return;
  const dict = T[lang];
  wrap.innerHTML = '';
  STEPS.forEach(key => {
    const s = document.createElement('div');
    s.className = 'step';
    s.dataset.step = key;
    s.innerHTML = '<span class="dot"></span><span></span>';
    s.lastElementChild.textContent = dict.steps[key];
    wrap.append(s);
  });
}

export function setStep(key, state) {
  const el = document.querySelector(`.step[data-step="${key}"]`);
  if (!el) return;
  el.classList.remove('active', 'done');
  if (state) el.classList.add(state);
}

export function resetPipeline() {
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active', 'done'));
}

/* ---------- skeletons / errors ---------- */

const CARD_CONTAINERS = ['indicatorsGrid', 'levelsContent', 'volumeProfileContent', 'fibonacciContent', 'blockchainContent', 'metricsContent', 'forecastContent', 'newsContent', 'reportContent'];

export function showResultsSkeleton() {
  $('emptyState').hidden = true;
  $('results').hidden = false;
  setText($('heroPrice'), '—');
  $('heroPrice').classList.add('sk');
  ['statChange', 'statVolume', 'fgValue'].forEach(id => { const el = $(id); el.textContent = ''; el.classList.add('sk'); });
  setHTML($('liveChartContainer'), skeletonBlock(440));
  setHTML($('indicatorsGrid'), Array.from({ length: 8 }, () => skeletonBlock(64)).join(''));
  setHTML($('levelsContent'), skeletonLines(4) + skeletonLines(4));
  setHTML($('volumeProfileContent'), Array.from({ length: 6 }, () => '<div class="sk" style="height:14px;margin:6px 0"></div>').join(''));
  setHTML($('fibonacciContent'), Array.from({ length: 7 }, () => '<div class="sk" style="height:22px;margin:6px 0"></div>').join(''));
  setHTML($('blockchainContent'), Array.from({ length: 5 }, () => skeletonBlock(56)).join(''));
  setHTML($('metricsContent'), Array.from({ length: 3 }, () => skeletonBlock(56)).join(''));
  setHTML($('forecastContent'), skeletonBlock(96));
  setHTML($('newsContent'), Array.from({ length: 4 }, () => skeletonBlock(74)).join(''));
  setHTML($('webSearchContent'), Array.from({ length: 3 }, () => skeletonBlock(74)).join(''));
  setHTML($('reportContent'), skeletonLines(10));
  $('recoSlot').innerHTML = '';
}

export function cardFallback(containerId, message) {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'error-panel';
  box.style.padding = 'var(--space-4)';
  box.innerHTML = '<i class="fas fa-triangle-exclamation" style="color:var(--warning);font-size:1.2rem"></i><p style="font-size:.82rem"></p>';
  box.querySelector('p').textContent = message;
  el.append(box);
}

/* ---------- stats ---------- */

export function renderStats({ quote, cryptoInfo, fearGreed }, lang) {
  $('emptyState').hidden = true;
  $('results').hidden = false;

  const hp = $('heroPrice');
  hp.classList.remove('sk');
  setText(hp, `$${formatPrice(quote.price)}`);
  setText($('heroName'), `${cryptoInfo.name} (${cryptoInfo.symbol})`);
  const icon = $('heroIcon');
  attachIconFallback(icon, cryptoInfo.symbol);
  icon.src = cryptoInfo.icon;
  icon.alt = cryptoInfo.symbol;

  const sc = $('statChange');
  sc.classList.remove('sk');
  const chg = quote.priceChange24h ?? 0;
  sc.textContent = `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`;
  sc.className = `stat-value num ${chg >= 0 ? 'positive' : 'negative'}`;
  setText($('statRange'), quote.high24h != null
    ? `${formatPrice(quote.low24h)} — ${formatPrice(quote.high24h)}`
    : `via ${quote.source || 'api'}`);

  const sv = $('statVolume');
  sv.classList.remove('sk');
  setText(sv, formatCompact(quote.volume24h));
  setText($('statMcap'), `${lang === 'fa' ? 'ارزش بازار' : 'Market Cap'}: ${formatCompact(quote.marketCap)}`);

  const fg = $('fgValue');
  fg.classList.remove('sk');
  const v = fearGreed ?? 50;
  fg.textContent = String(v);
  $('fgDot').style.insetInlineStart = `${v}%`;
  setText($('fgText'), fearGreedLabel(v, lang));
}

/* ---------- indicators ---------- */

/* Indicators can legitimately be null (not enough history for SMA 200, etc.).
   Rendering them as 0 invented a reading; "—" is the honest display. */
function fmtNum(v) {
  if (v === null || v === undefined || Number.isNaN(v)) return '—';
  const n = Number(v);
  /* Chip values are raw indicator outputs; String() renders 3.13e-10 as
     "3.13203e-10", so sub-1 prices go through the shared formatter instead. */
  return Number.isFinite(n) && n !== 0 && Math.abs(n) < 1 ? formatPrice(n) : String(v);
}

function chip(name) {
  return `<div class="ind-chip"><div class="ind-name"></div><div class="ind-val num"></div><div class="ind-note"></div></div>`;
}

export function renderIndicators(ind, lang) {
  const el = $('indicatorsGrid');
  if (!ind) { cardFallback('indicatorsGrid', T[lang].noData); return; }
  const rsi = Number.isFinite(ind.rsi) ? ind.rsi : 50;
  const rsiCls = rsi > 70 ? 'negative' : rsi < 30 ? 'positive' : '';
  const rsiNote = rsi > 70 ? (lang === 'fa' ? 'اشباع خرید' : 'Overbought') : rsi < 30 ? (lang === 'fa' ? 'اشباع فروش' : 'Oversold') : (lang === 'fa' ? 'خنثی' : 'Neutral');
  const stoch = ind.stochastic || {};
  const ich = ind.ichimoku || {};
  const bb = ind.bollingerBands || {};
  const macd = ind.macd ?? 0;
  const adx = ind.adx ?? 0;
  const rows = [
    ['RSI (14)', fmtNum(rsi), rsiNote, rsiCls],
    ['MACD', fmtNum(ind.macd), macd >= 0 ? 'Bullish' : 'Bearish', macd >= 0 ? 'positive' : 'negative'],
    ['ADX (14)', fmtNum(ind.adx), adx > 25 ? 'Trending' : 'Range', ''],
    ['ATR (14)', fmtNum(ind.atr), '', ''],
    ['SMA 20', fmtNum(ind.sma20), '', ''],
    ['SMA 50', fmtNum(ind.sma50), '', ''],
    ['SMA 200', fmtNum(ind.sma200), '', ''],
    ['EMA 12 / 26', `${fmtNum(ind.ema12)} / ${fmtNum(ind.ema26)}`, '', ''],
    ['Stochastic %K/%D', `${fmtNum(stoch.k)} / ${fmtNum(stoch.d)}`,
      (stoch.k ?? 50) > 80 ? 'Overbought' : (stoch.k ?? 50) < 20 ? 'Oversold' : 'Neutral', ''],
    ['Bollinger', `${fmtNum(bb.lower)} — ${fmtNum(bb.upper)}`, `Mid ${fmtNum(bb.middle)}`, ''],
    ['VWAP', fmtNum(ind.vwap), '', ''],
    ['OBV', formatCompact(ind.obv), '', ''],
    ['Ichimoku Conv/Base', `${fmtNum(ich.conversionLine)} / ${fmtNum(ich.baseLine)}`, '', ''],
    ['Ichimoku Span A/B', `${fmtNum(ich.leadingSpanA)} / ${fmtNum(ich.leadingSpanB)}`, '', ''],
  ];
  el.innerHTML = rows.map(([name]) => chip(name)).join('');
  // Values are filled via textContent so no computed number can become an HTML sink.
  el.querySelectorAll('.ind-chip').forEach((node, i) => {
    const [, value, note, cls] = rows[i];
    node.querySelector('.ind-val').textContent = value;
    if (cls) node.querySelector('.ind-val').classList.add(cls);
    const noteEl = node.querySelector('.ind-note');
    if (note) noteEl.textContent = note;
    else noteEl.remove();
  });
}

/* ---------- levels ---------- */

export function renderLevels(state, lang) {
  const type = state.analysisType;
  const sup = type === 'short' ? state.supportLevelsShort : state.supportLevelsLong;
  const res = type === 'short' ? state.resistanceLevelsShort : state.resistanceLevelsLong;
  const row = (lv, kind) => `
    <div class="level-row ${kind}">
      <span class="num">$${formatPrice(lv.price)}</span>
      <div class="strength-bar"><i style="width:${Math.round((lv.strength ?? 0.5) * 100)}%"></i></div>
      <span class="badge">${Math.round((lv.strength ?? 0.5) * 100)}%</span>
    </div>`;
  setHTML($('levelsContent'), `
    <div class="levels-wrap">
      <div class="level-col">
        <h4><i class="fas fa-arrow-trend-up" style="color:var(--success)"></i> ${T[lang].support}</h4>
        ${(sup || []).map(l => row(l, 'support')).join('')}
      </div>
      <div class="level-col">
        <h4><i class="fas fa-arrow-trend-down" style="color:var(--danger)"></i> ${T[lang].resistance}</h4>
        ${(res || []).map(l => row(l, 'resistance')).join('')}
      </div>
    </div>`);
}

/* ---------- volume profile ---------- */

export function renderVolumeProfile(vp, lang) {
  if (!vp?.levels?.length) { cardFallback('volumeProfileContent', T[lang].noData); return; }
  const top = [...vp.levels].sort((a, b) => b.price - a.price).slice(0, 12);
  const max = Math.max(...vp.levels.map(l => l.volume), 1);
  const rows = top.map(l => {
    const w = Math.max((l.volume / max) * 100, 2);
    const isPoc = Math.abs(l.price - vp.poc) < 1e-12;
    return `<div class="vp-bar ${isPoc ? 'poc' : ''}">
      <span class="vp-price">$${formatPrice(l.price)}</span>
      <span class="track"><i style="width:${w}%"></i></span>
      <span>${isPoc ? 'POC' : ''}</span>
    </div>`;
  }).join('');
  setHTML($('volumeProfileContent'), `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">
      <span class="badge badge-info">POC $${formatPrice(vp.poc)}</span>
      <span class="badge">VAH $${formatPrice(vp.vah)}</span>
      <span class="badge">VAL $${formatPrice(vp.val)}</span>
    </div>
    <div class="vp-bars">${rows}</div>`);
}

/* ---------- fibonacci ---------- */

export function renderFibonacci(fib, currentPrice, lang) {
  if (!fib?.levels?.length) { cardFallback('fibonacciContent', T[lang].noData); return; }
  const rows = fib.levels.map(l => {
    const near = currentPrice && Math.abs(l.price - currentPrice) / currentPrice < 0.02;
    return `<div class="fib-row ${near ? 'near' : ''}">
      <span class="fib-level">${(l.level * 100).toFixed(1)}%</span>
      <span>${near ? '≈ ' + (lang === 'fa' ? 'قیمت فعلی' : 'current') : ''}</span>
      <span class="fib-price">$${formatPrice(l.price)}</span>
    </div>`;
  }).join('');
  setHTML($('fibonacciContent'), `
    <div style="display:flex;gap:8px;margin-bottom:10px">
      <span class="badge badge-danger">${T[lang].high} $${formatPrice(fib.high)}</span>
      <span class="badge badge-success">${T[lang].low} $${formatPrice(fib.low)}</span>
    </div>${rows}`);
}

/* ---------- blockchain / metrics ---------- */

/* Informational "not applicable" state — used when a metric/section is not
   meaningful for this asset, as opposed to a fetch that actually failed. */
export function cardNotApplicable(containerId, reason) {
  const el = $(containerId);
  if (!el) return;
  el.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'na-panel';
  box.innerHTML = '<i class="fas fa-circle-info" aria-hidden="true"></i><p></p>';
  box.querySelector('p').textContent = reason;
  el.append(box);
}

export function renderBlockchain(bc, lang, helpers, support) {
  const dict = T[lang];
  /* No free source exposes chain stats for this asset (TRON, xStocks, PoS alts):
     say so once instead of painting five dashes. */
  if (support && !support.hasChainStats) {
    cardNotApplicable('blockchainContent', dict.bcNotSupported);
    return;
  }
  if (!bc || Object.values(bc).every(v => v == null)) { cardFallback('blockchainContent', dict.noData); return; }
  const cell = (k, v, sub = '') => `<div class="kv"><div class="k">${k}</div><div class="v num">${v ?? '—'}</div>${sub ? `<div class="s ${sub}"></div>` : ''}</div>`;
  setHTML($('blockchainContent'), `<div class="kv-grid">${[
    cell(dict.networkDifficulty, bc.networkDifficulty != null ? Number(bc.networkDifficulty).toExponential(2) : '—'),
    cell(dict.hashRate, bc.hashRate != null ? helpers.formatHashRate(bc.hashRate) : '—'),
    cell(dict.transactionCount, bc.transactionCount != null ? Number(bc.transactionCount).toLocaleString() : '—'),
    cell(dict.activeAddresses, bc.activeAddresses != null ? Number(bc.activeAddresses).toLocaleString() : '—'),
    cell(dict.transactionVolume, bc.transactionVolume != null ? formatCompact(bc.transactionVolume) : '—'),
  ].join('')}</div>`);
}

export function renderMetrics(m, lang, helpers) {
  const dict = T[lang];
  if (!m) { cardFallback('metricsContent', dict.noData); return; }
  const sup = m.onchainSupport || {};
  const rows = [
    {
      label: dict.nvtRatio, value: m.nvtRatio, clsKey: 'nvt',
      note: m.nvtRatio != null ? helpers.getNVTDescription(m.nvtRatio, lang)
        : (sup.supportsNVT ? dict.noData : dict.nvtNotSupported),
    },
    {
      label: dict.mayerMultiple, value: m.mayerMultiple, clsKey: 'mayer',
      note: m.mayerMultiple != null ? helpers.getMayerDescription(m.mayerMultiple, lang)
        : dict.mayerNeedsHistory,
    },
    {
      label: dict.puellMultiple, value: m.puellMultiple, clsKey: 'puell',
      note: m.puellMultiple != null ? helpers.getPuellDescription(m.puellMultiple, lang)
        : (sup.supportsPuell ? dict.noData : dict.puellNotSupported),
    },
  ];
  /* Nothing derivable at all → one explanation beats three "—" tiles. */
  if (rows.every(r => r.value == null)) {
    cardNotApplicable('metricsContent', `${dict.notApplicable}: ${rows.map(r => r.note).join(' ')}`);
    return;
  }
  const cell = (r) => `<div class="kv"><div class="k">${r.label}</div><div class="v num ${r.value == null ? 'na' : helpers.getMetricClass(r.value, r.clsKey)}"></div><div class="s" style="color:var(--text-3)"></div></div>`;
  setHTML($('metricsContent'), `<div class="kv-grid">${rows.map(r => cell(r)).join('')}</div>`);
  const cells = $('metricsContent').querySelectorAll('.kv');
  rows.forEach((r, i) => {
    const vEl = cells[i].querySelector('.v');
    vEl.textContent = r.value == null ? '—' : r.value.toFixed(2);
    cells[i].querySelector('.s').textContent = r.note;
  });
}

/* ---------- news ---------- */

export function renderNews(news, lang) {
  const el = $('newsContent');
  if (!news?.length) { cardFallback('newsContent', T[lang].noData); return; }
  const items = news.slice(0, 8).map(n => `
    <article class="news-item ${n.important ? 'important' : ''}">
      <h4></h4>
      <div class="news-meta">
        <span><i class="fas fa-bullhorn"></i> ${T[lang].source}: <b></b></span>
        <span><i class="fas fa-clock"></i> <time></time></span>
        <a target="_blank" rel="noopener noreferrer"><i class="fas fa-arrow-up-right-from-square"></i> ${T[lang].viewDetails}</a>
      </div>
      <p class="news-desc"></p>
    </article>`).join('');
  el.innerHTML = `<div class="news-list">${items}</div>`;
  el.querySelectorAll('.news-item').forEach((node, i) => {
    const n = news[i];
    node.querySelector('h4').textContent = n.title;
    node.querySelector('.news-meta b').textContent = n.source || '—';
    node.querySelector('time').textContent = new Date(n.date).toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const a = node.querySelector('a');
    const href = safeHref(n.link);
    if (href) a.href = href;
    else a.removeAttribute('href');
    node.querySelector('.news-desc').textContent = n.description || '';
  });
}

/* ---------- live web search ---------- */

const SEARCH_SOURCE_LABEL = { yahoo: 'searchSourceYahoo', barchart: 'searchSourceBarchart', perplexity: 'searchSourcePerplexity', tipranks: 'searchSourceTipranks', cnn: 'searchSourceCnn' };

/* status: 'ok' | 'skipped' | 'failed'. Same security pattern as renderNews —
   the title, snippet and URL all come from an external search engine, so every
   string goes through textContent and every link through safeHref. */
export function renderSearch(items, status, lang) {
  const dict = T[lang];
  const containerId = 'webSearchContent';
  if (status === 'skipped') { cardNotApplicable(containerId, dict.searchSkipped); return; }
  if (status === 'failed') { cardFallback(containerId, dict.searchFailed); return; }
  if (!items?.length) { cardNotApplicable(containerId, dict.searchEmpty); return; }

  const el = $(containerId);
  el.innerHTML = `<div class="search-list">${items.map(() => `
    <article class="search-item">
      <div class="search-head">
        <span class="badge"></span>
        <a class="search-title" target="_blank" rel="noopener noreferrer"></a>
      </div>
      <div class="search-meta">
        <span class="search-host num"></span>
        <time></time>
      </div>
      <p class="search-desc"></p>
    </article>`).join('')}</div>`;

  el.querySelectorAll('.search-item').forEach((node, i) => {
    const it = items[i];
    const labelKey = SEARCH_SOURCE_LABEL[it.source];
    const badge = node.querySelector('.badge');
    badge.textContent = labelKey ? dict[labelKey] : 'Jina';
    badge.classList.add(`search-badge-${it.source || 'other'}`);
    const a = node.querySelector('.search-title');
    a.textContent = it.title || it.url;
    const href = safeHref(it.url);
    if (href) a.href = href;
    else a.removeAttribute('href');
    /* Displayed host is derived from the href the link actually points to, so
       the card can never advertise a domain it does not link to. */
    let host = '';
    try { host = new URL(a.href || '').hostname.replace(/^www\./, ''); } catch { host = ''; }
    node.querySelector('.search-host').textContent = host;
    const time = node.querySelector('time');
    if (it.date) time.textContent = it.date;
    else time.remove();
    node.querySelector('.search-desc').textContent = it.description || '';
  });
}

/* ---------- analyst forecast ---------- */

/* Numbers arrive from two different pages and either can be missing, so every
   builder below renders only what it has. Nothing here uses innerHTML — the
   strings are scraped from third-party pages — and the charts are plain SVG
   (createElementNS), so the card keeps the project's zero-dependency rule. */
const FC_MONEY = v => `$${formatPrice(v)}`;

/* Number(null) is 0 and 0 is finite, so an absent field would otherwise be
   plotted and labelled $0.00. Every gate in this section goes through this. */
const hasValue = v => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgNode(tag, attrs) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined) continue;
    el.setAttribute(key, String(value));
  }
  return el;
}

function svgText(value, attrs) {
  const t = svgNode('text', attrs);
  t.textContent = value;
  return t;
}

/* In-chart tooltip: <title> is the only native SVG tooltip, and it keeps the
   gauge readable without any overlay machinery of our own. */
function svgTitle(parent, text) {
  const t = svgNode('title', {});
  t.textContent = text;
  parent.insertBefore(t, parent.firstChild);
  return parent;
}

function fcSigned(pct) {
  return `${pct >= 0 ? '+' : '−'}${Math.abs(Number(pct)).toFixed(2)}%`;
}

/* Pure, DOM-free layout (§4.1). The domain spans ALL six numbers, not just the
   targets, which is what keeps the current price off the hard left edge the V5
   card produced whenever the 52-week low sat below every target. */
export function fcGaugeLayout(f) {
  if (!f) return null;
  const fields = ['week52Low', 'week52High', 'currentPrice', 'targetLow', 'targetAvg', 'targetHigh'];
  const values = fields.map(k => f[k]).filter(hasValue).map(Number);
  if (values.length < 2) return null;
  let lo = Math.min(...values);
  let hi = Math.max(...values);
  /* 4 % of air on each side; identical values would give a zero spread, so fall
     back to 4 % of the magnitude and never to zero. */
  const pad = ((hi - lo) || Math.abs(hi) || 1) * 0.04;
  lo -= pad;
  hi += pad;
  const span = hi - lo;
  const pct = v => Math.min(1, Math.max(0, (Number(v) - lo) / span));
  const pins = [
    { key: 'targetLow', value: f.targetLow },
    { key: 'targetAvg', value: f.targetAvg },
    { key: 'targetHigh', value: f.targetHigh },
    { key: 'current', value: f.currentPrice },
  ].filter(p => hasValue(p.value)).map(p => ({ key: p.key, value: Number(p.value), pct: pct(p.value) }));
  const band52 = hasValue(f.week52Low) && hasValue(f.week52High)
    ? { low: Number(f.week52Low), high: Number(f.week52High), lowPct: pct(f.week52Low), highPct: pct(f.week52High) }
    : null;
  const zone = hasValue(f.targetLow) && hasValue(f.targetHigh)
    ? { low: Number(f.targetLow), high: Number(f.targetHigh), lowPct: pct(f.targetLow), highPct: pct(f.targetHigh) }
    : null;
  return { min: lo, max: hi, band52, zone, pins };
}

/* Pure (§5.1): circumference for r = 48, one entry per non-zero side, the last
   one absorbing the rounding so the ring always closes. */
export function fcDonutSegments(buy, hold, sell) {
  const raw = [buy, hold, sell].map(v => (hasValue(v) ? Number(v) : null));
  if (raw.every(v => v === null)) return null;
  const nums = raw.map(v => (v === null ? 0 : v));
  const total = nums.reduce((a, b) => a + b, 0);
  if (total === 0) return [];
  const C = 2 * Math.PI * 48;
  const keys = ['buy', 'hold', 'sell'];
  const nonZero = nums.filter(v => v > 0).length;
  /* A gap between segments only reads well when there is more than one; with a
     16/0/0 vote the single segment must become a full ring, gap-free. */
  const gap = nonZero > 1 ? C * 0.018 : 0;
  const out = [];
  let cum = 0;
  keys.forEach((key, i) => {
    if (!(nums[i] > 0)) return;
    const isLast = out.length === nonZero - 1;
    const ratio = isLast ? 1 - cum : nums[i] / total;
    out.push({
      key,
      value: nums[i],
      ratio,
      dash: Math.max(0.0001, ratio * C - gap),
      offset: -(cum * C),
    });
    cum += ratio;
  });
  return out;
}

/* Pure (§6): where the current price sits inside the 52-week range. */
export function fc52wPosition(current, low, high) {
  if (!hasValue(current) || !hasValue(low) || !hasValue(high)) return null;
  const c = Number(current);
  const l = Number(low);
  const h = Number(high);
  if (!(h > l)) return null;
  return Math.min(1, Math.max(0, (c - l) / (h - l)));
}

/* §4.1 — the rating word has to fit the donut hole, so it is broken into at most
   two balanced lines instead of one long run. DOM-free on purpose: the wrapping
   rule is what the browser test asserts. */
export function fcRatingLines(rating) {
  const words = String(rating == null ? '' : rating).trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return words;
  let split = 1;
  let best = Infinity;
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(' ').length;
    const right = words.slice(i).join(' ').length;
    if (Math.abs(left - right) < best) {
      best = Math.abs(left - right);
      split = i;
    }
  }
  return [words.slice(0, split).join(' '), words.slice(split).join(' ')];
}

/* §4.2 — the upside pill is a satellite of the average chip, not a free-floating
   label: it is placed in the chip's own band, on the side away from the current
   price, and only clamped when neither side fits. */
export function fcPillBand(o) {
  const gap = o.gap === undefined ? 2 : o.gap;
  const half = o.pillW / 2;
  const lo = o.min + half;
  const hi = o.max - half;
  const right = { x: o.chipX + o.chipW / 2 + gap + half, side: 'right' };
  const left = { x: o.chipX - o.chipW / 2 - gap - half, side: 'left' };
  const order = o.prefer === 'right' ? [right, left] : [left, right];
  const fits = v => v >= lo && v <= hi;
  for (const c of order) if (fits(c.x)) return c;
  /* Neither side fits: clamp the preferred one so the pill still touches the chip. */
  return { x: Math.min(Math.max(order[0].x, lo), hi), side: order[0].side };
}


/* Gauge geometry, in viewBox units. The SVG scales to the panel, so these are
   proportions rather than pixels; x0/x1 leave room for the end axis labels. */
const FC_G = { w: 340, h: 152, x0: 22, x1: 318, axisY: 86, bandY: 98, bandH: 16, zoneY: 42, zoneH: 44, pinShort: 24, pinTall: 44 };
const fcGx = pct => FC_G.x0 + pct * (FC_G.x1 - FC_G.x0);
/* Keeps an in-chart chip or label from running past the drawn axis. */
const fcClampX = (x, half) => Math.min(Math.max(x, FC_G.x0 + half), FC_G.x1 - half);

/* The average-implied move: trust the page's own number, else derive it. */
function fcUpsidePct(f) {
  if (hasValue(f.upsidePct)) return Number(f.upsidePct);
  if (hasValue(f.currentPrice) && hasValue(f.targetAvg) && Number(f.currentPrice) > 0) {
    return (Number(f.targetAvg) / Number(f.currentPrice) - 1) * 100;
  }
  return null;
}

/* §4.3 — the sentence is built from the fields that actually exist. The i18n
   value is only the leading label; the numbers stay plain `$` figures so one
   aria string serves both dictionaries. */
function fcGaugeAria(f, dict) {
  const parts = [];
  if (hasValue(f.currentPrice)) parts.push(`${dict.currentPrice} ${FC_MONEY(f.currentPrice)}`);
  const t = [
    ['targetLow', dict.forecastLowestTarget],
    ['targetAvg', dict.forecastAverageTarget],
    ['targetHigh', dict.forecastHighestTarget],
  ].filter(([k]) => hasValue(f[k])).map(([k, label]) => `${label} ${FC_MONEY(f[k])}`);
  if (t.length) parts.push(t.join(' · '));
  if (hasValue(f.week52Low) && hasValue(f.week52High)) {
    parts.push(`${dict.forecastWeek52} ${FC_MONEY(f.week52Low)} – ${FC_MONEY(f.week52High)}`);
  }
  return `${dict.forecastAriaGauge} ${parts.join(' · ')}`.trim();
}

function fcPanelHead(dict, key) {
  const panel = document.createElement('div');
  panel.className = 'fc-panel';
  const title = document.createElement('h3');
  title.className = 'fc-panel-title';
  title.textContent = dict[key];
  panel.append(title);
  return panel;
}

/* §4 — price-target gauge. Everything is relative to the padded domain the pure
   seam produced, so the current price is never pinned to an edge again. */
function fcGaugePanel(f, dict) {
  const layout = fcGaugeLayout(f);
  if (!layout) return null;
  const hasTargets = ['targetLow', 'targetAvg', 'targetHigh'].some(k => hasValue(f[k]));
  /* A chart with no targets is a price-range chart, so it must not be titled
     "Price Targets" — the user reads a target-less line as a broken card. */
  const panel = fcPanelHead(dict, hasTargets ? 'forecastPanelTargets' : 'forecastPanelRange');
  panel.classList.add('fc-gauge');

  const G = FC_G;
  const pin = key => layout.pins.find(p => p.key === key) || null;
  const now = pin('current');
  const avg = pin('targetAvg');
  const upside = fcUpsidePct(f);
  /* With no targets the upper rows of the gauge are never drawn, so the viewBox
     is cropped to the rows that actually carry marks. */
  const crop = layout.zone || avg || upside !== null ? 0 : 40;
  const svg = svgNode('svg', {
    viewBox: `0 ${crop} ${FC_G.w} ${FC_G.h - crop}`,
    class: 'fc-gauge-svg',
    role: 'img',
    'aria-label': fcGaugeAria(f, dict),
    focusable: 'false',
  });
  svg.setAttribute('dir', 'ltr');

  if (layout.band52) {
    const bx = fcGx(layout.band52.lowPct);
    const bw = Math.max(2, fcGx(layout.band52.highPct) - bx);
    svg.append(svgTitle(
      svgNode('rect', { class: 'fc-band', x: bx, y: G.bandY, width: bw, height: G.bandH, rx: G.bandH / 2 }),
      `${dict.forecastWeek52} ${FC_MONEY(layout.band52.low)} – ${FC_MONEY(layout.band52.high)}`,
    ));
    svg.append(svgText(FC_MONEY(layout.band52.low), { class: 'fc-band-label', x: bx, y: G.bandY + G.bandH + 10, 'text-anchor': 'start' }));
    svg.append(svgText(FC_MONEY(layout.band52.high), { class: 'fc-band-label', x: bx + bw, y: G.bandY + G.bandH + 10, 'text-anchor': 'end' }));
  }

  if (layout.zone) {
    const zx = fcGx(layout.zone.lowPct);
    const zw = Math.max(2, fcGx(layout.zone.highPct) - zx);
    svg.append(svgTitle(
      svgNode('rect', { class: 'fc-zone', x: zx, y: G.zoneY, width: zw, height: G.zoneH, rx: 6 }),
      `${dict.forecastPanelTargets} ${FC_MONEY(layout.zone.low)} – ${FC_MONEY(layout.zone.high)}`,
    ));
  }

  svg.append(svgNode('line', { class: 'fc-axis', x1: G.x0, y1: G.axisY, x2: G.x1, y2: G.axisY }));
  /* Axis ends are the padded domain, not a quoted price, so they get a plain
     two-decimal figure rather than the raw arithmetic residue. */
  const fcAxisMoney = v => FC_MONEY(Math.round(v * 100) / 100);
  svg.append(svgText(fcAxisMoney(layout.min), { class: 'fc-axis-label', x: G.x0, y: G.h - 4, 'text-anchor': 'start' }));
  svg.append(svgText(fcAxisMoney(layout.max), { class: 'fc-axis-label', x: G.x1, y: G.h - 4, 'text-anchor': 'end' }));

  for (const d of [
    { p: pin('targetLow'), label: dict.forecastLowestTarget, cls: 'fc-pin-low' },
    { p: pin('targetHigh'), label: dict.forecastHighestTarget, cls: 'fc-pin-high' },
    { p: avg, label: dict.forecastAverageTarget, cls: 'fc-pin-avg' },
  ]) {
    if (!d.p) continue;
    const isAvg = d.cls === 'fc-pin-avg';
    const x = fcGx(d.p.pct);
    const pinTop = G.axisY - (isAvg ? G.pinTall : G.pinShort);
    const g = svgNode('g', { class: `fc-pin ${d.cls}` });
    g.append(svgNode('line', { class: 'fc-pin-line', x1: x, y1: G.axisY, x2: x, y2: pinTop }));
    g.append(svgNode('circle', { class: 'fc-pin-dot', cx: x, cy: pinTop, r: isAvg ? 4 : 3 }));
    if (!isAvg) g.append(svgText(FC_MONEY(d.p.value), { class: 'fc-pin-value', x, y: pinTop - 5, 'text-anchor': 'middle' }));
    const titleText = isAvg && upside !== null
      ? `${d.label} ${FC_MONEY(d.p.value)} (${dict.forecastUpside} ${fcSigned(upside)})`
      : `${d.label} ${FC_MONEY(d.p.value)}`;
    svg.append(svgTitle(g, titleText));
  }

  const BAND = { y: 24, h: 17 };
  let chip = null;
  if (avg) {
    const text = FC_MONEY(avg.value);
    const cw = 10 + text.length * 5.1;
    const cx = fcClampX(fcGx(avg.pct), cw / 2);
    chip = { x: cx, w: cw };
    const g = svgNode('g', { class: 'fc-avg-chip' });
    g.append(svgNode('rect', { x: cx - cw / 2, y: BAND.y, width: cw, height: BAND.h, rx: 8 }));
    g.append(svgText(text, { class: 'fc-avg-chip-text', x: cx, y: BAND.y + 12, 'text-anchor': 'middle' }));
    svg.append(svgTitle(g, `${dict.forecastAverageTarget} ${text}${upside !== null ? ` (${dict.forecastUpside} ${fcSigned(upside)})` : ''}`));
  }

  if (now) {
    const x = fcGx(now.pct);
    const g = svgNode('g', { class: 'fc-now' });
    if (layout.band52) {
      g.append(svgNode('line', { class: 'fc-now-drop', x1: x, y1: G.axisY + 7, x2: x, y2: G.bandY + G.bandH / 2 }));
    }
    g.append(svgNode('path', {
      class: 'fc-now-diamond',
      d: `M ${x} ${G.axisY - 6} L ${x + 6} ${G.axisY} L ${x} ${G.axisY + 6} L ${x - 6} ${G.axisY} Z`,
    }));
    g.append(svgText(FC_MONEY(now.value), {
      class: 'fc-now-label', x: fcClampX(x + 9, 12), y: G.bandY + G.bandH / 2 + 3.5, 'text-anchor': 'start',
    }));
    svg.append(svgTitle(g, `${dict.currentPrice} ${FC_MONEY(now.value)}`));
  }

  if (now && avg && upside !== null && Math.abs(now.pct - avg.pct) > 0.03) {
    /* One dashed cubic instead of the three-segment bracket: it still ties the
       current price to the average, but it stops crossing the label rows. */
    const xa = fcGx(now.pct);
    const xb = fcGx(avg.pct);
    const rise = (G.axisY - 8 - BAND.y) * 0.45;
    svg.append(svgNode('path', {
      class: 'fc-link',
      d: `M ${xa} ${G.axisY - 8} C ${xa} ${G.axisY - 8 - rise}, ${xb} ${BAND.y + rise}, ${xb} ${BAND.y}`,
    }));
    const text = fcSigned(upside);
    const pw = 12 + text.length * 5.1;
    const placed = fcPillBand({
      chipX: chip.x,
      chipW: chip.w,
      pillW: pw,
      prefer: xa < xb ? 'right' : 'left',
      min: G.x0,
      max: G.x1,
    });
    const pill = svgNode('g', { class: `fc-pill ${upside >= 0 ? 'is-up' : 'is-down'}` });
    pill.append(svgNode('rect', { x: placed.x - pw / 2, y: BAND.y, width: pw, height: BAND.h, rx: 8 }));
    pill.append(svgText(text, { class: 'fc-pill-text', x: placed.x, y: BAND.y + 12, 'text-anchor': 'middle' }));
    svg.append(svgTitle(pill, `${dict.forecastUpside} ${text}`));
  }

  panel.append(svg);
  if (!hasTargets) {
    const muted = document.createElement('p');
    muted.className = 'fc-muted';
    muted.textContent = dict.forecastNoTargets;
    panel.append(muted);
  }
  return panel;
}

const FC_DONUT_C = 2 * Math.PI * 48;

function fcSegLabel(dict, key) {
  return key === 'buy' ? dict.forecastBuy : key === 'hold' ? dict.forecastHold : dict.forecastSell;
}

/* §5 — donut + merged legend, or the CNN percentage case, or one muted line. */
/* §3 — one donut body shared by both consensus branches, so the two data shapes
   can never grow into two different charts again. `withCounts` only changes the
   legend column and the tooltip wording, never the geometry. */
function fcDonutBody(o) {
  const { segs, dict, rating, analysts, withCounts, cnnFallback } = o;
  const body = document.createElement('div');
  body.className = 'fc-donut-body';

  const wrap = document.createElement('div');
  wrap.className = 'fc-donut-wrap';
  const ariaParts = segs.map(s => withCounts
    ? `${fcSegLabel(dict, s.key)} ${s.value} (${Math.round(s.ratio * 100)}%)`
    : `${fcSegLabel(dict, s.key)} ${Math.round(s.value)}%`);
  const svg = svgNode('svg', {
    viewBox: '0 0 120 120',
    class: 'fc-donut',
    role: 'img',
    'aria-label': `${dict.forecastAriaDonut} ${[rating ? String(rating).toUpperCase() : '', ...ariaParts].filter(Boolean).join(' · ')}`,
    focusable: 'false',
  });
  svg.append(svgNode('circle', { class: 'fc-donut-track', cx: 60, cy: 60, r: 48, fill: 'none' }));
  for (const s of segs) {
    const seg = svgNode('circle', {
      class: `fc-donut-seg fc-seg-${s.key}`,
      cx: 60, cy: 60, r: 48, fill: 'none',
      'stroke-dasharray': `${s.dash.toFixed(4)} ${(FC_DONUT_C - s.dash).toFixed(4)}`,
      'stroke-dashoffset': s.offset.toFixed(4),
      transform: 'rotate(-90 60 60)',
    });
    /* The reveal states live in CSS, so the numbers travel as custom
       properties and the attributes stay a no-CSS fallback. */
    seg.style.setProperty('--seg-dash', `${s.dash.toFixed(4)} ${(FC_DONUT_C - s.dash).toFixed(4)}`);
    seg.style.setProperty('--dash-len', s.dash.toFixed(4));
    seg.style.setProperty('--off', s.offset.toFixed(4));
    svg.append(svgTitle(seg, withCounts
      ? `${fcSegLabel(dict, s.key)} ${s.value} — ${Math.round(s.ratio * 100)}%`
      : `${fcSegLabel(dict, s.key)} ${Math.round(s.value)}%`));
  }
  wrap.append(svg);

  const center = document.createElement('div');
  center.className = 'fc-donut-center';
  const lines = fcRatingLines(rating);
  if (lines.length) {
    const word = document.createElement('span');
    word.className = 'fc-donut-rating';
    /* Long single tokens ("OVERWEIGHT") get the smaller step as well. */
    if (lines.some(l => l.length >= 8)) word.classList.add('is-long');
    for (const line of lines) {
      const row = document.createElement('span');
      row.className = 'fc-donut-rating-line';
      row.textContent = line;
      word.append(row);
    }
    center.append(word);
  }
  if (hasValue(analysts)) {
    const count = document.createElement('span');
    count.className = 'fc-donut-count num';
    count.setAttribute('dir', 'ltr');
    count.textContent = `${analysts} ${dict.forecastAnalysts}`;
    center.append(count);
  }
  if (!center.childNodes.length && cnnFallback) {
    const who = document.createElement('span');
    who.className = 'fc-donut-count';
    who.setAttribute('dir', 'ltr');
    who.textContent = 'CNN';
    center.append(who);
  }
  wrap.append(center);
  body.append(wrap);

  /* Zero-value sides get no row in either branch — the donut already skips them. */
  const legend = document.createElement('ul');
  legend.className = 'fc-legend';
  for (const s of segs) {
    const row = document.createElement('li');
    row.className = 'fc-legend-row';
    const dot = document.createElement('span');
    dot.className = `fc-dot fc-dot-${s.key}`;
    const label = document.createElement('span');
    label.className = 'fc-legend-label';
    label.textContent = fcSegLabel(dict, s.key);
    row.append(dot, label);
    if (withCounts) {
      const count = document.createElement('span');
      count.className = 'fc-legend-count num';
      count.setAttribute('dir', 'ltr');
      count.textContent = String(s.value);
      row.append(count);
    }
    const pct = document.createElement('span');
    pct.className = 'fc-legend-pct num';
    pct.setAttribute('dir', 'ltr');
    pct.textContent = `${Math.round(withCounts ? s.ratio * 100 : s.value)}%`;
    row.append(pct);
    legend.append(row);
  }
  body.append(legend);
  return body;
}

function fcConsensusPanel(f, dict) {
  const panel = fcPanelHead(dict, 'forecastPanelConsensus');
  panel.classList.add('fc-consensus');

  const counts = fcDonutSegments(f.buy, f.hold, f.sell);
  if (counts && counts.length) {
    /* TipRanks counts win the merge, so no provenance caption is needed here. */
    panel.append(fcDonutBody({
      segs: counts, dict, rating: f.rating, analysts: f.analysts, withCounts: true,
    }));
    return panel;
  }

  const pcts = fcDonutSegments(f.buyPct, f.holdPct, f.sellPct);
  if (pcts && pcts.length) {
    /* CNN publishes percentages instead of counts: the same donut, fed with the
       percentages, plus one quiet line that says where they came from. */
    const caption = document.createElement('p');
    caption.className = 'fc-eyebrow';
    caption.textContent = dict.forecastCnnSplit;
    panel.append(caption);
    panel.append(fcDonutBody({
      segs: pcts, dict, rating: f.rating, analysts: f.analysts, withCounts: false, cnnFallback: true,
    }));
    return panel;
  }

  const muted = document.createElement('p');
  muted.className = 'fc-muted';
  muted.textContent = dict.forecastNoRatings;
  panel.append(muted);
  return panel;
}

function fcStat(label, value, opts) {
  const tile = document.createElement('div');
  tile.className = `fc-stat${opts && opts.cls ? ` ${opts.cls}` : ''}`;
  const l = document.createElement('span');
  l.className = 'fc-stat-label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'fc-stat-value num';
  v.textContent = value;
  if (opts && opts.dirLtr) v.setAttribute('dir', 'ltr');
  if (opts && opts.title) v.title = opts.title;
  tile.append(l, v);
  return tile;
}

/* §6 — four tiles, plus the 52-week position tile when it is computable. */
function fcStatsPanel(f, dict) {
  const block = document.createElement('div');
  block.className = 'fc-stats';
  if (hasValue(f.currentPrice)) block.append(fcStat(dict.currentPrice, FC_MONEY(f.currentPrice), { dirLtr: true }));

  const upside = fcUpsidePct(f);
  if (upside !== null && hasValue(f.targetAvg)) {
    block.append(fcStat(dict.forecastUpside, fcSigned(upside), { dirLtr: true, cls: upside >= 0 ? 'is-up' : 'is-down' }));
  }

  if (hasValue(f.analysts)) block.append(fcStat(dict.forecastAnalysts, String(f.analysts), { dirLtr: true }));

  if (hasValue(f.week52Low) && hasValue(f.week52High)) {
    const range = `${FC_MONEY(f.week52Low)} – ${FC_MONEY(f.week52High)}`;
    block.append(fcStat(dict.forecastWeek52, range, { dirLtr: true }));
  }

  const pos = fc52wPosition(f.currentPrice, f.week52Low, f.week52High);
  if (pos !== null) {
    const tile = document.createElement('div');
    tile.className = 'fc-stat fc-stat-pos';
    const l = document.createElement('span');
    l.className = 'fc-stat-label';
    l.textContent = dict.forecast52wPos;
    const row = document.createElement('div');
    row.className = 'fc-stat-pos-row';
    const v = document.createElement('span');
    v.className = 'fc-stat-value num';
    v.setAttribute('dir', 'ltr');
    v.textContent = `${Math.round(pos * 100)}%`;
    const band = document.createElement('div');
    band.className = 'fc-mini-band';
    band.setAttribute('dir', 'ltr');
    /* The travelled part of the 52-week range is painted, not implied: an empty
       strip with one dot reads as a control, not as a position. */
    const fill = document.createElement('span');
    fill.className = 'fc-mini-fill';
    fill.style.width = `${(pos * 100).toFixed(2)}%`;
    const marker = document.createElement('span');
    marker.className = 'fc-mini-marker';
    marker.style.left = `${(pos * 100).toFixed(2)}%`;
    marker.title = `${FC_MONEY(f.currentPrice)} / ${dict.forecastWeek52}`;
    band.append(fill, marker);
    row.append(v, band);
    tile.append(l, row);
    block.append(tile);
  }

  return block.childNodes.length ? block : null;
}

export function renderForecast(result, lang) {
  const dict = T[lang];
  const containerId = 'forecastContent';
  const f = result && result.ok === true ? result.forecast : null;
  const NUMERIC_FIELDS = ['currentPrice', 'week52Low', 'week52High', 'targetLow', 'targetAvg', 'targetHigh',
    'buy', 'hold', 'sell', 'buyPct', 'holdPct', 'sellPct', 'analysts', 'upsidePct'];
  const hasAny = !!f && NUMERIC_FIELDS.some(k => hasValue(f[k]));
  if (!f || !hasAny) { cardNotApplicable(containerId, dict.forecastNoData); return; }

  const el = $(containerId);
  el.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'forecast';

  const gauge = fcGaugePanel(f, dict);
  if (gauge) wrap.append(gauge);
  wrap.append(fcConsensusPanel(f, dict));
  const stats = fcStatsPanel(f, dict);
  if (stats) wrap.append(stats);

  /* Footnote names the pages the numbers came from. The full URL lives in the
     title attribute only — this is a provenance note, not a link farm. */
  const foot = document.createElement('p');
  foot.className = 'fc-foot';
  const per = document.createElement('span');
  per.textContent = dict.forecastPer;
  foot.append(per);
  for (const url of Array.isArray(result.sources) ? result.sources : []) {
    const src = document.createElement('span');
    src.className = 'fc-foot-src';
    src.setAttribute('dir', 'ltr');
    let label = String(url);
    try {
      const u = new URL(url);
      label = `${u.hostname.replace(/^www\./, '')}${u.pathname}`;
    } catch { /* keep the raw string; it is display-only text */ }
    src.textContent = label;
    src.title = url;
    foot.append(src);
  }
  if (result.fetchedAt) {
    const when = document.createElement('time');
    when.setAttribute('datetime', result.fetchedAt);
    when.className = 'fc-foot-time num';
    when.textContent = String(result.fetchedAt).slice(0, 16).replace('T', ' ');
    foot.append(when);
  }
  wrap.append(foot);
  el.append(wrap);
}

/* ---------- live (streaming) report ---------- */

const LIVE_RENDER_MIN_INTERVAL_MS = 150;
let liveTimer = null;
let liveLastPaint = 0;
let livePending = '';

function cancelLiveRender() {
  if (liveTimer) clearTimeout(liveTimer);
  liveTimer = null;
  livePending = '';
}

function paintLive() {
  liveTimer = null;
  liveLastPaint = Date.now();
  const el = $('reportContent');
  if (!el) return;
  const stick = nearPageBottom();
  const text = livePending;
  if (!window.marked) el.textContent = text;
  else setHTML(el, window.marked.parse(text, { breaks: true }));
  /* Built as an element, never as raw HTML, so the cursor cannot be spoofed by
     streamed markdown. */
  const cursor = document.createElement('span');
  cursor.className = 'stream-cursor';
  cursor.textContent = '▍';
  el.append(cursor);
  if (stick) window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'auto' });
}

/* Only follow the output while the user is already at the bottom; someone who
   scrolled up to re-read a paragraph must not be yanked forward every 150 ms. */
function nearPageBottom() {
  const doc = document.documentElement;
  return window.innerHeight + window.scrollY >= doc.scrollHeight - 240;
}

export function renderReportLive(partial, lang, modelLabel) {
  const el = $('reportContent');
  if (!el) return;
  const hint = $('reportModelHint');
  if (hint) setText(hint, `${modelLabel ? `${modelLabel} · ` : ''}${T[lang].streamingHint}`);
  livePending = String(partial ?? '');
  if (liveTimer) return;
  if (Date.now() - liveLastPaint >= LIVE_RENDER_MIN_INTERVAL_MS) paintLive();
  else liveTimer = setTimeout(paintLive, LIVE_RENDER_MIN_INTERVAL_MS - (Date.now() - liveLastPaint));
}

/* ---------- sources list rework ---------- */

const SOURCES_HEADING = /^(sources|sources:|منابع|منابع:)\s*$/i;
/* Models decorate the heading ("### 📚 منابع", "**Sources:**"). Comparing the raw
   text demanded an exact word and skipped real reports, so compare a normalized
   form with emoji/punctuation/markdown emphasis stripped instead. */
function headingWords(text) {
  return String(text || '')
    .replace(/[*_`>#]/g, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/* A bilingual heading is the common third shape ("منابع (Sources)", "Sources
   (منابع)"), which normalizes to two words and previously fell through. */
const SOURCES_HEAD_WORDS = /^(sources?|منابع)(\s+(sources?|منابع))?$/i;

export function isSourcesHeading(node) {
  const w = headingWords(node.textContent);
  return SOURCES_HEAD_WORDS.test(w) || SOURCES_HEADING.test(String(node.textContent || '').trim());
}
/* marked renders one-URL-per-line as <br>-separated text, and textContent drops
   the <br>, so a greedy [^\s<>"]+ run would swallow the NEXT URL into one giant
   href. The lookahead ends every match before a new scheme. */
const URL_IN_TEXT = /https?:\/\/(?:(?!https?:\/\/)[^\s<>"])+/g;
const PATH_PREVIEW = 28;

/* Suffix match, dot-boundary, so ca.finance.yahoo.com still reads Yahoo Finance. */
const SOURCE_HOSTS = [
  { match: 'finance.yahoo.com', cls: 'yahoo', label: 'Yahoo Finance' },
  { match: 'barchart.com', cls: 'barchart', label: 'Barchart' },
  { match: 'perplexity.ai', cls: 'perplexity', label: 'Perplexity Finance' },
  { match: 'tipranks.com', cls: 'tipranks', label: 'TipRanks' },
  { match: 'cnn.com', cls: 'cnn', label: 'CNN Markets' },
];

function classifyHost(hostname) {
  const h = String(hostname || '').toLowerCase();
  for (const s of SOURCE_HOSTS) {
    if (h === s.match || h.endsWith(`.${s.match}`)) return s;
  }
  return { cls: 'other', label: h };
}

function previewPath(pathname) {
  const p = String(pathname || '');
  if (!p || p === '/') return '';
  return p.length > PATH_PREVIEW ? `${p.slice(0, PATH_PREVIEW - 1).replace(/[/\s-]+$/, '')}…` : p;
}

/* Pure extraction + dedupe + host classification — the unit-test seam. No DOM and
   no safeHref here on purpose: safeHref resolves against location, which must not
   be a dependency of a function the node harness imports. */
export function extractSourceUrls(regionText, existingHrefs = []) {
  const out = [];
  const seen = new Set();
  const add = raw => {
    /* A URL written as "(https://x/a)." or followed by a Persian comma must not
       carry that punctuation into the link. */
    const candidate = String(raw || '').trim().replace(/[)\]}.,;:!?"']+$/, '').replace(/[،؛]+$/, '');
    if (!candidate) return;
    let u;
    try {
      u = new URL(candidate);
    } catch {
      return;
    }
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return;
    if (seen.has(u.href)) return;
    seen.add(u.href);
    const info = classifyHost(u.hostname);
    out.push({ url: u.href, host: u.hostname, label: info.label, cls: info.cls, path: previewPath(u.pathname) });
  };
  (Array.isArray(existingHrefs) ? existingHrefs : []).forEach(add);
  String(regionText || '').match(URL_IN_TEXT)?.forEach(add);
  return out;
}

function buildSourcesGrid(urls) {
  const grid = document.createElement('div');
  grid.className = 'sources-grid';
  urls.forEach(item => {
    const href = safeHref(item.url);
    if (!href) return;
    const chip = document.createElement('a');
    chip.className = `src-chip src-${item.cls}`;
    chip.href = href;
    chip.target = '_blank';
    chip.rel = 'noopener noreferrer';
    chip.dir = 'ltr';
    chip.title = item.url;
    const dot = document.createElement('span');
    dot.className = 'src-dot';
    dot.setAttribute('aria-hidden', 'true');
    const host = document.createElement('span');
    host.className = 'src-host';
    host.textContent = item.label;
    chip.append(dot, host);
    if (item.path) {
      const path = document.createElement('span');
      path.className = 'src-path';
      path.textContent = item.path;
      chip.append(path);
    }
    grid.append(chip);
  });
  return grid;
}

function sourcesHeadingLevel(node) {
  const m = /^H([1-4])$/.exec(node.tagName);
  return m ? Number(m[1]) : 5;
}

/* textContent drops <br>, which would glue two URLs onto one line; re-insert the
   break so the extractor sees the line structure the model actually wrote. */
function regionText(node) {
  let text = '';
  node.childNodes.forEach(n => {
    if (n.nodeType === Node.BR_NODE) text += '\n';
    else if (n.nodeType === Node.TEXT_NODE) text += n.nodeValue;
    else text += regionText(n);
  });
  return text;
}

/* Turns the model's plain-text URL dump into a wrapped row of chips. Called only
   from the final renderReport, so the throttled live paints stay cheap. */
export function enhanceSources(el) {
  if (!el) return;
  const candidates = el.querySelectorAll('h1, h2, h3, h4, strong, b, p, li');
  let anchor = null;
  candidates.forEach(node => {
    if (!isSourcesHeading(node)) return;
    /* An <h3>Sources</h3> also contains a matching text run; the outer element is
       the real heading and its siblings are the region. */
    if (anchor && anchor.contains(node)) return;
    anchor = node;
  });
  if (!anchor) return;

  const stopLevel = sourcesHeadingLevel(anchor);
  const region = [];
  for (let n = anchor.nextElementSibling; n; n = n.nextElementSibling) {
    const m = /^H([1-4])$/.exec(n.tagName);
    if (m && Number(m[1]) <= stopLevel) break;
    region.push(n);
  }

  const nodes = region.length ? region : (anchor.parentElement && anchor.parentElement !== el ? [anchor.parentElement] : []);
  const hrefs = [];
  let text = '';
  nodes.forEach(n => {
    n.querySelectorAll('a[href]').forEach(a => hrefs.push(a.getAttribute('href')));
    text += `${regionText(n)}\n`;
  });

  const urls = extractSourceUrls(text, hrefs);
  if (!urls.length) return;
  const grid = buildSourcesGrid(urls);
  if (!grid.children.length) return;

  if (region.length) {
    nodes.forEach(n => n.remove());
    anchor.after(grid);
    return;
  }
  /* Inline case ("<p><strong>Sources:</strong> https://a https://b</p>"): blank
     out only the URL text nodes so the heading itself survives. */
  nodes[0].childNodes.forEach(n => {
    /* Separate non-global pattern: the sticky /g version carries lastIndex. */
    if (n.nodeType === Node.TEXT_NODE && /https?:\/\//.test(n.nodeValue)) n.nodeValue = '';
  });
  nodes[0].after(grid);
}

/* ---------- AI report ---------- */

export function renderReport(markdownText, lang, modelLabel) {
  /* A trailing throttled live paint must never overwrite the final render. */
  cancelLiveRender();
  setText($('reportModelHint'), modelLabel || '');
  const el = $('reportContent');
  if (!markdownText) { cardFallback('reportContent', T[lang].noData); return; }
  if (!window.marked) {
    el.textContent = markdownText;
    return;
  }
  setHTML(el, window.marked.parse(markdownText, { breaks: true }));
  enhanceSources(el);
}

export function renderRecommendation(markdownText, lang) {
  const slot = $('recoSlot');
  if (!slot || !markdownText) return;
  const m = markdownText.match(/(BUY|SELL|HOLD|خرید|فروش|نگهدار|خنثی)/i);
  if (!m) return;
  const word = m[1].toUpperCase();
  const isBuy = ['BUY', 'خرید'].includes(word);
  const isSell = ['SELL', 'فروش'].includes(word);
  const kind = isBuy ? 'buy' : isSell ? 'sell' : 'hold';
  slot.innerHTML = `
    <div class="reco-banner ${kind}" style="margin-bottom:var(--space-4)">
      <i class="fas ${isBuy ? 'fa-arrow-trend-up positive' : isSell ? 'fa-arrow-trend-down negative' : 'fa-hand-paper'}" style="font-size:1.4rem"></i>
      <div>
        <div class="reco-action ${kind === 'buy' ? 'positive' : kind === 'sell' ? 'negative' : ''}"></div>
        <div class="reco-text">${T[lang].disclaimer}</div>
      </div>
    </div>`;
  slot.querySelector('.reco-action').textContent = lang === 'fa' ? T[lang][kind] : T[lang][kind];
}
