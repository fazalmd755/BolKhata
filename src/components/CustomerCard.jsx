import React from 'react';
import { 
  Phone, 
  MessageCircle, 
  BookOpen, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight,
  Share2
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { isOverdue, getDaysOverdue, formatRelativeTime } from '../utils/dateUtils';
import { useTranslation } from '../i18n';

export default function CustomerCard({ customer }) {
  const { 
    setSelectedCustomerId, 
    setActiveModal, 
    setModalPayload 
  } = useKhata();
  const { t } = useTranslation();

  const balance = customer.balance;
  const isCustOverdue = customer.dueDate && isOverdue(customer.dueDate) && balance > 0;
  const daysOverdue = customer.dueDate ? getDaysOverdue(customer.dueDate) : 0;

  const handleOpenLedger = () => {
    setSelectedCustomerId(customer.id);
    setActiveModal('customer_ledger');
  };

  const handleSendReminder = (e) => {
    e.stopPropagation();
    setSelectedCustomerId(customer.id);
    setModalPayload({ customer });
    setActiveModal('whatsapp_reminder');
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    setSelectedCustomerId(customer.id);
    setActiveModal('manual_entry');
  };

  return (
    <div 
      onClick={handleOpenLedger}
      className="bg-white hover:bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200 hover:border-emerald-300 shadow-2xs transition-all cursor-pointer group"
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Avatar & Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-11 h-11 rounded-2xl ${customer.avatarColor || 'bg-emerald-600'} text-white font-extrabold flex items-center justify-center text-base shrink-0 shadow-xs`}>
            {customer.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition">
                {customer.name}
              </h3>
              {isCustOverdue && (
                <span className="text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-1.5 py-0.2 rounded-full inline-flex items-center gap-0.5">
                  <AlertCircle className="w-2.5 h-2.5" />
                  <span>{daysOverdue}d Late</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span>{customer.phone ? `+91 ${customer.phone}` : customer.address}</span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] text-slate-400">
                {formatRelativeTime(customer.lastTransactionDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Balance & Status */}
        <div className="text-right shrink-0">
          <div className={`text-base sm:text-lg font-black tracking-tight ${
            balance > 0 ? 'text-red-600' : 'text-emerald-600'
          }`}>
            ₹{balance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] font-semibold">
            {balance > 0 ? (
              <span className="text-red-500 bg-red-50 px-1.5 py-0.5 rounded-md">
                {t('due_badge')}
              </span>
            ) : (
              <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                {t('clear_badge')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Strip */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="text-[11px] text-slate-400 truncate max-w-[180px]">
          {customer.notes || t('click_to_view_khata')}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Direct Phone Call */}
          {customer.phone && (
            <a
              href={`tel:+91${customer.phone}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition"
              title="Call Customer"
              aria-label="Call customer"
            >
              <Phone className="w-3.5 h-3.5" />
            </a>
          )}

          {/* WhatsApp Reminder Button */}
          {balance > 0 && (
            <button
              onClick={handleSendReminder}
              className="p-2 min-h-[36px] rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition flex items-center gap-1 text-[11px] font-bold"
              title="WhatsApp Payment Reminder"
              aria-label="WhatsApp Payment Reminder"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-emerald-600/10" />
              <span className="hidden sm:inline">तकादा</span>
            </button>
          )}

          {/* Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            title="Add Transaction"
            aria-label="Add Transaction"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 transition" />
        </div>
      </div>
    </div>
  );
}
