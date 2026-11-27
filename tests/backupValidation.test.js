import { describe, it, expect } from 'vitest';
import { validateBackupSchema } from '../src/utils/backupValidation.js';

describe('backupValidation.js Schema Validation & Sanitization', () => {
  const validData = {
    schemaVersion: 2,
    customers: [
      { id: 'c1', name: 'Ramesh', phone: '9876543210', creditLimit: 5000 }
    ],
    transactions: [
      {
        id: 't1',
        customerId: 'c1',
        type: 'credit',
        amount: 500,
        date: '2026-11-27T10:00:00Z',
        items: ['Rice']
      }
    ],
    shopSettings: { shopName: 'Kirana Store' }
  };

  it('accepts valid backup schema and sanitizes data', () => {
    const res = validateBackupSchema(validData);
    expect(res.isValid).toBe(true);
    expect(res.sanitizedData.customers).toHaveLength(1);
    expect(res.sanitizedData.transactions).toHaveLength(1);
    expect(res.sanitizedData.schemaVersion).toBe(2);
  });

  it('rejects backup with non-array customers or transactions', () => {
    expect(validateBackupSchema({ customers: 'bad', transactions: [] }).isValid).toBe(false);
    expect(validateBackupSchema({ customers: [], transactions: null }).isValid).toBe(false);
  });

  it('rejects backup with duplicate customer IDs', () => {
    const dupCustomers = {
      customers: [
        { id: 'c1', name: 'Ramesh' },
        { id: 'c1', name: 'Duplicate Ramesh' }
      ],
      transactions: []
    };
    const res = validateBackupSchema(dupCustomers);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('Duplicate customer id found');
  });

  it('rejects transaction referencing non-existent customerId (orphaned transaction)', () => {
    const orphanedTxn = {
      customers: [{ id: 'c1', name: 'Ramesh' }],
      transactions: [
        {
          id: 't1',
          customerId: 'c999', // Non-existent
          type: 'credit',
          amount: 500,
          date: '2026-11-27T10:00:00Z'
        }
      ]
    };
    const res = validateBackupSchema(orphanedTxn);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('references non-existent customerId');
  });

  it('rejects transaction with invalid type or negative/NaN amount', () => {
    const badAmount = {
      customers: [{ id: 'c1', name: 'Ramesh' }],
      transactions: [
        {
          id: 't1',
          customerId: 'c1',
          type: 'credit',
          amount: -500, // Invalid
          date: '2026-11-27T10:00:00Z'
        }
      ]
    };
    const res = validateBackupSchema(badAmount);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('invalid amount');
  });

  it('accepts and upgrades legacy unversioned backup', () => {
    const legacyData = {
      customers: [
        { id: 'c1', name: 'Ramesh', balance: 500 } // Legacy stored balance
      ],
      transactions: [
        {
          id: 't1',
          customerId: 'c1',
          type: 'credit',
          amount: 500,
          date: '2026-11-20T10:00:00Z'
        }
      ]
    };
    const res = validateBackupSchema(legacyData);
    expect(res.isValid).toBe(true);
    expect(res.sanitizedData.schemaVersion).toBe(2);
    // Notice stored balance is removed from customer sanitization
    expect(res.sanitizedData.customers[0].balance).toBeUndefined();
  });
});
