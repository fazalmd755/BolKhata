import React, { useState } from 'react';
import { 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Phone, 
  MessageCircle, 
  Calendar, 
  Tag, 
  Sparkles, 
  Share2, 
  Printer, 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  Clock, 
  CreditCard,
  Edit2,
  Trash2,
  Check,
  History
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useTranslation } from '../i18n';
import { formatDisplayDate, formatRelativeTime, isOverdue, getDaysOverdue } from '../utils/dateUtils';
import { parseRupees, formatCurrency } from '../utils/money';

export default function CustomerLedgerModal() {
  const { 
    activeModal, 
    setActiveModal, 
    selectedCustomer, 
    customerTransactions, 
    setSelectedCustomerId, 
    setModalPayload,
    editTransaction,
    deleteTransaction,
    getCustomerBalance,
    shopSettings 
  } = useKhata();
  const { t: tr } = useTranslation();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'credit' | 'payment'
  const [editingTxn, setEditingTxn] = useState(null); // { id, amount, type, notes }
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  if (activeModal !== 'customer_ledger' || !selectedCustomer) return null;

  const balance = getCustomerBalance(selectedCustomer.id);
  const isCustOverdue = selectedCustomer.dueDate && isOverdue(selectedCustomer.dueDate) && balance > 0;
  const daysOverdue = selectedCustomer.dueDate ? getDaysOverdue(selectedCustomer.dueDate) : 0;

  // Calculate running balance chronologically from earliest to latest (ignoring soft-deleted)
  const activeTxns = customerTransactions.filter(t => !t.deletedAt);
  const sortedAsc = [...activeTxns].sort((a, b) => new Date(a.date) - new Date(b.date));
  let running = 0;
  const txnsWithRunningBalance = sortedAsc.map(t => {
    const amt = parseRupees(t.amount);
    if (t.type === 'credit') {
      running += amt;
    } else {
      running -= amt;
    }
    return { ...t, runningBalance: running };
  });

  // Display newest first
  const displayTxns = txnsWithRunningBalance
    .reverse()
    .filter(t => filterType === 'all' || t.type === filterType);

  const handleOpenReminder = () => {
    setModalPayload({ customer: selectedCustomer });
    setActiveModal('whatsapp_reminder');
  };

  const handleQuickAddCredit = () => {
    setActiveModal('manual_entry');
  };

  const handleQuickAddPayment = () => {
    setActiveModal('manual_entry');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStartEdit = (t) => {
    setEditingTxn({
      id: t.id,
      amount: t.amount,
      type: t.type,
      notes: t.notes || (t.items ? t.items.join(', ') : '')
    });
  };

  const handleSaveEdit = () => {
    if (!editingTxn) return;
    const numAmt = parseRupees(editingTxn.amount);
    if (numAmt <= 0) {
      alert('कृपया मान्य राशि दर्ज करें (Enter a valid amount)');
      return;
    }
    editTransaction(editingTxn.id, {
      amount: numAmt,
      type: editingTxn.type,
      notes: editingTxn.notes
    });
    setEditingTxn(null);
  };

  const handleDelete = (txnId) => {
    deleteTransaction(txnId);
    setConfirmDeleteId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl h-[92vh] flex flex-col overflow-hidden">
        {/* Ledger Top Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${selectedCustomer.avatarColor || 'bg-emerald-600'} text-white font-extrabold flex items-center justify-center text-lg shadow-md`}>
              {selectedCustomer.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">{selectedCustomer.name}</h2>
                {isCustOverdue && (
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded-full">
                    {daysOverdue} Days Overdue
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {selectedCustomer.phone ? `+91 ${selectedCustomer.phone}` : selectedCustomer.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {selectedCustomer.phone && (
              <a
                href={`tel:+91${selectedCustomer.phone}`}
                className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Call Customer"
                aria-label="Call customer"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleOpenReminder}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 border border-emerald-500/30 transition"
              title="WhatsApp Payment Reminder"
              aria-label="WhatsApp Payment Reminder"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Customer Balance Banner Card */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              कुल बकाया हिसाब (Net Outstanding)
            </span>
            <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 ${
              balance > 0 ? 'text-red-600' : 'text-emerald-600'
            }`}>
              ₹{balance.toLocaleString('en-IN')}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{customerTransactions.length} लेन-देन (Transactions)</span>
              {selectedCustomer.dueDate && (
                <span>• देय तिथि: {selectedCustomer.dueDate}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2">
            {balance > 0 && (
              <button
                onClick={handleOpenReminder}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>तकादा भेजें (WhatsApp)</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center border border-slate-200 hover:bg-white text-slate-600 rounded-xl transition"
              title="Print Ledger"
              aria-label="Print Ledger"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Chips row */}
        <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              सभी ({customerTransactions.length})
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'credit' ? 'bg-red-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              उधार ({customerTransactions.filter(t => t.type === 'credit').length})
            </button>
            <button
              onClick={() => setFilterType('payment')}
              className={`px-3 py-1 rounded-lg font-semibold transition ${
                filterType === 'payment' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              जमा ({customerTransactions.filter(t => t.type === 'payment').length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 hidden sm:inline">
            लास्ट लेन-देन: {formatRelativeTime(selectedCustomer.lastTransactionDate)}
          </span>
        </div>

        {/* Transactions Chronological Timeline */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {displayTxns.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              कोई लेन-देन नहीं मिला। नीचे दिए बटनों से एंट्री जोड़ें।
            </div>
          ) : (
            displayTxns.map(t => {
              const isCredit = t.type === 'credit';
              const isEditing = editingTxn && editingTxn.id === t.id;
              const isConfirmingDelete = confirmDeleteId === t.id;

              if (isEditing) {
                return (
                  <div key={t.id} className="bg-amber-50/80 rounded-2xl p-4 border border-amber-300 shadow-md space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                      <span>लेन-देन संपादित करें (Edit Transaction)</span>
                      <button onClick={() => setEditingTxn(null)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">प्रकार (Type)</label>
                        <select
                          value={editingTxn.type}
                          onChange={(e) => setEditingTxn(prev => ({ ...prev, type: e.target.value }))}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-bold"
                        >
                          <option value="credit">उधार दिया (Credit)</option>
                          <option value="payment">जमा मिला (Payment)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 block mb-1">राशि (₹ Amount)</label>
                        <input
                          type="number"
                          value={editingTxn.amount}
                          onChange={(e) => setEditingTxn(prev => ({ ...prev, amount: e.target.value }))}
                          className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl font-bold"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">विवरण / नोट (Note/Items)</label>
                      <input
                        type="text"
                        value={editingTxn.notes}
                        onChange={(e) => setEditingTxn(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full text-xs p-2 bg-white border border-slate-300 rounded-xl"
                        placeholder="सामान या टिप्पणी..."
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setEditingTxn(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
                      >
                        रद्द करें (Cancel)
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>सहेजें (Save)</span>
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs hover:border-slate-300 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-2 rounded-xl mt-0.5 ${
                        isCredit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${isCredit ? 'text-red-600' : 'text-emerald-700'}`}>
                            {isCredit ? 'उधार दिया (You Gave)' : 'जमा मिला (You Got)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatDisplayDate(t.date)}
                          </span>
                          {t.editedAt && (
                            <span className="text-[9px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md flex items-center gap-0.5">
                              <History className="w-2.5 h-2.5" />
                              {tr('edited_badge')}
                            </span>
                          )}
                        </div>

                        {/* Items / Details */}
                        {t.items && t.items.length > 0 && (
                          <div className="text-xs text-slate-700 font-semibold mt-1 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{t.items.join(', ')}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {t.notes && (
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            {t.notes}
                          </div>
                        )}

                        {/* Notes or Voice original prompt */}
                        {t.rawVoiceCommand && (
                          <div className="text-[11px] text-slate-500 italic mt-0.5 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-emerald-500" />
                            <span>"{t.rawVoiceCommand}"</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Amount & Running Balance */}
                    <div className="text-right">
                      <div className={`text-base font-extrabold tracking-tight ${
                        isCredit ? 'text-red-600' : 'text-emerald-600'
                      }`}>
                        {isCredit ? '+' : '-'} ₹{parseRupees(t.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        बाकी: <span className="font-bold text-slate-800">₹{t.runningBalance.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        {t.paymentMethod || (isCredit ? 'Khata' : 'Cash')}
                      </span>
                    </div>
                  </div>

                  {/* Transaction Actions: Edit / Delete */}
                  {isConfirmingDelete ? (
                    <div className="mt-2 pt-2 border-t border-red-100 bg-red-50/60 rounded-xl p-2.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-red-700">क्या आप वाकई इस लेन-देन को हटाना चाहते हैं?</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 font-semibold text-[11px]"
                        >
                          {tr('cancel')}
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-[11px] hover:bg-red-700 shadow-2xs"
                        >
                          {tr('delete')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-end gap-2 text-slate-400">
                      <button
                        onClick={() => handleStartEdit(t)}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 px-2 py-1 min-h-[36px] rounded-md hover:bg-slate-100 flex items-center gap-1 transition"
                        title="Edit Entry"
                        aria-label="Edit Entry"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>संशोधित करें</span>
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 px-2 py-1 min-h-[36px] rounded-md hover:bg-red-50 flex items-center gap-1 transition"
                        title="Delete Entry"
                        aria-label="Delete Entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>हटाएं</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Sticky Action Bar */}
        <div className="p-3 bg-white border-t border-slate-200 grid grid-cols-2 gap-3">
          <button
            onClick={handleQuickAddCredit}
            className="py-3 px-4 bg-red-600 hover:bg-red-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-red-200 transition"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>उधार दिया (You Gave ₹)</span>
          </button>

          <button
            onClick={handleQuickAddPayment}
            className="py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>जमा मिला (You Got ₹)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
