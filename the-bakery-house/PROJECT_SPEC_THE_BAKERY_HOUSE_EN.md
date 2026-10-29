# Project Specification: The Bakery House (בית האפיות)
## Standalone Professional Baker's PWA & Smart Calculator

> [!IMPORTANT]
> **Complete Application Isolation & Security Directives:**
> * **Live URL:** [the-bakery-house-app.netlify.app](https://the-bakery-house-app.netlify.app)
> * **Dedicated Netlify Site ID:** `92ada39a-453a-48fe-aa97-04f537f0978d`
> * **Strict Isolation Rule:** This application must never overwrite or collide with the live Confectionery app (`c6927a30-6175-4b05-8313-7472f46a3a44`) or Keshet's Kennel (`b4dfb436-da3e-4f1c-aa9b-260a8ea195bb`).
> * **Zero Security Leaks:** No administrative passwords, no PIN hints, and no Super Admin login screens in the client UI. All administrative and content governance is handled strictly inside Keshet's Kennel.

---

## 🥖 1. Application Overview & Scope
**The Bakery House** is a high-performance, mobile-first Progressive Web Application (PWA) tailored for professional artisan bakers and sourdough enthusiasts. It provides two core pillars:
1. **Smart Baker's Calculator:** A scientifically accurate formula engine with automated liquid sourdough and pasta madre hydration/flour offset logic.
2. **Boutique Recipe Arsenal:** A curated collection of artisanal formulas featuring detailed, chronological preparation stages, temperature controls, and timing intervals.

---

## 🧮 2. Smart Baker's Calculator & Mathematical Engine

### A. Dual Calculation Modes
* **Mode 1: By Flour Weight (Flour Mode)**
  - Base input: Total flour in grams (e.g. 500g, 1,000g, 2.5kg, 5kg, 10kg, 25kg sack).
  - All ingredients are scaled dynamically based on their Baker's Percentages relative to total flour.
* **Mode 2: By Target Units / Loaves (Units Mode)**
  - Inputs: Desired loaf count ($N$) and raw dough weight per unit in grams ($W$).
  - Target dough weight: $\text{Target Dough} = N \times W$.
  - **Accurate Baker's Math Derivation (No Hardcoded Approximations!):**
    In professional baking math, dividing by an arbitrary approximation like `1.6` is strictly prohibited because it introduces severe scaling discrepancies. Total flour is derived from the exact sum of all Baker's Percentages in the formula:
    $$\text{Sum of Percentages} = 100\% + \text{Hydration}\% + \text{Salt}\% + \text{Fat/Oil}\% + \text{Sugar}\% + \text{CommercialYeast}\%$$
    $$\text{Total Flour (g)} = \frac{\text{Target Dough (g)}}{\frac{\text{Sum of Percentages}}{100}}$$

### B. Precision Fermentation Offset Logic
When using preferments or levains, a significant portion of flour and water is contained inside the preferment itself. The calculator computes the exact gross values and automatically deducts the preferment's flour and water from the mixer's initial charge:
1. **Liquid Sourdough (100% Hydration):**
   - Composition: 50% Flour, 50% Water.
   - Flour offset: $\text{Starter Weight} \times 0.50$ deducted from mixer flour.
   - Water offset: $\text{Starter Weight} \times 0.50$ deducted from mixer liquid.
2. **Stiff Pasta Madre (50% Hydration):**
   - Composition: 66.7% Flour (2/3), 33.3% Water (1/3).
   - Flour offset: $\text{Starter Weight} \times \frac{2}{3}$ deducted from mixer flour.
   - Water offset: $\text{Starter Weight} \times \frac{1}{3}$ deducted from mixer liquid.
3. **Instant Dry Yeast / Fresh Cake Yeast:**
   - 0% flour/water offset. Added directly to the dough charge.
4. **Hybrid Fermentation:**
   - Full offset for the sourdough component, accompanied by precise commercial yeast dosing (0.2%–0.5%) for volume boost.
5. **Ice Water Balancing:**
   - Calculates the exact ice mass needed to achieve target dough temperature (Friction Factor Compensation) and deducts ice weight from liquid water.

---

## 📖 3. Recipe Arsenal & Chronological Preparation Stages
The canonical `recipes.json` database defines 10 artisan formulas (Free 🌾 and Pro 👑). Every recipe must include a structured chronological `steps` array with the following mandatory data points:
* **Step Number & Phase Name:** Clear descriptive Hebrew and English titles.
* **Exact Timings & Durations:** Precise minutes/hours for mixing, resting, bulk fermentation, cold retard, and baking.
* **Temperature Thresholds:** Water temperature, target dough temperature (DDT), ambient proofer temperature, cold retard temperature (3°C–4°C), and oven temperatures.
* **Autolyse & Fermentolyse:** Clear specifications on flour hydration without salt or starter vs. fermentolyse with starter incorporated.
* **Fold Intervals:** Explicit instructions for coil folds or stretch-and-folds (e.g. every 30–45 minutes).
* **Ingredient Addition Windows:** Precise timing for when to add starter, salt, bassinage water, butter, oils, and inclusions.

---

## 🎨 4. Touch-First UI/UX & Sticky Header Layout
* **Dark Theme Default:** Ergonomic `#121418` dark theme for bakery environments.
* **Header & Viewport Clearance:**
  - Sticky header (`position: sticky; top: 0; z-index: 100`) with glassmorphism backdrop blur.
  - Safe padding-top on `.main-container` (`36px` desktop, `28px` mobile) and `scroll-padding-top: 140px;` on `html` to prevent any sticky header overlap.
* **Explicit Context Passing:**
  - All `onclick` tab, mode, and chip handlers explicitly pass `this` to prevent broken references to implicit `event.currentTarget`.

---

## 💎 5. Subscription & Payment Engine (Keshet Kennel Supervision)
The application integrates a tiered subscription system governed by the platform authority, **Keshet's Kennel**:

### A. Billing Cycles & Pricing
* **Monthly Billing:** Flexible pay-as-you-go membership.
* **Annual Billing:** 17% discount equivalent to 2 free months of membership.

### B. Tier Architecture
1. **Home Artisan (Free 🌾 ₪0 / $0):**
   - Unlimited access to the Smart Baker's Calculator with automated preferment offsets.
   - Access to system presets for 8 standard dough styles.
   - Basic viewing mode for recipe formulas.
   - Up to 3 saved weighing formulas in the Personal Notebook.
2. **Master Baker Pro (👑 ₪39/mo or ₪390/yr | $11/mo or $110/yr):**
   - Full unrestricted access to all 10 boutique formulas and chronological preparation instructions.
   - **Active Baker Mode:** Interactive step-by-step console with live countdown timers and Web Audio chimes.
   - Unlimited Personal Notebook formulas.
   - Master Baker Gold Badge on profile and header.
   - WhatsApp sharing of custom formulas and weighing sheets.
   - Direct concierge consulting channel with Keshet's Kennel.
3. **Bakery Crew / Team Tier (👥 ₪99/mo or ₪990/yr | $28/mo or $275/yr):**
   - **Multi-User Package:** Up to 5 individual baker seats synchronized under a single bakery account.
   - Shared production weighing sheets and mixer printouts for commercial bakeries and confectioneries.
   - Team formula synchronization across all 5 baker devices.
   - Priority VIP technical and business support from Keshet's Kennel.
   - Automated consolidated tax invoices (`חשבונית מס-קבלה ירוקה`) compliant with Israeli Tax Authority regulations.

### C. Checkout Flow Simulation
* Supports Credit Card (Mastercard, Visa, Isracard), Bit mobile app, and Apple Pay / Google Pay.
* State is persisted locally (`state.user.subscription`) with instant UI badge updates and feature unlocking.

---

## 💬 6. Keshet Concierge Live Support Chat
* An interactive modal (`#supportChatModal`) provides direct communication with Keshet's Kennel customer concierge.
* **Intelligent Auto-Replies:** Responds contextually to inquiries regarding team packages, sourdough hydration advice, tax invoices, and baker timer troubleshooting.
* **Message History:** Persisted in `localStorage` (`bakery_house_chat_history`) with human-readable timestamps and visual status pulses.

---

## 🌐 7. Full Bilingual & Directional Engine (i18n)
* **Single-Click Switcher:** Header toggle button (`🌐 English` / `🌐 עברית`).
* **HTML Attribute Synchrony:** Seamlessly toggles `document.documentElement.lang` (`he` ↔ `en`) and `document.documentElement.dir` (`rtl` ↔ `ltr`).
* **Responsive Mirroring:** Automatically mirrors layout grids, flex alignments, table columns, and form fields for natural LTR and RTL reading.
* **Dual Content Database:** Formulas render native English titles (`titleEn`), translated categories (`translateCategory()`), and localized units (₪/$).

---

## 🔥 8. Interactive Baker Mode & Audio Chimes
* **Guided Sequential Workflow:** Step-by-step progress tracker for active bakes.
* **Synthesized Oven Chime:** Web Audio API oscillator plays a clean triple-harmonic bell (523Hz, 659Hz, 784Hz) upon timer expiration with zero external sound file dependencies.
* **Mobile Haptics:** Triggers vibration patterns (`navigator.vibrate([300, 150, 300, 150, 400])`) on supported mobile devices.

---

## 📲 9. WhatsApp Deep Linking & Mobile Production Sharing
* Generates rich WhatsApp messages with emoji styling, ingredients breakdown, and deep-link query parameters (`?recipe=...` or `?flour=...&hyd=...`).
* Mobile-first responsive production sheet with native clipboard copying and offline `.txt` download fallback.

