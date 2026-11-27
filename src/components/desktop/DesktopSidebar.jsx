import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  Bot, 
  BarChart3, 
  Settings, 
  BookMarked, 
  Mic, 
  Sparkles,
  ChevronRight,
  Store
} from 'lucide-react';
import { useKhata } from '../../context/KhataContext';

export default function DesktopSidebar({ activeTab, setActiveTab, onOpenVoice, onOpenAiAssistant }) {
  const { customers, transactions, shopSettings, overdueCustomers } = useKhata();

  const activeCustomersCount = customers.filter(c => c.balance > 0).length;

  const navItems = [
    { 
      id: 'home', 
      label: 'डैशबोर्ड (Dashboard)', 
      icon: LayoutDashboard,
      badge: null 
    },
    { 
      id: 'customers', 
      label: 'ग्राहक खाता (Customers)', 
      icon: Users,
      badge: activeCustomersCount > 0 ? activeCustomersCount : null,
      badgeColor: 'bg-emerald-100 text-emerald-800'
    },
    { 
      id: 'transactions', 
      label: 'लेन-देन बही (Transactions)', 
      icon: Receipt,
      badge: transactions.length,
      badgeColor: 'bg-slate-100 text-slate-700'
    },
    { 
      id: 'ai_assistant', 
      label: 'AI मुंशी (Voice Assistant)', 
      icon: Bot,
      isSpecial: true,
      badge: 'Live',
      badgeColor: 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white'
    },
    { 
      id: 'reports', 
      label: 'डेबुक एवं रिपोर्ट (Reports)', 
      icon: BarChart3,
      badge: overdueCustomers.length > 0 ? `${overdueCustomers.length} Overdue` : null,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    { 
      id: 'settings', 
      label: 'दुकान सेटिंग्स (Settings)', 
      icon: Settings,
      badge: null 
    },
  ];

  const handleNavClick = (item) => {
    if (item.id === 'ai_assistant') {
      onOpenAiAssistant();
    } else {
      setActiveTab(item.id);
    }
  };

  return (
    <aside className="h-screen sticky top-0 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 select-none md:w-20 lg:w-64">
      {/* Top Brand Logo Section */}
      <div>
        <div className="h-16 px-4 md:px-3 lg:px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <BookMarked className="w-5 h-5 text-white" />
            </div>
            <div className="hidden lg:block min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">BolKhata</span>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                  बोलखाता
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">डिजिटल बही-खाता</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                title={item.label}
                className={`w-full flex items-center justify-center lg:justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : item.isSpecial
                    ? 'text-emerald-700 hover:bg-emerald-50/80'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? 'text-white' : item.isSpecial ? 'text-emerald-600' : 'text-slate-500 group-hover:text-slate-800'
                  }`} />
                  <span className="hidden lg:inline truncate font-semibold">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`hidden lg:inline-flex text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Prominent Voice Entry & Merchant Profile */}
      <div className="p-3 border-t border-slate-100 space-y-3">
        {/* Prominent Desktop Voice Recording Button */}
        <button
          onClick={onOpenVoice}
          className="w-full py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-98 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition group"
          title="बोलकर खाता लिखें (Voice Khata Entry)"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition">
            <Mic className="w-4 h-4 text-white animate-pulse" />
          </div>
          <span className="hidden lg:inline text-xs font-extrabold tracking-wide">
            बोलकर लिखें (Voice)
          </span>
        </button>

        {/* Merchant Mini Profile Card */}
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
              {shopSettings.shopName.charAt(0)}
            </div>
            <div className="hidden lg:block min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate leading-tight">
                {shopSettings.shopName}
              </p>
              <p className="text-[10px] text-slate-400 font-medium truncate">
                {shopSettings.merchantName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
