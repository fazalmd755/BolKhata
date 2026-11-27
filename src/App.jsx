import React, { useState } from 'react';
import { KhataProvider, useKhata } from './context/KhataContext';
import AndroidStatusBar from './components/AndroidStatusBar';
import MobileHeader from './components/MobileHeader';
import BottomNavBar from './components/BottomNavBar';
import HomeTab from './components/HomeTab';
import CustomerList from './components/CustomerList';
import ReportsView from './components/ReportsView';
import SettingsView from './components/SettingsView';
import VoiceBottomSheet from './components/VoiceBottomSheet';
import PhoneConnectModal from './components/PhoneConnectModal';
import AiAssistantModal from './components/AiAssistantModal';
import TransactionConfirmModal from './components/TransactionConfirmModal';
import BalanceQueryModal from './components/BalanceQueryModal';
import ManualEntryModal from './components/ManualEntryModal';
import CustomerLedgerModal from './components/CustomerLedgerModal';
import WhatsAppReminderModal from './components/WhatsAppReminderModal';
import SettingsModal from './components/SettingsModal';
import { 
  Search, 
  PlusCircle, 
  Sparkles, 
  Smartphone, 
  Maximize2, 
  Minimize2,
  Users,
  QrCode
} from 'lucide-react';

function MobileAppLayout() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'customers' | 'reports' | 'settings'
  const [isVoiceSheetOpen, setIsVoiceSheetOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isFullWidthOnDesktop, setIsFullWidthOnDesktop] = useState(false);

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
    { id: 'all', label: 'सभी (All)', count: customers.length },
    { id: 'pending', label: 'बाकी (Due)', count: activeCustomersCount },
    { id: 'overdue', label: 'अतिदेय (Overdue)', count: overdueCustomers.length, highlight: true },
    { id: 'cleared', label: 'चुकता (Clear)', count: customers.filter(c => c.balance <= 0).length },
  ];

  return (
    <div className="min-h-screen bg-slate-50 sm:bg-slate-950 sm:py-6 sm:px-4 flex flex-col items-center justify-center font-sans select-none antialiased">
      {/* Desktop Helper Bar */}
      <div className={`hidden sm:flex items-center justify-between w-full ${isFullWidthOnDesktop ? 'max-w-3xl' : 'max-w-md'} mb-2.5 px-2 text-xs transition-all duration-300`}>
        <button
          onClick={() => setIsPhoneModalOpen(true)}
          className="flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full transition"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>QR कोड स्कैन करके फोन पर चलाएं</span>
        </button>

        <button
          onClick={() => setIsFullWidthOnDesktop(prev => !prev)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition"
          title="Toggle Full Width or Standard Layout"
        >
          {isFullWidthOnDesktop ? (
            <>
              <Minimize2 className="w-3 h-3" />
              <span>Standard View</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3 h-3" />
              <span>Full Screen View</span>
            </>
          )}
        </button>
      </div>

      {/* Main Responsive Web Application Shell */}
      <div className={`w-full bg-slate-50 flex flex-col overflow-hidden relative transition-all duration-300 ${
        isFullWidthOnDesktop 
          ? 'max-w-3xl sm:rounded-3xl min-h-screen sm:min-h-[90vh] sm:border sm:border-slate-800 sm:shadow-2xl' 
          : 'max-w-md sm:rounded-3xl sm:border sm:border-slate-800 sm:shadow-2xl h-screen sm:h-[880px]'
      }`}>
        {/* Desktop-only simulated top status bar */}
        <div className="hidden sm:block">
          {!isFullWidthOnDesktop && <AndroidStatusBar />}
        </div>

        {/* Top App Header */}
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenVoiceSheet={() => setIsVoiceSheetOpen(true)}
        />

        {/* Voice Bottom Sheet Overlay */}
        <VoiceBottomSheet
          isOpen={isVoiceSheetOpen}
          onClose={() => setIsVoiceSheetOpen(false)}
        />

        {/* Phone Connection Modal */}
        <PhoneConnectModal
          isOpen={isPhoneModalOpen}
          onClose={() => setIsPhoneModalOpen(false)}
        />

        {/* Action Modals */}
        <AiAssistantModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
        />
        <TransactionConfirmModal />
        <BalanceQueryModal />
        <ManualEntryModal />
        <CustomerLedgerModal />
        <WhatsAppReminderModal />
        <SettingsModal />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <KhataProvider>
      <MobileAppLayout />
    </KhataProvider>
  );
}
