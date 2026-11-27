// BolKhata Storage & Migration Engine (Single Key Atomic Persistence)
import { parseRupees } from './money.js';
import { generateId } from './idUtils.js';

export const PRIMARY_STORAGE_KEY = 'bolkhata_v2_store';
export const LEGACY_STORAGE_PREFIX = 'bolkhata_v1_store';
export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Requests persistent storage from browser if supported
 */
export async function requestPersistentStorage() {
  if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.persist === 'function') {
    try {
      const isPersisted = await navigator.storage.persist();
      console.log('[BolKhata Storage] Storage persistence granted:', isPersisted);
      return isPersisted;
    } catch (e) {
      console.warn('[BolKhata Storage] Could not request persistence', e);
    }
  }
  return false;
}

/**
 * Migrates legacy v1 separate keys into atomic v2 schema
 */
export function migrateLegacyStorage() {
  try {
    const rawCustomers = localStorage.getItem(`${LEGACY_STORAGE_PREFIX}_customers`);
    const rawTxns = localStorage.getItem(`${LEGACY_STORAGE_PREFIX}_transactions`);
    const rawSettings = localStorage.getItem(`${LEGACY_STORAGE_PREFIX}_settings`);

    if (!rawCustomers && !rawTxns && !rawSettings) {
      return null; // Clean fresh install
    }

    const legacyCustomers = rawCustomers ? JSON.parse(rawCustomers) : [];
    const legacyTxns = rawTxns ? JSON.parse(rawTxns) : [];
    const legacySettings = rawSettings ? JSON.parse(rawSettings) : {};

    // 1. Safety Backup of legacy raw data
    const backupKey = `bolkhata_v1_backup_${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify({
      customers: legacyCustomers,
      transactions: legacyTxns,
      shopSettings: legacySettings,
      migratedAt: new Date().toISOString()
    }));
    console.log('[BolKhata Storage] Legacy data safety backup created at:', backupKey);

    // 2. Resolve two sources of truth for balance (A1 requirement)
    // Derive balances from transactions
    const derivedMap = {};
    for (const t of legacyTxns) {
      if (!t.deletedAt && t.customerId) {
        const amt = parseRupees(t.amount);
        if (t.type === 'credit') {
          derivedMap[t.customerId] = (derivedMap[t.customerId] || 0) + amt;
        } else if (t.type === 'payment') {
          derivedMap[t.customerId] = (derivedMap[t.customerId] || 0) - amt;
        }
      }
    }

    const migratedTransactions = [...legacyTxns];

    // Check each customer: if customer has stored balance but no corresponding transactions,
    // create an Opening Balance transaction so user data is never lost!
    const migratedCustomers = legacyCustomers.map(c => {
      const storedBal = parseRupees(c.balance);
      const derivedBal = parseRupees(derivedMap[c.id] || 0);

      if (storedBal > 0 && Math.abs(storedBal - derivedBal) > 0.01 && (!derivedMap[c.id] || derivedMap[c.id] === 0)) {
        console.log(`[BolKhata Migration] Adding opening balance transaction for customer ${c.name}: ₹${storedBal}`);
        migratedTransactions.push({
          id: generateId('txn'),
          customerId: c.id,
          customerName: c.name,
          type: 'credit',
          amount: storedBal,
          items: ['आरंभिक बकाया (Opening Balance)'],
          paymentMethod: 'Khata',
          date: c.createdAt || new Date().toISOString(),
          dueDate: c.dueDate || null,
          notes: 'Migrated opening balance',
          rawVoiceCommand: '',
          deletedAt: null,
          editedAt: null,
          history: []
        });
      }

      // Remove stored balance from customer write path
      const { balance, ...rest } = c;
      return {
        ...rest,
        id: c.id || generateId('cust'),
        name: c.name ? c.name.trim() : 'Customer',
        phone: c.phone || '',
        address: c.address || '',
        creditLimit: parseRupees(c.creditLimit) || 5000,
        avatarColor: c.avatarColor || 'bg-emerald-600',
        createdAt: c.createdAt || new Date().toISOString(),
        lastTransactionDate: c.lastTransactionDate || new Date().toISOString(),
        dueDate: c.dueDate || null,
        notes: c.notes || ''
      };
    });

    const v2Store = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      customers: migratedCustomers,
      transactions: migratedTransactions,
      shopSettings: {
        shopName: legacySettings.shopName || '',
        merchantName: legacySettings.merchantName || '',
        phone: legacySettings.phone || '',
        upiId: legacySettings.upiId || '',
        language: legacySettings.language || 'hi-IN',
        soundEnabled: legacySettings.soundEnabled !== false,
        voiceReadoutEnabled: legacySettings.voiceReadoutEnabled !== false,
        currency: '₹'
      },
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(v2Store));
    return v2Store;
  } catch (err) {
    console.error('[BolKhata Storage] Migration error:', err);
    return null;
  }
}

/**
 * Loads entire app store atomically from primary key
 */
export function loadAtomicStore() {
  try {
    const raw = localStorage.getItem(PRIMARY_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.schemaVersion === CURRENT_SCHEMA_VERSION) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[BolKhata Storage] Failed to parse primary store, checking migration', e);
  }

  // Fallback to legacy migration
  const migrated = migrateLegacyStorage();
  if (migrated) return migrated;

  return null;
}

let saveTimeout = null;

/**
 * Saves entire store bundle atomically with debounce and quota management
 */
export function saveAtomicStore(data) {
  if (!data) return;

  const payload = {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    customers: data.customers || [],
    transactions: data.transactions || [],
    shopSettings: data.shopSettings || {},
    updatedAt: new Date().toISOString()
  };

  const executeSave = () => {
    try {
      localStorage.setItem(PRIMARY_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('[BolKhata Storage] Storage write error:', err);
      if (err.name === 'QuotaExceededError' || err.code === 22) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('bolkhata:quota_exceeded', { detail: err }));
        }
      }
    }
  };

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(executeSave, 150);
}

/**
 * Saves an emergency snapshot before destructive actions (like restore)
 */
export function createDataSnapshot(data) {
  try {
    const snapshot = {
      snapshotId: generateId('snapshot'),
      timestamp: new Date().toISOString(),
      data
    };
    const key = `bolkhata_snapshot_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify(snapshot));
    return { success: true, key, snapshot };
  } catch (e) {
    console.warn('[BolKhata Storage] Snapshot save failed', e);
    return { success: false, error: e.message };
  }
}
