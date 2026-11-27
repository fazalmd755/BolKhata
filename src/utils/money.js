// BolKhata Money Utilities (Single Source of Truth for Currency Calculations)
// Documented Precision Strategy:
// All monetary inputs are validated as finite, positive numbers.
// Amounts can be safely represented as Rupees (with up to 2 decimal places for paise).
// Calculations internally round to 2 decimal places to eliminate floating point inaccuracies.

/**
 * Validates whether an amount is a valid positive financial transaction value
 */
export function isValidAmount(val) {
  if (val === null || val === undefined || val === '') return false;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) && num > 0;
}

/**
 * Safely parses any input into a sanitized Rupee amount with 2 decimal precision
 * @returns {number} Non-negative finite number rounded to 2 decimal places, or 0
 */
export function parseRupees(val) {
  if (val === null || val === undefined || val === '') return 0;
  const num = typeof val === 'number' ? val : Number(String(val).replace(/,/g, '').trim());
  if (!Number.isFinite(num) || isNaN(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}

/**
 * Converts rupees to integer paise (1 Rupee = 100 Paise)
 */
export function rupeesToPaise(rupees) {
  return Math.round(parseRupees(rupees) * 100);
}

/**
 * Converts integer paise back to rupees
 */
export function paiseToRupees(paise) {
  if (!Number.isFinite(paise)) return 0;
  return Math.round(paise) / 100;
}

/**
 * Formats an amount in Indian numbering system (en-IN)
 * e.g. 2500 -> "₹2,500" or "₹2,500.50"
 */
export function formatCurrency(amount, showFraction = 'auto') {
  const num = parseRupees(amount);
  const hasDecimals = num % 1 !== 0;

  const options = {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: showFraction === 'always' ? 2 : (showFraction === 'never' ? 0 : (hasDecimals ? 2 : 0))
  };

  try {
    return num.toLocaleString('en-IN', options);
  } catch (e) {
    return `₹${num.toLocaleString('en-IN')}`;
  }
}

/**
 * Returns plain currency number string formatted in en-IN without currency symbol
 * e.g. 2500 -> "2,500"
 */
export function formatNumberIndian(amount) {
  const num = parseRupees(amount);
  const hasDecimals = num % 1 !== 0;
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: hasDecimals ? 2 : 0
  });
}

/**
 * Formats amount strictly for UPI deep-link URLs (must be plain decimal with 2 decimal places)
 * e.g. 2500 -> "2500.00"
 */
export function toUpiAmount(amount) {
  const num = parseRupees(amount);
  return num.toFixed(2);
}
