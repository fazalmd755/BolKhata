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
  CreditCard 
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { formatDisplayDate, formatRelativeTime, isOverdue, getDaysOverdue } from '../utils/dateUtils';

export default function CustomerLedgerModal() {
  const { 
    activeModal, 
    setActiveModal, 
    selectedCustomer, 
    customerTransactions, 
    setSelectedCustomerId, 
    setModalPayload,
    shopSettings 
  } = useKhata();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'credit' | 'payment'

  if (activeModal !== 'customer_ledger' || !selectedCustomer) return null;

  const balance = selectedCustomer.balance;
  const isCustOverdue = selectedCustomer.dueDate && isOverdue(selectedCustomer.dueDate) && balance > 0;
  const daysOverdue = selectedCustomer.dueDate ? getDaysOverdue(selectedCustomer.dueDate) : 0;

  // Calculate running balance chronologically from earliest to latest
  const sortedAsc = [...customerTransactions].sort((a, b) => new Date(a.date) - new Date(b.date));
  let running = 0;
  const txnsWithRunningBalance = sortedAsc.map(t => {
    if (t.type === 'credit') {
      running += Number(t.amount);
    } else {
      running -= Number(t.amount);
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
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="Call Customer"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={handleOpenReminder}
              className="p-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-400 border border-emerald-500/30 transition"
              title="WhatsApp Payment Reminder"
            >
              <MessageCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveModal(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
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
              className="p-2 border border-slate-200 hover:bg-white text-slate-600 rounded-xl transition"
              title="Print Ledger"
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
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isCredit ? 'text-red-600' : 'text-emerald-700'}`}>
                            {isCredit ? 'उधार दिया (You Gave)' : 'जमा मिला (You Got)'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {formatDisplayDate(t.date)}
                          </span>
                        </div>

                        {/* Items / Details */}
                        {t.items && t.items.length > 0 && (
                          <div className="text-xs text-slate-700 font-semibold mt-1 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400" />
                            <span>{t.items.join(', ')}</span>
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
                        {isCredit ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        बाकी: <span className="font-bold text-slate-800">₹{t.runningBalance.toLocaleString('en-IN')}</span>
                      </div>
                      <span className="text-[9px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">
                        {t.paymentMethod || (isCredit ? 'Khata' : 'Cash')}
                      </span>
                    </div>
                  </div>
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
