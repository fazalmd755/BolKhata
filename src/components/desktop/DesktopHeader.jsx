import React from 'react';
import { 
  Search, 
  PlusCircle, 
  Mic, 
  Bot, 
  QrCode, 
  Volume2, 
  VolumeX, 
  Store,
  Sparkles,
  Bell,
  UserCheck
} from 'lucide-react';
import { useKhata } from '../../context/KhataContext';
import { useTranslation } from '../../i18n';

export default function DesktopHeader({ onOpenVoice, onOpenPhoneModal, onOpenAiAssistant }) {
  const { 
    searchQuery, 
    setSearchQuery, 
    shopSettings, 
    setShopSettings, 
    setActiveModal, 
    setModalPayload
  } = useKhata();
  const { t, isEnglish, toggleLanguage } = useTranslation();

  const toggleSound = () => {
    setShopSettings(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  const handleAddNewCustomer = () => {
    setModalPayload({ defaultTab: 'new_customer' });
    setActiveModal('manual_entry');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 select-none">
      {/* Left: Global Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_customers_placeholder')}
            className="w-full pl-10 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs min-w-[24px] min-h-[24px] flex items-center justify-center"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick Action Buttons & Store Status */}
      <div className="flex items-center gap-2.5">
        {/* Store Active Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{shopSettings.shopName}</span>
          <span className="text-emerald-400">•</span>
          <span className="text-[11px] text-emerald-700 font-normal">Active Ledger</span>
        </div>

        {/* Language Switcher Pill */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-2 min-h-[44px] rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-extrabold transition flex items-center gap-1"
          title={t('language_label')}
          aria-label="Switch language"
        >
          <span>{isEnglish ? 'EN' : 'HI'}</span>
        </button>

        {/* AI Munshi Voice Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-700/20 active:scale-95 transition"
          title={t('ai_card_title')}
          aria-label={t('ai_card_title')}
        >
          <Bot className="w-3.5 h-3.5 animate-pulse text-white" />
          <span className="hidden sm:inline">{t('ai_munshi')}</span>
        </button>

        {/* + Naya Khata / Add Customer Button */}
        <button
          onClick={handleAddNewCustomer}
          aria-label={t('new_customer_btn')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-sm transition min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden md:inline">{t('new_customer_btn')}</span>
        </button>

        {/* QR Code Connect on Phone */}
        <button
          onClick={onOpenPhoneModal}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
          title="QR कोड स्कैन करके फोन पर चलाएं"
          aria-label="QR कोड स्कैन करके फोन पर चलाएं (Open on Phone)"
        >
          <QrCode className="w-4 h-4 text-emerald-700" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={toggleSound}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
          title={shopSettings.soundEnabled ? 'आवाज़ बंद करें (Mute Audio)' : 'आवाज़ चालू करें (Enable Audio)'}
          aria-label={shopSettings.soundEnabled ? 'Mute audio' : 'Enable audio'}
        >
          {shopSettings.soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-600" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Profile Pill */}
        <div className="pl-2 border-l border-slate-200 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
            {shopSettings.merchantName.charAt(0)}
          </div>
          <div className="hidden 2xl:block">
            <p className="text-xs font-bold text-slate-800 leading-tight">{shopSettings.merchantName}</p>
            <p className="text-[10px] text-slate-400">{isEnglish ? 'Shopkeeper' : 'Dukaandar'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
