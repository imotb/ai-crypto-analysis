import { MODELS, CRYPTOS, cryptoInfo } from './catalog.js';
import { T, applyLanguage } from './i18n.js';
import { loadApiKey, saveApiKey, loadWebSearchKey, saveWebSearchKey, loadTheme, saveTheme, loadLang, saveLang } from './config.js';
import { fetchRealTimeData, fetchHistoricalData, enrichFromCoinGecko } from './services/market.js';
import { runAIAnalysis } from './services/ai.js';
import { fetchBlockchainData, calculateAdvancedNetworkMetrics, fetchFearGreedIndex, fetchCryptoNews, formatHashRate, getMetricClass, getNVTDescription, getMayerDescription, getPuellDescription, onchainSupportFor } from './services/blockchain.js';
/* Independent of every other data service — see the module header. */
import { runWebSearch } from './services/websearch.js';
import { computeAllIndicators } from './analysis/indicators.js';
import { buildPrompt } from './analysis/promptBuilder.js';
import { initRipple, applyTheme, toast, revealCards } from './ui/fx.js';
import { createCombo } from './ui/combo.js';
import { renderTradingView, renderChartFallback } from './ui/widgets.js';
import * as views from './ui/views.js';

const state = {
  lang: loadLang(),
  theme: loadTheme(),
  apiKey: loadApiKey(),
  webSearchKey: loadWebSearchKey(),
  model: MODELS[0].id,
  crypto: CRYPTOS[0].c,
  analysisType: 'short',
  running: false,
  data: {},
};

const $ = id => document.getElementById(id);

/* ---------- combos ---------- */
let cryptoCombo, modelCombo;

function destroyCombos() {
  cryptoCombo?.destroy();
  modelCombo?.destroy();
  cryptoCombo = modelCombo = null;
}

function buildCombos() {
  const lang = state.lang;
  modelCombo = createCombo($('modelCombo'), {
    items: MODELS.map(m => ({ ...m })),
    value: state.model,
    labelOf: m => m.label,
    iconOf: m => m.icon,
    tagOf: m => (m.paid ? (lang === 'fa' ? 'اعتباری' : 'credits') : (lang === 'fa' ? 'رایگان' : 'free')),
    onChange: id => { state.model = id; },
  });
  cryptoCombo = createCombo($('cryptoCombo'), {
    items: CRYPTOS.map(c => ({ id: c.c, row: c })),
    value: state.crypto,
    labelOf: it => lang === 'fa' ? `${it.row.fa} (${it.row.t})` : `${it.row.en} (${it.row.t})`,
    iconOf: it => `icons/crypto/${it.row.i}.png`,
    searchPlaceholder: lang === 'fa' ? 'جستجو...' : 'Search...',
    onChange: id => { state.crypto = id; },
  });
}

/* ---------- header / settings wiring ---------- */

function initChrome() {
  applyTheme(state.theme);
  applyLanguage(state.lang);
  $('langText').textContent = state.lang === 'fa' ? 'English' : 'فارسی';
  $('apiKey').value = state.apiKey;
  $('webSearchKey').value = state.webSearchKey;

  $('themeToggle').addEventListener('click', () => {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    saveTheme(state.theme);
    if (!$('results').hidden && state.data.info) renderChart();
  });

  $('langToggle').addEventListener('click', () => {
    state.lang = state.lang === 'fa' ? 'en' : 'fa';
    saveLang(state.lang);
    applyLanguage(state.lang);
    $('langText').textContent = state.lang === 'fa' ? 'English' : 'فارسی';
    destroyCombos();
    $('cryptoCombo').innerHTML = '';
    $('modelCombo').innerHTML = '';
    buildCombos();
    views.buildPipeline(state.lang);
    if (state.data.renderSnapshot) rerenderResults();
  });

  $('keyEye').addEventListener('click', () => {
    toggleSecret($('apiKey'), $('keyEye'));
  });

  $('webSearchKeyEye').addEventListener('click', () => {
    toggleSecret($('webSearchKey'), $('webSearchKeyEye'));
  });

  $('apiKey').addEventListener('change', e => {
    state.apiKey = e.target.value.trim();
    saveApiKey(state.apiKey);
  });

  $('webSearchKey').addEventListener('change', e => {
    state.webSearchKey = e.target.value.trim();
    saveWebSearchKey(state.webSearchKey);
  });

  document.querySelectorAll('input[name="analysisType"]').forEach(r =>
    r.addEventListener('change', e => {
      state.analysisType = e.target.value;
      if (state.data.info) views.renderLevels({ ...state.data, analysisType: state.analysisType }, state.lang);
    }));

  /* startAnalysis catches its own analysis errors; this guard covers a throw
     outside that try (e.g. a DOM failure) so it is never a silent no-op. */
  $('analyzeBtn').addEventListener('click', () =>
    startAnalysis().catch(e => { console.error(e); handleFatalError(e); }));
  $('copyBtn').addEventListener('click', copyResults);
  $('downloadBtn').addEventListener('click', downloadPDF);
  $('shareBtn').addEventListener('click', shareResults);
  initRipple();
  views.buildPipeline(state.lang);
}

function toggleSecret(input, button) {
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  button.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
  button.setAttribute('aria-label', T[state.lang][show ? 'hideKey' : 'showKey']);
}

function setBusy(busy) {
  const btn = $('analyzeBtn');
  btn.disabled = busy;
  btn.classList.toggle('btn-busy', busy);
  const label = btn.querySelector('span');
  label.textContent = busy ? T[state.lang].analyzing : T[state.lang].analyzeButton;
}

/* ---------- rendering helpers ---------- */

function renderChart() {
  const container = $('liveChartContainer');
  try {
    renderTradingView(container, {
      symbol: state.data.info.tradingViewSymbol,
      theme: state.theme,
      locale: state.lang === 'fa' ? 'fa_IR' : 'en',
      unavailable: state.data.info.tvUnavailable,
      fallbackMessage: T[state.lang].chartNotListed,
    });
    /* An intentionally skipped chart is not a network failure, so chartFailed stays false. */
    state.chartFailed = false;
  } catch (e) {
    state.chartFailed = true;
    renderChartFallback(container, T[state.lang].chartUnavailable);
  }
}

function searchStatusOf(webSearch) {
  if (!webSearch) return null;
  if (webSearch.ok) return 'ok';
  return webSearch.error === 'NO_SEARCH_KEY' ? 'skipped' : 'failed';
}

function rerenderResults() {
  const d = state.data;
  /* Language can be toggled while an analysis is still in flight; renderStats
     dereferences quote.price, so switching mid-run used to throw a TypeError
     and abort the rest of the re-render. */
  if (!d.info || !d.quote) return;
  d.info = cryptoInfo(d.info.id, state.lang);
  views.renderStats({ quote: d.quote, cryptoInfo: d.info, fearGreed: d.fearGreedIndex }, state.lang);
  views.renderIndicators(d.technicalIndicators, state.lang);
  views.renderLevels(d, state.lang);
  views.renderVolumeProfile(d.technicalIndicators?.volumeProfile, state.lang);
  views.renderFibonacci(d.technicalIndicators?.fibonacci, d.quote?.price, state.lang);
  views.renderBlockchain(d.blockchain, state.lang, { formatHashRate }, d.onchainSupport);
  views.renderMetrics({ nvtRatio: d.nvtRatio, mayerMultiple: d.mayerMultiple, puellMultiple: d.puellMultiple, onchainSupport: d.onchainSupport }, state.lang, { getMetricClass, getNVTDescription, getMayerDescription, getPuellDescription });
  if (d.news) views.renderNews(d.news, state.lang);
  const searchStatus = searchStatusOf(d.webSearch);
  if (searchStatus) views.renderSearch(d.webSearch.ok ? d.webSearch.items : [], searchStatus, state.lang);
  if (d.report) {
    views.renderReport(d.report, state.lang, modelLabel());
    views.renderRecommendation(d.report, state.lang);
  }
}

function modelLabel() {
  const m = MODELS.find(x => x.id === state.model);
  return m ? m.label : '';
}

/* ---------- pipeline ---------- */

async function startAnalysis() {
  if (state.running) return;
  state.apiKey = $('apiKey').value.trim();
  if (!state.apiKey) {
    toast(T[state.lang].apiKeyLabel + ' — ' + (state.lang === 'fa' ? 'لزومی دارد' : 'required'), 'error');
    $('apiKey').focus();
    return;
  }
  saveApiKey(state.apiKey);

  /* Optional field: when it is empty the search step is skipped outright and
     the run behaves exactly as it did before this feature existed. */
  state.webSearchKey = $('webSearchKey').value.trim();
  saveWebSearchKey(state.webSearchKey);

  state.running = true;
  setBusy(true);
  views.resetPipeline();
  views.showResultsSkeleton();
  revealCards($('results'));

  const info = cryptoInfo(state.crypto, state.lang);
  state.data = { info, analysisType: state.analysisType, renderSnapshot: false };
  state.chartFailed = false;

  // Chart and TradingView are independent — paint immediately.
  renderChart();

  try {
    // STEP 1: live quote + history in parallel
    views.setStep('price', 'active');
    const [quote, historical] = await Promise.all([
      fetchRealTimeData(info),
      fetchHistoricalData(info).catch(e => {
        console.warn('Historical data failed:', e);
        return [];
      }),
    ]);
    const filled = await enrichFromCoinGecko(info, quote);
    // Prompt builder and views read quote fields at the top level of cryptoData
    Object.assign(state.data, {
      price: filled.price,
      priceChange24h: filled.priceChange24h ?? 0,
      volume24h: filled.volume24h ?? 0,
      marketCap: filled.marketCap ?? 0,
      // Supply/ATH/rank were never propagated, so the prompt always said "unknown".
      circulatingSupply: filled.circulatingSupply ?? null,
      maxSupply: filled.maxSupply ?? null,
      ath: filled.ath ?? null,
      atl: filled.atl ?? null,
      marketCapRank: filled.marketCapRank ?? null,
      historicalData: historical,
    });
    state.data.quote = filled;
    state.data.historicalData = historical;
    views.renderStats({ quote: filled, cryptoInfo: info, fearGreed: null }, state.lang);
    state.data.renderSnapshot = true;
    views.setStep('price', 'done');

    // STEP 2: indicators (local computation, instant once data exists)
    views.setStep('indicators', 'active');
    if (historical.length >= 2) {
      const calc = computeAllIndicators(historical);
      Object.assign(state.data, calc);
      views.renderIndicators(calc.technicalIndicators, state.lang);
      views.renderLevels(state.data, state.lang);
      views.renderVolumeProfile(calc.technicalIndicators.volumeProfile, state.lang);
      views.renderFibonacci(calc.technicalIndicators.fibonacci, filled.price, state.lang);
    } else {
      ['indicatorsGrid', 'levelsContent', 'volumeProfileContent', 'fibonacciContent']
        .forEach(id => views.cardFallback(id, T[state.lang].noData));
    }
    views.setStep('indicators', 'done');

    // STEP 3+4: blockchain & news/f&G in parallel (non-fatal)
    views.setStep('chain', 'active');
    views.setStep('news', 'active');
    views.setStep('search', 'active');
    const [bcRes, fgRes, newsRes, searchRes] = await Promise.allSettled([
      fetchBlockchainData({ cryptoInfo: info }),
      fetchFearGreedIndex(),
      fetchCryptoNews({ language: state.lang }),
      /* Shares the batch so the ~1.5 s search latency overlaps the other
         services instead of adding to the run. */
      runWebSearch({ apiKey: state.webSearchKey, cryptoInfo: info, lang: state.lang }),
    ]);
    const support = onchainSupportFor(info.symbol);
    state.data.onchainSupport = support;
    /* A grey "Blockchain" step reads as a failed run, so mark it done when the
       asset simply has no free on-chain source; leave it pending only when a
       supported chain actually failed to answer. */
    views.setStep('chain', support.hasChainStats
      ? (bcRes.status === 'fulfilled' && bcRes.value ? 'done' : '')
      : 'done');
    views.setStep('news', newsRes.status === 'fulfilled' && newsRes.value?.length ? 'done' : '');

    /* Metrics are computed even when the chain fetch failed or is unsupported:
       Mayer is price/SMA-200 from the market feed, so gating it on on-chain data
       left TRON, xStocks and every PoS alt with an empty metrics card. */
    state.data.blockchain = bcRes.status === 'fulfilled' ? bcRes.value : null;
    const metrics = calculateAdvancedNetworkMetrics({ cryptoInfo: info, cryptoData: state.data });
    Object.assign(state.data, metrics);
    views.renderBlockchain(state.data.blockchain, state.lang, { formatHashRate }, support);
    views.renderMetrics(metrics, state.lang, { getMetricClass, getNVTDescription, getMayerDescription, getPuellDescription });

    state.data.fearGreedIndex = fgRes.status === 'fulfilled' ? fgRes.value : 50;
    state.data.news = newsRes.status === 'fulfilled' ? newsRes.value : [];
    views.renderStats({ quote: state.data.quote, cryptoInfo: info, fearGreed: state.data.fearGreedIndex }, state.lang);
    views.renderNews(state.data.news, state.lang);

    /* Search is the only step whose absence the user can choose, so a missing
       key gets its own neutral card state and no toast at all. */
    const webSearch = searchRes.status === 'fulfilled' && searchRes.value
      ? searchRes.value
      : { ok: false, error: 'SEARCH_FAILED' };
    state.data.webSearch = webSearch;
    const searchStatus = searchStatusOf(webSearch);
    views.setStep('search', webSearch.ok ? 'done' : '');
    views.renderSearch(webSearch.ok ? webSearch.items : [], searchStatus, state.lang);
    if (searchStatus === 'failed') {
      const dict = T[state.lang];
      const notice = {
        INVALID_SEARCH_KEY: [dict.searchToastInvalidKey, 'error'],
        SEARCH_RATE_LIMIT: [dict.searchToastRateLimit, 'info'],
      }[webSearch.error] || [dict.searchToastFailed, 'info'];
      toast(notice[0], notice[1]);
    }

    // STEP 5: AI report
    views.setStep('ai', 'active');
    const prompt = buildPrompt({
      cryptoInfo: info,
      cryptoData: state.data,
      analysisType: state.analysisType,
      language: state.lang,
      webSearch,
    });
    const ctrl = new AbortController();
    /* The exchange is now up to three stitched requests (initial + two automatic
       continuations), so a single 180s budget aborted legitimate resumes. */
    const aiTimer = setTimeout(() => ctrl.abort(), 300000);
    let report;
    try {
      const { text, truncated } = await runAIAnalysis({ apiKey: state.apiKey, model: state.model, prompt, signal: ctrl.signal });
      report = truncated ? `${text}\n\n---\n\n${T[state.lang].truncatedNote}` : text;
    } finally {
      clearTimeout(aiTimer);
    }
    state.data.report = report;
    views.renderReport(report, state.lang, modelLabel());
    views.renderRecommendation(report, state.lang);
    views.setStep('ai', 'done');

    revealCards($('results'));
    toast(state.lang === 'fa' ? 'تحلیل تکمیل شد' : 'Analysis complete', 'success');
  } catch (err) {
    console.error('Analysis failed:', err);
    handleFatalError(err);
  } finally {
    state.running = false;
    setBusy(false);
  }
}

function handleFatalError(err) {
  let title = T[state.lang].errorTitle;
  let msg = err.message || String(err);
  if (err.code === 'INVALID_KEY') msg = state.lang === 'fa' ? 'کلید API نامعتبر است. آن را از openrouter.ai/settings/keys بررسی کنید.' : 'Invalid API key. Check it at openrouter.ai/settings/keys.';
  else if (err.code === 'NO_CREDITS') msg = state.lang === 'fa' ? 'اعتبار OpenRouter کافی نیست؛ مدل رایگان را امتحان کنید.' : 'Not enough OpenRouter credits — try a free model.';
  else if (err.code === 'RATE_LIMIT') msg = state.lang === 'fa' ? 'محدودیت نرخ درخواست؛ چند دقیقه صبر کنید.' : 'Rate limited — wait a few minutes and retry.';
  else if (err.name === 'AbortError') msg = state.lang === 'fa' ? 'درخواست بیش از حد طول کشید و لغو شد.' : 'Request timed out and was aborted.';
  else if (err.message === 'NETWORK_UNAVAILABLE') msg = state.lang === 'fa' ? 'اتصال اینترنت برقرار نیست؛ ارتباط با OpenRouter ناموفق بود.' : 'Network unavailable — could not reach OpenRouter.';
  else if (msg === 'All price sources failed') {
    msg = (state.lang === 'fa'
      ? 'دریافت قیمت از همه منابع (Binance/CoinGecko/CoinPaprika) ناموفق بود.'
      : 'Price fetch failed across all sources (Binance/CoinGecko/CoinPaprika).');
    if (err.details) msg += ` (${err.details})`;
  }

  views.cardFallback('reportContent', `${title}: ${msg}`);
  /* Only a chart failure may overwrite the chart. Keying this on the absence of
     err.code destroyed a working TradingView embed on any timeout/offline error. */
  if (state.chartFailed) views.cardFallback('liveChartContainer', msg);
  toast(`${title}: ${msg}`, 'error', 6000);
}

/* ---------- actions ---------- */

function copyResults() {
  const text = state.data.report || $('reportContent')?.innerText || '';
  if (!text) { toast(T[state.lang].noData, 'info'); return; }
  navigator.clipboard.writeText(text)
    .then(() => toast(T[state.lang].copied, 'success'))
    .catch(() => toast(state.lang === 'fa' ? 'کپی ناموفق بود' : 'Copy failed', 'error'));
}

async function downloadPDF() {
  const { jsPDF } = window.jspdf || {};
  const results = $('results');
  if (!jsPDF || results.hidden) { toast(T[state.lang].noData, 'info'); return; }
  toast(T[state.lang].pdfPreparing, 'info');
  document.body.classList.add('pdf-mode');
  try {
    // FIX vs legacy: no allowTaint (which tainted the canvas and made
    // toDataURL throw SecurityError). useCORS only; on failure fall back to
    // a text-only PDF of the AI report.
    const canvas = await window.html2canvas(results, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: state.theme === 'dark' ? '#070b14' : '#f8f9fa',
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const w = 210, h = 295;
    const imgH = (canvas.height * w) / canvas.width;
    let left = imgH, pos = 0;
    pdf.addImage(imgData, 'PNG', 0, pos, w, imgH);
    left -= h;
    while (left >= 0) { pos = left - imgH; pdf.addPage(); pdf.addImage(imgData, 'PNG', 0, pos, w, imgH); left -= h; }
    pdf.save(`${state.data.info?.symbol || 'crypto'}_analysis_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast(T[state.lang].pdfDone, 'success');
  } catch (e) {
    console.warn('html2canvas failed, using text PDF fallback:', e);
    const pdf = new jsPDF();
    const text = (state.data.report || '').replace(/[#*_>`]/g, '');
    const lines = pdf.splitTextToSize(text, 180);
    let page = 1;
    pdf.setFontSize(10);
    lines.forEach((line, i) => {
      if (i % 55 === 0 && i > 0) pdf.addPage();
      pdf.text(line, 15, 15 + (i % 55) * 5);
    });
    pdf.save(`${state.data.info?.symbol || 'crypto'}_analysis.md.pdf`);
    toast(T[state.lang].pdfDone, 'success');
  } finally {
    document.body.classList.remove('pdf-mode');
  }
}

async function shareResults() {
  const text = state.data.report || '';
  if (navigator.share) {
    try { await navigator.share({ title: T[state.lang].title, text, url: location.href }); } catch { /* cancelled */ }
  } else {
    await navigator.clipboard.writeText(`${text}\n${location.href}`).catch(() => {});
    toast(state.lang === 'fa' ? 'لینک و نتیجه کپی شد' : (T[state.lang].shareUnsupported), 'info');
  }
}

/* ---------- boot ---------- */

document.addEventListener('DOMContentLoaded', () => {
  initChrome();
  buildCombos();
  document.querySelectorAll('.sidebar .card').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--i', i);
  });
  revealCards(document);
});
