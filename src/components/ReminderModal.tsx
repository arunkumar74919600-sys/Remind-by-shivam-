import React, { useState, useEffect } from 'react';
import { ReminderItem, Category, Priority, SoundType, ItemType, RepeatType, Language } from '../types';
import { translations } from '../utils/translations';
import { playAlarmSoundOnce } from '../utils/audio';
import {
  X,
  Volume2,
  Calendar,
  Sparkles,
  Save,
} from 'lucide-react';

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (reminder: Omit<ReminderItem, 'id' | 'createdAt' | 'completed' | 'snoozeCount'>, id?: string) => void;
  initialItem?: ReminderItem | null;
  language: Language;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  language,
}) => {
  const t = translations[language];

  // Helper to format ISO to datetime-local input string
  const toLocalInputString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getInitialDateTime = () => {
    if (initialItem) {
      return toLocalInputString(new Date(initialItem.dateTime));
    }
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30);
    return toLocalInputString(d);
  };

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState(getInitialDateTime());
  const [category, setCategory] = useState<Category>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [type, setType] = useState<ItemType>('alarm');
  const [repeat, setRepeat] = useState<RepeatType>('once');
  const [sound, setSound] = useState<SoundType>('chime');
  const [voiceAlert, setVoiceAlert] = useState(true);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setDescription(initialItem.description || '');
      setDateTime(toLocalInputString(new Date(initialItem.dateTime)));
      setCategory(initialItem.category);
      setPriority(initialItem.priority);
      setType(initialItem.type);
      setRepeat(initialItem.repeat);
      setSound(initialItem.sound);
      setVoiceAlert(initialItem.voiceAlert);
    } else {
      setTitle('');
      setDescription('');
      const d = new Date();
      d.setMinutes(d.getMinutes() + 15);
      setDateTime(toLocalInputString(d));
      setCategory('personal');
      setPriority('medium');
      setType('alarm');
      setRepeat('once');
      setSound('chime');
      setVoiceAlert(true);
    }
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleApplyPreset = (minutesToAdd: number) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesToAdd);
    setDateTime(toLocalInputString(d));
  };

  const handleApplyTimeToday = (hour: number, minute: number) => {
    const d = new Date();
    d.setHours(hour, minute, 0, 0);
    if (d.getTime() <= Date.now()) {
      d.setDate(d.getDate() + 1);
    }
    setDateTime(toLocalInputString(d));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const timeOnly = dateTime.split('T')[1]?.slice(0, 5);

    onSave(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        dateTime: new Date(dateTime).toISOString(),
        timeOnly,
        category,
        priority,
        type,
        repeat,
        sound,
        voiceAlert,
        enabled: true,
      },
      initialItem?.id
    );
    onClose();
  };

  const testAudio = () => {
    playAlarmSoundOnce(sound);
  };

  const categoryOptions: { key: Category; label: string }[] = [
    { key: 'personal', label: t.categories.personal },
    { key: 'work', label: t.categories.work },
    { key: 'health', label: t.categories.health },
    { key: 'fitness', label: t.categories.fitness },
    { key: 'study', label: t.categories.study },
    { key: 'finance', label: t.categories.finance },
    { key: 'routine', label: t.categories.routine },
  ];

  const soundOptions: { key: SoundType; label: string }[] = [
    { key: 'chime', label: t.sounds.chime },
    { key: 'digital', label: t.sounds.digital },
    { key: 'bell', label: t.sounds.bell },
    { key: 'radar', label: t.sounds.radar },
    { key: 'zen', label: t.sounds.zen },
    { key: 'siren', label: t.sounds.siren },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">
              {initialItem ? (language === 'hi' ? 'रिमाइंडर बदलें' : 'Edit Reminder') : (language === 'hi' ? 'नया रिमाइंडर जोड़ें' : 'Create Reminder & Alarm')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {language === 'hi' ? 'रिमाइंडर का नाम (शीर्षक) *' : 'Title / Task *'}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={language === 'hi' ? 'जैसे: सुबह 7 बजे उठना, शाम की दवाई, टीम मीटिंग...' : 'e.g. Morning Jog, Take Vitamin, Client meeting...'}
              className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="block text-xs font-medium text-slate-400 mb-1.5">
              {language === 'hi' ? 'त्वरित समय चुनें:' : 'Quick Presets:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset(15)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              >
                +15 min
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(30)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              >
                +30 min
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(60)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              >
                +1 hour
              </button>
              <button
                type="button"
                onClick={() => handleApplyTimeToday(20, 0)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              >
                {t.quickChips.tonight8pm}
              </button>
              <button
                type="button"
                onClick={() => handleApplyTimeToday(9, 0)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition cursor-pointer"
              >
                {t.quickChips.tomorrow9am}
              </button>
            </div>
          </div>

          {/* Date & Time Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                {language === 'hi' ? 'दिनांक और समय (Date & Time) *' : 'Date & Time *'}
              </span>
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
            />
          </div>

          {/* Type Selection (Alarm vs Reminder vs Habit) */}
          <div className="grid grid-cols-3 gap-2">
            {(['alarm', 'reminder', 'habit'] as ItemType[]).map((itemType) => (
              <button
                key={itemType}
                type="button"
                onClick={() => setType(itemType)}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  type === itemType
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {itemType === 'alarm' ? '⏰ ' + (language === 'hi' ? 'अलार्म' : 'Alarm') : itemType === 'reminder' ? '🔔 ' + (language === 'hi' ? 'रिमाइंडर' : 'Reminder') : '🌱 ' + (language === 'hi' ? 'आदत' : 'Habit')}
              </button>
            ))}
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {language === 'hi' ? 'श्रेणी (Category)' : 'Category'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                {categoryOptions.map((c) => (
                  <option key={c.key} value={c.key} className="bg-slate-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {language === 'hi' ? 'प्राथमिकता (Priority)' : 'Priority'}
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="high" className="bg-slate-900 text-rose-400">{t.priority.high}</option>
                <option value="medium" className="bg-slate-900 text-amber-400">{t.priority.medium}</option>
                <option value="low" className="bg-slate-900 text-emerald-400">{t.priority.low}</option>
              </select>
            </div>
          </div>

          {/* Sound & Repeat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Repeat */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {language === 'hi' ? 'दोहराएं (Repeat)' : 'Repeat Frequency'}
              </label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatType)}
                className="w-full px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
              >
                <option value="once" className="bg-slate-900">{t.repeat.once}</option>
                <option value="daily" className="bg-slate-900">{t.repeat.daily}</option>
                <option value="weekdays" className="bg-slate-900">{t.repeat.weekdays}</option>
                <option value="weekends" className="bg-slate-900">{t.repeat.weekends}</option>
                <option value="weekly" className="bg-slate-900">{t.repeat.weekly}</option>
              </select>
            </div>

            {/* Sound with Preview */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                {language === 'hi' ? 'अलार्म रिंगटोन' : 'Alarm Sound Tone'}
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={sound}
                  onChange={(e) => setSound(e.target.value as SoundType)}
                  className="flex-1 px-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition cursor-pointer"
                >
                  {soundOptions.map((s) => (
                    <option key={s.key} value={s.key} className="bg-slate-900">
                      {s.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={testAudio}
                  title="Test Sound"
                  className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 border border-slate-700 transition active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Voice Announcement Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Volume2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {language === 'hi' ? 'बोलकर सुनाएं (Voice Alert)' : 'Voice Speech Announcement'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {t.voiceEnabled}
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={voiceAlert}
                onChange={(e) => setVoiceAlert(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Notes / Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              {language === 'hi' ? 'अतिरिक्त विवरण / नोट्स (वैकल्पिक)' : 'Notes / Description (Optional)'}
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={language === 'hi' ? 'कोई जरूरी निर्देश या विवरण यहाँ लिखें...' : 'Any details, checklist or instructions...'}
              className="w-full px-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-semibold transition cursor-pointer"
            >
              {t.buttons.cancel}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{t.buttons.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
