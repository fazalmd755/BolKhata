# 🎙️ BolKhata (बोलखाता)
### Voice-First Digital Khata Ledger for Indian Kirana Shopkeepers & Small Merchants

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Zero API Keys](https://img.shields.io/badge/Zero--API--Keys-100%25%20Offline-emerald.svg)](#why-zero-api-client-side-nlp)

> **"बोलिए और खाता लिखिए"** — BolKhata turns spoken Hindi and Hinglish Kirana commands into clean, double-entry financial ledger records in real-time. Zero typing required.

---

## 📌 Problem Statement

Over 13 million local Kirana stores drive 88% of India's retail grocery market. Yet:
* **Small Touchscreen Keyboard Fatigue:** Dukaandars handle busy customer counters; typing customer names, items, and numbers on mobile keyboards while packing ration is slow and prone to errors.
* **Complex Ledger Apps:** Traditional billing apps require navigating nested menus, dropdowns, and forms.
* **Paper Diary (लाल बही-खाता) Inefficiencies:** Paper diaries easily tear, get misplaced, don't calculate running balances automatically, and cannot send instant payment reminders with UPI links.
* **Internet Dependency & Cloud LLM Costs:** Paid LLM APIs (OpenAI, Gemini) cost money per token, take 2–5 seconds of round-trip latency, and stop working if network connectivity fluctuates in rural/semi-urban mandis.

---

## 💡 The BolKhata Solution

BolKhata is a **responsive, mobile-first web ledger** that runs **100% client-side** in any mobile or desktop browser:
1. **Speak Naturally in Hindi / Hinglish:** Dukaandar speaks: *"Ramesh bhai ko 2500 rupaye ka udhaar diya"* or *"Suresh ne 1200 UPI jama kar diye"*.
2. **Proprietary Client-Side NLP Engine:** Instantly parses Devanagari numerals, spoken Hindi fractions (*डेढ़ हज़ार* = 1500, *ढाई सौ* = 250, *साढ़े चार सौ* = 450), Kirana grocery items, payment methods, and relative dates (*कल*, *अगले सोमवार*).
3. **Human-in-the-Loop Confirmation:** A visual card opens with parsed details and duplicate detection guard (warns if a similar entry was recorded in the last 30 minutes).
4. **Instant Ledger Update & Audio Chime:** Procedural Web Audio API chime plays (Khatabook/PhonePe style) and updates the ledger running balance.
5. **1-Tap WhatsApp Payment Reminder:** Generates formatted Hinglish reminder messages embedded with deep-linked UPI URLs (`upi://pay?pa=...`).

---

## ⚡ Why Zero-API Client-Side NLP Beats Cloud LLMs

| Metric | Traditional Cloud LLMs (OpenAI/Gemini) | BolKhata Client-Side NLP |
| :--- | :--- | :--- |
| **Response Latency** | 2,000ms – 4,500ms (Slow on 3G/4G) | **< 15ms (Instantaneous)** |
| **API Cost Per Month** | \$30 – \$100+ (Per-token charges) | **₹0 Free Forever (Zero API bill)** |
| **Privacy & Security** | Financial data sent to cloud LLM servers | **100% on-device local storage** |
| **Offline Reliability** | Fails on network dropouts | **Works offline via browser runtime** |
| **Kirana Slang Accuracy** | Often hallucinates Indian fractions (*derh, dhai*) | **Tuned for Indian mandi colloquials** |

---

## 🏗️ Architecture & Data Flow

```mermaid
flowchart TD
    A["🎙️ Dukaandar Voice Input\n(Hindi / Hinglish speech)"] --> B["Web Speech API\n(Browser SpeechRecognition)"]
    B --> C["Text Normalization\n(Devanagari ०-९ ➔ 0-9 & punctuation clean)"]
    C --> D["NLP Intent Classifier\n(Credit / Payment / Balance Query)"]
    D --> E["Spoken Number Tokenizer\n(Handles derh, dhai, sawa, sau, hazar)"]
    E --> F["Entity Extractor\n(Customer, Amount, Items, Method, Due Date)"]
    F --> G{"Intent Type?"}
    G -- "Balance Query" --> H["🔊 Spoken Audio Response\n(No transaction created)"]
    G -- "Credit / Payment" --> I["🛡️ Duplicate Check & Confirmation Modal\n(Shopkeeper verifies or edits)"]
    I --> J["💾 Khata Context & LocalStorage\n(Real-time State + Persistence)"]
    J --> K["🎉 Confetti & Web Audio Cash Chime\n(Instant feedback)"]
    J --> L["📲 1-Tap WhatsApp Reminder + UPI Link\n(Direct collection)"]
```

---

## 🚀 Quickstart Guide

### Option 1: One-Command Startup with Docker (Recommended)

Ensure Docker is installed, then run:

```bash
docker compose up --build
```

Open your browser and navigate to:
* **http://localhost:5173** (or **http://localhost:80**)

---

### Option 2: Local Development Setup (Node.js)

**Prerequisites:** Node.js 18+ and npm.

1. Clone or navigate to the repository:
   ```bash
   git clone <repo-url>
   cd BolKhata
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Open **http://localhost:5173** in Google Chrome or Microsoft Edge.

---

## 🧪 Verified Voice Commands (Test Dataset)

Click the **Demo Commands** chips inside the app or speak these into the microphone:

| Category | Spoken Command | Extracted Entities | Action |
| :--- | :--- | :--- | :--- |
| **Udhaar (Credit)** | *"Ramesh bhai ko 2500 rupaye ka udhaar diya"* | Customer: **Ramesh Kirana**<br>Amount: **₹2,500**<br>Type: **Credit** | Opens Confirm Modal with red credit badge |
| **Udhaar + Items + Date** | *"Suresh ko 450 rupaye ka tel aur cheeni udhaar di, agle somwar denge"* | Customer: **Suresh Sharma**<br>Amount: **₹450**<br>Items: **tel, cheeni**<br>Due Date: **Next Monday** | Formats items & sets due date automatically |
| **Payment (UPI)** | *"Suresh ne 1200 rupaye UPI kar diye"* | Customer: **Suresh Sharma**<br>Amount: **₹1,200**<br>Method: **UPI**<br>Type: **Payment** | Deducts balance; opens confirm modal |
| **Payment (Cash)** | *"Mohan Lal ne paanch sau rupaye cash jama kiye"* | Customer: **Mohan Lal**<br>Amount: **₹500**<br>Method: **Cash** | Records cash collection |
| **Balance Query (हिसाब)** | *"Mohan Lal ka kitna udhaar baaki hai?"* | Customer: **Mohan Lal**<br>Intent: **Balance Query** | **Speaks balance aloud in Hindi** (Zero transaction saved) |
| **New Customer** | *"Pooja ji ko 850 rupaye ka rashan udhaar diya"* | Customer: **Pooja Ji (New)**<br>Amount: **₹850** | **Auto-creates new customer ledger** |

---

## 🛠️ Project Structure

```
BolKhata/
├── Dockerfile              # Multi-stage production build (Node 20 + Nginx Alpine)
├── docker-compose.yml      # 1-command startup mapping ports 5173 and 80
├── nginx.conf              # SPA routing fallback & asset caching
├── package.json            # Scripts & frontend dependencies
├── src/
│   ├── App.jsx             # Responsive mobile-first shell layout
│   ├── context/
│   │   └── KhataContext.jsx # LocalStorage sync, ledger calculations & duplicate guard
│   ├── data/
│   │   └── mockData.js     # Preloaded realistic Kirana customer accounts
│   ├── utils/
│   │   ├── voiceParser.js  # NLP entity extractor & intent classifier
│   │   ├── hindiNumberParser.js # Devanagari numerals & Indian spoken number parser
│   │   ├── aiConversationalEngine.js # "AI Munshi" conversational reasoning engine
│   │   ├── soundEffects.js # Procedural Web Audio API synthesizer
│   │   ├── dateUtils.js    # Relative date calculator & overdue tracker
│   │   └── whatsapp.js     # WhatsApp reminder templates & UPI deep links
│   └── components/
│       ├── HomeTab.jsx     # Net credit hero card & quick actions
│       ├── VoiceBottomSheet.jsx # Voice recording overlay with fallback input
│       ├── TransactionConfirmModal.jsx # Pre-save verification & duplicate warning
│       ├── BalanceQueryModal.jsx # Spoken voice query answer card
│       ├── CustomerLedgerModal.jsx # Customer account with running balance
│       ├── WhatsAppReminderModal.jsx # WhatsApp payment reminder modal
│       ├── AiAssistantModal.jsx # "AI Munshi" full chat modal
│       └── SettingsView.jsx # Shop profile & 1-click JSON/CSV backup
```

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
