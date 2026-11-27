import React from 'react';
import { 
  PlayCircle, 
  ArrowUpRight, 
  ShoppingBag, 
  Smartphone, 
  Banknote, 
  HelpCircle, 
  UserPlus, 
  Zap 
} from 'lucide-react';
import { DEMO_VOICE_COMMANDS } from '../data/mockData';
import { useKhata } from '../context/KhataContext';
import { parseVoiceInput } from '../utils/voiceParser.js';
import { speakText } from '../utils/soundEffects.js';

export default function DemoCommandsBar() {
  const { 
    customers, 
    setActiveModal, 
    setModalPayload, 
    checkDuplicateTransaction,
    shopSettings 
  } = useKhata();

  const handleRunCommand = (command) => {
    const text = command.text;
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
        speakText(speakMsg, 'hi-IN');
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
        notes: `Demo voice command: "${text}"`,
        isDuplicate: dupCheck.isDuplicate,
        duplicateMessage: dupCheck.message || ''
      });
      setActiveModal('confirm');
    }
  };

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'ArrowUpRight': return <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />;
      case 'ShoppingBag': return <ShoppingBag className="w-3.5 h-3.5 text-red-500" />;
      case 'Smartphone': return <Smartphone className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Banknote': return <Banknote className="w-3.5 h-3.5 text-emerald-600" />;
      case 'HelpCircle': return <HelpCircle className="w-3.5 h-3.5 text-blue-600" />;
      case 'UserPlus': return <UserPlus className="w-3.5 h-3.5 text-amber-600" />;
      default: return <PlayCircle className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200">
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>Demo Voice Commands (Click to Test)</span>
        </div>
        <span className="text-[11px] text-slate-500">Instant AI parse without mic</span>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200">
        {DEMO_VOICE_COMMANDS.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => handleRunCommand(cmd)}
            className="flex items-center gap-2 whitespace-nowrap bg-white hover:bg-slate-100/90 active:scale-95 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-left shadow-2xs transition group shrink-0"
            title={cmd.text}
          >
            <div className="p-1 rounded-md bg-slate-50 group-hover:bg-white border border-slate-100">
              {getIcon(cmd.icon)}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-800">{cmd.label}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${cmd.color}`}>
                  {cmd.badge}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[210px]">
                "{cmd.text}"
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
