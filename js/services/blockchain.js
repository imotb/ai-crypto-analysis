/**
 * Blockchain / news / network-metrics data services.
 * Pure ES module extracted from script.js (CryptoAnalyzer).
 * No `this` state: every function takes explicit parameters and returns data.
 */

import { fetchJson } from './http.js';

const BLOCKCHAIR_SLUGS = {
    'LTC': 'litecoin',
    'BCH': 'bitcoin-cash',
    'DOGE': 'dogecoin',
    'DASH': 'dash',
    'ADA': 'cardano',
    'DOT': 'polkadot',
    'XRP': 'ripple',
    'EOS': 'eos',
    'XLM': 'stellar',
    'ZEC': 'zcash',
    'XMR': 'monero'
};

/* Blockchair reports volume in the coin's base unit, so the divisor differs per
   chain. Assuming 1e6 for everything was off by 10x–100x for DOT/XMR/ZEC/XLM. */
const BLOCKCHAIR_DECIMALS = {
    bitcoin: 8, 'bitcoin-cash': 8, 'bitcoin-sv': 8, litecoin: 8, dogecoin: 8, dash: 8,
    zcash: 8, monero: 12, polkadot: 10, stellar: 7, cardano: 6, ripple: 6, eos: 4,
};

// ---------------------------------------------------------------------------
// News
// ---------------------------------------------------------------------------

export function getDefaultNews() {
    return [
        {
            title: '📈 بازار ارزهای دیجیتال در نوسان',
            source: 'Crypto Analysis',
            date: new Date(),
            description: 'تحلیل تکنیکال نشان‌دهنده فرصت‌های معاملاتی مناسب در بازار است.',
            link: '#',
            important: false
        }
    ];
}

function toNewsItem(item) {
    /* The raw-RSS fallback can yield an empty pubDate; new Date('') is Invalid
       Date and the UI printed "Invalid Date" as the publish date. */
    const parsed = new Date(item.pubDate);
    const date = Number.isNaN(parsed.getTime()) ? new Date() : parsed;
    return {
        title: item.title,
        source: 'CoinTelegraph',
        date,
        description: String(item.description || '').replace(/<[^>]*>/g, '').substring(0, 100) + '...',
        link: item.link,
        important: item.categories && (item.categories.includes('BTC') || item.categories.includes('Markets') || item.title.includes('Bitcoin'))
    };
}

/**
 * Very small regex-based RSS <item> extractor used only by the allorigins fallback.
 */
function parseRssItems(xmlText) {
    const items = [];
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    for (const raw of itemMatches) {
        const pick = (tag) => {
            const m = raw.match(new RegExp('<' + tag + '>([\\s\\S]*?)</' + tag + '>'));
            if (!m) return '';
            let value = m[1];
            const cdata = value.match(/<!\[CDATA\[([\s\S]*?)\]\]>/);
            if (cdata) value = cdata[1];
            return value.replace(/<[^>]*>/g, '').trim();
        };
        const title = pick('title');
        const link = pick('link');
        if (!title || !link) continue;
        items.push({
            title,
            link,
            pubDate: pick('pubDate'),
            description: pick('description'),
            categories: raw.includes('<category>') ? [raw.includes('BTC') ? 'BTC' : 'Markets'] : []
        });
    }
    return items;
}

/**
 * Fetch CoinTelegraph news.
 * Returns an array of { title, source, date, description, link, important }.
 * Fallback chain: rss2json -> allorigins raw RSS -> default news.
 */
export async function fetchCryptoNews({ language } = {}) {
    try {
        const data = await fetchJson('https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss');
        const newsItems = (data.items || []).slice(0, 8);
        return newsItems.map(toNewsItem);
    } catch (error) {
        console.warn('Error fetching news (rss2json), trying allorigins fallback:', error);
    }

    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 8000);
        let xmlText = '';
        try {
            const response = await fetch(
                'https://api.allorigins.win/raw?url=' + encodeURIComponent('https://cointelegraph.com/rss'),
                { signal: controller.signal }
            );
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            xmlText = await response.text();
        } finally {
            clearTimeout(timer);
        }
        const items = parseRssItems(xmlText).slice(0, 8);
        if (items.length === 0) throw new Error('No RSS items parsed');
        return items.map(toNewsItem);
    } catch (error) {
        console.warn('Error fetching news (allorigins fallback):', error);
        return getDefaultNews();
    }
}

// ---------------------------------------------------------------------------
// Fear & Greed
// ---------------------------------------------------------------------------

/**
 * Returns the Fear & Greed index as a number (50 on any error).
 */
export async function fetchFearGreedIndex() {
    try {
        const data = await fetchJson('https://api.alternative.me/fng/');
        const value = parseInt(data?.data?.[0]?.value, 10);
        return Number.isNaN(value) ? 50 : value;
    } catch (error) {
        console.warn('Error fetching Fear & Greed Index:', error);
        return 50;
    }
}

// ---------------------------------------------------------------------------
// Blockchain data
// ---------------------------------------------------------------------------

/**
 * BTC network stats from blockchain.info. Returns the raw stats object or null.
 */
export async function fetchBTCStats() {
    try {
        return await fetchJson('https://api.blockchain.info/stats');
    } catch (error) {
        console.warn('Error fetching BTC stats:', error);
        return null;
    }
}

/**
 * Blockchair stats (no API key). Returns the blockchain data object; throws on error.
 */
export async function fetchBlockchairData(slug) {
    const json = await fetchJson(`https://api.blockchair.com/${slug}/stats`, { timeoutMs: 8000 });
    const data = json.data || {};

    /* Blockchair's free tier omits volume for many chains (monero, stellar, …).
       Returning null keeps the card honest instead of inventing a $0 figure. */
    const rawVolume = parseFloat(data.volume_24h_approximate ?? data.volume_24h ?? 0);
    const priceUsd = parseFloat(data.market_price_usd || 0);
    const decimals = BLOCKCHAIR_DECIMALS[slug] ?? 8;
    const volumeUsd = rawVolume > 0 && priceUsd > 0
        ? (rawVolume / 10 ** decimals) * priceUsd
        : null;

    const num = v => (v == null ? null : Number(v));
    return {
        networkDifficulty: num(data.difficulty) ?? 0,
        hashRate: parseFloat(data.hashrate_24h || data.hashrate || 0),
        transactionCount: parseInt(data.transactions_24h ?? data.transactions ?? 0, 10),
        activeAddresses: parseInt(data.address_count ?? data.active_addresses ?? 0, 10),
        transactionVolume: volumeUsd
    };
}

/**
 * Ethereum stats from Blockscout. Returns the blockchain data object; throws on error.
 */
export async function fetchEthereumData() {
    try {
        const data = await fetchJson('https://eth.blockscout.com/api/v2/stats');

        const txCountToday = parseInt(data.transactions_today || 0);
        const gasUsedToday = parseFloat(data.gas_used_today || 0);
        const avgGasPriceGwei = parseFloat(data.gas_prices?.average || 0);
        const txVolumeUsd = avgGasPriceGwei > 0 && gasUsedToday > 0
            ? (gasUsedToday * avgGasPriceGwei * 1e-9 * parseFloat(data.coin_price || 0))
            : 0;

        return {
            networkDifficulty: 0,
            hashRate: 0,
            transactionCount: txCountToday,
            activeAddresses: parseInt(data.total_addresses || 0),
            transactionVolume: txVolumeUsd
        };
    } catch (error) {
        console.error('Error fetching Ethereum data:', error);
        throw new Error('Error fetching Ethereum data');
    }
}

/**
 * Fetch blockchain data for a coin.
 * Returns { networkDifficulty, hashRate, transactionCount, activeAddresses, transactionVolume }
 * or null when unavailable. Per-source failures degrade to null (partial-safe).
 */
export async function fetchBlockchainData({ cryptoInfo } = {}) {
    try {
        const symbol = cryptoInfo && cryptoInfo.symbol;

        if (symbol === 'BTC') {
            const stats = await fetchBTCStats();
            if (stats) {
                /* total_btc_sent is in satoshis. Using it raw displayed "$81.50T"
                   for an ~$6B day and made NVT read as permanently oversold. */
                const volumeUsd = parseFloat(stats.estimated_transaction_volume_usd)
                    || ((parseFloat(stats.total_btc_sent) / 1e8) * parseFloat(stats.market_price_usd || 0));
                return {
                    networkDifficulty: stats.difficulty,
                    hashRate: stats.hash_rate,
                    transactionCount: stats.n_tx,
                    activeAddresses: null,
                    transactionVolume: volumeUsd > 0 ? volumeUsd : null,
                    minersRevenueUsd: parseFloat(stats.miners_revenue_usd) || null,
                };
            }
            return null;
        } else if (symbol === 'ETH') {
            try {
                return await fetchEthereumData();
            } catch (error) {
                console.warn('Ethereum data fetch failed:', error);
                return null;
            }
        } else if (BLOCKCHAIR_SLUGS[symbol]) {
            try {
                return await fetchBlockchairData(BLOCKCHAIR_SLUGS[symbol]);
            } catch (error) {
                console.warn(`Blockchair data fetch failed for ${symbol}:`, error);
                return null;
            }
        }
        return null;
    } catch (error) {
        console.warn('Blockchain data fetch failed:', error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// Advanced network metrics (pure calculation over already-fetched data)
// ---------------------------------------------------------------------------

/**
 * Computes advanced on-chain metrics from fetched data.
 * Returns { nvtRatio, mayerMultiple, puellMultiple } — the same fields
 * displayAdvancedMetrics() reads (0 means "no data", same as original).
 */
export function calculateAdvancedNetworkMetrics({ cryptoInfo, cryptoData } = {}) {
    try {
        const blockchain = cryptoData && cryptoData.blockchain;
        if (!blockchain) {
            console.warn('No blockchain data available for advanced metrics');
            return { nvtRatio: 0, mayerMultiple: 0, puellMultiple: 0 };
        }

        const price = cryptoData.price;
        const marketCap = cryptoData.marketCap;

        // NVT Ratio (Network Value to Transactions)
        let nvtRatio = 0;
        if (blockchain.transactionVolume && price && marketCap && blockchain.transactionVolume > 0) {
            nvtRatio = marketCap / blockchain.transactionVolume;
        }

        // Mayer Multiple using real SMA 200
        let mayerMultiple = 0;
        const sma200 = cryptoData.technicalIndicators && cryptoData.technicalIndicators.sma200;
        if (price && sma200 && sma200 > 0) {
            mayerMultiple = price / sma200;
        } else {
            console.warn('Real SMA200 not available or is zero, cannot calculate Mayer Multiple.');
        }

        /* Puell Multiple = daily issuance USD / its 365-day moving average. The
           API gives no 365-day issuance history, so the previous approximation
           (x / (x*0.8)) always returned the constant 1.25. Report "no data"
           instead of a fabricated reading. */
        return { nvtRatio, mayerMultiple, puellMultiple: 0 };
    } catch (error) {
        console.error('Error in calculateAdvancedNetworkMetrics:', error);
        return { nvtRatio: 0, mayerMultiple: 0, puellMultiple: 0 };
    }
}

// ---------------------------------------------------------------------------
// Presentation helpers (exported for reuse by the UI layer)
// ---------------------------------------------------------------------------

export function formatHashRate(hashRate) {
    if (hashRate >= 1e18) return (hashRate / 1e18).toFixed(2) + ' EH/s';
    if (hashRate >= 1e15) return (hashRate / 1e15).toFixed(2) + ' PH/s';
    if (hashRate >= 1e12) return (hashRate / 1e12).toFixed(2) + ' TH/s';
    return (hashRate / 1e9).toFixed(2) + ' GH/s';
}

export function getNetworkHealthClass(value, type) {
    if (!value) return 'health-unknown';

    const thresholds = {
        hashRate: { high: 100000000000000, medium: 50000000000000 },
        transactions: { high: 100000, medium: 50000 },
        addresses: { high: 500000, medium: 250000 }
    };

    const threshold = thresholds[type];
    if (!threshold) return 'health-unknown';

    if (value >= threshold.high) return 'health-excellent';
    if (value >= threshold.medium) return 'health-good';
    if (value > 0) return 'health-fair';
    return 'health-poor';
}

export function getNetworkHealthStatus(value, type, language = 'fa') {
    if (!value) return language === 'fa' ? 'نامشخص' : 'Unknown';

    const status = {
        'health-excellent': language === 'fa' ? 'عالی' : 'Excellent',
        'health-good': language === 'fa' ? 'خوب' : 'Good',
        'health-fair': language === 'fa' ? 'متوسط' : 'Fair',
        'health-poor': language === 'fa' ? 'ضعیف' : 'Poor',
        'health-unknown': language === 'fa' ? 'نامشخص' : 'Unknown'
    };

    return status[getNetworkHealthClass(value, type)];
}

export function getMetricClass(value, type) {
    if (!value) return 'neutral';

    switch (type) {
        case 'nvt':
            return value > 150 ? 'overbought' : value < 50 ? 'oversold' : 'neutral';
        case 'mayer':
            return value > 2.4 ? 'overbought' : value < 1.0 ? 'oversold' : 'neutral';
        case 'puell':
            return value > 4.0 ? 'overbought' : value < 0.5 ? 'oversold' : 'neutral';
        default:
            return 'neutral';
    }
}

export function getNVTDescription(value, language = 'fa') {
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

export function getMayerDescription(value, language = 'fa') {
    if (!value) return language === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';

    if (language === 'fa') {
        if (value > 2.4) return 'قیمت نسبت به میانگین 200 روزه بسیار بالا است';
        if (value < 1.0) return 'قیمت نسبت به میانگین 200 روزه پایین است';
        return 'قیمت در محدوده سالم نسبت به میانگین 200 روزه';
    } else {
        if (value > 2.4) return 'Price is very high relative to 200-day moving average';
        if (value < 1.0) return 'Price is low relative to 200-day moving average';
        return 'Price is healthy relative to 200-day moving average';
    }
}

export function getPuellDescription(value, language = 'fa') {
    if (!value) return language === 'fa' ? 'داده‌ای موجود نیست' : 'No data available';

    if (language === 'fa') {
        if (value > 4.0) return 'درآمد ماینرها بسیار بالاست - احتمال اصلاح قیمت';
        if (value < 0.5) return 'درآمد ماینرها بسیار پایین است - احتمال بهبود قیمت';
        return 'درآمد ماینرها در محدوده سالم';
    } else {
        if (value > 4.0) return 'Miner revenue is very high - potential price correction';
        if (value < 0.5) return 'Miner revenue is very low - potential price improvement';
        return 'Miner revenue is in healthy range';
    }
}
