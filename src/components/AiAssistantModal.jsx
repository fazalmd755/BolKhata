import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Share2, 
  BookOpen, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Zap,
  User,
  UserPlus,
  Phone
} from 'lucide-react';
import { useKhata } from '../context/KhataContext';
import { processConversationalQuery } from '../utils/aiConversationalEngine';
import { speakText, playMicStartSound, playMicStopSound, playSuccessChime } from '../utils/soundEffects';
import { useSpeechInput } from '../hooks/useSpeechInput';
import confetti from 'canvas-confetti';

export default function AiAssistantModal({ isOpen, onClose }) {
  const { 
    customers, 
    transactions, 
    shopSettings, 
    addTransaction,
    addNewCustomer, 
    setActiveModal, 
    setModalPayload, 
    setSelectedCustomerId 
  } = useKhata();

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `राम-राम ${shopSettings.merchantName || 'जी'}! 🙏\nमैं आपका **बोलखाता AI मुंशी** हूँ। आप मुझसे बोलकर या लिखकर अपनी दुकान का कोई भी हिसाब पूछ सकते हैं:\n\n• *"नया ग्राहक जोड़ो राहुल"*\n• *"कुल कितना बकाया है?"*\n• *"आज कितना पेमेंट आया?"*\n• *"आज मोहन ने 1000 लिया"*\n• *"मोहन का क्या हिसाब है?"*`,
      actionType: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState('');
  const [speakBackEnabled, setSpeakBackEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const {
    isListening,
    transcript: speechTranscript,
    interimText: speechInterim,
    toggleListening: handleVoiceInput,
    stopListening,
    errorMessage: speechError
  } = useSpeechInput({
    initialLanguage: 'hi-IN',
    silenceTimeoutMs: 2500,
    onResult: (spokenText) => {
      if (spokenText) {
        handleSend(spokenText);
      }
    }
  });

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
    }
  }, [isOpen, isListening, stopListening]);

  // Sync spoken text into input field preview
  useEffect(() => {
    const live = (speechTranscript + ' ' + speechInterim).trim();
    if (live && isListening) {
      setInputText(live);
    }
  }, [speechTranscript, speechInterim, isListening]);

  const playSpeech = (text) => {
    if (!text) return;
    setIsSpeaking(true);
    speakText(text, 'hi-IN');
    setTimeout(() => {
      setIsSpeaking(false);
    }, 3500);
  };

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query) return;

    // Warm up and unlock speech synthesis inside user gesture
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }

    // Add user message
    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    // AI Reasoning with minimal latency to preserve user activation gesture
    setTimeout(() => {
      const response = processConversationalQuery({
        query,
        customers,
        transactions,
        shopSettings
      });

      const aiMsg = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.text,
        speechText: response.speechText,
        actionType: response.actionType,
        data: response.data,
        parsedTxn: response.parsedTxn,
        customer: response.customer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);

      // Speak aloud in sweet Indian female voice if enabled
      if (speakBackEnabled && response.speechText) {
        playSpeech(response.speechText);
      }
    }, 80);
  };

  const handleAddNewCustomerDirectly = (msgId, name, phone) => {
    if (!name || !name.trim()) return;
    const res = addNewCustomer({
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      openingBalance: 0
    });

    if (res && (res.success || res.customer)) {
      try {
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });
      } catch (e) {}

      // Mark this message card as added
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isAdded: true } : m));

      // Append confirmation AI message
      const confirmMsg = {
        id: `ai_added_${Date.now()}`,
        sender: 'ai',
        text: `✅ **${name}** को सफलतापूर्वक आपकी खाता बही में जोड़ दिया गया है!${phone ? `\n• मोबाइल: ${phone}` : ''}`,
        speechText: `${name} को खाता बही में जोड़ दिया गया है।`,
        actionType: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, confirmMsg]);

      if (speakBackEnabled) {
        playSpeech(`${name} को खाता बही में जोड़ दिया गया है।`);
      }
    }
  };

  const handleExecuteTxnDirectly = (msgId, parsedTxn) => {
    if (!parsedTxn || !parsedTxn.amount) return;

    addTransaction({
      customerId: parsedTxn.customerId || null,
      customerName: parsedTxn.customerName,
      phone: parsedTxn.phone || '',
      type: parsedTxn.intent,
      amount: parsedTxn.amount,
      items: parsedTxn.items || [],
      paymentMethod: parsedTxn.paymentMethod || 'Cash',
      dueDate: parsedTxn.dueDate,
      notes: 'Added via BolKhata AI Assistant',
      rawVoiceCommand: parsedTxn.rawTranscript
    });

    try {
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
    } catch (e) {}

    // Mark as added
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, isAdded: true } : m));

    const isCredit = parsedTxn.intent === 'credit';
    const actionLabel = isCredit ? 'उधार' : 'पेमेंट';

    const confirmMsg = {
      id: `ai_txn_added_${Date.now()}`,
      sender: 'ai',
      text: `✅ **${parsedTxn.customerName}** के खाते में **₹${parsedTxn.amount.toLocaleString('en-IN')}** का **${actionLabel}** सुरक्षित दर्ज हो गया है!`,
      speechText: `${parsedTxn.customerName} के खाते में ${parsedTxn.amount} रुपये दर्ज हो गए हैं।`,
      actionType: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, confirmMsg]);

    if (speakBackEnabled) {
      playSpeech(`${parsedTxn.customerName} के खाते में ${parsedTxn.amount} रुपये दर्ज हो गए हैं।`);
    }
  };

  const handleExecuteTxn = (parsedTxn) => {
    setModalPayload({
      rawText: parsedTxn.rawTranscript,
      parsed: parsedTxn,
      customer: parsedTxn.customer,
      customerId: parsedTxn.customerId,
      customerName: parsedTxn.customerName,
      isNewCustomer: parsedTxn.isNewCustomer,
      amount: parsedTxn.amount,
      type: parsedTxn.intent,
      items: parsedTxn.items,
      itemsString: parsedTxn.itemsString,
      paymentMethod: parsedTxn.paymentMethod,
      dueDate: parsedTxn.dueDate,
      notes: 'Added via BolKhata AI Assistant'
    });
    onClose();
    setActiveModal('confirm');
  };

  const handleSendReminder = (customer) => {
    setModalPayload({ customer });
    onClose();
    setActiveModal('whatsapp_reminder');
  };

  const handleOpenLedger = (customerId) => {
    setSelectedCustomerId(customerId);
    onClose();
    setActiveModal('customer_ledger');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg h-[92vh] flex flex-col overflow-hidden">
        {/* Chat Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 shadow-inner">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold flex items-center gap-1.5">
                  <span>बोलखाता AI मुंशी</span>
                  {isSpeaking ? (
                    <span className="text-[10px] bg-amber-400 text-amber-950 font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse shadow-xs">
                      <Volume2 className="w-3 h-3" />
                      <span>बोल रही हूँ...</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-900/60 border border-emerald-400/30 px-2 py-0.5 rounded-full font-semibold">
                      महिला आवाज़
                    </span>
                  )}
                </h2>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                आपकी दुकान का पर्सनल AI अकाउंटेंट
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Female Voice Test Button */}
            <button
              onClick={() => {
                setSpeakBackEnabled(true);
                playSpeech('नमस्ते! मैं आपकी बोलखाता AI मुंशी हूँ। आपकी दुकान का हिसाब-किताब तैयार है।');
              }}
              className="px-2.5 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-[11px] font-bold text-white flex items-center gap-1 transition shadow-2xs"
              title="महिला आवाज़ टेस्ट करें (Test Female Voice)"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
              <span className="hidden sm:inline">आवाज़ टेस्ट</span>
              <span className="sm:hidden">टेस्ट</span>
            </button>

            {/* Speak Back Toggle */}
            <button
              onClick={() => setSpeakBackEnabled(prev => !prev)}
              className={`p-2 rounded-xl transition ${
                speakBackEnabled 
                  ? 'bg-emerald-800 text-white border border-emerald-500/40' 
                  : 'text-emerald-200 hover:bg-emerald-600/50'
              }`}
              title={speakBackEnabled ? 'बोलकर जवाब देना चालू है (Voice ON)' : 'बोलकर जवाब बंद है (Voice OFF)'}
            >
              {speakBackEnabled ? <Volume2 className="w-4 h-4 text-emerald-300" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-emerald-600 text-emerald-100 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className={`flex gap-2.5 max-w-[88%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user' 
                    ? 'bg-slate-800 text-white' 
                    : 'bg-emerald-600 text-white shadow-xs'
                }`}>
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`rounded-2xl p-3.5 shadow-2xs text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}>
                  {/* Text content with bold formatting */}
                  <div className="whitespace-pre-wrap font-sans">
                    {msg.text.split('\n').map((line, idx) => (
                      <p key={idx} className={idx > 0 ? 'mt-1' : ''}>
                        {line.split('**').map((chunk, cIdx) => 
                          cIdx % 2 === 1 ? <strong key={cIdx} className="font-bold">{chunk}</strong> : chunk
                        )}
                      </p>
                    ))}
                  </div>

                  {/* ACTION CARD 1: Transaction Confirm Card */}
                  {msg.actionType === 'transaction_confirm' && msg.parsedTxn && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-emerald-900">{msg.parsedTxn.customerName}</span>
                        <span className={`text-sm font-black ${
                          msg.parsedTxn.intent === 'credit' ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          ₹{msg.parsedTxn.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      {msg.isAdded ? (
                        <div className="w-full py-2 bg-emerald-600 text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-xs">
                          <Check className="w-3.5 h-3.5" />
                          <span>खाते में सुरक्षित दर्ज हो गया!</span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleExecuteTxnDirectly(msg.id, msg.parsedTxn)}
                            className="py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center justify-center gap-1 shadow-xs transition"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>तुरंत दर्ज करें</span>
                          </button>
                          <button
                            onClick={() => handleExecuteTxn(msg.parsedTxn)}
                            className="py-2 bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100 font-bold rounded-lg flex items-center justify-center gap-1 transition"
                          >
                            <span>बदलें / देखें</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACTION CARD 4: New Customer Prompt Card */}
                  {msg.actionType === 'new_customer_prompt' && msg.data && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-300 text-xs space-y-2.5 shadow-2xs">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs sm:text-sm border-b border-emerald-200/80 pb-2">
                        <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <UserPlus className="w-3.5 h-3.5" />
                        </div>
                        <span>नया ग्राहक खाता (New Customer)</span>
                      </div>

                      <div className="space-y-1.5 text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">ग्राहक का नाम:</span>
                          <span className="font-extrabold text-slate-900 text-sm">{msg.data.name}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">फ़ोन नंबर:</span>
                          {msg.data.phone ? (
                            <span className="font-bold text-slate-800">{msg.data.phone}</span>
                          ) : (
                            <input
                              type="tel"
                              placeholder="फ़ोन नंबर (वैकल्पिक)"
                              defaultValue=""
                              id={`phone_input_${msg.id}`}
                              className="px-2 py-1 bg-white border border-emerald-200 rounded-lg text-xs w-36 text-right focus:outline-none focus:border-emerald-500 font-mono"
                            />
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 font-medium">आरंभिक बकाया:</span>
                          <span className="font-bold text-emerald-700">₹0 (Zero Due)</span>
                        </div>
                      </div>

                      {msg.isAdded ? (
                        <div className="py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs">
                          <Check className="w-4 h-4" />
                          <span>खाता बही में सफलतापूर्वक जुड़ गया!</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          <button
                            onClick={() => {
                              const phoneInput = document.getElementById(`phone_input_${msg.id}`);
                              const phoneVal = msg.data.phone || (phoneInput ? phoneInput.value : '');
                              handleAddNewCustomerDirectly(msg.id, msg.data.name, phoneVal);
                            }}
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>+ खाते में नया ग्राहक जोड़ें</span>
                          </button>

                          <button
                            onClick={() => {
                              onClose();
                              setModalPayload({
                                defaultTab: 'new_customer',
                                prefillName: msg.data.name || '',
                                prefillPhone: msg.data.phone || ''
                              });
                              setActiveModal('manual_entry');
                            }}
                            className="w-full py-1 text-center text-slate-500 hover:text-slate-700 text-[11px] font-semibold transition"
                          >
                            पूरा खाता फॉर्म खोलें (Open Form)
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ACTION CARD 5: New Customer with Transaction Card */}
                  {msg.actionType === 'new_customer_with_txn' && msg.data && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-white border border-emerald-300 text-xs space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-2">
                        <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs sm:text-sm">
                          <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <UserPlus className="w-3.5 h-3.5" />
                          </div>
                          <span>नया ग्राहक + लेन-देन</span>
                        </div>
                        <span className={`text-sm font-black ${
                          msg.data.type === 'credit' ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          ₹{msg.data.amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="space-y-1 text-slate-700">
                        <div className="flex justify-between">
                          <span className="text-slate-500">नाम:</span>
                          <strong className="text-slate-900">{msg.data.name}</strong>
                        </div>
                        {msg.data.phone && (
                          <div className="flex justify-between">
                            <span className="text-slate-500">मोबाइल:</span>
                            <strong className="text-slate-800">{msg.data.phone}</strong>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500">लेन-देन प्रकार:</span>
                          <strong className={msg.data.type === 'credit' ? 'text-red-600' : 'text-emerald-600'}>
                            {msg.data.type === 'credit' ? 'उधार दिया (Credit)' : 'जमा मिला (Payment)'}
                          </strong>
                        </div>
                      </div>

                      {msg.isAdded ? (
                        <div className="py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center gap-1.5 shadow-xs">
                          <Check className="w-4 h-4" />
                          <span>नया ग्राहक व लेन-देन सुरक्षित दर्ज हो गया!</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            handleExecuteTxnDirectly(msg.id, {
                              ...msg.parsedTxn,
                              customerName: msg.data.name,
                              phone: msg.data.phone
                            });
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl flex items-center justify-center gap-2 shadow-xs transition"
                        >
                          <Check className="w-4 h-4" />
                          <span>खाते में ग्राहक और लेन-देन जोड़ें</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* ACTION CARD 6: Open New Customer Form Card */}
                  {msg.actionType === 'open_new_customer_form' && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                      <button
                        onClick={() => {
                          onClose();
                          setModalPayload({ defaultTab: 'new_customer' });
                          setActiveModal('manual_entry');
                        }}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>+ नया ग्राहक खाता फॉर्म खोलें</span>
                      </button>
                    </div>
                  )}

                  {/* ACTION CARD 2: Customer Balance Query Card */}
                  {msg.actionType === 'customer_balance' && msg.customer && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-800">{msg.customer.name}</span>
                        <span className={`text-sm font-black ${
                          msg.customer.balance > 0 ? 'text-red-600' : 'text-emerald-600'
                        }`}>
                          बकाया: ₹{msg.customer.balance.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {msg.customer.balance > 0 && (
                          <button
                            onClick={() => handleSendReminder(msg.customer)}
                            className="py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center justify-center gap-1 text-[11px]"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>WhatsApp तकादा</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenLedger(msg.customer.id)}
                          className="py-1.5 px-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg font-bold flex items-center justify-center gap-1 text-[11px]"
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>खाता बही</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ACTION CARD 3: Overdue Customers Card */}
                  {msg.actionType === 'overdue_list' && msg.data?.overdueList && (
                    <div className="mt-3 space-y-1.5">
                      {msg.data.overdueList.map(c => (
                        <div key={c.id} className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 block">{c.name}</span>
                            <span className="text-[10px] text-red-600 font-semibold">₹{c.balance.toLocaleString('en-IN')} बाकी</span>
                          </div>
                          <button
                            onClick={() => handleSendReminder(c)}
                            className="p-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                          >
                            <Share2 className="w-3 h-3" />
                            <span>तकादा</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] mt-2 pt-1 border-t border-slate-100/60 text-slate-400">
                    {msg.sender === 'ai' ? (
                      <button
                        onClick={() => playSpeech(msg.speechText || msg.text)}
                        className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 transition active:scale-95"
                        title="महिला आवाज़ में सुनें"
                      >
                        <Volume2 className="w-3 h-3 text-emerald-600" />
                        <span>सुनें (Listen)</span>
                      </button>
                    ) : <span />}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-slate-500 italic">
              <Bot className="w-4 h-4 text-emerald-600 animate-spin" />
              <span>मुंशी जी हिसाब जांच रहे हैं...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Prompt Chips */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {[
            'नया ग्राहक जोड़ो राहुल',
            'कुल कितना बकाया है?',
            'आज कितना पेमेंट आया?',
            'आज मोहन ने 1000 लिया',
            'मोहन लाल का हिसाब बताओ',
            'किसका पेमेंट लेट है?'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 text-xs font-semibold active:scale-95 transition"
            >
              💬 {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          {/* Voice button */}
          <button
            onClick={handleVoiceInput}
            className={`p-3 rounded-2xl transition active:scale-95 shrink-0 ${
              isListening 
                ? 'bg-red-500 text-white ring-4 ring-red-100 animate-pulse' 
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
            title="बोलकर पूछें (Voice Query)"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            placeholder="मुंशी जी से कुछ भी पूछें (उदा: आज मोहन ने 1000 लिया)..."
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-300 focus:outline-none focus:border-emerald-600 font-medium"
          />

          {/* Send button */}
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 text-white transition active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
