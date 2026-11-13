// Pure ES module port of CryptoAnalyzer.getCurrentDateTime /
// getAnalysisTimeContext / generatePrompt (script.js lines 2742-3274).
// Behavior is identical to the original; class state is replaced by
// function parameters.

import { formatPrice } from '../format.js';

function getCurrentDateTime(language) {
    const now = new Date();

    if (language === 'fa') {
        // تاریخ شمسی برای فارسی
        const persianDate = new Intl.DateTimeFormat('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }).format(now);

        const time = new Intl.DateTimeFormat('fa-IR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        }).format(now);

        return {
            date: persianDate,
            time: time,
            full: `${persianDate} - ساعت ${time}`,
            iso: now.toISOString(),
            timestamp: now.getTime()
        };
    } else {
        // تاریخ میلادی برای انگلیسی
        const englishDate = new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        }).format(now);

        const time = new Intl.DateTimeFormat('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZoneName: 'short'
        }).format(now);

        return {
            date: englishDate,
            time: time,
            full: `${englishDate} - ${time}`,
            iso: now.toISOString(),
            timestamp: now.getTime()
        };
    }
}

// تابع کمکی برای دریافت اطلاعات زمانی تحلیل
function getAnalysisTimeContext(language) {
    const current = getCurrentDateTime(language);
    const now = new Date();

    if (language === 'fa') {
        return {
            currentDate: current.date,
            currentTime: current.time,
            currentFull: current.full,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            context: `تحلیل در تاریخ ${current.date} و ساعت ${current.time} انجام شده است. لطفاً تحلیل خود را بر اساس شرایط فعلی بازار در این تاریخ ارائه دهید.`
        };
    } else {
        return {
            currentDate: current.date,
            currentTime: current.time,
            currentFull: current.full,
            year: now.getFullYear(),
            month: now.getMonth() + 1,
            day: now.getDate(),
            context: `Analysis performed on ${current.date} at ${current.time}. Please provide your analysis based on current market conditions as of this date.`
        };
    }
}

// تابع کمکی برای فرمت‌بندی اعداد بزرگ
function formatNumber(num) {
    // Small-cap tokenized stocks reach this as low as ~$1M; hardcoding a /1e9
    // "B" suffix rendered them as $0.0B and told the model the asset was dead.
    if (num === null || num === undefined || isNaN(num)) return '0';
    if (num >= 1000000000000) {
        return (num / 1000000000000).toFixed(2) + 'T';
    } else if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    } else if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    } else {
        return num.toFixed(2);
    }
}

function formatHashRate(hashRate) {
    if (hashRate >= 1e18) return (hashRate / 1e18).toFixed(2) + ' EH/s';
    if (hashRate >= 1e15) return (hashRate / 1e15).toFixed(2) + ' PH/s';
    if (hashRate >= 1e12) return (hashRate / 1e12).toFixed(2) + ' TH/s';
    return (hashRate / 1e9).toFixed(2) + ' GH/s';
}

// تابع کمکی برای تفسیر RSI
function getRSIInterpretation(rsi, language) {
    if (language === 'fa') {
        if (rsi > 70) return 'اشباع خرید';
        if (rsi < 30) return 'اشباع فروش';
        return 'خنثی';
    } else {
        if (rsi > 70) return 'Overbought';
        if (rsi < 30) return 'Oversold';
        return 'Neutral';
    }
}

function getFearGreedText(index, language) {
    /* With no index every comparison is false and the old code fell through to
       the *worst* label ("Extreme Fear"), telling the model the market was
       panicking when the data was simply missing. */
    if (index === null || index === undefined || isNaN(index)) {
        return language === 'fa' ? 'نامشخص' : 'Unknown';
    }
    if (language === 'fa') {
        if (index > 75) return 'طمع شدید';
        if (index > 50) return 'طمع';
        if (index > 25) return 'ترس';
        return 'ترس شدید';
    } else {
        if (index > 75) return 'Extreme Greed';
        if (index > 50) return 'Greed';
        if (index > 25) return 'Fear';
        return 'Extreme Fear';
    }
}

function getNVTDescription(value, language) {
    if (!value) return language === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';

    if (language === 'fa') {
        if (value > 150) return 'ارزش شبکه نسبت به حجم تراکنش‌ها بسیار بالا است';
        if (value < 50) return 'ارزش شبکه نسبت به حجم تراکنش‌ها پایین است';
        return 'ارزش شبکه نسبت به حجم تراکنش‌ها در محدوده سالم';
    } else {
        if (value > 150) return 'Network value is very high relative to transaction volume';
        if (value < 50) return 'Network value is low relative to transaction volume';
        return 'Network value is healthy relative to transaction volume';
    }
}

function getMayerDescription(value, language) {
    if (!value) return language === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';

    if (language === 'fa') {
        if (value > 2.4) return 'قیمت نسبت به میانگین ۲۰۰ روزه بسیار بالا است';
        if (value < 1.0) return 'قیمت نسبت به میانگین ۲۰۰ روزه پایین است';
        return 'قیمت در محدوده سالم نسبت به میانگین ۲۰۰ روزه';
    } else {
        if (value > 2.4) return 'Price is very high relative to 200-day moving average';
        if (value < 1.0) return 'Price is low relative to 200-day moving average';
        return 'Price is healthy relative to 200-day moving average';
    }
}

function getPuellDescription(value, language) {
    if (!value) return language === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';

    if (language === 'fa') {
        if (value > 4.0) return 'درآمد ماینرها بسیار بالاست — احتمال اصلاح قیمت';
        if (value < 0.5) return 'درآمد ماینرها بسیار پایین است — احتمال بهبود قیمت';
        return 'درآمد ماینرها در محدوده سالم';
    } else {
        if (value > 4.0) return 'Miner revenue is very high - potential price correction';
        if (value < 0.5) return 'Miner revenue is very low - potential price improvement';
        return 'Miner revenue is in healthy range';
    }
}

const WEB_SOURCE_LABELS = {
    yahoo: 'Yahoo Finance',
    barchart: 'Barchart',
    perplexity: 'Perplexity Finance',
};

const WEB_BLOCK_LIMIT = 6000;
/* Matches the service-side snippet cap, so nothing is truncated twice. */
const SNIPPET_LIMIT_IN_PROMPT = 300;

/* One-line provenance for the skipped/failed path: the templates stay the same
   length class and the model is told, explicitly, not to wait for web data. */
function webUnavailableLine(error) {
    const reason = ['NO_SEARCH_KEY', 'INVALID_SEARCH_KEY', 'SEARCH_RATE_LIMIT', 'SEARCH_FAILED'].includes(error)
        ? error
        : 'NO_SEARCH_KEY';
    return `=== LIVE WEB SEARCH: unavailable (${reason}) — produce the analysis from panel data only. ===`;
}

function webUsageRules(todayIso) {
    return `WEB DATA USAGE RULES (MANDATORY):
1. Freshness: the block above was fetched seconds ago — treat it as today's market picture and merge it with the panel data above into ONE analysis dated today (${todayIso}).
2. Conflicts: if a web price/change differs from the panel data, report BOTH and explain the gap (panel snapshot latency vs live quote); never silently pick one.
3. Use web items for: current sentiment, today's price action, latest news/events, technical opinion & ratings (Barchart), forecasts and market context (Perplexity, Yahoo).
4. Recency: items dated within the last 72 hours outweigh older ones; undated quote-page snippets count as "live".
5. Provenance: attribute every web-sourced claim to its source, e.g. "(per Barchart)". Panel-sourced claims must cite the indicator value (e.g. "RSI(14) = 62").
6. Language: search results are in English; translate the INSIGHT into the analysis output language; do not output raw English sentences; URLs may appear only in the Sources list.
7. Never invent facts: rely only on panel data + this block; if something is missing in both, state it explicitly.
8. End the analysis with a "Sources:" list that quotes the exact URLs of the web items you actually used, one plain URL per line — naming the source alone is not acceptable.`;
}

function webItemLines(items, descLimit) {
    return items.map((item, i) => {
        const label = WEB_SOURCE_LABELS[item?.source] || 'Official Finance Source';
        const title = String(item?.title || '').replace(/\s+/g, ' ').trim() || item?.url || '(untitled)';
        const url = String(item?.url || '');
        const desc = String(item?.description || '').replace(/\s+/g, ' ').trim().slice(0, descLimit);
        return `[${i + 1}] [${label}] ${title}\n    ${url}\n    ${desc}`;
    }).join('\n');
}

/* Position of the block inside every template: after the sentiment/news data,
   before the CRITICAL NOTE. Returns '' never — it is always a usable string, so
   a caller that forgets webSearch still gets the honest one-liner. */
function buildWebBlock(webSearch, iso) {
    if (!webSearch || webSearch.ok !== true || !Array.isArray(webSearch.items) || !webSearch.items.length) {
        return webUnavailableLine(webSearch?.error);
    }
    const stamp = String(iso || new Date().toISOString());
    const todayIso = stamp.slice(0, 10);
    /* The Barchart path depends on which query plan produced these items: a
       tokenized-stock run returns /stocks/quotes/ pages, so naming the crypto
       path here would misdescribe the provenance the model is told to cite.
       Anything without a plan field (older/cached result objects) stays crypto. */
    const barchartPath = webSearch.plan === 'stock' ? 'barchart.com/stocks/quotes' : 'barchart.com/crypto/quotes';
    const header = `=== LIVE WEB SEARCH RESULTS — OFFICIAL SOURCES (fetched: ${stamp}, region: US, language: en) ===\n`
        + `Sources restricted to: finance.yahoo.com/quote | ${barchartPath} | perplexity.ai/finance\n`;
    const rules = webUsageRules(todayIso);
    /* Descriptions are the only variable-sized part, so shrink them in place
       rather than dropping items or letting the mandatory rules overflow. */
    let descLimit = SNIPPET_LIMIT_IN_PROMPT;
    let body = webItemLines(webSearch.items, descLimit);
    while (header.length + body.length + rules.length + 2 > WEB_BLOCK_LIMIT && descLimit > 40) {
        descLimit = Math.max(40, Math.floor(descLimit * 0.7));
        body = webItemLines(webSearch.items, descLimit);
    }
    return `${header}${body}\n${rules}`.slice(0, WEB_BLOCK_LIMIT);
}

export function buildPrompt({ cryptoInfo, cryptoData, analysisType, language, webSearch }) {
    // دریافت اطلاعات زمانی فعلی
    const timeContext = getAnalysisTimeContext(language);

    // استفاده از تابع جدید برای فرمت‌بندی قیمت
    /* Historical data can be empty (all price sources returned nothing), in
       which case technicalIndicators and the S/R arrays were never created and
       this used to throw "Cannot read properties of undefined (reading 'sma20')". */
    const rawIndicators = cryptoData.technicalIndicators;
    const na = language === 'fa' ? 'در دسترس نیست' : 'N/A';
    /* A delisted asset (no klines anywhere) leaves every nested indicator group
       absent as well, and the templates read bollingerBands.upper next — so the
       whole prompt build threw before the request was even sent. Defaulting the
       groups lets the fields render as "N/A" instead of the 0.00 that
       formatPrice(null) would return, which the model read as a real band. */
    const indicators = {
        ...(rawIndicators || {}),
        bollingerBands: { upper: null, middle: null, lower: null, ...(rawIndicators?.bollingerBands || {}) },
        stochastic: { k: null, d: null, ...(rawIndicators?.stochastic || {}) },
        volumeProfile: { poc: null, vah: null, val: null, levels: [], ...(rawIndicators?.volumeProfile || {}) },
        fibonacci: { levels: [], high: null, low: null, ...(rawIndicators?.fibonacci || {}) },
    };
    const fmtNum = v => (v == null || isNaN(v) ? na : String(v));
    const fmtWith$ = v => (v == null || isNaN(v) ? na : `$${formatPrice(v)}`);
    const fmtRsi = v => (v == null || isNaN(v) ? na : `${v} (${getRSIInterpretation(v, language)})`);
    const fmtFib = v => (v.levels || []).length
        ? v.levels.map(level => `${(level.level * 100).toFixed(1)}%: $${formatPrice(level.price)}`).join(', ')
        : na;
    const fmtInd = v => (v == null || isNaN(v) ? na : formatPrice(v));
    const formattedPrice = formatPrice(cryptoData.price);
    const formattedSMA20 = fmtInd(indicators.sma20);
    const formattedSMA50 = fmtInd(indicators.sma50);
    const formattedSMA200 = fmtInd(indicators.sma200); // SMA200

    // سطوح حمایت و مقاومت بر اساس نوع تحلیل
    const supportLevels = (analysisType === 'short'
        ? cryptoData.supportLevelsShort : cryptoData.supportLevelsLong) || [];
    const resistanceLevels = (analysisType === 'short'
        ? cryptoData.resistanceLevelsShort : cryptoData.resistanceLevelsLong) || [];

    const formattedSupportLevels = supportLevels.map(level =>
        `${formatPrice(level.price)} (قدرت: ${(level.strength * 100).toFixed(0)}%)`
    ).join(', ') || na;

    const formattedResistanceLevels = resistanceLevels.map(level =>
        `${formatPrice(level.price)} (قدرت: ${(level.strength * 100).toFixed(0)}%)`
    ).join(', ') || na;

    // داده‌های بلاکچین و متریک‌های پیشرفته
    const blockchainData = cryptoData.blockchain || {};
    const stats = blockchainData.stats || {};

    // فرمت‌بندی داده‌های بلاکچین با بررسی مقادیر صفر
    const formattedDifficulty = blockchainData.networkDifficulty > 0 ? formatNumber(blockchainData.networkDifficulty) : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedHashRate = blockchainData.hashRate > 0 ? formatHashRate(blockchainData.hashRate) : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedTxCount = blockchainData.transactionCount > 0 ? formatNumber(blockchainData.transactionCount) : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedActiveAddr = blockchainData.activeAddresses > 0 ? formatNumber(blockchainData.activeAddresses) : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedTxVolume = blockchainData.transactionVolume > 0 ? `$${formatNumber(blockchainData.transactionVolume)}` : (language === 'fa' ? 'در دسترس نیست' : 'N/A');

    // فرمت‌بندی متریک‌های پیشرفته با بررسی مقادیر صفر
    const formattedNVT = cryptoData.nvtRatio > 0 ? `${cryptoData.nvtRatio.toFixed(2)} (${getNVTDescription(cryptoData.nvtRatio, language)})` : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedMayer = cryptoData.mayerMultiple > 0 ? `${cryptoData.mayerMultiple.toFixed(2)} (${getMayerDescription(cryptoData.mayerMultiple, language)})` : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedPuell = cryptoData.puellMultiple > 0 ? `${cryptoData.puellMultiple.toFixed(2)} (${getPuellDescription(cryptoData.puellMultiple, language)})` : (language === 'fa' ? 'در دسترس نیست' : 'N/A');
    const formattedAvgFee = stats.average_transaction_fee > 0 ? `$${formatPrice(stats.average_transaction_fee)}` : (language === 'fa' ? 'در دسترس نیست' : 'N/A');

    // متن راهنما برای هوش مصنوعی در مورد داده‌های ناموجود
    /* The model previously invented plausible-looking NVT/Puell numbers for
       assets that have no on-chain feed at all. Naming the missing metrics and
       forbidding fabrication stops that at the prompt level. */
    const support = cryptoData.onchainSupport || {};
    const missing = [];
    if (!support.hasChainStats) missing.push(language === 'fa' ? 'داده‌های درون‌شبکه‌ای (سختی، نرخ هش، تعداد تراکنش، آدرس‌های فعال، حجم تراکنش)' : 'on-chain network stats (difficulty, hash rate, transaction count, active addresses, transaction volume)');
    if (!(cryptoData.nvtRatio > 0)) missing.push('NVT');
    if (!(cryptoData.mayerMultiple > 0)) missing.push('Mayer');
    if (!(cryptoData.puellMultiple > 0)) missing.push('Puell');
    if (!rawIndicators) missing.push(language === 'fa' ? 'همه شاخص‌های تکنیکال (RSI، MACD، باندهای بولینگر، VWAP، سطوح حمایت/مقاومت، POC، فیبوناچی)' : 'every technical indicator (RSI, MACD, Bollinger Bands, VWAP, support/resistance, POC, Fibonacci)');
    /* Provenance status of the web block itself, so dataNote stays honest when
       the search was skipped or failed instead of silently omitting the block. */
    const webStatus = webSearch?.ok ? 'ok' : (webSearch?.error === 'NO_SEARCH_KEY' ? 'skipped' : 'failed');
    if (webStatus !== 'ok') missing.push(language === 'fa' ? 'نتایج جستجوی وب زنده' : 'live web search results');
    const missingList = missing.length ? missing.join(language === 'fa' ? '، ' : ', ') : (language === 'fa' ? 'موردی' : 'none');

    const dataNote = (language === 'fa') ?
        `**نکته مهم درباره داده‌های ناموجود:** این داشبورد فقط از منابع داده رایگان و عمومی استفاده می‌کند. موارد زیر برای این دارایی محاسبه نشده و اساساً «قابل استفاده نیستند»: ${missingList}.
    - برای هیچ‌کدام از این شاخص‌ها عدد نسازید و آن‌ها را از منبع دیگری نقل نکنید؛ همه اعداد باید فقط از داده‌های همین پیام بیایند.
    - در گزارش، صریحاً و کوتاه ذکر کنید که این شاخص‌ها برای این دارایی در دسترس نیستند و تحلیل را بر پایه داده‌های موجود (تکنیکال، قیمت، حجم، احساسات بازار) انجام دهید.
    - نبود داده‌های درون‌شبکه‌ای را به‌عنوان یک ریسک یا ضعف شبکه تفسیر نکنید؛ صرفاً محدودیت منبع داده است.` :
        `**Important note about unavailable data:** this dashboard uses only free public data sources. The following are not computed for this asset and are effectively "not applicable": ${missingList}.
    - Do not invent values for any of them and do not quote them from any other source; every number must come from the data in this prompt only.
    - State briefly and explicitly that these metrics are unavailable for this asset, then base the analysis on the data that is present (technical indicators, price, volume, market sentiment).
    - Do not interpret missing on-chain data as a weakness or risk of the network; it is purely a data-source limitation.`;

    /* Inserted after the sentiment/news data section and before the CRITICAL
       NOTE in all four templates — a pure block insertion, no restructuring. */
    const webBlock = buildWebBlock(webSearch, timeContext.iso);


    if (language === 'fa') {
        if (analysisType === 'short') {
            return `لطفاً یک تحلیل کوتاه‌مدت جامع و بسیار دقیق برای ارز دیجیتال ${cryptoInfo.name} (${cryptoInfo.symbol}) ارائه دهید.

    ⏰ **اطلاعات زمانی تحلیل:**
    ${timeContext.context}
    ${dataNote}

    تحلیل کوتاه‌مدت باید روی موارد زیر تمرکز کند:
    - تحلیل تکنیکال پیشرفته با داده‌های لحظه‌ای
    - تحلیل فاندامنتال شبکه بلاکچین (در صورت وجود داده)
    - شاخص‌های پیشرفته روی‌زنجیره (On-Chain) (در صورت وجود داده)
    - رفتار قیمت و حجم معاملات با جزئیات کامل
    - شاخص ترس و طمع و احساسات بازار
    - سیگنال‌های معاملاتی دقیق با مدیریت ریسک
    - Order Blocks و سطوح کلیدی با تأییدیه حجم
    - تحلیل سلامت شبکه و امنیت (در صورت وجود داده)

    📊 **داده‌های لحظه‌ای و واقعی:**
    - قیمت فعلی: $${formattedPrice}
    - تغییر قیمت ۲۴ ساعته: ${cryptoData.priceChange24h.toFixed(2)}%
    - حجم معاملات ۲۴ ساعته: $${formatNumber(cryptoData.volume24h)}
    - ارزش بازار: $${formatNumber(cryptoData.marketCap)}
    - عرضه در گردش: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'نامشخص'}

    🎯 **شاخص‌های تکنیکال پیشرفته:**
    - RSI: ${fmtRsi(indicators.rsi)}
    - MACD: ${indicators.macd ?? na}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - باندهای بولینگر: 
    بالا=${fmtWith$(indicators.bollingerBands.upper)}, 
    میانی=${fmtWith$(indicators.bollingerBands.middle)}, 
    پایین=${fmtWith$(indicators.bollingerBands.lower)}
    - استوکاستیک: K=${fmtNum(indicators.stochastic.k)}, D=${fmtNum(indicators.stochastic.d)}
    - شاخص میانگین جهت‌دار (ADX): ${fmtNum(indicators.adx)}
    - میانگین دامنه واقعی (ATR): ${fmtNum(indicators.atr)}
    - حجم تراز (OBV): ${fmtNum(indicators.obv)}
    - میانگین وزنی قیمت بر پایه حجم (VWAP): ${fmtInd(indicators.vwap)}

    ⛓️ **داده‌های پیشرفته بلاکچین:**
    - سختی شبکه: ${formattedDifficulty}
    - نرخ هش: ${formattedHashRate}
    - تعداد تراکنش‌ها: ${formattedTxCount}
    - آدرس‌های فعال: ${formattedActiveAddr}
    - حجم تراکنش‌ها: ${formattedTxVolume}

    📈 **متریک‌های پیشرفته شبکه:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}

    🎯 **سطوح کلیدی:**
    - سطوح حمایت: ${formattedSupportLevels}
    - سطوح مقاومت: ${formattedResistanceLevels}
    - Point of Control (POC): ${fmtWith$(indicators.volumeProfile.poc)}
    - Value Area High (VAH): ${fmtWith$(indicators.volumeProfile.vah)}
    - Value Area Low (VAL): ${fmtWith$(indicators.volumeProfile.val)}

    🧠 **شاخص احساسات بازار:**
    - شاخص ترس و طمع: ${cryptoData.fearGreedIndex ?? na} (${getFearGreedText(cryptoData.fearGreedIndex, language)})

    ${webBlock}

    **توجه بسیار مهم:** این تحلیل در تاریخ ${timeContext.currentDate} و ساعت ${timeContext.currentTime} انجام شده است. لطفاً تحلیل خود را کاملاً بر اساس شرایط فعلی بازار و داده‌های ارائه شده در این تاریخ انجام دهید. از اشاره به رویدادها یا شرایط تاریخی گذشته خودداری کنید.

    لطفاً تحلیل شامل موارد زیر باشد:

    🔍 **تحلیل فنی پیشرفته:**
    1. وضعیت فعلی ${cryptoInfo.name} با جزئیات کامل
    2. تحلیل تمام اندیکاتورها با سیگنال‌های دقیق
    3. شناسایی روند اصلی و روندهای فرعی
    4. تحلیل قدرت روند با استفاده از ADX و Volume

    ⛓️ **تحلیل فاندامنتال شبکه (بر اساس داده‌های موجود):**
    1. سلامت و امنیت شبکه بر اساس داده‌های بلاکچین (اگر موجود است)
    2. تحلیل فعالیت شبکه (آدرس‌های فعال، تراکنش‌ها) (اگر موجود است)
    3. ارزیابی ارزش شبکه با متریک‌های NVT و Mayer (اگر موجود است)
    4. تحلیل اقتصادی ماینرها با Puell Multiple (اگر موجود است)

    🎯 **پیشنهاد معاملاتی دقیق:**
    1. نقاط ورود دقیق با تأییدیه‌های لازم
    2. حد ضرر پویا بر اساس ATR و سطوح کلیدی
    3. اهداف سود چندگانه با احتمال موفقیت
    4. مدیریت موقعیت و سایز معامله

    ⚠️ **مدیریت ریسک پیشرفته:**
    1. شناسایی ریسک‌های کوتاه‌مدت
    2. سناریوهای مختلف قیمتی
    3. راهکارهای خروج اضطراری
    4. نسبت ریسک به ریوارد

    📊 **سناریوهای محتمل:**
    - سناریو اصلی (احتمال ۷۰٪)
    - سناریو جایگزین (احتمال ۲۰٪)
    - سناریو ریسکی (احتمال ۱۰٪)

    پاسخ را به زبان فارسی و به صورت ساختاریافته با استفاده از مارک‌داون ارائه دهید. از ### برای عناوین اصلی و ** برای تاکید استفاده کنید. در نقش یک تحلیل‌گر تکنیکال حرفه‌ای با ۱۰ سال تجربه در بازارهای مالی، تحلیل جامعی ارائه دهید که شامل نقاط ورود/خروج دقیق، مدیریت ریسک پیشرفته و سناریوهای مختلف باشد.`;
        } else {
            return `لطفاً یک تحلیل بلند‌مدت جامع و بسیار دقیق برای ارز دیجیتال ${cryptoInfo.name} (${cryptoInfo.symbol}) ارائه دهید.

    ⏰ **اطلاعات زمانی تحلیل:**
    ${timeContext.context}
    ${dataNote}

    تحلیل بلند‌مدت باید روی موارد زیر تمرکز کند:
    - تحلیل فاندامنتال عمیق پروژه و تکنولوژی (این بخش نیاز به داده خارجی ندارد و باید توسط شما انجام شود)
    - روندهای بلندمدت قیمت با داده‌های تاریخی
    - پتانسیل رشد بر اساس متریک‌های روی‌زنجیره (در صورت وجود داده)
    - تحلیل بازار، رقبا و جایگاه پروژه
    - پیش‌بینی قیمت برای ماه‌ها و سال‌های آینده
    - چرخه‌های بازار و تحلیل زمانی
    - تأثیر رویدادهای آینده و آپدیت‌ها
    - تحلیل اقتصادی توکن و مدل تورمی

    📊 **داده‌های لحظه‌ای و واقعی:**
    - قیمت فعلی: $${formattedPrice}
    - تغییر قیمت ۲۴ ساعته: ${cryptoData.priceChange24h.toFixed(2)}%
    - حجم معاملات ۲۴ ساعته: $${formatNumber(cryptoData.volume24h)}
    - ارزش بازار: $${formatNumber(cryptoData.marketCap)}
    - عرضه در گردش: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'نامشخص'}
    - حداکثر عرضه: ${cryptoData.maxSupply ? cryptoData.maxSupply.toLocaleString() : 'نامشخص'}

    🎯 **شاخص‌های تکنیکال بلندمدت:**
    - RSI: ${fmtNum(indicators.rsi)}
    - MACD: ${indicators.macd ?? na}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - باندهای بولینگر (پریود 50): 
    بالا=${fmtWith$(indicators.bollingerBands.upper)}, 
    پایین=${fmtWith$(indicators.bollingerBands.lower)}

    ⛓️ **داده‌های پیشرفته بلاکچین:**
    - سختی شبکه: ${formattedDifficulty}
    - نرخ هش: ${formattedHashRate}
    - تعداد تراکنش‌ها: ${formattedTxCount}
    - آدرس‌های فعال: ${formattedActiveAddr}
    - میانگین کارمزد تراکنش: ${formattedAvgFee}

    📈 **متریک‌های پیشرفته بلندمدت:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}
    - MVRV Ratio: N/A (داده در دسترس نیست)
    - نسبت ارزش شبکه به NWE: N/A (داده در دسترس نیست)

    🎯 **سطوح کلیدی بلندمدت:**
    - سطوح حمایت بلندمدت: ${formattedSupportLevels}
    - سطوح مقاومت بلندمدت: ${formattedResistanceLevels}
    - سطوح بازگشت فیبوناچی: ${fmtFib(indicators.fibonacci)}

    🧠 **شاخص‌های کلان بازار:**
    - شاخص ترس و طمع: ${cryptoData.fearGreedIndex ?? na} (${getFearGreedText(cryptoData.fearGreedIndex, language)})
    - دامیننس بیت‌کوین: N/A (داده در دسترس نیست)

    ${webBlock}

    **توجه بسیار مهم:** این تحلیل در تاریخ ${timeContext.currentDate} و ساعت ${timeContext.currentTime} انجام شده است. لطفاً تحلیل بلندمدت خود را با توجه به شرایط فعلی بازار و چشم‌انداز آینده بر اساس وضعیت کنونی ارائه دهید.

    لطفاً تحلیل شامل موارد زیر باشد:

    🔍 **تحلیل فاندامنتال عمیق:**
    1. ارزیابی تکنولوژی و نقشه راه پروژه
    2. تحلیل تیم توسعه‌دهندگان و شرکا
    3. بررسی کاربردپذیری و پذیرش بازار
    4. تحلیل توکنومیکس و مدل اقتصادی

    📈 **تحلیل تکنیکال بلندمدت:**
    1. شناسایی روندهای اصلی چندماهه و چندساله
    2. تحلیل چرخه‌های تاریخی قیمت
    3. شناسایی مناطق ارزشی برای سرمایه‌گذاری
    4. پیش‌بینی قیمت بر اساس مدل‌های رشد

    ⛓️ **تحلیل سلامت شبکه (بر اساس داده‌های موجود):**
    1. ارزیابی امنیت و غیرمتمرکز بودن شبکه (اگر داده موجود است)
    2. تحلیل رشد اکوسیستم و توسعه‌دهندگان
    3. بررسی فعالیت کاربران و تراکنش‌ها (اگر داده موجود است)
    4. تحلیل پایداری اقتصادی شبکه

    🎯 **استراتژی سرمایه‌گذاری:**
    1. نقاط ورود استراتژیک برای سرمایه‌گذاری
    2. استراتژی خرید پله‌ای (DCA)
    3. اهداف قیمتی کوتاه‌مدت، میان‌مدت و بلندمدت
    4. مدیریت ریسک و حفاظت از سرمایه

    🌍 **تحلیل بازار و رقابت:**
    1. بررسی جایگاه در بازار جهانی
    2. تحلیل رقبا و مزیت رقابتی
    3. تأثیر رویدادهای کلان اقتصادی
    4. سناریوهای مختلف رشد صنعت بلاکچین

    ⚠️ **ریسک‌های بلندمدت:**
    1. ریسک‌های فنی و امنیتی
    2. ریسک‌های قانونی و مقرراتی
    3. ریسک‌های بازار و رقابتی
    4. راهکارهای کاهش ریسک

    پاسخ را به زبان فارسی و به صورت ساختاریافته با استفاده از مارک‌داون ارائه دهید. از ### برای عناوین اصلی و ** برای تاکید استفاده کنید. در نقش یک تحلیل‌گر ارشد با ۱۰ سال تجربه در بازارهای مالی و تخصص در فناوری بلاکچین، تحلیل جامعی ارائه دهید که شامل ارزیابی فاندامنتال، تکنیکال و روی‌زنجیره باشد.`;
        }
    } else {
        // ... (بخش انگلیسی پرامپت با همین منطق اصلاح شده است)
        if (analysisType === 'short') {
            return `Please provide a comprehensive and highly detailed short-term analysis for the cryptocurrency ${cryptoInfo.name} (${cryptoInfo.symbol}).

    ⏰ **Analysis Time Information:**
    ${timeContext.context}
    ${dataNote}

    Short-term analysis should focus on:
    - Advanced technical analysis with real-time data
    - Blockchain network fundamental analysis (if data is available)
    - Advanced on-chain metrics (if data is available)
    - Price behavior and volume analysis with full details
    - Fear and greed index and market sentiment
    - Precise trading signals with risk management
    - Order Blocks and key levels with volume confirmation
    - Network health and security analysis (if data is available)

    📊 **Real-time Data:**
    - Current price: $${formattedPrice}
    - 24h price change: ${cryptoData.priceChange24h.toFixed(2)}%
    - 24h trading volume: $${formatNumber(cryptoData.volume24h)}
    - Market cap: $${formatNumber(cryptoData.marketCap)}
    - Circulating supply: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'Unknown'}

    🎯 **Advanced Technical Indicators:**
    - RSI: ${fmtRsi(indicators.rsi)}
    - MACD: ${indicators.macd ?? na}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - Bollinger Bands: 
    upper=${fmtWith$(indicators.bollingerBands.upper)}, 
    middle=${fmtWith$(indicators.bollingerBands.middle)}, 
    lower=${fmtWith$(indicators.bollingerBands.lower)}
    - Stochastic: K=${fmtNum(indicators.stochastic.k)}, D=${fmtNum(indicators.stochastic.d)}
    - Average Directional Index (ADX): ${fmtNum(indicators.adx)}
    - Average True Range (ATR): ${fmtNum(indicators.atr)}
    - On-Balance Volume (OBV): ${fmtNum(indicators.obv)}
    - Volume Weighted Average Price (VWAP): ${fmtInd(indicators.vwap)}

    ⛓️ **Advanced Blockchain Data:**
    - Network Difficulty: ${formattedDifficulty}
    - Hash Rate: ${formattedHashRate}
    - Transaction Count: ${formattedTxCount}
    - Active Addresses: ${formattedActiveAddr}
    - Transaction Volume: ${formattedTxVolume}

    📈 **Advanced Network Metrics:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}

    🎯 **Key Levels:**
    - Support Levels: ${formattedSupportLevels}
    - Resistance Levels: ${formattedResistanceLevels}
    - Point of Control (POC): ${fmtWith$(indicators.volumeProfile.poc)}
    - Value Area High (VAH): ${fmtWith$(indicators.volumeProfile.vah)}
    - Value Area Low (VAL): ${fmtWith$(indicators.volumeProfile.val)}

    🧠 **Market Sentiment:**
    - Fear & Greed Index: ${cryptoData.fearGreedIndex ?? na} (${getFearGreedText(cryptoData.fearGreedIndex, language)})

    ${webBlock}

    **CRITICAL NOTE:**
    This analysis was performed on ${timeContext.currentDate} at ${timeContext.currentTime}. Please provide your analysis entirely based on current market conditions and data as of this date. Do not refer to past historical events or conditions.

    Please include the following in your analysis:

    🔍 **Advanced Technical Analysis:**
    1. Current status of ${cryptoInfo.name} with complete details
    2. Analysis of all indicators with precise signals
    3. Identification of main trend and sub-trends
    4. Trend strength analysis using ADX and Volume

    ⛓️ **Network Fundamental Analysis (based on available data):**
    1. Network health and security based on blockchain data (if available)
    2. Network activity analysis (active addresses, transactions) (if available)
    3. Network value assessment using NVT and Mayer metrics (if available)
    4. Miner economics analysis with Puell Multiple (if available)

    🎯 **Precise Trading Recommendations:**
    1. Exact entry points with necessary confirmations
    2. Dynamic stop loss based on ATR and key levels
    3. Multiple profit targets with success probability
    4. Position management and trade sizing

    ⚠️ **Advanced Risk Management:**
    1. Identification of short-term risks
    2. Various price scenarios
    3. Emergency exit strategies
    4. Risk to reward ratio

    📊 **Probable Scenarios:**
    - Main Scenario (70% probability)
    - Alternative Scenario (20% probability)
    - Risk Scenario (10% probability)

    Respond in English and use structured markdown. Use ### for main headings and ** for emphasis. As a professional technical analyst with 10 years of experience in financial markets, provide a comprehensive analysis that includes precise entry/exit points, advanced risk management, and various scenarios.`;
        } else {
            return `Please provide a comprehensive and highly detailed long-term analysis for the cryptocurrency ${cryptoInfo.name} (${cryptoInfo.symbol}).

    ⏰ **Analysis Time Information:**
    ${timeContext.context}
    ${dataNote}

    Long-term analysis should focus on:
    - Deep fundamental analysis of project and technology (this part requires no external data and should be done by you)
    - Long-term price trends with historical data
    - Growth potential based on on-chain metrics (if data is available)
    - Market analysis, competitors and project positioning
    - Price prediction for months and years ahead
    - Market cycles and time analysis
    - Impact of future events and updates
    - Token economics and inflation model analysis

    📊 **Real-time Data:**
    - Current price: $${formattedPrice}
    - 24h price change: ${cryptoData.priceChange24h.toFixed(2)}%
    - 24h trading volume: $${formatNumber(cryptoData.volume24h)}
    - Market cap: $${formatNumber(cryptoData.marketCap)}
    - Circulating supply: ${cryptoData.circulatingSupply ? cryptoData.circulatingSupply.toLocaleString() : 'Unknown'}
    - Max supply: ${cryptoData.maxSupply ? cryptoData.maxSupply.toLocaleString() : 'Unknown'}

    🎯 **Long-term Technical Indicators:**
    - RSI: ${fmtNum(indicators.rsi)}
    - MACD: ${indicators.macd ?? na}
    - SMA20: $${formattedSMA20}
    - SMA50: $${formattedSMA50}
    - SMA200: $${formattedSMA200}
    - Bollinger Bands (50 period): 
    upper=${fmtWith$(indicators.bollingerBands.upper)}, 
    lower=${fmtWith$(indicators.bollingerBands.lower)}

    ⛓️ **Advanced Blockchain Data:**
    - Network Difficulty: ${formattedDifficulty}
    - Hash Rate: ${formattedHashRate}
    - Transaction Count: ${formattedTxCount}
    - Active Addresses: ${formattedActiveAddr}
    - Average Transaction Fee: ${formattedAvgFee}

    📈 **Advanced Long-term Metrics:**
    - NVT Ratio: ${formattedNVT}
    - Mayer Multiple: ${formattedMayer}
    - Puell Multiple: ${formattedPuell}
    - MVRV Ratio: N/A (Data not available)
    - Network Value to NWE Ratio: N/A (Data not available)

    🎯 **Long-term Key Levels:**
    - Long-term Support Levels: ${formattedSupportLevels}
    - Long-term Resistance Levels: ${formattedResistanceLevels}
    - Fibonacci Retracement Levels: ${fmtFib(indicators.fibonacci)}

    🧠 **Macro Market Indicators:**
    - Fear & Greed Index: ${cryptoData.fearGreedIndex ?? na} (${getFearGreedText(cryptoData.fearGreedIndex, language)})
    - Bitcoin Dominance: N/A (Data not available)

    ${webBlock}

    **CRITICAL NOTE:**
    This analysis was performed on ${timeContext.currentDate} at ${timeContext.currentTime}. Please provide your long-term analysis considering current market conditions and future outlook based on the present situation.

    Please include the following in your analysis:

    🔍 **Deep Fundamental Analysis:**
    1. Technology assessment and project roadmap
    2. Development team and partners analysis
    3. Usability and market adoption review
    4. Tokenomics and economic model analysis

    📈 **Long-term Technical Analysis:**
    1. Identification of multi-month and multi-year trends
    2. Analysis of historical price cycles
    3. Identification of value areas for investment
    4. Price prediction based on growth models

    ⛓️ **Network Health Analysis (based on available data):**
    1. Security and decentralization assessment (if data available)
    2. Ecosystem growth and developer analysis
    3. User activity and transaction analysis (if data available)
    4. Network economic sustainability analysis

    🎯 **Investment Strategy:**
    1. Strategic entry points for investment
    2. Dollar-cost averaging (DCA) strategy
    3. Short-term, medium-term and long-term price targets
    4. Risk management and capital protection

    🌍 **Market and Competition Analysis:**
    1. Global market positioning
    2. Competitor analysis and competitive advantages
    3. Impact of macroeconomic events
    4. Various blockchain industry growth scenarios

    ⚠️ **Long-term Risks:**
    1. Technical and security risks
    2. Legal and regulatory risks
    3. Market and competitive risks
    4. Risk mitigation strategies

    Respond in English and use structured markdown. Use ### for main headings and ** for emphasis. As a senior analyst with 10 years of experience in financial markets and blockchain technology expertise, provide a comprehensive analysis that includes fundamental, technical and on-chain assessment.`;
        }
    }
}
