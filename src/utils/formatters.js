// src/utils/formatters.js

/**
 * Prize formatting utilities for the public display app.
 *
 * Two formats are used across the UI:
 *  - Full:  "Rs. 1,000,000.00"  → TeamInfoBar, ResultsScreen, PrizeLadder
 *  - Short: "Rs. 1M"            → TeamList (space-constrained)
 */

const CURRENCY = 'Rs.';
const LOCALE = 'en-LK';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Safely coerces a value to a finite number.
 * Returns 0 for anything that isn't a valid finite number.
 *
 * @param {unknown} value
 * @returns {number}
 */
const toSafeNumber = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Formats a prize amount with locale-aware thousands separators and
 * exactly 2 decimal places.
 *
 * @param {number} amount - Prize in Rs.
 * @returns {string} e.g. "Rs. 1,000,000.00"
 *
 * @example
 * formatPrize(1000000) // "Rs. 1,000,000.00"
 * formatPrize(2000)    // "Rs. 2,000.00"
 * formatPrize(500)     // "Rs. 500.00"
 * formatPrize(0)       // "Rs. 0.00"
 */
export const formatPrize = (amount) => {
  const n = toSafeNumber(amount);
  return `${CURRENCY} ${n.toLocaleString(LOCALE, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formats a prize amount in a compact short form for space-constrained UI.
 *
 * Thresholds:
 *  ≥ 1,000,000 → "Rs. 1M", "Rs. 1.5M"
 *  ≥ 1,000     → "Rs. 10K", "Rs. 500K"
 *  < 1,000     → "Rs. 500"  (no suffix)
 *
 * Trailing zeros after the decimal are stripped (1.0M → 1M, 1.5M → 1.5M).
 *
 * @param {number} amount - Prize in Rs.
 * @returns {string} e.g. "Rs. 1M", "Rs. 500K", "Rs. 500"
 *
 * @example
 * formatPrizeShort(1000000) // "Rs. 1M"
 * formatPrizeShort(1500000) // "Rs. 1.5M"
 * formatPrizeShort(10000)   // "Rs. 10K"
 * formatPrizeShort(500)     // "Rs. 500"
 */
export const formatPrizeShort = (amount) => {
  const n = toSafeNumber(amount);

  if (n >= 1_000_000) {
    const value = parseFloat((n / 1_000_000).toFixed(1));
    return `${CURRENCY} ${value}M`;
  }

  if (n >= 1_000) {
    const value = parseFloat((n / 1_000).toFixed(1));
    return `${CURRENCY} ${value}K`;
  }

  return `${CURRENCY} ${n}`;
};
