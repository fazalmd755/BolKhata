import React from 'react';
import { 
  X, 
  HelpCircle, 
  Volume2, 
  Share2, 
  ArrowDownLeft, 
  BookOpen, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  Calendar 
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { isOverdue, getDaysOverdue, formatDisplayDate } from '../utils/dateUtils';
import { speakText } from '../utils/soundEffects';

export default function BalanceQueryModal() {
  const { 
    activeModal, 
    setActiveModal, 
    modalPayload, 
    setSelectedCustomerId, 
    shopSettings 
  } = useKhata();

  if (activeModal !== 'balance_query' || !modalPayload) return null;

  const customer = modalPayload.customer;
  const customerName = modalPayload.customerName || (customer ? customer.name : 'Unknown Customer');
  const balance = customer ? customer.balance : 0;
  const isCustOverdue = customer && customer.dueDate && isOverdue(customer.dueDate);
  const daysOverdue = customer && customer.dueDate ? getDaysOverdue(customer.dueDate) : 0;

  const spokenSentence = customer
    ? `${customer.name} जी का कुल बकाया हिसाब ₹${balance.toLocaleString('en-IN')} है।`
    : `${customerName} का कोई रिकॉर्ड नहीं मिला।`;

  const handleSpeakAgain = () => {
    speakText(spokenSentence, shopSettings.language || 'hi-IN');
  };

  const handleOpenReminder = () => {
    setActiveModal('whatsapp_reminder');
  };

  const handleRecordPayment = () => {
    setActiveModal('manual_entry');
  };

  const handleViewLedger = () => {
    if (customer) {
      setSelectedCustomerId(customer.id);
      setActiveModal('customer_ledger');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <HelpCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>हिसाब पूछताछ (Balance Query)</span>
              </h2>
              <p className="text-xs text-white/80">
                Voice Query Answer • कोई लेन-देन दर्ज नहीं किया गया
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          {/* Spoken Voice Transcription preview */}
          {modalPayload.rawText && (
            <div className="bg-blue-50/60 rounded-xl p-3 border border-blue-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  You Asked (आपने पूछा)
                </span>
                <span className="text-xs text-slate-800 font-medium italic">
                  "{modalPayload.rawText}"
                </span>
              </div>
              <button
                onClick={handleSpeakAgain}
                className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition shrink-0"
                title="Speak voice response again"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Customer Balance Highlight Card */}
          {customer ? (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <div className={`w-9 h-9 rounded-full ${customer.avatarColor || 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-sm shadow-sm`}>
                  {customer.name.charAt(0)}
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-bold text-slate-900">{customer.name}</h3>
                  <p className="text-[11px] text-slate-500">{customer.phone ? `+91 ${customer.phone}` : customer.address}</p>
                </div>
              </div>

              {/* Main Balance Display */}
              <div className="py-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  कुल बकाया राशि (Outstanding Balance)
                </span>
                <div className={`text-3xl font-extrabold tracking-tight mt-1 ${
                  balance > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}>
                  ₹{balance.toLocaleString('en-IN')}
                </div>
                <div className="mt-1 flex items-center justify-center gap-1.5">
                  {balance > 0 ? (
                    isCustOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3" />
                        <span>{daysOverdue} दिन से अतिदेय (Overdue)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span>उधार बाकी (Pending Credit)</span>
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>हिसाब चुकता (Cleared / No Dues)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Due Date & Last Txn Info */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-left text-xs text-slate-600">
                <div>
                  <span className="text-[10px] text-slate-400 block">देय तिथि (Due Date):</span>
                  <span className="font-semibold text-slate-700">
                    {customer.dueDate ? formatDisplayDate(customer.dueDate) : 'तय नहीं (Not set)'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">अंतिम लेन-देन (Last Active):</span>
                  <span className="font-semibold text-slate-700">
                    {formatDisplayDate(customer.lastTransactionDate)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-center">
              <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-amber-900">
                "{customerName}" का खाता नहीं मिला
              </h3>
              <p className="text-xs text-amber-700 mt-1">
                यह ग्राहक खाता बही में मौजूद नहीं है। आप नया खाता बना सकते हैं।
              </p>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-1">
            {customer && balance > 0 && (
              <button
                type="button"
                onClick={handleOpenReminder}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp तकादा भेजें (Send Reminder)</span>
              </button>
            )}

            {customer && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleRecordPayment}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>जमा दर्ज करें (Pay)</span>
                </button>
                <button
                  type="button"
                  onClick={handleViewLedger}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>खाता बही (Ledger)</span>
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-medium transition"
            >
              बंद करें (Dismiss)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
