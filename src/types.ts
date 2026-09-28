export type Priority = 'high' | 'medium' | 'low';

export type Category = 'personal' | 'work' | 'health' | 'study' | 'finance' | 'fitness' | 'routine';

export type RepeatType = 'once' | 'daily' | 'weekdays' | 'weekends' | 'weekly';

export type SoundType = 'chime' | 'digital' | 'zen' | 'bell' | 'radar' | 'siren';

export type ItemType = 'alarm' | 'reminder' | 'habit';

export interface ReminderItem {
  id: string;
  title: string;
  description?: string;
  dateTime: string; // ISO string e.g. "2026-09-28T09:00:00"
  timeOnly?: string; // "07:30" for daily recurring alarms
  category: Category;
  priority: Priority;
  type: ItemType;
  repeat: RepeatType;
  sound: SoundType;
  voiceAlert: boolean;
  enabled: boolean;
  completed: boolean;
  completedAt?: string;
  snoozeCount: number;
  snoozedUntil?: string;
  createdAt: string;
}

export type FilterStatus = 'all' | 'today' | 'upcoming' | 'completed' | 'alarms';

export type ActiveTab = 'reminders' | 'timeline' | 'calendar' | 'timer' | 'habits';

export type Language = 'en' | 'hi';
