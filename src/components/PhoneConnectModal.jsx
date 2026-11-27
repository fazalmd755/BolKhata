import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Wifi, 
  Globe, 
  QrCode, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldCheck,
  Mic
} from 'lucide-react';

export default function PhoneConnectModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [copiedLocal, setCopiedLocal] = useState(false);
  const [copiedCustom, setCopiedCustom] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('wifi'); // 'wifi' | 'custom'

  // Dynamic host detection from current browser window
  const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const defaultPort = typeof window !== 'undefined' && window.location.port ? window.location.port : '5173';
  const defaultProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';

  const [customIp, setCustomIp] = useState(defaultHost);
  const [customUrl, setCustomUrl] = useState('');

  // Auto-build local Wi-Fi URL
  const localIpUrl = `${defaultProtocol}//${customIp || defaultHost}:${defaultPort}/`;
  const activeUrl = selectedMethod === 'wifi' ? localIpUrl : (customUrl || localIpUrl);
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeUrl)}&bgcolor=ffffff&color=059669&margin=6`;

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'local') {
      setCopiedLocal(true);
      setTimeout(() => setCopiedLocal(false), 2000);
    } else {
      setCopiedCustom(true);
      setTimeout(() => setCopiedCustom(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>अपने फोन पर चलाएं</span>
                <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-semibold">
                  Live
                </span>
              </h2>
              <p className="text-xs text-white/80">
                Scan QR Code & Use on Any Mobile
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-center">
          {/* Method Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              onClick={() => setSelectedMethod('wifi')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                selectedMethod === 'wifi' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wifi className="w-3.5 h-3.5" />
              <span>Same Wi-Fi (Fastest)</span>
            </button>

            <button
              onClick={() => setSelectedMethod('custom')}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${
                selectedMethod === 'custom' 
                  ? 'bg-white text-emerald-700 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Custom / HTTPS URL</span>
            </button>
          </div>

          {/* QR Code Card */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 inline-block shadow-inner mx-auto">
            <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
              <img
                src={qrCodeImageUrl}
                alt="Scan to open on phone"
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>
            <p className="text-[11px] font-bold text-slate-500 mt-2">
              कैमरा खोलकर स्कैन करें (Scan with Phone Camera)
            </p>
          </div>

          {/* Direct Link Box */}
          {selectedMethod === 'wifi' ? (
            <div className="space-y-2 text-left">
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-800 mb-1">
                  <span>Local Wi-Fi Address:</span>
                  <button
                    onClick={() => copyToClipboard(localIpUrl, 'local')}
                    className="text-[11px] flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    {copiedLocal ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLocal ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="font-mono text-slate-800 text-sm font-semibold select-all break-all mb-2">
                  {localIpUrl}
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 font-medium shrink-0">IP / Host:</span>
                  <input
                    type="text"
                    value={customIp}
                    onChange={(e) => setCustomIp(e.target.value)}
                    placeholder="e.g. 192.168.1.15 or localhost"
                    className="w-full bg-white px-2 py-1 rounded-lg border border-emerald-300 text-xs font-mono font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center">
                👉 आपका फोन और कंप्यूटर एक ही वाई-फाई (Wi-Fi) से जुड़े होने चाहिए।
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-left">
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-blue-900">
                  <span>Custom / HTTPS Tunnel URL:</span>
                  <button
                    onClick={() => copyToClipboard(customUrl || localIpUrl, 'custom')}
                    className="text-[11px] flex items-center gap-1 text-blue-700 hover:text-blue-900 font-bold"
                  >
                    {copiedCustom ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCustom ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://your-tunnel.loca.lt or https://bolkhata.app"
                  className="w-full bg-white px-2.5 py-1.5 rounded-lg border border-blue-300 text-xs font-mono font-semibold text-blue-900 focus:outline-none focus:border-blue-600"
                />
                <p className="text-[10px] text-blue-700 font-medium">
                  URL पेस्ट करते ही ऊपर दिया गया QR कोड लाइव अपडेट हो जाएगा।
                </p>
              </div>
              <p className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-1">
                <Mic className="w-3.5 h-3.5 text-emerald-600 inline" />
                <span>HTTPS लिंक पर मोबाइल का माइक्रोफ़ोन 100% काम करेगा।</span>
              </p>
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
          >
            समझ गया (Done)
          </button>
        </div>
      </div>
    </div>
  );
}
