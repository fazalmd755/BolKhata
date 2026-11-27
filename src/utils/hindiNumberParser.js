// Comprehensive Hindi & Colloquial Devanagari Number Parser for BolKhata
// Handles pure Devanagari words, phonetic Hindi, compounds, fractionals and colloquial Kirana terms

export const DEVANAGARI_DIGIT_MAP = {
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
  '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

export const HINDI_WORDS_MAP = {
  // Units 0 - 9
  'शून्य': 0, 'जीरो': 0, 'zero': 0,
  'एक': 1, 'इक': 1, 'ek': 1, 'one': 1,
  'दो': 2, 'do': 2, 'two': 2,
  'तीन': 3, 'teen': 3, 'three': 3,
  'चार': 4, 'chaar': 4, 'char': 4, 'four': 4,
  'पाँच': 5, 'पांच': 5, 'paanch': 5, 'panch': 5, 'five': 5,
  'छह': 6, 'छः': 6, 'छे': 6, 'chhah': 6, 'cheh': 6, 'six': 6,
  'सात': 7, 'saat': 7, 'seven': 7,
  'आठ': 8, 'aath': 8, 'eight': 8,
  'नौ': 9, 'nau': 9, 'nine': 9,
  'दस': 10, 'das': 10, 'ten': 10,

  // 11 - 20
  'ग्यारह': 11, 'gyarah': 11,
  'बारह': 12, 'barah': 12,
  'तेरह': 13, 'terah': 13,
  'चौदह': 14, 'chaudah': 14,
  'पंद्रह': 15, 'pandrah': 15,
  'सोलह': 16, 'solah': 16,
  'सत्रह': 17, 'satrah': 17,
  'अट्ठारह': 18, 'अठारह': 18, 'atharah': 18, 'athara': 18,
  'उन्नीस': 19, 'unnis': 19,
  'बीस': 20, 'bees': 20,

  // 21 - 30
  'इक्कीस': 21, 'ikkis': 21,
  'बाईस': 22, 'baais': 22,
  'तेईस': 23, 'teis': 23,
  'चौबीस': 24, 'chaubis': 24,
  'पच्चीस': 25, 'पचीस': 25, 'pachis': 25, 'pachchis': 25,
  'छब्बीस': 26, 'chabbis': 26,
  'सत्ताईस': 27, 'sattais': 27,
  'अट्ठाईस': 28, 'atthais': 28,
  'उनतीस': 29, 'untees': 29,
  'तीस': 30, 'tees': 30,

  // 31 - 40
  'इकतीस': 31, 'iktis': 31,
  'बत्तीस': 32, 'battis': 32,
  'तैंतीस': 33, 'taintis': 33,
  'चौंतीस': 34, 'chauntis': 34,
  'पैंतीस': 35, 'paintis': 35,
  'छत्तीस': 36, 'chattis': 36,
  'सैंतीस': 37, 'saintis': 37,
  'अड़तीस': 38, 'adhtis': 38,
  'उनतालीस': 39, 'untalis': 39,
  'चालीस': 40, 'chalis': 40,

  // 41 - 50
  'इकतालीस': 41, 'iktalis': 41,
  'बयालीस': 42, 'bayalis': 42,
  'तैंतालीस': 43, 'taintalis': 43,
  'चवालीस': 44, 'chawalis': 44,
  'पैंतालीस': 45, 'paitalis': 45,
  'छियालीस': 46, 'chiyalis': 46,
  'सैंतालीस': 47, 'saintalis': 47,
  'अड़तालीस': 48, 'adhtalis': 48,
  'उनचास': 49, 'unchas': 49,
  'पचास': 50, 'pachas': 50,

  // Higher tens
  'पचपन': 55, 'साठ': 60, 'पैंसठ': 65, 'सत्तर': 70, 'पचहत्तर': 75,
  'अस्सी': 80, 'पचासी': 85, 'नब्बे': 90, 'पंचानवे': 95,
  // Single units
  'सौ': 100, 'sau': 100, 'हजार': 1000, 'हज़ार': 1000, 'hazar': 1000, 'hazaar': 1000, 'lakh': 100000, 'लाख': 100000
};

// Slurred fast-spoken compounds common when merchants speak rapidly
export const HINDI_FAST_NUMBER_MAP = {
  // Fast spoken hundreds (200 - 900)
  'ekso': 100, 'eksau': 100, 'eksou': 100, 'एकसौ': 100,
  'doso': 200, 'dosau': 200, 'dosou': 200, 'दोसौ': 200,
  'teenso': 300, 'teensau': 300, 'teensou': 300, 'तीनसौ': 300,
  'charso': 400, 'chaarso': 400, 'chaarsau': 400, 'chaarsou': 400, 'चारसौ': 400,
  'panso': 500, 'paanso': 500, 'panchso': 500, 'paanchso': 500, 'panchsau': 500, 'paanchsau': 500, 'panchsou': 500, 'paanchsou': 500, 'पांचसौ': 500, 'पाँचसौ': 500,
  'chhehso': 600, 'chehso': 600, 'chhaso': 600, 'छहसौ': 600,
  'saatso': 700, 'satso': 700, 'saatsou': 700, 'सातसौ': 700,
  'aathso': 800, 'athso': 800, 'aathsou': 800, 'आठसौ': 800,
  'nauso': 900, 'nawso': 900, 'nausou': 900, 'नौसौ': 900,
  'dedhso': 150, 'derhso': 150, 'dedhsou': 150, 'डेढ़सौ': 150,
  'dhaiso': 250, 'dhaayiso': 250, 'dhaisou': 250, 'ढाईसौ': 250,
  // Fast spoken thousands (1000 - 10000)
  'ekhazar': 1000, 'ekhazaar': 1000, 'एकहजार': 1000,
  'dohazar': 2000, 'dohazaar': 2000, 'दोहजार': 2000,
  'teenhazar': 3000, 'teenhazaar': 3000, 'तीन्हजार': 3000,
  'charhazar': 4000, 'chaarhazar': 4000, 'चारहजार': 4000,
  'panchhazar': 5000, 'paanchhazar': 5000, 'पांचहजार': 5000,
  'dashazar': 10000, 'दसहजार': 10000,
};

/**
 * Converts Devanagari numerals ०-९ to standard digits 0-9
 */
export function convertDevanagariNumerals(text) {
  if (!text) return '';
  return text.replace(/[०-९]/g, d => DEVANAGARI_DIGIT_MAP[d] || d);
}

/**
 * Parses comprehensive Hindi and English spoken number expressions
 */
export function parseHindiSpokenNumber(text) {
  if (!text) return null;
  let clean = convertDevanagariNumerals(text.toLowerCase()).trim();

  // Strip 10-digit Indian mobile numbers (e.g. 9876543210, +919876543210, phone 9812345678)
  // so they are never mistakenly parsed as transaction amounts!
  clean = clean.replace(/(?:phone|mobile|mob|no|number|फोन|मोबाइल|नंबर)?\s*(?:\+?91[\-\s]?)?[6-9]\d{9}\b/gi, ' ');
  clean = clean.replace(/\s+/g, ' ').trim();

  // Fast check: Rapid colloquial speech compound numbers (e.g. doso, paanso, dedhso, ekhazar)
  for (const [fastWord, fastVal] of Object.entries(HINDI_FAST_NUMBER_MAP)) {
    if (new RegExp(`(?:^|\\s)${fastWord}(?:\\s|$)`, 'i').test(clean)) {
      return fastVal;
    }
  }

  // Fast check: "2k", "2.5k", "5k" notation
  const kMatch = clean.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*k\b/i);
  if (kMatch) {
    const kVal = parseFloat(kMatch[1]) * 1000;
    if (kVal > 0) return kVal;
  }

  // Check if text has unit multipliers (e.g. "5 lakh", "2 crore", "2 हजार", "साढ़े चार सौ")
  const hasUnitMultiplier = /(?:\b(?:lakh|crore|cr|lac|hazar|hazaar|sau|so)\b|लाख|करोड़|करोड|हज़ार|हजार|सौ)/i.test(clean);

  // Check 1: Direct digits (₹2500, 2500 rs, 2,500, 450.50) when not accompanied by unit multiplier
  if (!hasUnitMultiplier) {
    const directDigitMatch = clean.match(/(?:₹|rs\.?|inr|रू|रुपये|रुपए|रुपया)?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:₹|rs\.?|inr|\/-|रू|रुपये|रुपए|रुपया|(?:\s|$))/i);
    if (directDigitMatch) {
      const val = parseFloat(directDigitMatch[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0) {
        return val;
      }
    }

    // Check 2: Standalone 2 to 7 digit integer
    const standaloneMatch = clean.match(/(?:^|\s)(\d{2,7})(?:\s|$)/);
    if (standaloneMatch) {
      const val = parseInt(standaloneMatch[1], 10);
      if (!isNaN(val) && val > 0) {
        return val;
      }
    }
  }

  // Check 3: Fractional Special Idioms
  // डेढ़ (1.5)
  if (/(?:डेढ़|derh|dedh)\s*(?:हज़ार|हजार|hazar|hazaar)/.test(clean)) return 1500;
  if (/(?:डेढ़|derh|dedh)\s*(?:सौ|sau|so)/.test(clean)) return 150;
  if (/(?:डेढ़|derh|dedh)\s*(?:लाख|lakh)/.test(clean)) return 150000;

  // ढाई (2.5)
  if (/(?:ढाई|dhai|dhaai)\s*(?:हज़ार|हजार|hazar|hazaar)/.test(clean)) return 2500;
  if (/(?:ढाई|dhai|dhaai)\s*(?:सौ|sau|so)/.test(clean)) return 250;
  if (/(?:ढाई|dhai|dhaai)\s*(?:लाख|lakh)/.test(clean)) return 250000;

  // सवा (1.25 / N + 0.25)
  if (/(?:सवा|sawa|sawwa)\s*(?:सौ|sau|so)/.test(clean) && !/(?:सवा|sawa|sawwa)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:सौ|sau|so)/.test(clean)) return 125;
  if (/(?:सवा|sawa|sawwa)\s*(?:हज़ार|हजार|hazar|hazaar)/.test(clean) && !/(?:सवा|sawa|sawwa)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:हज़ार|हजार|hazar)/.test(clean)) return 1250;
  if (/(?:सवा|sawa|sawwa)\s*(?:लाख|lakh)/.test(clean) && !/(?:सवा|sawa|sawwa)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:लाख|lakh)/.test(clean)) return 125000;

  const sawaThousand = clean.match(/(?:सवा|sawa|sawwa)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:हज़ार|हजार|hazar)/i);
  if (sawaThousand) {
    const base = parseInt(sawaThousand[1], 10) || HINDI_WORDS_MAP[sawaThousand[1]];
    if (base) return base * 1000 + 250;
  }
  const sawaHundred = clean.match(/(?:सवा|sawa|sawwa)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:सौ|sau|so)/i);
  if (sawaHundred) {
    const base = parseInt(sawaHundred[1], 10) || HINDI_WORDS_MAP[sawaHundred[1]];
    if (base) return base * 100 + 25;
  }

  // पौने (0.75 / N - 0.25)
  if (/(?:पौने|paune|pone)\s*(?:सौ|sau|so)/.test(clean) && !/(?:पौने|paune|pone)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:सौ|sau|so)/.test(clean)) return 75;
  if (/(?:पौने|paune|pone)\s*(?:हज़ार|हजार|hazar|hazaar)/.test(clean) && !/(?:पौने|paune|pone)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:हज़ार|हजार|hazar)/.test(clean)) return 750;
  if (/(?:पौने|paune|pone)\s*(?:लाख|lakh)/.test(clean) && !/(?:पौने|paune|pone)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:लाख|lakh)/.test(clean)) return 75000;

  const pauneThousand = clean.match(/(?:पौने|paune|pone)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:हज़ार|हजार|hazar)/i);
  if (pauneThousand) {
    const base = parseInt(pauneThousand[1], 10) || HINDI_WORDS_MAP[pauneThousand[1]];
    if (base) return (base - 1) * 1000 + 750;
  }
  const pauneHundred = clean.match(/(?:पौने|paune|pone)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:सौ|sau|so)/i);
  if (pauneHundred) {
    const base = parseInt(pauneHundred[1], 10) || HINDI_WORDS_MAP[pauneHundred[1]];
    if (base) return (base - 1) * 100 + 75;
  }

  // साढ़े (X.5) e.g. "साढ़े तीन हजार" -> 3500, "साढ़े चार सौ" -> 450
  const sadheThousand = clean.match(/(?:साढ़े|sadhe|saadhe)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:हज़ार|हजार|hazar)/i);
  if (sadheThousand) {
    const base = parseInt(sadheThousand[1], 10) || HINDI_WORDS_MAP[sadheThousand[1]];
    if (base) return base * 1000 + 500;
  }

  const sadheHundred = clean.match(/(?:साढ़े|sadhe|saadhe)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:सौ|sau|so)/i);
  if (sadheHundred) {
    const base = parseInt(sadheHundred[1], 10) || HINDI_WORDS_MAP[sadheHundred[1]];
    if (base) return base * 100 + 50;
  }

  const sadheLakh = clean.match(/(?:साढ़े|sadhe|saadhe)\s+([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:लाख|lakh)/i);
  if (sadheLakh) {
    const base = parseInt(sadheLakh[1], 10) || HINDI_WORDS_MAP[sadheLakh[1]];
    if (base) return base * 100000 + 50000;
  }

  // Check 4: Multi-Word Compounds (Crores, Lakhs, Thousands, Hundreds, Tens)
  let total = 0;
  let hasFoundNumber = false;

  // Check crores: [N] करोड़ / crore
  const croreRegex = /([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:करोड़|करोड|crore|cr)(?:\s|$)/i;
  const crMatch = clean.match(croreRegex);
  if (crMatch) {
    const val = parseInt(crMatch[1], 10) || HINDI_WORDS_MAP[crMatch[1]];
    if (val) {
      total += val * 10000000;
      hasFoundNumber = true;
    }
  }

  // Check lakhs: [N] लाख / lakh
  const lakhRegex = /([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:लाख|lakh|lac)(?:\s|$)/i;
  const lkMatch = clean.match(lakhRegex);
  if (lkMatch) {
    const val = parseInt(lkMatch[1], 10) || HINDI_WORDS_MAP[lkMatch[1]];
    if (val) {
      total += val * 100000;
      hasFoundNumber = true;
    }
  }

  // Check thousands: [N] हजार / hazar
  const thousandRegex = /([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:हज़ार|हजार|hazar|hazaar|k)(?:\s|$)/i;
  const thMatch = clean.match(thousandRegex);
  if (thMatch) {
    const val = parseInt(thMatch[1], 10) || HINDI_WORDS_MAP[thMatch[1]];
    if (val) {
      total += val * 1000;
      hasFoundNumber = true;
    }
  }

  // Check hundreds: [N] सौ / sau / so
  const hundredRegex = /([a-zA-Z\u0900-\u097F]+|\d+)\s*(?:सौ|sau|so)(?:\s|$)/i;
  const hMatch = clean.match(hundredRegex);
  if (hMatch) {
    const val = parseInt(hMatch[1], 10) || HINDI_WORDS_MAP[hMatch[1]];
    if (val) {
      total += val * 100;
      hasFoundNumber = true;
    }
  }

  // Check trailing tens/units: e.g. "पचास" in "चार हजार आठ सौ पचास"
  const words = clean.split(/\s+/);
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/(?:हज़ार|हजार|hazar|सौ|sau|so|लाख|lakh|करोड़|crore|रुपये|रुपए|रुपया|rupaye|rs|का|की|के|को|ने|से)/i.test(word)) continue;
    const val = HINDI_WORDS_MAP[word];
    if (val !== undefined && val < 100 && total > 0) {
      const nextWord = words[i + 1] || '';
      if (!/(?:हज़ार|हजार|hazar|सौ|sau|so|लाख|lakh|करोड़|crore)/i.test(nextWord)) {
        total += val;
        break;
      }
    }
  }

  if (hasFoundNumber && total > 0) {
    return total;
  }

  // Check 5: Standalone Hindi counting word (e.g. "पचास रुपये" -> 50, "हज़ार रुपये" -> 1000)
  for (const part of words) {
    const val = HINDI_WORDS_MAP[part];
    if (val !== undefined && val > 0) {
      return val;
    }
  }

  return null;
}
