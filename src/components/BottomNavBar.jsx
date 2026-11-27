import React from 'react';
import { Home, Users, Mic, BarChart3, Settings } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useTranslation } from '../i18n';

export default function BottomNavBar({ activeTab, setActiveTab, onOpenVoiceSheet }) {
  const { customers } = useKhata();
  const { t } = useTranslation();

  return (
    <div className="relative w-full bg-white border-t border-slate-200 z-30 select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
      {/* Floating Center Mic Button */}
      <div className="absolute left-1/2 -top-6 -translate-x-1/2 flex flex-col items-center">
        <button
          onClick={onOpenVoiceSheet}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 ring-4 ring-white active:scale-90 transition-all hover:scale-105"
          title={t('voice_entry')}
          aria-label={t('voice_entry')}
        >
          <Mic className="w-6 h-6 animate-pulse" />
        </button>
        <span className="text-[10px] font-extrabold text-emerald-700 mt-0.5 tracking-tight">
          {t('speak_short')}
        </span>
      </div>

      {/* 4 Bottom Tab Items */}
      <div className="grid grid-cols-5 h-15 items-center text-center px-1">
        {/* Tab 1: Home */}
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 ${
            activeTab === 'home' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-emerald-50 text-emerald-700 scale-105' : ''}`}>
            <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span className={`text-[10px] tracking-tight ${activeTab === 'home' ? 'font-black text-emerald-800' : 'font-semibold'}`}>{t('nav_home')}</span>
        </button>

        {/* Tab 2: Khata (Customers) */}
        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition relative active:scale-95 ${
            activeTab === 'customers' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all relative ${activeTab === 'customers' ? 'bg-emerald-50 text-emerald-700 scale-105' : ''}`}>
            <Users className={`w-5 h-5 ${activeTab === 'customers' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {customers.filter(c => c.balance > 0).length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            )}
          </div>
          <span className={`text-[10px] tracking-tight ${activeTab === 'customers' ? 'font-black text-emerald-800' : 'font-semibold'}`}>{t('nav_customers')}</span>
        </button>

        {/* Tab 3: Empty spacer for floating mic button */}
        <div className="pointer-events-none"></div>

        {/* Tab 4: Reports */}
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 ${
            activeTab === 'reports' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-emerald-50 text-emerald-700 scale-105' : ''}`}>
            <BarChart3 className={`w-5 h-5 ${activeTab === 'reports' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span className={`text-[10px] tracking-tight ${activeTab === 'reports' ? 'font-black text-emerald-800' : 'font-semibold'}`}>{t('nav_reports')}</span>
        </button>

        {/* Tab 5: Settings / More */}
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center gap-0.5 py-1 transition active:scale-95 ${
            activeTab === 'settings' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-emerald-50 text-emerald-700 scale-105' : ''}`}>
            <Settings className={`w-5 h-5 ${activeTab === 'settings' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          </div>
          <span className={`text-[10px] tracking-tight ${activeTab === 'settings' ? 'font-black text-emerald-800' : 'font-semibold'}`}>{t('nav_settings')}</span>
        </button>
      </div>

      {/* Safe Area spacing */}
      <div className="w-full pb-1"></div>
    </div>
  );
}
