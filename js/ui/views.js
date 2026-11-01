import { T } from '../i18n.js';
import { skeletonLines, skeletonBlock, attachIconFallback } from './fx.js';

/* ---------- formatting ---------- */

export function formatSmallNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  const n = Number(num);
  if (isNaN(n) || n === 0) return '0';
  if (n >= 0.01) return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  if (n >= 0.0001) return n.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 8 });
  return n.toFixed(10).replace(/\.?0+$/, '');
}

export function formatPrice(price, symbol) {
  if (price === undefined || price === null || isNaN(price)) return '0.00';
  const n = Number(price);
  if (isNaN(n)) return '0.00';
  const low = ['SHIB', 'PEPE', 'DOGE', 'XLM', 'FLOKI', 'BABYDOGE'];
  if (low.includes(symbol)) {
    if (n < 0.0001) return n.toFixed(8);
    if (n < 0.01) return n.toFixed(6);
  }
  if (n < 1) return n.toFixed(4);
  try {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
  } catch {
    return n.toFixed(2);
  }
}

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

const STEPS = ['price', 'indicators', 'chain', 'news', 'ai'];

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

const CARD_CONTAINERS = ['indicatorsGrid', 'levelsContent', 'volumeProfileContent', 'fibonacciContent', 'blockchainContent', 'metricsContent', 'newsContent', 'reportContent'];

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
  setHTML($('newsContent'), Array.from({ length: 4 }, () => skeletonBlock(74)).join(''));
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
  setText(hp, `$${formatPrice(quote.price, cryptoInfo.symbol)}`);
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
  return v === null || v === undefined || Number.isNaN(v) ? '—' : String(v);
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

export function renderBlockchain(bc, lang, helpers) {
  if (!bc || Object.values(bc).every(v => v == null)) { cardFallback('blockchainContent', T[lang].noData); return; }
  const cell = (k, v, sub = '') => `<div class="kv"><div class="k">${k}</div><div class="v num">${v ?? '—'}</div>${sub ? `<div class="s ${sub}"></div>` : ''}</div>`;
  setHTML($('blockchainContent'), `<div class="kv-grid">${[
    cell(T[lang].networkDifficulty, bc.networkDifficulty != null ? Number(bc.networkDifficulty).toExponential(2) : '—'),
    cell(T[lang].hashRate, bc.hashRate != null ? helpers.formatHashRate(bc.hashRate) : '—'),
    cell(T[lang].transactionCount, bc.transactionCount != null ? Number(bc.transactionCount).toLocaleString() : '—'),
    cell(T[lang].activeAddresses, bc.activeAddresses != null ? Number(bc.activeAddresses).toLocaleString() : '—'),
    cell(T[lang].transactionVolume, bc.transactionVolume != null ? formatCompact(bc.transactionVolume) : '—'),
  ].join('')}</div>`);
}

export function renderMetrics(m, lang, helpers) {
  if (!m) { cardFallback('metricsContent', T[lang].noData); return; }
  const cell = (k, v, cls, desc) => `<div class="kv"><div class="k">${k}</div><div class="v num ${cls}">${v}</div><div class="s" style="color:var(--text-3)">${desc}</div></div>`;
  setHTML($('metricsContent'), `<div class="kv-grid">${[
    cell(T[lang].nvtRatio, m.nvtRatio ?? '—', helpers.getMetricClass(m.nvtRatio, 'nvt'), helpers.getNVTDescription(m.nvtRatio, lang)),
    cell(T[lang].mayerMultiple, m.mayerMultiple ?? '—', helpers.getMetricClass(m.mayerMultiple, 'mayer'), helpers.getMayerDescription(m.mayerMultiple, lang)),
    cell(T[lang].puellMultiple, m.puellMultiple ?? '—', helpers.getMetricClass(m.puellMultiple, 'puell'), helpers.getPuellDescription(m.puellMultiple, lang)),
  ].join('')}</div>`);
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

/* ---------- AI report ---------- */

export function renderReport(markdownText, lang, modelLabel) {
  setText($('reportModelHint'), modelLabel || '');
  const el = $('reportContent');
  if (!markdownText) { cardFallback('reportContent', T[lang].noData); return; }
  if (!window.marked) {
    el.textContent = markdownText;
    return;
  }
  setHTML(el, window.marked.parse(markdownText, { breaks: true }));
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
