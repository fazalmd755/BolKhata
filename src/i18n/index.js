import { useMemo, useCallback } from 'react';
import { useKhata } from '../context/KhataContext';

/**
 * Normalizes any stored language code ('hi', 'hi-IN', 'en', 'en-IN') to 'hi' (Hinglish/Hindi) or 'en' (English).
 */
export function normalizeUiLang(lang) {
  if (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'hi';
}

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
    done: 'समझ गया (Done)',
    share: 'शेयर',
    print: 'प्रिंट',
    copy: 'कॉपी',
    copied: 'कॉपी हो गया!',
    entries: 'एंट्रीज',
    customers_unit: 'ग्राहक',
    late_days: 'दिन लेट',
    due_badge: 'बाकी (Due)',
    clear_badge: 'चुकता (Clear)',
    click_to_view_khata: 'क्लिक करके खाता देखें',
    send_reminder_short: 'तकादा',
    add_entry_short: 'एंट्री',

    // Header & Nav
    brand_subtitle: 'बोलखाता',
    brand_ledger_tag: 'डिजिटल बही-खाता',
    active_ledger: 'Active Ledger',
    ai_munshi: 'AI मुंशी',
    nav_home: 'होम',
    nav_dashboard: 'डैशबोर्ड (Dashboard)',
    nav_customers: 'खाता',
    nav_customers_full: 'ग्राहक खाता (Customers)',
    nav_transactions: 'लेन-देन बही (Transactions)',
    nav_ai_assistant: 'AI मुंशी (Voice Assistant)',
    nav_reports: 'रिपोर्ट',
    nav_reports_full: 'डेबुक एवं रिपोर्ट (Reports)',
    nav_settings: 'सेटिंग्स',
    nav_settings_full: 'दुकान सेटिंग्स (Settings)',
    speak_short: 'बोलें',
    new_customer_btn: '+ नया ग्राहक',

    // Dashboard & Home
    backup_reminder_title: 'बैकअप रिमाइंडर: ',
    backup_reminder_desc: 'अंतिम बैकअप 7 दिन से पुराना है। सेटिंग्स में जाकर बैकअप सुरक्षित करें।',
    total_udhaar: 'कुल बकाया उधार',
    remaining_short: 'बाकी',
    today_collection: 'आज की वसूली (Jama)',
    today_jama_label: 'आज का जमा (Today)',
    overdue_count: 'तारीख पार (Overdue)',
    customers_late: 'ग्राहक लेट',
    customers_pending: 'ग्राहकों पर बाकी',
    total_customers: 'कुल ग्राहक',
    digital_register: 'डिजिटल रजिस्टर',
    search_customers_placeholder: 'ग्राहक का नाम या फोन नंबर खोजें...',
    ai_card_title: 'बोलखाता AI मुंशी से बात करें',
    ai_card_subtitle: "पूछें: 'कुल कितना बकाया है?', 'नया ग्राहक जोड़ो' या 'आज मोहन ने 1000 लिया'",
    voice_entry: 'बोलकर लिखें',
    manual_entry: 'मैन्युअल एंट्री',
    instant_voice: 'आवाज से एंट्री करें',
    quick_reports: 'रिपोर्ट्स',
    recent_transactions: 'हाल के लेन-देन (Recent Transactions)',
    view_all: 'सभी देखें',
    no_transactions_yet: 'अभी तक कोई लेन-देन नहीं हुआ है।',
    top_debtors: 'प्रमुख बाकीदार ग्राहक (Top Pending)',
    no_pending_customers: 'सभी ग्राहकों का हिसाब चुकता है!',

    // Filters & Customer List
    filter_all: 'सभी (All)',
    filter_pending: 'बाकी उधार (Pending)',
    filter_overdue: 'अतिदेय (Overdue)',
    filter_cleared: 'चुकता (Cleared)',
    no_customers_found: 'कोई ग्राहक नहीं मिला',
    no_filter_customers: 'इस फ़िल्टर में कोई ग्राहक उपलब्ध नहीं है।',
    create_new_khata: 'नया खाता बनाएं',
    customer_list_title: 'ग्राहक सूची (Khata List)',

    // Ledger / Transactions / Reports
    credit_title: 'उधार दिया (Credit)',
    payment_title: 'जमा मिला (Got Payment)',
    opening_balance: 'आरंभिक बकाया (Opening Balance)',
    balance: 'बैलेंस',
    due_date: 'उधार चुकाने की तारीख',
    items_goods: 'सामान का विवरण',
    notes: 'टिप्पणी (नोट्स)',
    payment_method: 'भुगतान माध्यम',
    edited_badge: 'संपादित (Edited)',
    daybook_title: 'डेबुक एवं रिपोर्ट (Daybook & Reports)',
    daybook_subtitle: 'दैनिक आय-व्यय और उधारी सारांश',
    today_account: 'आज का हिसाब',
    today_entries: 'आज की एंट्रियां',
    no_entries_today: 'आज कोई एंट्री नहीं हुई है।',
    all_txns_title: 'लेन-देन बही (All Transactions Ledger)',
    search_txn_placeholder: 'ग्राहक या सामान खोजें...',
    export_csv: 'Excel (CSV) डाउनलोड',

    // Voice Flow
    voice_listening: 'सुन रहे हैं... रुकने पर स्वतः दर्ज होगा',
    voice_processing: 'पहचान रहे हैं...',
    voice_instruction: 'रुक-रुक कर आराम से बोलें, कट नहीं होगा',
    voice_long_session: 'लंबा सत्र (45s)',
    record_entry: 'खाता दर्ज करें (हो गया / Done)',
    tap_to_speak: 'माइक दबाकर बोलें (Tap to Speak)',
    ai_voice_title: 'BolKhata AI Voice',
    how_to_speak: 'बोलने का तरीका (ऐसे बोलें):',
    help_guide: 'सहायता गाइड',
    one_click_test: '1-क्लिक टेस्ट (Tap to Simulate Voice Input)',

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
    confirm_entry_title: 'लेन-देन की पुष्टि करें (Confirm Entry)',
    save_khata_btn: 'खाता सेव करें',
    manual_entry_title: 'मैन्युअल एंट्री (Manual Entry)',
    add_entry_tab: 'लेन-देन जोड़ें',
    new_customer_tab: 'नया ग्राहक जोड़ें',
    phone_connect_title: 'अपने फोन पर चलाएं',
    phone_connect_subtitle: 'QR कोड स्कैन करें और किसी भी मोबाइल पर उपयोग करें',
    scan_with_camera: 'कैमरा खोलकर स्कैन करें (Scan with Phone Camera)',
    same_wifi: 'Same Wi-Fi (Fastest)',
    custom_https: 'Custom / HTTPS URL',
    onboarding_welcome: 'BolKhata में आपका स्वागत है!',
    onboarding_subtitle: 'अपनी दुकान की जानकारी भरें और बोलकर खाता लिखना शुरू करें।',
    start_khata_btn: 'अपना डिजिटल खाता शुरू करें',

    // Settings
    settings_title: 'दुकान सेटिंग्स',
    settings_subtitle: 'दुकान प्रोफ़ाइल, भाषा, सुरक्षा और बैकअप',
    shop_profile_title: 'दुकान प्रोफ़ाइल (Shop Profile)',
    shop_name: 'दुकान का नाम',
    owner_name: 'दुकानदार का नाम',
    upi_id: 'UPI आईडी',
    upi_hint: 'WhatsApp तकादा में सुरक्षित UPI पेमेंट लिंक जोड़ने के लिए।',
    language_label: 'भाषा (Language Setting)',
    lang_hinglish_option: 'हिन्दी / Hinglish (डिफ़ॉल्ट)',
    lang_english_option: 'English (अंग्रेजी)',
    save_profile: 'प्रोफ़ाइल सेव करें',
    profile_saved: 'सेव हो गया!',
    security_pin: 'सुरक्षा पिन (App Lock)',
    pin_enabled_desc: 'सुरक्षा लॉक सक्रिय है',
    pin_disabled_desc: 'पिन लॉक बंद है',
    pin_enable_btn: 'PIN लगाएं',
    pin_disable_btn: 'PIN हटाएं',
    backup_data: 'डेटा बैकअप व डाउनलोड',
    restore_data: 'बैकअप रीस्टोर करें',
    demo_data: 'डेमो डेटा लोड करें',
    clear_all_data: 'सारा डेटा साफ करें (Fresh Start)',
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
    done: 'Done',
    share: 'Share',
    print: 'Print',
    copy: 'Copy',
    copied: 'Copied!',
    entries: 'entries',
    customers_unit: 'customers',
    late_days: 'd Late',
    due_badge: 'Due',
    clear_badge: 'Cleared',
    click_to_view_khata: 'Click to view ledger',
    send_reminder_short: 'Remind',
    add_entry_short: 'Entry',

    // Header & Nav
    brand_subtitle: 'BolKhata',
    brand_ledger_tag: 'Digital Ledger',
    active_ledger: 'Active Ledger',
    ai_munshi: 'AI Munshi',
    nav_home: 'Home',
    nav_dashboard: 'Dashboard',
    nav_customers: 'Khata',
    nav_customers_full: 'Customers',
    nav_transactions: 'Transactions',
    nav_ai_assistant: 'AI Munshi (Voice)',
    nav_reports: 'Reports',
    nav_reports_full: 'Daybook & Reports',
    nav_settings: 'Settings',
    nav_settings_full: 'Shop Settings',
    speak_short: 'Speak',
    new_customer_btn: '+ New Customer',

    // Dashboard & Home
    backup_reminder_title: 'Backup Reminder: ',
    backup_reminder_desc: 'Last backup is over 7 days old. Open Settings to back up your data.',
    total_udhaar: 'Total Pending Udhaar',
    remaining_short: 'Due',
    today_collection: "Today's Collections",
    today_jama_label: "Today's Jama",
    overdue_count: 'Overdue Customers',
    customers_late: 'customers overdue',
    customers_pending: 'customers pending',
    total_customers: 'Total Customers',
    digital_register: 'Digital Register',
    search_customers_placeholder: 'Search customer name or phone...',
    ai_card_title: 'Talk to BolKhata AI Munshi',
    ai_card_subtitle: "Ask: 'Total pending?', 'Add new customer' or 'Mohan took 1000 today'",
    voice_entry: 'Voice Entry',
    manual_entry: 'Manual Entry',
    instant_voice: 'Record with Voice',
    quick_reports: 'Reports',
    recent_transactions: 'Recent Transactions',
    view_all: 'View All',
    no_transactions_yet: 'No transactions recorded yet.',
    top_debtors: 'Top Pending Customers',
    no_pending_customers: 'All customer accounts are settled!',

    // Filters & Customer List
    filter_all: 'All',
    filter_pending: 'Pending',
    filter_overdue: 'Overdue',
    filter_cleared: 'Cleared',
    no_customers_found: 'No Customers Found',
    no_filter_customers: 'No customers match the current filter.',
    create_new_khata: 'Add New Customer',
    customer_list_title: 'Customer List',

    // Ledger / Transactions / Reports
    credit_title: 'Credit Given (Udhaar)',
    payment_title: 'Payment Received (Jama)',
    opening_balance: 'Opening Balance',
    balance: 'Balance',
    due_date: 'Due Date',
    items_goods: 'Items / Goods',
    notes: 'Notes / Remarks',
    payment_method: 'Payment Mode',
    edited_badge: 'Edited',
    daybook_title: 'Daybook & Reports',
    daybook_subtitle: 'Daily cashflow & credit summary',
    today_account: "Today's Summary",
    today_entries: "Today's Entries",
    no_entries_today: 'No entries recorded today.',
    all_txns_title: 'All Transactions Ledger',
    search_txn_placeholder: 'Search customer or items...',
    export_csv: 'Export CSV',

    // Voice Flow
    voice_listening: 'Listening... auto-saves when you pause',
    voice_processing: 'Processing voice...',
    voice_instruction: 'Speak naturally at your own pace',
    voice_long_session: 'Extended session (45s)',
    record_entry: 'Record Entry (Done)',
    tap_to_speak: 'Tap Mic to Speak',
    ai_voice_title: 'BolKhata AI Voice',
    how_to_speak: 'How to speak (Examples):',
    help_guide: 'Help Guide',
    one_click_test: '1-Click Test (Tap to Simulate Voice Input)',

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
    confirm_entry_title: 'Confirm Transaction',
    save_khata_btn: 'Save Entry',
    manual_entry_title: 'Manual Entry',
    add_entry_tab: 'Add Transaction',
    new_customer_tab: 'Add New Customer',
    phone_connect_title: 'Open on Your Phone',
    phone_connect_subtitle: 'Scan QR Code & Use on Any Mobile',
    scan_with_camera: 'Scan with Phone Camera',
    same_wifi: 'Same Wi-Fi (Fastest)',
    custom_https: 'Custom / HTTPS URL',
    onboarding_welcome: 'Welcome to BolKhata!',
    onboarding_subtitle: 'Enter your shop details and start managing your ledger by voice.',
    start_khata_btn: 'Start Your Digital Ledger',

    // Settings
    settings_title: 'Shop Settings',
    settings_subtitle: 'Shop profile, language, security & backup',
    shop_profile_title: 'Shop Profile',
    shop_name: 'Shop Name',
    owner_name: 'Owner Name',
    upi_id: 'UPI ID',
    upi_hint: 'Used to attach verified UPI payment links in WhatsApp reminders.',
    language_label: 'Language Setting',
    lang_hinglish_option: 'Hinglish / Hindi (Default)',
    lang_english_option: 'English',
    save_profile: 'Save Profile',
    profile_saved: 'Saved!',
    security_pin: 'Security PIN Lock',
    pin_enabled_desc: 'Security lock is active',
    pin_disabled_desc: 'PIN lock is disabled',
    pin_enable_btn: 'Set PIN',
    pin_disable_btn: 'Disable PIN',
    backup_data: 'Backup & Download Data',
    restore_data: 'Restore Backup',
    demo_data: 'Load Demo Data',
    clear_all_data: 'Clear All Data (Fresh Start)',
    privacy_notice: 'Privacy & Offline Mode'
  }
};

/**
 * Pure translation helper
 */
export function t(key, lang = 'hi') {
  const normalized = normalizeUiLang(lang);
  return DICTIONARY[normalized][key] || DICTIONARY['hi'][key] || key;
}

/**
 * Hook for components to access translation helper and language switcher bound to shop settings
 */
export function useTranslation() {
  const { shopSettings, setShopSettings } = useKhata();
  const currentLang = normalizeUiLang(shopSettings?.language);
  const isEnglish = currentLang === 'en';

  const translate = useMemo(() => {
    return (key) => t(key, currentLang);
  }, [currentLang]);

  const setLanguage = useCallback(
    (nextLang) => {
      const normalized = normalizeUiLang(nextLang);
      if (typeof setShopSettings === 'function') {
        setShopSettings((prev) => ({
          ...prev,
          language: normalized === 'en' ? 'en-IN' : 'hi-IN'
        }));
      }
    },
    [setShopSettings]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(currentLang === 'en' ? 'hi' : 'en');
  }, [currentLang, setLanguage]);

  return {
    t: translate,
    language: currentLang,
    isEnglish,
    setLanguage,
    toggleLanguage
  };
}
