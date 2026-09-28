import { SoundType } from '../types';

let audioCtx: AudioContext | null = null;
let activeLoopInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playAlarmSoundOnce(sound: SoundType, volume: number = 0.8) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(volume, now);
    masterGain.connect(ctx.destination);

    switch (sound) {
      case 'digital': {
        // Classic twin high-pitch beep beep
        const playBeep = (startTime: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, startTime); // C6
          gain.gain.setValueAtTime(0.4, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.12);
        };
        playBeep(now);
        playBeep(now + 0.15);
        playBeep(now + 0.4);
        playBeep(now + 0.55);
        break;
      }

      case 'chime': {
        // Warm 3-chord marimba chime: E5, G#5, B5, E6
        const freqs = [659.25, 830.61, 987.77, 1318.51];
        freqs.forEach((freq, idx) => {
          const startTime = now + idx * 0.14;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);
          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.5, startTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.8);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(startTime);
          osc.stop(startTime + 0.8);
        });
        break;
      }

      case 'zen': {
        // Singing bowl resonance
        const osc = ctx.createOscillator();
        const subOsc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(432, now); // Natural A432
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(864, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.6, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        subOsc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        subOsc.start(now);
        osc.stop(now + 2.2);
        subOsc.stop(now + 2.2);
        break;
      }

      case 'bell': {
        // Clear brass bell tone with harmonic overtone
        [880, 1760, 2640].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = i === 0 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(freq, now);
          const amp = i === 0 ? 0.6 : 0.2;
          gain.gain.setValueAtTime(amp, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + (1.5 - i * 0.3));
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now);
          osc.stop(now + 1.5);
        });
        break;
      }

      case 'radar': {
        // Modern radar ping
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.3);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }

      case 'siren': {
        // Urgent alternating alarm
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.2);
        osc.frequency.linearRampToValueAtTime(700, now + 0.4);
        osc.frequency.linearRampToValueAtTime(1100, now + 0.6);
        osc.frequency.linearRampToValueAtTime(700, now + 0.8);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.85);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.85);
        break;
      }
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

export function startAlarmLoop(sound: SoundType, volume: number = 0.9) {
  stopAlarmLoop();
  playAlarmSoundOnce(sound, volume);
  const interval = sound === 'zen' ? 2400 : sound === 'digital' ? 1200 : sound === 'siren' ? 1000 : 1500;
  activeLoopInterval = window.setInterval(() => {
    playAlarmSoundOnce(sound, volume);
  }, interval);
}

export function stopAlarmLoop() {
  if (activeLoopInterval !== null) {
    clearInterval(activeLoopInterval);
    activeLoopInterval = null;
  }
}
