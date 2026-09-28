import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { Plus, Mic, MicOff, Clock, Sparkles } from 'lucide-react';

interface QuickAddBarProps {
  onQuickAdd: (title: string, minutesFromNow?: number) => void;
  language: Language;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({ onQuickAdd, language }) => {
  const t = translations[language];
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onQuickAdd(text.trim());
    setText('');
  };

  const handleChipClick = (title: string, minutes: number) => {
    onQuickAdd(title, minutes);
  };

  // Web Speech Recognition for voice typing
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(language === 'hi' ? 'आपके ब्राउज़र में आवाज़ पहचान (Voice Input) समर्थित नहीं है।' : 'Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognition as any)();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onstart = () => setIsListening(true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
      {/* Quick Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'तुरंत अलार्म या रिमाइंडर लिखें (जैसे: शाम 5 बजे कॉल, पानी पीना...)'
                : 'Quickly type a reminder (e.g. Call client at 4 PM, Take medicine, Water...)'
            }
            className="w-full pl-4 pr-11 py-3 bg-slate-800/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-xl transition cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'
            }`}
            title={isListening ? 'Listening...' : 'Voice Dictation'}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={!text.trim()}
          className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition active:scale-95 cursor-pointer flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">{t.buttons.quickAdd}</span>
        </button>
      </form>

      {/* Instant Presets Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-400 flex items-center gap-1 flex-shrink-0 text-[11px] font-medium">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          {language === 'hi' ? '1-क्लिक रिमाइंडर्स:' : '1-Click Presets:'}
        </span>

        <button
          type="button"
          onClick={() => handleChipClick(language === 'hi' ? 'पानी पिएं (Hydrate)' : 'Drink 500ml Water', 15)}
          className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 flex-shrink-0 transition active:scale-95 cursor-pointer"
        >
          💧 <span>{language === 'hi' ? '15 मिनट में पानी' : 'Water in 15m'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleChipClick(language === 'hi' ? 'आंखों को आराम दें (Break)' : 'Stand & Stretch Break', 30)}
          className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 flex-shrink-0 transition active:scale-95 cursor-pointer"
        >
          🚶 <span>{language === 'hi' ? '30 मिनट में ब्रेक' : 'Break in 30m'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleChipClick(language === 'hi' ? 'महत्वपूर्ण कॉल / टास्क' : 'Important Check-in Call', 60)}
          className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 flex-shrink-0 transition active:scale-95 cursor-pointer"
        >
          <Clock className="w-3 h-3 text-indigo-400" />
          <span>{language === 'hi' ? '1 घंटे बाद कॉल' : 'Check-in in 1h'}</span>
        </button>

        <button
          type="button"
          onClick={() => handleChipClick(language === 'hi' ? 'शाम का अलार्म' : 'Evening wrap up', 180)}
          className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 flex-shrink-0 transition active:scale-95 cursor-pointer"
        >
          🌆 <span>{language === 'hi' ? '3 घंटे बाद' : 'In 3 hours'}</span>
        </button>
      </div>
    </div>
  );
};
