import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Sparkles, Volume2, Globe, AlertCircle, CornerDownLeft, Keyboard, Check } from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { parseVoiceInput } from '../utils/voiceParser.js';
import { playMicStartSound, playMicStopSound, speakText } from '../utils/soundEffects.js';

export default function VoiceAssistantBar() {
  const { 
    customers, 
    setActiveModal, 
    setModalPayload, 
    checkDuplicateTransaction,
    shopSettings 
  } = useKhata();

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [manualText, setManualText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [language, setLanguage] = useState('hi-IN');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const recognitionRef = useRef(null);
  const latestSpeechRef = useRef('');

  const handleStartListening = async () => {
    setErrorMessage('');
    setTranscript('');
    setInterimText('');
    latestSpeechRef.current = '';

    // Request permission first
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
      } catch (err) {
        console.warn('getUserMedia permission failed:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setErrorMessage('Microphone Permission Blocked! ब्राउज़र के URL बार में 🔒 लॉक या सेटिंग्स में जाकर Microphone को Allow करें।');
          setShowTextInput(true);
          return;
        }
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setShowTextInput(true);
      setErrorMessage('इस ब्राउज़र में Web Speech API समर्थित नहीं है। नीचे टाइप करें या सैंपल कमांड पर टैप करें।');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        if (shopSettings.soundEnabled) {
          playMicStartSound();
        }
      };

      recognition.onresult = (event) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript;
          } else {
            currentInterim += res[0].transcript;
          }
        }

        const textSoFar = (currentFinal || currentInterim || '').trim();
        if (textSoFar) {
          latestSpeechRef.current = textSoFar;
          setInterimText(textSoFar);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setIsListening(false);
          setErrorMessage('माइक्रोफ़ोन अनुमति नहीं मिली (Microphone Blocked). ब्राउज़र बार में 🔒 लॉक पर क्लिक कर Microphone को Allow करें।');
          setShowTextInput(true);
        } else if (event.error === 'network') {
          setIsListening(false);
          setErrorMessage('Google Speech API नेटवर्क में समस्या है। कृपया नीचे टाइप करें।');
          setShowTextInput(true);
        } else if (event.error !== 'no-speech') {
          setErrorMessage(`Mic error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (shopSettings.soundEnabled) {
          playMicStopSound();
        }
        const textToProcess = latestSpeechRef.current;
        if (textToProcess && textToProcess.trim().length > 2) {
          processVoiceCommand(textToProcess);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setIsListening(false);
      setErrorMessage('माइक शुरू नहीं हो सका। कृपया नीचे टाइप करें।');
      setShowTextInput(true);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    setIsListening(false);
    if (latestSpeechRef.current && latestSpeechRef.current.trim().length > 2) {
      processVoiceCommand(latestSpeechRef.current);
    }
  };

  const processVoiceCommand = (text) => {
    if (!text || !text.trim()) return;
    setIsProcessing(true);

    try {
      const parsed = parseVoiceInput(text, customers);

      if (parsed.intent === 'balance_query') {
        const matchedCust = parsed.customer || customers.find(c => 
          c.name.toLowerCase().includes(parsed.customerName.toLowerCase())
        );

        setModalPayload({
          rawText: text,
          parsed,
          customer: matchedCust || null,
          customerName: matchedCust ? matchedCust.name : parsed.customerName,
          balance: matchedCust ? matchedCust.balance : 0,
        });
        setActiveModal('balance_query');

        if (shopSettings.voiceReadoutEnabled) {
          const speakMsg = matchedCust 
            ? `${matchedCust.name} का कुल हिसाब ${matchedCust.balance} रुपये बाकी है।`
            : `${parsed.customerName} का खाता नहीं मिला।`;
          speakText(speakMsg, language);
        }
      } else {
        const matchedCust = parsed.customer || customers.find(c => 
          c.name.toLowerCase().includes(parsed.customerName.toLowerCase())
        );

        const dupCheck = checkDuplicateTransaction(
          matchedCust ? matchedCust.id : null,
          parsed.amount,
          parsed.intent
        );

        setModalPayload({
          rawText: text,
          parsed,
          customer: matchedCust || null,
          customerId: matchedCust ? matchedCust.id : null,
          customerName: matchedCust ? matchedCust.name : parsed.customerName,
          isNewCustomer: !matchedCust,
          amount: parsed.amount || '',
          type: parsed.intent || 'credit',
          items: parsed.items || [],
          itemsString: parsed.itemsString || '',
          paymentMethod: parsed.paymentMethod || 'Cash',
          dueDate: parsed.dueDate || '',
          notes: '',
          isDuplicate: dupCheck.isDuplicate,
          duplicateMessage: dupCheck.message || ''
        });
        setActiveModal('confirm');
      }

      setManualText('');
      setInterimText('');
    } catch (err) {
      console.error('Error processing command:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <span>बोलकर खाता लिखें</span>
              <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                AI Voice Khata
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Hindi, Hinglish me bolen
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLanguage(prev => prev === 'hi-IN' ? 'en-IN' : 'hi-IN')}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:border-emerald-300 bg-slate-50 text-slate-700 transition"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'hi-IN' ? 'हिन्दी' : 'English'}</span>
          </button>

          <button
            onClick={() => setShowTextInput(prev => !prev)}
            className={`p-1.5 rounded-lg border text-xs transition ${
              showTextInput 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700' 
                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
            }`}
          >
            <Keyboard className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center py-5 px-3 bg-gradient-to-b from-slate-50 to-emerald-50/30 rounded-xl border border-dashed border-emerald-200/80">
        <div className="relative z-10 flex flex-col items-center">
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white ring-8 ring-red-100 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100 hover:scale-105'
            }`}
          >
            {isListening ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
          </button>

          <div className="mt-3 text-center">
            {isListening ? (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-600"></span>
                <span>सुन रहे हैं... बोलिए! (Listening...)</span>
              </div>
            ) : (
              <div className="text-xs text-slate-600 font-medium">
                माइक दबाकर बोलें <span className="text-emerald-700 font-semibold">(Tap to Speak)</span>
              </div>
            )}

            {(interimText || transcript) && (
              <div className="mt-2 text-sm font-bold text-slate-800 bg-white/95 px-3 py-1.5 rounded-lg border border-emerald-200 shadow-sm max-w-sm">
                "{interimText || transcript}"
              </div>
            )}

            {isListening && (interimText || transcript) && (
              <button
                onClick={handleStopListening}
                className="mt-2 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1 mx-auto"
              >
                <Check className="w-3 h-3" />
                <span>प्रोसेस करें (Submit)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-2.5 p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {showTextInput && (
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            if (manualText.trim()) processVoiceCommand(manualText);
          }} 
          className="mt-3 flex items-center gap-2"
        >
          <input
            type="text"
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            placeholder="उदा: Ramesh bhai ko 2500 udhaar diya"
            className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600"
          />
          <button
            type="submit"
            disabled={!manualText.trim() || isProcessing}
            className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shrink-0"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
          </button>
        </form>
      )}
    </div>
  );
}
