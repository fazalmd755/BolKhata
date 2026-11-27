import React, { useState } from 'react';
import { KhataProvider, useKhata } from './context/KhataContext';
import MobileHeader from './components/MobileHeader';
import BottomNavBar from './components/BottomNavBar';
import HomeTab from './components/HomeTab';
import CustomerList from './components/CustomerList';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import DesktopLayout from './components/desktop/DesktopLayout';
import VoiceBottomSheet from './components/VoiceBottomSheet';
import PhoneConnectModal from './components/PhoneConnectModal';
import AiAssistantModal from './components/AiAssistantModal';
import TransactionConfirmModal from './components/TransactionConfirmModal';
import BalanceQueryModal from './components/BalanceQueryModal';
import ManualEntryModal from './components/ManualEntryModal';
import CustomerLedgerModal from './components/CustomerLedgerModal';
import WhatsAppReminderModal from './components/WhatsAppReminderModal';
import UndoToast from './components/UndoToast';
import { Search, PlusCircle } from 'lucide-react';

function AppLayout() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'customers' | 'transactions' | 'reports' | 'settings'
  const [isVoiceSheetOpen, setIsVoiceSheetOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  const { 
    searchQuery, 
    setSearchQuery, 
    customerFilter, 
    setCustomerFilter, 
    customers, 
    activeCustomersCount, 
    overdueCustomers, 
    setActiveModal,
    setModalPayload,
    undoAction,
    undoLastAction,
    setUndoAction
  } = useKhata();

  const filters = [
    { id: 'all', label: 'सभी (All)', count: customers.length },
    { id: 'pending', label: 'बाकी (Due)', count: activeCustomersCount },
    { id: 'overdue', label: 'अतिदेय (Overdue)', count: overdueCustomers.length, highlight: true },
    { id: 'cleared', label: 'चुकता (Clear)', count: customers.filter(c => c.balance <= 0).length },
  ];

  return (
    <>
      {/* 1. MOBILE LAYOUT (< 768px): Exact Existing Mobile App Experience */}
      <div className="block md:hidden min-h-screen bg-slate-50 font-sans select-none antialiased">
        <div className="w-full min-h-screen flex flex-col bg-slate-50">
          {/* Mobile Top App Bar */}
          <MobileHeader 
            onOpenPhoneModal={() => setIsPhoneModalOpen(true)} 
            onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
          />

          {/* Scrollable Mobile Viewport Content */}
          <div className="flex-1 overflow-y-auto px-3.5 pt-3.5 pb-20 scrollbar-none bg-slate-50">
            {/* TAB 1: HOME */}
            {activeTab === 'home' && (
              <HomeTab
                onOpenVoice={() => setIsVoiceSheetOpen(true)}
                onGoToKhata={() => setActiveTab('customers')}
                onGoToReports={() => setActiveTab('reports')}
                onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
              />
            )}

            {/* TAB 2: KHATA (CUSTOMERS) */}
            {activeTab === 'customers' && (
              <div className="space-y-3 pb-6">
                {/* Search Bar & + Customer */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ग्राहक खोजें (Search)..."
                      className="w-full pl-9 pr-7 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 shadow-2xs"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setModalPayload({ defaultTab: 'new_customer' });
                      setActiveModal('manual_entry');
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shrink-0 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>+ नया खाता</span>
                  </button>
                </div>

                {/* Filter Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {filters.map(f => {
                    const isActive = customerFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => setCustomerFilter(f.id)}
                        className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 border transition active:scale-95 ${
                          isActive
                            ? (f.highlight ? 'bg-red-600 text-white border-red-600 shadow-xs' : 'bg-emerald-700 text-white border-emerald-700 shadow-xs')
                            : (f.highlight && f.count > 0 ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
                        }`}
                      >
                        <span>{f.label}</span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/25 text-white' : (f.highlight && f.count > 0 ? 'bg-amber-200 text-amber-900' : 'bg-slate-100 text-slate-500')
                        }`}>
                          {f.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Customer List */}
                <CustomerList />
              </div>
            )}

            {/* TAB 3: REPORTS */}
            {activeTab === 'reports' && (
              <ReportsView />
            )}

            {/* TAB 4: SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsView />
            )}
          </div>

          {/* Mobile Bottom Navigation Bar with Floating Center Mic */}
          <BottomNavBar
            activeTab={activeTab === 'transactions' ? 'home' : activeTab}
            setActiveTab={setActiveTab}
            onOpenVoiceSheet={() => setIsVoiceSheetOpen(true)}
          />
        </div>
      </div>

      {/* 2. TABLET & DESKTOP DASHBOARD (>= 768px): Professional Business Dashboard */}
      <div className="hidden md:block">
        <DesktopLayout
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenVoice={() => setIsVoiceSheetOpen(true)}
          onOpenPhoneModal={() => setIsPhoneModalOpen(true)}
          onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        />
      </div>

      {/* Shared Root Modals (Available seamlessly across Mobile, Tablet & Desktop) */}
      <VoiceBottomSheet
        isOpen={isVoiceSheetOpen}
        onClose={() => setIsVoiceSheetOpen(false)}
      />
      <PhoneConnectModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
      />
      <AiAssistantModal
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
      />
      <TransactionConfirmModal />
      <BalanceQueryModal />
      <ManualEntryModal />
      <CustomerLedgerModal />
      <WhatsAppReminderModal />
      <UndoToast
        undoAction={undoAction}
        onUndo={undoLastAction}
        onDismiss={() => setUndoAction(null)}
      />
    </>
  );
}

export default function App() {
  return (
    <KhataProvider>
      <AppLayout />
    </KhataProvider>
  );
}
