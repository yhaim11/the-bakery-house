# CursorRules & Confectionery Architecture Specification (EN)
## Rules, Protocols & Operational Standards

> [!IMPORTANT]
> **Core Directives for AI Agents & Developers:**
> * **Parent Platform:** Keshet's Kennel (`b4dfb436-da3e-4f1c-aa9b-260a8ea195bb`)
> * **Managed Confectionery App:** Artisan Confectionery Management (`c6927a30-6175-4b05-8313-7472f46a3a44`)
> * **Standalone Bakery App:** The Bakery House (`92ada39a-453a-48fe-aa97-04f537f0978d`)
> * **Zero Cross-Contamination:** Never overwrite child app deployments or configuration IDs.

---

## 🏛️ 1. Architecture Rules & Boundaries

### 1.1 Strict Separation of Concerns
* **The Bakery House Client UI:** Pure client-side baking calculator and recipe reader. Never include admin authentication screens, password forms, or backend credentials.
* **Keshet's Kennel (Master Platform):** The sole authority for user access, subscription billing, child app deployment triggers, and recipe catalog management.
* **Artisan Confectionery App:** The day-to-day operational dashboard for kitchen staff (morning oven schedules, display cases, inventory status).

### 1.2 Defensive Programming & Zero Regressions
* Input parsers must sanitize all numerical inputs, preventing `NaN`, negative values, or zero divisions with fail-safe defaults.
* Always clear previous timer intervals in active timer registries before starting new timers to prevent background memory leaks.
* Event handlers must never rely on deprecated global `event` or implicit `event.currentTarget`. Always pass `this` explicitly in inline HTML handlers.

---

## 🧮 2. Baker's Percentage & Calculation Standards
1. **Flour is Always 100%:** In all professional recipes, flour is the foundation ($100\%$).
2. **Reverse Scaling Formula (Units Mode):**
   $$\text{Total Flour} = \frac{\text{Target Dough Weight}}{\sum (\text{Baker's Percentages}) / 100}$$
   **Strict prohibition:** Never use crude rules of thumb such as dividing by `1.6`.
3. **Preferment Offsets:**
   - 100% hydration levain brings equal parts flour and water. Deduct 50% of starter weight from flour, and 50% from water.
   - 50% hydration pasta madre brings 2 parts flour and 1 part water. Deduct 66.7% from flour, and 33.3% from water.

---

## 📱 3. Mobile-First & Touchscreen Constraints
* Minimum tap target size of 44x44px for buttons and inputs.
* Preserve numeric keypad orientation in LTR (`direction: ltr;`) within Hebrew RTL interfaces to avoid jumping cursors.
* Sticky headers must have adequate container clearance and `scroll-padding-top` to guarantee zero visual occlusion of active form fields.

---

## 🚀 4. Deployment Protocol
* Packaging via PowerShell (`package_zip.ps1`) using POSIX-compliant zip archives.
* Dedicated deployment script (`deploy_to_netlify.js`) enforcing site ID validation against forbidden cross-deployment targets.
