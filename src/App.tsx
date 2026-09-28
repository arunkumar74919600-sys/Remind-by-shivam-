/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ReminderItem,
  Category,
  FilterStatus,
  ActiveTab,
  Language,
} from './types';
import {
  loadStoredItems,
  saveStoredItems,
  loadStoredSettings,
  saveStoredSettings,
  requestNotificationPermission,
  triggerSystemNotification,
} from './utils/storage';
import { translations } from './utils/translations';
import { startAlarmLoop, stopAlarmLoop } from './utils/audio';
import { speakReminder, stopSpeaking } from './utils/speech';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { QuickAddBar } from './components/QuickAddBar';
import { ReminderCard } from './components/ReminderCard';
import { ReminderModal } from './components/ReminderModal';
import { ActiveAlarmModal } from './components/ActiveAlarmModal';
import { TimelineView } from './components/TimelineView';
import { CalendarView } from './components/CalendarView';
import { TimerStopwatch } from './components/TimerStopwatch';
import { HabitsTracker } from './components/HabitsTracker';
import {
  Bell,
  Clock,
  Calendar,
  Hourglass,
  Sparkles,
  Flame,
  Plus,
  Trash2,
} from 'lucide-react';

export default function App() {
  const [settings, setSettings] = useState(loadStoredSettings);
  const [language, setLanguage] = useState<Language>(settings.language);
  const [items, setItems] = useState<ReminderItem[]>(loadStoredItems);
  const [activeTab, setActiveTab] = useState<ActiveTab>('reminders');
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ReminderItem | null>(null);
  const [ringingAlarm, setRingingAlarm] = useState<ReminderItem | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    'Notification' in window && Notification.permission === 'granted'
  );

  const firedAlarmsRef = useRef<Set<string>>(new Set());

  // Save items whenever changed
  useEffect(() => {
    saveStoredItems(items);
  }, [items]);

  // Save settings when language changes
  useEffect(() => {
    const updated = { ...settings, language };
    setSettings(updated);
    saveStoredSettings(updated);
  }, [language]);

  const t = translations[language];

  // Request notifications
  const handleRequestNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      triggerSystemNotification(
        language === 'hi' ? 'अलर्ट चालू हो गए!' : 'Notifications Enabled!',
        language === 'hi'
          ? 'शिवम, आपको समय पर अलर्ट और रिमाइंडर्स मिलते रहेंगे।'
          : 'You will receive on-time reminders and alerts.'
      );
    }
  };

  // Alarm loop runner: Checks every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (ringingAlarm) return; // Already one active ringing

      const nowMs = Date.now();
      items.forEach((item) => {
        if (!item.enabled || item.completed) return;

        const scheduledTime = item.snoozedUntil
          ? new Date(item.snoozedUntil).getTime()
          : new Date(item.dateTime).getTime();

        // Check if within 5-second trigger window or past due within last 60 seconds
        const timeDiff = nowMs - scheduledTime;
        const alarmKey = `${item.id}-${scheduledTime}`;

        if (timeDiff >= 0 && timeDiff < 60000 && !firedAlarmsRef.current.has(alarmKey)) {
          firedAlarmsRef.current.add(alarmKey);

          // Trigger Ringing
          setRingingAlarm(item);
          startAlarmLoop(item.sound);

          if (item.voiceAlert) {
            speakReminder(item.title, language);
          }

          triggerSystemNotification(item.title, item.description);
        }
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [items, ringingAlarm, language]);

  // Alarm actions
  const handleStopRinging = () => {
    stopAlarmLoop();
    stopSpeaking();
    setRingingAlarm(null);
  };

  const handleSnooze = (alarm: ReminderItem, minutes: number) => {
    handleStopRinging();
    const snoozedDate = new Date(Date.now() + minutes * 60 * 1000);

    setItems((prev) =>
      prev.map((item) =>
        item.id === alarm.id
          ? {
              ...item,
              snoozeCount: (item.snoozeCount || 0) + 1,
              snoozedUntil: snoozedDate.toISOString(),
            }
          : item
      )
    );
  };

  const handleComplete = (alarm: ReminderItem) => {
    handleStopRinging();
    setItems((prev) =>
      prev.map((item) =>
        item.id === alarm.id
          ? {
              ...item,
              completed: true,
              completedAt: new Date().toISOString(),
              snoozedUntil: undefined,
            }
          : item
      )
    );
  };

  const handleDismiss = (_alarm: ReminderItem) => {
    handleStopRinging();
  };

  // Reminder CRUD
  const handleSaveReminder = (
    data: Omit<ReminderItem, 'id' | 'createdAt' | 'completed' | 'snoozeCount'>,
    id?: string
  ) => {
    if (id) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...data,
                snoozedUntil: undefined,
              }
            : item
        )
      );
    } else {
      const newItem: ReminderItem = {
        ...data,
        id: `remind-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        completed: false,
        snoozeCount: 0,
        createdAt: new Date().toISOString(),
      };
      setItems((prev) => [newItem, ...prev]);
    }
  };

  const handleToggleEnabled = (item: ReminderItem) => {
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, enabled: !i.enabled } : i))
    );
  };

  const handleToggleComplete = (item: ReminderItem) => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              completed: !i.completed,
              completedAt: !i.completed ? new Date().toISOString() : undefined,
            }
          : i
      )
    );
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearCompleted = () => {
    if (window.confirm(language === 'hi' ? 'क्या आप सभी पूरे हो चुके रिमाइंडर्स को हटाना चाहते हैं?' : 'Remove all completed reminders?')) {
      setItems((prev) => prev.filter((i) => !i.completed));
    }
  };

  // Quick Add
  const handleQuickAdd = (title: string, minutesFromNow: number = 30) => {
    const scheduled = new Date(Date.now() + minutesFromNow * 60 * 1000);
    const newItem: ReminderItem = {
      id: `remind-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title,
      dateTime: scheduled.toISOString(),
      timeOnly: scheduled.toTimeString().slice(0, 5),
      category: 'personal',
      priority: 'medium',
      type: 'reminder',
      repeat: 'once',
      sound: 'chime',
      voiceAlert: true,
      enabled: true,
      completed: false,
      snoozeCount: 0,
      createdAt: new Date().toISOString(),
    };
    setItems((prev) => [newItem, ...prev]);
  };

  // Test ring single item
  const handleTestRing = (item: ReminderItem) => {
    setRingingAlarm(item);
    startAlarmLoop(item.sound);
    if (item.voiceAlert) {
      speakReminder(item.title, language);
    }
  };

  // Export / Import
  const handleExportData = () => {
    const jsonStr = JSON.stringify(items, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `remind-by-shivam-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          setItems(parsed);
          alert(language === 'hi' ? 'डाटा सफलतापूर्वक इम्पोर्ट हो गया!' : 'Reminders successfully imported!');
        }
      } catch (err) {
        alert(language === 'hi' ? 'फाइल पढ़ने में त्रुटि!' : 'Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (activeFilter === 'today') {
        const todayStr = new Date().toISOString().split('T')[0];
        if (!item.dateTime.startsWith(todayStr)) return false;
      } else if (activeFilter === 'upcoming') {
        if (new Date(item.dateTime).getTime() < Date.now() || item.completed) return false;
      } else if (activeFilter === 'alarms') {
        if (item.type !== 'alarm') return false;
      } else if (activeFilter === 'completed') {
        if (!item.completed) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      return true;
    });
  }, [items, selectedCategory, activeFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onOpenCreateModal={() => {
          setEditingItem(null);
          setIsModalOpen(true);
        }}
        notificationsEnabled={notificationsEnabled}
        onRequestNotifications={handleRequestNotifications}
        onExport={handleExportData}
        onImport={handleImportData}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Shivam Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">
                  {language === 'hi' ? 'नमस्ते शिवम' : 'Hello Shivam'}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {language === 'hi'
                  ? 'आपके सभी अलार्म और रिमाइंडर्स'
                  : 'Your Intelligent Reminder & Alarm Hub'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                {t.greeting}
              </p>
            </div>

            <button
              onClick={() => {
                setEditingItem(null);
                setIsModalOpen(true);
              }}
              className="py-3 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer flex-shrink-0"
            >
              <Plus className="w-5 h-5" />
              <span>{t.buttons.addNew}</span>
            </button>
          </div>
        </div>

        {/* Quick Add Bar */}
        <QuickAddBar onQuickAdd={handleQuickAdd} language={language} />

        {/* Navigation Tabs (Reminders, Timeline, Calendar, Timer & Stopwatch, Habits) */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'reminders'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{t.tabs.reminders}</span>
            <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800/80 text-indigo-300">
              {items.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t.tabs.timeline}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t.tabs.calendar}</span>
          </button>

          <button
            onClick={() => setActiveTab('habits')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'habits'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>{t.tabs.habits}</span>
          </button>

          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
              activeTab === 'timer'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Hourglass className="w-4 h-4" />
            <span>{t.tabs.timer}</span>
          </button>
        </div>

        {/* Tab Content Panels */}
        {activeTab === 'reminders' && (
          <div className="space-y-6">
            {/* Stats and Filter Header */}
            <StatsBar
              items={items}
              language={language}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />

            {/* Clear completed button */}
            {items.some((i) => i.completed) && (
              <div className="flex justify-end">
                <button
                  onClick={handleClearCompleted}
                  className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{t.buttons.clearAll}</span>
                </button>
              </div>
            )}

            {/* Reminders List */}
            {filteredItems.length === 0 ? (
              <div className="py-16 text-center rounded-3xl bg-slate-900/60 border border-slate-800 p-8 space-y-3">
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto opacity-60" />
                <h3 className="text-base font-bold text-white">{t.emptyState}</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">{t.createFirst}</p>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t.buttons.addNew}</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map((item) => (
                  <ReminderCard
                    key={item.id}
                    item={item}
                    language={language}
                    onToggleEnabled={handleToggleEnabled}
                    onToggleComplete={handleToggleComplete}
                    onEdit={(selected) => {
                      setEditingItem(selected);
                      setIsModalOpen(true);
                    }}
                    onDelete={handleDelete}
                    onSnooze={handleSnooze}
                    onTestRing={handleTestRing}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            items={items}
            language={language}
            onToggleComplete={handleToggleComplete}
            onSelect={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            items={items}
            language={language}
            onSelectItem={(item) => {
              setEditingItem(item);
              setIsModalOpen(true);
            }}
            onDateAdd={(dateStr) => {
              setEditingItem({
                id: '',
                title: '',
                dateTime: `${dateStr}T09:00:00`,
                category: 'personal',
                priority: 'medium',
                type: 'reminder',
                repeat: 'once',
                sound: 'chime',
                voiceAlert: true,
                enabled: true,
                completed: false,
                snoozeCount: 0,
                createdAt: new Date().toISOString(),
              });
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'habits' && (
          <HabitsTracker
            items={items}
            language={language}
            onToggleComplete={handleToggleComplete}
            onAddNewHabit={() => {
              setEditingItem({
                id: '',
                title: '',
                dateTime: new Date().toISOString(),
                category: 'routine',
                priority: 'medium',
                type: 'habit',
                repeat: 'daily',
                sound: 'zen',
                voiceAlert: false,
                enabled: true,
                completed: false,
                snoozeCount: 0,
                createdAt: new Date().toISOString(),
              });
              setIsModalOpen(true);
            }}
          />
        )}

        {activeTab === 'timer' && <TimerStopwatch language={language} />}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-500">
        <p>
          Remind by Shivam • Created with precision & care for Shivam
        </p>
      </footer>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <ReminderModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSave={handleSaveReminder}
          initialItem={editingItem}
          language={language}
        />
      )}

      {/* Urgent Ringing Alarm Screen */}
      {ringingAlarm && (
        <ActiveAlarmModal
          alarm={ringingAlarm}
          language={language}
          onSnooze={handleSnooze}
          onComplete={handleComplete}
          onDismiss={handleDismiss}
        />
      )}
    </div>
  );
}
