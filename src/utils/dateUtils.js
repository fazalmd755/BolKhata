// Date utilities for Indian shopkeeper ledger relative date parsing and formatting

const WEEKDAYS = {
  somwar: 1, monday: 1, mon: 1,
  mangalwar: 2, mangal: 2, tuesday: 2, tue: 2,
  budhwar: 3, budh: 3, wednesday: 3, wed: 3,
  guruwar: 4, brihaspatiwar: 4, veerwar: 4, thursday: 4, thu: 4,
  shukrawar: 5, shukra: 5, jumma: 5, friday: 5, fri: 5,
  shaniwar: 6, shani: 6, saturday: 6, sat: 6,
  ravivar: 0, itwar: 0, sunday: 0, sun: 0,
};

/**
 * Parses relative Indian date expressions such as:
 * - "kal", "parson", "aaj"
 * - "agle somwar", "agle mangalwar", "agle Tuesday", "somwar ko"
 * - "3 din baad", "5 din me", "hafta bhar me", "agle hafte", "15 din baad"
 * - "agle mahine", "tarikh ko"
 */
export function parseRelativeDate(text, intent = 'credit') {
  if (!text) return null;
  const lower = text.toLowerCase();
  const now = new Date();

  // "aaj" -> today
  if (/\b(aaj|today)\b/i.test(lower)) {
    return formatDateISO(now);
  }

  // "kal" -> context dependent:
  // For udhaar / credit (e.g. "kal denge", "kal aayega") -> tomorrow (+1 day)
  // For payment (e.g. "kal diye the", "kal mila") -> yesterday (-1 day)
  if (/\bkal\b/i.test(lower)) {
    const d = new Date(now);
    if (intent === 'payment' || /\b(diye the|diye|aaye the|hua tha)\b/i.test(lower)) {
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() + 1);
    }
    return formatDateISO(d);
  }

  // "parson" -> +2 days (or -2 if past tense)
  if (/\b(parson|tarson)\b/i.test(lower)) {
    const d = new Date(now);
    if (intent === 'payment' && /\b(diye the|aaye the)\b/i.test(lower)) {
      d.setDate(d.getDate() - 2);
    } else {
      d.setDate(d.getDate() + 2);
    }
    return formatDateISO(d);
  }

  // "N din baad" or "N din me" or "in N days"
  const daysMatch = lower.match(/(\d+|ek|do|teen|chaar|char|paanch|chhah|saat|aath|nau|das)\s*(din|days?)\s*(baad|me|mein|after|later)?/i);
  if (daysMatch) {
    const numWords = { ek: 1, do: 2, teen: 3, chaar: 4, char: 4, paanch: 5, chhah: 6, saat: 7, aath: 8, nau: 9, das: 10 };
    const daysToAdd = parseInt(daysMatch[1], 10) || numWords[daysMatch[1].toLowerCase()] || 3;
    const d = new Date(now);
    d.setDate(d.getDate() + daysToAdd);
    return formatDateISO(d);
  }

  // "agle hafte" / "next week" / "hafta bhar me"
  if (/\b(agle hafte|hafta bhar me|next week|1 week|ek hafte baad)\b/i.test(lower)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return formatDateISO(d);
  }

  // "agle [weekday]" or "[weekday] ko" or "[weekday] tak"
  for (const [dayName, targetDay] of Object.entries(WEEKDAYS)) {
    const regex = new RegExp(`\\b(agle|next)?\\s*${dayName}\\s*(ko|tak|denge)?\\b`, 'i');
    if (regex.test(lower)) {
      const d = new Date(now);
      const currentDay = d.getDay();
      let diff = targetDay - currentDay;
      if (diff <= 0) diff += 7; // next occurrence
      d.setDate(d.getDate() + diff);
      return formatDateISO(d);
    }
  }

  // Default fallback for credit: 7 days due date
  if (intent === 'credit') {
    const d = new Date(now);
    d.setDate(d.getDate() + 7);
    return formatDateISO(d);
  }

  return toLocalDateKey(now);
}

/**
 * Converts any Date object, ISO string, or timestamp into local YYYY-MM-DD date key.
 * Solves the UTC vs IST timezone bug (where entries before 5:30 AM counted as yesterday).
 */
export function toLocalDateKey(date = new Date()) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Checks if two dates fall on the same calendar date in the local timezone
 */
export function isSameLocalDate(dateA, dateB) {
  return toLocalDateKey(dateA) === toLocalDateKey(dateB);
}

export function formatDateISO(date) {
  return toLocalDateKey(date);
}

export function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  
  const todayKey = toLocalDateKey(new Date());
  const dateKey = toLocalDateKey(d);
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday);
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKey = toLocalDateKey(tomorrow);

  if (dateKey === todayKey) {
    return 'Today, ' + d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  }
  if (dateKey === yesterdayKey) {
    return 'Yesterday';
  }
  if (dateKey === tomorrowKey) {
    return 'Tomorrow';
  }

  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  
  const todayKey = toLocalDateKey(new Date());
  const dateKey = toLocalDateKey(d);
  if (dateKey === todayKey) return 'Today';

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateKey === toLocalDateKey(yesterday)) return 'Yesterday';

  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays >= 1 && diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  const dueKey = toLocalDateKey(dueDateStr);
  const todayKey = toLocalDateKey(new Date());
  return Boolean(dueKey && todayKey && dueKey < todayKey);
}

export function getDaysOverdue(dueDateStr) {
  if (!dueDateStr) return 0;
  const dueKey = toLocalDateKey(dueDateStr);
  const todayKey = toLocalDateKey(new Date());
  if (!dueKey || !todayKey || dueKey >= todayKey) return 0;

  const due = new Date(dueKey + 'T00:00:00');
  const today = new Date(todayKey + 'T00:00:00');
  const diffMs = today.getTime() - due.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return days > 0 ? days : 0;
}
