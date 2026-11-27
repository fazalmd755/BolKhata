import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  Users, 
  Search, 
  PlusCircle, 
  Filter 
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useTranslation } from '../i18n';

export default function DashboardStats() {
  const { 
    totalPendingUdhaar, 
    paymentsToday, 
    overdueCustomers, 
    activeCustomersCount,
    customerFilter, 
    setCustomerFilter, 
    searchQuery, 
    setSearchQuery,
    setActiveModal,
    customers
  } = useKhata();
  const { t } = useTranslation();

  const totalOverdueAmount = overdueCustomers.reduce((sum, c) => sum + c.balance, 0);

  const filters = [
    { id: 'all', label: t('filter_all'), count: customers.length },
    { id: 'pending', label: t('filter_pending'), count: activeCustomersCount },
    { id: 'overdue', label: t('filter_overdue'), count: overdueCustomers.length, highlight: true },
    { id: 'cleared', label: t('filter_cleared'), count: customers.filter(c => c.balance <= 0).length },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Financial Stat Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Pending Udhaar (Red/Emerald) */}
        <div className="bg-white rounded-2xl p-3.5 border border-red-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('total_udhaar')}</span>
            <div className="p-1.5 rounded-lg bg-red-50 text-red-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-red-600 tracking-tight">
            ₹{totalPendingUdhaar.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            {activeCustomersCount} {t('customers_pending')}
          </div>
        </div>

        {/* Payments Collected Today (Green) */}
        <div className="bg-white rounded-2xl p-3.5 border border-emerald-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('today_jama_label')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 tracking-tight">
            ₹{paymentsToday.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
            {t('today_collection')}
          </div>
        </div>

        {/* Overdue / High Risk (Amber/Red) */}
        <div className="bg-white rounded-2xl p-3.5 border border-amber-100 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('overdue_count')}</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-600 tracking-tight">
            ₹{totalOverdueAmount.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-amber-700 font-medium mt-0.5">
            {overdueCustomers.length} {t('customers_late')}
          </div>
        </div>

        {/* Total Registered Customers */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
            <span>{t('total_customers')}</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
            {customers.length}
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-0.5">
            {t('digital_register')}
          </div>
        </div>
      </div>

      {/* Search Bar & Manual Entry Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_customers_placeholder')}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              ✕
            </button>
          )}
        </div>

        <button
          onClick={() => setActiveModal('manual_entry')}
          className="flex items-center gap-1.5 px-3 sm:px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-sm transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">{t('add_entry_short')}</span>
          <span className="sm:hidden">{t('add_entry_short')}</span>
        </button>
      </div>

      {/* Filter Tabs / Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(f => {
          const isActive = customerFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setCustomerFilter(f.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition ${
                isActive
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              <span>{f.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isActive 
                  ? 'bg-white/20 text-white' 
                  : (f.highlight && f.count > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-100 text-slate-500')
              }`}>
                {f.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
