import React, { useState } from 'react';
import { ReminderItem, Language } from '../types';
import { translations } from '../utils/translations';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from 'lucide-react';

interface CalendarViewProps {
  items: ReminderItem[];
  language: Language;
  onSelectItem: (item: ReminderItem) => void;
  onDateAdd: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  items,
  language,
  onSelectItem,
  onDateAdd,
}) => {
  const t = translations[language];
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const selectedDateStr = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;

  // Filter items for selected day
  const selectedDayItems = items.filter((item) => item.dateTime.startsWith(selectedDateStr));

  const weekDaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDaysHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const weekDays = language === 'hi' ? weekDaysHi : weekDaysEn;

  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthNamesHi = [
    'जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून',
    'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर',
  ];
  const monthName = language === 'hi' ? monthNamesHi[month] : monthNamesEn[month];

  // Map of date string -> count of items
  const itemsByDate: { [key: string]: number } = {};
  items.forEach((item) => {
    const dStr = item.dateTime.split('T')[0];
    itemsByDate[dStr] = (itemsByDate[dStr] || 0) + 1;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid (2 cols) */}
      <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {monthName} {year}
            </h3>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentDate(now);
                setSelectedDate(now);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              {language === 'hi' ? 'आज' : 'Today'}
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-800">
          {weekDays.map((d, i) => (
            <div key={i} className={i === 0 || i === 6 ? 'text-indigo-400/80' : ''}>
              {d}
            </div>
          ))}
        </div>

        {/* Month grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {/* Empty cells for offset */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 sm:h-14 rounded-2xl bg-slate-900/20" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
            const isToday =
              new Date().getFullYear() === year &&
              new Date().getMonth() === month &&
              new Date().getDate() === dayNum;
            const isSelected =
              selectedDate.getFullYear() === year &&
              selectedDate.getMonth() === month &&
              selectedDate.getDate() === dayNum;

            const count = itemsByDate[dayStr] || 0;

            return (
              <button
                key={dayStr}
                type="button"
                onClick={() => setSelectedDate(new Date(year, month, dayNum))}
                className={`h-12 sm:h-14 rounded-2xl flex flex-col items-center justify-center relative p-1 transition cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/30'
                    : isToday
                    ? 'bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 font-semibold hover:bg-indigo-900/60'
                    : 'bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/40'
                }`}
              >
                <span className="text-xs sm:text-sm">{dayNum}</span>

                {/* Dot markers */}
                {count > 0 && (
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: Math.min(count, 3) }).map((_, dotIdx) => (
                      <span
                        key={dotIdx}
                        className={`w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-indigo-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Agenda (1 col) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h4 className="text-sm font-bold text-white">
              {selectedDate.toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </h4>
            <p className="text-xs text-slate-400">
              {selectedDayItems.length} {language === 'hi' ? 'रिमाइंडर निर्धारित' : 'scheduled'}
            </p>
          </div>
          <button
            onClick={() => onDateAdd(selectedDateStr)}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition cursor-pointer"
          >
            + {language === 'hi' ? 'जोड़ें' : 'Add for Day'}
          </button>
        </div>

        {selectedDayItems.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-600" />
            <p className="text-xs">{language === 'hi' ? 'इस दिन कोई कार्य नहीं है।' : 'No reminders for this day.'}</p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {selectedDayItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 transition cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-300 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <h5 className={`text-xs font-semibold mt-0.5 truncate ${item.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                    {item.title}
                  </h5>
                </div>
                {item.completed && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
