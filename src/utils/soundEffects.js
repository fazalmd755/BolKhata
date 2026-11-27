// Web Audio API Synthesizer for instant, zero-dependency audio feedback
// Works 100% offline without external assets or network requests

let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Ascending chime when voice mic activates
 */
export function playMicStartSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
    
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.2);
  } catch (e) {
    console.debug('Audio play failed', e);
  }
}

/**
 * Gentle closing tone when mic stops listening
 */
export function playMicStopSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.12);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  } catch (e) {
    console.debug('Audio play failed', e);
  }
}

/**
 * Cheerful cash chime when transaction is saved (Khatabook/PhonePe style)
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // First bell
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    gain1.gain.setValueAtTime(0.18, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second bell (higher fifth)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12); // A5
    gain2.gain.setValueAtTime(0.2, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);

  } catch (e) {
    console.debug('Audio play failed', e);
  }
}

// Dual-Engine Text-to-Speech Architecture:
// Engine 1: Crystal-clear Google Hindi Female Voice Audio Stream (works in Android WebView, Chrome, Safari, Edge)
// Engine 2: Local Web Speech API with Female Voice Selector fallback (offline support)

let currentTtsAudio = null;

/**
 * Stops any active speech audio or speech synthesis utterance
 */
export function stopSpeaking() {
  if (currentTtsAudio) {
    try {
      currentTtsAudio.pause();
      currentTtsAudio.currentTime = 0;
    } catch (e) {}
    currentTtsAudio = null;
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Plays high-fidelity natural Indian female voice audio stream via Google TTS
 * Works reliably inside Android WebViews (where WebSpeech is disabled) and all mobile/desktop browsers!
 */
export function playOnlineTts(text, lang = 'hi') {
  return new Promise((resolve, reject) => {
    if (!text || typeof window === 'undefined') {
      return reject(new Error('No text or window'));
    }

    // Clean text: strip markdown symbols, asterisks, brackets, formatting
    const cleanText = text
      .replace(/[*_#`~[\]]/g, '')
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 190); // Google TTS query limit

    if (!cleanText) return resolve(false);

    // Stop previous audio
    stopSpeaking();

    // High quality crystal-clear Indian female voice stream
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(cleanText)}&tl=${lang}&client=tw-ob`;
    const audio = new Audio(audioUrl);
    currentTtsAudio = audio;

    audio.onended = () => {
      if (currentTtsAudio === audio) currentTtsAudio = null;
      resolve(true);
    };

    audio.onerror = (err) => {
      if (currentTtsAudio === audio) currentTtsAudio = null;
      reject(err);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.then(() => resolve(true)).catch((playErr) => {
        if (currentTtsAudio === audio) currentTtsAudio = null;
        reject(playErr);
      });
    }
  });
}

/**
 * Finds the highest quality female voice available on the device
 */
export function getBestFemaleVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Hindi Female Voice (Google हिन्दी, Swara, Heera, Kavita, Kalpana, Lekha)
  const hindiFemale = voices.find(v => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    const isHindi = l.startsWith('hi') || l.includes('hi_in') || l.includes('hi-in');
    const isFemale = /female|महिला|zira|swara|kavita|heera|kalpana|lekha|aditi|priya|geeta|sunita|neerja|woman/i.test(n) ||
                     (v.gender && v.gender.toLowerCase() === 'female');
    return isHindi && isFemale;
  });
  if (hindiFemale) return hindiFemale;

  // 2. Any Hindi Voice (On Android / Chrome, Google हिन्दी voice default is female)
  const anyHindi = voices.find(v => {
    const l = (v.lang || '').toLowerCase();
    return l.startsWith('hi') || l.includes('hi-in') || l.includes('hi_in');
  });
  if (anyHindi) return anyHindi;

  // 3. Indian English Female Voice (en-IN female e.g. Neerja, Priya, Aditi, Heera)
  const indianEnglishFemale = voices.find(v => {
    const l = (v.lang || '').toLowerCase();
    const n = (v.name || '').toLowerCase();
    const isIndian = l.includes('in') || /india/i.test(n);
    const isFemale = /female|zira|swara|neerja|aditi|priya|heera|kavita/i.test(n);
    return isIndian && isFemale;
  });
  if (indianEnglishFemale) return indianEnglishFemale;

  // 4. Any Indian English Voice (en-IN)
  const anyIndianEnglish = voices.find(v => {
    const l = (v.lang || '').toLowerCase();
    return l === 'en-in' || l === 'en_in';
  });
  if (anyIndianEnglish) return anyIndianEnglish;

  // 5. Windows / System Built-in Female Voice (Microsoft Zira Desktop - installed on Windows!)
  const systemFemale = voices.find(v => {
    const n = (v.name || '').toLowerCase();
    return /zira|female|woman|jenny|samantha|victoria|karen|susan/i.test(n) ||
           (v.gender && v.gender.toLowerCase() === 'female');
  });
  if (systemFemale) return systemFemale;

  // 6. Default fallback voice
  return voices.find(v => v.default) || voices[0] || null;
}

// Pre-fetch voices as soon as speech synthesis is available
if (typeof window !== 'undefined' && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }
}

// Systematic Hindi Devanagari to Romanized Hinglish transliterator
// Guarantees that English TTS engines (like Microsoft Zira on Windows) never stay silent on Devanagari script!
const VOWELS = {
  'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au'
};
const MATRAS = {
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ँ': 'n', 'ः': 'h'
};
const CONSONANTS = {
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'ड़': 'd', 'ढ़': 'dh', 'ज़': 'z', 'फ़': 'f'
};

export function transliterateHindiToEnglishPhonetic(text) {
  if (!text) return '';
  let out = '';
  const len = text.length;

  for (let i = 0; i < len; i++) {
    const ch = text[i];
    const next = text[i + 1] || '';

    if (VOWELS[ch]) {
      out += VOWELS[ch];
    } else if (MATRAS[ch]) {
      out += MATRAS[ch];
    } else if (CONSONANTS[ch]) {
      out += CONSONANTS[ch];
      if (next === '्') {
        i++; // skip halant
      } else if (!MATRAS[next] && next !== ' ' && next !== '।' && next !== '.' && next !== ',' && next !== '!' && i + 1 < len && CONSONANTS[next]) {
        out += 'a';
      }
    } else if (ch === '।') {
      out += '.';
    } else {
      out += ch;
    }
  }
  return out.replace(/\s+/g, ' ').trim();
}

/**
 * Fallback Web Speech Synthesis with Female Voice priority
 */
export function speakViaWebSpeech(text, preferredLang = 'hi-IN') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false;

  try {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
    window.speechSynthesis.cancel();

    const voice = getBestFemaleVoice();
    const isHindiVoice = voice && (voice.lang || '').toLowerCase().startsWith('hi');

    // If selected voice is an English voice (like Microsoft Zira on Windows),
    // convert Devanagari to Romanized Hinglish so it speaks out loud with perfect audibility!
    let textToSpeak = text.replace(/[*_#`~[\]•]/g, '').trim();
    if (!isHindiVoice && /[\u0900-\u097F]/.test(textToSpeak)) {
      textToSpeak = transliterateHindiToEnglishPhonetic(textToSpeak);
    }

    if (!textToSpeak) return false;

    // Wait a brief tick after cancel to prevent Chrome auto-cancel bug
    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        if (voice) {
          utterance.voice = voice;
          utterance.lang = voice.lang;
        } else {
          utterance.lang = isHindiVoice ? preferredLang : 'en-US';
        }

        utterance.pitch = 1.18; // Sweet, warm feminine pitch
        utterance.rate = 0.94;  // Natural kirana munshi pace
        utterance.volume = 1.0;

        utterance.onstart = () => {
          console.log('[BolKhata TTS] Speech started:', textToSpeak);
        };

        utterance.onerror = (e) => {
          console.warn('[BolKhata TTS] Utterance error:', e);
        };

        window.speechSynthesis.speak(utterance);
      } catch (inner) {
        console.warn('[BolKhata TTS] inner speak error', inner);
      }
    }, 40);

    return true;
  } catch (err) {
    console.debug('WebSpeech fallback error', err);
    return false;
  }
}

/**
 * Master Text-to-speech engine:
 * 1. Checks Native Android TTS bridge (when running in Android Studio / Capacitor APK)
 * 2. Tries High-Quality Google Female Voice stream (with 1.5s strict timeout so it never hangs)
 * 3. Fallbacks to Web Speech API with automatic transliteration for Windows/Mac English voices
 */
export async function speakText(text, preferredLang = 'hi-IN') {
  if (!text || typeof window === 'undefined') return;

  // 1. Android Native App Support: If running inside Android Capacitor APK with native TextToSpeech bridge
  if (window.AndroidTTS && typeof window.AndroidTTS.speak === 'function') {
    try {
      window.AndroidTTS.speak(text);
      return;
    } catch (androidErr) {
      console.warn('Native Android TTS error:', androidErr);
    }
  }

  // 2. Try High-Quality Google Indian Female Voice stream (with 1.5s timeout)
  try {
    const ttsPromise = playOnlineTts(text, 'hi');
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('TTS network timeout')), 1500)
    );
    const ok = await Promise.race([ttsPromise, timeoutPromise]);
    if (ok) return;
  } catch (err) {
    console.debug('Online TTS unavailable or timed out, falling back to Web Speech API');
  }

  // 3. Fallback to Web Speech API
  speakViaWebSpeech(text, preferredLang);
}
