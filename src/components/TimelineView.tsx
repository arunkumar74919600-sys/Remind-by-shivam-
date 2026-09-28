import React from 'react';
import { ReminderItem, Language } from '../types';
import { translations } from '../utils/translations';
import { Clock, CheckCircle2, Circle, Bell, Calendar } from 'lucide-react';

interface TimelineViewProps {
  items: ReminderItem[];
  language: Language;
  onToggleComplete: (item: ReminderItem) => void;
  onSelect: (item: ReminderItem) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  items,
  language,
  onToggleComplete,
  onSelect,
}) => {
  const t = translations[language];

  // Today's date filter
  const todayStr = new Date().toISOString().split('T')[0];
  const todayItems = items.filter((item) => item.dateTime.startsWith(todayStr));

  // Sort chronologically
  const sortedItems = [...todayItems].sort(
    (a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  const hours = Array.from({ length: 18 }, (_, i) => i + 6); // 6:00 AM to 11:00 PM
  const currentHour = new Date().getHours();
  const currentMinute = new Date().getMinutes();
  const currentTimePercent = Math.min(100, Math.max(0, ((currentHour - 6) * 60 + currentMinute) / (18 * 60) * 100));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <span>{t.tabs.timeline}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className="text-xs px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium">
          {sortedItems.length} {language === 'hi' ? 'आज के कार्य' : 'Tasks for today'}
        </div>
      </div>

      {sortedItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <Calendar className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm">{language === 'hi' ? 'आज के लिए कोई निर्धारित कार्य नहीं है।' : 'No reminders scheduled for today yet.'}</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
          {sortedItems.map((item) => {
            const itemDate = new Date(item.dateTime);
            const timeStr = itemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isPast = itemDate.getTime() < Date.now();

            return (
              <div
                key={item.id}
                className="relative group flex items-start gap-4 transition-all duration-150"
              >
                {/* Timeline dot */}
                <div
                  className={`absolute -left-[27px] top-1.5 w-4 h-4 rounded-full border-2 transition ${
                    item.completed
                      ? 'bg-emerald-500 border-emerald-400'
                      : isPast
                      ? 'bg-rose-500 border-rose-400'
                      : 'bg-indigo-500 border-indigo-400'
                  }`}
                />

                {/* Content Box */}
                <div
                  onClick={() => onSelect(item)}
                  className={`flex-1 p-4 rounded-2xl border transition cursor-pointer ${
                    item.completed
                      ? 'bg-slate-900/40 border-slate-800 opacity-60'
                      : 'bg-slate-800/70 border-slate-700/80 hover:border-indigo-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 text-indigo-300">
                        {timeStr}
                      </span>
                      {item.type === 'alarm' && (
                        <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold">
                          <Bell className="w-3 h-3" /> Alarm
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleComplete(item);
                      }}
                      className="text-slate-400 hover:text-emerald-400 transition cursor-pointer"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <h4 className={`text-sm font-semibold mt-2 ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {item.title}
                  </h4>

                  {item.description && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
