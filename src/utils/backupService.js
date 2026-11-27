/**
 * BolKhata Rolling Backup & Disaster Recovery Service (C5)
 * Maintains 7 days of automated rolling snapshots in localStorage under bolkhata_backup_YYYY-MM-DD
 * Provides one-tap CSV and JSON export helpers and backup status indicator.
 */

import { toLocalDateKey } from './dateUtils';
import { parseRupees } from './money';

const SNAPSHOT_PREFIX = 'bolkhata_backup_';
const MAX_SNAPSHOT_DAYS = 7;

/**
 * Creates or updates today's automatic rolling snapshot
 */
export function recordDailySnapshot(data) {
  if (!data || !data.customers || !data.transactions) return;
  try {
    const todayKey = toLocalDateKey(new Date());
    const snapshotKey = `${SNAPSHOT_PREFIX}${todayKey}`;
    const payload = {
      version: 2,
      savedAt: new Date().toISOString(),
      dateKey: todayKey,
      customerCount: data.customers.length,
      transactionCount: data.transactions.length,
      data
    };
    localStorage.setItem(snapshotKey, JSON.stringify(payload));
    pruneOldSnapshots();
  } catch (err) {
    console.warn('Failed to record daily snapshot:', err);
  }
}

/**
 * Removes snapshots older than 7 days
 */
export function pruneOldSnapshots() {
  try {
    const snapshots = getAvailableSnapshots();
    if (snapshots.length > MAX_SNAPSHOT_DAYS) {
      // Sort newest first, prune elements beyond index 6
      const toDelete = snapshots.slice(MAX_SNAPSHOT_DAYS);
      for (const item of toDelete) {
        localStorage.removeItem(item.key);
      }
    }
  } catch (e) {
    console.warn('Failed to prune old snapshots:', e);
  }
}

/**
 * Lists all rolling snapshots saved in localStorage
 */
export function getAvailableSnapshots() {
  const result = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SNAPSHOT_PREFIX)) {
        try {
          const parsed = JSON.parse(localStorage.getItem(key));
          result.push({
            key,
            dateKey: parsed.dateKey || key.replace(SNAPSHOT_PREFIX, ''),
            savedAt: parsed.savedAt,
            customerCount: parsed.customerCount || 0,
            transactionCount: parsed.transactionCount || 0
          });
        } catch (e) {}
      }
    }
  } catch (e) {}

  return result.sort((a, b) => b.dateKey.localeCompare(a.dateKey));
}

/**
 * Returns latest backup status info
 */
export function getBackupStatus() {
  const snapshots = getAvailableSnapshots();
  if (snapshots.length === 0) {
    return {
      hasBackup: false,
      lastBackupDate: null,
      lastBackupLabel: 'कोई बैकअप नहीं मिला (No backup)',
      daysSinceLastBackup: 999,
      isOverdue: true,
      lastBackupDaysAgo: 'कभी नहीं (Never)'
    };
  }

  const latest = snapshots[0];
  const d = new Date(latest.savedAt);
  const timeStr = isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isToday = latest.dateKey === toLocalDateKey(new Date());

  const daysDiff = Math.max(0, Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24)));

  return {
    hasBackup: true,
    lastBackupDate: latest.savedAt,
    lastBackupLabel: isToday ? `आज, ${timeStr}` : `${latest.dateKey}, ${timeStr}`,
    daysSinceLastBackup: daysDiff,
    isOverdue: daysDiff >= 7,
    lastBackupDaysAgo: daysDiff === 0 ? 'आज (Today)' : `${daysDiff} दिन पहले (${daysDiff} days ago)`,
    snapshotsCount: snapshots.length
  };
}

/**
 * Generates and triggers download of CSV ledger (ignoring soft-deleted entries)
 */
export function exportCsvLedger(transactions = [], shopName = 'BolKhata') {
  const headers = ['Txn_ID', 'Date', 'Customer_Name', 'Type', 'Amount_INR', 'Items', 'Payment_Method', 'Notes'];
  const activeTxns = transactions.filter(t => !t.deletedAt);
  const rows = activeTxns.map(t => [
    `"${t.id}"`,
    `"${toLocalDateKey(t.date)}"`,
    `"${(t.customerName || '').replace(/"/g, '""')}"`,
    `"${t.type}"`,
    parseRupees(t.amount),
    `"${(Array.isArray(t.items) ? t.items.join('; ') : '').replace(/"/g, '""')}"`,
    `"${t.paymentMethod || 'Cash'}"`,
    `"${(t.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${shopName.replace(/\s+/g, '_')}_Ledger_${toLocalDateKey(new Date())}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Generates and triggers download of full JSON backup (includes full audit history & soft-deleted for complete disaster recovery)
 */
export function exportJsonBackup(data, shopName = 'BolKhata') {
  const backup = {
    schemaVersion: 2,
    appName: 'BolKhata',
    exportedAt: new Date().toISOString(),
    ...data
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${shopName.replace(/\s+/g, '_')}_Backup_${toLocalDateKey(new Date())}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
