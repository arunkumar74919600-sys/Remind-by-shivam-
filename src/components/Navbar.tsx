import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import {
  Bell,
  Languages,
  Plus,
  Clock,
  Download,
  Upload,
  Check,
} from 'lucide-react';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenCreateModal: () => void;
  notificationsEnabled: boolean;
  onRequestNotifications: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  onOpenCreateModal,
  notificationsEnabled,
  onRequestNotifications,
  onExport,
  onImport,
}) => {
  const t = translations[language];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeFormatted = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateFormatted = currentTime.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25">
            <Bell className="w-5 h-5 text-white animate-[wiggle_1.5s_ease-in-out_infinite]" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
                Remind by Shivam
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Live Clock Display */}
        <div className="hidden md:flex items-center gap-2.5 px-4 py-1.5 rounded-2xl bg-slate-900 border border-slate-800">
          <Clock className="w-4 h-4 text-indigo-400 animate-spin-slow" />
          <div className="text-left font-mono">
            <span className="text-sm font-bold text-white tracking-wider">{timeFormatted}</span>
            <span className="text-[11px] text-slate-400 ml-2">{dateFormatted}</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Permission Button */}
          <button
            onClick={onRequestNotifications}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              notificationsEnabled
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
            }`}
            title="Notification alerts"
          >
            {notificationsEnabled ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.buttons.notificationsEnabled}</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.buttons.enableNotifications}</span>
              </>
            )}
          </button>

          {/* Backup / Export */}
          <button
            onClick={onExport}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            title={t.buttons.exportData}
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Import JSON */}
          <label
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            title={t.buttons.importData}
          >
            <Upload className="w-4 h-4" />
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>

          {/* Language Toggle (EN / HI) */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-200 transition cursor-pointer"
            title="Switch Language"
          >
            <Languages className="w-3.5 h-3.5 text-indigo-400" />
            <span>{language === 'en' ? 'हिंदी' : 'English'}</span>
          </button>

          {/* New Reminder Button */}
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t.buttons.addNew}</span>
            <span className="sm:hidden">{language === 'hi' ? 'नया' : 'New'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
