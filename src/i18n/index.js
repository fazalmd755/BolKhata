import { useMemo } from 'react';
import { useKhata } from '../context/KhataContext';

export const DICTIONARY = {
  hi: {
    // Common
    cancel: 'रद्द करें',
    save: 'सुरक्षित करें',
    confirm: 'पुष्टि करें',
    delete: 'हटाएं',
    edit: 'बदलें / संपादित करें',
    close: 'बंद करें',
    undo: 'पूर्ववत (Undo)',
    search: 'ग्राहक खोजें...',
    back: 'वापस जाएं',
    retry: 'पुनः प्रयास करें',

    // Nav
    nav_home: 'होम',
    nav_customers: 'ग्राहक',
    nav_reports: 'रिपोर्ट',
    nav_settings: 'सेटिंग्स',

    // Dashboard
    total_udhaar: 'कुल बकाया उधार',
    today_collection: 'आज की वसूली (Jama)',
    overdue_count: 'तारीख पार (Overdue)',
    active_customers: 'सक्रिय खातेदार',
    voice_entry: 'बोलकर खाता लिखें',
    manual_entry: 'मैन्युअल एंट्री',
    instant_voice: 'आवाज से एंट्री करें',

    // Ledger / Transactions
    credit_title: 'उधार दिया (Credit)',
    payment_title: 'जमा मिला (Got Payment)',
    opening_balance: 'आरंभिक बकाया (Opening Balance)',
    balance: 'बैलेंस',
    due_date: 'उधार चुकाने की तारीख',
    items_goods: 'सामान का विवरण',
    notes: 'टिप्पणी (नोट्स)',
    payment_method: 'भुगतान माध्यम',
    edited_badge: 'संपादित (Edited)',

    // Voice Flow
    voice_listening: 'सुन रहे हैं... बोलना जारी रखें',
    voice_processing: 'पहचान रहे हैं...',
    voice_instruction: 'रुक-रुक कर आराम से बोलें, कट नहीं होगा',
    voice_long_session: 'लंबा सत्र (45s)',
    record_entry: 'खाता दर्ज करें (हो गया / Done)',
    tap_to_speak: 'माइक दबाकर बोलें (Tap to Speak)',

    // Customer & Modals
    new_customer: 'नया ग्राहक',
    add_customer: 'नया खाता जोड़ें',
    phone_number: 'मोबाइल नंबर',
    credit_limit: 'उधार सीमा (Limit)',
    address: 'पता / क्षेत्र',
    transaction_type: 'लेन-देन प्रकार (Transaction Type)',
    amount_rupees: 'राशि (Amount in ₹)',
    customer_name: 'ग्राहक का नाम (Customer Name)',
    whatsapp_reminder: 'व्हाट्सएप तगादा (WhatsApp Reminder)',
    send_reminder: 'तगादा भेजें (Send WhatsApp)',
    copy_message: 'मैसेज कॉपी करें',
    copied: 'कॉपी हो गया!',

    // Settings
    settings_title: 'दुकान सेटिंग्स',
    shop_name: 'दुकान का नाम',
    owner_name: 'दुकानदार का नाम',
    upi_id: 'UPI आईडी',
    language_label: 'भाषा (Language)',
    security_pin: 'सुरक्षा पिन (App Lock)',
    backup_data: 'डेटा बैकअप व डाउनलोड',
    restore_data: 'बैकअप रीस्टोर करें',
    demo_data: 'डेमो डेटा लोड करें',
    privacy_notice: 'गोपनीयता व ऑफलाइन मोड'
  },
  en: {
    // Common
    cancel: 'Cancel',
    save: 'Save',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    undo: 'Undo',
    search: 'Search customer...',
    back: 'Back',
    retry: 'Retry',

    // Nav
    nav_home: 'Home',
    nav_customers: 'Customers',
    nav_reports: 'Reports',
    nav_settings: 'Settings',

    // Dashboard
    total_udhaar: 'Total Pending Udhaar',
    today_collection: "Today's Collections",
    overdue_count: 'Overdue Customers',
    active_customers: 'Active Accounts',
    voice_entry: 'Voice Ledger Entry',
    manual_entry: 'Manual Entry',
    instant_voice: 'Record with Voice',

    // Ledger / Transactions
    credit_title: 'Credit Given (Udhaar)',
    payment_title: 'Payment Received (Jama)',
    opening_balance: 'Opening Balance',
    balance: 'Balance',
    due_date: 'Due Date',
    items_goods: 'Items / Goods',
    notes: 'Notes / Remarks',
    payment_method: 'Payment Mode',
    edited_badge: 'Edited',

    // Voice Flow
    voice_listening: 'Listening... please speak',
    voice_processing: 'Processing voice...',
    voice_instruction: 'Speak naturally at your own pace',
    voice_long_session: 'Extended session (45s)',
    record_entry: 'Record Entry (Done)',
    tap_to_speak: 'Tap Mic to Speak',

    // Customer & Modals
    new_customer: 'New Customer',
    add_customer: 'Add Customer Account',
    phone_number: 'Mobile Number',
    credit_limit: 'Credit Limit',
    address: 'Address / Area',
    transaction_type: 'Transaction Type',
    amount_rupees: 'Amount (in ₹)',
    customer_name: 'Customer Name',
    whatsapp_reminder: 'WhatsApp Reminder',
    send_reminder: 'Send WhatsApp Reminder',
    copy_message: 'Copy Message',
    copied: 'Copied!',

    // Settings
    settings_title: 'Shop Settings',
    shop_name: 'Shop Name',
    owner_name: 'Owner Name',
    upi_id: 'UPI ID',
    language_label: 'Language',
    security_pin: 'Security PIN Lock',
    backup_data: 'Backup & Download Data',
    restore_data: 'Restore Backup',
    demo_data: 'Load Demo Data',
    privacy_notice: 'Privacy & Offline Mode'
  }
};

/**
 * Pure translation helper
 */
export function t(key, lang = 'hi') {
  const selectedLang = DICTIONARY[lang] ? lang : 'hi';
  return DICTIONARY[selectedLang][key] || DICTIONARY['hi'][key] || key;
}

/**
 * Hook for components to access translation helper bound to current shop settings
 */
export function useTranslation() {
  const { shopSettings } = useKhata();
  const currentLang = shopSettings?.language || 'hi';

  const translate = useMemo(() => {
    return (key) => t(key, currentLang);
  }, [currentLang]);

  return {
    t: translate,
    language: currentLang
  };
}
