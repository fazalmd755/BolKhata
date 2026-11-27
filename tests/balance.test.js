import { describe, it, expect } from 'vitest';
import { parseRupees } from '../src/utils/money.js';

/**
 * Pure calculation logic mirroring KhataContext derived balances
 */
function deriveCustomerBalances(customers, transactions) {
  const map = {};
  for (const c of customers) {
    map[c.id] = 0;
  }

  for (const t of transactions) {
    if (t.deletedAt) continue; // Ignore soft-deleted transactions
    const amt = parseRupees(t.amount);
    if (!map[t.customerId] && map[t.customerId] !== 0) {
      map[t.customerId] = 0;
    }
    if (t.type === 'credit') {
      map[t.customerId] += amt;
    } else if (t.type === 'payment') {
      map[t.customerId] -= amt;
    }
  }

  // Round all balances to 2 decimal places
  for (const id in map) {
    map[id] = Math.round(map[id] * 100) / 100;
  }
  return map;
}

describe('Single Source of Truth: Customer Balance Derivations', () => {
  const customers = [
    { id: 'c1', name: 'Ramesh' },
    { id: 'c2', name: 'Suresh' }
  ];

  it('calculates balance strictly from credit and payment transactions', () => {
    const transactions = [
      { id: 't1', customerId: 'c1', type: 'credit', amount: 500 },
      { id: 't2', customerId: 'c1', type: 'credit', amount: 250 },
      { id: 't3', customerId: 'c1', type: 'payment', amount: 300 },
      { id: 't4', customerId: 'c2', type: 'credit', amount: 1000 }
    ];

    const balances = deriveCustomerBalances(customers, transactions);
    // Ramesh: 500 + 250 - 300 = 450
    expect(balances['c1']).toBe(450);
    // Suresh: 1000
    expect(balances['c2']).toBe(1000);
  });

  it('completely ignores soft-deleted transactions', () => {
    const transactions = [
      { id: 't1', customerId: 'c1', type: 'credit', amount: 500 },
      { id: 't2', customerId: 'c1', type: 'credit', amount: 500, deletedAt: '2026-11-27T10:00:00Z' },
      { id: 't3', customerId: 'c1', type: 'payment', amount: 200 }
    ];

    const balances = deriveCustomerBalances(customers, transactions);
    // Deleted 500 is ignored: 500 - 200 = 300
    expect(balances['c1']).toBe(300);
  });

  it('recalculates derived balance when a transaction is edited', () => {
    const transactions = [
      { id: 't1', customerId: 'c1', type: 'credit', amount: 500 },
      { id: 't2', customerId: 'c1', type: 'payment', amount: 200 }
    ];

    let balances = deriveCustomerBalances(customers, transactions);
    expect(balances['c1']).toBe(300);

    // Edit transaction t1 amount from 500 to 800
    const editedTransactions = [
      {
        id: 't1',
        customerId: 'c1',
        type: 'credit',
        amount: 800,
        editedAt: '2026-11-27T12:00:00Z',
        history: [{ amount: 500, modifiedAt: '2026-11-27T12:00:00Z' }]
      },
      transactions[1]
    ];

    balances = deriveCustomerBalances(customers, editedTransactions);
    // 800 - 200 = 600
    expect(balances['c1']).toBe(600);
  });

  it('handles zero or negative balance (advance payment)', () => {
    const transactions = [
      { id: 't1', customerId: 'c1', type: 'credit', amount: 500 },
      { id: 't2', customerId: 'c1', type: 'payment', amount: 700 }
    ];

    const balances = deriveCustomerBalances(customers, transactions);
    // Customer gave 200 advance: -200
    expect(balances['c1']).toBe(-200);
  });

  it('returns empty balance map when store is fresh or cleared', () => {
    const balances = deriveCustomerBalances([], []);
    expect(Object.keys(balances).length).toBe(0);
  });
});
