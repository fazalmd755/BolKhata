import React, { useState, useEffect } from 'react';
import { Lock, Unlock, KeyRound, AlertCircle } from 'lucide-react';
import { getPinConfig, verifyAppPin } from '../utils/pinAuth';

export default function PinLockModal() {
  const [isLocked, setIsLocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Check pin config and background inactivity timer
  useEffect(() => {
    const config = getPinConfig();
    if (config.enabled && config.pinHash) {
      // Initially locked on load if enabled
      setIsLocked(true);
    }

    let lastVisibleTime = Date.now();
    const handleVisibilityChange = () => {
      if (document.hidden) {
        lastVisibleTime = Date.now();
      } else {
        const conf = getPinConfig();
        if (conf.enabled) {
          const elapsedMinutes = (Date.now() - lastVisibleTime) / (1000 * 60);
          if (elapsedMinutes >= (conf.autoLockMinutes || 5)) {
            setIsLocked(true);
            setPinInput('');
            setErrorMsg('');
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  if (!isLocked) return null;

  const handleDigit = (digit) => {
    if (pinInput.length < 6) {
      const next = pinInput + digit;
      setPinInput(next);
      setErrorMsg('');
      if (next.length >= 4) {
        checkPin(next);
      }
    }
  };

  const handleBackspace = () => {
    setPinInput(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const checkPin = async (candidate) => {
    const res = await verifyAppPin(candidate);
    if (res.success) {
      setIsLocked(false);
      setPinInput('');
      setErrorMsg('');
    } else {
      if (candidate.length >= 4) {
        setErrorMsg('गलत पिन (Incorrect PIN)');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950 text-white select-none animate-in fade-in duration-200">
      <div className="w-full max-w-xs flex flex-col items-center text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-lg shadow-emerald-950">
          <Lock className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-black tracking-tight">BolKhata सुरक्षित है</h2>
          <p className="text-xs text-slate-400 mt-1">अपना 4-6 अंकों का सुरक्षा पिन दर्ज करें</p>
        </div>

        {/* PIN Dots Indicator */}
        <div className="flex items-center gap-3">
          {[0, 1, 2, 3].map(i => (
            <div
              key={i}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
                pinInput.length > i ? 'bg-emerald-400 scale-110 shadow-xs shadow-emerald-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>

        {errorMsg && (
          <div className="text-xs text-red-400 font-bold bg-red-950/60 border border-red-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-shake">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px] pt-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => handleDigit(String(n))}
              className="h-14 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-xl font-bold transition flex items-center justify-center text-slate-100"
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPinInput('')}
            className="h-14 rounded-2xl bg-slate-900/50 text-xs font-bold text-slate-500 hover:text-slate-300 transition flex items-center justify-center"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-900 border border-slate-800 hover:bg-slate-800 active:scale-95 text-xl font-bold transition flex items-center justify-center text-slate-100"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-14 rounded-2xl bg-slate-900/50 text-sm font-bold text-slate-400 hover:text-white transition flex items-center justify-center"
          >
            ⌫
          </button>
        </div>
      </div>
    </div>
  );
}
