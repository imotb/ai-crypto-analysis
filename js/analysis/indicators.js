/* Technical indicator math, ported 1:1 from the legacy CryptoAnalyzer class
   (RSI, MACD, SMA/EMA, Bollinger, Stochastic, ADX, ATR, OBV, VWAP, Ichimoku,
   Fibonacci, Volume Profile, S/R levels with order blocks). */

export function formatCalculationNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return 0;
  const number = Number(num);
  if (isNaN(number)) return 0;
  if (number === 0) return 0;
  if (Math.abs(number) < 0.000001) return parseFloat(number.toFixed(10));
  if (Math.abs(number) < 0.001) return parseFloat(number.toFixed(8));
  if (Math.abs(number) < 0.1) return parseFloat(number.toFixed(6));
  return parseFloat(number.toFixed(4));
}

export function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;
  const changes = [];
  for (let i = 1; i < prices.length; i++) changes.push(prices[i] - prices[i - 1]);
  const gains = changes.map(c => (c > 0 ? c : 0));
  const losses = changes.map(c => (c < 0 ? Math.abs(c) : 0));
  let avgGain = gains.slice(0, period).reduce((s, g) => s + g, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((s, l) => s + l, 0) / period;
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
  }
  /* A flat series gives avgGain === avgLoss === 0 → 0/0 → NaN printed as "NaN"
     in the indicators grid. A pure-rising series gives Infinity → also pinned. */
  if (avgLoss === 0) return avgGain === 0 ? 50 : 100;
  if (avgGain === 0) return 0;
  const rs = avgGain / avgLoss;
  return Math.round((100 - 100 / (1 + rs)) * 100) / 100;
}

/* Below `period` data points these return null (not the last price): SMA 200
   pretending to exist made the Mayer Multiple read a constant 1.00 "healthy". */
export function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const sum = prices.slice(-period).reduce((s, p) => s + p, 0);
  return formatCalculationNumber(sum / period);
}

export function calculateEMA(prices, period) {
  if (prices.length < period) return null;
  const multiplier = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((s, p) => s + p, 0) / period;
  for (let i = period; i < prices.length; i++) ema = (prices[i] - ema) * multiplier + ema;
  return formatCalculationNumber(ema);
}

export function calculateMACD(prices, fastPeriod = 12, slowPeriod = 26) {
  const fast = calculateEMA(prices, fastPeriod);
  const slow = calculateEMA(prices, slowPeriod);
  if (fast == null || slow == null) return null;
  return formatCalculationNumber(fast - slow);
}

export function calculateBollingerBands(prices, period = 20, stdDev = 2) {
  if (prices.length < period) return { upper: 0, middle: 0, lower: 0, bandwidth: 0 };
  const middle = calculateSMA(prices, period);
  const recent = prices.slice(-period);
  const variance = recent.reduce((s, p) => s + Math.pow(p - middle, 2), 0) / period;
  const sd = Math.sqrt(variance);
  return {
    upper: formatCalculationNumber(middle + sd * stdDev),
    middle: formatCalculationNumber(middle),
    lower: formatCalculationNumber(middle - sd * stdDev),
    bandwidth: formatCalculationNumber(((sd * 2 * stdDev) / middle) * 100),
  };
}

export function calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
  if (closes.length < kPeriod) return { k: 50, d: 50 };
  const kValues = [];
  for (let i = closes.length - kPeriod - dPeriod + 1; i < closes.length; i++) {
    if (i < kPeriod - 1) { kValues.push(50); continue; }
    const ph = highs.slice(i - kPeriod + 1, i + 1);
    const pl = lows.slice(i - kPeriod + 1, i + 1);
    const hh = Math.max(...ph);
    const ll = Math.min(...pl);
    kValues.push(hh === ll ? 50 : ((closes[i] - ll) / (hh - ll)) * 100);
  }
  const lastK = kValues.length ? kValues[kValues.length - 1] : 50;
  const tail = kValues.slice(-dPeriod);
  const d = tail.length ? tail.reduce((s, v) => s + v, 0) / tail.length : 50;
  return { k: formatCalculationNumber(lastK), d: formatCalculationNumber(d) };
}

export function smoothWilder(data, period) {
  if (data.length < period) return [];
  const smoothed = [];
  let sum = 0;
  for (let i = 0; i < period; i++) sum += data[i];
  smoothed.push(sum / period);
  for (let i = period; i < data.length; i++) {
    smoothed.push((smoothed[smoothed.length - 1] * (period - 1) + data[i]) / period);
  }
  return smoothed;
}

export function calculateATR(highs, lows, closes, period = 14) {
  if (closes.length < period + 1) return { tr: [], smoothedTR: [], atr: 0 };
  const trValues = [];
  for (let i = 1; i < closes.length; i++) {
    trValues.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1]),
    ));
  }
  const smoothedTR = smoothWilder(trValues, period);
  const last = smoothedTR.length ? smoothedTR[smoothedTR.length - 1] : 0;
  return { tr: trValues, smoothedTR, atr: formatCalculationNumber(last) };
}

export function calculateADX(highs, lows, closes, period = 14, smoothedTR) {
  if (closes.length < period * 2 || !smoothedTR || smoothedTR.length === 0) return 0;
  const plusDM = [];
  const minusDM = [];
  for (let i = 1; i < highs.length; i++) {
    const up = highs[i] - highs[i - 1];
    const down = lows[i - 1] - lows[i];
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
  }
  const offset = closes.length - smoothedTR.length;
  const sPlus = smoothWilder(plusDM.slice(offset), period);
  const sMinus = smoothWilder(minusDM.slice(offset), period);
  if (!sPlus.length || !sMinus.length) return 0;
  const dxValues = [];
  for (let i = 0; i < smoothedTR.length && i < sPlus.length; i++) {
    const tr = smoothedTR[i];
    const pDI = tr > 0 ? (sPlus[i] / tr) * 100 : 0;
    const mDI = tr > 0 ? (sMinus[i] / tr) * 100 : 0;
    const sum = pDI + mDI;
    dxValues.push(sum > 0 ? (Math.abs(pDI - mDI) / sum) * 100 : 0);
  }
  const adx = smoothWilder(dxValues, period);
  return formatCalculationNumber(adx.length ? adx[adx.length - 1] : 0);
}

export function calculateOBV(closes, volumes) {
  if (closes.length < 2 || volumes.length < 2) return 0;
  let obv = 0;
  for (let i = 1; i < closes.length; i++) {
    if (closes[i] > closes[i - 1]) obv += volumes[i] || 0;
    else if (closes[i] < closes[i - 1]) obv -= volumes[i] || 0;
  }
  return formatCalculationNumber(obv);
}

export function calculateVWAP(prices, volumes) {
  if (!prices.length || !volumes.length) return 0;
  let value = 0;
  let vol = 0;
  for (let i = 0; i < prices.length; i++) {
    value += prices[i] * (volumes[i] || 0);
    vol += volumes[i] || 0;
  }
  return vol > 0 ? formatCalculationNumber(value / vol) : 0;
}

export function calculateIchimoku(highs, lows, closes, conversionPeriod = 9, basePeriod = 26, laggingSpanPeriod = 52) {
  const zero = { conversionLine: 0, baseLine: 0, leadingSpanA: 0, leadingSpanB: 0, laggingSpan: 0 };
  if (closes.length < laggingSpanPeriod) return zero;
  const conv = (Math.max(...highs.slice(-conversionPeriod)) + Math.min(...lows.slice(-conversionPeriod))) / 2;
  const base = (Math.max(...highs.slice(-basePeriod)) + Math.min(...lows.slice(-basePeriod))) / 2;
  const spanA = (conv + base) / 2;
  const spanB = (Math.max(...highs.slice(-laggingSpanPeriod)) + Math.min(...lows.slice(-laggingSpanPeriod))) / 2;
  const lagging = closes[closes.length - 1];
  return {
    conversionLine: formatCalculationNumber(conv),
    baseLine: formatCalculationNumber(base),
    leadingSpanA: formatCalculationNumber(spanA),
    leadingSpanB: formatCalculationNumber(spanB),
    laggingSpan: formatCalculationNumber(lagging),
  };
}

export function calculateFibonacciRetracement(prices) {
  if (prices.length < 2) return { high: 0, low: 0, levels: [] };
  const recent = prices.slice(-100);
  const high = Math.max(...recent);
  const low = Math.min(...recent);
  const diff = high - low;
  const defs = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];
  return {
    high: formatCalculationNumber(high),
    low: formatCalculationNumber(low),
    levels: defs.map(level => ({ level, price: formatCalculationNumber(high - diff * level) })),
  };
}

export function calculateVolumeProfile(prices, volumes, bins = 20) {
  if (!prices.length || !volumes.length) return { levels: [], poc: 0, vah: 0, val: 0 };
  const high = Math.max(...prices);
  const low = Math.min(...prices);
  const binSize = (high - low) / bins;
  const levels = [];
  for (let i = 0; i < bins; i++) {
    const lo = low + i * binSize;
    const hi = low + (i + 1) * binSize;
    let vol = 0;
    for (let j = 0; j < prices.length; j++) {
      if (prices[j] >= lo && prices[j] <= hi) vol += volumes[j] || 0;
    }
    levels.push({ price: formatCalculationNumber((lo + hi) / 2), volume: vol });
  }
  levels.sort((a, b) => b.volume - a.volume);
  const poc = levels.length ? levels[0].price : 0;
  const total = levels.reduce((s, l) => s + l.volume, 0);
  const target = total * 0.7;
  let acc = 0, vah = 0, val = 0;
  for (const level of levels) {
    acc += level.volume;
    if (vah === 0) vah = level.price;
    val = level.price;
    if (acc >= target) break;
  }
  return { levels, poc, vah, val };
}

/* ---------- Support / Resistance ---------- */

function volumeAtPriceLevel(historical, priceLevel) {
  if (!historical?.length) return 0;
  const tolerance = priceLevel * 0.02;
  let total = 0;
  for (const d of historical) {
    if (d.low <= priceLevel + tolerance && d.high >= priceLevel - tolerance) total += d.volume || 0;
  }
  return total;
}

function levelStrength(data, index, type, historical) {
  const price = data[index];
  const tolerance = price * 0.01;
  let touches = 0, bounces = 0;
  for (let i = 0; i < data.length; i++) {
    if (Math.abs(data[i] - price) < tolerance) {
      touches++;
      if (i > 0 && i < data.length - 1) {
        if (type === 'support' && data[i - 1] > price && data[i + 1] > price) bounces++;
        else if (type === 'resistance' && data[i - 1] < price && data[i + 1] < price) bounces++;
      }
    }
  }
  let strength = touches > 0 ? (bounces / touches) * 0.7 + (touches / data.length) * 0.3 : 0;
  const volAt = volumeAtPriceLevel(historical, price);
  const avgVol = historical.reduce((s, d) => s + (d.volume || 0), 0) / (historical.length || 1);
  if (avgVol > 0) {
    strength = strength * 0.8 + (Math.min(volAt / avgVol, 2) / 2) * 0.2;
  }
  return Math.min(strength, 1);
}

function identifyOrderBlocks(historical, type) {
  if (!historical || historical.length < 5) return [];
  const blocks = [];
  for (let i = 1; i < historical.length; i++) {
    const cur = historical[i];
    const prev = historical[i - 1];
    const body = Math.abs(cur.close - cur.open);
    const upperWick = cur.high - Math.max(cur.open, cur.close);
    const lowerWick = Math.min(cur.open, cur.close) - cur.low;
    const wick = upperWick + lowerWick;
    if (cur.close > cur.open && body > wick * 1.5) {
      blocks.push({ index: i, low: cur.low, high: cur.high, volume: cur.volume || 0, kind: 'bullish', strength: prev.close > prev.open ? 0.8 : 0.6 });
    } else if (cur.close < cur.open && body > wick * 1.5) {
      blocks.push({ index: i, low: cur.low, high: cur.high, volume: cur.volume || 0, kind: 'bearish', strength: prev.close < prev.open ? 0.8 : 0.6 });
    }
  }
  const wanted = type === 'support' ? 'bullish' : 'bearish';
  return blocks
    .filter(b => b.kind === wanted)
    .sort((a, b) => b.index - a.index)
    .slice(0, 3)
    .map(b => ({
      price: type === 'support' ? b.low : b.high,
      strength: b.strength,
      volume: b.volume,
      index: b.index,
      type: 'orderblock',
    }));
}

function filterAndMergeLevels(levels) {
  const out = [];
  for (const level of levels) {
    let merged = false;
    for (let i = 0; i < out.length; i++) {
      if (Math.abs(level.price - out[i].price) / out[i].price < 0.02) {
        merged = true;
        if (level.strength > out[i].strength) out[i] = level;
        break;
      }
    }
    if (!merged) out.push(level);
  }
  return out;
}

function computeLevels(prices, timeframe, type, historical) {
  const currentPrice = prices[prices.length - 1];
  const dataPoints = timeframe === 'short' ? prices.slice(-14) : prices;
  const found = [];
  for (let i = 2; i < dataPoints.length - 2; i++) {
    const isPivot = type === 'support'
      ? dataPoints[i] < dataPoints[i - 1] && dataPoints[i] < dataPoints[i + 1] && dataPoints[i] < dataPoints[i - 2] && dataPoints[i] < dataPoints[i + 2] && dataPoints[i] < currentPrice
      : dataPoints[i] > dataPoints[i - 1] && dataPoints[i] > dataPoints[i + 1] && dataPoints[i] > dataPoints[i - 2] && dataPoints[i] > dataPoints[i + 2] && dataPoints[i] > currentPrice;
    if (isPivot) {
      found.push({
        price: dataPoints[i],
        strength: levelStrength(dataPoints, i, type, historical),
        volume: volumeAtPriceLevel(historical, dataPoints[i]),
        timeframe,
      });
    }
  }
  for (const block of identifyOrderBlocks(historical, type)) {
    if (type === 'support' ? block.price < currentPrice : block.price > currentPrice) {
      found.push({ ...block, timeframe });
    }
  }
  found.sort((a, b) => (type === 'support' ? b.price - a.price : a.price - b.price));
  const merged = filterAndMergeLevels(found);
  while (merged.length < 3) {
    const last = merged.length ? merged[merged.length - 1].price : currentPrice;
    merged.push({
      price: formatCalculationNumber(last * (type === 'support' ? 0.95 : 1.05)),
      strength: 0.5,
      volume: 0,
      timeframe,
      type: 'fibonacci',
    });
  }
  return merged.slice(0, 3);
}

/* ---------- top-level entry ---------- */
export function computeAllIndicators(historicalData) {
  if (!historicalData || historicalData.length < 2) {
    throw new Error('Historical data not available for calculating indicators.');
  }
  const closes = historicalData.map(d => d.close);
  const volumes = historicalData.map(d => d.volume || 0);
  const highs = historicalData.map(d => d.high);
  const lows = historicalData.map(d => d.low);

  const atrResult = calculateATR(highs, lows, closes, 14);

  const technicalIndicators = {
    rsi: calculateRSI(closes),
    macd: calculateMACD(closes),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    sma200: calculateSMA(closes, 200),
    ema12: calculateEMA(closes, 12),
    ema26: calculateEMA(closes, 26),
    bollingerBands: calculateBollingerBands(closes),
    stochastic: calculateStochastic(highs, lows, closes),
    adx: calculateADX(highs, lows, closes, 14, atrResult.smoothedTR),
    atr: atrResult.atr,
    obv: calculateOBV(closes, volumes),
    vwap: calculateVWAP(closes, volumes),
    ichimoku: calculateIchimoku(highs, lows, closes),
    fibonacci: calculateFibonacciRetracement(closes),
    volumeProfile: calculateVolumeProfile(closes, volumes),
  };

  return {
    technicalIndicators,
    supportLevelsShort: computeLevels(closes, 'short', 'support', historicalData),
    resistanceLevelsShort: computeLevels(closes, 'short', 'resistance', historicalData),
    supportLevelsLong: computeLevels(closes, 'long', 'support', historicalData),
    resistanceLevelsLong: computeLevels(closes, 'long', 'resistance', historicalData),
  };
}
