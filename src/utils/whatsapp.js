// WhatsApp Reminder & UPI Payment Link Generator for BolKhata
import { toUpiAmount } from './money';

/**
 * Validates UPI ID according to NPCI standard (C3)
 * ^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$
 */
export function isValidUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') return false;
  return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId.trim());
}

/**
 * Builds mock or real UPI deep link for QR and direct payment
 * Returns empty string if no valid UPI ID is provided (prevents sending wrong or dummy UPI)
 */
export function generateUpiLink({ upiId = '', shopName = '', amount = 0, note = 'BolKhata Udhaar Payment' }) {
  if (!isValidUpiId(upiId)) return '';
  const cleanAmount = toUpiAmount(amount);
  const encodedName = encodeURIComponent(shopName);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${upiId.trim()}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=${encodedNote}`;
}

export const REMINDER_TEMPLATES = [
  {
    id: 'friendly',
    name: 'Friendly (नर्म तकादा)',
    generate: ({ customerName, amount, shopName, upiId, dueDate }) => {
      const upiSection = isValidUpiId(upiId) 
        ? `\nUPI Pay Link:\nupi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(shopName)}&am=${toUpiAmount(amount)}&cu=INR&tn=KhataPayment\n` 
        : '';
      return `नमस्ते ${customerName} जी 🙏,
${shopName} से आपका कुल बकाया (उधार) हिसाब ₹${Number(amount).toLocaleString('en-IN')} है।

कृपया समय मिलने पर दुकान पर आकर या UPI द्वारा जमा करवा दें।${upiSection}
धन्यवाद!
- ${shopName}`;
    }
  },
  {
    id: 'standard',
    name: 'Standard Ledger (डिजिटल रसीद)',
    generate: ({ customerName, amount, shopName, upiId, dueDate }) => {
      const upiSection = isValidUpiId(upiId) 
        ? `\nतुरंत भुगतान करने हेतु UPI लिंक पर क्लिक करें:\nupi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(shopName)}&am=${toUpiAmount(amount)}&cu=INR\n` 
        : '';
      return `📢 BolKhata Payment Reminder
ग्राहक: ${customerName}
दुकान: ${shopName}
बकाया राशि (Pending Balance): ₹${Number(amount).toLocaleString('en-IN')}
${dueDate ? `भुगतान देय तिथि (Due Date): ${dueDate}\n` : ''}${upiSection}
खाता सुरक्षित और पारदर्शी रखने हेतु धन्यवाद।`;
    }
  },
  {
    id: 'urgent',
    name: 'Overdue / Urgent (समय सीमा स्मरण)',
    generate: ({ customerName, amount, shopName, upiId, dueDate }) => {
      const upiSection = isValidUpiId(upiId) 
        ? `\nUPI ID: ${upiId.trim()}\nDirect UPI Link: upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(shopName)}&am=${toUpiAmount(amount)}&cu=INR\n` 
        : '';
      return `जरूरी सूचना: आदरणीय ${customerName} जी,
${shopName} पर आपका ₹${Number(amount).toLocaleString('en-IN')} का उधारी खाता काफी समय से लंबित है।

दुकान का नया सामान मंगवाने हेतु आज ही भुगतान करने की कृपा करें।${upiSection}
संपर्क: ${shopName}`;
    }
  },
  {
    id: 'short',
    name: 'Quick & Crisp (छोटा संदेश)',
    generate: ({ customerName, amount, shopName, upiId }) => {
      const upiInfo = isValidUpiId(upiId) 
        ? ` कृपया इस UPI पर भेजें: ${upiId.trim()} (Link: upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(shopName)}&am=${toUpiAmount(amount)}&cu=INR)` 
        : '';
      return `राम-राम ${customerName} जी, ${shopName} का कुल हिसाब ₹${Number(amount).toLocaleString('en-IN')} बाकी है।${upiInfo}`;
    }
  }
];

/**
 * Creates wa.me URL
 */
export function createWhatsAppUrl(phone, message) {
  // Clean phone: keep only numbers
  let cleanPhone = (phone || '').replace(/\D/g, '');
  if (cleanPhone.length === 10) {
    cleanPhone = '91' + cleanPhone;
  }
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
