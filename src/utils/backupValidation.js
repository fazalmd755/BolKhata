// BolKhata Backup Schema Validator & Sanitizer
import { parseRupees, isValidAmount } from './money.js';

export function validateBackupSchema(data) {
  if (!data || typeof data !== 'object') {
    return { isValid: false, error: 'फ़ाइल अमान्य है (Invalid JSON structure).' };
  }

  // Support both legacy unversioned and schemaVersion: 2
  const customers = data.customers;
  const transactions = data.transactions;
  const shopSettings = data.shopSettings || {};

  if (!Array.isArray(customers)) {
    return { isValid: false, error: 'ग्राहक सूची (customers) गायब या अमान्य है।' };
  }

  if (!Array.isArray(transactions)) {
    return { isValid: false, error: 'लेन-देन सूची (transactions) गायब या अमान्य है।' };
  }

  const customerIdSet = new Set();
  const validCustomers = [];

  for (let i = 0; i < customers.length; i++) {
    const c = customers[i];
    if (!c || typeof c !== 'object') {
      return { isValid: false, error: `Customer at index ${i} is not a valid object.` };
    }
    if (!c.id || typeof c.id !== 'string') {
      return { isValid: false, error: `Customer at index ${i} is missing a valid id.` };
    }
    if (!c.name || typeof c.name !== 'string' || !c.name.trim()) {
      return { isValid: false, error: `Customer "${c.id}" is missing a valid name.` };
    }
    if (customerIdSet.has(c.id)) {
      return { isValid: false, error: `Duplicate customer id found: "${c.id}".` };
    }
    customerIdSet.add(c.id);

    // Sanitize customer object
    validCustomers.push({
      id: c.id,
      name: c.name.trim(),
      phone: typeof c.phone === 'string' ? c.phone.trim() : '',
      address: typeof c.address === 'string' ? c.address.trim() : '',
      creditLimit: parseRupees(c.creditLimit) || 5000,
      avatarColor: c.avatarColor || 'bg-emerald-600',
      createdAt: c.createdAt || new Date().toISOString(),
      lastTransactionDate: c.lastTransactionDate || new Date().toISOString(),
      dueDate: c.dueDate || null,
      notes: typeof c.notes === 'string' ? c.notes : ''
    });
  }

  const txnIdSet = new Set();
  const validTransactions = [];

  for (let i = 0; i < transactions.length; i++) {
    const t = transactions[i];
    if (!t || typeof t !== 'object') {
      return { isValid: false, error: `Transaction at index ${i} is not a valid object.` };
    }
    if (!t.id || typeof t.id !== 'string') {
      return { isValid: false, error: `Transaction at index ${i} is missing a valid id.` };
    }
    if (txnIdSet.has(t.id)) {
      return { isValid: false, error: `Duplicate transaction id found: "${t.id}".` };
    }
    txnIdSet.add(t.id);

    if (!t.customerId || !customerIdSet.has(t.customerId)) {
      return { isValid: false, error: `Transaction "${t.id}" references non-existent customerId: "${t.customerId}".` };
    }

    if (t.type !== 'credit' && t.type !== 'payment') {
      return { isValid: false, error: `Transaction "${t.id}" has invalid type "${t.type}" (must be "credit" or "payment").` };
    }

    const amt = parseRupees(t.amount);
    if (!isValidAmount(amt)) {
      return { isValid: false, error: `Transaction "${t.id}" has invalid amount "${t.amount}".` };
    }

    const d = new Date(t.date);
    if (!t.date || isNaN(d.getTime())) {
      return { isValid: false, error: `Transaction "${t.id}" has invalid date "${t.date}".` };
    }

    validTransactions.push({
      id: t.id,
      customerId: t.customerId,
      customerName: typeof t.customerName === 'string' ? t.customerName.trim() : '',
      type: t.type,
      amount: amt,
      items: Array.isArray(t.items) ? t.items.map(String) : [],
      paymentMethod: typeof t.paymentMethod === 'string' ? t.paymentMethod : 'Cash',
      date: d.toISOString(),
      dueDate: t.dueDate || null,
      notes: typeof t.notes === 'string' ? t.notes : '',
      rawVoiceCommand: typeof t.rawVoiceCommand === 'string' ? t.rawVoiceCommand : '',
      deletedAt: t.deletedAt || null,
      editedAt: t.editedAt || null,
      history: Array.isArray(t.history) ? t.history : []
    });
  }

  return {
    isValid: true,
    sanitizedData: {
      schemaVersion: 2,
      customers: validCustomers,
      transactions: validTransactions,
      shopSettings: {
        shopName: typeof shopSettings.shopName === 'string' ? shopSettings.shopName.trim() : '',
        merchantName: typeof shopSettings.merchantName === 'string' ? shopSettings.merchantName.trim() : '',
        phone: typeof shopSettings.phone === 'string' ? shopSettings.phone.trim() : '',
        upiId: typeof shopSettings.upiId === 'string' ? shopSettings.upiId.trim() : '',
        language: shopSettings.language || 'hi-IN',
        soundEnabled: shopSettings.soundEnabled !== false,
        voiceReadoutEnabled: shopSettings.voiceReadoutEnabled !== false,
        currency: '₹',
        pinHash: shopSettings.pinHash || null,
        pinSalt: shopSettings.pinSalt || null,
        lockTimeoutMinutes: shopSettings.lockTimeoutMinutes || 5
      }
    }
  };
}
