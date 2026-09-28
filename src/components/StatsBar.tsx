import React from 'react';
import { ReminderItem, Category, FilterStatus, Language } from '../types';
import { translations } from '../utils/translations';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
} from 'lucide-react';

interface StatsBarProps {
  items: ReminderItem[];
  language: Language;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: FilterStatus;
  onFilterChange: (f: FilterStatus) => void;
  selectedCategory: Category | 'all';
  onCategoryChange: (c: Category | 'all') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  items,
  language,
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  selectedCategory,
  onCategoryChange,
}) => {
  const t = translations[language];

  const total = items.length;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = items.filter((i) => i.dateTime.startsWith(todayStr)).length;
  const activeAlarms = items.filter((i) => i.type === 'alarm' && i.enabled && !i.completed).length;
  const completedCount = items.filter((i) => i.completed).length;
  const completionRate = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: t.filter.all },
    { key: 'today', label: t.filter.today },
    { key: 'upcoming', label: t.filter.upcoming },
    { key: 'alarms', label: t.filter.alarms },
    { key: 'completed', label: t.filter.completed },
  ];

  const categories: { key: Category | 'all'; label: string }[] = [
    { key: 'all', label: t.categories.all },
    { key: 'personal', label: t.categories.personal },
    { key: 'work', label: t.categories.work },
    { key: 'health', label: t.categories.health },
    { key: 'fitness', label: t.categories.fitness },
    { key: 'study', label: t.categories.study },
    { key: 'finance', label: t.categories.finance },
    { key: 'routine', label: t.categories.routine },
  ];

  return (
    <div className="space-y-4">
      {/* Welcome Banner & Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.stats.total}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-white mt-0.5">
              {total}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Due Today Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.stats.todayCount}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 mt-0.5">
              {todayCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Active Alarms Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.stats.activeAlarms}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-rose-400 mt-0.5">
              {activeAlarms}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <Bell className="w-5 h-5" />
          </div>
        </div>

        {/* Completed Rate Card */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {t.stats.completedRate}
            </span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5">
              {completionRate}%
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => onFilterChange(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeFilter === f.key
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Search Input & Category Dropdown */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={language === 'hi' ? 'खोजें...' : 'Search reminders...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Category | 'all')}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c.key} value={c.key} className="bg-slate-900 text-white">
                {c.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
