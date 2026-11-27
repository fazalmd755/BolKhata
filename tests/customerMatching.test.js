import { describe, it, expect } from 'vitest';

/**
 * Pure customer matching logic mirroring KhataDataContext hierarchy (A4, Item 9)
 */
function findCustomerMatch({ customerId, phone, name }, customers) {
  if (customerId) {
    const match = customers.find(c => c.id === customerId);
    if (match) return { match, matches: [match] };
  }

  if (phone) {
    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length === 10) {
      const matches = customers.filter(c => {
        const cPhone = (c.phone || '').replace(/\D/g, '').slice(-10);
        return cPhone === cleanPhone;
      });
      if (matches.length === 1) return { match: matches[0], matches };
      if (matches.length > 1) return { match: null, matches, ambiguous: true };
    }
  }

  if (name && typeof name === 'string') {
    const cleanName = name.trim().toLowerCase();
    if (cleanName) {
      const matches = customers.filter(c => c.name.trim().toLowerCase() === cleanName);
      if (matches.length === 1) return { match: matches[0], matches };
      // Two or more customers with the exact same name -> MUST NOT silent pick!
      if (matches.length > 1) return { match: null, matches, ambiguous: true };
    }
  }

  return { match: null, matches: [] };
}

describe('Item 9: Customer Matching Hierarchy & Ambiguity Chooser Proof', () => {
  const customerList = [
    { id: 'c1', name: 'Ramesh', phone: '9876543210', address: 'Market Shop #1', balance: 500 },
    { id: 'c2', name: 'Ramesh', phone: '9876543211', address: 'Station Road', balance: 1200 },
    { id: 'c3', name: 'Suresh Sharma', phone: '9812345678', address: 'Railway Colony', balance: 0 }
  ];

  it('triggers an ambiguous result (no silent pick) when two customers have the same name', () => {
    const result = findCustomerMatch({ name: 'Ramesh' }, customerList);

    // MUST NOT auto-pick one customer silently!
    expect(result.match).toBeNull();
    // MUST flag as ambiguous
    expect(result.ambiguous).toBe(true);
    // MUST return all matching candidates for the user chooser dialog
    expect(result.matches).toHaveLength(2);
    expect(result.matches.map(c => c.id)).toEqual(['c1', 'c2']);
  });

  it('disambiguates accurately when explicit 10-digit phone number is provided', () => {
    const result = findCustomerMatch({ name: 'Ramesh', phone: '9876543211' }, customerList);
    expect(result.match).not.toBeNull();
    expect(result.match.id).toBe('c2');
    expect(result.ambiguous).toBeUndefined();
  });

  it('disambiguates accurately when explicit customerId is provided', () => {
    const result = findCustomerMatch({ customerId: 'c1', name: 'Ramesh' }, customerList);
    expect(result.match).not.toBeNull();
    expect(result.match.id).toBe('c1');
  });

  it('returns clean unique match when name is unique in shop', () => {
    const result = findCustomerMatch({ name: 'Suresh Sharma' }, customerList);
    expect(result.match).not.toBeNull();
    expect(result.match.id).toBe('c3');
    expect(result.matches).toHaveLength(1);
  });
});
