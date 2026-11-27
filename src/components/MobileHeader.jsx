import React from 'react';
import { 
  BookMarked, 
  Store, 
  Search, 
  Volume2, 
  VolumeX, 
  RotateCcw,
  Smartphone,
  QrCode,
  Bot,
  Sparkles
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export default function MobileHeader({ onOpenPhoneModal, onOpenAiAssistant }) {
  const { shopSettings, setShopSettings, resetToDemoData } = useKhata();

  const toggleSound = () => {
    setShopSettings(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  return (
    <div className="bg-emerald-700 text-white px-3.5 py-2.5 flex items-center justify-between select-none shadow-sm">
      {/* Shop Info */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-white text-emerald-700 flex items-center justify-center font-black shadow-xs">
          <BookMarked className="w-4 h-4 text-emerald-700" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-white text-xs sm:text-sm leading-tight tracking-tight">
              {shopSettings.shopName}
            </h1>
          </div>
          <p className="text-[10px] text-emerald-100 font-medium flex items-center gap-1">
            <span>बोलखाता</span>
            <span>•</span>
            <span>{shopSettings.merchantName}</span>
          </p>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-1.5">
        {/* AI Assistant Button */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-bold shadow-md shadow-emerald-900/40 transition active:scale-95 border border-emerald-300/40"
          title="बोलखाता AI मुंशी से बात करें (Chat with AI)"
        >
          <Bot className="w-3.5 h-3.5 text-white animate-pulse" />
          <span className="text-[11px]">AI मुंशी</span>
        </button>

        {/* QR Code / Phone Connect button */}
        <button
          onClick={onOpenPhoneModal}
          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition border border-emerald-500/60"
          title="अपने फोन पर खोलें (Open on Phone)"
          aria-label="Open on Phone QR Code"
        >
          <QrCode className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={toggleSound}
          className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600 transition"
          title={shopSettings.soundEnabled ? 'Mute sound' : 'Enable sound'}
          aria-label={shopSettings.soundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {shopSettings.soundEnabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-emerald-300" />
          )}
        </button>
      </div>
    </div>
  );
}
