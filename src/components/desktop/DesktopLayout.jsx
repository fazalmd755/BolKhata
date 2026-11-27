import React from 'react';
import DesktopSidebar from './DesktopSidebar';
import DesktopHeader from './DesktopHeader';
import DesktopDashboard from './DesktopDashboard';
import DesktopTransactionsView from './DesktopTransactionsView';
import CustomerList from '../CustomerList';
import ReportsView from '../ReportsView';
import SettingsView from '../SettingsView';
import { useKhata } from '../../context/KhataContext';
import { Search, PlusCircle } from 'lucide-react';

export default function DesktopLayout({ 
  activeTab, 
  setActiveTab, 
  onOpenVoice, 
  onOpenPhoneModal, 
  onOpenAiAssistant 
}) {
  const { 
    searchQuery, 
    setSearchQuery, 
    customerFilter, 
    setCustomerFilter, 
    customers, 
    activeCustomersCount, 
    overdueCustomers, 
    setActiveModal, 
    setModalPayload 
  } = useKhata();

  const filters = [
    { id: 'all', label: 'सभी ग्राहक (All)', count: customers.length },
    { id: 'pending', label: 'बाकी उधार (Due)', count: activeCustomersCount },
    { id: 'overdue', label: 'अतिदेय (Overdue)', count: overdueCustomers.length, highlight: true },
    { id: 'cleared', label: 'चुकता (Clear)', count: customers.filter(c => c.balance <= 0).length },
  ];

  const handleAddNewCustomer = () => {
    setModalPayload({ defaultTab: 'new_customer' });
    setActiveModal('manual_entry');
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans antialiased overflow-hidden select-none">
      {/* 1. Left Fixed Responsive Sidebar (Tablet: w-20, Desktop: w-64) */}
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenVoice={onOpenVoice}
        onOpenAiAssistant={onOpenAiAssistant}
      />

      {/* 2. Main Right Content Area */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden">
        {/* Top Desktop App Header */}
        <DesktopHeader
          onOpenVoice={onOpenVoice}
          onOpenPhoneModal={onOpenPhoneModal}
          onOpenAiAssistant={onOpenAiAssistant}
        />

        {/* Scrollable Main Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] scrollbar-thin">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'home' && (
            <DesktopDashboard
              onOpenVoice={onOpenVoice}
              onGoToKhata={() => setActiveTab('customers')}
              onGoToReports={() => setActiveTab('reports')}
              onOpenAiAssistant={onOpenAiAssistant}
            />
          )}

          {/* TAB 2: CUSTOMERS (KHATA) */}
          {activeTab === 'customers' && (
            <div className="p-6 max-w-7xl mx-auto space-y-5">
              {/* Controls Bar */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {filters.map(f => {
                    const isActive = customerFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setCustomerFilter(f.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition active:scale-95 ${
                          isActive
                            ? (f.highlight ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-emerald-700 text-white border-emerald-700 shadow-xs')
                            : (f.highlight && f.count > 0 ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                          isActive ? 'bg-white/25 text-white' : (f.highlight && f.count > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500')
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ग्राहक खोजें..."
                      className="w-full pl-9 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleAddNewCustomer}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ नया ग्राहक</span>
                  </button>
                </div>
              </div>

              {/* Customer List Grid */}
              <CustomerList />
            </div>
          )}

          {/* TAB 3: TRANSACTIONS LEDGER */}
          {activeTab === 'transactions' && (
            <DesktopTransactionsView />
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === 'reports' && (
            <div className="p-6 max-w-4xl mx-auto">
              <ReportsView />
            </div>
          )}

          {/* TAB 5: SETTINGS & BACKUP */}
          {activeTab === 'settings' && (
            <div className="p-6 max-w-3xl mx-auto">
              <SettingsView />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
