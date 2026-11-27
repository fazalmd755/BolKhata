import React from 'react';
import { 
  BookMarked, 
  Settings, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Store,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export default function Header() {
  const { shopSettings, setShopSettings, resetToDemoData, setActiveModal } = useKhata();

  const toggleSound = () => {
    setShopSettings(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand Logo & Shop Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-200">
            <BookMarked className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 tracking-tight text-lg leading-tight flex items-center gap-1.5">
                <span>BolKhata</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                  बोलखाता
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-slate-700">{shopSettings.shopName}</span>
              <span className="text-slate-300">•</span>
              <span>{shopSettings.merchantName}</span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition"
            title={shopSettings.soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {shopSettings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset all Khata data back to initial demo state?')) {
                resetToDemoData();
              }
            }}
            className="hidden sm:flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Reset to default demo shopkeeper data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Demo</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => setActiveModal('settings')}
            className="p-2 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition"
            title="Shop Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
