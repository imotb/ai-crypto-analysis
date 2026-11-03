/* Single price formatter shared by the UI and the AI prompt. Both used to carry
   their own copy with a hardcoded toFixed(8) tier plus a whitelist of "cheap"
   symbols, so any asset under 1e-8 (BABYDOGE ≈ 3.13e-10) rendered as
   $0.00000000 everywhere — price widget, indicators, levels, Fibonacci, prompt. */

const SIGNIFICANT_DIGITS = 4;
const MAX_DECIMALS = 18;

export function formatPrice(price) {
  const n = Number(price);
  if (!Number.isFinite(n) || n === 0) return '0.00';

  if (Math.abs(n) >= 1) {
    try {
      return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
    } catch {
      return n.toFixed(2);
    }
  }

  /* Enough places to expose SIGNIFICANT_DIGITS starting at the first non-zero one. */
  const decimals = -Math.floor(Math.log10(Math.abs(n))) + SIGNIFICANT_DIGITS - 1;
  if (decimals > MAX_DECIMALS) return n.toExponential(SIGNIFICANT_DIGITS - 1);
  const text = n.toFixed(decimals);
  return text.includes('.') ? text.replace(/0+$/, '').replace(/\.$/, '.00') : text;
}
