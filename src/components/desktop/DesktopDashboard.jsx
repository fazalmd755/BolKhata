import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Users, 
  Mic, 
  Share2, 
  Phone, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Receipt,
  MessageCircle,
  TrendingUp,
  CreditCard,
  ShoppingBag,
  ExternalLink,
  Zap
} from 'lucide-react';
import { useKhata } from '../../context/KhataContext';
import { formatDisplayDate, formatRelativeTime, isOverdue, getDaysOverdue } from '../../utils/dateUtils';
import { DEMO_VOICE_COMMANDS } from '../../data/mockData';
import { parseVoiceInput } from '../../utils/voiceParser';
import { speakText } from '../../utils/soundEffects';

export default function DesktopDashboard({ onOpenVoice, onGoToKhata, onGoToReports, onOpenAiAssistant }) {
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
    checkDuplicateTransaction,
    shopSettings 
  } = useKhata();

  const totalOverdueAmount = overdueCustomers.reduce((sum, c) => sum + c.balance, 0);
  const clearedCustomersCount = customers.filter(c => c.balance <= 0).length;

  const activeTransactions = transactions.filter(t => !t.deletedAt);
  // Recent 8 transactions for the desktop table
  const recentTransactions = activeTransactions.slice(0, 8);

  // Top debtors sorted by balance
  const topDebtors = [...customers]
    .filter(c => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5);

  const handleOpenCustomer = (cid) => {
    setSelectedCustomerId(cid);
    setActiveModal('customer_ledger');
  };

  const handleSendReminder = (customer, e) => {
    if (e) e.stopPropagation();
    setSelectedCustomerId(customer.id);
    setModalPayload({ customer });
    setActiveModal('whatsapp_reminder');
  };

  const handleRunDemoCommand = (cmd) => {
    const text = cmd.text;
    const parsed = parseVoiceInput(text, customers);

    if (parsed.intent === 'balance_query') {
      const matchedCust = parsed.customer || customers.find(c => 
        c.name.toLowerCase().includes(parsed.customerName.toLowerCase())
      );

      setModalPayload({
        rawText: text,
        parsed,
        customer: matchedCust || null,
        customerName: matchedCust ? matchedCust.name : parsed.customerName,
        balance: matchedCust ? matchedCust.balance : 0,
      });
      setActiveModal('balance_query');

      if (shopSettings.voiceReadoutEnabled) {
        const speakMsg = matchedCust 
          ? `${matchedCust.name} का कुल हिसाब ${matchedCust.balance} रुपये बाकी है।`
          : `${parsed.customerName} का खाता नहीं मिला।`;
        speakText(speakMsg, 'hi-IN');
      }
    } else {
      const matchedCust = parsed.customer || customers.find(c => 
        c.name.toLowerCase().includes(parsed.customerName.toLowerCase())
      );

      const dupCheck = checkDuplicateTransaction(
        matchedCust ? matchedCust.id : null,
        parsed.amount,
        parsed.intent
      );

      setModalPayload({
        rawText: text,
        parsed,
        customer: matchedCust || null,
        customerId: matchedCust ? matchedCust.id : null,
        customerName: matchedCust ? matchedCust.name : parsed.customerName,
        isNewCustomer: !matchedCust,
        amount: parsed.amount || '',
        type: parsed.intent || 'credit',
        items: parsed.items || [],
        itemsString: parsed.itemsString || '',
        paymentMethod: parsed.paymentMethod || 'Cash',
        dueDate: parsed.dueDate || '',
        notes: `Demo voice command: "${text}"`,
        isDuplicate: dupCheck.isDuplicate,
        duplicateMessage: dupCheck.message || ''
      });
      setActiveModal('confirm');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 4 Financial Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pending Udhaar */}
        <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>कुल बाकी उधार (Net Udhaar)</span>
              <div className="p-2 rounded-xl bg-red-50 text-red-600">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-red-600 tracking-tight mt-1">
              ₹{totalPendingUdhaar.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>{activeCustomersCount} ग्राहकों पर बकाया</span>
            <span className="text-red-600 font-bold">देय</span>
          </div>
        </div>

        {/* Payments Collected Today */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>आज का जमा (Today's Collection)</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-emerald-600 tracking-tight mt-1">
              ₹{paymentsToday.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-xs text-emerald-700 font-semibold mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>दुकान काउंटर वसूली</span>
            <span className="font-bold">आज</span>
          </div>
        </div>

        {/* Overdue / High Risk */}
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>अतिदेय राशि (Overdue Total)</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-amber-600 tracking-tight mt-1">
              ₹{totalOverdueAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-xs text-amber-800 font-semibold mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>{overdueCustomers.length} ग्राहक लेट हैं</span>
            <span className="text-[11px] bg-amber-100 px-2 py-0.5 rounded-full font-bold">तकादा भेजें</span>
          </div>
        </div>

        {/* Customers Count */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
              <span>कुल ग्राहक (Total Accounts)</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mt-1">
              {customers.length}
            </div>
          </div>
          <div className="text-xs text-slate-500 font-semibold mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>{clearedCustomersCount} खाते पूरी तरह चुकता</span>
            <span className="text-emerald-700 font-bold">सक्रिय</span>
          </div>
        </div>
      </div>

      {/* Prominent Voice Entry & Demo Commands Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 -bottom-6 text-white/5 font-black text-9xl select-none pointer-events-none">
          खाता
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-xs text-emerald-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Voice-First Kirana AI • 100% Client-Side</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black tracking-tight leading-snug">
              माइक दबाकर बोलें — BolKhata हिसाब खुद लिख लेगा
            </h2>
            <p className="text-xs text-emerald-100 font-medium">
              उदाहरण: "रमेश भाई को 2500 का उधार दिया" या "सुरेश ने 1200 UPI जमा किए"। शून्य टाइपिंग, तुरंत बही-खाता एंट्री।
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenVoice}
              className="py-3 px-6 rounded-2xl bg-white text-emerald-800 hover:bg-emerald-50 active:scale-95 font-extrabold text-sm flex items-center gap-2.5 shadow-xl transition"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Mic className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span>बोलकर एंट्री करें</span>
            </button>

            <button
              onClick={onOpenAiAssistant}
              className="py-3 px-5 rounded-2xl bg-emerald-900/70 hover:bg-emerald-900 text-white border border-emerald-500/40 text-xs font-bold transition flex items-center gap-2"
            >
              <span>AI मुंशी से पूछें</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Demo Voice Command Chips (Clickable) */}
        <div className="mt-5 pt-4 border-t border-emerald-600/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-emerald-200 shrink-0 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
            <span>सैंपल कमांड टेस्ट करें:</span>
          </span>
          {DEMO_VOICE_COMMANDS.map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => handleRunDemoCommand(cmd)}
              className="whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/20 text-white transition active:scale-95 shrink-0"
              title={cmd.text}
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Recent Transactions Data Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">हाल के लेन-देन (Recent Transactions)</h3>
                  <p className="text-xs text-slate-400">दुकान के नवीनतम जमा-उधार रिकॉर्ड</p>
                </div>
              </div>
              <button
                onClick={onGoToReports}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
              >
                <span>पूरी डेबुक देखें</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs mt-2">
                <thead>
                  <tr className="text-slate-400 font-bold border-b border-slate-100 text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-2">दिनांक (Date)</th>
                    <th className="py-3 px-3">ग्राहक (Customer)</th>
                    <th className="py-3 px-2">प्रकार (Type)</th>
                    <th className="py-3 px-3">राशि (Amount)</th>
                    <th className="py-3 px-2">सामान (Items)</th>
                    <th className="py-3 px-2">माध्यम (Mode)</th>
                    <th className="py-3 px-2 text-right">कार्रवाई (Action)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentTransactions.map(txn => {
                    const isCredit = txn.type === 'credit';
                    return (
                      <tr key={txn.id} className="hover:bg-slate-50 transition group">
                        <td className="py-3 px-2 text-slate-500 whitespace-nowrap">
                          {formatDisplayDate(txn.date)}
                        </td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleOpenCustomer(txn.customerId)}
                            className="font-bold text-slate-800 hover:text-emerald-700 text-left truncate max-w-[130px] block transition"
                          >
                            {txn.customerName}
                          </button>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            isCredit 
                              ? 'bg-red-50 text-red-700 border border-red-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {isCredit ? 'उधार' : 'जमा'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-extrabold text-slate-900 whitespace-nowrap">
                          <span className={isCredit ? 'text-red-600' : 'text-emerald-600'}>
                            {isCredit ? '+' : '-'} ₹{Number(txn.amount).toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-slate-500 truncate max-w-[120px]">
                          {Array.isArray(txn.items) && txn.items.length > 0 ? txn.items.join(', ') : '—'}
                        </td>
                        <td className="py-3 px-2 text-slate-600 font-semibold whitespace-nowrap">
                          {txn.paymentMethod || 'Cash'}
                        </td>
                        <td className="py-3 px-2 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenCustomer(txn.customerId)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 transition"
                            title="खाता बही खोलें"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
            <span>कुल {transactions.length} लेन-देन दर्ज हैं</span>
            <button
              onClick={onGoToKhata}
              className="font-bold text-emerald-700 hover:underline"
            >
              सभी ग्राहक देखें ➔
            </button>
          </div>
        </div>

        {/* Right Column (1/3): Top Debtors & Overdue Reminders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">तकादा सूची (Overdue & Due)</h3>
                  <p className="text-xs text-slate-400">अधिकतम बकाया वाले ग्राहक</p>
                </div>
              </div>
            </div>

            {/* List of top debtors */}
            <div className="space-y-3 mt-4">
              {topDebtors.map(cust => {
                const isLate = cust.dueDate && isOverdue(cust.dueDate);
                const days = cust.dueDate ? getDaysOverdue(cust.dueDate) : 0;

                return (
                  <div
                    key={cust.id}
                    onClick={() => handleOpenCustomer(cust.id)}
                    className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 transition cursor-pointer flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl ${cust.avatarColor || 'bg-emerald-600'} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs`}>
                        {cust.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-emerald-800 transition">
                            {cust.name}
                          </h4>
                          {isLate && (
                            <span className="text-[9px] font-extrabold bg-red-100 text-red-700 px-1.5 py-0.2 rounded-full">
                              {days}d Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          {cust.phone ? `+91 ${cust.phone}` : cust.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-xs font-black text-red-600 block">
                          ₹{cust.balance.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400">बाकी</span>
                      </div>

                      <button
                        onClick={(e) => handleSendReminder(cust, e)}
                        className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-2xs"
                        title="WhatsApp तकादा भेजें"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <button
              onClick={onGoToKhata}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
            >
              सभी ग्राहक बही देखें (View All)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
