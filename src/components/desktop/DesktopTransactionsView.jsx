import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Filter, 
  Download, 
  Calendar,
  ExternalLink,
  MessageCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useKhata } from '../../context/KhataContext';
import { formatDisplayDate } from '../../utils/dateUtils';

export default function DesktopTransactionsView() {
  const { transactions, customers, setSelectedCustomerId, setActiveModal, setModalPayload } = useKhata();
  const [filterType, setFilterType] = useState('all'); // 'all' | 'credit' | 'payment'
  const [query, setQuery] = useState('');

  const activeTxns = transactions.filter(t => !t.deletedAt);

  const filteredTxns = activeTxns.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (query) {
      const q = query.toLowerCase();
      const matchName = t.customerName && t.customerName.toLowerCase().includes(q);
      const matchItems = Array.isArray(t.items) && t.items.some(i => i.toLowerCase().includes(q));
      const matchNotes = t.notes && t.notes.toLowerCase().includes(q);
      if (!matchName && !matchItems && !matchNotes) return false;
    }
    return true;
  });

  const handleOpenCustomer = (cid) => {
    setSelectedCustomerId(cid);
    setActiveModal('customer_ledger');
  };

  const handleExportCsv = () => {
    const headers = ['Txn_ID', 'Date', 'Customer_Name', 'Type', 'Amount_INR', 'Items', 'Payment_Method', 'Notes'];
    const rows = filteredTxns.map(t => [
      `"${t.id}"`,
      `"${t.date ? t.date.split('T')[0] : ''}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${t.type}"`,
      Number(t.amount) || 0,
      `"${(Array.isArray(t.items) ? t.items.join('; ') : '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod || 'Cash'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bolkhata-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Search / Filter Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight">
            लेन-देन बही (All Transactions Ledger)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            कुल {filteredTxns.length} लेन-देन रिकॉर्ड मिले
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ग्राहक या सामान खोजें..."
              className="pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              सभी ({activeTxns.length})
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'credit' ? 'bg-white text-red-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              उधार ({activeTxns.filter(t => t.type === 'credit').length})
            </button>
            <button
              onClick={() => setFilterType('payment')}
              className={`px-3 py-1.5 rounded-lg transition ${
                filterType === 'payment' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              जमा ({activeTxns.filter(t => t.type === 'payment').length})
            </button>
          </div>

          {/* Export CSV button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition"
            title="Download CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Excel Export</span>
          </button>
        </div>
      </div>

      {/* Main Full-Width Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr className="text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3.5 px-4">दिनांक (Date)</th>
                <th className="py-3.5 px-4">ग्राहक (Customer)</th>
                <th className="py-3.5 px-3">प्रकार (Type)</th>
                <th className="py-3.5 px-4">राशि (Amount)</th>
                <th className="py-3.5 px-4">सामान (Items)</th>
                <th className="py-3.5 px-3">माध्यम (Mode)</th>
                <th className="py-3.5 px-4">नोट्स / आवाज़ कमांड</th>
                <th className="py-3.5 px-4 text-right">खाता बही (Ledger)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    कोई लेन-देन रिकॉर्ड नहीं मिला।
                  </td>
                </tr>
              ) : (
                filteredTxns.map(txn => {
                  const isCredit = txn.type === 'credit';
                  return (
                    <tr key={txn.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {formatDisplayDate(txn.date)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <button
                          onClick={() => handleOpenCustomer(txn.customerId)}
                          className="hover:text-emerald-700 transition"
                        >
                          {txn.customerName}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          isCredit 
                            ? 'bg-red-50 text-red-700 border border-red-200' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isCredit ? 'उधार (Credit)' : 'जमा (Payment)'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-black whitespace-nowrap text-sm">
                        <span className={isCredit ? 'text-red-600' : 'text-emerald-600'}>
                          {isCredit ? '+' : '-'} ₹{Number(txn.amount).toLocaleString('en-IN')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[160px]">
                        {Array.isArray(txn.items) && txn.items.length > 0 ? txn.items.join(', ') : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-slate-700 font-semibold whitespace-nowrap">
                        {txn.paymentMethod || 'Cash'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 text-[11px] truncate max-w-[200px]">
                        {txn.rawVoiceCommand ? (
                          <span className="italic">"{txn.rawVoiceCommand}"</span>
                        ) : (
                          txn.notes || '—'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleOpenCustomer(txn.customerId)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 text-xs font-bold transition inline-flex items-center gap-1"
                        >
                          <span>बही देखें</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
