import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  PRIMARY_STORAGE_KEY,
  PREFERENCES_MIGRATION_FLAG,
  saveAtomicStore,
  loadAtomicStore,
  migrateLegacyStorage,
  migrateLocalStorageToPreferences
} from '../src/utils/storage.js';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

describe('Item 8: Storage Persistence & Capacitor Preferences Migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves data atomically under PRIMARY_STORAGE_KEY', async () => {
    const store = {
      customers: [{ id: 'c1', name: 'Ramesh' }],
      transactions: [{ id: 't1', customerId: 'c1', amount: 500, type: 'credit' }],
      shopSettings: { shopName: 'Kirana' }
    };

    saveAtomicStore(store);

    // Wait for 200ms debounce
    await new Promise(resolve => setTimeout(resolve, 250));

    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw);
    expect(parsed.customers).toHaveLength(1);
    expect(parsed.schemaVersion).toBe(2);
  });

  it('performs one-time idempotent migration to Capacitor Preferences when on native platform', async () => {
    // Mock native platform
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(true);

    const storePayload = {
      schemaVersion: 2,
      customers: [{ id: 'c1', name: 'Ramesh' }],
      transactions: [],
      shopSettings: { shopName: 'My Shop' }
    };
    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(storePayload));

    // First migration run
    const migrated = await migrateLocalStorageToPreferences();
    expect(migrated).toBeTruthy();
    expect(migrated.shopSettings.shopName).toBe('My Shop');

    // Verify flag was set in Preferences
    const flag = await Preferences.get({ key: PREFERENCES_MIGRATION_FLAG });
    expect(flag.value).toBe('true');

    // Second migration run (idempotent: does not overwrite or fail)
    const secondRun = await migrateLocalStorageToPreferences();
    expect(secondRun).toBeTruthy();
    expect(secondRun.shopSettings.shopName).toBe('My Shop');
  });

  it('stays on localStorage when on Web platform', async () => {
    vi.spyOn(Capacitor, 'isNativePlatform').mockReturnValue(false);

    const result = await migrateLocalStorageToPreferences();
    expect(result).toBeNull();
  });
});
