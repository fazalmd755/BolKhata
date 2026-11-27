// BolKhata Conversational AI Engine (बोलखाता मुंशी)
// Real-time context-aware ledger reasoning for Indian shopkeepers

import { parseVoiceInput } from './voiceParser.js';
import { isOverdue, getDaysOverdue, formatDisplayDate } from './dateUtils.js';

/**
 * Extracts new customer intent, name and phone from conversational queries
 */
export function extractNewCustomerIntent(query) {
  if (!query) return null;
  const lower = query.toLowerCase().trim();

  const isNewCustTrigger = 
    /\b(new|naya|naye|nayi|नया|नए|नई)\s+(customer|grahak|khata|account|party|कस्टमर|ग्राहक|खाता|पार्टी)\b/i.test(lower) ||
    /\b(add|jodo|jodna|banao|banana|kholo|create)\s+.*?\b(customer|grahak|khata|कस्टमर|ग्राहक|खाता)\b/i.test(lower) ||
    /\b(customer|grahak|khata|कस्टमर|ग्राहक|खाता)\b.*?\b(add|jodo|banao|banana|kholo)\b/i.test(lower) ||
    /(?:नया|नए|नई)\s*(?:ग्राहक|कस्टमर|खाता)/.test(lower) ||
    /(?:ग्राहक|कस्टमर|खाता)\s*(?:जोड़ो|बनाओ|खोलो|बनाना)/.test(lower);

  if (!isNewCustTrigger) return null;

  // Extract 10-digit phone number if present
  let phone = '';
  const phoneMatch = lower.match(/(?:\+?91[\-\s]?)?([6-9]\d{9})\b/);
  if (phoneMatch) {
    phone = phoneMatch[1];
  }

  // Remove phone, trigger words and filler verbs to isolate customer name
  let nameText = query
    .replace(/(?:\+?91[\-\s]?)?[6-9]\d{9}\b/g, '')
    .replace(/\b(phone|mobile|mob|no|number|फोन|मोबाइल|नंबर)\b/gi, '')
    .replace(/\b(new\s+customer|naya\s+customer|naya\s+grahak|naye\s+grahak|nayi\s+party|new\s+party|new\s+khata|naya\s+khata)\b/gi, '')
    .replace(/(?:नया|नए|नई)\s*(?:ग्राहक|कस्टमर|खाता|पार्टी)/g, '');

  // Isolate name before 'ko', 'ne', 'se', 'ka' or Devanagari markers (को, ने, से, का)
  const markerMatch = nameText.match(/^(.+?)(?:\s+(?:ko|ne|ka|ke|se)\b|(?:\s+|^)(?:को|ने|का|के|से)(?:\s+|$))/i);
  if (markerMatch && markerMatch[1]) {
    nameText = markerMatch[1];
  }

  nameText = nameText
    .replace(/\b(add\s+karo|add\s+kare|add\s+karna|add|jodo|jodna|banao|banana|banaye|kholo|kholna|khole|create|karna\s+hai|karo|kare|hai|hoga|chahiye)\b/gi, '')
    .replace(/(?:जोड़ो|जोड़ना|बनाओ|बनाना|खोलो|खोलना|करना\s*है|करो|चाहिए|होगा)/g, '')
    .replace(/\b(ek|ko|ka|ki|ke|bhi|naam|name)\b/gi, '')
    .trim();

  // Clean trailing punctuation and whitespace
  nameText = nameText.replace(/[^\w\s\u0900-\u097F]/g, ' ').trim();
  nameText = nameText.replace(/\s+/g, ' ');

  // Filter out noisy single-word matches
  if (nameText.length <= 1 || /^(naam|name|number|customer|grahak|khata|add|hai|banana)$/i.test(nameText)) {
    nameText = '';
  }

  // Capitalize name
  let extractedName = nameText ? nameText.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : '';

  return {
    isNewCustomer: true,
    name: extractedName || '',
    phone: phone || ''
  };
}

/**
 * Processes natural language conversational queries about the shop's finances
 * and returns rich conversational responses, speech text, and actionable cards.
 */
export function processConversationalQuery({
  query,
  customers = [],
  transactions = [],
  shopSettings = {}
}) {
  if (!query || !query.trim()) {
    return {
      text: "नमस्ते! मैं आपका डिजिटल मुंशी हूँ। आप मुझसे दुकान के हिसाब-किताब के बारे में कुछ भी पूछ सकते हैं, जैसे: 'आज कितना पेमेंट आया?' या 'कुल कितना बकाया है?'",
      speechText: "नमस्ते! आप मुझसे दुकान के हिसाब के बारे में कुछ भी पूछ सकते हैं।",
      actionType: null
    };
  }

  const lower = query.toLowerCase().trim();

  // Parse using voice parser first to check for customer names, amounts, and intent
  const parsedTxn = parseVoiceInput(query, customers);

  // If 'ek' was matched as amount 1 in "ek naya customer" or "ek naya khata", ignore it as an amount!
  if (parsedTxn.amount === 1 && /\b(ek|एक)\s+(naya|naye|nayi|new|नया|नए|नई)\b/i.test(query)) {
    parsedTxn.amount = 0;
  }

  // 1. New Customer Intent (e.g. "new customer add karo rahul", "naya customer amit 9876543210", "नया ग्राहक जोड़ो राहुल")
  const newCustIntent = extractNewCustomerIntent(query);
  if (newCustIntent && newCustIntent.isNewCustomer) {
    // If they also included a transaction amount (e.g. "naya customer rahul 500 udhar")
    if (parsedTxn.amount > 0) {
      const isCredit = parsedTxn.intent === 'credit';
      const custName = newCustIntent.name || parsedTxn.customerName;
      const actionWord = isCredit ? 'उधार (Credit)' : 'जमा (Payment)';

      return {
        text: `मैंने नए ग्राहक **${custName}** के लिए **₹${parsedTxn.amount.toLocaleString('en-IN')}** का **${actionWord}** तैयार कर लिया है।${newCustIntent.phone ? `\n• मोबाइल: ${newCustIntent.phone}` : ''}\n\nक्या आप इस नए ग्राहक को सीधे खाते में जोड़ना चाहते हैं?`,
        speechText: `नए ग्राहक ${custName} के लिए ${parsedTxn.amount} रुपये का ${isCredit ? 'उधार' : 'पेमेंट'} तैयार है।`,
        actionType: 'new_customer_with_txn',
        data: {
          name: custName,
          phone: newCustIntent.phone || '',
          amount: parsedTxn.amount,
          type: parsedTxn.intent,
          items: parsedTxn.items
        },
        parsedTxn: {
          ...parsedTxn,
          customerName: custName,
          phone: newCustIntent.phone || '',
          isNewCustomer: true
        }
      };
    }

    if (newCustIntent.name) {
      const custName = newCustIntent.name;
      const existing = customers.find(c => c.name.toLowerCase() === custName.toLowerCase());
      if (existing) {
        return {
          text: `ग्राहक **${existing.name}** पहले से ही आपके खाते में मौजूद हैं। इनका वर्तमान बकाया **₹${existing.balance.toLocaleString('en-IN')}** है।\n\nआप नीचे दिए बटन से इनका खाता बही देख सकते हैं या WhatsApp तकादा भेज सकते हैं।`,
          speechText: `${existing.name} पहले से ही आपके खाते में मौजूद हैं।`,
          actionType: 'customer_balance',
          customer: existing,
          data: { customer: existing }
        };
      }

      return {
        text: `समझ गया! नए ग्राहक **${custName}** का खाता तैयार किया गया है।${newCustIntent.phone ? `\n• मोबाइल नंबर: **${newCustIntent.phone}**` : ''}\n• आरंभिक बकाया: **₹0**\n\nक्या आप इन्हें सीधे खाता बही में जोड़ना चाहते हैं?`,
        speechText: `नए ग्राहक ${custName} का खाता तैयार है।`,
        actionType: 'new_customer_prompt',
        data: {
          name: custName,
          phone: newCustIntent.phone || '',
          openingBalance: 0
        }
      };
    } else {
      return {
        text: `ज़रूर! नए ग्राहक का खाता खोलने के लिए आप उनका नाम बोल सकते हैं, जैसे:\n• *"नया ग्राहक राहुल शर्मा"* या\n• *"नया ग्राहक अमित फोन 9876543210"*\n\nया नीचे दिए बटन पर क्लिक करके नया खाता फॉर्म खोलें।`,
        speechText: "नए ग्राहक का नाम बताएं या नीचे दिए बटन से फॉर्म खोलें।",
        actionType: 'open_new_customer_form',
        data: {}
      };
    }
  }

  // 2. Conversational Transaction Command (e.g. "Aaj Mohan ne 1000 lia", "Suresh ko 200 ka tel diya", "Ramesh ne 500 diye")
  if (parsedTxn.amount > 0 && parsedTxn.intent !== 'balance_query') {
    const isCredit = parsedTxn.intent === 'credit';
    const actionWord = isCredit ? 'उधार (Credit)' : 'जमा (Payment)';
    const custName = parsedTxn.customerName;

    const reply = `समझ गया! **${custName}** के लिए **₹${parsedTxn.amount.toLocaleString('en-IN')}** का **${actionWord}** तैयार किया गया है।\n\n` +
      `• लेन-देन प्रकार: ${parsedTxn.typeLabel}\n` +
      `• राशि: ₹${parsedTxn.amount.toLocaleString('en-IN')}\n` +
      `${parsedTxn.items.length > 0 ? `• सामान: ${parsedTxn.items.join(', ')}\n` : ''}` +
      `क्या आप इसे खाते में सुरक्षित दर्ज करना चाहते हैं?`;

    return {
      text: reply,
      speechText: `${custName} के खाते में ${parsedTxn.amount} रुपये का ${isCredit ? 'उधार' : 'पेमेंट'} तैयार है।`,
      actionType: 'transaction_confirm',
      parsedTxn,
      data: parsedTxn
    };
  }

  // 2. Specific Customer Balance Query (e.g. "Mohan ka kya hisaab hai", "Ramesh ka kitna baaki hai", "Suresh ka khata")
  const matchedCustomer = parsedTxn.customer || (
    parsedTxn.customerName && parsedTxn.matchedKnownCustomer
      ? customers.find(c => c.name.toLowerCase().includes(parsedTxn.customerName.toLowerCase()))
      : customers.find(c => {
          const parts = c.name.toLowerCase().split(' ');
          return parts.some(p => p.length >= 3 && lower.includes(p));
        })
  );

  if (matchedCustomer && (parsedTxn.intent === 'balance_query' || /hisaab|hisab|kitna|baaki|baki|bakaya|khata|udhar|udhaar|बकाया|बाकी|हिसाब/i.test(lower))) {
    const cust = matchedCustomer;
    const isLate = cust.dueDate && isOverdue(cust.dueDate) && cust.balance > 0;
    const days = cust.dueDate ? getDaysOverdue(cust.dueDate) : 0;

    let reply = `**${cust.name}** जी का कुल बकाया हिसाब **₹${cust.balance.toLocaleString('en-IN')}** है।`;
    if (cust.balance <= 0) {
      reply += ` इनका पूरा हिसाब चुकता है। कोई बकाया नहीं है।`;
    } else if (isLate) {
      reply += ` ⚠️ ध्यान दें: इनका पेमेंट **${days} दिन से अतिदेय (Overdue)** है।`;
    } else {
      reply += ` अंतिम लेन-देन ${formatDisplayDate(cust.lastTransactionDate)} को हुआ था।`;
    }

    return {
      text: reply,
      speechText: `${cust.name} का कुल हिसाब ${cust.balance} रुपये बाकी है।`,
      actionType: 'customer_balance',
      customer: cust,
      data: { customer: cust }
    };
  }

  // 3. Today's Collections Query (आज कितना पेमेंट आया / आज की वसूली)
  const isTodayCollectionQuery = 
    /\b(aaj|today)\b.*?\b(kitna|payment|aaya|mila|jama|vasooli|vasool)\b/i.test(lower) ||
    /\b(kitna\s+(payment|jama|aaya)\s*(hai|hua)?)\b/i.test(lower) ||
    /(?:आज).*?(?:कितना|पेमेंट|आया|मिला|जमा|वसूली)/.test(lower);

  if (isTodayCollectionQuery && !/(?:lia|liya|diya|उधार|lia)/i.test(lower)) {
    const todayStr = new Date().toISOString().split('T')[0];
    const todayPayments = transactions.filter(t => t.type === 'payment' && t.date.startsWith(todayStr));
    const totalCollected = todayPayments.reduce((sum, t) => sum + Number(t.amount), 0);

    if (totalCollected === 0) {
      return {
        text: `आज अभी तक कोई पेमेंट जमा नहीं हुआ है। कुल बकाया खाता **₹${customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0).toLocaleString('en-IN')}** है।`,
        speechText: "आज अभी तक कोई पेमेंट जमा नहीं हुआ है।",
        actionType: 'today_collections',
        data: { totalCollected: 0, count: 0 }
      };
    }

    const payerList = todayPayments.map(p => `${p.customerName} (₹${p.amount} ${p.paymentMethod || 'Cash'})`).join(', ');
    const reply = `आज आपकी दुकान पर कुल **₹${totalCollected.toLocaleString('en-IN')}** का पेमेंट आया है (${todayPayments.length} एंट्रीज)।\n\nविवरण: ${payerList}`;

    return {
      text: reply,
      speechText: `आज कुल ${totalCollected.toLocaleString('en-IN')} रुपये का पेमेंट आया है।`,
      actionType: 'today_collections',
      data: { totalCollected, count: todayPayments.length, todayPayments }
    };
  }

  // 4. Overdue / Defaulters Query (किसका पेमेंट लेट है / किसको तकादा भेजना है)
  const isOverdueQuery = 
    /\b(kiska|kisko|kaun|who|defaulter|overdue|late)\b.*?\b(payment|late|takada|overdue|baaki)\b/i.test(lower) ||
    /(?:किसका|कौन|लेट|तकादा|अतिदेय)/.test(lower);

  if (isOverdueQuery) {
    const overdueList = customers.filter(c => c.balance > 0 && c.dueDate && isOverdue(c.dueDate));
    if (overdueList.length === 0) {
      return {
        text: "बधाई हो! वर्तमान में किसी भी ग्राहक का खाता अतिदेय (Overdue) नहीं है। सभी लेन-देन समय पर हैं।",
        speechText: "वर्तमान में किसी भी ग्राहक का खाता लेट नहीं है।",
        actionType: 'overdue_list',
        data: { overdueList: [] }
      };
    }

    const names = overdueList.map(c => `• **${c.name}**: ₹${c.balance.toLocaleString('en-IN')} (${getDaysOverdue(c.dueDate)} दिन लेट)`).join('\n');
    const reply = `वर्तमान में **${overdueList.length} ग्राहकों** की देय तिथि बीत चुकी है:\n\n${names}\n\nआप नीचे दिए बटन से सीधे WhatsApp तकादा भेज सकते हैं।`;

    return {
      text: reply,
      speechText: `${overdueList.length} ग्राहकों का पेमेंट लेट है।`,
      actionType: 'overdue_list',
      data: { overdueList }
    };
  }

  // 5. Total Outstanding Udhaar Query (कुल कितना बकाया है / कितना पैसा लेना है)
  const isTotalDueQuery = 
    /\b(kitna|total|kul)\b.*?\b(bakaya|baaki|baki|udhaar|udhar|paisa|lena)\b/i.test(lower) ||
    /\b(kitna\s+(bakaya|baaki|lena|udhaar)\s*(hai|hua)?)\b/i.test(lower) ||
    /(?:कुल|कितना|टोटल).*?(?:बकाया|बाकी|उधार|लेना)/.test(lower);

  if (isTotalDueQuery) {
    const totalDue = customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0);
    const debtorsCount = customers.filter(c => c.balance > 0).length;
    const topDebtor = [...customers].sort((a, b) => b.balance - a.balance)[0];

    let reply = `आपकी दुकान पर ${debtorsCount} ग्राहकों पर कुल **₹${totalDue.toLocaleString('en-IN')}** का बकाया उधार है।`;
    if (topDebtor && topDebtor.balance > 0) {
      reply += ` सबसे ज्यादा उधार **${topDebtor.name}** जी पर **₹${topDebtor.balance.toLocaleString('en-IN')}** बाकी है।`;
    }

    return {
      text: reply,
      speechText: `आपकी दुकान पर कुल ${totalDue.toLocaleString('en-IN')} रुपये का बकाया उधार है।`,
      actionType: 'total_due',
      data: { totalDue, debtorsCount, topDebtor }
    };
  }

  // 6. General Greetings & Help
  if (/\b(namaste|hello|hi|kaise ho|ram ram|kya haal hai|help|madad)\b/i.test(lower)) {
    return {
      text: `राम-राम! मैं **${shopSettings.shopName || 'बोलखाता'}** का AI मुंशी हूँ।\n\nआप मुझसे बोलकर या लिखकर अपनी दुकान का कोई भी हिसाब पूछ सकते हैं:\n• *"कुल कितना बकाया है?"*\n• *"आज कितना पेमेंट आया?"*\n• *"मोहन लाल का हिसाब बताओ"*\n• *"आज सुरेश ने 1000 रुपये लिए"*\n• *"किस-किस का तकादा बाकी है?"*`,
      speechText: "राम-राम! आप मुझसे अपनी दुकान का कोई भी हिसाब पूछ सकते हैं।",
      actionType: null
    };
  }

  // 7. General Fallback
  return {
    text: `मुझे आपका सवाल समझ आया। वर्तमान में दुकान का कुल बकाया उधार **₹${customers.reduce((sum, c) => sum + (c.balance > 0 ? c.balance : 0), 0).toLocaleString('en-IN')}** है।\n\nअधिक सटीक जानकारी के लिए आप किसी ग्राहक का नाम लेकर पूछ सकते हैं, जैसे: *"मोहन लाल का हिसाब बताओ"* या *"आज का पेमेंट कितना हुआ?"*`,
    speechText: "आप किसी ग्राहक का नाम लेकर पूछ सकते हैं, जैसे मोहन का हिसाब बताओ।",
    actionType: null
  };
}
