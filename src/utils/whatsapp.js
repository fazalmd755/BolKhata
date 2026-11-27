// WhatsApp Reminder & UPI Payment Link Generator for BolKhata

/**
 * Builds mock or real UPI deep link for QR and direct payment
 */
export function generateUpiLink({ upiId = 'guptakirana@upi', shopName = 'Gupta Kirana Store', amount = 0, note = 'BolKhata Udhaar Payment' }) {
  const cleanAmount = Number(amount).toFixed(2);
  const encodedName = encodeURIComponent(shopName);
  const encodedNote = encodeURIComponent(note);
  return `upi://pay?pa=${upiId}&pn=${encodedName}&am=${cleanAmount}&cu=INR&tn=${encodedNote}`;
}

export const REMINDER_TEMPLATES = [
  {
    id: 'friendly',
    name: 'Friendly (नर्म तकादा)',
    generate: ({ customerName, amount, shopName, upiId, dueDate }) => 
`नमस्ते ${customerName} जी 🙏,
${shopName} से आपका कुल बकाया (उधार) हिसाब ₹${amount.toLocaleString('en-IN')} है।

कृपया समय मिलने पर UPI या दुकान पर आकर जमा करवा दें।
UPI Pay Link:
upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR&tn=KhataPayment

धन्यवाद!
- ${shopName}`
  },
  {
    id: 'standard',
    name: 'Standard Ledger (डिजिटल रसीद)',
    generate: ({ customerName, amount, shopName, upiId, dueDate }) => 
`📢 BolKhata Payment Reminder
ग्राहक: ${customerName}
दुकान: ${shopName}
बकाया राशि (Pending Balance): ₹${amount.toLocaleString('en-IN')}
${dueDate ? `भुगतान देय तिथि (Due Date): ${dueDate}\n` : ''}
तुरंत भुगतान करने हेतु UPI लिंक पर क्लिक करें:
upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR

खाता सुरक्षित और पारदर्शी रखने हेतु धन्यवाद।`
  },
  {
    id: 'urgent',
    name: 'Overdue / Urgent (समय सीमा स्मरण)',
    generate: ({ customerName, amount, shopName, upiId, dueDate }) => 
`जरूरी सूचना: आदरणीय ${customerName} जी,
${shopName} पर आपका ₹${amount.toLocaleString('en-IN')} का उधारी खाता काफी समय से लंबित है।

दुकान का नया सामान मंगवाने हेतु आज ही भुगतान करने की कृपा करें।
UPI ID: ${upiId}
Direct UPI Link: upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR

संपर्क: ${shopName}`
  },
  {
    id: 'short',
    name: 'Quick & Crisp (छोटा संदेश)',
    generate: ({ customerName, amount, shopName, upiId }) => 
`राम-राम ${customerName} जी, ${shopName} का कुल हिसाब ₹${amount.toLocaleString('en-IN')} बाकी है। कृपया इस UPI पर भेजें: ${upiId} (Link: upi://pay?pa=${upiId}&pn=${encodeURIComponent(shopName)}&am=${amount}&cu=INR)`
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
