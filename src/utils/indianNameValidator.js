// Indian Name Knowledge Base & AI Validation Filter for BolKhata
// Handles Devanagari transliteration, phonetic normalization, Indian given names, surnames, and junk-word filtering

// Common Indian Given Names (Hindu, Muslim, Sikh, Christian, Jain)
export const INDIAN_GIVEN_NAMES = new Set([
  // Popular Names - A
  'aslam', 'akram', 'arif', 'imran', 'salman', 'rashid', 'shahid', 'tariq', 'wasim', 'sameer',
  'sohail', 'firoz', 'zubair', 'bilal', 'hamza', 'irfan', 'sultan', 'rehman', 'karim', 'ali',
  'ahmed', 'azam', 'ashraf', 'altaf', 'ayub', 'anwar', 'amjad', 'afzal', 'abid', 'adil',
  'amit', 'sumit', 'rohit', 'mohit', 'ankit', 'vikas', 'vishal', 'vijay', 'ajay', 'sanjay',
  'deepak', 'pankaj', 'manoj', 'praveen', 'pradeep', 'sunil', 'anil', 'karan', 'arjun', 'rahul',
  'rohan', 'varun', 'nitin', 'sachin', 'gaurav', 'aakash', 'akash', 'vivek', 'alok', 'ashok',
  'vinod', 'pramod', 'santosh', 'satish', 'ravi', 'suraj', 'chandan', 'kundan', 'aman', 'anand',
  'ashish', 'abhishek', 'ayush', 'aditya', 'anurag', 'arun', 'alok', 'atul', 'avinash', 'ankur',
  'anita', 'sunita', 'geeta', 'gita', 'seeta', 'sita', 'rita', 'pooja', 'puja', 'aarti', 'arti',
  'kavita', 'mamta', 'rekha', 'suman', 'poonam', 'neha', 'priya', 'priyanka', 'sheetal', 'swati',
  'shabana', 'rukhsar', 'nasreen', 'parveen', 'fatima', 'amina', 'zainab', 'salma', 'rizwana',
  'sultana', 'yasmin', 'farzana', 'rubina', 'tahira', 'nazia', 'heena', 'hina', 'shazia',

  // B - D
  'bablu', 'babloo', 'bunty', 'banti', 'bharat', 'bhupendra', 'balram', 'bhagwan', 'brijesh',
  'chintu', 'chandan', 'chetak', 'chetan', 'chirag',
  'dinesh', 'dilip', 'dharmendra', 'devendra', 'deepanshu', 'darshan', 'durgesh',

  // G - K
  'ganesh', 'gopal', 'govind', 'gautam', 'gagan', 'gurpreet', 'gulzar',
  'harish', 'hari', 'hemant', 'hitesh', 'harpreet', 'harvinder',
  'ishwar', 'inder', 'imtiaz', 'iqbal',
  'jitendra', 'jagdish', 'jaspreet', 'jaswant', 'jatin', 'jay', 'jai',
  'kamal', 'kamlesh', 'kailash', 'kishore', 'krishna', 'kuldeep', 'kapil',

  // L - N
  'lalit', 'lokesh', 'laxman', 'lakhan',
  'mahesh', 'mukesh', 'manish', 'mohit', 'mohan', 'madhav', 'mayank', 'monu', 'mohammad', 'mohammed',
  'naresh', 'narendra', 'naveen', 'navin', 'neeraj', 'nitesh', 'nikhil',

  // O - R
  'om', 'omkar', 'omveer',
  'pawan', 'prashant', 'piyush', 'prem', 'parth', 'prakash', 'pappu',
  'ramesh', 'rajesh', 'rakesh', 'radhey', 'raju', 'raj', 'rajendra', 'rajkumar', 'ravindra', 'roopesh',

  // S - Z
  'suresh', 'shyam', 'shivam', 'shubham', 'sourabh', 'saurabh', 'subhash', 'sonu',
  'tarun', 'tejas', 'tribhuvan',
  'umesh', 'uttam', 'uday',
  'vinay', 'vikram', 'vipul', 'vishnu', 'ved',
  'yash', 'yogesh', 'yuvraj', 'zaheer'
]);

// Common Indian Surnames and Titles
export const INDIAN_SURNAMES = new Set([
  'khan', 'ansari', 'qureshi', 'siddiqui', 'shaikh', 'sheikh', 'pathan', 'sayyed', 'syed', 'malik',
  'mirza', 'ahmed', 'ali', 'hussain', 'shah', 'choudhary', 'chaudhary', 'choudhry',
  'sharma', 'verma', 'gupta', 'singh', 'kumar', 'yadav', 'mishra', 'pandey', 'tiwari', 'dubey',
  'shukla', 'joshi', 'patel', 'mehta', 'chauhan', 'rajput', 'jain', 'agarwal', 'agrawal', 'goyal',
  'bansal', 'mittal', 'singhal', 'garg', 'soni', 'sahu', 'keshari', 'chaurasia', 'kashyap', 'maurya',
  'devi', 'lal', 'prasad', 'nath', 'chand', 'babu', 'rao', 'reddy', 'nair', 'pillai', 'iyer', 'iyengar',
  'seth', 'kirana', 'bhai'
]);

// Devanagari to English phonetic mapping for names
export const DEVANAGARI_NAME_DICTIONARY = {
  // Muslim / Urdu Origin
  'असलम': 'Aslam',
  'अकरम': 'Akram',
  'आरिफ': 'Arif',
  'इमरान': 'Imran',
  'सलमान': 'Salman',
  'राशिद': 'Rashid',
  'शाहिद': 'Shahid',
  'तारिक': 'Tariq',
  'वसीम': 'Wasim',
  'समीर': 'Sameer',
  'सोहेल': 'Sohail',
  'फ़िरोज़': 'Firoz',
  'फिरोज': 'Firoz',
  'ज़ुबैर': 'Zubair',
  'जुबैर': 'Zubair',
  'बिलाल': 'Bilal',
  'हम्ज़ा': 'Hamza',
  'इरफ़ान': 'Irfan',
  'इरफान': 'Irfan',
  'सुल्तान': 'Sultan',
  'रहमान': 'Rehman',
  'करीम': 'Karim',
  'अली': 'Ali',
  'अहमद': 'Ahmed',
  'खान': 'Khan',
  'ख़ान': 'Khan',
  'अंसारी': 'Ansari',
  'कुरैशी': 'Qureshi',
  'सिद्दीकी': 'Siddiqui',
  'शेख': 'Sheikh',
  'पठान': 'Pathan',
  'सैयद': 'Syed',
  'मलिक': 'Malik',
  'मिर्ज़ा': 'Mirza',
  'मिर्जा': 'Mirza',

  // Hindu / Traditional Origin
  'सुरेश': 'Suresh',
  'सुरेश शर्मा': 'Suresh Sharma',
  'रमेश': 'Ramesh',
  'रमेश किराना': 'Ramesh Kirana',
  'रमेश गुप्ता': 'Ramesh Gupta',
  'मोहन': 'Mohan',
  'मोहन लाल': 'Mohan Lal',
  'अनिता': 'Anita',
  'अनीता': 'Anita',
  'अनिता देवी': 'Anita Devi',
  'अनीता देवी': 'Anita Devi',
  'राजेश': 'Rajesh',
  'राजेश वर्मा': 'Rajesh Verma',
  'विक्रम': 'Vikram',
  'विक्रम सिंह': 'Vikram Singh',
  'पूजा': 'Pooja',
  'पूजा शर्मा': 'Pooja Sharma',
  'अमित': 'Amit',
  'अमित कुमार': 'Amit Kumar',
  'सुमित': 'Sumit',
  'रोहित': 'Rohit',
  'मोहित': 'Mohit',
  'अंकित': 'Ankit',
  'विकास': 'Vikas',
  'विशाल': 'Vishal',
  'विजय': 'Vijay',
  'अजय': 'Ajay',
  'संजय': 'Sanjay',
  'दीपक': 'Deepak',
  'पंकज': 'Pankaj',
  'मनोज': 'Manoj',
  'सुनील': 'Sunil',
  'अनिल': 'Anil',
  'करन': 'Karan',
  'करण': 'Karan',
  'अर्जुन': 'Arjun',
  'राहुल': 'Rahul',
  'रोहन': 'Rohan',
  'नितिन': 'Nitin',
  'सचिन': 'Sachin',
  'गौरव': 'Gaurav',
  'आकाश': 'Aakash',
  'विवेक': 'Vivek',
  'विनोद': 'Vinod',
  'संतोष': 'Santosh',
  'सतीश': 'Satish',
  'रवि': 'Ravi',
  'सूरज': 'Suraj',
  'सोनू': 'Sonu',
  'मोनू': 'Monu',
  'राजू': 'Raju',
  'बबलू': 'Bablu',
  'पप्पू': 'Pappu',
  'गोलू': 'Golu',
  'शर्मा': 'Sharma',
  'वर्मा': 'Verma',
  'गुप्ता': 'Gupta',
  'सिंह': 'Singh',
  'कुमार': 'Kumar',
  'यादव': 'Yadav',
  'मिश्रा': 'Mishra',
  'पांडेय': 'Pandey',
  'पांडे': 'Pandey',
  'तिवारी': 'Tiwari',
  'दुबे': 'Dubey',
  'पटेल': 'Patel',
  'देवी': 'Devi',
  'लाल': 'Lal',
  'प्रसाद': 'Prasad'
};

// Suffixes, honorifics and shopkeeper role words that must NEVER be part of the customer name
export const CUSTOMER_ROLE_WORDS = [
  'grahak', 'customer', 'cust', 'khata', 'dokan', 'dukaan', 'entry', 'bhai', 'bhaiya', 'ji',
  'seth', 'chacha', 'uncle', 'aunty', 'sahab', 'saheb', 'babu', 'sir', 'number', 'phone', 'mobile',
  'ko', 'ne', 'se', 'ka', 'ke', 'ki', 'to', 'from',
  // Devanagari
  'ग्राहक', 'कस्टमर', 'खाता', 'दुकान', 'भाई', 'भैया', 'जी', 'साहब', 'बाबू', 'अंकल', 'आंटी', 'सेठ', 'चाचा',
  'नंबर', 'फोन', 'मोबाइल', 'को', 'ने', 'से', 'का', 'के', 'की'
];

/**
 * Strips conversational filler, shop roles, honorifics, and grammatical markers from candidate name
 * e.g. "असलम ग्राहक" -> "असलम"
 * e.g. "Aslam grahak ko" -> "Aslam"
 * e.g. "naya grahak Rahul Sharma" -> "Rahul Sharma"
 */
export function cleanCustomerCandidateName(rawName) {
  if (!rawName) return '';
  let str = rawName.trim();

  // 1. Strip currency symbols, numbers, punctuation
  str = str.replace(/[₹$€£¥\d\.,\/#!$%\^&\*;:{}=\-_`~()\[\]<>?|\\+]/g, ' ').trim();

  // 2. Strip leading conversational phrases & action words
  str = str.replace(/^(?:naya\s+grahak|naye\s+grahak|naya\s+customer|naye\s+customer|naya\s+khata|new\s+customer|add\s+customer|नया\s*ग्राहक|नए\s*ग्राहक|नया\s*कस्टमर|नया\s*खाता|ग्राहक|कस्टमर)\s+/gi, '');
  str = str.replace(/^(?:arre|suno|sun|bhai|hello|likho|likh\s*do|entry|entry\s*karo|dokan|dukaan|khata|khate\s*me)\s+/gi, '');
  str = str.replace(/^(?:udhar|udhaar|jama|diya|diye|mila|mile|bheja|lena|dena|likho|rupaye|rs|cash|payment|credit|उधार|जमा|दिया|दिए|मिला|मिले|रुपये|रुपए|रुपया|कैश)\s+/gi, '');

  // 3. Strip trailing grammatical particles, markers, currency words, and role words (repeat 3 times to peel chained suffixes like "में ₹" or "का बकाया")
  const TRAILING_PATTERN = /\s+(?:grahak|customer|cust|khata|entry|bhai|bhaiya|ji|seth|chacha|uncle|aunty|sahab|saheb|babu|sir|number|phone|mobile|ko|ne|se|ka|ke|ki|me|mein|pe|par|to|from|in|on|at|for|wala|wali|baki|baaki|bakaya|pakaya|pabaya|rupaye|rs|paise|cash|payment|credit|udhar|udhaar|diya|diye|liya|liye|le|de|lena|dena|mila|mile|bheja|ग्राहक|कस्टमर|खाता|दुकान|भाई|भैया|जी|साहब|बाबू|अंकल|आंटी|सेठ|चाचा|नंबर|फोन|मोबाइल|को|ने|से|का|के|की|में|पे|पर|वाला|वाली|बाकी|बकाया|पकाया|उधार|जमा|दिया|दिए|लिया|लिए|ले|दे|रुपये|रुपए|रुपया|कैश)$/gi;

  for (let pass = 0; pass < 3; pass++) {
    str = str.trim().replace(TRAILING_PATTERN, '').trim();
  }

  // 4. Strip if grammar postposition or role word is placed at start
  str = str.replace(/^(?:grahak|customer|ग्राहक|कस्टमर|में|ने|से|को|का|के|की|pe|par|me|mein)\s+/gi, '');

  return str.replace(/\s+/g, ' ').trim();
}

/**
 * AI & Heuristic Indian Name Validator & Enhancer
 * Takes a candidate name and checks:
 * 1. Cleaned candidate without junk words
 * 2. Matches with Indian given names & surnames
 * 3. Devanagari transliteration support (e.g. 'असलम' -> 'Aslam')
 * 4. Full name validity (First name + Last name)
 * 5. Returns validated name, match status, and confidence
 */
export function validateAndEnhanceIndianName(candidate, knownCustomers = []) {
  if (!candidate || typeof candidate !== 'string') {
    return {
      isValid: false,
      cleanName: 'Customer',
      confidence: 0,
      isKnownCustomer: false,
      isIndianNameMatch: false,
      reasoning: 'अमान्य नाम'
    };
  }

  // 1. Clean out clutter
  const cleaned = cleanCustomerCandidateName(candidate);
  if (!cleaned || cleaned.length < 2) {
    return {
      isValid: false,
      cleanName: 'Customer',
      confidence: 0,
      isKnownCustomer: false,
      isIndianNameMatch: false,
      reasoning: 'नाम बहुत छोटा या खाली है'
    };
  }

  const lower = cleaned.toLowerCase();

  // 2. Check if it matches an existing known customer (Exact / Case-insensitive / Substring)
  const matchedKnown = knownCustomers.find(c => {
    const cLower = c.name.toLowerCase();
    return cLower === lower || cLower.includes(lower) || lower.includes(cLower);
  });

  if (matchedKnown) {
    return {
      isValid: true,
      cleanName: matchedKnown.name,
      confidence: 0.98,
      isKnownCustomer: true,
      matchedCustomer: matchedKnown,
      isIndianNameMatch: true,
      reasoning: 'मौजूदा पंजीकृत ग्राहक (Registered Customer)'
    };
  }

  // 3. Check Devanagari Dictionary
  // If user spoke in Hindi (e.g. "असलम", "असलम खान", "रमेश", "सुरेश शर्मा")
  if (/[\u0900-\u097F]/.test(cleaned)) {
    // Check direct match
    if (DEVANAGARI_NAME_DICTIONARY[cleaned]) {
      const engName = DEVANAGARI_NAME_DICTIONARY[cleaned];
      return {
        isValid: true,
        cleanName: engName,
        devanagariOriginal: cleaned,
        confidence: 0.95,
        isKnownCustomer: false,
        isIndianNameMatch: true,
        reasoning: 'प्रमाणित भारतीय नाम (Indian Name Verified)'
      };
    }

    // Check multi-word Devanagari compound (e.g. "असलम खान")
    const JUNK_DEV_PARTICLES = new Set([
      'में', 'ने', 'से', 'को', 'का', 'के', 'की', 'पे', 'पर', 'वाला', 'वाली',
      'बाकी', 'बकाया', 'पकाया', 'पबाया', 'लिया', 'दिया', 'दिए', 'रुपये', 'रुपए', 'रुपया', '₹', 'रू'
    ]);
    const devWords = cleaned.split(/\s+/).filter(Boolean).filter(w => !JUNK_DEV_PARTICLES.has(w));
    if (devWords.length === 0) {
      return {
        isValid: false,
        cleanName: 'Customer',
        confidence: 0,
        isKnownCustomer: false,
        isIndianNameMatch: false,
        reasoning: 'अमान्य नाम'
      };
    }

    const mappedWords = devWords.map(w => DEVANAGARI_NAME_DICTIONARY[w] || w);
    const hasAnyDevMap = devWords.some(w => Boolean(DEVANAGARI_NAME_DICTIONARY[w]));

    if (hasAnyDevMap) {
      const formatted = mappedWords.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        isValid: true,
        cleanName: formatted,
        devanagariOriginal: devWords.join(' '),
        confidence: 0.92,
        isKnownCustomer: false,
        isIndianNameMatch: true,
        reasoning: 'प्रमाणित भारतीय नाम (Indian Name Verified)'
      };
    }

    // Even if not in dictionary, if it's 1-3 Devanagari words and not junk, accept with proper title case
    if (devWords.length >= 1 && devWords.length <= 3) {
      return {
        isValid: true,
        cleanName: devWords.join(' '),
        confidence: 0.85,
        isKnownCustomer: false,
        isIndianNameMatch: true,
        reasoning: 'प्रमाणित भारतीय नाम'
      };
    }
  }

  // 4. English / Latin Indian Name Analysis
  const ACTION_WORDS = new Set([
    'udhar', 'udhaar', 'jama', 'diya', 'diye', 'mila', 'mile', 'bheja', 'lena', 'dena',
    'rupaye', 'rs', 'paise', 'cash', 'payment', 'credit', 'online', 'phone', 'entry',
    'उधार', 'जमा', 'दिया', 'दिए', 'मिला', 'रुपये', 'रुपए', 'रुपया', 'कैश'
  ]);
  const rawWords = cleaned.split(/\s+/).filter(Boolean);
  const words = rawWords.filter(w => !ACTION_WORDS.has(w.toLowerCase()));
  if (words.length === 0) {
    return {
      isValid: false,
      cleanName: 'Customer',
      confidence: 0,
      isKnownCustomer: false,
      isIndianNameMatch: false,
      reasoning: 'अमान्य ग्राहक नाम'
    };
  }
  const formattedWords = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  const finalFormatted = formattedWords.join(' ');

  // Check each word against Indian given names and surnames
  const matchesGiven = words.some(w => INDIAN_GIVEN_NAMES.has(w.toLowerCase()));
  const matchesSurname = words.some(w => INDIAN_SURNAMES.has(w.toLowerCase()));

  if (matchesGiven || matchesSurname) {
    const isFullName = words.length >= 2;
    return {
      isValid: true,
      cleanName: finalFormatted,
      confidence: isFullName ? 0.96 : 0.92,
      isKnownCustomer: false,
      isIndianNameMatch: true,
      nameType: isFullName ? 'full' : 'single',
      reasoning: isFullName ? 'पूर्ण भारतीय नाम (Full Indian Name)' : 'प्रमाणित भारतीय नाम (Indian Name)'
    };
  }

  // 5. Fallback: Sensible Latin Name (at least 2 letters, no numbers, up to 3 words)
  if (words.length >= 1 && words.length <= 3 && !/\d/.test(cleaned)) {
    return {
      isValid: true,
      cleanName: finalFormatted,
      confidence: 0.75,
      isKnownCustomer: false,
      isIndianNameMatch: false,
      reasoning: 'नया ग्राहक नाम (New Customer Name)'
    };
  }

  return {
    isValid: false,
    cleanName: 'Customer',
    confidence: 0,
    isKnownCustomer: false,
    isIndianNameMatch: false,
    reasoning: 'अमान्य ग्राहक नाम'
  };
}
