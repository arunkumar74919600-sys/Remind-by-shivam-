import React from 'react';
import { ReminderItem, Language } from '../types';
import { translations } from '../utils/translations';
import {
  Bell,
  Clock,
  CheckCircle,
  Circle,
  Repeat,
  Volume2,
  Trash2,
  Edit2,
  Play,
  RotateCw,
  Briefcase,
  User,
  HeartPulse,
  GraduationCap,
  DollarSign,
  Dumbbell,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReminderCardProps {
  item: ReminderItem;
  language: Language;
  onToggleEnabled: (item: ReminderItem) => void;
  onToggleComplete: (item: ReminderItem) => void;
  onEdit: (item: ReminderItem) => void;
  onDelete: (id: string) => void;
  onSnooze: (item: ReminderItem, minutes: number) => void;
  onTestRing: (item: ReminderItem) => void;
}

export const ReminderCard: React.FC<ReminderCardProps> = ({
  item,
  language,
  onToggleEnabled,
  onToggleComplete,
  onEdit,
  onDelete,
  onSnooze,
  onTestRing,
}) => {
  const t = translations[language];

  const handleCompleteClick = () => {
    if (!item.completed) {
      try {
        confetti({
          particleCount: 45,
          spread: 55,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    }
    onToggleComplete(item);
  };

  // Time remaining calculation
  const getTimeRemainingText = () => {
    if (item.completed) {
      return language === 'hi' ? 'पूरा हो गया' : 'Completed';
    }
    if (!item.enabled) {
      return language === 'hi' ? 'निष्क्रिय (Paused)' : 'Paused';
    }

    const targetTime = item.snoozedUntil ? new Date(item.snoozedUntil).getTime() : new Date(item.dateTime).getTime();
    const diffMs = targetTime - Date.now();
    const diffMin = Math.round(diffMs / 60000);

    if (diffMin < 0) {
      const pastMin = Math.abs(diffMin);
      if (pastMin < 60) {
        return language === 'hi' ? `${pastMin} मिनट पहले` : `${pastMin}m overdue`;
      }
      const pastHours = Math.floor(pastMin / 60);
      return language === 'hi' ? `${pastHours} घंटे पहले` : `${pastHours}h overdue`;
    }

    if (diffMin === 0) {
      return language === 'hi' ? 'अभी!' : 'Due now!';
    }
    if (diffMin < 60) {
      return language === 'hi' ? `${diffMin} मिनट में` : `in ${diffMin}m`;
    }
    const diffHours = Math.floor(diffMin / 60);
    const remMin = diffMin % 60;
    if (diffHours < 24) {
      return language === 'hi' ? `${diffHours} घंटे ${remMin > 0 ? remMin + 'मि' : ''} में` : `in ${diffHours}h ${remMin > 0 ? remMin + 'm' : ''}`;
    }
    const days = Math.floor(diffHours / 24);
    return language === 'hi' ? `${days} दिन में` : `in ${days}d`;
  };

  const categoryIcons = {
    personal: <User className="w-3.5 h-3.5" />,
    work: <Briefcase className="w-3.5 h-3.5" />,
    health: <HeartPulse className="w-3.5 h-3.5" />,
    study: <GraduationCap className="w-3.5 h-3.5" />,
    finance: <DollarSign className="w-3.5 h-3.5" />,
    fitness: <Dumbbell className="w-3.5 h-3.5" />,
    routine: <Sparkles className="w-3.5 h-3.5" />,
  };

  const categoryColors = {
    personal: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    work: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    study: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    finance: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    fitness: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    routine: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  };

  const priorityBadge = {
    high: 'border-l-4 border-l-rose-500',
    medium: 'border-l-4 border-l-amber-500',
    low: 'border-l-4 border-l-emerald-500',
  };

  const targetDate = new Date(item.dateTime);
  const formattedTime = targetDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = targetDate.toLocaleDateString([], { month: 'short', day: 'numeric', weekday: 'short' });

  return (
    <div
      className={`group relative bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg hover:shadow-indigo-500/5 transition-all duration-200 ${
        priorityBadge[item.priority]
      } ${item.completed ? 'opacity-60 bg-slate-900/40' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left Checkbox & Info */}
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <button
            onClick={handleCompleteClick}
            className="mt-0.5 text-slate-400 hover:text-emerald-400 transition cursor-pointer flex-shrink-0"
            title={item.completed ? 'Mark pending' : 'Mark completed'}
          >
            {item.completed ? (
              <CheckCircle className="w-6 h-6 text-emerald-500 fill-emerald-500/20" />
            ) : (
              <Circle className="w-6 h-6 hover:text-emerald-400" />
            )}
          </button>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Title & Type */}
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`font-semibold text-base sm:text-lg leading-snug break-words ${
                  item.completed ? 'line-through text-slate-400' : 'text-white'
                }`}
              >
                {item.title}
              </h4>

              {item.type === 'alarm' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Bell className="w-3 h-3" />
                  ALARM
                </span>
              )}

              {item.snoozeCount > 0 && !item.completed && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  <RotateCw className="w-3 h-3" />
                  Snoozed ({item.snoozeCount})
                </span>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <p className="text-xs sm:text-sm text-slate-400 line-clamp-2">
                {item.description}
              </p>
            )}

            {/* Metadata Tags */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              {/* Category */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${
                  categoryColors[item.category]
                }`}
              >
                {categoryIcons[item.category]}
                {t.categories[item.category]}
              </span>

              {/* Repeat */}
              {item.repeat !== 'once' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                  <Repeat className="w-3 h-3 text-indigo-400" />
                  {t.repeat[item.repeat]}
                </span>
              )}

              {/* Voice Alert Active */}
              {item.voiceAlert && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[11px] border border-indigo-500/20" title="Voice reading enabled">
                  <Volume2 className="w-3 h-3" />
                  Voice
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Switch & Time */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div className="text-right">
            <div className="text-base sm:text-xl font-mono font-bold text-white flex items-center justify-end gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>{formattedTime}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              {formattedDate}
            </div>
            <div
              className={`text-[11px] font-semibold mt-0.5 ${
                item.completed
                  ? 'text-emerald-400'
                  : !item.enabled
                  ? 'text-slate-500'
                  : 'text-indigo-400'
              }`}
            >
              {getTimeRemainingText()}
            </div>
          </div>

          {/* Toggle Switch */}
          <label className="relative inline-flex items-center cursor-pointer mt-1" title="Enable or pause this reminder">
            <input
              type="checkbox"
              checked={item.enabled}
              onChange={() => onToggleEnabled(item)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          {/* Quick Snooze +10m */}
          {!item.completed && item.enabled && (
            <button
              onClick={() => onSnooze(item, 10)}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1 transition cursor-pointer"
              title="Snooze for 10 minutes"
            >
              <RotateCw className="w-3 h-3 text-amber-400" />
              <span>+10m</span>
            </button>
          )}

          {/* Test Ring Button */}
          <button
            onClick={() => onTestRing(item)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-indigo-950/60 hover:text-indigo-300 text-slate-400 border border-slate-700/60 flex items-center gap-1 transition cursor-pointer"
            title="Test alarm sound & screen"
          >
            <Play className="w-3 h-3 text-indigo-400" />
            <span className="hidden sm:inline">{language === 'hi' ? 'बजाकर देखें' : 'Test Ring'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          {/* Edit */}
          <button
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition cursor-pointer"
            title={t.buttons.edit}
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
            title={t.buttons.delete}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
