# 📐 Matematik Pintar (Kids Mathematics Learning PWA)

A complete personal Mathematics Learning Progressive Web App (PWA) designed for children from **Beginner (Level 0)** and **Preschool** through **Foundation** and **Years 1 to 6**, strictly aligned with the **Malaysian Ministry of Education KPM Mathematics Curriculum (KSSR Semakan 2017 & DSKP)**.

---

## 🌟 Key Highlights

- **Bilingual (🇲🇾 Bahasa Melayu + 🇬🇧 English)**: Handcrafted, age-appropriate pedagogical phrasing switchable at any time with a single tap.
- **Voice-Enabled**: Speech synthesis (`window.speechSynthesis`) in both BM and English. Auto-reads instructions for Beginner and Preschool learners, with a tactile replay button (`🔊`) on every question.
- **Mobile-First & PWA Installable**: Built for 9:16 portrait mobile screens, touch-friendly with huge tap targets (minimum 48-56px), no accidental horizontal scrolling, and offline service worker caching.
- **Interactive Gameplay Mechanics**:
  - 🍎 **Tap to Count**: Tap each fruit/star/toy to count with popping sounds, numbers popping up, and spoken numbers.
  - 🧺 **Visual Combine / Remove**: Addition & subtraction with fruit baskets and hungry rabbits.
  - 🐸 **Froggy Number Line**: Hopping forward and backward along interactive number lines.
  - 🏪 **Kedai Runcit (Shopkeeper)**: Pay with authentic Malaysian Ringgit banknotes (RM1, RM5, RM10, RM20, RM50) and sen coins.
  - 🚂 **Train Departure Clock**: Interactive analog clock face and digital departure times.
  - 🔷 **Shape Sorter & Patterns**: Tangrams, 2D/3D shapes, and repeating color trains.
  - ⌨️ **Kid-Friendly Tactile Keypad**: For direct numeric answers in Years 1 to 6.
- **3,000+ Procedural Question Variations**: Dynamic question templates with anti-repetition memory so children never face identical sequential drills.
- **Gentle Mistake Philosophy**: Never uses harsh buzzers, red flashing screens, or shaming language. Soft warm marimba sounds and encouraging tips ("*Hampir betul! Mari cuba lagi.*").
- **Zero-Network Procedural Audio**: Synthetic audio chimes, pops, and fanfares synthesized via Web Audio API—100% reliable offline.
- **Parent Zone**: Gated with a dynamic math verification challenge. Displays total questions, accuracy rate, learning streak, strongest topics, and topics needing practice.
- **Private & Local-First**: No account, login, advertisements, or tracking. All progress is saved in the browser's IndexedDB and LocalStorage.

---

## 📚 Curriculum Structure (KPM KSSR Semakan 2017)

| Level | Focus Areas | Curriculum Standards |
|---|---|---|
| **🧸 Peringkat Awal (Beginner)** | Numbers 0–10, Tap Counting, Big/Small, More/Less, Shapes, Colors, Positions | KSPK Awal 1.1–3.1 |
| **🎨 Prasekolah (Preschool)** | Numbers 0–20, Before/After, Visual Addition & Subtraction within 10, Coins | KSPK MA 2.1–6.2 |
| **🌱 Asas Pengukuhan (Foundation)** | Numbers to 100, Tens & Ones (Sa & Puluh), Number Lines, Half & Quarter | ASAS 1.1–4.1 |
| **1️⃣ Tahun 1 (Year 1)** | Whole Numbers to 100, Add/Subtract within 100, Proper Fractions, RM10, Clock | KSSR Semakan 1.1–7.2 |
| **2️⃣ Tahun 2 (Year 2)** | Numbers to 1000, Regrouping, Times Tables 2,3,4,5,10, Fractions & Decimals, RM100 | KSSR Semakan 1.1–6.1 |
| **3️⃣ Tahun 3 (Year 3)** | Numbers to 10,000, Sifir 6–9, Equivalent Fractions, Percentages, RM10,000, Calendar | KSSR Semakan 1.1–8.1 |
| **4️⃣ Tahun 4 (Year 4)** | Numbers to 100,000, BODMAS, Mixed Numbers, World Currencies, Decades, Area | KSSR Semakan 1.1–8.1 |
| **5️⃣ Tahun 5 (Year 5)** | Numbers to 1 Million, Prime Numbers, Interest, Time Zones, Volume, Mean/Mode | KSSR Semakan 1.1–8.3 |
| **6️⃣ Tahun 6 (Year 6)** | Numbers to 10 Million, Financial Math (Profit/Discount/Tax), Speed, Probability | KSSR Semakan 1.1–8.1 |

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally in Development Mode
```bash
npm run dev
```

### 3. Build for Production / PWA
```bash
npm run build
```

### 4. Preview the Production PWA
```bash
npm run preview
```

---

## 📱 How to Install as a PWA on Mobile Devices

1. **Android (Chrome)**:
   - Open the web app in Chrome.
   - Tap the three dots (⋮) menu or tap the **"Add to Home screen"** / **"Install App"** prompt.
   - The app will install as a standalone native-feeling application on your home screen.

2. **iPhone / iPad (Safari)**:
   - Open the web app in Safari.
   - Tap the **Share** button (box with an arrow pointing up).
   - Scroll down and tap **"Add to Home Screen"** (+).
   - Tap **Add**. The app will run in full-screen standalone mode with no browser URL bar.
