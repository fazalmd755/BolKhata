import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Check, 
  AlertTriangle, 
  UserPlus, 
  Calendar, 
  Tag, 
  CreditCard, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Phone,
  ShieldAlert,
  Info,
  Users
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import confetti from 'canvas-confetti';
import { validateAndEnhanceIndianName, cleanCustomerCandidateName } from '../utils/indianNameValidator.js';
import { parseRupees, isValidAmount } from '../utils/money.js';

export default function TransactionConfirmModal() {
  const { 
    activeModal, 
    setActiveModal, 
    modalPayload, 
    addTransaction, 
    customers 
  } = useKhata();

  // All Hooks MUST be declared unconditionally at the top of the component
  const [targetCustomerId, setTargetCustomerId] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('credit'); // 'credit' | 'payment'
  const [itemsString, setItemsString] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [ignoreDuplicateWarning, setIgnoreDuplicateWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Sync state whenever modalPayload changes (fixes stuck 'credit' bug!)
  useEffect(() => {
    if (modalPayload && activeModal === 'confirm') {
      const initialCustId = modalPayload.customerId || (modalPayload.customer ? modalPayload.customer.id : null);
      setTargetCustomerId(initialCustId);

      const nameVal = validateAndEnhanceIndianName(modalPayload.customerName || '', customers);
      const cleanName = (nameVal.isValid && nameVal.cleanName !== 'Customer') 
        ? nameVal.cleanName 
        : (modalPayload.customerName || '');
      setCustomerName(cleanName);
      setPhone(modalPayload.customer ? modalPayload.customer.phone : (modalPayload.phone || ''));
      setAmount(modalPayload.amount ? String(modalPayload.amount) : '');
      setType(modalPayload.type || 'credit');
      setItemsString(
        Array.isArray(modalPayload.items) ? modalPayload.items.join(', ') : (modalPayload.itemsString || '')
      );
      setPaymentMethod(modalPayload.paymentMethod || 'Cash');
      setDueDate(modalPayload.dueDate || '');
      setNotes(modalPayload.notes || '');
      setIgnoreDuplicateWarning(false);
      setSubmitError('');
    }
  }, [modalPayload, activeModal, customers]);

  // Ambiguity chooser: find all customers with the same name (A4)
  const nameMatches = useMemo(() => {
    if (!customerName || !customerName.trim()) return [];
    const q = customerName.toLowerCase().trim();
    return customers.filter(c => c.name.toLowerCase().trim() === q);
  }, [customerName, customers]);

  // AI Indian name reasoning & validation hook
  const nameValidation = useMemo(() => {
    return validateAndEnhanceIndianName(customerName, customers);
  }, [customerName, customers]);

  // Early return ONLY AFTER all Hooks are called
  if (activeModal !== 'confirm' || !modalPayload) return null;

  const isNewCustomer = Boolean(modalPayload.isNewCustomer) || (!targetCustomerId && nameMatches.length === 0);
  const isDuplicate = Boolean(modalPayload.isDuplicate) && !ignoreDuplicateWarning;

  const handleConfirm = (e) => {
    e.preventDefault();
    setSubmitError('');

    const numericAmount = parseRupees(amount);
    if (!customerName.trim() || !isValidAmount(numericAmount)) {
      setSubmitError('कृपया मान्य ग्राहक नाम और राशि दर्ज करें (Enter valid customer name and amount)');
      return;
    }

    setIsSubmitting(true);

    try {
      // Split items
      const itemsList = itemsString
        .split(',')
        .map(i => i.trim())
        .filter(Boolean);

      const result = addTransaction({
        customerId: targetCustomerId,
        customerName: customerName.trim(),
        phone: phone.trim(),
        type,
        amount: numericAmount,
        items: itemsList,
        paymentMethod: type === 'payment' ? paymentMethod : 'Khata',
        dueDate: type === 'credit' ? dueDate : null,
        notes: notes.trim(),
        rawVoiceCommand: modalPayload.rawText || ''
      });

      if (!result.success) {
        setSubmitError(result.error || 'लेन-देन जोड़ने में त्रुटि हुई');
        setIsSubmitting(false);
        return;
      }

      // Joyful celebratory confetti
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#059669', '#10b981', '#34d399', '#f59e0b']
        });
      } catch (e) {
        // ignore confetti error
      }

      setActiveModal(null);
    } catch (err) {
      console.error('Failed to add transaction', err);
      setSubmitError('अपेक्षित त्रुटि: ' + (err.message || 'Failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className={`p-4 text-white flex items-center justify-between ${
          type === 'credit' 
            ? 'bg-gradient-to-r from-red-600 to-rose-600' 
            : 'bg-gradient-to-r from-emerald-600 to-teal-600'
        }`}>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              {type === 'credit' ? (
                <ArrowUpRight className="w-5 h-5 text-white" />
              ) : (
                <ArrowDownLeft className="w-5 h-5 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>पुष्टि करें (Confirm Transaction)</span>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                  AI Parsed
                </span>
              </h2>
              <p className="text-xs text-white/80">
                {type === 'credit' ? 'उधार दिया (You gave credit)' : 'जमा मिला (Payment received)'}
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

        {/* Modal Scrollable Body */}
        <form onSubmit={handleConfirm} className="p-4 space-y-4 overflow-y-auto">
          {/* Original Voice Audio Transcript Card */}
          {modalPayload.rawText && (
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Voice Command Spoken:</span>
              </div>
              <div className="text-slate-800 font-medium italic">
                "{modalPayload.rawText}"
              </div>
            </div>
          )}

          {/* Duplicate Transaction Warning Banner */}
          {modalPayload.isDuplicate && (
            <div className="rounded-xl p-3 bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Duplicate Warning Detected!</span>
                  <p className="mt-0.5">{modalPayload.duplicateMessage}</p>
                </div>
              </div>
              <label className="flex items-center gap-2 font-medium cursor-pointer pt-1 text-slate-800 border-t border-amber-200">
                <input
                  type="checkbox"
                  checked={ignoreDuplicateWarning}
                  onChange={(e) => setIgnoreDuplicateWarning(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span>हाँ, यह अलग लेन-देन है (Yes, save this duplicate anyway)</span>
              </label>
            </div>
          )}

          {/* Transaction Type Selector (Credit vs Payment) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              लेन-देन प्रकार (Transaction Type)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                  type === 'credit'
                    ? 'bg-red-50 border-red-500 text-red-600 ring-2 ring-red-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-red-500" />
                <span>उधार दिया (Credit)</span>
              </button>
              <button
                type="button"
                onClick={() => setType('payment')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                  type === 'payment'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-200'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>जमा मिला (Got Payment)</span>
              </button>
            </div>
          </div>

          {/* Amount Input with big Rupee symbol */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              राशि (Amount in ₹) *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-bold text-lg">
                ₹
              </div>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="1"
                step="any"
                className="w-full pl-9 pr-3 py-2.5 text-lg font-extrabold text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
                placeholder="0"
              />
            </div>
          </div>

          {/* Customer Name & Phone */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-600">
                ग्राहक का नाम (Customer Name) *
              </label>
              {isNewCustomer ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  <UserPlus className="w-3 h-3" />
                  <span>नया ग्राहक (New Customer)</span>
                </span>
              ) : (
                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  मौजूदा ग्राहक (Registered)
                </span>
              )}
            </div>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              onBlur={() => setCustomerName(prev => cleanCustomerCandidateName(prev) || prev)}
              required
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              placeholder="e.g. Ramesh Bhai"
            />

            {/* Multiple Customer Matching Chooser (A4) */}
            {nameMatches.length > 1 && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <Users className="w-3.5 h-3.5 text-blue-600" />
                  <span>एक से अधिक ग्राहक मिले (Select Customer):</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {nameMatches.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setTargetCustomerId(c.id);
                        setCustomerName(c.name);
                        setPhone(c.phone || '');
                      }}
                      className={`p-2 rounded-lg text-left text-xs border transition flex items-center justify-between ${
                        targetCustomerId === c.id
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-blue-100/50'
                      }`}
                    >
                      <div>
                        <span className="font-semibold">{c.name}</span>
                        {c.phone && <span className="text-[11px] opacity-80 ml-2">📞 {c.phone}</span>}
                        {c.address && <span className="text-[10px] opacity-75 ml-2">({c.address})</span>}
                      </div>
                      <span className="text-[11px] font-bold">
                        ₹{c.balance || 0}
                      </span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTargetCustomerId(null);
                    }}
                    className={`p-1.5 rounded-lg text-center text-xs border transition ${
                      targetCustomerId === null
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    + अलग नया खाता बनाएं (Create New Customer Separate)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Customer Phone (especially helpful for new customers & WhatsApp reminders) */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3 h-3 text-slate-400" />
              <span>मोबाइल नंबर (Phone for WhatsApp Reminder)</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength="10"
                className="w-full pl-11 pr-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Items Purchased (Relevant for Credit) */}
          {type === 'credit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>सामान का विवरण (Items / Goods)</span>
              </label>
              <input
                type="text"
                value={itemsString}
                onChange={(e) => setItemsString(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                placeholder="उदा: Atta 10kg, Mustard Oil, Cheeni"
              />
            </div>
          )}

          {/* Payment Method (for payment) */}
          {type === 'payment' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                <span>भुगतान का माध्यम (Payment Method)</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Cash', 'UPI', 'Cheque'].map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`py-1.5 text-xs font-semibold rounded-lg border transition ${
                      paymentMethod === m 
                        ? 'bg-emerald-600 text-white border-emerald-600' 
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {m === 'Cash' ? '💵 Cash' : m === 'UPI' ? '📱 UPI' : '📑 Cheque'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Due Date (for Credit) */}
          {type === 'credit' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>उधार चुकाने की तारीख (Due Date)</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          )}

          {/* Extra Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              टिप्पणी (Optional Note)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              placeholder="e.g. Sham tak aayenge, etc."
            />
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition"
            >
              रद्द करें (Cancel)
            </button>

            <button
              type="submit"
              disabled={isSubmitting || (isDuplicate && !ignoreDuplicateWarning)}
              className={`w-2/3 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition ${
                type === 'credit'
                  ? 'bg-red-600 hover:bg-red-700 shadow-red-200'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              } disabled:bg-slate-300 disabled:shadow-none`}
            >
              <Check className="w-4 h-4" />
              <span>
                {isNewCustomer ? 'ग्राहक जोड़ें और सुरक्षित करें (Save & Add Customer)' : 'खाते में दर्ज करें (Save Entry)'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
