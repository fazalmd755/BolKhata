import { describe, it, expect } from 'vitest';
import {
  toLocalDateKey,
  isSameLocalDate,
  parseRelativeDate,
  formatDisplayDate,
  isOverdue,
  getDaysOverdue
} from '../src/utils/dateUtils.js';

describe('dateUtils.js Date & Timezone Utilities', () => {
  describe('toLocalDateKey (Timezone Safety & IST Bug Fix)', () => {
    it('formats dates as local YYYY-MM-DD instead of UTC', () => {
      // Create a date that would be previous day in UTC if checked before 5:30 AM IST
      // e.g., 2026-05-10 at 02:00:00 local time
      const localDate = new Date(2026, 4, 10, 2, 0, 0); // May 10, 2026
      const key = toLocalDateKey(localDate);
      expect(key).toBe('2026-05-10');
    });

    it('returns empty string for invalid dates', () => {
      expect(toLocalDateKey(null)).toBe('');
      expect(toLocalDateKey('not-a-date')).toBe('');
    });
  });

  describe('isSameLocalDate', () => {
    it('returns true for times on the same calendar day', () => {
      const morning = new Date(2026, 3, 15, 6, 0);
      const night = new Date(2026, 3, 15, 23, 30);
      expect(isSameLocalDate(morning, night)).toBe(true);
    });

    it('returns false for different dates', () => {
      const d1 = new Date(2026, 3, 15);
      const d2 = new Date(2026, 3, 16);
      expect(isSameLocalDate(d1, d2)).toBe(false);
    });
  });

  describe('parseRelativeDate', () => {
    it('parses "aaj" or "today" to current date key', () => {
      const today = toLocalDateKey(new Date());
      expect(parseRelativeDate('aaj paise diye', 'payment')).toBe(today);
      expect(parseRelativeDate('today morning', 'credit')).toBe(today);
    });

    it('parses "kal" based on intent (tomorrow for credit, yesterday for payment)', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      expect(parseRelativeDate('kal denge', 'credit')).toBe(toLocalDateKey(tomorrow));
      expect(parseRelativeDate('kal diye the', 'payment')).toBe(toLocalDateKey(yesterday));
    });

    it('parses "parson" correctly based on intent', () => {
      const in2Days = new Date();
      in2Days.setDate(in2Days.getDate() + 2);
      expect(parseRelativeDate('parson denge', 'credit')).toBe(toLocalDateKey(in2Days));
    });

    it('parses "N din baad" or "N days"', () => {
      const in5Days = new Date();
      in5Days.setDate(in5Days.getDate() + 5);
      expect(parseRelativeDate('5 din baad denge', 'credit')).toBe(toLocalDateKey(in5Days));
    });

    it('parses "agle hafte" / "next week"', () => {
      const in7Days = new Date();
      in7Days.setDate(in7Days.getDate() + 7);
      expect(parseRelativeDate('agle hafte pakka denge', 'credit')).toBe(toLocalDateKey(in7Days));
    });

    it('parses "15 tareekh ko" or "15 तारीख"', () => {
      const parsed = parseRelativeDate('15 tareekh ko dega', 'credit');
      expect(parsed).toMatch(/^\d{4}-\d{2}-15$/);
    });
  });

  describe('isOverdue and getDaysOverdue', () => {
    it('correctly detects overdue vs not overdue dates', () => {
      const past = new Date();
      past.setDate(past.getDate() - 5);
      const future = new Date();
      future.setDate(future.getDate() + 5);

      expect(isOverdue(toLocalDateKey(past))).toBe(true);
      expect(isOverdue(toLocalDateKey(future))).toBe(false);
      expect(getDaysOverdue(toLocalDateKey(past))).toBe(5);
      expect(getDaysOverdue(toLocalDateKey(future))).toBe(0);
    });
  });
});
