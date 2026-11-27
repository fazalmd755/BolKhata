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
  Check,
  Download,
  Upload,
  Database,
  FileSpreadsheet
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';

export default function SettingsView() {
  const { customers, transactions, shopSettings, setShopSettings, resetToDemoData, restoreBackupData } = useKhata();
  const [formData, setFormData] = useState({ ...shopSettings });
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setShopSettings(formData);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDownloadJsonBackup = () => {
    const backup = {
      version: '1.0',
      appName: 'BolKhata',
      exportDate: new Date().toISOString(),
      shopSettings,
      customers,
      transactions
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bolkhata-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsvLedger = () => {
    const headers = ['Txn_ID', 'Date', 'Customer_Name', 'Type', 'Amount_INR', 'Items', 'Payment_Method', 'Notes'];
    const rows = transactions.map(t => [
      `"${t.id}"`,
      `"${t.date ? t.date.split('T')[0] : ''}"`,
      `"${(t.customerName || '').replace(/"/g, '""')}"`,
      `"${t.type}"`,
      Number(t.amount) || 0,
      `"${(Array.isArray(t.items) ? t.items.join('; ') : '').replace(/"/g, '""')}"`,
      `"${t.paymentMethod || 'Cash'}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bolkhata-ledger-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (!parsed.customers || !parsed.transactions) {
          alert('अमान्य बैकअप फ़ाइल (Invalid backup format). Please provide a valid BolKhata JSON file.');
          return;
        }
        const res = restoreBackupData(parsed);
        if (res.success) {
          alert(`बैकअप सफलतापूर्वक रीस्टोर हुआ! (${parsed.customers.length} ग्राहक, ${parsed.transactions.length} लेन-देन)`);
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
      </div>

      {/* Data Backup & Restore */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Database className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-800">खाता बैकअप एवं रीस्टोर (Backup & Export)</h4>
        </div>
        <p className="text-[11px] text-slate-500">
          अपना पूरा खाता सुरक्षित रखें या नए फोन में ले जाने के लिए 1-क्लिक बैकअप डाउनलोड करें।
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleDownloadJsonBackup}
            className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON बैकअप</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadCsvLedger}
            className="p-2.5 rounded-xl border border-blue-300 bg-blue-50/70 hover:bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel (CSV) बही</span>
          </button>
        </div>

        <div className="pt-1">
          <label className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition">
            <Upload className="w-3.5 h-3.5 text-emerald-600" />
            <span>बैकअप फ़ाइल रीस्टोर करें (.JSON)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Reset */}
      <div className="bg-white rounded-2xl p-4 border border-red-100 shadow-2xs space-y-2">
        <button
          type="button"
          onClick={handleReset}
          className="w-full py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
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
