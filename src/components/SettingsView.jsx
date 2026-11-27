import React, { useState } from 'react';
import { 
  Store, 
  User, 
  Phone, 
  QrCode, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  ShieldCheck, 
  Share2, 
  Heart,
  Save,
  Check
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export default function SettingsView() {
  const { shopSettings, setShopSettings, resetToDemoData } = useKhata();
  const [formData, setFormData] = useState({ ...shopSettings });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setShopSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all demo data back to default Indian Kirana store?')) {
      resetToDemoData();
      alert('Demo data restored successfully!');
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">दुकान प्रोफाइल एवं सेटिंग्स</h2>
        <p className="text-xs text-slate-500">Shop Profile & Preferences</p>
      </div>

      {/* Merchant Profile Card */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {formData.shopName.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{formData.shopName}</h3>
            <p className="text-xs text-slate-500">{formData.merchantName} • +91 {formData.phone}</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">दुकान का नाम (Shop Name)</label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">दुकानदार का नाम (Merchant Name)</label>
          <input
            type="text"
            value={formData.merchantName}
            onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">UPI ID (फॉर WhatsApp पेमेंट लिंक)</label>
          <input
            type="text"
            value={formData.upiId}
            onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-emerald-700 font-semibold focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'सेव हो गया!' : 'प्रोफ़ाइल सेव करें'}</span>
          </button>
        </div>
      </form>

      {/* App Preferences */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold text-slate-700">ऐप प्राथमिकताएं (App Settings)</h4>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>ध्वनि प्रभाव (Sound Feedback)</span>
          </div>
          <input
            type="checkbox"
            checked={formData.soundEnabled}
            onChange={(e) => {
              const updated = { ...formData, soundEnabled: e.target.checked };
              setFormData(updated);
              setShopSettings(updated);
            }}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
        </label>

        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 cursor-pointer">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>बोलकर हिसाब सुनाएं (Hindi Voice Readout)</span>
          </div>
          <input
            type="checkbox"
            checked={formData.voiceReadoutEnabled}
            onChange={(e) => {
              const updated = { ...formData, voiceReadoutEnabled: e.target.checked };
              setFormData(updated);
              setShopSettings(updated);
            }}
            className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
        </label>

        <button
          type="button"
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition mt-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>डिफ़ॉल्ट डेटा रीसेट करें (Reset Demo Data)</span>
        </button>
      </div>

      <div className="text-center py-2 text-xs text-slate-400">
        <p className="font-bold text-slate-600">BolKhata Mobile v1.0</p>
        <p className="text-[10px]">Your Voice, Your Business, Your Digital Khata</p>
      </div>
    </div>
  );
}
