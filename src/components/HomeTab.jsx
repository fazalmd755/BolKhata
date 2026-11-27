import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Mic, 
  Plus, 
  Share2, 
  Calendar, 
  ChevronRight, 
  Sparkles, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { formatDisplayDate, formatRelativeTime, isOverdue } from '../utils/dateUtils';

export default function HomeTab({ onOpenVoice, onGoToKhata, onGoToReports, onOpenAiAssistant }) {
  const { 
    totalPendingUdhaar, 
    paymentsToday, 
    overdueCustomers, 
    activeCustomersCount, 
    transactions, 
    customers, 
    setSelectedCustomerId, 
    setActiveModal, 
    setModalPayload,
    shopSettings 
  } = useKhata();

  const recentTxns = transactions.slice(0, 5);

  const handleOpenCustomer = (cid) => {
    setSelectedCustomerId(cid);
    setActiveModal('customer_ledger');
  };

  const handleSendReminder = (customer) => {
    setModalPayload({ customer });
    setActiveModal('whatsapp_reminder');
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Top Emerald Shop Hero Card */}
      <div className="bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-700 rounded-3xl p-4 text-white shadow-md relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-0 -bottom-4 text-white/5 font-black text-7xl select-none pointer-events-none">
          खाता
        </div>

        <div className="flex items-center justify-between text-xs text-emerald-100 font-medium mb-1">
          <span>कुल बकाया उधार (Net Credit Due)</span>
          <span className="text-[10px] bg-emerald-900/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            {activeCustomersCount} ग्राहक
          </span>
        </div>

        <div className="text-3xl font-black tracking-tight text-white flex items-baseline gap-1">
          <span>₹{totalPendingUdhaar.toLocaleString('en-IN')}</span>
          <span className="text-xs font-semibold text-emerald-200">बाकी</span>
        </div>

        <div className="mt-3 pt-2.5 border-t border-emerald-600/60 flex items-center justify-between text-xs">
          <div>
            <span className="text-emerald-200 text-[11px] block">आज का जमा (Today):</span>
            <span className="font-bold text-white text-sm">
              ₹{paymentsToday.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-right">
            <span className="text-emerald-200 text-[11px] block">अतिदेय (Overdue):</span>
            <span className="font-bold text-amber-300 text-sm">
              {overdueCustomers.length} ग्राहक लेट
            </span>
          </div>
        </div>
      </div>

      {/* AI Munshi Conversational Assistant Card */}
      <div 
        onClick={onOpenAiAssistant}
        className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-white rounded-2xl p-3.5 border-2 border-emerald-300 hover:border-emerald-500 shadow-sm transition-all cursor-pointer group active:scale-98 relative overflow-hidden"
      >
        <div className="flex items-center justify-between gap-2 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-all">
              <Sparkles className="w-5 h-5 animate-pulse text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-emerald-800 transition">
                  बोलखाता AI मुंशी से बात करें
                </h4>
                <span className="text-[9px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-200 animate-ping"></span>
                  <span>AI Live</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-1 font-medium">
                पूछें: 'कुल कितना बकाया है?', 'नया ग्राहक जोड़ो' या 'आज मोहन ने 1000 लिया'
              </p>
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 group-hover:bg-emerald-700 shadow-xs transition-all">
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Quick Mobile Action Buttons Bar */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <button
          onClick={onOpenVoice}
          className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[11px] font-bold text-emerald-900">बोलकर लिखें</span>
        </button>

        <button
          onClick={() => {
            setModalPayload({ defaultTab: 'transaction' });
            setActiveModal('manual_entry');
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">+ नई एंट्री</span>
        </button>

        <button
          onClick={onGoToReports}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">डेबुक</span>
        </button>

        <button
          onClick={() => {
            const firstWithBalance = customers.find(c => c.balance > 0);
            if (firstWithBalance) handleSendReminder(firstWithBalance);
          }}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex flex-col items-center justify-center gap-1 active:scale-95 transition shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <span className="text-[11px] font-bold text-slate-800">तकादा</span>
        </button>
      </div>

      {/* Urgent Overdue Alert Card (if any) */}
      {overdueCustomers.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>अतिदेय ग्राहक (Payment Overdue Alert)</span>
            </div>
            <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
              {overdueCustomers.length} ग्राहक
            </span>
          </div>

          <div className="space-y-1.5">
            {overdueCustomers.map(c => (
              <div 
                key={c.id}
                onClick={() => handleOpenCustomer(c.id)}
                className="bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between cursor-pointer hover:bg-amber-50/50 transition"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{c.name}</h4>
                  <span className="text-[10px] text-red-600 font-semibold">देय तिथि बीत चुकी है ({c.dueDate})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-sm text-red-600">₹{c.balance.toLocaleString('en-IN')}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendReminder(c);
                    }}
                    className="p-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                    title="Send WhatsApp Reminder"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions List */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-700">हालिया लेन-देन (Recent Transactions)</h3>
          <button 
            onClick={onGoToKhata}
            className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
          >
            <span>सभी देखें</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {recentTxns.map(t => {
            const isCredit = t.type === 'credit';
            return (
              <div 
                key={t.id}
                onClick={() => handleOpenCustomer(t.customerId)}
                className="p-3 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`p-1.5 rounded-xl shrink-0 ${
                    isCredit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {isCredit ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-800 truncate">{t.customerName}</h4>
                    <p className="text-[10px] text-slate-400">
                      {formatRelativeTime(t.date)} • {t.paymentMethod || 'Khata'}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`text-sm font-black ${
                    isCredit ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {isCredit ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
                  </div>
                  <span className="text-[9px] font-semibold text-slate-400">
                    {isCredit ? 'उधार' : 'जमा'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
