import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Share2, 
  Copy, 
  Check, 
  Smartphone, 
  Sparkles, 
  Phone, 
  QrCode, 
  ExternalLink 
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useTranslation } from '../i18n';
import { REMINDER_TEMPLATES, createWhatsAppUrl, generateUpiLink } from '../utils/whatsapp';
import { formatDisplayDate } from '../utils/dateUtils';

export default function WhatsAppReminderModal() {
  const { 
    activeModal, 
    setActiveModal, 
    modalPayload, 
    selectedCustomer, 
    shopSettings 
  } = useKhata();
  const { t } = useTranslation();

  const customer = modalPayload?.customer || selectedCustomer;

  const [selectedTemplateId, setSelectedTemplateId] = useState('friendly');
  const [phone, setPhone] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Regenerate message when template or customer changes
  useEffect(() => {
    if (customer && activeModal === 'whatsapp_reminder') {
      setPhone(customer.phone || '');
      const tpl = REMINDER_TEMPLATES.find(t => t.id === selectedTemplateId) || REMINDER_TEMPLATES[0];
      const dueDateStr = customer.dueDate ? formatDisplayDate(customer.dueDate) : '';
      const generated = tpl.generate({
        customerName: customer.name,
        amount: customer.balance || 0,
        shopName: shopSettings.shopName,
        upiId: shopSettings.upiId,
        dueDate: dueDateStr
      });
      setCustomMessage(generated);
    }
  }, [selectedTemplateId, customer, shopSettings, activeModal]);

  // Early return ONLY AFTER all hooks are declared
  if (activeModal !== 'whatsapp_reminder' || !customer) return null;

  const amount = customer.balance;
  const dueDateStr = customer.dueDate ? formatDisplayDate(customer.dueDate) : '';

  const upiLink = generateUpiLink({
    upiId: shopSettings.upiId,
    shopName: shopSettings.shopName,
    amount,
    note: `Khata Payment from ${customer.name}`
  });

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyUpiLink = () => {
    navigator.clipboard.writeText(upiLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    const url = createWhatsAppUrl(phone, customMessage);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>{t('whatsapp_reminder')}</span>
              </h2>
              <p className="text-xs text-white/80">
                UPI पेमेंट लिंक के साथ डिजिटल तकादा भेजें
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/20 transition text-white"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Target Customer Info Header */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className={`w-10 h-10 rounded-xl ${customer.avatarColor || 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-sm shadow-xs`}>
                {customer.name.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{customer.name}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone (e.g. 9876543210)"
                    className="font-semibold text-slate-700 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-emerald-600 max-w-[140px]"
                  />
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                बकाया (Due)
              </span>
              <span className="text-lg font-black text-red-600">
                ₹{amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Template Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              संदेश शैली (Select Reminder Tone)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {REMINDER_TEMPLATES.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplateId(tpl.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold text-left transition ${
                    selectedTemplateId === tpl.id
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-200'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Customizable Message Text Box */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-600">
                संदेश का पूर्वावलोकन (Preview & Edit Message)
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <textarea
              rows="6"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 text-xs sm:text-sm font-sans rounded-2xl border border-slate-300 focus:outline-none focus:border-emerald-600 bg-emerald-50/10 text-slate-800"
            />
          </div>

          {/* UPI Link Details Pill */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
                <QrCode className="w-4 h-4" />
              </div>
              <div className="truncate">
                <span className="font-semibold text-slate-700 block">दुकानदार UPI ID:</span>
                <span className="text-slate-500 font-mono text-[11px] truncate">{shopSettings.upiId}</span>
              </div>
            </div>
            <button
              onClick={handleCopyUpiLink}
              className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shrink-0 flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? 'Copied!' : 'Copy UPI Link'}</span>
            </button>
          </div>

          {/* Action Button: Send via WhatsApp */}
          <div className="pt-1 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-1/3 py-3 rounded-2xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              {t('cancel')}
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-2/3 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>WhatsApp पर भेजें</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/80" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
