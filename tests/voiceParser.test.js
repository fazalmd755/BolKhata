import { describe, it, expect } from 'vitest';
import { parseVoiceInput, classifyIntent, extractAllAmounts, extractItems } from '../src/utils/voiceParser.js';

describe('voiceParser.js AI Voice Engine Tests (40+ Test Suite)', () => {
  const mockCustomers = [
    { id: 'c1', name: 'Ramesh', phone: '9876543210' },
    { id: 'c2', name: 'Suresh Sharma', phone: '9876543211' },
    { id: 'c3', name: 'Mohan Kumar', phone: '9876543212' },
    { id: 'c4', name: 'Anita Devi', phone: '9876543213' },
    { id: 'c5', name: 'Pooja', phone: '9876543214' }
  ];

  describe('Credit Intent Commands (Hindi / Hinglish / English)', () => {
    it('1. parses "Ramesh ko 500 udhar diya"', () => {
      const res = parseVoiceInput('Ramesh ko 500 udhar diya', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(500);
      expect(res.customerName).toBe('Ramesh');
    });

    it('2. parses "रमेश को 500 रुपये उधार दिया"', () => {
      const res = parseVoiceInput('रमेश को 500 रुपये उधार दिया', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(500);
      expect(res.customerName).toBe('Ramesh');
    });

    it('3. parses "Suresh 450 tel aur cheeni udhar"', () => {
      const res = parseVoiceInput('Suresh 450 tel aur cheeni udhar', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(450);
      expect(res.items.some(i => i.includes('tel') || i.includes('cheeni'))).toBe(true);
    });

    it('4. parses "Mohan bhai 1200 ka ration le gaya"', () => {
      const res = parseVoiceInput('Mohan bhai 1200 ka ration le gaya', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(1200);
    });

    it('5. parses "Give 300 credit to Anita"', () => {
      const res = parseVoiceInput('Give 300 credit to Anita', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(300);
      expect(res.customerName).toBe('Anita Devi');
    });

    it('6. parses "Pooja ji 2000 baaki likho"', () => {
      const res = parseVoiceInput('Pooja ji 2000 baaki likho', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(2000);
      expect(res.customerName).toBe('Pooja');
    });

    it('7. parses "Rajesh 1500 udhar"', () => {
      const res = parseVoiceInput('Rajesh 1500 udhar', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(1500);
      expect(res.customerName).toBe('Rajesh');
    });

    it('8. parses "अब्दुल ने 500 का बकाया ले गया"', () => {
      const res = parseVoiceInput('अब्दुल ने 500 का बकाया ले गया', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(500);
      expect(res.customerName).toBe('Abdul');
    });

    it('9. parses "नया ग्राहक रमेश भाई 2500 उधार"', () => {
      const res = parseVoiceInput('नया ग्राहक रमेश भाई 2500 उधार', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(2500);
      expect(res.customerName).toBe('Ramesh');
    });

    it('10. parses "Vikram seth ko 3500 ka samaan diya"', () => {
      const res = parseVoiceInput('Vikram seth ko 3500 ka samaan diya', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(3500);
      expect(res.customerName).toBe('Vikram');
    });

    it('11. parses "Sunil 800 udhar likho"', () => {
      const res = parseVoiceInput('Sunil 800 udhar likho', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(800);
      expect(res.customerName).toBe('Sunil');
    });

    it('12. parses "Deepak 600 rupaye udhar"', () => {
      const res = parseVoiceInput('Deepak 600 rupaye udhar', mockCustomers);
      expect(res.intent).toBe('credit');
      expect(res.amount).toBe(600);
      expect(res.customerName).toBe('Deepak');
    });
  });

  describe('Payment Intent Commands (Hindi / Hinglish / English)', () => {
    it('13. parses "Ramesh ne 500 jama kiya"', () => {
      const res = parseVoiceInput('Ramesh ne 500 jama kiya', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(500);
      expect(res.customerName).toBe('Ramesh');
    });

    it('14. parses "सुरेश ने 1000 जमा किए"', () => {
      const res = parseVoiceInput('सुरेश ने 1000 जमा किए', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(1000);
      expect(res.customerName).toBe('Suresh Sharma');
    });

    it('15. parses "Suresh se 450 mila"', () => {
      const res = parseVoiceInput('Suresh se 450 mila', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(450);
    });

    it('16. parses "Mohan gave 1200 payment"', () => {
      const res = parseVoiceInput('Mohan gave 1200 payment', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(1200);
    });

    it('17. parses "Anita paid 300 via upi"', () => {
      const res = parseVoiceInput('Anita paid 300 via upi', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(300);
      expect(res.paymentMethod).toBe('UPI');
    });

    it('18. parses "Pooja se 2000 cash mila"', () => {
      const res = parseVoiceInput('Pooja se 2000 cash mila', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(2000);
      expect(res.paymentMethod).toBe('Cash');
    });

    it('19. parses "Rajesh ne 1500 phonepe kiya"', () => {
      const res = parseVoiceInput('Rajesh ne 1500 phonepe kiya', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(1500);
      expect(res.paymentMethod).toBe('UPI');
    });

    it('20. parses "असलम में ₹5000 का बकाया लिया"', () => {
      const res = parseVoiceInput('असलम में ₹5000 का बकाया लिया', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(5000);
      expect(res.customerName).toBe('Aslam');
    });

    it('21. parses "Dinesh chukta kiya 700"', () => {
      const res = parseVoiceInput('Dinesh chukta kiya 700', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(700);
    });

    it('22. parses "Manoj 900 vasool hua"', () => {
      const res = parseVoiceInput('Manoj 900 vasool hua', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(900);
    });

    it('23. parses "Gopal 150 gpay kiya"', () => {
      const res = parseVoiceInput('Gopal 150 gpay kiya', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(150);
      expect(res.paymentMethod).toBe('UPI');
    });

    it('24. parses "Vikram ne pura udhar chukta kar diya 2000"', () => {
      const res = parseVoiceInput('Vikram ne pura udhar chukta kar diya 2000', mockCustomers);
      expect(res.intent).toBe('payment');
      expect(res.amount).toBe(2000);
    });
  });

  describe('Balance Query Commands', () => {
    it('25. parses "Ramesh ka kitna udhaar baaki hai"', () => {
      const res = parseVoiceInput('Ramesh ka kitna udhaar baaki hai', mockCustomers);
      expect(res.intent).toBe('balance_query');
      expect(res.customerName).toBe('Ramesh');
    });

    it('26. parses "सुरेश का कितना बाकी है"', () => {
      const res = parseVoiceInput('सुरेश का कितना बाकी है', mockCustomers);
      expect(res.intent).toBe('balance_query');
      expect(res.customerName).toBe('Suresh Sharma');
    });

    it('27. parses "Anita ka hisaab batao"', () => {
      const res = parseVoiceInput('Anita ka hisaab batao', mockCustomers);
      expect(res.intent).toBe('balance_query');
    });

    it('28. parses "Mohan balance check karo"', () => {
      const res = parseVoiceInput('Mohan balance check karo', mockCustomers);
      expect(res.intent).toBe('balance_query');
    });

    it('29. parses "Pooja kitna paisa lena hai"', () => {
      const res = parseVoiceInput('Pooja kitna paisa lena hai', mockCustomers);
      expect(res.intent).toBe('balance_query');
    });

    it('30. parses "कुल बैलेंस कितना है"', () => {
      const res = parseVoiceInput('कुल बैलेंस कितना है', mockCustomers);
      expect(res.intent).toBe('balance_query');
    });
  });

  describe('Negative Phrases & Cancellations', () => {
    it('31. flags "Ramesh ne paise nahi diye"', () => {
      const res = parseVoiceInput('Ramesh ne paise nahi diye', mockCustomers);
      expect(res.isNegative).toBe(true);
      expect(res.warning).toBeTruthy();
    });

    it('32. flags "Suresh ne payment nahi kiya"', () => {
      const res = parseVoiceInput('Suresh ne payment nahi kiya', mockCustomers);
      expect(res.isNegative).toBe(true);
    });

    it('33. flags "Mohan ko 500 diya par nahi mila"', () => {
      const res = parseVoiceInput('Mohan ko 500 diya par nahi mila', mockCustomers);
      expect(res.isNegative).toBe(true);
    });

    it('34. identifies "Entry cancel karo"', () => {
      const res = parseVoiceInput('Entry cancel karo', mockCustomers);
      expect(res.intent).toBe('cancel');
      expect(res.isNegative).toBe(true);
    });

    it('35. identifies "पिछला लेन-देन कैंसिल करो"', () => {
      const res = parseVoiceInput('पिछला लेन-देन कैंसिल करो', mockCustomers);
      expect(res.intent).toBe('cancel');
    });
  });

  describe('Multiple Amounts Detection', () => {
    it('36. detects multiple amounts in "Ramesh 500 udhaar aur 200 jama"', () => {
      const res = parseVoiceInput('Ramesh 500 udhaar aur 200 jama', mockCustomers);
      expect(res.hasMultipleAmounts).toBe(true);
      expect(res.allAmounts).toContain(500);
      expect(res.allAmounts).toContain(200);
      expect(res.warning).toContain('एक से अधिक राशियां पाई गईं');
    });

    it('37. extracts all amounts accurately using extractAllAmounts', () => {
      const amounts = extractAllAmounts('Suresh 1000 me se 400 diya');
      expect(amounts).toEqual([1000, 400]);
    });
  });

  describe('Item Extraction', () => {
    it('38. extracts "tel" and "cheeni"', () => {
      const items = extractItems('Suresh 450 sarson tel aur cheeni', 'Suresh');
      expect(items.some(i => i.includes('tel'))).toBe(true);
      expect(items.some(i => i.includes('cheeni'))).toBe(true);
    });

    it('39. extracts "doodh" and "bread"', () => {
      const items = extractItems('Mohan 200 doodh aur bread', 'Mohan');
      expect(items).toContain('doodh');
      expect(items).toContain('bread');
    });

    it('40. extracts "atta" and "chawal"', () => {
      const items = extractItems('Ramesh 800 atta aur chawal', 'Ramesh');
      expect(items).toContain('atta');
      expect(items).toContain('chawal');
    });
  });

  describe('Name Sanitization, Stutters and Prefixes', () => {
    it('41. extracts clean name "Abdul" from "नया ग्रह अब्दुल ने 500 का बकाया ले गया"', () => {
      const res = parseVoiceInput('नया ग्रह अब्दुल ने 500 का बकाया ले गया', mockCustomers);
      expect(res.customerName).toBe('Abdul');
    });

    it('42. deduplicates repeated name in "अब्दुल अब्दुल ने 500 दिए"', () => {
      const res = parseVoiceInput('अब्दुल अब्दुल ने 500 दिए', mockCustomers);
      expect(res.customerName).toBe('Abdul');
    });

    it('43. strips conversational filler in "अरे सुनो भाई रमेश 500 उधार"', () => {
      const res = parseVoiceInput('अरे सुनो भाई रमेश 500 उधार', mockCustomers);
      expect(res.customerName).toBe('Ramesh');
    });

    it('44. removes honorific title in "Sunil Chacha 1000 udhar"', () => {
      const res = parseVoiceInput('Sunil Chacha 1000 udhar', mockCustomers);
      expect(res.customerName).toBe('Sunil');
    });
  });
});
