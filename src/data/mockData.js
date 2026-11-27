// Realistic Preloaded Data for BolKhata
// Designed specifically for Indian Kirana shopkeepers

export const DEFAULT_SHOP_SETTINGS = {
  shopName: '',
  merchantName: '',
  phone: '',
  upiId: '',
  language: 'hi-IN',
  soundEnabled: true,
  voiceReadoutEnabled: true,
  currency: '₹',
  onboardingCompleted: false,
  isDemoLoaded: false
};

export const DEMO_SHOP_SETTINGS = {
  shopName: 'Gupta Kirana Store',
  merchantName: 'Rakesh Gupta',
  phone: '9811234567',
  upiId: 'guptakirana@upi',
  language: 'hi-IN',
  soundEnabled: true,
  voiceReadoutEnabled: true,
  currency: '₹',
  onboardingCompleted: true,
  isDemoLoaded: true
};

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust_1',
    name: 'Ramesh Kirana',
    phone: '9823456789',
    address: 'Main Market, Near Clock Tower',
    balance: 2500,
    creditLimit: 10000,
    avatarColor: 'bg-emerald-600',
    createdAt: '2026-10-15T10:00:00.000Z',
    lastTransactionDate: '2026-11-24T16:30:00.000Z',
    dueDate: '2026-12-05',
    notes: 'Regular local grocer, always pays within 10 days',
  },
  {
    id: 'cust_2',
    name: 'Suresh Sharma',
    phone: '9412345678',
    address: 'House #12, Railway Colony',
    balance: 1200,
    creditLimit: 5000,
    avatarColor: 'bg-blue-600',
    createdAt: '2026-10-20T11:00:00.000Z',
    lastTransactionDate: '2026-11-26T09:15:00.000Z',
    dueDate: '2026-11-30',
    notes: 'Works in Indian Railways. Prefers paying via PhonePe UPI',
  },
  {
    id: 'cust_3',
    name: 'Mohan Lal',
    phone: '9898765432',
    address: 'Gali No. 3, Purani Basti',
    balance: 4850,
    creditLimit: 6000,
    avatarColor: 'bg-amber-600',
    createdAt: '2026-09-01T09:00:00.000Z',
    lastTransactionDate: '2026-11-10T14:20:00.000Z',
    dueDate: '2026-11-15', // Overdue!
    notes: 'Overdue by 11 days. Needs polite WhatsApp reminder',
  },
  {
    id: 'cust_4',
    name: 'Anita Devi',
    phone: '9765432109',
    address: 'Teacher Colony, Sector 2',
    balance: 350,
    creditLimit: 3000,
    avatarColor: 'bg-purple-600',
    createdAt: '2026-11-01T15:00:00.000Z',
    lastTransactionDate: '2026-11-26T08:30:00.000Z',
    dueDate: '2026-12-02',
    notes: 'Daily dairy and bakery customer',
  },
  {
    id: 'cust_5',
    name: 'Rajesh Verma',
    phone: '9123456780',
    address: 'Civil Lines, Near SBI Branch',
    balance: 0,
    creditLimit: 8000,
    avatarColor: 'bg-slate-600',
    createdAt: '2026-10-05T12:00:00.000Z',
    lastTransactionDate: '2026-11-25T18:00:00.000Z',
    dueDate: null,
    notes: 'Fully settled yesterday. Highly reliable customer',
  },
  {
    id: 'cust_6',
    name: 'Vikram Singh',
    phone: '9345678901',
    address: 'Grain Market, Shop #18',
    balance: 1750,
    creditLimit: 12000,
    avatarColor: 'bg-indigo-600',
    createdAt: '2026-10-12T10:30:00.000Z',
    lastTransactionDate: '2026-11-23T11:45:00.000Z',
    dueDate: '2026-12-01',
    notes: 'Wholesale grains buyer',
  }
];

export const INITIAL_TRANSACTIONS = [
  // Ramesh Kirana
  {
    id: 'txn_1',
    customerId: 'cust_1',
    customerName: 'Ramesh Kirana',
    type: 'credit',
    amount: 1500,
    items: ['Atta 10kg', 'Cheeni 5kg'],
    paymentMethod: 'Khata',
    date: '2026-11-20T10:30:00.000Z',
    dueDate: '2026-11-27',
    notes: 'Weekly grocery supplies',
    rawVoiceCommand: 'Ramesh bhai ko pandrah sau ka atta aur cheeni udhaar diya'
  },
  {
    id: 'txn_2',
    customerId: 'cust_1',
    customerName: 'Ramesh Kirana',
    type: 'payment',
    amount: 1000,
    items: [],
    paymentMethod: 'Cash',
    date: '2026-11-22T15:00:00.000Z',
    dueDate: null,
    notes: 'Nagad jama kiya counter par',
    rawVoiceCommand: 'Ramesh ne ek hazar rupaye cash jama kiye'
  },
  {
    id: 'txn_3',
    customerId: 'cust_1',
    customerName: 'Ramesh Kirana',
    type: 'credit',
    amount: 2000,
    items: ['Mustard Oil 2L', 'Basmati Chawal 5kg'],
    paymentMethod: 'Khata',
    date: '2026-11-24T16:30:00.000Z',
    dueDate: '2026-12-05',
    notes: 'Oil and rice pack',
    rawVoiceCommand: 'Ramesh bhai ko do hazar ka tel aur chawal udhaar diya'
  },

  // Suresh Sharma
  {
    id: 'txn_4',
    customerId: 'cust_2',
    customerName: 'Suresh Sharma',
    type: 'credit',
    amount: 2000,
    items: ['Monthly Ration Pack', 'Masale'],
    paymentMethod: 'Khata',
    date: '2026-11-18T12:00:00.000Z',
    dueDate: '2026-11-25',
    notes: 'Monthly kirana items',
    rawVoiceCommand: 'Suresh ko do hazar rupaye ka ration udhaar diya'
  },
  {
    id: 'txn_5',
    customerId: 'cust_2',
    customerName: 'Suresh Sharma',
    type: 'payment',
    amount: 800,
    items: [],
    paymentMethod: 'UPI',
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Today!
    dueDate: null,
    notes: 'Received via PhonePe UPI QR',
    rawVoiceCommand: 'Suresh ne 800 rupaye UPI kar diye'
  },

  // Mohan Lal
  {
    id: 'txn_6',
    customerId: 'cust_3',
    customerName: 'Mohan Lal',
    type: 'credit',
    amount: 3200,
    items: ['Deshi Ghee 2kg', 'Dry Fruits', 'Chai Patti'],
    paymentMethod: 'Khata',
    date: '2026-11-05T11:00:00.000Z',
    dueDate: '2026-11-15',
    notes: 'Puja festival grocery purchase',
    rawVoiceCommand: 'Mohan Lal ko battis sau rupaye ka ghee aur dry fruit udhaar diya'
  },
  {
    id: 'txn_7',
    customerId: 'cust_3',
    customerName: 'Mohan Lal',
    type: 'credit',
    amount: 1650,
    items: ['Surf Detergent', 'Bath Soap', 'Masala'],
    paymentMethod: 'Khata',
    date: '2026-11-10T14:20:00.000Z',
    dueDate: '2026-11-15',
    notes: 'Home cleaning supplies',
    rawVoiceCommand: 'Mohan Lal ne 1650 ka saman udhaar liya'
  },

  // Anita Devi
  {
    id: 'txn_8',
    customerId: 'cust_4',
    customerName: 'Anita Devi',
    type: 'credit',
    amount: 850,
    items: ['Doodh 3L', 'Bread', 'Butter', 'Parle G Biscuits'],
    paymentMethod: 'Khata',
    date: '2026-11-25T08:15:00.000Z',
    dueDate: '2026-12-02',
    notes: 'Morning dairy & breakfast items',
    rawVoiceCommand: 'Anita Devi ko aath sau pachas ka doodh aur bread udhaar di'
  },
  {
    id: 'txn_9',
    customerId: 'cust_4',
    customerName: 'Anita Devi',
    type: 'payment',
    amount: 500,
    items: [],
    paymentMethod: 'Cash',
    date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Today!
    dueDate: null,
    notes: 'Morning payment',
    rawVoiceCommand: 'Anita Devi ne paanch sau rupaye jama kiye'
  },

  // Rajesh Verma
  {
    id: 'txn_10',
    customerId: 'cust_5',
    customerName: 'Rajesh Verma',
    type: 'credit',
    amount: 1400,
    items: ['Refined Oil', 'Sugar 10kg'],
    paymentMethod: 'Khata',
    date: '2026-11-21T17:00:00.000Z',
    dueDate: '2026-11-25',
    notes: 'Family grocery',
    rawVoiceCommand: 'Rajesh Verma ko 1400 rupaye ka tel cheeni udhaar diya'
  },
  {
    id: 'txn_11',
    customerId: 'cust_5',
    customerName: 'Rajesh Verma',
    type: 'payment',
    amount: 1400,
    items: [],
    paymentMethod: 'UPI',
    date: '2026-11-25T18:00:00.000Z',
    dueDate: null,
    notes: 'Full payment settled via GPay',
    rawVoiceCommand: 'Rajesh Verma ne poora chukta kar diya'
  },

  // Vikram Singh
  {
    id: 'txn_12',
    customerId: 'cust_6',
    customerName: 'Vikram Singh',
    type: 'credit',
    amount: 1750,
    items: ['Refined Oil 5L', 'Sugar 5kg'],
    paymentMethod: 'Khata',
    date: '2026-11-23T11:45:00.000Z',
    dueDate: '2026-12-01',
    notes: 'Mandi supplies',
    rawVoiceCommand: 'Vikram Singh ko satrah sau pachas rupaye ka samaan udhaar diya'
  }
];

export const DEMO_VOICE_COMMANDS = [
  {
    category: 'credit',
    badge: 'Udhaar (उधार)',
    label: 'Ramesh bhai 2500 udhaar',
    text: 'Ramesh bhai ko 2500 rupaye ka udhaar diya.',
    icon: 'ArrowUpRight',
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  {
    category: 'credit',
    badge: 'Udhaar + Items',
    label: 'Suresh 450 tel & cheeni',
    text: 'Suresh ko 450 rupaye ka tel aur cheeni udhaar di, agle somwar denge',
    icon: 'ShoppingBag',
    color: 'text-red-600 bg-red-50 border-red-200'
  },
  {
    category: 'payment',
    badge: 'Jama (जमा UPI)',
    label: 'Suresh 1200 UPI payment',
    text: 'Suresh ne 1200 rupaye UPI kar diye.',
    icon: 'Smartphone',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  {
    category: 'payment',
    badge: 'Jama (Cash)',
    label: 'Mohan 500 cash jama',
    text: 'Mohan Lal ne paanch sau rupaye cash jama kiye',
    icon: 'Banknote',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  {
    category: 'balance_query',
    badge: 'Hisaab (हिसाब)',
    label: 'Mohan ka kitna baaki?',
    text: 'Mohan ka kitna udhaar baaki hai?',
    icon: 'HelpCircle',
    color: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  {
    category: 'balance_query',
    badge: 'Hisaab (हिसाब)',
    label: 'Ramesh Kirana hisaab',
    text: 'Ramesh Kirana ka hisaab batao',
    icon: 'HelpCircle',
    color: 'text-blue-700 bg-blue-50 border-blue-200'
  },
  {
    category: 'credit',
    badge: 'Naya Grahak (New)',
    label: 'Pooja ji 850 rashan',
    text: 'Pooja ji ko 850 rupaye ka rashan udhaar diya',
    icon: 'UserPlus',
    color: 'text-amber-700 bg-amber-50 border-amber-200'
  }
];
