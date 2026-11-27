import React from 'react';
import { 
  FileText, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Printer, 
  Share2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { formatDisplayDate } from '../utils/dateUtils';

export default function ReportsView() {
  const { 
    transactions, 
    customers, 
    totalPendingUdhaar, 
    paymentsToday, 
    shopSettings 
  } = useKhata();

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTxns = transactions.filter(t => t.date.startsWith(todayStr));

  const todayCredit = todayTxns
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const todayPayment = todayTxns
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleShareDaybook = () => {
    const text = `📢 ${shopSettings.shopName} - आज का डेबुक (${todayStr})\n` +
      `--------------------------------\n` +
      `🔴 आज का उधार दिया: ₹${todayCredit.toLocaleString('en-IN')}\n` +
      `🟢 आज का जमा मिला: ₹${todayPayment.toLocaleString('en-IN')}\n` +
      `📊 कुल बाकी खाता: ₹${totalPendingUdhaar.toLocaleString('en-IN')}\n` +
      `लेन-देन संख्या: ${todayTxns.length}\n` +
      `\nBolKhata - Your Digital Khata`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">डेबुक एवं रिपोर्ट (Daybook & Reports)</h2>
          <p className="text-xs text-slate-500">दैनिक आय-व्यय और उधारी सारांश</p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleShareDaybook}
            className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>
          <button
            onClick={handlePrint}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Today's Cash Flow Summary Card */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <span>आज का हिसाब ({formatDisplayDate(new Date())})</span>
          </div>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full">
            {todayTxns.length} एंट्रीज
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-red-50 border border-red-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-red-600 mb-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>उधार दिया (Credit)</span>
            </div>
            <div className="text-lg font-black text-red-600">
              ₹{todayCredit.toLocaleString('en-IN')}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 mb-0.5">
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>जमा मिला (Payment)</span>
            </div>
            <div className="text-lg font-black text-emerald-700">
              ₹{todayPayment.toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Transactions Ledger */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-700 px-1">आज की एंट्रियां (Today's Entries)</h3>
        {todayTxns.length === 0 ? (
          <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
            आज कोई एंट्री नहीं हुई है।
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
            {todayTxns.map(t => {
              const isCredit = t.type === 'credit';
              return (
                <div key={t.id} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{t.customerName}</h4>
                    <span className="text-[10px] text-slate-400">
                      {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {t.paymentMethod || 'Cash'}
                    </span>
                  </div>
                  <div className={`font-black text-sm ${isCredit ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isCredit ? '+' : '-'} ₹{Number(t.amount).toLocaleString('en-IN')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
