import { describe, it, expect } from 'vitest';
import {
  isValidAmount,
  parseRupees,
  rupeesToPaise,
  paiseToRupees,
  formatCurrency,
  formatNumberIndian,
  toUpiAmount
} from '../src/utils/money.js';

describe('money.js Utilities', () => {
  describe('isValidAmount', () => {
    it('returns true for positive integers and decimals', () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount('500')).toBe(true);
      expect(isValidAmount(450.5)).toBe(true);
      expect(isValidAmount('0.01')).toBe(true);
    });

    it('returns false for zero, negative, null, empty or invalid values', () => {
      expect(isValidAmount(0)).toBe(false);
      expect(isValidAmount('0')).toBe(false);
      expect(isValidAmount(-50)).toBe(false);
      expect(isValidAmount(null)).toBe(false);
      expect(isValidAmount(undefined)).toBe(false);
      expect(isValidAmount('')).toBe(false);
      expect(isValidAmount('abc')).toBe(false);
      expect(isValidAmount(NaN)).toBe(false);
      expect(isValidAmount(Infinity)).toBe(false);
    });
  });

  describe('parseRupees', () => {
    it('parses numeric and string rupee values rounded to 2 decimal places', () => {
      expect(parseRupees(100)).toBe(100);
      expect(parseRupees('2500')).toBe(2500);
      expect(parseRupees('1,500.50')).toBe(1500.5);
      expect(parseRupees(49.999)).toBe(50);
    });

    it('handles falsy or invalid values by returning 0', () => {
      expect(parseRupees(null)).toBe(0);
      expect(parseRupees(undefined)).toBe(0);
      expect(parseRupees('')).toBe(0);
      expect(parseRupees('invalid')).toBe(0);
      expect(parseRupees(-100)).toBe(0);
    });
  });

  describe('rupeesToPaise & paiseToRupees', () => {
    it('converts between rupees and integer paise accurately', () => {
      expect(rupeesToPaise(10)).toBe(1000);
      expect(rupeesToPaise(49.50)).toBe(4950);
      expect(paiseToRupees(1000)).toBe(10);
      expect(paiseToRupees(4950)).toBe(49.50);
      expect(paiseToRupees(null)).toBe(0);
    });
  });

  describe('formatCurrency', () => {
    it('formats Indian numbering system properly with Rupee sign', () => {
      const formatted = formatCurrency(2500);
      expect(formatted).toContain('2,500');
      expect(formatted).toContain('₹');
    });

    it('formats lakhs and crores according to Indian grouping', () => {
      const lakh = formatCurrency(100000);
      expect(lakh).toContain('1,00,000');
      const crore = formatCurrency(10000000);
      expect(crore).toContain('1,00,00,000');
    });

    it('handles decimal fractions when present', () => {
      const formatted = formatCurrency(1250.75);
      expect(formatted).toContain('1,250.75');
    });
  });

  describe('toUpiAmount', () => {
    it('formats amounts strictly as plain decimal with 2 decimal places max for UPI spec', () => {
      expect(toUpiAmount(500)).toBe('500.00');
      expect(toUpiAmount(1250.5)).toBe('1250.50');
      expect(toUpiAmount('2,500')).toBe('2500.00');
      expect(toUpiAmount(0)).toBe('0.00');
    });
  });
});
