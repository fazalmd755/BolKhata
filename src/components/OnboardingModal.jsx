import React, { useState } from 'react';
import { Store, User, CreditCard, Globe, Sparkles, Check } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { isValidUpiId } from '../utils/whatsapp';

export default function OnboardingModal() {
  const { shopSettings, setShopSettings } = useKhata();

  const [shopName, setShopName] = useState(shopSettings.shopName || '');
  const [merchantName, setMerchantName] = useState(shopSettings.merchantName || '');
  const [upiId, setUpiId] = useState(shopSettings.upiId || '');
  const [language, setLanguage] = useState(shopSettings.language || 'hi-IN');
  const [error, setError] = useState('');

  // If already onboarded, don't show
  if (shopSettings.onboardingCompleted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!shopName.trim()) {
      setError('कृपया अपनी दुकान का नाम दर्ज करें (Shop name is required)');
      return;
    }

    if (upiId.trim() && !isValidUpiId(upiId.trim())) {
      setError('अमान्य UPI ID प्रारूप (उदा: yourname@upi या shop@okaxis)');
      return;
    }

    setShopSettings(prev => ({
      ...prev,
      shopName: shopName.trim(),
      merchantName: merchantName.trim() || 'दुकानदार',
      upiId: upiId.trim(),
      language,
      onboardingCompleted: true
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 p-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              स्वागत है (Welcome)
            </span>
          </div>
          <h2 className="text-xl font-black">BolKhata (बोलखाता)</h2>
          <p className="text-xs text-emerald-100 mt-1">
            भारतीय किराना व व्यापारियों का वॉयस-फर्स्ट डिजिटल बहीखाता
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              <span>आपकी दुकान का नाम (Shop Name) *</span>
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="उदा: गुप्ता किराना स्टोर"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              <span>दुकानदार / मालिक का नाम (Your Name)</span>
            </label>
            <input
              type="text"
              value={merchantName}
              onChange={(e) => setMerchantName(e.target.value)}
              placeholder="उदा: राकेश गुप्ता"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>UPI ID (WhatsApp पेमेंट लिंक के लिए - वैकल्पिक)</span>
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="उदा: yourname@upi या shop@okaxis"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              खाली छोड़ सकते हैं, बाद में सेटिंग्स से भी सेट कर सकते हैं।
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>भाषा (Language Preference)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('hi-IN')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  language === 'hi-IN'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>हिन्दी (Hindi)</span>
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en-IN')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  language === 'en-IN'
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-700 ring-1 ring-emerald-600'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>English (Hinglish)</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-200 transition"
            >
              <Check className="w-4 h-4" />
              <span>दुकान का खाता शुरू करें (Get Started)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
