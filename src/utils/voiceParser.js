import { parseRelativeDate, formatDateISO } from './dateUtils.js';
import { parseHindiSpokenNumber, convertDevanagariNumerals } from './hindiNumberParser.js';
import { validateAndEnhanceIndianName, cleanCustomerCandidateName, matchKnownCustomerFromText, extractHighLevelCustomerName } from './indianNameValidator.js';

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

const NON_NAME_WORDS = new Set([
  'phone', 'mobile', 'mob', 'no', 'number', 'online', 'cash', 'upi', 'gpay', 'phonepe',
  'paytm', 'udhaar', 'udhar', 'jama', 'payment', 'credit', 'balance', 'hisaab', 'samaan',
  'maal', 'baki', 'baaki', 'rupaye', 'paise', 'rs', 'entry', 'customer', 'grahak', 'khata', 'naya',
  'naye', 'new', 'bhai', 'seth', 'uncle', 'chacha', 'sir', 'ji', 'aaj', 'kal',
  'उधार', 'जमा', 'कैश', 'हिसाब', 'सामान', 'रुपये', 'रुपए', 'रुपया', 'फोन', 'मोबाइल', 'नंबर',
  // Hindi numbers (standard & fast compounds)
  'ek', 'do', 'teen', 'char', 'chaar', 'panch', 'paanch', 'chhe', 'chhah', 'saat', 'aath', 'nau', 'das',
  'gyarah', 'barah', 'terah', 'chaudah', 'pandrah', 'solah', 'satrah', 'atharah', 'unnis', 'bees',
  'tees', 'chalis', 'pachas', 'saath', 'sattar', 'assi', 'nabbe', 'sau', 'hazar', 'hazaar', 'lakh', 'crore',
  'ekso', 'doso', 'dosau', 'teenso', 'charso', 'panso', 'paanso', 'panchso', 'chhehso', 'saatso', 'aathso', 'nauso',
  'dedhso', 'dhaiso', 'ekhazar', 'dohazar', 'teenhazar', 'charhazar', 'panchhazar', 'dashazar',
  'एक', 'दो', 'तीन', 'चार', 'पांच', 'पाँच', 'छह', 'सात', 'आठ', 'नौ', 'दस', 'सौ', 'हजार', 'हज़ार', 'लाख'
]);

/**
 * Normalizes input text: converts devanagari numerals and safely expands compound verbs
 */
export function normalizeText(text) {
  if (!text) return '';
  let str = text;
  for (const [dev, eng] of Object.entries(DEVANAGARI_DIGITS)) {
    str = str.replaceAll(dev, eng);
  }

  // Safely separate only explicit Hindi compound verbs (never arbitrary English words!)
  str = str
    .replace(/\b(udhar|udhaar)(diya|diye|do)\b/gi, '$1 $2')
    .replace(/\b(jama)(kiya|kiye|mila|mile)\b/gi, '$1 $2')
    .replace(/\b(mil)(gaya|gya|gaye|gye)\b/gi, '$1 $2')
    .replace(/\b(aa)(gaya|gya|gaye|gye)\b/gi, '$1 $2')
    .replace(/\b(de)(diya|diye)\b/gi, '$1 $2')
    .replace(/\b(le)(liya|liye)\b/gi, '$1 $2')
    .replace(/\b(bhej)(diya|diye)\b/gi, '$1 $2')
    // Devanagari compound verbs & postpositions
    .replace(/([\u0900-\u097F]{2,})(को|ने|से|का|के|की|भाई|जी)\b/g, '$1 $2')
    .replace(/(उधार)(दिया|दिए|दो)/g, '$1 $2')
    .replace(/(जमा)(किया|किए|मिला|मिले)/g, '$1 $2')
    .replace(/(मिल)(गया|गए)/g, '$1 $2')
    .replace(/(आ)(गया|गए)/g, '$1 $2')
    .replace(/(दे)(दिया|दिए)/g, '$1 $2');

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Extracts all numeric amounts from Hindi / Hinglish / English voice transcription
 */
export function extractAmount(text) {
  if (!text) return { amount: null, rawMatch: null, allAmounts: [] };
  const num = parseHindiSpokenNumber(text);
  const all = extractAllAmounts(text);
  if (num && num > 0) {
    return { amount: num, rawMatch: String(num), allAmounts: all };
  }
  return { amount: null, rawMatch: null, allAmounts: all };
}

/**
 * Detects multiple distinct amounts in a single spoken sentence (B3)
 * e.g. "Ramesh 500 udhaar aur 200 jama" -> [500, 200]
 */
export function extractAllAmounts(text) {
  if (!text) return [];
  const amounts = [];
  const regex = /(?:₹|rs\.?|inr|रू|रुपये|रुपए|रुपया)?\s*(\b\d{2,7}\b)\s*(?:₹|rs\.?|inr|\/-|रू|रुपये|रुपए|रुपया)?/gi;
  let match;
  while ((match = regex.exec(text)) !== null) {
    const val = parseInt(match[1], 10);
    // Ignore 10-digit phone numbers
    if (val >= 10 && String(val).length !== 10 && !amounts.includes(val)) {
      amounts.push(val);
    }
  }
  return amounts;
}

/**
 * Determines intent: 'credit', 'payment', or 'balance_query'
 * Handles negative phrases ("nahi diya", "wapas kiya", "cancel") (B3)
 */
export function classifyIntent(text) {
  if (!text) return { intent: 'unknown', confidence: 0, typeLabel: 'Unknown' };
  const lower = text.toLowerCase();

  // 0. Negative Phrases Check (B3)
  // e.g. "nahi diya", "paise nahi diye", "wapas kiya", "cancel kiya"
  const isNegative = 
    /\b(nahi\s+diya|nahi\s+diye|paise\s+nahi|paisa\s+nahi|payment\s+nahi|nahi\s+aaye|nahi\s+aaya|nahi\s+mila|wapas\s+kiya|cancel\s+kiya|cancel\s+karo|cancel)\b/i.test(lower) ||
    /(?:नहीं\s*दिए|नहीं\s*दिया|पैसे\s*नहीं|पेमेंट\s*नहीं|नहीं\s*आए|नहीं\s*आया|नहीं\s*मिला|वापस\s*किया|कैंसिल|रद्द)/.test(lower);

  if (isNegative) {
    if (/(?:\bcancel\b|कैंसिल|रद्द)/i.test(lower)) {
      return {
        intent: 'cancel',
        isNegative: true,
        confidence: 0.65,
        typeLabel: 'Cancel / Reversal (रद्द / निरस्तीकरण)',
        warning: 'कैंसिल या निरस्तीकरण का अनुरोध मिला है। पुष्टि करें।'
      };
    }
    return {
      intent: 'credit', // Money was NOT paid, remains credit / pending
      isNegative: true,
      confidence: 0.60,
      typeLabel: 'Unpaid (भुगतान नहीं मिला)',
      warning: 'ग्राहक ने पैसे नहीं दिए हैं (Payment was NOT received)'
    };
  }

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
    'bakaya liya', 'pakaya liya', 'paisa liya', 'liya',
    // Devanagari payment keywords
    'जमा', 'जमा किए', 'जमा किया', 'जमा मिला', 'मिले', 'मिला', 'मिल गया', 'मिल गए', 'आए', 'आया', 'आ गए', 'आ गया',
    'भुगतान', 'पेमेंट', 'पे', 'यूपीआई', 'फोनपे', 'गूगल पे', 'पेटीएम', 'नकद', 'कैश', 'चुकता', 'वसूल', 'वापस',
    'बकाया लिया', 'पकाया लिया', 'पैसा लिया', 'लिया'
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
 * Normalizes Indian English phonetic variations (e.g. ee <-> i, oo <-> u, sh <-> s, w <-> v)
 */
export function normalizeIndianPhonetics(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s\u0900-\u097F]/g, '')
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/w/g, 'v')
    .replace(/sh/g, 's')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Calculates Levenshtein-based phonetic string similarity (0.0 to 1.0)
 */
export function calculateFuzzySimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  const a = normalizeIndianPhonetics(s1);
  const b = normalizeIndianPhonetics(s2);
  if (a === b) return 1.0;
  if (a.includes(b) || b.includes(a)) return 0.92;

  const lenA = a.length;
  const lenB = b.length;
  const matrix = Array.from({ length: lenA + 1 }, () => Array(lenB + 1).fill(0));

  for (let i = 0; i <= lenA; i++) matrix[i][0] = i;
  for (let j = 0; j <= lenB; j++) matrix[0][j] = j;

  for (let i = 1; i <= lenA; i++) {
    for (let j = 1; j <= lenB; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[lenA][lenB];
  const maxLen = Math.max(lenA, lenB);
  return 1 - distance / maxLen;
}

/**
 * Extracts customer name by utilizing High-Level Name Filter
 * Handles Devanagari transliteration, stutter/duplicate removal, conversational noise filtering
 */
export function extractCustomerName(text, knownCustomers = []) {
  if (!text) return { customerName: 'Customer', matchedKnown: false, customerId: null, isNewCustomer: false, isIndianNameMatch: false, nameValidationReason: '' };
  return extractHighLevelCustomerName(text, knownCustomers);
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
      if (!/(?:rupaye|paise|rs|aaj|kal|phone\s*pe|phonepe|gpay|paytm|upi|cash|online)/i.test(customItem)) {
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

  if (/\b(upi|phonepe|phone\s*pe|gpay|google\s*pay|paytm|bhim|scanner|online)\b/i.test(lower)) {
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
  const allAmounts = amountResult.allAmounts || [];
  const hasMultipleAmounts = allAmounts.length > 1;

  let confidence = intentResult.confidence;
  let warningMessage = intentResult.warning || '';

  if (hasMultipleAmounts) {
    confidence = Math.min(confidence, 0.60);
    warningMessage = `एक से अधिक राशियां पाई गईं (${allAmounts.join('₹, ')}₹)। कृपया सही राशि चुनें।`;
  }

  return {
    success: true,
    rawTranscript: transcript,
    normalizedText: clean,
    intent: intentResult.intent, // 'credit' | 'payment' | 'balance_query' | 'cancel'
    typeLabel: intentResult.typeLabel,
    confidence,
    isNegative: Boolean(intentResult.isNegative),
    hasMultipleAmounts,
    allAmounts,
    warning: warningMessage,
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
    isIndianNameMatch: Boolean(customerResult.isIndianNameMatch),
    nameValidationReason: customerResult.nameValidationReason || '',
    timestamp: new Date().toISOString()
  };
}
