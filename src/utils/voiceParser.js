import { parseRelativeDate, formatDateISO } from './dateUtils.js';
import { parseHindiSpokenNumber, convertDevanagariNumerals } from './hindiNumberParser.js';

// Devanagari digit map
const DEVANAGARI_DIGITS = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

// Hindi words to numbers map
const HINDI_NUMBER_WORDS = {
  // Singles & tens
  ek: 1, do: 2, teen: 3, chaar: 4, char: 4, paanch: 5, panch: 5, chhah: 6, cheh: 6, saat: 7, aath: 8, nau: 9, das: 10,
  gyarah: 11, barah: 12, terah: 13, chaudah: 14, pandrah: 15, solah: 16, satrah: 17, atharah: 18, athara: 18, unnis: 19,
  bees: 20, ikkis: 21, baais: 22, teis: 23, chaubis: 24, pachis: 25, pachchis: 25, chabbis: 26, sattais: 27, atthais: 28, untees: 29,
  tees: 30, iktis: 31, battis: 32, taintis: 33, chauntis: 34, paintis: 35, chattis: 36, saintis: 37, adhtis: 38, untalis: 39,
  chalis: 40, iktalis: 41, bayalis: 42, taintalis: 43, chawalis: 44, paitalis: 45, chiyalis: 46, saintalis: 47, adhtalis: 48, unchas: 49,
  pachas: 50,
};

const COMMON_KIRANA_ITEMS = [
  'sarson tel', 'refined tel', 'tel', 'mustard oil', 'oil',
  'cheeni', 'chini', 'sugar',
  'atta', 'chawal', 'rice', 'wheat',
  'daal', 'dal', 'arhar daal', 'moong daal', 'chana daal',
  'doodh', 'milk', 'dahi', 'paneer', 'butter', 'makhan',
  'chai patti', 'chai', 'tea',
  'ghee', 'deshi ghee',
  'masala', 'mirchi', 'haldi', 'dhaniya', 'namak', 'salt',
  'sabun', 'soap', 'surf', 'detergent', 'wheel', 'vim bar',
  'biskut', 'biscuit', 'parle g', 'namkeen', 'bhujia',
  'colddrink', 'pepsi', 'coke', 'thums up', 'frooti',
  'maggi', 'noodles', 'pasta',
  'shampoo', 'toothpaste', 'paste', 'colgate',
  'bread', 'ande', 'eggs', 'egg',
  'rashan', 'ration', 'kirana', 'samaan'
];

/**
 * Normalizes input text: replaces devanagari numerals, de-slurs rapid speech compounds
 */
export function normalizeText(text) {
  if (!text) return '';
  let str = text;
  for (const [dev, eng] of Object.entries(DEVANAGARI_DIGITS)) {
    str = str.replaceAll(dev, eng);
  }

  // De-slur rapid speech compounds (splits connected postpositions and fast verbs)
  str = str
    // Separate attached postpositions from names (e.g. "rameshko" -> "ramesh ko", "nitinse" -> "nitin se")
    .replace(/([a-zA-Z\u0900-\u097F]{2,})(ko|ne|se|ka|ke|ki|bhai|bhaiya|ji)\b/gi, '$1 $2')
    // Slurred fast action verbs in Hinglish
    .replace(/\b(udhar|udhaar)(diya|diye|de|do)\b/gi, '$1 $2')
    .replace(/\b(jama)(kiya|kiye|kar|karo|mila|mile|hua)\b/gi, '$1 $2')
    .replace(/\b(mil)(gaya|gya|gaye|gye|raha)\b/gi, '$1 $2')
    .replace(/\b(aa)(gaya|gya|gaye|gye)\b/gi, '$1 $2')
    .replace(/\b(de)(diya|diye)\b/gi, '$1 $2')
    .replace(/\b(le)(liya|liye|gaya|gaye)\b/gi, '$1 $2')
    .replace(/\b(khate)(me|mein|pe)\b/gi, '$1 $2')
    .replace(/\b(bhej)(diya|diye)\b/gi, '$1 $2')
    .replace(/\b(likh)(lo|do|le)\b/gi, '$1 $2')
    // Devanagari slurred words
    .replace(/([\u0900-\u097F]{2,})(को|ने|से|का|के|की|भाई|जी)\b/g, '$1 $2')
    .replace(/(उधार)(दिया|दिए|दो)/g, '$1 $2')
    .replace(/(जमा)(किया|किए|करो|मिला|मिले)/g, '$1 $2')
    .replace(/(मिल)(गया|गए)/g, '$1 $2')
    .replace(/(आ)(गया|गए)/g, '$1 $2')
    .replace(/(दे)(दिया|दिए)/g, '$1 $2')
    .replace(/(खाते)(में|पे)/g, '$1 $2');

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts numeric amount from Hindi / Hinglish / English voice transcription
 */
export function extractAmount(text) {
  if (!text) return { amount: null, rawMatch: null };
  const num = parseHindiSpokenNumber(text);
  if (num && num > 0) {
    return { amount: num, rawMatch: String(num) };
  }
  return { amount: null, rawMatch: null };
}

/**
 * Known Hindi Devanagari to English phonetic mapping for common customer names
 */
const HINDI_NAME_MAP = {
  'सुरेश': 'Suresh Sharma',
  'सुरेश शर्मा': 'Suresh Sharma',
  'रमेश': 'Ramesh Kirana',
  'रमेश किराना': 'Ramesh Kirana',
  'रमेश भाई': 'Ramesh Kirana',
  'मोहन': 'Mohan Lal',
  'मोहन लाल': 'Mohan Lal',
  'अनिता': 'Anita Devi',
  'अनीता': 'Anita Devi',
  'राजेश': 'Rajesh Verma',
  'विक्रम': 'Vikram Singh',
  'पूजा': 'Pooja Ji',
};

/**
 * Determines intent: 'credit', 'payment', or 'balance_query'
 */
export function classifyIntent(text) {
  if (!text) return { intent: 'unknown', confidence: 0, typeLabel: 'Unknown' };
  const lower = text.toLowerCase();

  // 1. Balance Query Check:
  // e.g. "kitna udhaar baaki hai", "kitna baaki hai", "balance batao", "kitna paisa lena hai", "hisaab batao", "kitna hua"
  // Devanagari: "कितना बाकी है", "हिसाब बताओ", "कितना उधार है", "बैलेंस कितना है"
  const isBalanceQuery = 
    /\b(kitna|kitne|kya|batao|dikhao|check)\b.*?\b(udhaar|baaki|baki|hisaab|hisab|balance|paisa|rupaye|lena|dena)\b/i.test(lower) ||
    /\b(balance|hisaab|hisab)\s*(batao|check|bata|kitna|kya hai|bataiye|dikhao)\b/i.test(lower) ||
    /\b(kitna\s+(udhaar|baaki|baki|paisa|lena)\s*(hai|hua|banta)?)\b/i.test(lower) ||
    /\b(hisaab\s+kya\s+hai|hisaab\s+kitna\s+hai)\b/i.test(lower) ||
    (/(?:कितना|कितने|हिसाब|बैलेंस)/.test(lower) && /(?:बाकी|हिसाब|बैलेंस|लेना|देना|बताओ|दिखाओ|है|हुआ)/.test(lower));

  if (isBalanceQuery) {
    return {
      intent: 'balance_query',
      confidence: 0.98,
      typeLabel: 'Balance Query (हिसाब पूछताछ)'
    };
  }

  // 2. High-Priority Payment Matchers
  // Words that indicate cash or money received/returned
  const paymentWords = [
    // English / Hinglish payment got markers
    'got', 'got payment', 'payment got', 'received', 'receive', 'paid', 'payment', 'pay kiya',
    'mila', 'mile', 'mil gaya', 'mil gya', 'mil gaye', 'mila hai', 'mile hai',
    'jama', 'jama kiya', 'jama kiye', 'jama kar diye', 'jama mila', 'jama hua', 'jama karwaya',
    'aaya', 'aaye', 'aa gaya', 'aagaya', 'aa gaye', 'aagaye', 'paise aaye', 'rupaye aaye',
    'upi', 'phonepe', 'gpay', 'google pay', 'paytm', 'bhim', 'scanner',
    'cash mila', 'nagad mila', 'cash diya', 'cash jama', 'nagad jama',
    'chukta', 'chukta kiya', 'vasool', 'vasooli', 'settle', 'settled', 'cleared', 'clear', 'vapis', 'lautaye',
    // Devanagari payment keywords
    'जमा', 'जमा किए', 'जमा किया', 'जमा मिला', 'मिले', 'मिला', 'मिल गया', 'मिल गए', 'आए', 'आया', 'आ गए', 'आ गया',
    'भुगतान', 'पेमेंट', 'पे', 'यूपीआई', 'फोनपे', 'गूगल पे', 'पेटीएम', 'नकद', 'कैश', 'चुकता', 'वसूल', 'वापस'
  ];

  const hasPaymentKeyword = paymentWords.some(w => {
    // Check regex boundary or direct substring for devanagari
    if (/[\u0900-\u097F]/.test(w)) {
      return lower.includes(w);
    }
    return new RegExp(`\\b${w}\\b`, 'i').test(lower);
  });

  // Check subject marker "ne ... diya" or "se ... mila" or "se ... aaye"
  const hasPaymentPattern = 
    /\b(se|from)\b.*?\b(mila|mile|aaye|aaya|mil gaya|received|got)\b/i.test(lower) ||
    /\b(ne)\b.*?\b(diye|diya|payment|jama|upi|bheje|kar diya)\b/i.test(lower) ||
    /\b(paid|received)\b/i.test(lower) ||
    /(?:से|ने).*?(?:मिले|मिला|दिए|दिया|जमा|आए)/.test(lower);

  // Credit keywords
  const hasExplicitCredit = 
    /\b(udhaar|udhar|baaki\s*likho|khata\s*likho|maal\s*diya|samaan\s*diya|samaan\s*liya|le\s*gaya|le\s*gaye|credit\s*diya)\b/i.test(lower) ||
    /(?:उधार|उधारी|खाता\s*लिखो|सामान\s*दिया|सामान\s*लिया|माल\s*दिया|उधार\s*दिया)/.test(lower);

  // If both udhaar and jama are mentioned (e.g. "udhaar chukta kiya" or "udhaar jama kiya") -> It's a PAYMENT!
  if (hasPaymentKeyword || hasPaymentPattern) {
    if (hasExplicitCredit && /\b(chukta|jama|cleared|settle|vapis|de\s*diya)\b/i.test(lower)) {
      return {
        intent: 'payment',
        confidence: 0.95,
        typeLabel: 'Payment Received (जमा मिला)'
      };
    }
    if (!hasExplicitCredit || /\b(jama|paid|payment|upi|mila|mile|got|received)\b/i.test(lower)) {
      return {
        intent: 'payment',
        confidence: 0.96,
        typeLabel: 'Payment Received (जमा मिला)'
      };
    }
  }

  // 3. Credit Given Matchers
  // e.g. "Ramesh ko 500 udhaar diya", "Suresh ko 450 ka samaan diya", "khate me likho"
  if (hasExplicitCredit) {
    return {
      intent: 'credit',
      confidence: 0.95,
      typeLabel: 'Credit Given (उधार दिया)'
    };
  }

  // "ko ... diya / de diya" without "ne" or "se" -> Shopkeeper gave credit to customer
  if (/\b(ko|to)\b/i.test(lower) && /\b(diye|diya|de diya|gave)\b/i.test(lower)) {
    return {
      intent: 'credit',
      confidence: 0.90,
      typeLabel: 'Credit Given (उधार दिया)'
    };
  }

  // If customer gave or shopkeeper received
  if (/\b(diye|diya|bheje)\b/i.test(lower) && /\b(ne|se)\b/i.test(lower)) {
    return { intent: 'payment', confidence: 0.92, typeLabel: 'Payment Received (जमा मिला)' };
  }

  return { intent: 'credit', confidence: 0.55, typeLabel: 'Credit Given (उधार दिया)' };
}

/**
 * Extracts customer name by checking known customers and grammar markers
 */
export function extractCustomerName(text, knownCustomers = []) {
  if (!text) return { customerName: '', matchedKnown: false, customerId: null };
  const lower = text.toLowerCase();

  // Step 0: Check Devanagari Name Map
  for (const [devName, mappedEng] of Object.entries(HINDI_NAME_MAP)) {
    if (text.includes(devName)) {
      const known = knownCustomers.find(c => c.name.toLowerCase().includes(mappedEng.toLowerCase()));
      return {
        customerName: known ? known.name : mappedEng,
        matchedKnown: Boolean(known),
        customer: known || null,
        customerId: known ? known.id : null
      };
    }
  }

  // Step 1: Match against known customers first
  for (const cust of knownCustomers) {
    const custLower = cust.name.toLowerCase();
    const parts = custLower.split(/\s+/);
    
    // Exact or full name in text
    if (lower.includes(custLower)) {
      return { customerName: cust.name, matchedKnown: true, customer: cust, customerId: cust.id };
    }

    // Check first name match (e.g. "Ramesh" in "Ramesh Kirana" or "Mohan" in "Mohan Lal")
    const firstName = parts[0];
    if (firstName.length >= 3 && new RegExp(`\\b${firstName}\\b`, 'i').test(lower)) {
      return { customerName: cust.name, matchedKnown: true, customer: cust, customerId: cust.id };
    }
  }

  // Step 2: New Customer Command Pattern
  // Examples: "new customer Rahul Sharma", "naya customer Amit", "नया ग्राहक राहुल वर्मा", "add customer Pooja"
  const newCustPattern = /(?:new\s+customer|naya\s+customer|naya\s+grahak|naye\s+grahak|naya\s+khata|add\s+new\s+customer|add\s+customer|नया\s*ग्राहक|नया\s*कस्टमर|नया\s*खाता)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+)?)/i;
  const newCustMatch = text.match(newCustPattern);
  if (newCustMatch && newCustMatch[1]) {
    let rawName = newCustMatch[1].trim();
    // Strip non-name trailing words like 'add', 'phone', 'ka', 'ko', 'hai'
    rawName = rawName.replace(/\b(add|karo|kare|jodo|phone|mobile|mob|ka|ko|se|ne|hai|banao|kholo|bhi)\b/gi, '').trim();
    if (rawName.length >= 2) {
      const formatted = rawName.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return { customerName: formatted, matchedKnown: false, customer: null, customerId: null, isNewCustomer: true };
    }
  }

  // Step 3: Use Hinglish marker patterns
  // Examples:
  // "Ramesh bhai ko", "Suresh se", "Mohan ne", "Pooja ji ko"
  const markerRegex = /(?:^|\s)([A-Za-z\u0900-\u097F]+(?:\s+(?:bhai|ji|bhaiya|seth|chacha|uncle|aunty|sahab|kumar|devi|lal|kirana|sharma|verma|singh))?)\s*(?:ko|ne|ka|ke|se|to|from)\b/i;
  const match = text.match(markerRegex);

  if (match && match[1]) {
    let name = match[1].trim();
    // Clean unwanted filler words
    name = name.replace(/^(aaj|kal|parson|sun|bhai|hello|arre|got|payment|credit|udhaar)\s+/i, '').trim();
    // Capitalize words
    name = name.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    if (name.length > 2) {
      return { customerName: name, matchedKnown: false, customer: null, customerId: null };
    }
  }

  // Fallback: check if "from X" or "X paid"
  const fromMatch = lower.match(/(?:from|se)\s+([a-zA-Z\u0900-\u097F]+)/i);
  if (fromMatch && fromMatch[1]) {
    const cap = fromMatch[1].charAt(0).toUpperCase() + fromMatch[1].slice(1);
    return { customerName: cap, matchedKnown: false, customer: null, customerId: null, isNewCustomer: true };
  }

  // Step 4: Positional / Structural Name Extraction for New Customers
  // When a merchant simply says "[Name] [Amount] [udhar/jama]" without "ko/ne/se"
  // e.g. "Karan 500 udhar", "Rahul Sharma 1200 jama", "करन 500 उधार", "सोनू दो सौ जमा"
  const amountOrKeywordPattern = /(?:\b\d+|\b(?:₹|rs|inr|rupaye|sau|hazar|doso|dosau|dosou|teenso|teensau|teensou|charso|chaarso|panso|paanso|panchso|paanchso|chhehso|saatso|aathso|nauso|dedhso|dhaiso|udhar|udhaar|jama|cash|payment|credit|baki|baaki)\b|(?:^|\s)(?:दोसौ|तीनसौ|चारसौ|पांचसौ|पाँचसौ|छहसौ|सातसौ|आठसौ|नौसौ|डेढ़सौ|ढाईसौ|दो\s*सौ|तीन\s*सौ|चार\s*सौ|पांच\s*सौ|पाँच\s*सौ|दो|तीन|चार|पांच|पाँच|छह|सात|आठ|नौ|दस|बीस|तीस|चालीस|पचास|सौ|हज़ार|हजार|लाख|उधार|जमा|कैश|रुपये|रुपए|रुपया)(?:\s|$))/i;
  
  const amountIndex = text.search(amountOrKeywordPattern);
  if (amountIndex > 0) {
    let candidateName = text.substring(0, amountIndex).trim();
    // Strip leading filler words
    candidateName = candidateName
      .replace(/^(?:aaj|kal|parson|sun|suno|arre|hello|bhai|ji|bhaiya|likho|likh\s*do|entry|entry\s*karo|dokan|dukaan|khata|khate\s*me|नया|नए|नई|new|naya)\s+/gi, '')
      .replace(/\s+(?:ko|ne|ka|ke|se|to|from)$/i, '')
      .trim();

    // Must be 1 to 3 words and at least 2 characters long, not pure numbers or intent words
    const words = candidateName.split(/\s+/).filter(Boolean);
    if (words.length >= 1 && words.length <= 3 && candidateName.length >= 2) {
      if (!/^(?:udhaar|udhar|jama|cash|payment|credit|balance|rupaye|hisaab|samaan|baki|baaki|उधार|जमा|कैश|हिसाब|सामान)$/i.test(candidateName)) {
        const formatted = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        return {
          customerName: formatted,
          matchedKnown: false,
          customer: null,
          customerId: null,
          isNewCustomer: true
        };
      }
    }
  }

  return { customerName: 'Customer', matchedKnown: false, customer: null, customerId: null, isNewCustomer: false };
}

/**
 * Extracts items / goods purchased (e.g., 'tel', 'cheeni', 'rashan')
 */
export function extractItems(text, customerName = '') {
  if (!text) return [];
  const lower = text.toLowerCase();
  const detected = [];
  const nameParts = (customerName || '').toLowerCase().split(/\s+/).filter(Boolean);

  for (const item of COMMON_KIRANA_ITEMS) {
    // If the item word is part of the customer name (like "Kirana"), skip it unless explicitly mentioned as an item
    if (nameParts.includes(item) && !new RegExp(`(?:ka|ki|ke)\\s+${item}`, 'i').test(lower)) {
      continue;
    }

    const itemRegex = new RegExp(`\\b${item}\\b`, 'i');
    if (itemRegex.test(lower)) {
      if (!detected.some(d => d.includes(item) || item.includes(d))) {
        detected.push(item);
      }
    }
  }

  // If no common item caught, check pattern: "[amount] ka [item] udhaar"
  if (detected.length === 0) {
    const itemPattern = lower.match(/(?:\d+|sau|hazar|rupaye)\s*(?:ka|ki|ke)?\s+([a-zA-Z\u0900-\u097F\s]{3,20}?)\s+(?:udhaar|udhar|diya|di|liya)/i);
    if (itemPattern && itemPattern[1]) {
      const customItem = itemPattern[1].trim();
      if (!/(?:rupaye|paise|rs|aaj|kal)/i.test(customItem)) {
        detected.push(customItem);
      }
    }
  }

  return detected;
}

/**
 * Extracts payment method if intent is payment
 */
export function extractPaymentMethod(text) {
  if (!text) return 'Cash';
  const lower = text.toLowerCase();

  if (/\b(upi|phonepe|gpay|google pay|paytm|bhim|scanner|online)\b/i.test(lower)) {
    return 'UPI';
  }
  if (/\b(cheque|check)\b/i.test(lower)) {
    return 'Cheque';
  }
  if (/\b(bank|transfer|neft|rtgs|imps)\b/i.test(lower)) {
    return 'Bank Transfer';
  }
  return 'Cash';
}

/**
 * Main AI Voice Parsing Engine for BolKhata
 * 
 * Takes raw transcript and known customers, returns structured transaction/query intent
 */
export function parseVoiceInput(transcript, knownCustomers = []) {
  if (!transcript || !transcript.trim()) {
    return {
      success: false,
      error: 'Empty voice input received'
    };
  }

  const clean = normalizeText(transcript);
  const intentResult = classifyIntent(clean);
  const amountResult = extractAmount(clean);
  const customerResult = extractCustomerName(clean, knownCustomers);
  const items = intentResult.intent === 'balance_query' ? [] : extractItems(clean, customerResult.customerName);
  const paymentMethod = intentResult.intent === 'payment' ? extractPaymentMethod(clean) : 'Khata';
  const dueDate = parseRelativeDate(clean, intentResult.intent);

  // Extract 10-digit mobile number if spoken
  let phone = '';
  const phoneMatch = clean.match(/(?:\+?91[\-\s]?)?([6-9]\d{9})\b/);
  if (phoneMatch) {
    phone = phoneMatch[1];
  }

  const isNewCust = Boolean(!customerResult.matchedKnown && customerResult.customerName && customerResult.customerName !== 'Customer');

  return {
    success: true,
    rawTranscript: transcript,
    normalizedText: clean,
    intent: intentResult.intent, // 'credit' | 'payment' | 'balance_query'
    typeLabel: intentResult.typeLabel,
    confidence: intentResult.confidence,
    customerName: customerResult.customerName,
    matchedKnownCustomer: customerResult.matchedKnown,
    customerId: customerResult.customerId,
    customer: customerResult.customer,
    phone: phone || (customerResult.customer ? customerResult.customer.phone : ''),
    amount: amountResult.amount || 0,
    items: items.length > 0 ? items : (intentResult.intent === 'credit' ? ['Kirana General'] : []),
    itemsString: items.length > 0 ? items.join(', ') : '',
    paymentMethod,
    dueDate,
    isNewCustomer: isNewCust,
    timestamp: new Date().toISOString()
  };
}
