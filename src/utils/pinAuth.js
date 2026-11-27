/**
 * BolKhata PIN Security & Encryption Helper (C4)
 * Uses Web Crypto API (SubtleCrypto SHA-256 with salt) for zero-dependency secure client-side PIN hashing.
 */

const PIN_STORE_KEY = 'bolkhata_pin_security';

/**
 * Generates cryptographically secure hex salt
 */
function generateSalt(length = 16) {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Hashes PIN + Salt using SHA-256
 */
async function hashPinWithSalt(pin, salt) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${pin}:${salt}:bolkhata_secure_salt`);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Retrieves current PIN configuration
 */
export function getPinConfig() {
  try {
    const raw = localStorage.getItem(PIN_STORE_KEY);
    if (!raw) return { enabled: false, pinHash: null, salt: null, autoLockMinutes: 5 };
    return JSON.parse(raw);
  } catch (e) {
    return { enabled: false, pinHash: null, salt: null, autoLockMinutes: 5 };
  }
}

/**
 * Saves PIN configuration
 */
export async function setupAppPin(pin, autoLockMinutes = 5) {
  if (!pin || pin.length < 4 || pin.length > 6) {
    return { success: false, error: 'PIN must be 4 to 6 digits' };
  }
  const salt = generateSalt();
  const pinHash = await hashPinWithSalt(pin, salt);
  const config = {
    enabled: true,
    pinHash,
    salt,
    autoLockMinutes,
    updatedAt: new Date().toISOString()
  };
  localStorage.setItem(PIN_STORE_KEY, JSON.stringify(config));
  return { success: true };
}

/**
 * Disables App Lock PIN
 */
export function disableAppPin() {
  localStorage.removeItem(PIN_STORE_KEY);
  return { success: true };
}

/**
 * Verifies entered PIN against stored hash
 */
export async function verifyAppPin(inputPin) {
  const config = getPinConfig();
  if (!config.enabled || !config.pinHash || !config.salt) {
    return { success: true, bypassed: true };
  }
  const computedHash = await hashPinWithSalt(inputPin, config.salt);
  const isValid = computedHash === config.pinHash;
  return { success: isValid, error: isValid ? null : 'गलत पिन दर्ज किया (Incorrect PIN)' };
}
