import React from 'react';
import { ReminderItem, Language } from '../types';
import { translations } from '../utils/translations';
import { Sparkles, CheckCircle2, Circle, Flame, Plus } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HabitsTrackerProps {
  items: ReminderItem[];
  language: Language;
  onToggleComplete: (item: ReminderItem) => void;
  onAddNewHabit: () => void;
}

export const HabitsTracker: React.FC<HabitsTrackerProps> = ({
  items,
  language,
  onToggleComplete,
  onAddNewHabit,
}) => {
  const t = translations[language];
  const habitItems = items.filter((i) => i.type === 'habit' || i.repeat === 'daily');

  const completedCount = habitItems.filter((i) => i.completed).length;
  const percentage = habitItems.length > 0 ? Math.round((completedCount / habitItems.length) * 100) : 0;

  const handleCheck = (item: ReminderItem) => {
    if (!item.completed) {
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch {
        // ignore
      }
    }
    onToggleComplete(item);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {t.tabs.habits}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'hi' ? 'दैनिक आदतों का नियमित पालन करें' : 'Build discipline with daily repeated habits'}
            </p>
          </div>
        </div>

        <button
          onClick={onAddNewHabit}
          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'नई आदत' : 'New Habit'}</span>
        </button>
      </div>

      {/* Progress banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/20 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            {language === 'hi' ? 'आज की प्रगति' : "Today's Habit Progress"}
          </span>
          <div className="text-xl sm:text-2xl font-bold text-white mt-0.5">
            {completedCount} / {habitItems.length} {language === 'hi' ? 'पूर्ण' : 'Completed'} ({percentage}%)
          </div>
        </div>
        <div className="w-14 h-14 rounded-full border-4 border-indigo-500/30 flex items-center justify-center font-bold text-white text-sm">
          {percentage}%
        </div>
      </div>

      {/* Habit items */}
      {habitItems.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Sparkles className="w-8 h-8 mx-auto text-slate-600" />
          <p className="text-xs">{language === 'hi' ? 'कोई दैनिक आदत नहीं बनाई गई है।' : 'No daily habits created yet.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {habitItems.map((habit) => (
            <div
              key={habit.id}
              onClick={() => handleCheck(habit)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                habit.completed
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-white'
              }`}
            >
              <div className="min-w-0">
                <h4 className={`text-sm font-semibold truncate ${habit.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                  {habit.title}
                </h4>
                {habit.description && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {habit.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-amber-400 mt-1 font-medium">
                  <Flame className="w-3 h-3" />
                  <span>Daily Routine</span>
                </div>
              </div>

              <button
                type="button"
                className="flex-shrink-0 text-slate-400 hover:text-emerald-400 transition"
              >
                {habit.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                ) : (
                  <Circle className="w-6 h-6" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
