// ID generation utility with crypto.randomUUID and fallback

export function generateId(prefix = 'id') {
  let uuid;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      uuid = crypto.randomUUID();
    } catch (e) {
      uuid = null;
    }
  }

  if (!uuid) {
    // Fallback using crypto.getRandomValues if available or timestamp + high-entropy random
    if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      uuid = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
      uuid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    }
  }

  return prefix ? `${prefix}_${uuid}` : uuid;
}
