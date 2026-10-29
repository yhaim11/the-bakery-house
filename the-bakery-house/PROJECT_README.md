# 🥖 The Bakery House | בית האפיות
> **Professional Artisan Baker's Progressive Web Application: Smart Baker's Calculator, Preferment Offset Engine, Boutique Recipe Arsenal, Interactive Guided Baking Console with Web Audio Timers, Personal Profile & Notebook, Multi-Seat Team Subscriptions, Keshet Concierge Support Chat, and Full Bilingual (Hebrew/English) Support — Supervised by Keshet 🛡️**

---

## 📌 Master Site Isolation & Architectural Hierarchy

| Application / Site | Live Netlify URL | Netlify Site ID | Classification & Role |
| :--- | :--- | :--- | :--- |
| **🥖 The Bakery House (בית האפיות)** | `https://the-bakery-house-app.netlify.app` | `92ada39a-453a-48fe-aa97-04f537f0978d` | **Active dedicated application for artisan bakers & bakery teams** |
| 🥐 Confectionery Management (Live) | `https://artisan-bakery-management.netlify.app` | `c6927a30-6175-4b05-8313-7472f46a3a44` | Isolated legacy repository (Never overwrite or modify) |
| 🛡️ Keshet's Kennel (Platform Authority) | `https://keshets-kennel.netlify.app` | `b4dfb436-da3e-4f1c-aa9b-260a8ea195bb` | Isolated platform governor (Super Admin & content authority only) |

> [!IMPORTANT]
> **Strict Security Directives:**
> The client codebase of **The Bakery House** contains zero administrative credentials, zero plaintext passwords, and zero Super Admin tabs. All backend governance, content modification, and billing supervision belong exclusively to Keshet's Kennel.

---

## 🚀 Core Features & Architectural Capabilities

### 1. 🌐 Full Bilingual & Directional Engine (i18n)
- **Instant Language Switcher:** A prominent toggle button in the header (`🌐 English` / `🌐 עברית`) allows one-click switching between Hebrew and English.
- **Dynamic DOM Translation:** Seamlessly translates all headers, calculator inputs, fermentation pickers, recipe cards, modals, form controls, and status banners.
- **True Directional Mirroring:** Toggles `document.documentElement.lang` (`he` ↔ `en`) and `document.documentElement.dir` (`rtl` ↔ `ltr`), automatically flipping margins, alignments, grids, and flex containers for natural reading comfort.
- **Dual-Language Database:** Formulas render native English titles (`titleEn`), localized categories, and localized currency symbols ($/₪).

---

### 2. 💎 Subscription & Multi-Seat Team Engine (Keshet Kennel Supervision)
Governed under the operational supervision of **Keshet's Kennel**, offering flexible billing intervals and tailored packages:

#### A. Billing Cycles
- **Monthly Billing:** Flexible monthly subscription.
- **Annual Billing:** 17% savings (equivalent to 2 free months of membership).

#### B. Subscription Tiers
1. **Home Artisan (Free 🌾 ₪0 / $0):**
   - Unlimited access to the Smart Baker's Calculator with automated leaven offset calculation.
   - Access to system presets for 8 standard dough styles.
   - Base formula inspection in the Recipe Arsenal.
   - Up to 3 saved weighing formulas in the Personal Notebook.
2. **Master Baker Pro (👑 ₪39/mo or ₪390/yr | $11/mo or $110/yr):**
   - Full unrestricted access to all 10 boutique formulas and chronological preparation instructions.
   - **Active Baker Mode:** Interactive step-by-step console with live countdown timers and Web Audio chimes.
   - Unlimited Personal Notebook formulas.
   - Master Baker Gold Badge on profile and header.
   - WhatsApp sharing of custom formulas and weighing sheets.
   - Direct concierge consulting channel with Keshet's Kennel.
3. **Bakery Crew / Team Tier (👥 ₪99/mo or ₪990/yr | $28/mo or $275/yr):**
   - **Multi-Seat / Multi-User Package:** Up to 5 individual baker seats synchronized under a single bakery account.
   - Shared production weighing sheets and mixer printouts for commercial bakeries and confectioneries.
   - Team formula synchronization across all 5 baker devices.
   - Priority VIP technical and business support from Keshet's Kennel.
   - Automated consolidated tax invoices (`חשבונית מס-קבלה ירוקה`) compliant with Israeli Tax Authority regulations.

#### C. Simulated Payment Checkout
- Supports **Credit Card** (Mastercard, Visa, Isracard), **Bit mobile app**, and **Apple Pay / Google Pay** one-touch checkout.
- State is persisted locally (`state.user.subscription`) with instant UI badge updates and feature unlocking.

---

### 3. 💬 Direct Concierge Support Chat with Keshet's Kennel
- An interactive live chat modal (`#supportChatModal`) connects users directly with Keshet's Kennel support.
- **Quick Prompt Chips:** One-tap questions for team seats, sourdough hydration, tax invoices, and audio timers.
- **Intelligent Contextual Replies:** Automated concierge assistant answers questions about dough science, formula balancing, and platform features.
- **Chat Persistence:** Complete conversation history is saved in `localStorage` (`bakery_house_chat_history`) with human-readable timestamps and visual status pulses.

---

### 4. 🧮 Smart Baker's Calculator & Precision Preferment Offset Engine
- **Dual Calculation Modes:**
  - *By Flour Weight (Flour Mode):* Dynamically scales all ingredients from base flour weight (500g, 1kg, 2.5kg, 5kg, 10kg, 25kg sack).
  - *By Target Units (Units Mode):* Total flour is derived using exact Baker's Percentages summation (eliminating hardcoded 1.6 approximations):
    $$\text{Sum of Percentages} = 100\% + \text{Hydration}\% + \text{Salt}\% + \text{Fat}\% + \text{Sugar}\% + \text{CommercialYeast}\%$$
    $$\text{Total Flour (g)} = \frac{\text{Target Dough (g)}}{\frac{\text{Sum of Percentages}}{100}}$$
- **Scientific Fermentation Offset:**
  - *Liquid Sourdough (100% Hydration):* Automatically deducts 50% of starter weight from flour and 50% from water.
  - *Solid Pasta Madre (50% Hydration):* Automatically deducts 66.7% of starter weight from flour and 33.3% from water.
  - *Dry / Fresh Commercial Yeast:* 0% offset, added directly to mixer.
  - *Hybrid Fermentation:* Full preferment offset with isolated commercial yeast dosage.
- **Ice Water Compensation:** Calculates ice mass required to control friction factor and achieve Desired Dough Temperature (DDT).

---

### 5. 🔥 Interactive Baker Workflow Mode & Web Audio Timers
- **Sequential Chronological Stages:** Navigates step-by-step through autolyse, starter inoculation, bassinage, folds, bulk fermentation, bench rest, shaping, and baking.
- **Built-in Digital Countdowns:** Accurately parses duration strings (minutes, hours) into live countdown clocks.
- **Synthesized Oven Chime:** Web Audio API oscillator generates an authentic three-tone sine chime (523.25Hz, 659.25Hz, 783.99Hz) upon timer completion (100% offline, zero external audio assets).
- **Mobile Haptics:** Triggers vibration patterns (`navigator.vibrate([300, 150, 300, 150, 400])`) on mobile devices.
- **Progress Tracking:** Interactive progress bar and completion counter stored in the baker profile.

---

### 6. 💡 Smart System Advice & Master Recommendations
- **8 Preconfigured Artisan Dough Styles:**
  1. 🥖 Classic Country Sourdough — 74% hydration, 2.1% salt, 20% starter, DDT 24°C–26°C.
  2. 🍕 Authentic Pizza Napoletana — 65% hydration, 2.8% salt, 0.2% yeast, DDT 22°C–24°C.
  3. 🍞 Rich Velvet Challah — 58% hydration, 1.8% salt, 6% oil, 8% sugar, DDT 26°C–27°C.
  4. 🥖 Traditional French Baguette — 68% hydration, 2.0% salt, 0.4% yeast, DDT 23°C–24°C.
  5. 🇮🇹 Crispy Bubble Focaccia — 82% hydration, 2.3% salt, 5% olive oil, DDT 25°C–26°C.
  6. 🥯 Traditional NY Boiled Bagel — 56% hydration, 2.2% salt, 3% sugar, DDT 25°C.
  7. 🥪 100% Whole Spelt Loaf — 68% hydration, 2.0% salt, 20% starter, DDT 23°C–24°C.
  8. 🥐 Rich French Brioche — 52% hydration, 2.0% salt, 12% sugar, 1.5% yeast, DDT 22°C–23°C.
- **One-Click Application:** Instantly populates sliders and updates the mixer weighing matrix.
- **Dynamic Hydration Advice:** Real-time feedback bar updates based on chosen water percentage.

---

### 7. 📲 WhatsApp Deep Linking & Mobile Production Sharing
- **Recipe Sharing:** Generates structured WhatsApp messages with emojis, ingredient ratios, and deep links:
  `https://the-bakery-house-app.netlify.app/?recipe=classic-country-sourdough`
- **Weighing Formula Sharing:** Shares custom dough formulas with full query parameter recreation:
  `https://the-bakery-house-app.netlify.app/?flour=1200&hyd=76&salt=2.2&ferm=liquid_sourdough`
- **Mobile-First Production Sheet:** Native clipboard copying and offline `.txt` download for bakery mixing stations.

---

## 🛠️ Verification & Deployment Workflow

### 1. Verification Test
```powershell
node test_verification.js
```
Validates that all required HTML IDs, DOM elements, and JavaScript functions are strictly present and syntactically sound.

### 2. Synchronization & Deployment
```powershell
# Copy source files to deployment directory
Copy-Item -Path "C:\Users\yosef haim\Desktop\The_Bakery_House_Source\*" -Destination "C:\Users\yosef haim\Desktop\the-bakery-house\" -Recurse -Force

# Run Netlify deployment script
node deploy_to_netlify.js
```
Deploys directly to Netlify Site ID `92ada39a-453a-48fe-aa97-04f537f0978d` (`the-bakery-house-app`).

---

## 📄 License & Governance
Designed and maintained under the supervision of **Keshet's Kennel** 🛡️. All rights reserved © 2026 The Bakery House.
