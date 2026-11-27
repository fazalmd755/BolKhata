import { useState, useEffect, useRef, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { SpeechRecognition as CapSpeechRecognition } from '@capacitor-community/speech-recognition';

/**
 * BolKhata Unified Speech Input Hook (B1)
 * Supports native Android Capacitor via @capacitor-community/speech-recognition
 * and falls back to Web Speech API (webkitSpeechRecognition) in browsers.
 */
export function useSpeechInput({
  initialLanguage = 'hi-IN',
  onResult,
  silenceTimeoutMs = 2800,
  maxSessionTimeoutMs = 45000
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [language, setLanguage] = useState(initialLanguage);
  const [errorMessage, setErrorMessage] = useState('');
  const [isNative, setIsNative] = useState(false);

  const isListeningRef = useRef(false);
  const webRecognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const maxSessionTimerRef = useRef(null);
  const accumulatedRef = useRef('');
  const manualStopRef = useRef(false);
  const isAvailableRef = useRef(true);

  // Check platform on mount
  useEffect(() => {
    const native = Capacitor.isNativePlatform();
    setIsNative(native);
  }, []);

  const resetTranscript = useCallback(() => {
    accumulatedRef.current = '';
    setTranscript('');
    setInterimText('');
    setErrorMessage('');
  }, []);

  const clearTimers = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
    if (maxSessionTimerRef.current) {
      clearTimeout(maxSessionTimerRef.current);
      maxSessionTimerRef.current = null;
    }
  }, []);

  const stopListening = useCallback(async () => {
    manualStopRef.current = true;
    clearTimers();

    if (Capacitor.isNativePlatform()) {
      try {
        await CapSpeechRecognition.stop();
      } catch (err) {
        // ignore stop error
      }
    } else if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch (err) {
        // ignore stop error
      }
    }

    isListeningRef.current = false;
    setIsListening(false);

    // Finalize transcript
    const finalClean = accumulatedRef.current.trim();
    if (finalClean && onResult) {
      onResult(finalClean);
    }
  }, [clearTimers, onResult]);

  const startListening = useCallback(async (customLang) => {
    manualStopRef.current = false;
    setErrorMessage('');
    clearTimers();

    const activeLang = customLang || language;

    // 1. Native Android Implementation via Capacitor
    if (Capacitor.isNativePlatform()) {
      try {
        const hasPerm = await CapSpeechRecognition.hasPermissions();
        if (!hasPerm.permission) {
          const req = await CapSpeechRecognition.requestPermissions();
          if (!req.permission) {
            setErrorMessage('माइक की अनुमति नहीं मिली। कृपया ऐप सेटिंग्स में ऑडियो परमिशन दें।');
            return;
          }
        }

        const isAvail = await CapSpeechRecognition.available();
        if (!isAvail.available) {
          setErrorMessage('डिवाइस पर वॉयस सर्विस उपलब्ध नहीं है। कृपया गूगल ऐप या वॉयस डेटा चेक करें।');
          return;
        }

        // Add listener for partial results
        await CapSpeechRecognition.removeAllListeners();
        CapSpeechRecognition.addListener('partialResults', (data) => {
          if (data && data.matches && data.matches.length > 0) {
            const currentSpoken = data.matches[0];
            setInterimText(currentSpoken);
            accumulatedRef.current = currentSpoken;

            // Reset silence timer on new speech
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = setTimeout(() => {
              stopListening();
            }, silenceTimeoutMs);
          }
        });

        isListeningRef.current = true;
        setIsListening(true);

        // Max session safety timer
        maxSessionTimerRef.current = setTimeout(() => {
          stopListening();
        }, maxSessionTimeoutMs);

        await CapSpeechRecognition.start({
          language: activeLang,
          maxResults: 2,
          prompt: 'बोलिए... (Speak now)',
          partialResults: true,
          popup: false
        });
      } catch (err) {
        console.error('Native speech recognition failed:', err);
        isListeningRef.current = false;
        setIsListening(false);
        setErrorMessage('वॉयस पहचान में त्रुटि हुई: ' + (err.message || 'कृपया पुनः प्रयास करें।'));
      }
      return;
    }

    // 2. Browser Web Speech API Implementation
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setErrorMessage('इस ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। नीचे कीबोर्ड से टाइप करें।');
      return;
    }

    try {
      if (webRecognitionRef.current) {
        try { webRecognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognitionAPI();
      webRecognitionRef.current = recognition;

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = activeLang;
      recognition.maxAlternatives = 2;

      recognition.onstart = () => {
        isListeningRef.current = true;
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const text = item[0]?.transcript || '';
          if (item.isFinal) {
            currentFinal += ' ' + text;
          } else {
            currentInterim += ' ' + text;
          }
        }

        if (currentFinal.trim()) {
          accumulatedRef.current = (accumulatedRef.current + ' ' + currentFinal).trim();
          setTranscript(accumulatedRef.current);
          setInterimText('');
        } else if (currentInterim.trim()) {
          setInterimText(currentInterim.trim());
        }

        // Reset silence timer
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, silenceTimeoutMs);
      };

      recognition.onerror = (event) => {
        const error = event.error;
        console.warn('SpeechRecognition error:', error);

        if (error === 'no-speech') {
          // If already captured something, silence is natural completion
          if (accumulatedRef.current.trim()) {
            stopListening();
            return;
          }
          setErrorMessage('कोई आवाज़ सुनाई नहीं दी। कृपया फिर से बोलें।');
        } else if (error === 'not-allowed') {
          setErrorMessage('माइक की अनुमति नहीं मिली। कृपया ब्राउज़र/डिवाइस में माइक परमिशन ऑन करें।');
        } else if (error === 'network') {
          setErrorMessage('इंटरनेट कनेक्शन में समस्या है। आप लिखकर भी एंट्री कर सकते हैं।');
        } else if (error !== 'aborted') {
          setErrorMessage('वॉयस इनपुट त्रुटि: ' + error);
        }

        isListeningRef.current = false;
        setIsListening(false);
        clearTimers();
      };

      recognition.onend = () => {
        if (!manualStopRef.current && isListeningRef.current) {
          // Auto-restart if ended prematurely
          try {
            recognition.start();
            return;
          } catch (e) {}
        }
        isListeningRef.current = false;
        setIsListening(false);
        clearTimers();

        const finalText = (accumulatedRef.current + ' ' + interimText).trim();
        if (finalText && onResult) {
          onResult(finalText);
        }
      };

      recognition.start();

      // Max session safety timer
      maxSessionTimerRef.current = setTimeout(() => {
        stopListening();
      }, maxSessionTimeoutMs);

    } catch (err) {
      console.error('Failed to initialize browser speech:', err);
      setErrorMessage('माइक शुरू नहीं हो सका: ' + err.message);
      isListeningRef.current = false;
      setIsListening(false);
    }
  }, [language, silenceTimeoutMs, maxSessionTimeoutMs, clearTimers, stopListening, onResult, interimText]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, stopListening, startListening]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      clearTimers();
      if (webRecognitionRef.current) {
        try { webRecognitionRef.current.abort(); } catch (e) {}
      }
      if (Capacitor.isNativePlatform()) {
        try { CapSpeechRecognition.stop(); } catch (e) {}
      }
    };
  }, [clearTimers]);

  return {
    isListening,
    transcript: transcript || accumulatedRef.current,
    interimText,
    language,
    setLanguage: (lang) => {
      setLanguage(lang);
      if (isListening) {
        stopListening().then(() => startListening(lang));
      }
    },
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    isNative
  };
}
