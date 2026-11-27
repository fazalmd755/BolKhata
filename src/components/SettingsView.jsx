import React, { useState, useEffect } from 'react';
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
  Check,
  Download,
  Upload,
  Database,
  FileSpreadsheet,
  Lock,
  Unlock,
  KeyRound,
  AlertTriangle,
  Clock,
  Wifi,
  WifiOff,
  Trash2
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useTranslation } from '../i18n';
import { toLocalDateKey } from '../utils/dateUtils';
import { parseRupees } from '../utils/money';
import { isValidUpiId } from '../utils/whatsapp';
import { getPinConfig, setupAppPin, disableAppPin } from '../utils/pinAuth';
import { getBackupStatus, exportCsvLedger, exportJsonBackup } from '../utils/backupService';
import { DEFAULT_SHOP_SETTINGS } from '../data/mockData';

export default function SettingsView() {
  const { customers, transactions, shopSettings, setShopSettings, resetToDemoData, clearAllData, restoreBackupData } = useKhata();
  const { t, language, setLanguage } = useTranslation();
  const [formData, setFormData] = useState({ ...shopSettings });
  const [saved, setSaved] = useState(false);
  const [upiError, setUpiError] = useState('');

  // PIN security states
  const [pinConfig, setPinConfig] = useState(getPinConfig());
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');

  // Backup status
  const [backupStatus, setBackupStatus] = useState(getBackupStatus());

  useEffect(() => {
    setBackupStatus(getBackupStatus());
    setPinConfig(getPinConfig());
  }, [customers, transactions]);

  const handleSave = (e) => {
    e.preventDefault();
    if (formData.upiId && !isValidUpiId(formData.upiId)) {
      setUpiError('अमान्य UPI ID प्रारूप (उदा: yourname@upi)');
      return;
    }
    setUpiError('');
    setShopSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadJsonBackup = () => {
    exportJsonBackup({ customers, transactions, shopSettings }, formData.shopName || 'BolKhata');
    setBackupStatus(getBackupStatus());
  };

  const handleDownloadCsvLedger = () => {
    exportCsvLedger(transactions, formData.shopName || 'BolKhata');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const shouldMerge = window.confirm(
          'रीस्टोर विकल्प चुनें (Choose Restore Mode):\n\n' +
          '• [OK] दबाएं: वर्तमान लेजर में जोड़ें (Merge into current data)\n' +
          '• [Cancel] दबाएं: वर्तमान लेजर को पूरी तरह बदलें (Replace everything)'
        );
        const restoreMode = shouldMerge ? 'merge' : 'replace';
        const res = restoreBackupData(parsed, restoreMode);
        if (res.success) {
          alert(`बैकअप सफलतापूर्वक ${restoreMode === 'merge' ? 'मर्ज (Merge)' : 'रीस्टोर (Replace)'} हुआ! (${res.customerCount} ग्राहक, ${res.transactionCount} लेन-देन)`);
          setBackupStatus(getBackupStatus());
        } else {
          alert('रीस्टोर विफल: ' + res.error);
        }
      } catch (err) {
        alert('फ़ाइल पढ़ने में त्रुटि: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleLoadDemoData = () => {
    const confirmMsg = 'क्या आप डेमो किराना डेटा लोड करना चाहते हैं? वर्तमान डेटा का एक सुरक्षा बैकअप स्वचालित रूप से सुरक्षित किया जाएगा।';
    if (window.confirm(confirmMsg)) {
      resetToDemoData();
      alert('डेमो डेटा सफलतापूर्वक लोड हो गया!');
      setBackupStatus(getBackupStatus());
    }
  };

  const handleClearAllData = () => {
    const confirmMsg = 'क्या आप वाकई सारा खाता-बही डेटा साफ़ करना चाहते हैं? इससे सभी मौजूदा लेन-देन और ग्राहक हट जाएंगे और एक नया, खाली (Fresh) खाता शुरू होगा।';
    if (window.confirm(confirmMsg)) {
      clearAllData();
      setFormData({ ...DEFAULT_SHOP_SETTINGS, isDemoLoaded: false });
      alert('सारा डेटा साफ़ कर दिया गया है। आपका खाता अब बिल्कुल नया और खाली है!');
      setBackupStatus(getBackupStatus());
    }
  };

  const handleSavePin = async (e) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');
    if (newPin.length < 4 || newPin.length > 6) {
      setPinError('पिन 4 से 6 अंकों का होना चाहिए');
      return;
    }
    const res = await setupAppPin(newPin);
    if (res.success) {
      setPinSuccess('ऐप लॉक सफलतापूर्वक सक्रिय हो गया!');
      setIsSettingPin(false);
      setNewPin('');
      setPinConfig(getPinConfig());
    } else {
      setPinError(res.error || 'पिन सेट करने में त्रुटि हुई');
    }
  };

  const handleDisablePin = () => {
    if (window.confirm('क्या आप वाकई ऐप लॉक हटाना चाहते हैं?')) {
      disableAppPin();
      setPinConfig(getPinConfig());
      setPinSuccess('ऐप लॉक निष्क्रिय कर दिया गया');
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div>
        <h2 className="text-base font-bold text-slate-900">{t('settings_title')}</h2>
        <p className="text-xs text-slate-500">{t('settings_subtitle')}</p>
      </div>

      {/* Merchant Profile Card */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
            {(formData.shopName || 'B').charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">{formData.shopName || t('brand_subtitle')}</h3>
            <p className="text-xs text-slate-500">{formData.merchantName} • +91 {formData.phone}</p>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('shop_name')}</label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('owner_name')}</label>
          <input
            type="text"
            value={formData.merchantName}
            onChange={(e) => setFormData({ ...formData, merchantName: e.target.value })}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('upi_id')}</label>
          <input
            type="text"
            value={formData.upiId}
            onChange={(e) => {
              setFormData({ ...formData, upiId: e.target.value });
              if (e.target.value && !isValidUpiId(e.target.value)) {
                setUpiError(language === 'en' ? 'Invalid UPI ID format (e.g. yourname@upi)' : 'अमान्य UPI ID प्रारूप (उदा: yourname@upi)');
              } else {
                setUpiError('');
              }
            }}
            placeholder="e.g. shopname@upi"
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-mono text-emerald-700 font-semibold focus:outline-none focus:border-emerald-600"
          />
          {upiError ? (
            <p className="text-[11px] text-red-500 font-semibold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>{upiError}</span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 mt-0.5">
              {t('upi_hint')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">{t('language_label')}</label>
          <select
            value={language}
            onChange={(e) => {
              const nextLang = e.target.value;
              setLanguage(nextLang);
              setFormData({ ...formData, language: nextLang === 'en' ? 'en-IN' : 'hi-IN' });
            }}
            className="w-full text-xs px-3 py-2 rounded-xl border border-slate-300 font-semibold focus:outline-none focus:border-emerald-600 bg-white"
          >
            <option value="hi">{t('lang_hinglish_option')}</option>
            <option value="en">{t('lang_english_option')}</option>
          </select>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? t('profile_saved') : t('save_profile')}</span>
          </button>
        </div>
      </form>

      {/* App Lock & PIN Security (C4) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-800">{t('security_pin')}</h4>
              <p className="text-[11px] text-slate-400">
                {pinConfig.enabled ? t('pin_enabled_desc') : t('pin_disabled_desc')}
              </p>
            </div>
          </div>
          {pinConfig.enabled ? (
            <button
              type="button"
              onClick={handleDisablePin}
              className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-bold hover:bg-red-100 transition"
            >
              हटाएं (Turn Off)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsSettingPin(true)}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition"
            >
              + पिन लगाएं (Set PIN)
            </button>
          )}
        </div>

        {isSettingPin && (
          <form onSubmit={handleSavePin} className="p-3 bg-purple-50/60 rounded-xl border border-purple-200 space-y-2">
            <label className="block text-[11px] font-bold text-purple-900">नया 4 से 6 अंकों का पिन दर्ज करें</label>
            <div className="flex items-center gap-2">
              <input
                type="password"
                maxLength="6"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="4-6 Digits PIN"
                className="w-full text-xs px-3 py-2 bg-white rounded-xl border border-purple-300 font-bold tracking-widest text-center"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold whitespace-nowrap"
              >
                सेव करें
              </button>
              <button
                type="button"
                onClick={() => setIsSettingPin(false)}
                className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
              >
                रद्द
              </button>
            </div>
            {pinError && <p className="text-[11px] text-red-600 font-bold">{pinError}</p>}
          </form>
        )}

        {pinSuccess && (
          <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <Check className="w-3 h-3" />
            <span>{pinSuccess}</span>
          </p>
        )}
      </div>

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
      </div>

      {/* Data Backup & Restore (C5) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-800">{t('backup_data')}</h4>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            backupStatus.isOverdue 
              ? 'text-amber-700 bg-amber-50 border border-amber-300' 
              : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
          }`}>
            <Clock className="w-3 h-3" />
            <span>{language === 'en' ? `Last backup: ${backupStatus.lastBackupDaysAgo}` : `अंतिम बैकअप: ${backupStatus.lastBackupDaysAgo}`}</span>
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          {language === 'en'
            ? 'The app keeps an automatic rolling 7-day backup. Download a 1-click copy before switching phones:'
            : 'ऐप स्वचालित रूप से पिछले 7 दिनों का रोलिंग बैकअप रखता है। फोन बदलने या सुरक्षित रखने हेतु 1-क्लिक डाउनलोड करें:'}
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadJsonBackup}
            className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'JSON Backup (.json)' : 'JSON बैकअप (.json)'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsvLedger}
            className="p-2.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t('export_csv')}</span>
          </button>
        </div>

        <div className="pt-1">
          <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('restore_data')} (.JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Offline & Privacy Disclosure (C6) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-800">{t('privacy_notice')}</h4>
        </div>
        <div className="text-[11px] text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <p className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">•</span>
            <span>{language === 'en' ? <><b>100% Local Data:</b> All ledger data stays safely on your device.</> : <><b>100% स्थानीय डेटा:</b> आपका सारा खाता-बही डेटा केवल आपके डिवाइस में सुरक्षित रहता है।</>}</span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">•</span>
            <span>{language === 'en' ? <><b>Works Offline:</b> Adding entries, viewing ledgers, reports, and balances work without internet.</> : <><b>ऑफ़लाइन काम करता है:</b> लेन-देन जोड़ना, खाता देखना, रिपोर्ट्स और हिसाब बिना इंटरनेट के काम करते हैं।</>}</span>
          </p>
          <p className="flex items-start gap-1.5">
            <span className="text-emerald-600 font-bold">•</span>
            <span>{language === 'en' ? <><b>Voice Input:</b> Uses device/browser speech recognition (internet improves accuracy).</> : <><b>वॉयस इनपुट:</b> बोलने पर Google/Web Speech सेवा का उपयोग होता है (इंटरनेट होने पर बेहतर सटीकता)।</>}</span>
          </p>
        </div>
      </div>

      {/* Demo Data Management & Clean Slate (C1) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
        <h4 className="text-xs font-bold text-slate-800">{language === 'en' ? 'Data Reset & Fresh Start' : 'डेटा रीसेट एवं फ़्रेश शुरुआत (Data Reset)'}</h4>
        <p className="text-[11px] text-slate-500">
          {language === 'en'
            ? 'Load sample demo data for testing, or clear all data for a clean fresh ledger.'
            : 'टेस्टिंग के लिए डेमो डेटा लोड कर सकते हैं, या सारा डेटा साफ़ करके एकदम नई शुरुआत कर सकते हैं।'}
        </p>
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleLoadDemoData}
            className="w-full py-2.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            <span>{t('demo_data')}</span>
          </button>

          <button
            type="button"
            onClick={handleClearAllData}
            className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600" />
            <span>सारा डेटा साफ़ करें (Clear All / Fresh Start)</span>
          </button>
        </div>
      </div>

      <div className="text-center py-2 text-xs text-slate-400">
        <p className="font-bold text-slate-600">BolKhata Mobile v1.0</p>
        <p className="text-[10px]">Your Voice, Your Business, Your Digital Khata</p>
      </div>
    </div>
  );
}
