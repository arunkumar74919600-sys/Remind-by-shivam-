import { ReminderItem } from '../types';

const STORAGE_KEY = 'remind_by_shivam_items_v2';
const SETTINGS_KEY = 'remind_by_shivam_settings_v1';

export interface AppSettings {
  language: 'en' | 'hi';
  theme: 'dark' | 'light' | 'midnight';
  voiceAlertDefault: boolean;
  soundVolume: number;
}

export const defaultSettings: AppSettings = {
  language: 'en',
  theme: 'midnight',
  voiceAlertDefault: true,
  soundVolume: 0.8,
};

export function getTodayDateStr(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function formatTimeString(date: Date): string {
  return date.toTimeString().slice(0, 5);
}

export function getInitialSampleItems(): ReminderItem[] {
  const now = new Date();
  
  // 1 hour from now
  const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
  // Today at 20:30 (8:30 PM)
  const eveningMed = new Date(now);
  eveningMed.setHours(20, 30, 0, 0);
  
  // Tomorrow at 07:00 AM
  const tomorrowMorning = new Date(now);
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(7, 0, 0, 0);

  // In 15 mins for quick test
  const quickTest = new Date(now.getTime() + 15 * 60 * 1000);

  return [
    {
      id: 'sample-1',
      title: 'Morning Workout & Jogging (सुबह का व्यायाम)',
      description: '30 mins cardio, stretches and pushups',
      dateTime: tomorrowMorning.toISOString(),
      timeOnly: '07:00',
      category: 'fitness',
      priority: 'high',
      type: 'alarm',
      repeat: 'daily',
      sound: 'siren',
      voiceAlert: true,
      enabled: true,
      completed: false,
      snoozeCount: 0,
      createdAt: now.toISOString(),
    },
    {
      id: 'sample-2',
      title: 'Drink 500ml Water & Hydrate (पानी पिएं)',
      description: 'Stay refreshed and focused during work',
      dateTime: quickTest.toISOString(),
      timeOnly: formatTimeString(quickTest),
      category: 'health',
      priority: 'medium',
      type: 'reminder',
      repeat: 'daily',
      sound: 'chime',
      voiceAlert: true,
      enabled: true,
      completed: false,
      snoozeCount: 0,
      createdAt: now.toISOString(),
    },
    {
      id: 'sample-3',
      title: 'Review Project Goals & Code (प्रोजेक्ट समीक्षा)',
      description: 'Check task progress, prepare milestone notes',
      dateTime: inOneHour.toISOString(),
      timeOnly: formatTimeString(inOneHour),
      category: 'work',
      priority: 'high',
      type: 'alarm',
      repeat: 'weekdays',
      sound: 'bell',
      voiceAlert: true,
      enabled: true,
      completed: false,
      snoozeCount: 0,
      createdAt: now.toISOString(),
    },
    {
      id: 'sample-4',
      title: 'Night Medicine & Vitamin C (शाम की दवाई)',
      description: 'Take with warm water after dinner',
      dateTime: eveningMed.toISOString(),
      timeOnly: '20:30',
      category: 'health',
      priority: 'high',
      type: 'alarm',
      repeat: 'daily',
      sound: 'digital',
      voiceAlert: true,
      enabled: true,
      completed: false,
      snoozeCount: 0,
      createdAt: now.toISOString(),
    },
    {
      id: 'sample-5',
      title: 'Read 15 Pages of Book (किताब पढ़ें)',
      description: 'Continuous daily learning habit',
      dateTime: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      timeOnly: '08:30',
      category: 'study',
      priority: 'low',
      type: 'habit',
      repeat: 'daily',
      sound: 'zen',
      voiceAlert: false,
      enabled: true,
      completed: true,
      completedAt: new Date().toISOString(),
      snoozeCount: 0,
      createdAt: now.toISOString(),
    },
  ];
}

export function loadStoredItems(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSampleItems();
      saveStoredItems(initial);
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading items from localStorage:', e);
    return getInitialSampleItems();
  }
}

export function saveStoredItems(items: ReminderItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items to localStorage:', e);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch (e) {
    return defaultSettings;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings to localStorage:', e);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function triggerSystemNotification(title: string, body?: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(`⏰ Remind by Shivam: ${title}`, {
        body: body || 'Time to complete your scheduled reminder!',
        icon: '/favicon.ico',
        tag: 'remind-by-shivam',
        requireInteraction: true,
      });
    } catch (e) {
      console.warn('System notification error:', e);
    }
  }

  // Trigger device vibration if available
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([200, 100, 200, 100, 300]);
    } catch {
      // ignore
    }
  }
}
