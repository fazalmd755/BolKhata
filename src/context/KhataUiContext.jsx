import React, { createContext, useContext, useState, useMemo, useCallback, useRef } from 'react';
import { useKhataData } from './KhataDataContext';
import { isOverdue } from '../utils/dateUtils';

const KhataUiContext = createContext();

export function KhataUiProvider({ children }) {
  const { customers, transactions, setTransactions } = useKhataData();

  // Modal & Navigation States
  const [activeModal, setActiveModal] = useState(null);
  const [modalPayload, setModalPayload] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [customerFilter, setCustomerFilter] = useState('all'); // 'all' | 'pending' | 'cleared' | 'overdue'
  const [searchQuery, setSearchQuery] = useState('');
  const [undoAction, setUndoAction] = useState(null);
  const undoTimerRef = useRef(null);

  /**
   * Register an undoable action with a 7-second auto-dismiss timer
   */
  const registerUndo = useCallback((action) => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoAction(action);
    undoTimerRef.current = setTimeout(() => {
      setUndoAction(null);
    }, 7000);
  }, []);

  /**
   * Undo the last added or deleted transaction (A3)
   */
  const undoLastAction = useCallback(() => {
    if (!undoAction) return;

    if (undoAction.type === 'delete') {
      // Restore deleted transaction
      setTransactions(prev => prev.map(t => {
        if (t.id === undoAction.transactionId) {
          return { ...t, deletedAt: null };
        }
        return t;
      }));
    } else if (undoAction.type === 'add') {
      // Soft delete the newly added transaction
      setTransactions(prev => prev.map(t => {
        if (t.id === undoAction.transactionId) {
          return { ...t, deletedAt: new Date().toISOString() };
        }
        return t;
      }));
    }

    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setUndoAction(null);
  }, [undoAction, setTransactions]);

  // Filtered customer list for UI
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const q = (searchQuery || '').toLowerCase().trim();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q));
      if (!matchesSearch) return false;

      if (customerFilter === 'pending') return c.balance > 0;
      if (customerFilter === 'cleared') return c.balance <= 0;
      if (customerFilter === 'overdue') return c.balance > 0 && c.dueDate && isOverdue(c.dueDate);

      return true;
    });
  }, [customers, searchQuery, customerFilter]);

  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [selectedCustomerId, customers]);

  const customerTransactions = useMemo(() => {
    if (!selectedCustomerId) return [];
    return transactions.filter(t => !t.deletedAt && t.customerId === selectedCustomerId);
  }, [selectedCustomerId, transactions]);

  return (
    <KhataUiContext.Provider value={{
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
      undoAction,
      setUndoAction,
      undoLastAction,
      registerUndo
    }}>
      {children}
    </KhataUiContext.Provider>
  );
}

export function useKhataUi() {
  const context = useContext(KhataUiContext);
  if (!context) {
    throw new Error('useKhataUi must be used within a KhataUiProvider');
  }
  return context;
}
