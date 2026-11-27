import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, DEFAULT_SHOP_SETTINGS, DEMO_SHOP_SETTINGS } from '../data/mockData';
import { toLocalDateKey, isOverdue } from '../utils/dateUtils';
import { playSuccessChime } from '../utils/soundEffects';
import { parseRupees, isValidAmount } from '../utils/money';
import { generateId } from '../utils/idUtils';
import { loadAtomicStore, saveAtomicStore, createDataSnapshot, requestPersistentStorage } from '../utils/storage';
import { validateBackupSchema } from '../utils/backupValidation';
import { recordDailySnapshot } from '../utils/backupService';

const KhataDataContext = createContext();

const AVATAR_COLORS = [
  'bg-emerald-600', 'bg-blue-600', 'bg-indigo-600',
  'bg-purple-600', 'bg-amber-600', 'bg-teal-600', 'bg-rose-600'
];

/**
 * Single source of truth helper for building customer records (A7)
 */
function createCustomerRecord({
  id,
  name,
  phone = '',
  address = '',
  creditLimit = 5000,
  notes = '',
  source = 'manual'
}) {
  const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  return {
    id: id || generateId('cust'),
    name: (name || '').trim(),
    phone: (phone || '').trim(),
    address: (address || '').trim(),
    creditLimit: parseRupees(creditLimit) || 5000,
    avatarColor: randomColor,
    createdAt: new Date().toISOString(),
    lastTransactionDate: new Date().toISOString(),
    dueDate: null,
    notes: (notes || '').trim(),
    source
  };
}

export function KhataDataProvider({ children, onRegisterUndo }) {
  // Load atomically from single primary store key or legacy migration (A9)
  const initialStoreRef = useRef(null);
  if (!initialStoreRef.current) {
    initialStoreRef.current = loadAtomicStore();
  }

  const [customers, setCustomers] = useState(() => {
    if (initialStoreRef.current && Array.isArray(initialStoreRef.current.customers)) {
      return initialStoreRef.current.customers;
    }
    // For fresh installations, start clean with empty ledger (C1)
    return [];
  });

  const [transactions, setTransactions] = useState(() => {
    if (initialStoreRef.current && Array.isArray(initialStoreRef.current.transactions)) {
      return initialStoreRef.current.transactions;
    }
    return [];
  });

  const [shopSettings, setShopSettings] = useState(() => {
    if (initialStoreRef.current && initialStoreRef.current.shopSettings) {
      return initialStoreRef.current.shopSettings;
    }
    return { ...DEFAULT_SHOP_SETTINGS };
  });

  // Request persistent storage on mount
  useEffect(() => {
    requestPersistentStorage();
  }, []);

  // Atomic storage persistence on state change (A9, C5)
  useEffect(() => {
    saveAtomicStore({
      customers,
      transactions,
      shopSettings
    });
    recordDailySnapshot({
      customers,
      transactions,
      shopSettings
    });
  }, [customers, transactions, shopSettings]);

  // A1: Single Source of Truth for Balance
  // Derive customer balances dynamically from active (non-soft-deleted) transactions
  const customerBalances = useMemo(() => {
    const balances = {};
    for (const t of transactions) {
      if (t.deletedAt) continue;
      const cid = t.customerId;
      if (!cid) continue;
      const amt = parseRupees(t.amount);
      if (t.type === 'credit') {
        balances[cid] = (balances[cid] || 0) + amt;
      } else if (t.type === 'payment') {
        balances[cid] = (balances[cid] || 0) - amt;
      }
    }
    // Round each balance to 2 decimal places to avoid floating point drift
    for (const cid in balances) {
      balances[cid] = Math.round(balances[cid] * 100) / 100;
    }
    return balances;
  }, [transactions]);

  const getCustomerBalance = useCallback((customerId) => {
    return customerBalances[customerId] || 0;
  }, [customerBalances]);

  // Customers enriched with derived balances for consumers
  const customersWithBalance = useMemo(() => {
    return customers.map(c => ({
      ...c,
      balance: customerBalances[c.id] || 0
    }));
  }, [customers, customerBalances]);

  /**
   * Customer matching hierarchy (A4):
   * 1. Explicit customerId
   * 2. Normalized 10-digit phone number
   * 3. Exact normalized name
   */
  const findCustomerMatch = useCallback(({ customerId, phone, name }) => {
    if (customerId) {
      const match = customersWithBalance.find(c => c.id === customerId);
      if (match) return { match, matches: [match] };
    }

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
      if (cleanPhone.length === 10) {
        const matches = customersWithBalance.filter(c => {
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
        const matches = customersWithBalance.filter(c => c.name.trim().toLowerCase() === cleanName);
        if (matches.length === 1) return { match: matches[0], matches };
        if (matches.length > 1) return { match: null, matches, ambiguous: true };
      }
    }

    return { match: null, matches: [] };
  }, [customersWithBalance]);

  /**
   * Check for duplicate transactions within 30 minutes using timestamps (A2)
   */
  const checkDuplicateTransaction = useCallback((customerId, amount, type) => {
    if (!customerId || !amount) return { isDuplicate: false };
    const numericAmount = parseRupees(amount);
    const nowTime = Date.now();
    const thirtyMinsMs = 30 * 60 * 1000;

    const dup = transactions.find(t => {
      if (t.deletedAt) return false;
      if (t.customerId !== customerId || t.type !== type) return false;
      if (Math.abs(parseRupees(t.amount) - numericAmount) > 0.01) return false;
      const tTime = new Date(t.date).getTime();
      return Math.abs(nowTime - tTime) <= thirtyMinsMs;
    });

    if (dup) {
      return {
        isDuplicate: true,
        existingTxn: dup,
        message: `⚠️ Similar ₹${numericAmount} ${type === 'credit' ? 'Udhaar' : 'Payment'} entry recorded recently for this customer.`
      };
    }

    return { isDuplicate: false };
  }, [transactions]);

  /**
   * Add a new transaction (A1, A4, A5, A7, A8)
   */
  const addTransaction = useCallback(({
    customerId,
    customerName,
    phone,
    type, // 'credit' | 'payment'
    amount,
    items = [],
    paymentMethod = 'Cash',
    dueDate = null,
    notes = '',
    rawVoiceCommand = ''
  }) => {
    // Input Validation (A5)
    if (!customerName || typeof customerName !== 'string' || !customerName.trim()) {
      return { success: false, error: 'ग्राहक का नाम आवश्यक है (Customer name is required)' };
    }

    const numericAmount = parseRupees(amount);
    if (!isValidAmount(numericAmount)) {
      return { success: false, error: 'मान्य राशि दर्ज करें (Enter a valid amount greater than 0)' };
    }

    if (type !== 'credit' && type !== 'payment') {
      return { success: false, error: 'लेन-देन प्रकार अमान्य है (Invalid transaction type)' };
    }

    let targetCustomerId = customerId;
    let targetCustomerName = customerName.trim();

    // Match customer using hierarchy (A4)
    if (!targetCustomerId) {
      const matchResult = findCustomerMatch({ customerId, phone, name: targetCustomerName });
      if (matchResult.match) {
        targetCustomerId = matchResult.match.id;
        targetCustomerName = matchResult.match.name;
      } else {
        // Create new customer using unified helper without storing balance (A1, A7)
        const newCustomer = createCustomerRecord({
          name: targetCustomerName,
          phone,
          source: rawVoiceCommand ? 'voice' : 'manual'
        });
        setCustomers(prev => [newCustomer, ...prev]);
        targetCustomerId = newCustomer.id;
      }
    }

    const txnId = generateId('txn');
    const newTxn = {
      id: txnId,
      customerId: targetCustomerId,
      customerName: targetCustomerName,
      type,
      amount: numericAmount,
      items: Array.isArray(items) ? items.filter(Boolean) : [items].filter(Boolean),
      paymentMethod: type === 'payment' ? paymentMethod : 'Khata',
      date: new Date().toISOString(),
      dueDate: type === 'credit' ? (dueDate || null) : null,
      notes: (notes || '').trim(),
      rawVoiceCommand: rawVoiceCommand || '',
      deletedAt: null,
      editedAt: null,
      history: []
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Update customer metadata (last transaction timestamp & dueDate) without storing balance
    setCustomers(prev => prev.map(c => {
      if (c.id === targetCustomerId) {
        return {
          ...c,
          lastTransactionDate: new Date().toISOString(),
          dueDate: type === 'credit' && dueDate ? dueDate : c.dueDate
        };
      }
      return c;
    }));

    if (shopSettings.soundEnabled) {
      playSuccessChime();
    }

    // Notify Undo listener if registered
    if (onRegisterUndo) {
      onRegisterUndo({
        type: 'add',
        transactionId: txnId,
        message: `₹${numericAmount} लेन-देन जोड़ा गया`
      });
    }

    return { success: true, transaction: newTxn };
  }, [findCustomerMatch, shopSettings.soundEnabled, onRegisterUndo]);

  /**
   * Edit an existing transaction with audit trail (A3)
   */
  const editTransaction = useCallback((txnId, updates) => {
    if (!txnId) return { success: false, error: 'Transaction ID required' };

    let foundTxn = null;
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        foundTxn = t;
        const previousSnapshot = {
          amount: t.amount,
          type: t.type,
          date: t.date,
          items: t.items,
          dueDate: t.dueDate,
          notes: t.notes,
          paymentMethod: t.paymentMethod,
          recordedAt: t.editedAt || t.date
        };

        const newAmount = updates.amount !== undefined ? parseRupees(updates.amount) : t.amount;
        const newType = updates.type || t.type;

        return {
          ...t,
          ...updates,
          amount: newAmount,
          type: newType,
          editedAt: new Date().toISOString(),
          history: [...(t.history || []), previousSnapshot]
        };
      }
      return t;
    }));

    if (!foundTxn) {
      return { success: false, error: 'Transaction not found' };
    }

    return { success: true };
  }, []);

  /**
   * Soft-delete a transaction with audit trail and Undo (A3)
   */
  const deleteTransaction = useCallback((txnId) => {
    if (!txnId) return { success: false, error: 'Transaction ID required' };

    let deletedTxn = null;
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        deletedTxn = t;
        return {
          ...t,
          deletedAt: new Date().toISOString()
        };
      }
      return t;
    }));

    if (!deletedTxn) {
      return { success: false, error: 'Transaction not found' };
    }

    if (onRegisterUndo) {
      onRegisterUndo({
        type: 'delete',
        transactionId: txnId,
        message: `₹${deletedTxn.amount} लेन-देन हटाया गया`
      });
    }

    return { success: true };
  }, [onRegisterUndo]);

  /**
   * Add a new customer to ledger directly (A1, A5, A7)
   */
  const addNewCustomer = useCallback(({
    name,
    phone = '',
    address = '',
    openingBalance = 0,
    creditLimit = 5000,
    notes = ''
  }) => {
    if (!name || typeof name !== 'string' || !name.trim()) {
      return { success: false, error: 'नाम आवश्यक है (Name is required)' };
    }
    const cleanName = name.trim();

    // Check if customer already exists (by name or phone)
    const match = findCustomerMatch({ name: cleanName, phone });
    if (match.match) {
      return { success: false, isExisting: true, customer: match.match };
    }

    const newCustomer = createCustomerRecord({
      name: cleanName,
      phone,
      address,
      creditLimit,
      notes,
      source: 'manual'
    });

    setCustomers(prev => [newCustomer, ...prev]);

    // Record Opening Balance ONLY as a credit transaction (A1)
    const numOpeningBal = parseRupees(openingBalance);
    if (numOpeningBal > 0) {
      const initialTxn = {
        id: generateId('txn'),
        customerId: newCustomer.id,
        customerName: cleanName,
        type: 'credit',
        amount: numOpeningBal,
        items: ['आरंभिक बकाया (Opening Balance)'],
        paymentMethod: 'Khata',
        date: new Date().toISOString(),
        dueDate: null,
        notes: 'Opening balance',
        rawVoiceCommand: '',
        deletedAt: null,
        editedAt: null,
        history: []
      };
      setTransactions(prev => [initialTxn, ...prev]);
    }

    if (shopSettings.soundEnabled) {
      playSuccessChime();
    }

    return {
      success: true,
      isExisting: false,
      customer: { ...newCustomer, balance: numOpeningBal }
    };
  }, [findCustomerMatch, shopSettings.soundEnabled]);

  /**
   * Reset store to initial demo state (C1)
   */
  const resetToDemoData = useCallback(() => {
    createDataSnapshot({ customers, transactions, shopSettings });
    setCustomers(INITIAL_CUSTOMERS.map(c => {
      const { balance, ...rest } = c;
      return rest;
    }));
    setTransactions(INITIAL_TRANSACTIONS);
    setShopSettings(DEMO_SHOP_SETTINGS);
  }, [customers, transactions, shopSettings]);

  /**
   * Restore full store from backup JSON with strict schema validation & snapshot (A6)
   */
  const restoreBackupData = useCallback((backupData, mode = 'replace') => {
    const validation = validateBackupSchema(backupData);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    const { sanitizedData } = validation;

    const snapshotResult = createDataSnapshot({ customers, transactions, shopSettings });

    if (mode === 'merge') {
      const existingIds = new Set(customers.map(c => c.id));
      const newCustomers = sanitizedData.customers.filter(c => !existingIds.has(c.id));

      const existingTxnIds = new Set(transactions.map(t => t.id));
      const newTxns = sanitizedData.transactions.filter(t => !existingTxnIds.has(t.id));

      setCustomers(prev => [...prev, ...newCustomers]);
      setTransactions(prev => [...prev, ...newTxns]);
    } else {
      setCustomers(sanitizedData.customers);
      setTransactions(sanitizedData.transactions);
      if (sanitizedData.shopSettings && sanitizedData.shopSettings.shopName) {
        setShopSettings(sanitizedData.shopSettings);
      }
    }

    return {
      success: true,
      snapshotKey: snapshotResult.key,
      customerCount: sanitizedData.customers.length,
      transactionCount: sanitizedData.transactions.length
    };
  }, [customers, transactions, shopSettings]);

  // Derived Financial Stats (A1, A2)
  const totalPendingUdhaar = useMemo(() => {
    return Object.values(customerBalances).reduce((sum, b) => sum + (b > 0 ? b : 0), 0);
  }, [customerBalances]);

  const todayLocalDateKey = toLocalDateKey(new Date());
  const paymentsToday = useMemo(() => {
    return transactions
      .filter(t => !t.deletedAt && t.type === 'payment' && toLocalDateKey(t.date) === todayLocalDateKey)
      .reduce((sum, t) => sum + parseRupees(t.amount), 0);
  }, [transactions, todayLocalDateKey]);

  const overdueCustomers = useMemo(() => {
    return customersWithBalance.filter(c => c.balance > 0 && c.dueDate && isOverdue(c.dueDate));
  }, [customersWithBalance]);

  const activeCustomersCount = useMemo(() => {
    return customersWithBalance.filter(c => c.balance > 0).length;
  }, [customersWithBalance]);

  return (
    <KhataDataContext.Provider value={{
      customers: customersWithBalance,
      rawCustomers: customers,
      transactions,
      setCustomers,
      setTransactions,
      shopSettings,
      setShopSettings,
      totalPendingUdhaar,
      paymentsToday,
      overdueCustomers,
      activeCustomersCount,
      getCustomerBalance,
      findCustomerMatch,
      checkDuplicateTransaction,
      addNewCustomer,
      addTransaction,
      editTransaction,
      deleteTransaction,
      resetToDemoData,
      restoreBackupData,
    }}>
      {children}
    </KhataDataContext.Provider>
  );
}

export function useKhataData() {
  const context = useContext(KhataDataContext);
  if (!context) {
    throw new Error('useKhataData must be used within a KhataDataProvider');
  }
  return context;
}
