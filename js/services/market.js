import { fetchJson } from './http.js';

/* api.binance.com blocks browser CORS; data-api.binance.vision is Binance's official CORS-enabled market-data endpoint. */
const BINANCE_API = 'https://data-api.binance.vision/api/v3';

/* Binance pair symbol from a TradingView symbol like "KUCOIN:XMRUSDT" -> "XMRUSDT".
   Only BINANCE pairs can actually be queried on Binance. */
function binanceSymbol(tradingViewSymbol) {
  const bare = tradingViewSymbol.includes(':')
    ? tradingViewSymbol.slice(tradingViewSymbol.indexOf(':') + 1)
    : tradingViewSymbol;
  return /USDT$/.test(bare) ? bare : `${bare}USDT`;
}

export function isBinancePair(tradingViewSymbol) {
  return tradingViewSymbol.startsWith('BINANCE:');
}

async function fromBinance(cryptoInfo) {
  const data = await fetchJson(
    `${BINANCE_API}/ticker/24hr?symbol=${encodeURIComponent(binanceSymbol(cryptoInfo.tradingViewSymbol))}`,
    { timeoutMs: 8000 },
  );
  return {
    price: parseFloat(data.lastPrice),
    priceChange24h: parseFloat(data.priceChangePercent),
    volume24h: parseFloat(data.quoteVolume),
    marketCap: null,
    high24h: parseFloat(data.highPrice),
    low24h: parseFloat(data.lowPrice),
    source: 'binance',
    lastUpdated: Date.now(),
  };
}

async function fromCoinGecko(cryptoInfo) {
  const data = await fetchJson(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(cryptoInfo.coingeckoId)}`
    + '&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
    { timeoutMs: 10000 },
  );
  const coin = data[cryptoInfo.coingeckoId];
  if (!coin) throw new Error('Currency data not found in CoinGecko');
  return {
    price: coin.usd,
    priceChange24h: coin.usd_24h_change,
    volume24h: coin.usd_24h_vol,
    marketCap: coin.usd_market_cap,
    source: 'coingecko',
    lastUpdated: Date.now(),
  };
}

/* FIX: paprika fallback now returns price/volume/marketCap, so the pipeline
   no longer dies with "Price data not received" when the first two sources fail. */
async function fromCoinPaprika(cryptoInfo) {
  const data = await fetchJson(
    `https://api.coinpaprika.com/v1/tickers/${encodeURIComponent(cryptoInfo.coinpaprikaId)}`,
    { timeoutMs: 10000 },
  );
  const usd = data.quotes?.USD;
  if (!usd || !usd.price) throw new Error('No USD quote in CoinPaprika');
  return {
    price: usd.price,
    priceChange24h: usd.percent_change_24h,
    volume24h: usd.volume_24h,
    marketCap: usd.market_cap,
    circulatingSupply: data.circulating_supply,
    maxSupply: data.max_supply,
    source: 'coinpaprika',
    lastUpdated: Date.now(),
  };
}

export async function fetchRealTimeData(cryptoInfo) {
  const attempts = [fromBinance, fromCoinGecko, fromCoinPaprika];
  const errors = [];
  for (const attempt of attempts) {
    if (attempt === fromBinance && !isBinancePair(cryptoInfo.tradingViewSymbol)) {
      errors.push(new Error('Not a Binance pair, skipping'));
      continue;
    }
    try {
      return await attempt(cryptoInfo);
    } catch (e) {
      errors.push(e);
      console.warn('Market source failed, trying next:', e.message);
    }
  }
  /* Keep the underlying reasons attached so a 429/403 is not reported to the
     user as a bare "All price sources failed". */
  const err = new Error('All price sources failed');
  err.cause = errors;
  err.details = errors.map(e => e.message).join(' | ');
  throw err;
}

export async function fetchHistoricalData(cryptoInfo) {
  if (isBinancePair(cryptoInfo.tradingViewSymbol)) {
    try {
      const data = await fetchJson(
        `${BINANCE_API}/klines?symbol=${encodeURIComponent(binanceSymbol(cryptoInfo.tradingViewSymbol))}&interval=1d&limit=365`,
        { timeoutMs: 12000 },
      );
      /* An empty array is a valid 200 but useless (new listing / delisted pair);
         falling through to CoinGecko is what keeps indicators available. */
      if (Array.isArray(data) && data.length) {
        return data.map(d => ({
          date: new Date(d[0]),
          dateString: new Date(d[0]).toISOString().split('T')[0],
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4]),
          volume: parseFloat(d[5]),
        }));
      }
      console.warn('Binance returned no klines, falling back to CoinGecko');
    } catch (e) {
      console.warn('Binance klines failed, falling back to CoinGecko:', e.message);
    }
  }
  const data = await fetchJson(
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(cryptoInfo.coingeckoId)}/market_chart?vs_currency=usd&days=365&interval=daily`,
    { timeoutMs: 15000 },
  );
  const closes = data.prices || [];
  if (!closes.length) throw new Error('CoinGecko returned no price history');
  const volumes = data.total_volumes || [];
  return closes.map((p, i) => ({
    date: new Date(p[0]),
    dateString: new Date(p[0]).toISOString().split('T')[0],
    open: p[1],
    high: p[1],
    low: p[1],
    close: p[1],
    // market_chart gives 24h rolling volume aligned with prices (may be 1 point shorter)
    volume: volumes[i + volumes.length - closes.length]?.[1] ?? 0,
  }));
}

/* Fill gaps (marketCap etc.) from CoinGecko without failing the pipeline. */
export async function enrichFromCoinGecko(cryptoInfo, quote) {
  if (quote.marketCap != null && quote.source === 'coingecko') return quote;
  try {
    const gecko = await fromCoinGecko(cryptoInfo);
    return {
      ...quote,
      marketCap: quote.marketCap ?? gecko.marketCap,
      priceChange24h: quote.priceChange24h ?? gecko.priceChange24h,
      volume24h: quote.volume24h ?? gecko.volume24h,
    };
  } catch {
    return quote;
  }
}
