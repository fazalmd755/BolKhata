import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_CUSTOMERS, INITIAL_TRANSACTIONS, DEFAULT_SHOP_SETTINGS } from '../data/mockData';
import { isOverdue } from '../utils/dateUtils';
import { playSuccessChime } from '../utils/soundEffects';

const KhataContext = createContext();

const STORAGE_KEY = 'bolkhata_v1_store';

export function KhataProvider({ children }) {
  // Load from localStorage or use initial preloaded data
  const [customers, setCustomers] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_customers`);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch (e) {
      return INITIAL_CUSTOMERS;
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_transactions`);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch (e) {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [shopSettings, setShopSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
      return saved ? JSON.parse(saved) : DEFAULT_SHOP_SETTINGS;
    } catch (e) {
      return DEFAULT_SHOP_SETTINGS;
    }
  });

  // Modal & Navigation States
  const [activeModal, setActiveModal] = useState(null); 
  // 'confirm' | 'balance_query' | 'manual_entry' | 'whatsapp_reminder' | 'settings' | null

  const [modalPayload, setModalPayload] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all' | 'pending' | 'cleared' | 'overdue'
  const [searchQuery, setSearchQuery] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_customers`, JSON.stringify(customers));
    } catch (e) {
      console.error('Failed to save customers', e);
    }
  }, [customers]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_transactions`, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(shopSettings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }, [shopSettings]);

  // Recalculate customer balance based on transactions
  const getCustomerBalance = (customerId) => {
    const custTxns = transactions.filter(t => t.customerId === customerId);
    let bal = 0;
    for (const t of custTxns) {
      if (t.type === 'credit') {
        bal += Number(t.amount);
      } else if (t.type === 'payment') {
        bal -= Number(t.amount);
      }
    }
    return bal;
  };

  /**
   * Check for potential duplicate transactions:
   * Same customer, same amount, same type recorded recently (within last 30 minutes or today)
   */
  const checkDuplicateTransaction = (customerId, amount, type) => {
    if (!customerId || !amount) return { isDuplicate: false };
    const numericAmount = Number(amount);
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const dup = transactions.find(t => 
      t.customerId === customerId &&
      Number(t.amount) === numericAmount &&
      t.type === type &&
      t.date >= thirtyMinsAgo
    );

    if (dup) {
      return {
        isDuplicate: true,
        existingTxn: dup,
        message: `⚠️ Similar ₹${numericAmount} ${type === 'credit' ? 'Udhaar' : 'Payment'} entry recorded recently for this customer.`
      };
    }

    return { isDuplicate: false };
  };

  /**
   * Add a new transaction (with automatic customer creation if needed)
   */
  const addTransaction = ({
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
    let targetCustomerId = customerId;

    // If new customer, create first
    if (!targetCustomerId) {
      const existing = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase().trim());
      if (existing) {
        targetCustomerId = existing.id;
      } else {
        const newCustId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const newCustomer = {
          id: newCustId,
          name: customerName.trim(),
          phone: phone || '',
          address: 'Local Customer',
          balance: 0,
          creditLimit: 5000,
          avatarColor: randomColor,
          createdAt: new Date().toISOString(),
          lastTransactionDate: new Date().toISOString(),
          dueDate: type === 'credit' ? dueDate : null,
          notes: 'Added via voice transaction'
        };

        setCustomers(prev => [newCustomer, ...prev]);
        targetCustomerId = newCustId;
      }
    }

    const newTxn = {
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      customerId: targetCustomerId,
      customerName: customerName.trim(),
      type,
      amount: Number(amount),
      items: Array.isArray(items) ? items : [items].filter(Boolean),
      paymentMethod,
      date: new Date().toISOString(),
      dueDate: type === 'credit' ? dueDate : null,
      notes: notes || '',
      rawVoiceCommand: rawVoiceCommand || ''
    };

    setTransactions(prev => [newTxn, ...prev]);

    // Update customer lastTransactionDate & dueDate
    setCustomers(prev => prev.map(c => {
      if (c.id === targetCustomerId) {
        const updatedBal = type === 'credit' ? (c.balance + Number(amount)) : (c.balance - Number(amount));
        return {
          ...c,
          balance: updatedBal,
          lastTransactionDate: new Date().toISOString(),
          dueDate: type === 'credit' && dueDate ? dueDate : c.dueDate
        };
      }
      return c;
    }));

    if (shopSettings.soundEnabled) {
      playSuccessChime();
    }

    return newTxn;
  };

  /**
   * Add a new customer to ledger directly
   */
  const addNewCustomer = ({
    name,
    phone = '',
    address = 'Local Customer',
    openingBalance = 0,
    creditLimit = 5000,
    notes = ''
  }) => {
    if (!name || !name.trim()) return { success: false, error: 'Name is required' };
    const cleanName = name.trim();

    // Check if customer already exists
    const existing = customers.find(c => c.name.toLowerCase() === cleanName.toLowerCase());
    if (existing) {
      return { success: false, isExisting: true, customer: existing };
    }

    const newCustId = `cust_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-indigo-600', 'bg-purple-600', 'bg-amber-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const numOpeningBal = Number(openingBalance) || 0;

    const newCustomer = {
      id: newCustId,
      name: cleanName,
      phone: phone ? phone.trim() : '',
      address: address || 'Local Customer',
      balance: numOpeningBal,
      creditLimit: Number(creditLimit) || 5000,
      avatarColor: randomColor,
      createdAt: new Date().toISOString(),
      lastTransactionDate: new Date().toISOString(),
      dueDate: null,
      notes: notes || 'Added via BolKhata AI'
    };

    setCustomers(prev => [newCustomer, ...prev]);

    if (numOpeningBal > 0) {
      const initialTxn = {
        id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        customerId: newCustId,
        customerName: cleanName,
        type: 'credit',
        amount: numOpeningBal,
        items: ['आरंभिक बकाया (Opening Balance)'],
        paymentMethod: 'Khata',
        date: new Date().toISOString(),
        dueDate: null,
        notes: 'Opening balance',
        rawVoiceCommand: 'Initial balance'
      };
      setTransactions(prev => [initialTxn, ...prev]);
    }

    if (shopSettings.soundEnabled) {
      playSuccessChime();
    }

    return { success: true, isExisting: false, customer: newCustomer };
  };

  /**
   * Reset store to initial demo state
   */
  const resetToDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setShopSettings(DEFAULT_SHOP_SETTINGS);
    localStorage.removeItem(`${STORAGE_KEY}_customers`);
    localStorage.removeItem(`${STORAGE_KEY}_transactions`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
  };

  // Quick stats calculation
  const totalPendingUdhaar = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
  
  // Today's collections
  const todayStr = new Date().toISOString().split('T')[0];
  const paymentsToday = transactions
    .filter(t => t.type === 'payment' && t.date.startsWith(todayStr))
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const overdueCustomers = customers.filter(c => c.balance > 0 && c.dueDate && isOverdue(c.dueDate));
  const activeCustomersCount = customers.filter(c => c.balance > 0).length;

  // Filtered customer list
  const filteredCustomers = customers.filter(c => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
    if (!matchesSearch) return false;

    // Category filter
    if (customerFilter === 'pending') return c.balance > 0;
    if (customerFilter === 'cleared') return c.balance <= 0;
    if (customerFilter === 'overdue') return c.balance > 0 && c.dueDate && isOverdue(c.dueDate);

    return true; // 'all'
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || null;
  const customerTransactions = selectedCustomerId 
    ? transactions.filter(t => t.customerId === selectedCustomerId)
    : [];

  return (
    <KhataContext.Provider value={{
      customers,
      transactions,
      shopSettings,
      setShopSettings,
      activeModal,
      setActiveModal,
      modalPayload,
      setModalPayload,
      selectedCustomerId,
      setSelectedCustomerId,
      selectedCustomer,
      customerTransactions,
      customerFilter,
      setCustomerFilter,
      searchQuery,
      setSearchQuery,
      filteredCustomers,
      totalPendingUdhaar,
      paymentsToday,
      overdueCustomers,
      activeCustomersCount,
      getCustomerBalance,
      checkDuplicateTransaction,
      addNewCustomer,
      addTransaction,
      resetToDemoData,
    }}>
      {children}
    </KhataContext.Provider>
  );
}

export function useKhata() {
  const context = useContext(KhataContext);
  if (!context) {
    throw new Error('useKhata must be used within a KhataProvider');
  }
  return context;
}
