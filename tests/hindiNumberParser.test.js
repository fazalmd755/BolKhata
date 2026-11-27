import { describe, it, expect } from 'vitest';
import {
  parseHindiSpokenNumber,
  convertDevanagariNumerals
} from '../src/utils/hindiNumberParser.js';

describe('hindiNumberParser.js Comprehensive Hindi & Number Extraction', () => {
  describe('convertDevanagariNumerals', () => {
    it('converts Devanagari digits to Latin digits', () => {
      expect(convertDevanagariNumerals('१५००')).toBe('1500');
      expect(convertDevanagariNumerals('₹५०००')).toBe('₹5000');
      expect(convertDevanagariNumerals('०१२३४५६७८९')).toBe('0123456789');
    });
  });

  describe('Colloquial Fractions & Kirana Terms', () => {
    it('parses डेढ़ (1.5) variations accurately', () => {
      expect(parseHindiSpokenNumber('डेढ़ सौ')).toBe(150);
      expect(parseHindiSpokenNumber('dedh so')).toBe(150);
      expect(parseHindiSpokenNumber('डेढ़ हजार')).toBe(1500);
      expect(parseHindiSpokenNumber('dedh hazar')).toBe(1500);
      expect(parseHindiSpokenNumber('डेढ़ लाख')).toBe(150000);
    });

    it('parses ढाई (2.5) variations accurately', () => {
      expect(parseHindiSpokenNumber('ढाई सौ')).toBe(250);
      expect(parseHindiSpokenNumber('dhai sau')).toBe(250);
      expect(parseHindiSpokenNumber('ढाई हजार')).toBe(2500);
      expect(parseHindiSpokenNumber('dhai hazar')).toBe(2500);
      expect(parseHindiSpokenNumber('ढाई लाख')).toBe(250000);
    });

    it('parses साढ़े (X.5) compounds accurately', () => {
      expect(parseHindiSpokenNumber('साढ़े चार सौ')).toBe(450);
      expect(parseHindiSpokenNumber('sadhe teen sau')).toBe(350);
      expect(parseHindiSpokenNumber('साढ़े तीन हजार')).toBe(3500);
      expect(parseHindiSpokenNumber('sadhe char hazar')).toBe(4500);
    });

    it('parses सवा (+0.25) and पौने (-0.25) accurately', () => {
      expect(parseHindiSpokenNumber('सवा सौ')).toBe(125);
      expect(parseHindiSpokenNumber('sawa sau')).toBe(125);
      expect(parseHindiSpokenNumber('पौने दो सौ')).toBe(175);
      expect(parseHindiSpokenNumber('paune do sau')).toBe(175);
    });

    it('parses k notation (2k, 2.5k)', () => {
      expect(parseHindiSpokenNumber('2k')).toBe(2000);
      expect(parseHindiSpokenNumber('2.5k')).toBe(2500);
      expect(parseHindiSpokenNumber('10k')).toBe(10000);
    });
  });

  describe('Multi-Word Hindi Compounds (Crores, Lakhs, Thousands, Hundreds)', () => {
    it('parses दो हज़ार पाँच सौ', () => {
      expect(parseHindiSpokenNumber('दो हज़ार पाँच सौ')).toBe(2500);
      expect(parseHindiSpokenNumber('do hazar panch sau')).toBe(2500);
    });

    it('parses लाख (Lakh) amounts', () => {
      expect(parseHindiSpokenNumber('एक लाख')).toBe(100000);
      expect(parseHindiSpokenNumber('दो लाख पचास हजार')).toBe(250000);
      expect(parseHindiSpokenNumber('5 lakh')).toBe(500000);
    });

    it('parses करोड़ (Crore) amounts', () => {
      expect(parseHindiSpokenNumber('एक करोड़')).toBe(10000000);
      expect(parseHindiSpokenNumber('2 crore')).toBe(20000000);
    });

    it('parses compound with tens like चार हजार आठ सौ पचास', () => {
      expect(parseHindiSpokenNumber('चार हजार आठ सौ पचास')).toBe(4850);
    });
  });

  describe('Digits & Edge cases', () => {
    it('extracts embedded digits with rupee signs and punctuation', () => {
      expect(parseHindiSpokenNumber('₹5000')).toBe(5000);
      expect(parseHindiSpokenNumber('rs. 1200/-')).toBe(1200);
      expect(parseHindiSpokenNumber('450 rupaye')).toBe(450);
    });

    it('returns null for text without numbers', () => {
      expect(parseHindiSpokenNumber('Ramesh kirana')).toBe(null);
      expect(parseHindiSpokenNumber('')).toBe(null);
    });
  });
});
