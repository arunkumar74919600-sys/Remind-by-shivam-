import React, { useEffect } from 'react';
import { ReminderItem, Language } from '../types';
import { translations } from '../utils/translations';
import { Bell, CheckCircle2, Clock, Volume2, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ActiveAlarmModalProps {
  alarm: ReminderItem | null;
  language: Language;
  onSnooze: (alarm: ReminderItem, minutes: number) => void;
  onComplete: (alarm: ReminderItem) => void;
  onDismiss: (alarm: ReminderItem) => void;
}

export const ActiveAlarmModal: React.FC<ActiveAlarmModalProps> = ({
  alarm,
  language,
  onSnooze,
  onComplete,
  onDismiss,
}) => {
  const t = translations[language];

  useEffect(() => {
    if (!alarm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss(alarm);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [alarm, onDismiss]);

  if (!alarm) return null;

  const handleComplete = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onComplete(alarm);
  };

  const priorityColors = {
    high: 'from-rose-500 to-amber-500 text-rose-300 border-rose-500/30',
    medium: 'from-amber-500 to-orange-500 text-amber-300 border-amber-500/30',
    low: 'from-emerald-500 to-teal-500 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      {/* Glow pulse background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-3xl animate-ping opacity-30" />
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 overflow-hidden">
        {/* Top header badge */}
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Volume2 className="w-4 h-4 animate-bounce" />
            {alarm.type === 'alarm' ? 'Ringing Alarm' : 'Reminder Alert'}
          </span>
          <span className={`px-2.5 py-0.5 rounded-full border bg-slate-800 ${priorityColors[alarm.priority]}`}>
            {t.priority[alarm.priority]}
          </span>
        </div>

        {/* Ringing Bell Animation */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 animate-pulse">
            <Bell className="w-12 h-12 text-white animate-[wiggle_0.4s_ease-in-out_infinite]" />
          </div>
          <span className="absolute -inset-3 rounded-full border-2 border-indigo-400/40 animate-ping pointer-events-none" />
        </div>

        {/* Alarm Details */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {alarm.title}
          </h2>
          {alarm.description && (
            <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto line-clamp-3">
              {alarm.description}
            </p>
          )}
          <div className="flex items-center justify-center gap-2 text-xs text-indigo-300 font-medium pt-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Scheduled for {new Date(alarm.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            {alarm.snoozeCount > 0 && (
              <span className="bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                Snoozed {alarm.snoozeCount}x
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* Complete Button */}
          <button
            onClick={handleComplete}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-lg shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2.5 transition active:scale-[0.98] cursor-pointer"
          >
            <CheckCircle2 className="w-6 h-6" />
            <span>{t.alarmFired.markDone}</span>
          </button>

          {/* Snooze Options */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onSnooze(alarm, 5)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
            >
              {t.alarmFired.snooze5}
            </button>
            <button
              onClick={() => onSnooze(alarm, 10)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
            >
              {t.alarmFired.snooze10}
            </button>
            <button
              onClick={() => onSnooze(alarm, 15)}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer"
            >
              {t.alarmFired.snooze15}
            </button>
          </div>

          {/* Turn Off / Dismiss */}
          <button
            onClick={() => onDismiss(alarm)}
            className="w-full py-2.5 px-4 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium text-sm flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>{t.alarmFired.dismissOnly}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
