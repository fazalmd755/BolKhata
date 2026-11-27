import React, { useState, useEffect } from 'react';
import { Wifi, Signal, BatteryCharging } from 'lucide-react';

export default function AndroidStatusBar() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const timer = setInterval(updateTime, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-emerald-700 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-semibold tracking-wide select-none z-30">
      {/* Clock */}
      <div>{time || '13:50'}</div>

      {/* Front camera punch hole */}
      <div className="w-3.5 h-3.5 rounded-full bg-black/60 border border-emerald-800 shadow-inner -mt-0.5"></div>

      {/* Status Icons */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold">5G</span>
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <div className="flex items-center gap-0.5">
          <span className="text-[10px]">96%</span>
          <div className="w-4 h-2 rounded-[2px] border border-white flex items-center p-[1px]">
            <div className="w-full h-full bg-white rounded-[1px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
