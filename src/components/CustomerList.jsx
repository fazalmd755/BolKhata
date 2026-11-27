import React from 'react';
import CustomerCard from './CustomerCard';
import { useKhata } from '../context/KhataContext';
import { Users, UserX, PlusCircle } from 'lucide-react';

export default function CustomerList() {
  const { filteredCustomers, searchQuery, customerFilter, setActiveModal, setModalPayload } = useKhata();

  // Sort: Overdue & Highest pending balance on top
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    if (b.balance !== a.balance) {
      return b.balance - a.balance;
    }
    return new Date(b.lastTransactionDate) - new Date(a.lastTransactionDate);
  });

  if (sortedCustomers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <UserX className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-sm">
            कोई ग्राहक नहीं मिला (No Customers Found)
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            {searchQuery 
              ? `"${searchQuery}" से कोई रिकॉर्ड मैच नहीं हुआ।`
              : 'इस फ़िल्टर में कोई ग्राहक उपलब्ध नहीं है।'}
          </p>
        </div>
        <button
          onClick={() => {
            setModalPayload({ defaultTab: 'new_customer' });
            setActiveModal('manual_entry');
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>नया खाता बनाएं</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-semibold">
        <span>ग्राहक सूची (Khata List)</span>
        <span>{sortedCustomers.length} ग्राहक</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {sortedCustomers.map(cust => (
          <CustomerCard key={cust.id} customer={cust} />
        ))}
      </div>
    </div>
  );
}
