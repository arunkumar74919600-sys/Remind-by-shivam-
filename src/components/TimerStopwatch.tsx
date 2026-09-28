import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { translations } from '../utils/translations';
import { playAlarmSoundOnce } from '../utils/audio';
import { speakReminder } from '../utils/speech';
import { Play, Pause, RotateCcw, Flag, Timer, Hourglass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimerStopwatchProps {
  language: Language;
}

export const TimerStopwatch: React.FC<TimerStopwatchProps> = ({ language }) => {
  const t = translations[language];
  const [activeMode, setActiveMode] = useState<'countdown' | 'stopwatch'>('countdown');

  // Countdown state
  const [countdownMinutes, setCountdownMinutes] = useState(25);
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const totalTimerSeconds = (countdownMinutes * 60 + countdownSeconds) || 1;

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState(0); // in ms
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  const timerIntervalRef = useRef<number | null>(null);
  const stopwatchIntervalRef = useRef<number | null>(null);
  const stopwatchStartRef = useRef<number>(0);

  // Countdown effect
  useEffect(() => {
    if (isTimerRunning) {
      timerIntervalRef.current = window.setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            setIsTimerRunning(false);
            playAlarmSoundOnce('bell');
            speakReminder(language === 'hi' ? 'समय समाप्त हो गया है' : "Time's up! Great focus session!", language);
            try {
              confetti({ particleCount: 70, spread: 60 });
            } catch {
              // ignore
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, language]);

  // Stopwatch effect
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchStartRef.current = Date.now() - stopwatchTime;
      stopwatchIntervalRef.current = window.setInterval(() => {
        setStopwatchTime(Date.now() - stopwatchStartRef.current);
      }, 10);
    } else {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    }
    return () => {
      if (stopwatchIntervalRef.current) clearInterval(stopwatchIntervalRef.current);
    };
  }, [isStopwatchRunning]);

  // Handlers for Countdown
  const handleStartTimer = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(countdownMinutes * 60 + countdownSeconds);
    }
    setIsTimerRunning(true);
  };

  const handlePauseTimer = () => {
    setIsTimerRunning(false);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setRemainingSeconds(countdownMinutes * 60 + countdownSeconds);
  };

  const handleSetPreset = (mins: number) => {
    setIsTimerRunning(false);
    setCountdownMinutes(mins);
    setCountdownSeconds(0);
    setRemainingSeconds(mins * 60);
  };

  // Handlers for Stopwatch
  const handleStartStopwatch = () => {
    setIsStopwatchRunning(true);
  };

  const handlePauseStopwatch = () => {
    setIsStopwatchRunning(false);
  };

  const handleResetStopwatch = () => {
    setIsStopwatchRunning(false);
    setStopwatchTime(0);
    setLaps([]);
  };

  const handleAddLap = () => {
    if (isStopwatchRunning) {
      setLaps((prev) => [stopwatchTime, ...prev]);
    }
  };

  // Formatting helpers
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatch = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const centis = Math.floor((ms % 1000) / 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  };

  const timerProgress = Math.max(0, Math.min(100, (remainingSeconds / totalTimerSeconds) * 100));

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-2xl mx-auto space-y-6">
      {/* Mode Switcher */}
      <div className="flex p-1 bg-slate-800/80 rounded-2xl border border-slate-700/60 max-w-xs mx-auto">
        <button
          onClick={() => setActiveMode('countdown')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeMode === 'countdown'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Hourglass className="w-4 h-4" />
          <span>{t.timer.countdown}</span>
        </button>
        <button
          onClick={() => setActiveMode('stopwatch')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeMode === 'stopwatch'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>{t.timer.stopwatch}</span>
        </button>
      </div>

      {activeMode === 'countdown' ? (
        /* Countdown Mode */
        <div className="text-center space-y-6">
          {/* Quick Presets */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={() => handleSetPreset(25)}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700/60 transition cursor-pointer"
            >
              🍅 {t.timer.pomodoro}
            </button>
            <button
              onClick={() => handleSetPreset(5)}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700/60 transition cursor-pointer"
            >
              ☕ {t.timer.shortBreak}
            </button>
            <button
              onClick={() => handleSetPreset(10)}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700/60 transition cursor-pointer"
            >
              ⚡ {t.timer.quick10}
            </button>
            <button
              onClick={() => handleSetPreset(45)}
              className="px-3.5 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700/60 transition cursor-pointer"
            >
              🎯 Deep Work (45m)
            </button>
          </div>

          {/* Big Time Display */}
          <div className="py-4">
            <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-white select-none">
              {formatTime(remainingSeconds)}
            </div>
            {/* Progress line */}
            <div className="w-full max-w-sm mx-auto h-2 bg-slate-800 rounded-full overflow-hidden mt-6">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300"
                style={{ width: `${timerProgress}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isTimerRunning ? (
              <button
                onClick={handleStartTimer}
                className="py-3 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{remainingSeconds < totalTimerSeconds ? t.timer.resume : t.timer.start}</span>
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="py-3 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base shadow-lg shadow-amber-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Pause className="w-5 h-5 fill-white" />
                <span>{t.timer.pause}</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 cursor-pointer"
              title={t.timer.reset}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Stopwatch Mode */
        <div className="text-center space-y-6">
          <div className="py-4">
            <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-white select-none">
              {formatStopwatch(stopwatchTime)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            {!isStopwatchRunning ? (
              <button
                onClick={handleStartStopwatch}
                className="py-3 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{stopwatchTime > 0 ? t.timer.resume : t.timer.start}</span>
              </button>
            ) : (
              <button
                onClick={handlePauseStopwatch}
                className="py-3 px-8 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-base shadow-lg shadow-amber-600/30 flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Pause className="w-5 h-5 fill-white" />
                <span>{t.timer.pause}</span>
              </button>
            )}

            {isStopwatchRunning && (
              <button
                onClick={handleAddLap}
                className="py-3 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-indigo-400 font-semibold text-sm border border-slate-700 flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Flag className="w-4 h-4" />
                <span>{t.timer.lap}</span>
              </button>
            )}

            <button
              onClick={handleResetStopwatch}
              className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition active:scale-95 cursor-pointer"
              title={t.timer.reset}
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="max-w-md mx-auto max-h-48 overflow-y-auto space-y-1.5 pt-4 border-t border-slate-800 text-left text-xs">
              {laps.map((lapMs, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-800/60 border border-slate-700/50"
                >
                  <span className="text-slate-400 font-medium">Lap {laps.length - idx}</span>
                  <span className="font-mono text-white font-bold">{formatStopwatch(lapMs)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
