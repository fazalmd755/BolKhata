import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  Store, 
  User, 
  Phone, 
  QrCode, 
  Volume2, 
  RotateCcw, 
  Save, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export default function SettingsModal() {
  const { 
    activeModal, 
    setActiveModal, 
    shopSettings, 
    setShopSettings, 
    resetToDemoData 
  } = useKhata();

  if (activeModal !== 'settings') return null;

  const [formData, setFormData] = useState({ ...shopSettings });
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShopSettings(formData);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      setActiveModal(null);
    }, 800);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to restore default Indian shopkeeper demo data? All local changes will be reset.')) {
      resetToDemoData();
      setActiveModal(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-slate-800">
              <Settings className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">दुकान सेटिंग्स (Shop Settings)</h2>
              <p className="text-xs text-slate-400">दुकानदार प्रोफ़ाइल और UPI विवरण</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal(null)}
            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 overflow-y-auto">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-slate-400" />
              <span>दुकान का नाम (Shop Name) *</span>
            </label>
            <input
              type="text"
              required
              value={formData.shopName}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-semibold"
            />
          </div>

          {/* Merchant Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>दुकानदार का नाम (Merchant Name)</span>
            </label>
            <input
              type="text"
              value={formData.merchantName}
              onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* UPI ID for Payments */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <QrCode className="w-3.5 h-3.5 text-slate-400" />
              <span>व्यापारी UPI ID (For WhatsApp payment links) *</span>
            </label>
            <input
              type="text"
              required
              value={formData.upiId}
              onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
              placeholder="e.g. guptakirana@upi"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-mono"
            />
          </div>

          {/* Merchant Phone */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>दुकान का फोन नंबर (Phone)</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
            />
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-700">ध्वनि प्रभाव (Sound Effects)</span>
              <input
                type="checkbox"
                checked={formData.soundEnabled}
                onChange={(e) => setFormData({ ...formData, soundEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>

            <label className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="font-semibold text-slate-700">बोलकर हिसाब सुनाएं (Voice Readout)</span>
              <input
                type="checkbox"
                checked={formData.voiceReadoutEnabled}
                onChange={(e) => setFormData({ ...formData, voiceReadoutEnabled: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
            </label>
          </div>

          {/* Reset Demo Data */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>डिफ़ॉल्ट डेटा रीसेट करें (Reset Demo Data)</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold"
            >
              रद्द करें
            </button>

            <button
              type="submit"
              className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition"
            >
              {savedNotice ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedNotice ? 'Saved!' : 'सेव करें (Save)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
