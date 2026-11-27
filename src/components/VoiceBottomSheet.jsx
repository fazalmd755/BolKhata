import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Sparkles, 
  Globe, 
  Keyboard, 
  CornerDownLeft, 
  AlertCircle,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  Smartphone,
  HelpCircle,
  ShoppingBag,
  Volume2,
  Check,
  Radio
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { useTranslation } from '../i18n';
import { parseVoiceInput } from '../utils/voiceParser.js';
import { extractNewCustomerIntent } from '../utils/aiConversationalEngine.js';
import { playMicStartSound, playMicStopSound, playSuccessChime, speakText } from '../utils/soundEffects.js';
import { useSpeechInput } from '../hooks/useSpeechInput.js';
import { DEMO_VOICE_COMMANDS } from '../data/mockData.js';
import confetti from 'canvas-confetti';

export default function VoiceBottomSheet({ isOpen, onClose }) {
  const { 
    customers, 
    setActiveModal, 
    setModalPayload, 
    checkDuplicateTransaction,
    addNewCustomer,
    shopSettings 
  } = useKhata();
  const { t } = useTranslation();

  const [manualText, setManualText] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [micStatusText, setMicStatusText] = useState('माइक दबाकर बोलें (Tap to Speak)');
  const [isProcessing, setIsProcessing] = useState(false);
  const [liveParsedPreview, setLiveParsedPreview] = useState(null);

  const {
    isListening,
    transcript,
    interimText,
    language,
    setLanguage,
    errorMessage,
    startListening,
    stopListening,
    toggleListening,
    resetTranscript,
    isNative
  } = useSpeechInput({
    initialLanguage: 'hi-IN',
    silenceTimeoutMs: 2500,
    onResult: (spokenText) => {
      processCommand(spokenText);
    }
  });

  // Auto-start listening on open
  useEffect(() => {
    if (isOpen) {
      resetTranscript();
      setLiveParsedPreview(null);
      setMicStatusText('सुन रहे हैं... बोलना जारी रखें');
      const timer = setTimeout(() => {
        startListening();
        if (shopSettings.soundEnabled) playMicStartSound();
      }, 200);
      return () => {
        clearTimeout(timer);
        stopListening();
        if (shopSettings.soundEnabled) playMicStopSound();
      };
    } else {
      stopListening();
      resetTranscript();
      setLiveParsedPreview(null);
      setMicStatusText('माइक दबाकर बोलें (Tap to Speak)');
    }
  }, [isOpen]);

  // Live parsed preview as user speaks
  useEffect(() => {
    const liveText = (transcript + ' ' + interimText).trim();
    if (liveText) {
      try {
        const live = parseVoiceInput(liveText, customers);
        setLiveParsedPreview(live);
        setMicStatusText('सुन रहे हैं... रुकने पर स्वतः दर्ज होगा');
      } catch (e) {}
    }
  }, [transcript, interimText, customers]);

  // Switch to manual text input if error occurs
  useEffect(() => {
    if (errorMessage) {
      setShowTextInput(true);
      setMicStatusText('माइक रुका हुआ है (माइक बटन दबाएं या अनुमति दें)');
    }
  }, [errorMessage]);

  // Sync mic status text with listening state
  useEffect(() => {
    if (!errorMessage) {
      if (isListening) {
        if (!transcript && !interimText) {
          setMicStatusText('सुन रहे हैं... बोलना जारी रखें');
        }
      } else {
        setMicStatusText('माइक दबाकर बोलें (Tap to Speak)');
      }
    }
  }, [isListening, errorMessage, transcript, interimText]);

  const handleStartListening = () => {
    resetTranscript();
    setLiveParsedPreview(null);
    setMicStatusText('सुन रहे हैं... बोलना जारी रखें');
    startListening();
    if (shopSettings.soundEnabled) playMicStartSound();
  };

  const handleStopListening = () => {
    stopListening();
    if (shopSettings.soundEnabled) playMicStopSound();
    const liveText = (transcript + ' ' + interimText).trim();
    if (liveText && liveText.length > 2) {
      processCommand(liveText);
    }
  };

  const processCommand = (text) => {
    if (!text || !text.trim()) return;
    setIsProcessing(true);
    stopListening();
    onClose(); // Close sheet

    try {
      const parsed = parseVoiceInput(text, customers);

      // Check for New Customer Intent (e.g. "naya customer rahul", "naya customer amit 9876543210")
      const newCust = extractNewCustomerIntent(text);
      if (newCust && newCust.isNewCustomer && newCust.name) {
        // If "ek" was parsed as 1 rupee in "ek naya customer", clear it
        if (parsed.amount === 1 && /\b(ek|एक)\s+(naya|naye|nayi|new|नया|नए|नई)\b/i.test(text)) {
          parsed.amount = 0;
        }

        if (parsed.amount > 0) {
          setModalPayload({
            rawText: text,
            parsed,
            customer: null,
            customerId: null,
            customerName: newCust.name,
            phone: newCust.phone || '',
            isNewCustomer: true,
            amount: parsed.amount,
            type: parsed.intent || 'credit',
            items: parsed.items || [],
            itemsString: parsed.itemsString || '',
            paymentMethod: parsed.paymentMethod || 'Cash',
            dueDate: parsed.dueDate || '',
            notes: 'Added via Voice Command',
            isDuplicate: false
          });
          setActiveModal('confirm');
          if (shopSettings.voiceReadoutEnabled) {
            speakText(`${newCust.name} के नए खाते में ${parsed.amount} रुपये की पुष्टि करें।`, language);
          }
          return;
        } else {
          // Pure new customer creation (e.g. "naya customer nitin 9876543210")
          const addRes = addNewCustomer({
            name: newCust.name,
            phone: newCust.phone || '',
            openingBalance: 0,
            notes: 'Added via Voice Command'
          });

          if (addRes && (addRes.success || addRes.customer)) {
            try {
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.7 } });
            } catch (e) {}
            if (shopSettings.soundEnabled) {
              playSuccessChime();
            }
            if (shopSettings.voiceReadoutEnabled) {
              speakText(`नया ग्राहक ${newCust.name} खाता बही में जोड़ दिया गया है।`, language);
            }
            return;
          } else if (addRes && addRes.isExisting) {
            if (shopSettings.voiceReadoutEnabled) {
              speakText(`${newCust.name} का खाता पहले से मौजूद है।`, language);
            }
            return;
          } else {
            // Fallback: open manual entry prefilled
            setModalPayload({
              defaultTab: 'new_customer',
              prefillName: newCust.name,
              prefillPhone: newCust.phone || '',
              rawText: text
            });
            setActiveModal('manual_entry');
            if (shopSettings.voiceReadoutEnabled) {
              speakText(`${newCust.name} का नया खाता फॉर्म खोल दिया गया है।`, language);
            }
            return;
          }
        }
      }

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

        const isNewCust = Boolean(!matchedCust && parsed.customerName && parsed.customerName !== 'Customer');

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
          phone: parsed.phone || (matchedCust ? matchedCust.phone : ''),
          isNewCustomer: isNewCust,
          amount: parsed.amount || '',
          type: parsed.intent || 'credit',
          items: parsed.items || [],
          itemsString: parsed.itemsString || '',
          paymentMethod: parsed.paymentMethod || 'Cash',
          dueDate: parsed.dueDate || '',
          notes: '',
          isDuplicate: dupCheck.isDuplicate,
          duplicateMessage: dupCheck.message || '',
          warning: parsed.warning || '',
          allAmounts: parsed.allAmounts || []
        });
        setActiveModal('confirm');

        if (shopSettings.voiceReadoutEnabled && isNewCust) {
          speakText(`नया ग्राहक ${parsed.customerName} के लिए ${parsed.amount} रुपये की पुष्टि करें।`, language);
        }
      }
    } catch (err) {
      console.error('Error processing command:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Click outside backdrop */}
      <div className="flex-1" onClick={onClose}></div>

      {/* Slide-up Bottom Sheet */}
      <div className="bg-white rounded-t-[32px] shadow-2xl border-t border-slate-200 w-full max-w-lg mx-auto p-5 pb-8 animate-in slide-in-from-bottom duration-300">
        {/* Top Drag Handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto -mt-1 mb-3"></div>

        {/* Sheet Top Controls */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">BolKhata AI Voice</h3>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  लंबा सत्र (45s)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">रुक-रुक कर आराम से बोलें, कट नहीं होगा</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Language Switch */}
            <button
              onClick={() => {
                const nextLang = language === 'hi-IN' ? 'en-IN' : 'hi-IN';
                setLanguage(nextLang);
                if (isListening) {
                  handleStopListening();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition"
              title="Change Recognition Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'hi-IN' ? 'हिन्दी (hi-IN)' : 'English (en-IN)'}</span>
            </button>

            <button
              onClick={() => setShowTextInput(prev => !prev)}
              className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
              title="Toggle Text Typing"
              aria-label="Toggle Text Typing"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Large Animated Mic Area */}
        <div className="flex flex-col items-center justify-center py-6 px-3 bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white rounded-2xl border border-dashed border-emerald-300 relative overflow-hidden">
          {/* Animated Ripples */}
          {isListening && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="absolute w-28 h-28 rounded-full bg-emerald-400 opacity-30 animate-ping"></span>
              <span className="absolute w-40 h-40 rounded-full bg-emerald-500 opacity-20 animate-pulse"></span>
            </div>
          )}

          {/* Central Mic Button */}
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
              isListening
                ? 'bg-red-500 text-white ring-8 ring-red-100 animate-pulse shadow-red-200'
                : 'bg-gradient-to-tr from-emerald-600 to-emerald-500 text-white ring-8 ring-emerald-100 hover:scale-105 shadow-emerald-200'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          {/* Animated Audio Equalizer Waveform while listening */}
          {isListening && (
            <div className="flex items-center justify-center gap-1 mt-3 py-1 animate-in fade-in">
              <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-3"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-5 delay-75"></span>
              <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-3.5 delay-100"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-7 delay-150"></span>
              <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-5 delay-200"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-7 delay-100"></span>
              <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-4 delay-75"></span>
              <span className="w-1 bg-emerald-600 rounded-full animate-bounce h-5 delay-150"></span>
              <span className="w-1 bg-emerald-500 rounded-full animate-pulse h-3"></span>
            </div>
          )}

          {/* Live Mic Status Indicator */}
          <div className="mt-3 text-center px-4 max-w-sm">
            <div className={`text-xs font-bold ${isListening ? 'text-red-600' : 'text-slate-700'}`}>
              {micStatusText}
            </div>

            {/* Live speech transcription text preview */}
            {(interimText || transcript) && (
              <div className="mt-3 text-sm font-bold text-slate-900 bg-white px-4 py-2.5 rounded-2xl border border-emerald-300 shadow-sm animate-in fade-in">
                "{interimText || transcript}"
              </div>
            )}

            {/* Live AI Extracted Summary Pill */}
            {liveParsedPreview && (liveParsedPreview.amount > 0 || liveParsedPreview.customerName !== 'Customer') && (
              <div className="mt-2.5 p-2 bg-slate-100 rounded-xl flex items-center justify-center gap-2 flex-wrap text-xs font-semibold animate-in fade-in">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                  liveParsedPreview.intent === 'payment' 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : liveParsedPreview.intent === 'credit'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {liveParsedPreview.typeLabel}
                </span>
                {liveParsedPreview.customerName && (
                  <span className="text-slate-700">
                    👤 <b>{liveParsedPreview.customerName}</b>
                  </span>
                )}
                {liveParsedPreview.amount > 0 && (
                  <span className="text-slate-900 font-extrabold">
                    💰 ₹{liveParsedPreview.amount.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Complete / Submit Action Button if text was spoken */}
          {(interimText || transcript) && (
            <div className="mt-3 flex flex-col items-center gap-1">
              <button
                onClick={() => handleStopListening(true)}
                className="px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition active:scale-95 animate-in zoom-in-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{t('record_entry')}</span>
              </button>
              <span className="text-[10px] text-slate-500 font-medium">
                {liveParsedPreview?.amount > 0
                  ? '💡 रुकने पर 3 सेकंड में स्वतः दर्ज होगा, या तुरंत ऊपर बटन दबाएं'
                  : '💡 धीमे या रुक कर बोल रहे हैं तो आराम से पूरा करें (5.5s इंतज़ार)'}
              </span>
            </div>
          )}

          {/* Speaking Hints Guide (उधार दिया vs जमा मिला) */}
          <div className="w-full mt-4 pt-3 border-t border-emerald-200/70 max-w-md">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>बोलने का तरीका (ऐसे बोलें):</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
                सहायता गाइड
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
              {/* Hint 1: उधार दिया (Credit Given) */}
              <div 
                onClick={() => {
                  if (!isListening) processCommand('रमेश को 500 रुपये उधार दिया');
                }}
                className="p-2.5 rounded-xl bg-red-50/80 border border-red-200 hover:bg-red-100/70 transition cursor-pointer active:scale-98"
                title="क्लिक करके टेस्ट करें"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-red-700 mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
                    <span>उधार दिया (Credit)</span>
                  </span>
                  <span className="text-[9px] text-red-500 font-medium">सामान दिया</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                  🗣️ &ldquo;<b>रमेश को 500</b> रुपये <b>उधार दिया</b>&rdquo;
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  या: &ldquo;सुरेश 450 का तेल और चीनी&rdquo;
                </p>
              </div>

              {/* Hint 2: जमा मिला (Payment Got) */}
              <div 
                onClick={() => {
                  if (!isListening) processCommand('रमेश से 500 रुपये जमा मिला');
                }}
                className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 hover:bg-emerald-100/70 transition cursor-pointer active:scale-98"
                title="क्लिक करके टेस्ट करें"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 mb-1">
                  <span className="flex items-center gap-1">
                    <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                    <span>जमा मिला (Payment)</span>
                  </span>
                  <span className="text-[9px] text-emerald-600 font-medium">पैसे मिले</span>
                </div>
                <p className="text-[11px] font-semibold text-slate-800 leading-snug">
                  🗣️ &ldquo;<b>रमेश से 500</b> रुपये <b>जमा मिला</b>&rdquo;
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  या: &ldquo;मोहन ने 1200 ऑनलाइन दिए&rdquo;
                </p>
              </div>
            </div>

            {/* Quick Rule Hint */}
            <div className="mt-2 text-center text-[10px] text-slate-500 font-medium">
              💡 <span className="text-slate-700 font-bold">आसान फॉर्मूला:</span> [ग्राहक का नाम] + [रुपये] + [&ldquo;उधार दिया&rdquo; या &ldquo;जमा मिला&rdquo;]
            </div>
          </div>
        </div>

        {/* Error message / Permission Guide */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">माइक सूचना (Mic Notice):</span>
              <p className="text-[11px] leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Text input fallback */}
        {showTextInput && (
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (manualText.trim()) processCommand(manualText);
            }} 
            className="mt-3 flex items-center gap-2"
          >
            <input
              type="text"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="बोलकर या लिखकर दर्ज करें (e.g. Ramesh 2500 udhaar)"
              className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-medium"
            />
            <button
              type="submit"
              disabled={!manualText.trim()}
              aria-label="Submit typed entry"
              className="px-4 py-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shrink-0 disabled:bg-slate-300 shadow-xs"
            >
              <CornerDownLeft className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 1-Tap Quick Simulation Chips */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-2 px-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>1-क्लिक टेस्ट (Tap to Simulate Voice Input)</span>
            </span>
            <span className="text-slate-400 text-[10px]">Instant AI</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {DEMO_VOICE_COMMANDS.map((cmd, idx) => (
              <button
                key={idx}
                onClick={() => processCommand(cmd.text)}
                className="flex items-center gap-1.5 whitespace-nowrap bg-slate-50 hover:bg-emerald-50 active:scale-95 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-left shadow-2xs transition shrink-0"
              >
                <span className={`text-[9px] font-bold px-1 py-0.2 rounded-full border ${cmd.color}`}>
                  {cmd.badge}
                </span>
                <span className="font-semibold text-slate-800 text-[11px]">{cmd.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
