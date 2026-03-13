import { useState, useCallback, useEffect } from 'react';

// Language codes for speech synthesis
const SPEECH_SYNTHESIS_LANGS: Record<string, string> = {
  en: 'en-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  hi: 'hi-IN',
  te: 'te-IN',
};

export const useSpeechSynthesis = (language: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = SPEECH_SYNTHESIS_LANGS[language] || 'en-IN';
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to find a voice for the language
    const voices = window.speechSynthesis.getVoices();
    const langCode = SPEECH_SYNTHESIS_LANGS[language] || 'en-IN';
    const voice = voices.find(v => v.lang.startsWith(langCode.split('-')[0])) 
      || voices.find(v => v.lang.includes('IN'))
      || voices[0];
    
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [language]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { speak, stop, isSpeaking, isSupported };
};
