import { describe, it, expect } from 'vitest';
import { t, DICTIONARY } from '../src/i18n/index.js';

describe('i18n Translations Dictionary', () => {
  it('returns Hindi text by default', () => {
    expect(t('save')).toBe('सुरक्षित करें');
    expect(t('total_udhaar')).toBe('कुल बकाया उधार');
  });

  it('returns English text when requested', () => {
    expect(t('save', 'en')).toBe('Save');
    expect(t('total_udhaar', 'en')).toBe('Total Pending Udhaar');
  });

  it('falls back gracefully to Hindi or key if missing in English', () => {
    expect(t('non_existent_key', 'en')).toBe('non_existent_key');
  });

  it('contains matching keys across both languages', () => {
    const hiKeys = Object.keys(DICTIONARY.hi);
    const enKeys = Object.keys(DICTIONARY.en);
    expect(hiKeys.sort()).toEqual(enKeys.sort());
  });
});
