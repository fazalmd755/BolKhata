import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check, 
  ArrowUpRight, 
  ArrowDownLeft, 
  User, 
  UserPlus,
  CreditCard, 
  Calendar, 
  Tag, 
  Phone, 
  MapPin, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import confetti from 'canvas-confetti';

export default function ManualEntryModal() {
  const { 
    activeModal, 
    setActiveModal, 
    modalPayload,
    customers, 
    selectedCustomerId, 
    setSelectedCustomerId,
    addTransaction,
    addNewCustomer 
  } = useKhata();

  const defaultCust = customers.find(c => c.id === selectedCustomerId) || customers[0] || null;

  // Active sub-mode: 'transaction' | 'new_customer'
  const [mode, setMode] = useState('transaction');

  // Transaction form state
  const [selectedCustId, setSelectedCustId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState('credit');
  const [amount, setAmount] = useState('');
  const [itemsString, setItemsString] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // New customer form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustOpeningBal, setNewCustOpeningBal] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');

  // Sync when modal opens or payload changes
  useEffect(() => {
    if (activeModal === 'manual_entry') {
      if (modalPayload?.defaultTab === 'new_customer') {
        setMode('new_customer');
        setNewCustName(modalPayload.prefillName || '');
        setNewCustPhone(modalPayload.prefillPhone || '');
      } else {
        setMode('transaction');
        if (defaultCust) {
          setSelectedCustId(defaultCust.id);
          setCustomerName(defaultCust.name);
        }
      }
    }
  }, [modalPayload, activeModal, defaultCust]);

  // Early return ONLY AFTER all Hooks are declared
  if (activeModal !== 'manual_entry') return null;

  const handleSelectCustomer = (e) => {
    const cid = e.target.value;
    if (cid === 'CREATE_NEW') {
      setMode('new_customer');
      return;
    }
    setSelectedCustId(cid);
    const found = customers.find(c => c.id === cid);
    if (found) {
      setCustomerName(found.name);
    }
  };

  const handleTransactionSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      alert('कृपया मान्य राशि (Amount) दर्ज करें');
      return;
    }

    const items = itemsString ? itemsString.split(',').map(s => s.trim()).filter(Boolean) : [];

    addTransaction({
      customerId: selectedCustId || null,
      customerName: customerName || 'Customer',
      type,
      amount: Number(amount),
      items: items.length > 0 ? items : (type === 'credit' ? ['Kirana General'] : []),
      paymentMethod: type === 'payment' ? paymentMethod : 'Khata',
      dueDate: type === 'credit' && dueDate ? dueDate : null,
      notes: notes.trim(),
      rawVoiceCommand: 'Manual Entry'
    });

    try {
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.8 } });
    } catch (e) {}

    setActiveModal(null);
  };

  const handleNewCustomerSubmit = (e) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert('कृपया ग्राहक का नाम दर्ज करें');
      return;
    }

    const res = addNewCustomer({
      name: newCustName.trim(),
      phone: newCustPhone.trim(),
      address: newCustAddress.trim() || 'Local Customer',
      openingBalance: Number(newCustOpeningBal) || 0,
      notes: newCustNotes.trim()
    });

    if (res && (res.success || res.customer)) {
      try {
        confetti({ particleCount: 50, spread: 65, origin: { y: 0.7 } });
      } catch (e) {}

      if (res.customer?.id) {
        setSelectedCustomerId(res.customer.id);
      }
      setActiveModal(null);
    } else {
      alert(res?.error || 'ग्राहक खाता बनाने में त्रुटि हुई');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Mode Switcher */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-white/20">
                {mode === 'transaction' ? (
                  type === 'credit' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownLeft className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </div>
              <div>
                <h2 className="text-base font-bold">
                  {mode === 'transaction' 
                    ? (type === 'credit' ? 'उधार दर्ज करें' : 'जमा दर्ज करें')
                    : 'नया ग्राहक खाता जोड़ें'}
                </h2>
                <p className="text-xs text-emerald-100">
                  {mode === 'transaction' ? 'लेन-देन एंट्री' : 'नया खाता बही खोलें'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => setActiveModal(null)} 
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-white/20 text-white transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mode Switch Tabs */}
          <div className="grid grid-cols-2 p-1 bg-emerald-900/50 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setMode('transaction')}
              className={`py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === 'transaction'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>लेन-देन (Entry)</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('new_customer')}
              className={`py-1.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                mode === 'new_customer'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ नया ग्राहक</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Transaction Entry Form */}
        {mode === 'transaction' && (
          <form onSubmit={handleTransactionSubmit} className="p-4 space-y-3.5 overflow-y-auto">
            {/* Type Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType('credit')}
                className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                  type === 'credit'
                    ? 'bg-red-50 border-red-500 text-red-600 ring-2 ring-red-200'
                    : 'border-slate-200 text-slate-600'
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
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                <span>जमा मिला (Payment)</span>
              </button>
            </div>

            {/* Customer Selection */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-600">
                  ग्राहक चुनें (Select Customer) *
                </label>
                <button
                  type="button"
                  onClick={() => setMode('new_customer')}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
                >
                  <UserPlus className="w-3 h-3" />
                  <span>+ नया ग्राहक</span>
                </button>
              </div>
              <select
                value={selectedCustId}
                onChange={handleSelectCustomer}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-semibold"
              >
                <option value="CREATE_NEW" className="text-emerald-700 font-bold bg-emerald-50">
                  + नया ग्राहक बनाएं (+ Add New Customer)
                </option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(📞 ${c.phone})` : (c.address ? `(${c.address})` : '')} (बकाया: ₹{c.balance.toLocaleString('en-IN')})
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                राशि (Amount) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  placeholder="0"
                  className="w-full pl-9 pr-3 py-2 text-base font-extrabold rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Item details if Credit */}
            {type === 'credit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  <span>सामान / विवरण (Items - Optional)</span>
                </label>
                <input
                  type="text"
                  value={itemsString}
                  onChange={(e) => setItemsString(e.target.value)}
                  placeholder="उदा: Atta, Tel, Cheeni"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-medium"
                />
              </div>
            )}

            {/* Payment Method if Payment */}
            {type === 'payment' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  भुगतान माध्यम (Payment Mode)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Cash', 'UPI', 'Cheque'].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-1.5 text-xs font-semibold rounded-xl border transition ${
                        paymentMethod === m ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Due date if Credit */}
            {type === 'credit' && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>देय तारीख (Payment Due Date)</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className={`w-2/3 py-2.5 rounded-xl text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition ${
                  type === 'credit' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>सेव करें (Save)</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: New Customer Form */}
        {mode === 'new_customer' && (
          <form onSubmit={handleNewCustomerSubmit} className="p-4 space-y-3.5 overflow-y-auto">
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>ग्राहक का नाम (Customer Name) *</span>
              </label>
              <input
                type="text"
                required
                value={newCustName}
                onChange={(e) => setNewCustName(e.target.value)}
                placeholder="उदा: राहुल शर्मा / अमन वर्मा"
                className="w-full px-3 py-2.5 text-sm font-bold text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>मोबाइल नंबर (10 Digits - Optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">+91</span>
                <input
                  type="tel"
                  maxLength={10}
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full pl-11 pr-3 py-2 text-xs sm:text-sm font-mono font-semibold rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Address / Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>इलाका / पता (Address/Area - Optional)</span>
              </label>
              <input
                type="text"
                value={newCustAddress}
                onChange={(e) => setNewCustAddress(e.target.value)}
                placeholder="उदा: मुख्य बाजार / गली नं. 4"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                आरंभिक बकाया (Opening Due Balance - ₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  value={newCustOpeningBal}
                  onChange={(e) => setNewCustOpeningBal(e.target.value)}
                  placeholder="0 (यदि पुराना बकाया है)"
                  className="w-full pl-8 pr-3 py-2 text-sm font-bold text-slate-800 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                यदि ग्राहक का कोई पुराना उधारी बाकी है, तो यहाँ दर्ज करें (अन्यथा 0 रहने दें)।
              </p>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                टिप्पणी / पहचान (Notes - Optional)
              </label>
              <input
                type="text"
                value={newCustNotes}
                onChange={(e) => setNewCustNotes(e.target.value)}
                placeholder="उदा: शर्मा जी का बेटा / किराना रेगुलर"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-98 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ नया ग्राहक जोड़ें</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
