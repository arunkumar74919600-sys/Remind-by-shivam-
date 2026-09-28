export function speakReminder(title: string, lang: 'en' | 'hi' = 'en') {
  if (!('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    let text = `Reminder: ${title}`;
    if (lang === 'hi') {
      text = `शिवम, आपका रिमाइंडर है: ${title}`;
    } else {
      text = `Shivam, your reminder: ${title} is ringing now!`;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;
    utterance.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    if (lang === 'hi') {
      const hiVoice = voices.find(v => v.lang.startsWith('hi'));
      if (hiVoice) utterance.voice = hiVoice;
    } else {
      const enVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-US') || v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
