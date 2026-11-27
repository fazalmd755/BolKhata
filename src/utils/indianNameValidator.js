// Indian Name Knowledge Base & AI Validation Filter for BolKhata
// Handles Devanagari transliteration, phonetic normalization, Indian given names, surnames, and junk-word filtering

// Common Indian Given Names (Hindu, Muslim, Sikh, Christian, Jain)
export const INDIAN_GIVEN_NAMES = new Set([
  // Muslim / Urdu Origin
  'aslam', 'akram', 'arif', 'imran', 'salman', 'rashid', 'shahid', 'tariq', 'wasim', 'sameer',
  'sohail', 'firoz', 'zubair', 'bilal', 'hamza', 'irfan', 'sultan', 'rehman', 'karim', 'ali',
  'ahmed', 'azam', 'ashraf', 'altaf', 'ayub', 'anwar', 'amjad', 'afzal', 'abid', 'adil',
  'abdul', 'abdullah', 'danish', 'javed', 'munna', 'guddu', 'kallu', 'saddam', 'faizan', 'rizwan',
  'sajid', 'aamir', 'shoaib', 'zakir', 'kaleem', 'shamim', 'naeem', 'shakeel', 'ayaz', 'ayaan',
  'kaif', 'faiz', 'kabir', 'zafar', 'haider', 'hasan', 'habib', 'naseem', 'shabbir', 'basheer',
  'lateef', 'mujeeb', 'manzoor', 'shamsher', 'saleem', 'abbas', 'mustafa', 'qasim', 'imtiyaz',
  'aftab', 'shahnawaz', 'shahbaz', 'parvez', 'arbaz', 'irshad', 'shamshad', 'dilshad', 'naushad',
  'golu',

  // Hindu / Traditional - A
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
  'दानिश': 'Danish',
  'जावेद': 'Javed',
  'मुन्ना': 'Munna',
  'गुड्डू': 'Guddu',
  'कल्लू': 'Kallu',
  'सद्दाम': 'Saddam',
  'फैजान': 'Faizan',
  'रिजवान': 'Rizwan',
  'साजिद': 'Sajid',
  'आमिर': 'Aamir',
  'शोएब': 'Shoaib',
  'जाकिर': 'Zakir',
  'कलीम': 'Kaleem',
  'शमीम': 'Shamim',
  'नईम': 'Naeem',
  'शकील': 'Shakeel',
  'इकबाल': 'Iqbal',
  'अब्दुल': 'Abdul',
  'अब्दुल्ला': 'Abdullah',
  'अमान': 'Aman',
  'अयाज': 'Ayaz',
  'अयान': 'Ayaan',
  'कैफ': 'Kaif',
  'फैज': 'Faiz',
  'कबीर': 'Kabir',
  'जफर': 'Zafar',
  'हैदर': 'Haider',
  'हुसैन': 'Hussain',
  'हसन': 'Hasan',
  'हबीब': 'Habib',
  'नसीम': 'Naseem',
  'शब्बीर': 'Shabbir',
  'बशीर': 'Basheer',
  'लतीफ': 'Lateef',
  'मुजीब': 'Mujeeb',
  'अनवर': 'Anwar',
  'मंजूर': 'Manzoor',
  'शमशेर': 'Shamsher',
  'सलीम': 'Saleem',
  'अब्बास': 'Abbas',
  'मुस्तफा': 'Mustafa',
  'आदिल': 'Adil',
  'कासिम': 'Qasim',
  'अलताफ': 'Altaf',
  'इम्तियाज': 'Imtiyaz',
  'अफताब': 'Aftab',
  'शाहनवाज': 'Shahnawaz',
  'शहबाज': 'Shahbaz',
  'परवेज': 'Parvez',
  'अरबाज': 'Arbaz',
  'इरशाद': 'Irshad',
  'शमशाद': 'Shamshad',
  'दिलशाद': 'Dilshad',
  'नौशाद': 'Naushad',

  // Hindu / Traditional Origin
  'सुरेश': 'Suresh',
  'सुरेश शर्मा': 'Suresh Sharma',
  'रमेश': 'Ramesh',
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

// Comprehensive Stopwords, conversational fillers, ledger actions, and grammatical particles
export const STOPWORDS_AND_FILLERS = new Set([
  // Hindi & Urdu greetings / fillers / honorifics
  'अरे', 'सुनो', 'सुन', 'भाई', 'भैया', 'हेलो', 'नमस्ते', 'जी', 'साहब', 'साहेब', 'बाबू',
  'अंकल', 'आंटी', 'चाचा', 'काका', 'सेठ', 'ओ', 'हे', 'बोल', 'बोलो',
  // Hinglish greetings / fillers
  'arre', 'suno', 'sun', 'bhai', 'bhaiya', 'hello', 'hi', 'hey', 'ji', 'sahab', 'saheb',
  'babu', 'sir', 'seth', 'chacha', 'uncle', 'aunty', 'o', 'bol', 'bolo', 'namaste',

  // Actions / Ledger verbs
  'लिखो', 'लिख', 'लिखदो', 'लिखा', 'लिखना', 'एंट्री', 'करो', 'कर', 'करदो', 'करवाया', 'करा',
  'करे', 'करना', 'किया', 'किए', 'डालो', 'डाल', 'ले', 'दे', 'गया', 'गए', 'गई', 'था', 'थी', 'थे',
  'आया', 'आए', 'आई', 'भेजा', 'दिया', 'दिए', 'लिया', 'लिए', 'मिला', 'मिले', 'चुकाया', 'होगा',
  'होगी', 'होंगे', 'रहेगा', 'चाहिए', 'बताओ', 'बताएं', 'देखना', 'देखो',
  // Hinglish actions / verbs
  'likho', 'likh', 'likhdo', 'entry', 'karo', 'kar', 'karwaya', 'kara', 'kare', 'karna',
  'kiya', 'kiye', 'dalo', 'daalo', 'dal', 'daal', 'le', 'de', 'gaya', 'gaye', 'gayi', 'tha',
  'thi', 'the', 'aaya', 'aaye', 'aayi', 'bheja', 'diya', 'diye', 'liya', 'liye', 'mila', 'mile',
  'chukaya', 'hoga', 'hogi', 'honge', 'rahega', 'chahiye', 'batao', 'dekho', 'add', 'save',

  // Customer roles & qualifiers
  'नया', 'नए', 'नई', 'ग्रह', 'ग्राहक', 'कस्टमर', 'खाता', 'दुकान', 'बंदा', 'पार्टी',
  'naya', 'naye', 'nayi', 'new', 'grahak', 'grah', 'customer', 'cust', 'khata', 'dokan',
  'dukaan', 'banda', 'party',

  // Grammatical particles & prepositions
  'में', 'ने', 'से', 'को', 'का', 'के', 'की', 'पे', 'पर', 'वाला', 'वाली', 'वाले',
  'ko', 'ne', 'se', 'ka', 'ke', 'ki', 'me', 'mein', 'pe', 'par', 'to', 'from', 'in', 'on',
  'at', 'for', 'wala', 'wali', 'wale', 'off',

  // Transaction terms, goods, and amounts
  'उधार', 'जमा', 'बाकी', 'बकाया', 'पकाया', 'पबाया', 'कैश', 'बैलेंस', 'हिसाब', 'रुपये', 'रुपए',
  'रुपया', '₹', 'रू', 'सौ', 'हजार', 'हज़ार', 'लाख', 'करोड़', 'पैसा', 'पैसे',
  'सामान', 'माल', 'चीज', 'चीजें', 'सौदा',
  'udhar', 'udhaar', 'jama', 'baki', 'baaki', 'bakaya', 'pakaya', 'cash', 'credit', 'payment',
  'balance', 'hisab', 'rupaye', 'rs', 'inr', 'paise', 'sau', 'hazar', 'hazaar', 'lakh', 'cr',
  'one', 'two', 'three', 'hundred', 'thousand',
  'samaan', 'saaman', 'maal', 'item', 'items', 'cheez', 'chij', 'sauda',

  // Temporal words
  'आज', 'कल', 'परसों', 'सुबह', 'शाम', 'दोपहर', 'रात', 'तारीख', 'समय', 'अभी',
  'aaj', 'kal', 'parso', 'subah', 'sham', 'shaam', 'dopahar', 'raat', 'date', 'tarikh', 'time', 'abhi', 'now', 'today', 'yesterday'
]);

/**
 * Deduplicates repeated tokens and stutters
 * e.g. ['अब्दुल', 'अब्दुल'] -> ['अब्दुल']
 * e.g. ['Abdul', 'Abdul'] -> ['Abdul']
 * e.g. ['Mohit', 'Kumar', 'Mohit', 'Kumar'] -> ['Mohit', 'Kumar']
 */
export function deduplicateTokens(tokens) {
  if (!tokens || tokens.length === 0) return [];
  const result = [];
  for (let i = 0; i < tokens.length; i++) {
    let cur = tokens[i].trim();
    if (!cur) continue;
    // Split repeated word (e.g. AbdulAbdul -> Abdul, असलमअसलम -> असलम)
    if (cur.length >= 6 && cur.length % 2 === 0) {
      const half = cur.length / 2;
      const h1 = cur.slice(0, half);
      const h2 = cur.slice(half);
      if (h1.toLowerCase() === h2.toLowerCase()) {
        cur = h1;
      }
    }
    // Skip if identical to previous token
    if (result.length > 0 && result[result.length - 1].toLowerCase() === cur.toLowerCase()) {
      continue;
    }
    result.push(cur);
  }

  // Deduplicate repeated 2-word phrases: ['Mohit', 'Kumar', 'Mohit', 'Kumar'] -> ['Mohit', 'Kumar']
  if (result.length === 4 && result[0].toLowerCase() === result[2].toLowerCase() && result[1].toLowerCase() === result[3].toLowerCase()) {
    return [result[0], result[1]];
  }

  // Deduplicate repeated 3-word phrases: ['Mohammad', 'Aslam', 'Khan', 'Mohammad', 'Aslam', 'Khan']
  if (result.length === 6 && result[0].toLowerCase() === result[3].toLowerCase() && result[1].toLowerCase() === result[4].toLowerCase() && result[2].toLowerCase() === result[5].toLowerCase()) {
    return [result[0], result[1], result[2]];
  }

  return result;
}

/**
 * Strips conversational filler, shop roles, honorifics, and grammatical markers from candidate name
 * e.g. "असलम ग्राहक" -> "असलम"
 * e.g. "Aslam grahak ko" -> "Aslam"
 * e.g. "naya grahak Rahul Sharma" -> "Rahul Sharma"
 * e.g. "अब्दुल अब्दुल" -> "अब्दुल"
 */
export function cleanCustomerCandidateName(rawName) {
  if (!rawName) return '';
  let str = rawName.trim();

  // 1. Strip currency symbols, numbers, punctuation
  str = str.replace(/[₹$€£¥\d\.,\/#!$%\^&\*;:{}=\-_`~()\[\]<>?|\\+]/g, ' ').trim();

  // 2. Strip leading conversational phrases, role words, and speech recognition mis-transcriptions
  for (let p = 0; p < 4; p++) {
    str = str.replace(/^(?:naya\s+grahak|naye\s+grahak|naya\s+grah|naye\s+grah|naya\s+customer|naye\s+customer|naya\s+khata|new\s+customer|add\s+customer|naya\s+banda|naya\s+party|नया\s*ग्राहक|नए\s*ग्राहक|नया\s*ग्रह|नए\s*ग्रह|नया\s*कस्टमर|नए\s*कस्टमर|नया\s*खाता|नया\s*बंदा|नया\s*पार्टी|नया|नए|नई|new|naya|naye)\s+/gi, '').trim();
    str = str.replace(/^(?:grahak|customer|grah|cust|party|banda|ग्राहक|कस्टमर|ग्रह|पार्टी|बंदा|खाता|दुकान)\s+/gi, '').trim();
    str = str.replace(/^(?:arre|suno|sun|bhai|hello|likho|likh\s*do|entry|entry\s*karo|dokan|dukaan|khata|khate\s*me|अरे|सुनो|सुन|लिखो|लिख\s*दो|एंट्री)\s+/gi, '').trim();
    str = str.replace(/^(?:udhar|udhaar|jama|diya|diye|mila|mile|bheja|lena|dena|likho|rupaye|rs|cash|payment|credit|उधार|जमा|दिया|दिए|मिला|मिले|रुपये|रुपए|रुपया|कैश)\s+/gi, '').trim();
    str = str.replace(/^(?:में|ने|से|को|का|के|की|pe|par|me|mein)\s+/gi, '').trim();
  }

  // 3. Strip trailing grammatical particles, markers, currency words, and role words (repeat 4 times to peel chained suffixes like "में ₹" or "का बकाया")
  const TRAILING_PATTERN = /\s+(?:grahak|customer|cust|grah|khata|entry|bhai|bhaiya|ji|seth|chacha|uncle|aunty|sahab|saheb|babu|sir|number|phone|mobile|ko|ne|se|ka|ke|ki|me|mein|pe|par|to|from|in|on|at|for|wala|wali|baki|baaki|bakaya|pakaya|pabaya|rupaye|rs|paise|cash|payment|credit|udhar|udhaar|diya|diye|liya|liye|le|de|lena|dena|mila|mile|bheja|le\s*gaya|le\s*gaye|le\s*liya|le\s*diya|ग्राहक|कस्टमर|ग्रह|खाता|दुकान|भाई|भैया|जी|साहब|बाबू|अंकल|आंटी|सेठ|चाचा|नंबर|फोन|मोबाइल|को|ने|से|का|के|की|में|पे|पर|वाला|वाली|बाकी|बकाया|पकाया|उधार|जमा|दिया|दिए|लिया|लिए|ले|दे|ले\s*गया|ले\s*गए|ले\s*लिया|रुपये|रुपए|रुपया|कैश)$/gi;

  for (let pass = 0; pass < 4; pass++) {
    str = str.trim().replace(TRAILING_PATTERN, '').trim();
  }

  // 4. Token filter & Deduplication
  const rawWords = str.split(/\s+/).filter(Boolean);
  const filteredWords = rawWords.filter(w => !STOPWORDS_AND_FILLERS.has(w.toLowerCase()));
  const dedupedWords = deduplicateTokens(filteredWords);

  return dedupedWords.join(' ').trim();
}

/**
 * Matches known registered customers across both English and Devanagari Hindi
 * e.g. "रमेश" -> matches "Ramesh"
 * e.g. "सुरेश" -> matches "Suresh Sharma"
 * e.g. "Ramesh" -> matches "Ramesh"
 */
export function matchKnownCustomerFromText(text, knownCustomers = []) {
  if (!text || !knownCustomers || knownCustomers.length === 0) return null;
  const lower = text.toLowerCase().trim();

  // 1. Direct English full name or first name check
  for (const c of knownCustomers) {
    const cLower = c.name.toLowerCase();
    const cFirst = cLower.split(/\s+/)[0];
    if (lower.includes(cLower)) return c;
    if (cFirst.length >= 3 && new RegExp('\\b' + cFirst + '\\b', 'i').test(lower)) {
      return c;
    }
  }

  // 2. Devanagari dictionary match to English customer
  for (const [devWord, engName] of Object.entries(DEVANAGARI_NAME_DICTIONARY)) {
    if (text.includes(devWord)) {
      const engLower = engName.toLowerCase();
      const engFirst = engLower.split(/\s+/)[0];
      const match = knownCustomers.find(c => {
        const cLower = c.name.toLowerCase();
        return cLower.includes(engLower) || cLower.includes(engFirst) || engLower.includes(cLower.split(/\s+/)[0]);
      });
      if (match) return match;
    }
  }

  return null;
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

  // 2. Check if it matches an existing registered customer (both English & Devanagari)
  const matchedKnown = matchKnownCustomerFromText(cleaned, knownCustomers);
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
      const matchAfterTrans = matchKnownCustomerFromText(engName, knownCustomers);
      if (matchAfterTrans) {
        return {
          isValid: true,
          cleanName: matchAfterTrans.name,
          confidence: 0.98,
          isKnownCustomer: true,
          matchedCustomer: matchAfterTrans,
          isIndianNameMatch: true,
          reasoning: 'मौजूदा पंजीकृत ग्राहक'
        };
      }
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

    // Check multi-word Devanagari compound (e.g. "असलम खान", "अब्दुल अब्दुल")
    const devWords = deduplicateTokens(
      cleaned.split(/\s+/).filter(Boolean).filter(w => !STOPWORDS_AND_FILLERS.has(w))
    );
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
  const rawWords = cleaned.split(/\s+/).filter(Boolean);
  const words = deduplicateTokens(
    rawWords.filter(w => !STOPWORDS_AND_FILLERS.has(w.toLowerCase()))
  );
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

/**
 * High-Level Customer Name Extraction & AI Filter
 * Extracts strictly pure customer names from spoken Hindi/Hinglish sentences.
 * Automatically handles:
 * 1. Name duplication & stutter (e.g. "अब्दुल अब्दुल" -> "Abdul", "Abdul Abdul" -> "Abdul")
 * 2. Conversational fillers & noise ("अरे भाई सुनो अब्दुल का 500 लिखो" -> "Abdul")
 * 3. Registered customer recognition across Devanagari & English
 * 4. Certified Indian name validation & transliteration
 */
export function extractHighLevelCustomerName(text, knownCustomers = []) {
  if (!text || typeof text !== 'string') {
    return {
      customerName: 'Customer',
      matchedKnown: false,
      customer: null,
      customerId: null,
      isNewCustomer: false,
      isIndianNameMatch: false,
      nameValidationReason: ''
    };
  }

  // Step 1: Check known registered customers first (Devanagari & English)
  const matchedKnown = matchKnownCustomerFromText(text, knownCustomers);
  if (matchedKnown) {
    return {
      customerName: matchedKnown.name,
      matchedKnown: true,
      customer: matchedKnown,
      customerId: matchedKnown.id,
      isNewCustomer: false,
      isIndianNameMatch: true,
      nameValidationReason: 'मौजूदा पंजीकृत ग्राहक'
    };
  }

  // Step 2: Clean text and tokenize
  const cleanStr = text.replace(/[₹$€£¥\d\.,\/#!$%\^&\*;:{}=\-_`~()\[\]<>?|\\+]/g, ' ');
  const rawTokens = cleanStr.split(/\s+/).filter(Boolean);
  const withoutStopwords = rawTokens.filter(w => !STOPWORDS_AND_FILLERS.has(w.toLowerCase()));
  const dedupedTokens = deduplicateTokens(withoutStopwords);

  // Step 3: Recognized Indian Names Scan on Deduped Tokens (highest precision)
  // Check 2-word combinations first
  for (let i = 0; i < dedupedTokens.length - 1; i++) {
    const pair = `${dedupedTokens[i]} ${dedupedTokens[i + 1]}`;
    const val = validateAndEnhanceIndianName(pair, knownCustomers);
    if (val.isValid && val.isIndianNameMatch && val.cleanName !== 'Customer') {
      return {
        customerName: val.cleanName,
        matchedKnown: val.isKnownCustomer,
        customer: val.matchedCustomer || null,
        customerId: val.matchedCustomer ? val.matchedCustomer.id : null,
        isNewCustomer: !val.isKnownCustomer,
        isIndianNameMatch: true,
        nameValidationReason: val.reasoning
      };
    }
  }

  // Check single words in deduped tokens against Indian names / Devanagari dictionary
  for (const token of dedupedTokens) {
    const val = validateAndEnhanceIndianName(token, knownCustomers);
    if (val.isValid && val.isIndianNameMatch && val.cleanName !== 'Customer') {
      return {
        customerName: val.cleanName,
        matchedKnown: val.isKnownCustomer,
        customer: val.matchedCustomer || null,
        customerId: val.matchedCustomer ? val.matchedCustomer.id : null,
        isNewCustomer: !val.isKnownCustomer,
        isIndianNameMatch: true,
        nameValidationReason: val.reasoning
      };
    }
  }

  // Step 4: Syntactic Pattern: "new customer / naya grahak / naya grah / naya khata [Name]"
  const newCustPattern = /(?:new\s+customer|naya\s+customer|naya\s+grahak|naye\s+grahak|naya\s+grah|naye\s+grah|naya\s+khata|add\s+new\s+customer|add\s+customer|नया\s*ग्राहक|नए\s*ग्राहक|नया\s*ग्रह|नए\s*ग्रह|नया\s*कस्टमर|नया\s*खाता)\s+([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+){0,2})/i;
  const newCustMatch = text.match(newCustPattern);
  if (newCustMatch && newCustMatch[1]) {
    const val = validateAndEnhanceIndianName(newCustMatch[1], knownCustomers);
    if (val.isValid && val.cleanName !== 'Customer') {
      return {
        customerName: val.cleanName,
        matchedKnown: val.isKnownCustomer,
        customer: val.matchedCustomer || null,
        customerId: val.matchedCustomer ? val.matchedCustomer.id : null,
        isNewCustomer: !val.isKnownCustomer,
        isIndianNameMatch: val.isIndianNameMatch,
        nameValidationReason: val.reasoning
      };
    }
  }

  // Step 5: Syntactic Pattern: Marker [Name] "ko|ne|ka|ke|ki|se|को|ने|का|के|की|से"
  const markerRegex = /(?:^|\s)([A-Za-z\u0900-\u097F]+(?:\s+[A-Za-z\u0900-\u097F]+){0,2})\s+(?:ko|ne|ka|ke|ki|se|to|from|को|ने|का|के|की|से)\b/i;
  const markerMatch = text.match(markerRegex);
  if (markerMatch && markerMatch[1]) {
    const val = validateAndEnhanceIndianName(markerMatch[1], knownCustomers);
    if (val.isValid && val.cleanName !== 'Customer') {
      return {
        customerName: val.cleanName,
        matchedKnown: val.isKnownCustomer,
        customer: val.matchedCustomer || null,
        customerId: val.matchedCustomer ? val.matchedCustomer.id : null,
        isNewCustomer: !val.isKnownCustomer,
        isIndianNameMatch: val.isIndianNameMatch,
        nameValidationReason: val.reasoning
      };
    }
  }

  // Step 6: Positional pattern before Amount / Transaction Keyword
  const amountOrKeywordPattern = /(?:\b\d+|\b(?:₹|rs|inr|rupaye|sau|hazar|hazaar|lakh|ekso|eksau|doso|dosau|dosou|teenso|teensau|teensou|charso|chaarso|panso|paanso|panchso|paanchso|chhehso|saatso|aathso|nauso|dedhso|dhaiso|ekhazar|ekhazaar|dohazar|dohazaar|teenhazar|charhazar|panchhazar|dashazar|ek|do|teen|chaar|char|paanch|panch|chhah|cheh|chhe|saat|aath|nau|das|gyarah|barah|terah|chaudah|pandrah|solah|satrah|atharah|unnis|bees|tees|chalis|pachas|saath|sattar|assi|nabbe|udhar|udhaar|jama|cash|payment|credit|baki|baaki)\b|(?:^|\s)(?:एकहजार|दोहजार|तीन्हजार|चारहजार|पांचहजार|दसहजार|एकसौ|दोसौ|तीनसौ|चारसौ|पांचसौ|पाँचसौ|छहसौ|सातसौ|आठसौ|नौसौ|डेढ़सौ|ढाईसौ|दो\s*सौ|तीन\s*सौ|चार\s*सौ|पांच\s*सौ|पाँच\s*सौ|एक|दो|तीन|चार|पांच|पाँच|छह|सात|आठ|नौ|दस|बीस|तीस|चालीस|पचास|सौ|हज़ार|हजार|लाख|उधार|जमा|कैश|रुपये|रुपए|रुपया)(?:\s|$))/i;
  const amountIndex = text.search(amountOrKeywordPattern);
  if (amountIndex > 0) {
    const candidateSub = text.substring(0, amountIndex).trim();
    const val = validateAndEnhanceIndianName(candidateSub, knownCustomers);
    if (val.isValid && val.cleanName !== 'Customer') {
      return {
        customerName: val.cleanName,
        matchedKnown: val.isKnownCustomer,
        customer: val.matchedCustomer || null,
        customerId: val.matchedCustomer ? val.matchedCustomer.id : null,
        isNewCustomer: !val.isKnownCustomer,
        isIndianNameMatch: val.isIndianNameMatch,
        nameValidationReason: val.reasoning
      };
    }
  }

  // Step 7: Fallback to remaining deduped non-stopword tokens (e.g. rare regional names)
  if (dedupedTokens.length >= 1 && dedupedTokens.length <= 3) {
    const candidateName = dedupedTokens.join(' ');
    const val = validateAndEnhanceIndianName(candidateName, knownCustomers);
    if (val.isValid && val.cleanName !== 'Customer') {
      return {
        customerName: val.cleanName,
        matchedKnown: val.isKnownCustomer,
        customer: val.matchedCustomer || null,
        customerId: val.matchedCustomer ? val.matchedCustomer.id : null,
        isNewCustomer: !val.isKnownCustomer,
        isIndianNameMatch: val.isIndianNameMatch,
        nameValidationReason: val.reasoning
      };
    }
  }

  // Fallback
  return {
    customerName: 'Customer',
    matchedKnown: false,
    customer: null,
    customerId: null,
    isNewCustomer: false,
    isIndianNameMatch: false,
    nameValidationReason: ''
  };
}
