/**
 * בית האפיות (The Bakery House) - Client Application Logic
 * מיועד לאופים: מחשבון אופים חכם, ארסנל מתכוני בוטיק, שלבי הכנה מפורטים והורדות.
 * אבטחה מלאה: ללא סיסמאות או פאנל ניהול בקוד לקוח.
 */

// ==========================================
// 1. STATE & GLOBAL CONFIGURATION
// ==========================================
const state = {
  // Calculator State
  calcMode: 'flour', // 'flour' | 'units'
  fermType: 'liquid_sourdough', // 'liquid_sourdough' | 'pasta_madre' | 'yeast_dry' | 'yeast_fresh' | 'hybrid'
  baseFlour: 1000,
  unitCount: 4,
  unitWeight: 850,
  hydrationPct: 74.0,
  starterPct: 20.0,
  saltPct: 2.1,
  yeastPct: 0.4,
  oilPct: 0.0,
  sugarPct: 0.0,
  icePct: 0.0,

  // Recipes State
  recipes: [],
  activeFilter: 'all',
  activeCategory: 'all',
  searchQuery: '',
  selectedRecipeForModal: null,

  // Language & i18n
  lang: localStorage.getItem('bakery_house_lang') || 'he',

  // Subscription & Pricing State
  subBillingCycle: 'monthly', // 'monthly' | 'annual'
  checkoutSelectedTier: 'pro', // 'pro' | 'team'
  paymentMethod: 'card', // 'card' | 'bit' | 'applepay'

  // Keshet Support Concierge Chat
  chatHistory: [],

  // User Profile & Storage State
  user: null,

  // Active Baker Workflow Console State
  workflow: {
    recipe: null,
    currentStepIndex: 0,
    timerSeconds: 0,
    initialStepSeconds: 0,
    timerInterval: null,
    isRunning: false
  }
};

// ==========================================
// 2. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initLanguage();
  initUser();
  initChat();
  loadRecipes();
  toggleLeavenParams(state.fermType);
  checkUrlDeepLinks();
});

function initTheme() {
  const savedTheme = localStorage.getItem('bakery_house_theme');
  if (savedTheme === 'light') {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
  }
}

function toggleTheme() {
  if (document.body.classList.contains('theme-dark')) {
    document.body.classList.remove('theme-dark');
    document.body.classList.add('theme-light');
    localStorage.setItem('bakery_house_theme', 'light');
    showToast("מצב תצוגה בהיר הופעל ☀️");
  } else {
    document.body.classList.remove('theme-light');
    document.body.classList.add('theme-dark');
    localStorage.setItem('bakery_house_theme', 'dark');
    showToast("מצב תצוגה כהה הופעל 🌙");
  }
}

// ==========================================
// 3. TAB NAVIGATION
// ==========================================
function switchTab(tabId, el) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(btn => btn.classList.remove('active'));

  const targetTab = document.getElementById(tabId);
  const targetBtn = el || document.querySelector(`.nav-tab[data-tab="${tabId}"]`);

  if (targetTab) targetTab.classList.add('active');
  if (targetBtn) targetBtn.classList.add('active');

  if (tabId === 'tab-profile') {
    renderProfileArea();
  }
}

// ==========================================
// 4. SMART BAKER'S CALCULATOR (מחשבון אופים חכם)
// ==========================================

function setCalcMode(mode, el) {
  state.calcMode = mode;

  const btnFlour = document.getElementById('modeBtnFlour');
  const btnUnits = document.getElementById('modeBtnUnits');
  const secFlour = document.getElementById('flourModeInputs');
  const secUnits = document.getElementById('unitsModeInputs');

  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = el || (mode === 'flour' ? btnFlour : btnUnits);
  if (activeBtn) activeBtn.classList.add('active');

  if (mode === 'flour') {
    secFlour.classList.remove('d-none');
    secUnits.classList.add('d-none');
  } else {
    secUnits.classList.remove('d-none');
    secFlour.classList.add('d-none');
  }

  recalculate();
}

/**
 * Toggles and updates leaven parameters and controls UI input visibility.
 * Can be called with a specific fermentation type, or without arguments to sync UI state.
 * @param {string} [type] - 'liquid_sourdough' | 'pasta_madre' | 'yeast_dry' | 'yeast_fresh' | 'hybrid'
 */
function toggleLeavenParams(type) {
  if (type) {
    state.fermType = type;
    const radio = document.querySelector(`input[name="fermType"][value="${type}"]`);
    if (radio) {
      radio.checked = true;
    }
  } else {
    const checked = document.querySelector('input[name="fermType"]:checked');
    if (checked) {
      state.fermType = checked.value;
    }
  }

  // Update visual active state on fermentation cards
  document.querySelectorAll('.ferm-option').forEach(opt => {
    if (opt.getAttribute('data-ferm') === state.fermType) {
      opt.classList.add('active');
    } else {
      opt.classList.remove('active');
    }
  });

  updateFermInputVisibility();
  recalculate();
}
window.toggleLeavenParams = toggleLeavenParams;

function onFermTypeChange() {
  const selected = document.querySelector('input[name="fermType"]:checked');
  if (!selected) return;
  toggleLeavenParams(selected.value);
}

function updateFermInputVisibility() {
  const starterRow = document.getElementById('starterRow');
  const yeastRow = document.getElementById('yeastRow');
  const starterLabel = document.getElementById('starterLabel');
  const yeastLabel = document.getElementById('yeastLabel');

  if (!starterRow || !yeastRow) return;

  switch (state.fermType) {
    case 'liquid_sourdough':
      starterRow.classList.remove('d-none');
      yeastRow.classList.add('d-none');
      if (starterLabel) starterLabel.textContent = '🧪 מחמצת נוזלית (100% הידרציה):';
      break;
    case 'pasta_madre':
      starterRow.classList.remove('d-none');
      yeastRow.classList.add('d-none');
      if (starterLabel) starterLabel.textContent = '🇮🇹 פסטה מדרה קשה (50% הידרציה):';
      break;
    case 'yeast_dry':
      starterRow.classList.add('d-none');
      yeastRow.classList.remove('d-none');
      if (yeastLabel) yeastLabel.textContent = '✨ שמרים יבשים אינסטנט (% מהקמח):';
      break;
    case 'yeast_fresh':
      starterRow.classList.add('d-none');
      yeastRow.classList.remove('d-none');
      if (yeastLabel) yeastLabel.textContent = '🧊 שמרים טריים / לחים (% מהקמח):';
      break;
    case 'hybrid':
      starterRow.classList.remove('d-none');
      yeastRow.classList.remove('d-none');
      if (starterLabel) starterLabel.textContent = '🧪 מחמצת נוזלית מקוזזת:';
      if (yeastLabel) yeastLabel.textContent = '⚡ שמרים מסחריים לתוספת:';
      break;
  }
}

function setQuickFlour(grams, el) {
  document.getElementById('inputBaseFlour').value = grams;
  document.querySelectorAll('.quick-chips .chip').forEach(c => c.classList.remove('active'));
  if (el) {
    el.classList.add('active');
  } else {
    const label = grams >= 1000 ? (grams / 1000) + 'kg' : grams + 'g';
    const found = Array.from(document.querySelectorAll('.quick-chips .chip')).find(c => c.textContent.trim() === label);
    if (found) found.classList.add('active');
  }
  recalculate();
}

function syncSlider(sliderId, numId) {
  const val = parseFloat(document.getElementById(sliderId).value);
  document.getElementById(numId).value = val;
  recalculate();
}

function syncNum(numId, sliderId) {
  const val = parseFloat(document.getElementById(numId).value);
  document.getElementById(sliderId).value = val;
  recalculate();
}

function resetCalcToDefaults() {
  document.getElementById('inputBaseFlour').value = 1000;
  document.getElementById('rangeHydration').value = 74;
  document.getElementById('numHydration').value = 74;
  document.getElementById('rangeStarter').value = 20;
  document.getElementById('numStarter').value = 20;
  document.getElementById('rangeSalt').value = 2.1;
  document.getElementById('numSalt').value = 2.1;
  document.getElementById('rangeYeast').value = 0.4;
  document.getElementById('numYeast').value = 0.4;
  document.getElementById('numOil').value = 0;
  document.getElementById('numSugar').value = 0;
  document.getElementById('numIcePct').value = 0;
  document.getElementById('inputUnitCount').value = 4;
  document.getElementById('inputUnitWeight').value = 850;

  setCalcMode('flour');
  toggleLeavenParams('liquid_sourdough');
  showToast("המחשבון אופס לערכי ברירת מחדל 🌾");
}

/**
 * המנוע המתמטי הראשי של המחשבון:
 * חישוב דינמי לפי גרם קמח או לפי כמות יחידות, עם קיזוז מדויק של נוזלים וקמחים
 */
function recalculate() {
  // Read inputs
  state.hydrationPct = parseFloat(document.getElementById('numHydration').value) || 0;
  state.saltPct = parseFloat(document.getElementById('numSalt').value) || 0;
  state.starterPct = parseFloat(document.getElementById('numStarter').value) || 0;
  state.yeastPct = parseFloat(document.getElementById('numYeast').value) || 0;
  state.oilPct = parseFloat(document.getElementById('numOil').value) || 0;
  state.sugarPct = parseFloat(document.getElementById('numSugar').value) || 0;
  state.icePct = parseFloat(document.getElementById('numIcePct').value) || 0;

  // Update badges
  document.getElementById('badgeHydration').textContent = state.hydrationPct + '%';
  document.getElementById('badgeSalt').textContent = state.saltPct + '%';
  document.getElementById('badgeStarter').textContent = state.starterPct + '%';
  document.getElementById('badgeYeast').textContent = state.yeastPct + '%';

  // Update dynamic master advice
  updateRealtimeAdvice(state.hydrationPct);

  let totalFlour = 0;

  // 1. Calculate Total Flour based on mode
  if (state.calcMode === 'flour') {
    totalFlour = parseFloat(document.getElementById('inputBaseFlour').value) || 1000;
    document.getElementById('displayBaseFlour').textContent = formatGrams(totalFlour);
  } else {
    // Units Mode: Derive total flour from the EXACT sum of the recipe's Baker's Percentages
    // In scientific Baker's Math, Total Flour is always 100%. Target Dough = Total Flour * (Sum of Baker's Percentages) / 100.
    // CRITICAL: NEVER use a hardcoded approximation such as dividing by 1.6!
    state.unitCount = parseFloat(document.getElementById('inputUnitCount').value) || 1;
    state.unitWeight = parseFloat(document.getElementById('inputUnitWeight').value) || 850;
    const targetDough = state.unitCount * state.unitWeight;
    document.getElementById('targetDoughDisplay').textContent = formatGrams(targetDough);

    // Sum of Baker's Percentages in the final dough formulation:
    let effectiveYeastPct = (state.fermType === 'yeast_dry' || state.fermType === 'yeast_fresh' || state.fermType === 'hybrid') ? state.yeastPct : 0;
    let sumPercentages = 100 + state.hydrationPct + state.saltPct + state.oilPct + state.sugarPct + effectiveYeastPct;
    if (sumPercentages <= 0) sumPercentages = 100;
    
    totalFlour = (targetDough / sumPercentages) * 100;
    document.getElementById('displayBaseFlour').textContent = formatGrams(totalFlour);
  }

  // 2. Gross Total Ingredients
  const grossWater = totalFlour * (state.hydrationPct / 100);
  const grossSalt = totalFlour * (state.saltPct / 100);
  const grossOil = totalFlour * (state.oilPct / 100);
  const grossSugar = totalFlour * (state.sugarPct / 100);

  let starterWeight = 0;
  let starterFlour = 0;
  let starterWater = 0;
  let commercialYeastWeight = 0;

  let offsetTitle = "";
  let offsetBody = "";

  // 3. Fermentation System Offset Calculation
  switch (state.fermType) {
    case 'liquid_sourdough': {
      starterWeight = totalFlour * (state.starterPct / 100);
      // Liquid sourdough is 100% hydration -> 50% flour / 50% water
      starterFlour = starterWeight * 0.50;
      starterWater = starterWeight * 0.50;

      offsetTitle = "🌾 קיזוז מדויק — מחמצת נוזלית (100% הידרציה):";
      offsetBody = `המחמצת מביאה ${formatGrams(starterFlour)} קמח ו-${formatGrams(starterWater)} מים. שקילת הקמח והמים למלוש הופחתה במדויק!`;
      break;
    }

    case 'pasta_madre': {
      starterWeight = totalFlour * (state.starterPct / 100);
      // Stiff Pasta Madre is 50% hydration -> 2/3 flour (66.67%) / 1/3 water (33.33%)
      starterFlour = starterWeight * (2 / 3);
      starterWater = starterWeight * (1 / 3);

      offsetTitle = "🇮🇹 קיזוז מדויק — פסטה מדרה קשה (50% הידרציה):";
      offsetBody = `פסטה מדרה מכילה ${formatGrams(starterFlour)} קמח (66.7%) ו-${formatGrams(starterWater)} מים (33.3%). משקלי המלוש קוזזו במדויק.`;
      break;
    }

    case 'yeast_dry': {
      starterWeight = 0;
      starterFlour = 0;
      starterWater = 0;
      commercialYeastWeight = totalFlour * (state.yeastPct / 100);

      offsetTitle = "✨ התפחה ישירה — שמרים יבשים אינסטנט:";
      offsetBody = "אין קיזוז קמח או מים. שמרים יבשים נשקלים ישירות יחד עם הקמח.";
      break;
    }

    case 'yeast_fresh': {
      starterWeight = 0;
      starterFlour = 0;
      starterWater = 0;
      commercialYeastWeight = totalFlour * (state.yeastPct / 100);

      offsetTitle = "🧊 התפחה ישירה — שמרים טריים / לחים:";
      offsetBody = "אין קיזוז קמח או מים. מומלץ להמיס שמרים טריים בחלק ממי הלישה.";
      break;
    }

    case 'hybrid': {
      starterWeight = totalFlour * (state.starterPct / 100);
      starterFlour = starterWeight * 0.50;
      starterWater = starterWeight * 0.50;
      commercialYeastWeight = totalFlour * (state.yeastPct / 100);

      offsetTitle = "⚡ שילוב היברידי (מחמצת + שמרים):";
      offsetBody = `המחמצת מקזזת ${formatGrams(starterFlour)} קמח ו-${formatGrams(starterWater)} מים, בתוספת ${formatGrams(commercialYeastWeight)} שמרים לדחיפת הנפח.`;
      break;
    }
  }

  // 4. Net Weighing Amounts to Mixer (שקילה בפועל למלוש)
  const netFlourToMix = Math.max(0, totalFlour - starterFlour);
  const netWaterToMix = Math.max(0, grossWater - starterWater);

  // Ice deduction from liquid water
  const iceWeight = netWaterToMix * (state.icePct / 100);
  const liquidWaterWeight = netWaterToMix - iceWeight;

  // 5. Final Dough Weight and Units
  const finalTotalDough = netFlourToMix + liquidWaterWeight + iceWeight + starterWeight + commercialYeastWeight + grossSalt + grossOil + grossSugar;
  const loafWeight = state.calcMode === 'units' ? state.unitWeight : 850;
  const calculatedLoaves = finalTotalDough / loafWeight;

  // Update UI Summary Elements
  document.getElementById('totalDoughWeight').textContent = formatGrams(finalTotalDough);
  document.getElementById('summaryLoafCount').textContent = calculatedLoaves.toFixed(1) + ` כיכרות (${loafWeight}g)`;
  document.getElementById('summaryHydration').textContent = state.hydrationPct + '%';

  document.getElementById('offsetNoticeTitle').textContent = offsetTitle;
  document.getElementById('offsetNoticeBody').textContent = offsetBody;

  // 6. Render Scale Table Body
  renderScaleTable({
    totalFlour,
    netFlourToMix,
    starterFlour,
    grossWater,
    liquidWaterWeight,
    iceWeight,
    starterWater,
    starterWeight,
    commercialYeastWeight,
    grossSalt,
    grossOil,
    grossSugar,
    finalTotalDough
  });
}

function renderScaleTable(data) {
  const tbody = document.getElementById('scaleTableBody');
  if (!tbody) return;

  const rows = [];

  // 1. Flour to weigh
  rows.push(`
    <tr>
      <td><strong>🌾 קמח (משקל נטו למלוש)</strong></td>
      <td>100%</td>
      <td>${formatGrams(data.totalFlour)}</td>
      <td class="col-highlight">${formatGrams(data.netFlourToMix)}</td>
      <td>${data.starterFlour > 0 ? `הופחתו ${formatGrams(data.starterFlour)} מתוך המחמצת` : 'שקילה מלאה ללא קיזוז'}</td>
    </tr>
  `);

  // 2. Liquid Water / Ice
  if (data.iceWeight > 0) {
    rows.push(`
      <tr>
        <td><strong>💧 מים קרים נוזליים</strong></td>
        <td>${(state.hydrationPct * (1 - state.icePct / 100)).toFixed(1)}%</td>
        <td>—</td>
        <td class="col-highlight">${formatGrams(data.liquidWaterWeight)}</td>
        <td>מופחת ${formatGrams(data.starterWater)} מהמחמצת וקרח</td>
      </tr>
      <tr>
        <td><strong>🧊 קרח כתוש (לוויסות חום)</strong></td>
        <td>${(state.hydrationPct * (state.icePct / 100)).toFixed(1)}%</td>
        <td>—</td>
        <td class="col-highlight">${formatGrams(data.iceWeight)}</td>
        <td>${state.icePct}% מנוזלי המתכון</td>
      </tr>
    `);
  } else {
    rows.push(`
      <tr>
        <td><strong>💧 מים קרים למלוש</strong></td>
        <td>${state.hydrationPct}%</td>
        <td>${formatGrams(data.grossWater)}</td>
        <td class="col-highlight">${formatGrams(data.liquidWaterWeight)}</td>
        <td>${data.starterWater > 0 ? `הופחתו ${formatGrams(data.starterWater)} מתוך המחמצת` : 'שקילה מלאה ללא קיזוז'}</td>
      </tr>
    `);
  }

  // 3. Ferment (Starter)
  if (data.starterWeight > 0) {
    const starterName = state.fermType === 'pasta_madre' ? '🇮🇹 פסטה מדרה קשה' : '🧪 מחמצת נוזלית (100%)';
    rows.push(`
      <tr>
        <td><strong>${starterName}</strong></td>
        <td>${state.starterPct}%</td>
        <td>${formatGrams(data.starterWeight)}</td>
        <td class="col-highlight">${formatGrams(data.starterWeight)}</td>
        <td>נשקלת בנפרד (בשיא כושרה)</td>
      </tr>
    `);
  }

  // 4. Commercial Yeast (if applicable)
  if (data.commercialYeastWeight > 0) {
    const yeastName = state.fermType === 'yeast_fresh' ? '🧊 שמרים טריים' : '✨ שמרים יבשים אינסטנט';
    rows.push(`
      <tr>
        <td><strong>${yeastName}</strong></td>
        <td>${state.yeastPct}%</td>
        <td>${formatGrams(data.commercialYeastWeight)}</td>
        <td class="col-highlight">${formatGrams(data.commercialYeastWeight)}</td>
        <td>הוספה ישירה לשקילה</td>
      </tr>
    `);
  }

  // 5. Salt
  rows.push(`
    <tr>
      <td><strong>🧂 מלח ים / אטלנטי</strong></td>
      <td>${state.saltPct}%</td>
      <td>${formatGrams(data.grossSalt)}</td>
      <td class="col-highlight">${formatGrams(data.grossSalt)}</td>
      <td>הוספה לאחר אוטוליזה / לקראת סיום הלישה</td>
    </tr>
  `);

  // 6. Optional Additions
  if (data.grossOil > 0) {
    rows.push(`
      <tr>
        <td><strong>🫒 שמן זית כתית טהור</strong></td>
        <td>${state.oilPct}%</td>
        <td>${formatGrams(data.grossOil)}</td>
        <td class="col-highlight">${formatGrams(data.grossOil)}</td>
        <td>הטמעה איטית בסיום הלישה</td>
      </tr>
    `);
  }

  if (data.grossSugar > 0) {
    rows.push(`
      <tr>
        <td><strong>🍯 סוכר / דבש</strong></td>
        <td>${state.sugarPct}%</td>
        <td>${formatGrams(data.grossSugar)}</td>
        <td class="col-highlight">${formatGrams(data.grossSugar)}</td>
        <td>הוספה יחד עם המים הראשוניים</td>
      </tr>
    `);
  }

  // Total summary row
  rows.push(`
    <tr style="background: rgba(245, 158, 11, 0.12); font-weight: 800; border-top: 2px solid var(--gold-500);">
      <td><strong>סה"כ משקל בצק במלוש 🥣</strong></td>
      <td>—</td>
      <td>—</td>
      <td class="col-highlight" style="font-size: 1.15rem; color: var(--gold-400);">${formatGrams(data.finalTotalDough)}</td>
      <td><strong>שקילה סופית מדויקת</strong></td>
    </tr>
  `);

  tbody.innerHTML = rows.join('');
}

function formatGrams(val) {
  if (val === undefined || isNaN(val)) return '0 גרם';
  const rounded = Math.round(val);
  return rounded.toLocaleString('he-IL') + ' גרם';
}

function generateWeighingSummaryText() {
  const flourText = document.getElementById('displayBaseFlour').textContent;
  const doughText = document.getElementById('totalDoughWeight').textContent;
  const loavesText = document.getElementById('summaryLoafCount').textContent;
  
  let summary = `בית האפיות (The Bakery House) — דף שקילה למלוש 🥣\n`;
  summary += `סה"כ קמח במתכון: ${flourText} | הידרציה: ${state.hydrationPct}%\n`;
  summary += `מערכת התפחה: ${getFermDisplayName(state.fermType)}\n`;
  summary += `משקל בצק כולל: ${doughText} (${loavesText})\n`;
  summary += `\n--- שקילה בפועל למלוש (אחרי קיזוז) ---\n`;

  const rows = document.querySelectorAll('#scaleTableBody tr');
  rows.forEach(tr => {
    const cols = tr.querySelectorAll('td');
    if (cols.length >= 4) {
      const ingName = cols[0].textContent.trim();
      const amount = cols[3].textContent.trim();
      const note = cols[4] ? cols[4].textContent.trim() : '';
      summary += `• ${ingName}: ${amount} [${note}]\n`;
    }
  });

  return summary;
}

function copyWeighingRecipe() {
  const summary = generateWeighingSummaryText();
  copyToClipboard(summary, state.lang === 'en' ? "Weighing summary copied to clipboard! 📋" : "סיכום השקילה הועתק ללוח בהצלחה! 📋");
}

function downloadFile(filename, text) {
  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'bakery_download.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Error in downloadFile:", e);
  }
}

function copyToClipboard(text, successMessage) {
  const msg = successMessage || (state.lang === 'en' ? "Copied to clipboard! 📋" : "הועתק ללוח בהצלחה! 📋");
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(msg);
    }).catch(() => {
      fallbackExecCommandCopy(text, msg);
    });
  } else {
    fallbackExecCommandCopy(text, msg);
  }
}

function fallbackExecCommandCopy(text, successMessage) {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    if (successful) {
      showToast(successMessage);
    } else {
      showToast(state.lang === 'en' ? "Please copy manually" : "נא להעתיק באופן ידני", "error");
    }
  } catch (err) {
    showToast(state.lang === 'en' ? "Copy failed" : "העתקה נכשלה", "error");
  }
}

function downloadWeighingTxt() {
  const text = generateWeighingSummaryText();
  downloadFile("bakery_house_weighing_sheet.txt", text);
  showToast(state.lang === 'en' ? "Weighing sheet downloaded! 💾" : "קובץ השקילה הורד בהצלחה! 💾");
}

function getFermDisplayName(type) {
  const isEn = state.lang === 'en';
  switch (type) {
    case 'liquid_sourdough': return isEn ? 'Liquid Sourdough 100%' : 'מחמצת נוזלית 100%';
    case 'pasta_madre': return isEn ? 'Solid Pasta Madre 50%' : 'פסטה מדרה קשה 50%';
    case 'yeast_dry': return isEn ? 'Instant Dry Yeast' : 'שמרים יבשים אינסטנט';
    case 'yeast_fresh': return isEn ? 'Fresh / Compressed Yeast' : 'שמרים טריים / לחים';
    case 'hybrid': return isEn ? 'Hybrid (Sourdough + Yeast)' : 'שילוב היברידי (מחמצת + שמרים)';
    default: return type;
  }
}

function translateCategory(cat) {
  switch (cat) {
    case 'מחמצת כפרית': return 'Country Sourdough';
    case 'וינואזרי וקונדיטוריה': return 'Viennoiserie & Pastry';
    case 'מאפים ופוקאצ\'ות': return 'Breads & Focaccias';
    case 'לחמים מיוחדים': return 'Specialty Breads';
    default: return cat || 'Boutique Recipe';
  }
}

// ==========================================
// 5. RECIPE ARSENAL (ארסנל המתכונים)
// ==========================================

async function loadRecipes() {
  try {
    const res = await fetch('recipes.json');
    if (res.ok) {
      state.recipes = await res.json();
    }
  } catch (err) {
    console.error("Error loading recipes.json:", err);
  }

  updateRecipeCounts();
  renderRecipesGrid();
}

function updateRecipeCounts() {
  const total = state.recipes.length;
  const free = state.recipes.filter(r => !r.isPro).length;
  const pro = state.recipes.filter(r => r.isPro).length;
  const favCount = (state.user && state.user.favorites) ? state.user.favorites.length : 0;

  if (document.getElementById('countAll')) document.getElementById('countAll').textContent = total;
  if (document.getElementById('countFree')) document.getElementById('countFree').textContent = free;
  if (document.getElementById('countPro')) document.getElementById('countPro').textContent = pro;
  if (document.getElementById('countFav')) document.getElementById('countFav').textContent = favCount;
  if (document.getElementById('favCountBadge')) document.getElementById('favCountBadge').textContent = favCount;
  if (document.getElementById('recipeCountBadge')) document.getElementById('recipeCountBadge').textContent = total;
}

function filterRecipes(filterType, el) {
  state.activeFilter = filterType;
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.classList.remove('active');
  });

  const activePill = el || document.querySelector(`.filter-pill[data-filter="${filterType}"]`);
  if (activePill) activePill.classList.add('active');

  renderRecipesGrid();
}

function onSearchRecipes() {
  state.searchQuery = document.getElementById('recipeSearchInput').value.trim().toLowerCase();
  renderRecipesGrid();
}

function onCategoryFilterChange() {
  state.activeCategory = document.getElementById('categorySelect').value;
  renderRecipesGrid();
}

function renderRecipesGrid() {
  const container = document.getElementById('recipesGridContainer');
  if (!container) return;

  const filtered = state.recipes.filter(recipe => {
    // 1. Pro / Free / Favorites Filter
    if (state.activeFilter === 'favorites' && !isFavorite(recipe.id)) return false;
    if (state.activeFilter === 'free' && recipe.isPro) return false;
    if (state.activeFilter === 'pro' && !recipe.isPro) return false;

    // 2. Category Filter
    if (state.activeCategory !== 'all' && recipe.category !== state.activeCategory) return false;

    // 3. Search Query
    if (state.searchQuery) {
      const q = state.searchQuery;
      const titleMatch = recipe.title.toLowerCase().includes(q) || (recipe.titleEn && recipe.titleEn.toLowerCase().includes(q));
      const descMatch = recipe.description && recipe.description.toLowerCase().includes(q);
      const flourMatch = recipe.flourBlend && recipe.flourBlend.some(f => f.name.toLowerCase().includes(q));
      if (!titleMatch && !descMatch && !flourMatch) return false;
    }

    return true;
  });

  const isEn = state.lang === 'en';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center" style="grid-column: 1 / -1; padding: 40px;">
        <span style="font-size: 48px;">🔍</span>
        <h4 style="margin: 10px 0;">${isEn ? 'No matching formulas found' : 'לא נמצאו מתכונים תואמים'}</h4>
        <p class="text-muted">${isEn ? 'Try adjusting your search query, or star ⭐ recipes to add to favorites' : 'נסו לשנות את מסנני החיפוש, או סמנו מתכונים בכוכב ⭐ להוספה למועדפים'}</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(recipe => {
    const isPro = recipe.isPro;
    const proBadge = isPro ? `<span class="badge-pro">👑 Pro</span>` : `<span class="badge-free">🌾 ${isEn ? 'Free' : 'חינמי'}</span>`;
    const favActive = isFavorite(recipe.id);
    const title = (isEn && recipe.titleEn) ? recipe.titleEn : recipe.title;
    const cat = isEn ? translateCategory(recipe.category) : (recipe.category || 'מתכון בוטיק');
    const desc = recipe.description || '';

    return `
      <div class="recipe-card ${isPro ? 'pro-card' : ''}" id="recipe-card-${recipe.id}">
        <div>
          <div class="recipe-card-header">
            <div class="recipe-title-group">
              <span class="recipe-icon">${recipe.icon || '🥖'}</span>
              <div>
                <h3>${title}</h3>
                <span class="modal-category">${cat}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${proBadge}
              <button class="btn-fav-star ${favActive ? 'active' : ''}" onclick="toggleFavorite('${recipe.id}', event)" title="${favActive ? (isEn ? 'Remove from favorites' : 'הסר ממועדפים') : (isEn ? 'Add to favorites' : 'הוסף למועדפים')}">
                ${favActive ? '⭐' : '☆'}
              </button>
            </div>
          </div>

          <p class="recipe-desc">${desc}</p>

          <div class="recipe-quick-specs">
            <div class="spec-item">
              <span>${isEn ? 'Hydration' : 'הידרציה'}</span>
              <strong>${recipe.hydrationPercent}%</strong>
            </div>
            <div class="spec-item">
              <span>${isEn ? 'Leaven' : 'התפחה'}</span>
              <strong>${recipe.starterPercent}%</strong>
            </div>
            <div class="spec-item">
              <span>${isEn ? 'Salt' : 'מלח'}</span>
              <strong>${recipe.saltPercent}%</strong>
            </div>
          </div>
        </div>

        <div class="recipe-card-actions">
          <button class="btn btn-gold btn-sm" onclick="startBakerWorkflow('${recipe.id}')" title="${isEn ? 'Start guided baking mode' : 'התחל אפייה פעילה עם טיימרים מובנים ושלבים'}">
            🔥 ${isEn ? 'Start Bake' : 'התחל אפייה'}
          </button>
          <button class="btn btn-outline-gold btn-sm" onclick="loadRecipeToCalculator('${recipe.id}')" title="${isEn ? 'Load to calculator' : 'טען למחשבון האופים החכם'}">
            🧮 ${isEn ? 'Calculator' : 'מחשבון'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="openRecipeModal('${recipe.id}')" title="${isEn ? 'View steps' : 'צפה בשלבי הכנה מלאים'}">
            📖 ${isEn ? 'Steps' : 'שלבים'}
          </button>
          <button class="btn btn-whatsapp btn-sm" onclick="shareRecipeWhatsApp('${recipe.id}')" title="${isEn ? 'Share via WhatsApp' : 'שתף מתכון זה בווטסאפ'}">
            📲
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function openRecipeModal(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  state.selectedRecipeForModal = recipe;
  const isEn = state.lang === 'en';

  document.getElementById('modalRecipeIcon').textContent = recipe.icon || '🥖';
  document.getElementById('modalRecipeTitle').textContent = (isEn && recipe.titleEn) ? recipe.titleEn : recipe.title;
  document.getElementById('modalRecipeCategory').textContent = isEn ? translateCategory(recipe.category) : recipe.category;
  document.getElementById('modalRecipeDesc').textContent = recipe.description;

  document.getElementById('modalSpecFerm').textContent = getFermDisplayName(recipe.fermentationType);
  document.getElementById('modalSpecHydration').textContent = recipe.hydrationPercent + '%';
  document.getElementById('modalSpecStarter').textContent = recipe.starterPercent + '%';
  document.getElementById('modalSpecSalt').textContent = recipe.saltPercent + '%';

  const proRow = document.getElementById('modalProBadgeRow');
  if (recipe.isPro) {
    proRow.classList.remove('d-none');
  } else {
    proRow.classList.add('d-none');
  }

  // Flour blend
  const flourList = document.getElementById('modalFlourBlendList');
  if (recipe.flourBlend && recipe.flourBlend.length > 0) {
    flourList.innerHTML = recipe.flourBlend.map(f => `
      <li>
        <span>${f.name}</span>
        <strong>${f.percent}%</strong>
      </li>
    `).join('');
  } else {
    flourList.innerHTML = `<li><span>קמח חיטה לבן מועשר</span><strong>100%</strong></li>`;
  }

  // Chronological Process Steps
  const stepsList = document.getElementById('modalProcessStepsList');
  const steps = recipe.steps || recipe.processSteps || [];
  if (steps.length > 0) {
    stepsList.innerHTML = steps.map((s, idx) => `
      <div class="timeline-step">
        <div class="step-badge-col">
          <span class="step-num-tag">${s.stepNumber || ('שלב ' + (idx + 1))}</span>
        </div>
        <div class="step-content">
          <div class="step-header-line">
            <strong class="step-title">${s.phase}</strong>
            <span class="step-duration-pill">⏱️ ${s.duration}</span>
          </div>
          ${s.temperature ? `<div class="step-temp-callout">🌡️ <strong>טמפרטורה:</strong> ${s.temperature}</div>` : ''}
          ${s.autolyseType && s.autolyseType !== 'ללא' ? `<div class="step-autolyse-callout">🌾 <strong>אוטוליזה:</strong> ${s.autolyseType}</div>` : ''}
          ${s.foldInterval && s.foldInterval !== 'ללא' ? `<div class="step-fold-callout">🔄 <strong>מרווח קיפולים:</strong> ${s.foldInterval}</div>` : ''}
          ${s.ingredientsAdded ? `<div class="step-ingredients-callout">🥣 <strong>מרכיבים נכנסים בשלב זה:</strong> ${s.ingredientsAdded}</div>` : ''}
          <p class="step-details-text">${s.details}</p>
        </div>
      </div>
    `).join('');
  } else {
    stepsList.innerHTML = `<p class="text-muted">שלבי ההכנה מפורטים במחשבון האופים.</p>`;
  }

  // Pro Notes
  const proNotesBox = document.getElementById('modalProNotesBox');
  if (recipe.isPro && recipe.proNotes) {
    proNotesBox.classList.remove('d-none');
    document.getElementById('modalProNotesContent').textContent = recipe.proNotes;
  } else {
    proNotesBox.classList.add('d-none');
  }

  openModal('recipeModal');
}

function loadCurrentModalRecipeToCalculator() {
  if (state.selectedRecipeForModal) {
    loadRecipeToCalculator(state.selectedRecipeForModal.id);
    closeModal('recipeModal');
  }
}

function loadRecipeToCalculator(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  // Set calculator inputs
  document.getElementById('rangeHydration').value = recipe.hydrationPercent;
  document.getElementById('numHydration').value = recipe.hydrationPercent;
  document.getElementById('rangeStarter').value = recipe.starterPercent;
  document.getElementById('numStarter').value = recipe.starterPercent;
  document.getElementById('rangeSalt').value = recipe.saltPercent;
  document.getElementById('numSalt').value = recipe.saltPercent;

  if (recipe.oilPercent !== undefined) document.getElementById('numOil').value = recipe.oilPercent;
  if (recipe.sugarPercent !== undefined) document.getElementById('numSugar').value = recipe.sugarPercent;
  if (recipe.yeastPercent !== undefined) {
    document.getElementById('rangeYeast').value = recipe.yeastPercent;
    document.getElementById('numYeast').value = recipe.yeastPercent;
  } else {
    document.getElementById('rangeYeast').value = 0;
    document.getElementById('numYeast').value = 0;
  }

  if (recipe.defaultLoafWeightGrams) {
    document.getElementById('inputUnitWeight').value = recipe.defaultLoafWeightGrams;
  }

  // Set Fermentation Type and sync visibility and calculations
  toggleLeavenParams(recipe.fermentationType || 'liquid_sourdough');

  // Switch to calculator tab and show toast
  switchTab('tab-calculator');
  showToast(`המתכון "${recipe.title}" נטען למחשבון! 🌾`);
}

function downloadCurrentRecipeTxt() {
  exportCurrentModalRecipe();
}

function exportCurrentModalRecipe() {
  const recipe = state.selectedRecipeForModal;
  if (!recipe) return;

  let text = `=====================================================\n`;
  text += `בית האפיות (The Bakery House) — דף מתכון מקצועי\n`;
  text += `מתכון: ${recipe.title} (${recipe.titleEn || ''})\n`;
  text += `קטגוריה: ${recipe.category} | סטטוס: ${recipe.isPro ? 'Pro 👑' : 'חינמי 🌾'}\n`;
  text += `=====================================================\n\n`;

  text += `מאפייני אופים:\n`;
  text += `• הידרציה: ${recipe.hydrationPercent}%\n`;
  text += `• מערכת התפחה: ${getFermDisplayName(recipe.fermentationType)} (${recipe.starterPercent}%)\n`;
  text += `• מלח: ${recipe.saltPercent}%\n`;
  if (recipe.oilPercent) text += `• שמן: ${recipe.oilPercent}%\n`;
  if (recipe.sugarPercent) text += `• סוכר: ${recipe.sugarPercent}%\n`;
  if (recipe.yeastPercent) text += `• שמרים: ${recipe.yeastPercent}%\n`;

  text += `\nהרכב קמחים:\n`;
  if (recipe.flourBlend) {
    recipe.flourBlend.forEach(f => {
      text += `• ${f.name}: ${f.percent}%\n`;
    });
  }

  text += `\n-----------------------------------------------------\n`;
  text += `שלבי הכנה כרונולוגיים מפורטים:\n`;
  text += `-----------------------------------------------------\n`;

  const steps = recipe.steps || recipe.processSteps || [];
  if (steps.length > 0) {
    steps.forEach((s, i) => {
      text += `\n${s.stepNumber || ('שלב ' + (i + 1))}: ${s.phase} (זמן: ${s.duration})\n`;
      if (s.temperature) text += `  🌡️ טמפרטורה: ${s.temperature}\n`;
      if (s.autolyseType && s.autolyseType !== 'ללא') text += `  🌾 אוטוליזה: ${s.autolyseType}\n`;
      if (s.foldInterval && s.foldInterval !== 'ללא') text += `  🔄 קיפולים: ${s.foldInterval}\n`;
      if (s.ingredientsAdded) text += `  🥣 מרכיבים נכנסים: ${s.ingredientsAdded}\n`;
      text += `  📝 הוראות: ${s.details}\n`;
    });
  }

  if (recipe.proNotes) {
    text += `\n💡 סוד המאסטר: ${recipe.proNotes}\n`;
  }

  exportTextContent(recipe.title, text, `${recipe.id}.txt`);
}

function exportWeighingSheet() {
  const text = generateWeighingSummaryText();
  exportTextContent("שקילת בצק למלוש - בית האפיות", text, "bakery_house_weighing.txt");
}

function exportTextContent(title, text, filename) {
  if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
    navigator.share({
      title: title,
      text: text
    }).then(() => {
      showToast("המתכון שותף / נשמר בהצלחה! 📲");
    }).catch((err) => {
      if (err.name !== 'AbortError') {
        fallbackClipboardAndDownload(text, filename);
      }
    });
    return;
  }
  fallbackClipboardAndDownload(text, filename);
}

function fallbackClipboardAndDownload(text, filename) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast("הטקסט הועתק ללוח בהצלחה! 📋");
    }).catch(() => {});
  }

  try {
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'bakery_recipe.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`הקובץ נשמר בהצלחה! 💾`);
  } catch (e) {
    console.error("Download fallback error:", e);
  }
}

// ==========================================
// 6. MODAL HELPERS & TOASTS
// ==========================================

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('d-none');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('d-none');
}

function onModalOverlayClick(e, modalId) {
  if (e.target.id === modalId) {
    closeModal(modalId);
  }
}

function showToast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '🍞' : '⚠️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==========================================
// 7. USER AUTHENTICATION & PERSONAL AREA
// ==========================================
const DEFAULT_USER = {
  id: 'guest',
  name: 'אופה אורח',
  email: '',
  role: 'guest',
  level: 'אופה ביתי',
  subscription: {
    tier: 'free', // 'free' | 'pro' | 'team'
    cycle: 'monthly',
    active: true,
    teamSeats: 1,
    activatedAt: new Date().toISOString()
  },
  favorites: ['classic-country-sourdough'],
  savedBatches: [],
  stats: { bakesCompleted: 0 }
};

function initUser() {
  try {
    const saved = localStorage.getItem('bakery_house_user');
    if (saved) {
      state.user = JSON.parse(saved);
      if (!state.user.favorites) state.user.favorites = ['classic-country-sourdough'];
      if (!state.user.savedBatches) state.user.savedBatches = [];
      if (!state.user.stats) state.user.stats = { bakesCompleted: 0 };
      if (!state.user.subscription) {
        state.user.subscription = {
          tier: 'free',
          cycle: 'monthly',
          active: true,
          teamSeats: 1,
          activatedAt: new Date().toISOString()
        };
      }
    } else {
      state.user = { ...DEFAULT_USER };
      saveUser();
    }
  } catch (e) {
    state.user = { ...DEFAULT_USER };
  }
  updateUserUI();
}

function saveUser() {
  try {
    localStorage.setItem('bakery_house_user', JSON.stringify(state.user));
  } catch (e) {
    console.error("Error saving user:", e);
  }
}

function updateUserUI() {
  if (!state.user) return;
  const isEn = state.lang === 'en';
  const tier = (state.user.subscription && state.user.subscription.tier) || 'free';

  const headerName = document.getElementById('headerUserName');
  const headerAvatar = document.getElementById('headerUserAvatar');
  const headerSubBadge = document.getElementById('headerSubBadge');

  if (headerName) {
    headerName.textContent = state.user.name || (isEn ? 'Guest' : 'אורח');
  }
  if (headerAvatar) {
    headerAvatar.textContent = tier === 'team' ? '👥' : (tier === 'pro' || state.user.role === 'pro_baker' ? '👑' : (state.user.role === 'baker' ? '🌾' : '👤'));
  }
  if (headerSubBadge) {
    if (tier === 'team') {
      headerSubBadge.classList.remove('d-none');
      headerSubBadge.textContent = 'TEAM 👥';
    } else if (tier === 'pro') {
      headerSubBadge.classList.remove('d-none');
      headerSubBadge.textContent = 'PRO 👑';
    } else {
      headerSubBadge.classList.add('d-none');
    }
  }

  const profileDisplayName = document.getElementById('profileDisplayName');
  const profileRoleBadge = document.getElementById('profileRoleBadge');
  const profileEmail = document.getElementById('profileEmail');
  const profileAvatarLarge = document.getElementById('profileAvatarLarge');
  const statFavoritesCount = document.getElementById('statFavoritesCount');
  const statSavedBatchesCount = document.getElementById('statSavedBatchesCount');
  const statBakesCompleted = document.getElementById('statBakesCompleted');

  if (profileDisplayName) profileDisplayName.textContent = state.user.name || (isEn ? 'Guest Baker' : 'אופה אורח');
  if (profileRoleBadge) {
    if (tier === 'team') {
      profileRoleBadge.textContent = isEn ? '👥 Bakery Crew Lead' : '👥 קברניט צוות מאפייה';
    } else if (tier === 'pro' || state.user.role === 'pro_baker') {
      profileRoleBadge.textContent = isEn ? '👑 Master Baker Pro' : '👑 Pro אופה מאסטר';
    } else if (state.user.role === 'baker') {
      profileRoleBadge.textContent = isEn ? '🌾 Registered Baker' : '🌾 אופה רשום';
    } else {
      profileRoleBadge.textContent = isEn ? 'Guest' : 'אורח';
    }
  }
  if (profileEmail) {
    profileEmail.textContent = state.user.email ? state.user.email : (isEn ? 'Local session stored in browser' : 'התחברות מקומית בדפדפן זה');
  }
  if (profileAvatarLarge) {
    profileAvatarLarge.textContent = tier === 'team' ? '👥' : (tier === 'pro' ? '👑' : (state.user.role === 'baker' ? '🌾' : '👤'));
  }

  const favs = state.user.favorites ? state.user.favorites.length : 0;
  const batches = state.user.savedBatches ? state.user.savedBatches.length : 0;
  const bakes = (state.user.stats && state.user.stats.bakesCompleted) || 0;

  if (statFavoritesCount) statFavoritesCount.textContent = favs;
  if (statSavedBatchesCount) statSavedBatchesCount.textContent = batches;
  if (statBakesCompleted) statBakesCompleted.textContent = bakes;

  // Subscription Hub card elements
  const subTierTitle = document.getElementById('subCardTierTitle');
  const subBadge = document.getElementById('subCardBadge');
  const subRenewal = document.getElementById('subCardRenewal');
  const subIcon = document.getElementById('subCardIcon');
  const subActionBtnText = document.getElementById('subCardActionBtnText');
  const teamSeatsIndicator = document.getElementById('subTeamSeatsIndicator');
  const teamSeatsText = document.getElementById('subTeamSeatsText');

  if (subTierTitle && subBadge && subRenewal && subIcon) {
    if (tier === 'team') {
      subTierTitle.textContent = isEn ? 'Current Subscription: Bakery Crew (Team Tier)' : 'מנוי נוכחי: חבילת צוות ומאפיות (Team)';
      subBadge.textContent = isEn ? 'Team Crew 👥' : 'חבילת צוות 👥';
      subBadge.className = 'badge-sub-status badge-team';
      subRenewal.textContent = isEn ? 'Active Team plan! Up to 5 baker seats with team formula sync and VIP Keshet support.' : 'חבילת צוות פעילה! סנכרון 5 מושבי אופים, ייצוא פתקי מלוש ותמיכת VIP ממלונת קשת.';
      subIcon.textContent = '🥖';
      if (subActionBtnText) subActionBtnText.textContent = isEn ? '⚙️ Manage Team Subscription' : '⚙️ ניהול חבילת צוות';
      if (teamSeatsIndicator && teamSeatsText) {
        teamSeatsIndicator.classList.remove('d-none');
        teamSeatsText.textContent = isEn ? 'Active team seats: 1 of 5 bakers registered' : 'מושבי צוות פעילים: 1 מתוך 5 אופים';
      }
    } else if (tier === 'pro') {
      subTierTitle.textContent = isEn ? 'Current Subscription: Master Baker Pro' : 'מנוי נוכחי: מאסטר אופה Pro';
      subBadge.textContent = isEn ? 'Master Pro 👑' : 'מאסטר Pro 👑';
      subBadge.className = 'badge-sub-status badge-pro';
      subRenewal.textContent = isEn ? 'Active Pro plan! All 10 boutique formulas unlocked, oven chime timers, and unlimited notebook.' : 'מנוי Master Pro פעיל! כל 10 המתכונים פתוחים, טיימרים קוליים ומחברת שקילות ללא הגבלה.';
      subIcon.textContent = '👑';
      if (subActionBtnText) subActionBtnText.textContent = isEn ? '💎 Manage / Upgrade to Team' : '💎 ניהול מנוי / שדרוג לצוות';
      if (teamSeatsIndicator) teamSeatsIndicator.classList.add('d-none');
    } else {
      subTierTitle.textContent = isEn ? 'Current Subscription: Home Artisan (Free)' : 'מנוי נוכחי: אופה ביתי (חינם)';
      subBadge.textContent = isEn ? 'Free 🌾' : 'חינם 🌾';
      subBadge.className = 'badge-sub-status badge-free';
      subRenewal.textContent = isEn ? 'Access to smart calculator, base formulas, and up to 3 saved notebook recipes.' : 'גישה למחשבון החכם, מתכוני הבסיס ועד 3 שקילות שמורות במחברת.';
      subIcon.textContent = '🌾';
      if (subActionBtnText) subActionBtnText.textContent = isEn ? '💎 Upgrade to Master Pro / Team' : '💎 שדרג ל-Master Pro / צוות';
      if (teamSeatsIndicator) teamSeatsIndicator.classList.add('d-none');
    }
  }

  updateRecipeCounts();
}

function openAuthOrProfileModal() {
  if (state.user && state.user.role !== 'guest') {
    switchTab('tab-profile');
  } else {
    openAuthModal();
  }
}

function openAuthModal() {
  openModal('authModal');
}

function switchAuthTab(tab, el) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form-panel').forEach(p => p.classList.add('d-none'));

  if (el) el.classList.add('active');
  const panel = document.getElementById(`authForm${tab.charAt(0).toUpperCase() + tab.slice(1)}`);
  if (panel) panel.classList.remove('d-none');
}

function submitGuestLogin() {
  const nick = (document.getElementById('guestNickname').value || '').trim() || 'אופה אורח';
  state.user.name = nick;
  state.user.role = 'guest';
  saveUser();
  updateUserUI();
  closeModal('authModal');
  showToast(`ברוך הבא, ${nick}! נכנסת כאורח 🌾`);
}

function submitBakerLogin() {
  const email = (document.getElementById('loginEmail').value || '').trim();
  const name = (document.getElementById('loginName').value || '').trim();
  if (!name) {
    showToast("נא להזין שם אופה", "error");
    return;
  }
  state.user.name = name;
  state.user.email = email;
  state.user.role = 'baker';
  saveUser();
  updateUserUI();
  closeModal('authModal');
  showToast(`שלום ${name}! התחברת בהצלחה 🥖`);
}

function submitBakerRegister() {
  const name = (document.getElementById('regName').value || '').trim();
  const email = (document.getElementById('regEmail').value || '').trim();
  const level = document.getElementById('regLevel').value;
  if (!name) {
    showToast("נא להזין שם מלא", "error");
    return;
  }
  state.user.name = name;
  state.user.email = email;
  state.user.level = level;
  state.user.role = level.includes('מקצועי') ? 'pro_baker' : 'baker';
  saveUser();
  updateUserUI();
  closeModal('authModal');
  showToast(`ברכות ${name}! הפרופיל שלך נוצר בהצלחה ✨`);
}

function logoutCurrentUser() {
  state.user = {
    id: 'guest',
    name: 'אופה אורח',
    email: '',
    role: 'guest',
    level: 'אופה ביתי',
    favorites: state.user.favorites || [],
    savedBatches: state.user.savedBatches || [],
    stats: state.user.stats || { bakesCompleted: 0 }
  };
  saveUser();
  updateUserUI();
  renderProfileArea();
  showToast("התנתקת מהחשבון. הנך במצב אורח 🚶‍♂️");
}

// ==========================================
// 8. FAVORITES & SAVED BATCHES NOTEBOOK
// ==========================================

function isFavorite(recipeId) {
  return !!(state.user && state.user.favorites && state.user.favorites.includes(recipeId));
}

function toggleFavorite(recipeId, event) {
  if (event) event.stopPropagation();
  if (!state.user) initUser();
  if (!state.user.favorites) state.user.favorites = [];

  const idx = state.user.favorites.indexOf(recipeId);
  const isFavNow = idx === -1;
  if (isFavNow) {
    state.user.favorites.push(recipeId);
    showToast("המתכון נוסף למועדפים שלך! ⭐");
  } else {
    state.user.favorites.splice(idx, 1);
    showToast("המתכון הוסר מהמועדפים");
  }
  saveUser();
  updateUserUI();
  renderRecipesGrid();
  renderProfileFavorites();
}

function renderProfileArea() {
  updateUserUI();
  renderProfileFavorites();
  renderProfileSavedBatches();
}

function renderProfileFavorites() {
  const container = document.getElementById('profileFavoritesGrid');
  if (!container) return;
  const favIds = (state.user && state.user.favorites) || [];
  const favRecipes = state.recipes.filter(r => favIds.includes(r.id));

  if (favRecipes.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center" style="grid-column: 1 / -1; padding: 28px;">
        <span style="font-size: 38px;">⭐</span>
        <h4 style="margin: 8px 0;">אין עדיין מתכונים מועדפים</h4>
        <p class="text-muted">עברו ל"ארסנל מתכונים" ולחצו על סמל הכוכב בכל מתכון שתרצו לשמור כאן.</p>
        <button class="btn btn-outline-gold btn-sm mt-2" onclick="switchTab('tab-recipes')">מעבר לארסנל המתכונים 📖</button>
      </div>
    `;
    return;
  }

  container.innerHTML = favRecipes.map(recipe => `
    <div class="recipe-card ${recipe.isPro ? 'pro-card' : ''}">
      <div class="recipe-card-header">
        <div class="recipe-title-group">
          <span class="recipe-icon">${recipe.icon || '🥖'}</span>
          <div>
            <h3>${recipe.title}</h3>
            <span class="modal-category">${recipe.category}</span>
          </div>
        </div>
        <button class="btn-fav-star active" onclick="toggleFavorite('${recipe.id}', event)" title="הסר ממועדפים">⭐</button>
      </div>
      <p class="recipe-desc">${recipe.description || ''}</p>
      <div class="recipe-quick-specs">
        <div class="spec-item"><span>הידרציה</span><strong>${recipe.hydrationPercent}%</strong></div>
        <div class="spec-item"><span>התפחה</span><strong>${recipe.starterPercent}%</strong></div>
        <div class="spec-item"><span>מלח</span><strong>${recipe.saltPercent}%</strong></div>
      </div>
      <div class="recipe-card-actions">
        <button class="btn btn-gold btn-sm" onclick="startBakerWorkflow('${recipe.id}')">🔥 התחל אפייה</button>
        <button class="btn btn-outline-gold btn-sm" onclick="loadRecipeToCalculator('${recipe.id}')">🧮 מחשבון</button>
        <button class="btn btn-outline btn-sm" onclick="openRecipeModal('${recipe.id}')">📖 שלבים</button>
      </div>
    </div>
  `).join('');
}

function openSaveBatchModal() {
  const totalFlourText = document.getElementById('displayBaseFlour').textContent;
  const doughText = document.getElementById('totalDoughWeight').textContent;
  const preview = document.getElementById('batchSummaryPreview');
  if (preview) {
    preview.innerHTML = `
      <strong>סיכום נוכחי:</strong> קמח: ${totalFlourText} | הידרציה: ${state.hydrationPct}% | מלח: ${state.saltPct}% | התפחה: ${getFermDisplayName(state.fermType)} | סה"כ בצק: ${doughText}
    `;
  }
  document.getElementById('batchTitleInput').value = `נוסחת בצק ${new Date().toLocaleDateString('he-IL')}`;
  document.getElementById('batchNotesInput').value = '';
  openModal('saveBatchModal');
}

function confirmSaveBatch() {
  const title = (document.getElementById('batchTitleInput').value || '').trim() || 'נוסחת בצק אישית';
  const notes = (document.getElementById('batchNotesInput').value || '').trim();

  const batch = {
    id: 'batch_' + Date.now(),
    title: title,
    notes: notes,
    date: new Date().toLocaleDateString('he-IL'),
    calcMode: state.calcMode,
    fermType: state.fermType,
    baseFlour: parseFloat(document.getElementById('inputBaseFlour').value) || 1000,
    unitCount: parseFloat(document.getElementById('inputUnitCount').value) || 4,
    unitWeight: parseFloat(document.getElementById('inputUnitWeight').value) || 850,
    hydrationPct: state.hydrationPct,
    starterPct: state.starterPct,
    saltPct: state.saltPct,
    yeastPct: state.yeastPct,
    oilPct: state.oilPct,
    sugarPct: state.sugarPct,
    icePct: state.icePct
  };

  if (!state.user.savedBatches) state.user.savedBatches = [];
  state.user.savedBatches.unshift(batch);
  saveUser();
  updateUserUI();
  closeModal('saveBatchModal');
  showToast(`השקילה "${title}" נשמרה למחברת בהצלחה! 📓`);
}

function loadSavedBatch(batchId) {
  const batch = state.user.savedBatches.find(b => b.id === batchId);
  if (!batch) return;

  setCalcMode(batch.calcMode || 'flour');
  document.getElementById('inputBaseFlour').value = batch.baseFlour || 1000;
  document.getElementById('inputUnitCount').value = batch.unitCount || 4;
  document.getElementById('inputUnitWeight').value = batch.unitWeight || 850;

  document.getElementById('rangeHydration').value = batch.hydrationPct;
  document.getElementById('numHydration').value = batch.hydrationPct;
  document.getElementById('rangeStarter').value = batch.starterPct;
  document.getElementById('numStarter').value = batch.starterPct;
  document.getElementById('rangeSalt').value = batch.saltPct;
  document.getElementById('numSalt').value = batch.saltPct;
  document.getElementById('rangeYeast').value = batch.yeastPct || 0;
  document.getElementById('numYeast').value = batch.yeastPct || 0;
  document.getElementById('numOil').value = batch.oilPct || 0;
  document.getElementById('numSugar').value = batch.sugarPct || 0;
  document.getElementById('numIcePct').value = batch.icePct || 0;

  toggleLeavenParams(batch.fermType);
  switchTab('tab-calculator');
  showToast(`השקילה "${batch.title}" נטענה למחשבון! 🥣`);
}

function deleteSavedBatch(batchId) {
  if (!confirm("האם למחוק שקילה זו מהמחברת?")) return;
  state.user.savedBatches = state.user.savedBatches.filter(b => b.id !== batchId);
  saveUser();
  updateUserUI();
  renderProfileSavedBatches();
  showToast("השקילה נמחקה מהמחברת");
}

function renderProfileSavedBatches() {
  const container = document.getElementById('profileSavedBatchesGrid');
  if (!container) return;
  const batches = (state.user && state.user.savedBatches) || [];

  if (batches.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center" style="grid-column: 1 / -1; padding: 24px;">
        <span style="font-size: 34px;">📓</span>
        <h4 style="margin: 8px 0;">אין שקילות שמורות במחברת</h4>
        <p class="text-muted">כשאתם מרכיבים נוסחה במחשבון, לחצו על "📓 שמור למחברת" והיא תופיע כאן לשימוש חוזר בכל עת.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = batches.map(b => `
    <div class="saved-batch-card">
      <div>
        <div class="batch-card-header">
          <div>
            <h4 class="batch-title">${b.title}</h4>
            <span class="text-muted" style="font-size: 0.76rem;">📅 ${b.date} • ${getFermDisplayName(b.fermType)}</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="deleteSavedBatch('${b.id}')" title="מחק שקילה">🗑️</button>
        </div>
        ${b.notes ? `<p class="recipe-desc" style="font-size: 0.82rem; margin-bottom: 8px;">${b.notes}</p>` : ''}
        <div class="batch-specs-pills">
          <span class="batch-spec-pill">💧 הידרציה: ${b.hydrationPct}%</span>
          <span class="batch-spec-pill">🧂 מלח: ${b.saltPct}%</span>
          <span class="batch-spec-pill">🌾 קמח: ${b.baseFlour}g</span>
          ${b.starterPct > 0 ? `<span class="batch-spec-pill">🧪 מחמצת: ${b.starterPct}%</span>` : ''}
          ${b.yeastPct > 0 ? `<span class="batch-spec-pill">✨ שמרים: ${b.yeastPct}%</span>` : ''}
        </div>
      </div>
      <button class="btn btn-outline-gold btn-sm w-100 mt-2" onclick="loadSavedBatch('${b.id}')">
        🥣 טען שקילה זו למחשבון
      </button>
    </div>
  `).join('');
}

// ==========================================
// 9. SMART SYSTEM RECOMMENDATIONS & PRESETS
// ==========================================
const SMART_PRESETS = {
  sourdough_country: {
    title: 'מחמצת כפרית קלאסית (Country Sourdough)',
    hydration: 74,
    salt: 2.1,
    starter: 20,
    yeast: 0,
    oil: 0,
    sugar: 0,
    ice: 0,
    fermType: 'liquid_sourdough',
    ddt: '24°C - 26°C',
    advice: 'אידיאלי לשילוב קמח לחם חזק (T65) עם 15%-25% קמחים מלאים באבן ריחיים. מומלץ 45 דק\' אוטוליזה ו-3 קיפולי סליל.'
  },
  pizza_napoletana: {
    title: 'פיצה נפוליטנית אותנטית (Pizza Napoletana)',
    hydration: 65,
    salt: 2.8,
    starter: 0,
    yeast: 0.2,
    oil: 0,
    sugar: 0,
    ice: 0,
    fermType: 'yeast_dry',
    ddt: '22°C - 24°C',
    advice: 'מלח גבוה (2.8%) מחזק את הגלוטן ומעניק גמישות לפתיחה דקה בידיים. ללא שמן כלל לאפייה בטאבון לוהט (450°C).'
  },
  rich_challah: {
    title: 'חלת שבת עשירה וקטיפתית (Challah)',
    hydration: 58,
    salt: 1.8,
    starter: 0,
    yeast: 1.2,
    oil: 6.0,
    sugar: 8.0,
    ice: 0,
    fermType: 'yeast_dry',
    ddt: '26°C - 27°C',
    advice: 'שילוב שמן זך וסוכר יוצר מעטפת עדינה ומרקם קטיפתי (Crumb) ששומר על רכות וטריות עד סעודה שלישית.'
  },
  french_baguette: {
    title: 'באגט צרפתי מסורתי (Artisan Baguette)',
    hydration: 68,
    salt: 2.0,
    starter: 0,
    yeast: 0.4,
    oil: 0,
    sugar: 0,
    ice: 0,
    fermType: 'yeast_dry',
    ddt: '23°C - 24°C',
    advice: 'דורש התפחה קרה איטית של 18-24 שעות במקרר לפיתוח ארומות עמוקות ומרקם פריך בעל "אוזניים" חדות.'
  },
  crispy_focaccia: {
    title: 'פוקאצ\'ה איטלקית מלאת בועות (Focaccia)',
    hydration: 82,
    salt: 2.3,
    starter: 20,
    yeast: 0,
    oil: 5.0,
    sugar: 0,
    ice: 0,
    fermType: 'liquid_sourdough',
    ddt: '25°C - 26°C',
    advice: 'הידרציה גבוהה של 82% עם שמן זית בתוך הבצק ובנדיבות בתבנית. יוצרת בועות ענק (Alveoli) ותחתית פריכה במיוחד.'
  },
  ny_bagel: {
    title: 'בייגל ניו יורק מסורתי (NY Boiled Bagel)',
    hydration: 56,
    salt: 2.2,
    starter: 0,
    yeast: 0.8,
    oil: 0,
    sugar: 3.0,
    ice: 0,
    fermType: 'yeast_dry',
    ddt: '25°C',
    advice: 'בצק יבש ודחוס במיוחד (56%). דורש בישול קצר של 45 שניות בסיר מים רותחים עם סילאן לפני כניסה לאפייה.'
  },
  spelt_loaf: {
    title: 'לחם כוסמין מלא 100% (Whole Spelt)',
    hydration: 68,
    salt: 2.0,
    starter: 20,
    yeast: 0,
    oil: 0,
    sugar: 0,
    ice: 0,
    fermType: 'liquid_sourdough',
    ddt: '23°C - 24°C',
    advice: 'רשת הגלוטן של כוסמין עדינה ונוטה להתפרק בלישת יתר. יש לקצר את זמן הלישה ולעבוד עם מים קרים.'
  },
  french_brioche: {
    title: 'בריוש חמאה צרפתי עשיר (Brioche)',
    hydration: 52,
    salt: 2.0,
    starter: 0,
    yeast: 1.5,
    oil: 0,
    sugar: 12.0,
    ice: 0,
    fermType: 'yeast_dry',
    ddt: '22°C - 23°C',
    advice: 'חובה לפתח רשת גלוטן מלאה (מבחן חלון) לפני שמתחילים להטמיע קוביות חמאה קרה מאוד בהדרגה.'
  }
};

let currentSelectedPresetKey = null;

function onSelectPreset(key) {
  currentSelectedPresetKey = key;
  const card = document.getElementById('smartRecCard');
  const specsContainer = document.getElementById('smartRecSpecs');
  if (!card || !specsContainer) return;

  if (!key || key === 'custom' || !SMART_PRESETS[key]) {
    card.classList.add('d-none');
    return;
  }

  const p = SMART_PRESETS[key];
  specsContainer.innerHTML = `
    <div class="smart-rec-spec-item">
      <span>💧 הידרציה מומלצת</span>
      <strong>${p.hydration}%</strong>
    </div>
    <div class="smart-rec-spec-item">
      <span>🧂 מלח מומלץ</span>
      <strong>${p.salt}%</strong>
    </div>
    <div class="smart-rec-spec-item">
      <span>🧪 מערכת התפחה</span>
      <strong>${getFermDisplayName(p.fermType)}</strong>
    </div>
    <div class="smart-rec-spec-item">
      <span>🌡️ טמפ' סיום לישה (DDT)</span>
      <strong>${p.ddt}</strong>
    </div>
  `;

  let adviceHtml = `<div class="smart-rec-advice">💡 <strong>סוד המאסטר:</strong> ${p.advice}</div>`;
  specsContainer.insertAdjacentHTML('beforeend', adviceHtml);
  card.classList.remove('d-none');
}

function applyCurrentPreset() {
  if (!currentSelectedPresetKey || !SMART_PRESETS[currentSelectedPresetKey]) {
    currentSelectedPresetKey = 'sourdough_country';
    const select = document.getElementById('presetSelect');
    if (select) select.value = 'sourdough_country';
    onSelectPreset('sourdough_country');
  }
  const p = SMART_PRESETS[currentSelectedPresetKey];
  if (!p) return;

  document.getElementById('rangeHydration').value = p.hydration;
  document.getElementById('numHydration').value = p.hydration;
  document.getElementById('rangeSalt').value = p.salt;
  document.getElementById('numSalt').value = p.salt;
  document.getElementById('rangeStarter').value = p.starter;
  document.getElementById('numStarter').value = p.starter;
  document.getElementById('rangeYeast').value = p.yeast;
  document.getElementById('numYeast').value = p.yeast;
  document.getElementById('numOil').value = p.oil;
  document.getElementById('numSugar').value = p.sugar;
  document.getElementById('numIcePct').value = p.ice;

  toggleLeavenParams(p.fermType);
  const msg = state.lang === 'en'
    ? `Master settings for "${p.title.split('(')[1]?.replace(')', '') || p.title}" applied! ✨`
    : `הגדרות מאסטר עבור "${p.title}" הוחלו בהצלחה! ✨`;
  showToast(msg);
}

function updateRealtimeAdvice(hydration) {
  const tipBox = document.getElementById('hydrationTipBox');
  if (!tipBox) return;

  let text = '';
  if (hydration >= 80) {
    text = 'הידרציה גבוהה מאוד (80%+): מומלץ קמח חזק (W340+), קיפולי סליל עדינים ותבנית משומנת היטב.';
  } else if (hydration >= 74) {
    text = 'הידרציה אידיאלית למחמצת (74%-78%): מעניקה פתיחת רשת גלוטן מושלמת, אווריריות וקראסט פריך.';
  } else if (hydration >= 65) {
    text = 'הידרציה נוחה ומאוזנת (65%-72%): קלה מאוד לעיבוד ועיצוב בידיים, אידיאלית לפיצות, פוקאצ\'ות ובאגטים.';
  } else {
    text = 'הידרציה נמוכה (פחות מ-65%): מתאימה לחלות, בייגלים ופסטה מדרה קשה. דורשת לישה מכנית טובה.';
  }
  tipBox.innerHTML = `💡 <span>${text}</span>`;
}

// ==========================================
// 10. ACTIVE BAKER WORKFLOW MODE & TIMERS
// ==========================================

function startBakerWorkflow(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  state.workflow.recipe = recipe;
  state.workflow.currentStepIndex = 0;
  if (state.workflow.timerInterval) {
    clearInterval(state.workflow.timerInterval);
    state.workflow.timerInterval = null;
  }
  state.workflow.isRunning = false;

  document.getElementById('workflowRecipeTitle').textContent = `מצב אפייה פעיל — ${recipe.title}`;
  openModal('bakerWorkflowModal');
  renderWorkflowStep(0);
}

function startWorkflowFromModal() {
  if (state.selectedRecipeForModal) {
    closeModal('recipeModal');
    startBakerWorkflow(state.selectedRecipeForModal.id);
  }
}

function closeWorkflowModal() {
  if (state.workflow.timerInterval) {
    clearInterval(state.workflow.timerInterval);
    state.workflow.timerInterval = null;
  }
  state.workflow.isRunning = false;
  closeModal('bakerWorkflowModal');
}

function parseDurationToSeconds(durationStr) {
  if (!durationStr) return 1800;
  const s = durationStr.toLowerCase();
  
  const hourMatch = s.match(/(\d+(\.\d+)?)\s*(שעות|שעה|hours|hour)/);
  if (hourMatch) {
    return Math.round(parseFloat(hourMatch[1]) * 3600);
  }

  const minMatch = s.match(/(\d+)\s*(דקות|דק|minutes|min)/);
  if (minMatch) {
    return parseInt(minMatch[1], 10) * 60;
  }

  return 1800;
}

function renderWorkflowStep(stepIndex) {
  const recipe = state.workflow.recipe;
  if (!recipe) return;
  const steps = recipe.steps || recipe.processSteps || [];
  if (steps.length === 0) return;

  if (stepIndex < 0) stepIndex = 0;
  if (stepIndex >= steps.length) stepIndex = steps.length - 1;
  state.workflow.currentStepIndex = stepIndex;

  const step = steps[stepIndex];
  const total = steps.length;

  document.getElementById('workflowStepCounter').textContent = `שלב ${stepIndex + 1} מתוך ${total}`;
  const progressPct = ((stepIndex + 1) / total) * 100;
  document.getElementById('workflowProgressFill').style.width = `${progressPct}%`;

  const pillsContainer = document.getElementById('workflowStepsPills');
  if (pillsContainer) {
    pillsContainer.innerHTML = steps.map((st, i) => `
      <button type="button" class="step-nav-pill ${i === stepIndex ? 'active' : ''} ${i < stepIndex ? 'completed' : ''}" onclick="renderWorkflowStep(${i})">
        ${st.stepNumber || (i + 1)}: ${st.phase ? st.phase.split(' ')[0] : 'שלב'}
      </button>
    `).join('');
  }

  document.getElementById('workflowCurrentStepNum').textContent = step.stepNumber || `שלב ${stepIndex + 1}`;
  document.getElementById('workflowCurrentPhase').textContent = step.phase || '';
  document.getElementById('workflowCurrentDuration').textContent = `⏱️ ${step.duration || '30 דקות'}`;
  document.getElementById('workflowCurrentTitle').textContent = `${step.stepNumber ? step.stepNumber + ': ' : ''}${step.phase}`;

  document.getElementById('workflowTempVal').textContent = step.temperature || 'טמפרטורת חדר (23°C-25°C)';
  document.getElementById('workflowFoldsVal').textContent = step.foldInterval || 'ללא';
  document.getElementById('workflowAutolyseVal').textContent = step.autolyseType || 'ללא';

  const ingBox = document.getElementById('workflowIngredientsBox');
  if (step.ingredientsAdded && step.ingredientsAdded !== 'ללא תוספות') {
    ingBox.classList.remove('d-none');
    document.getElementById('workflowIngredientsVal').textContent = step.ingredientsAdded;
  } else {
    ingBox.classList.add('d-none');
  }

  document.getElementById('workflowInstructionsVal').textContent = step.details || 'בצעו את שלב זה לפי הוראות המתכון.';

  if (state.workflow.timerInterval) {
    clearInterval(state.workflow.timerInterval);
    state.workflow.timerInterval = null;
  }
  state.workflow.isRunning = false;

  const secs = parseDurationToSeconds(step.duration);
  state.workflow.timerSeconds = secs;
  state.workflow.initialStepSeconds = secs;

  updateTimerDisplay();
  updateTimerButtonsUI();

  const prevBtn = document.getElementById('workflowPrevBtn');
  const nextBtn = document.getElementById('workflowNextBtn');
  if (prevBtn) prevBtn.style.visibility = stepIndex === 0 ? 'hidden' : 'visible';
  if (nextBtn) {
    if (stepIndex === total - 1) {
      nextBtn.textContent = '🎉 סיום אפייה והשלמה!';
      nextBtn.className = 'btn btn-gold btn-lg';
    } else {
      nextBtn.textContent = 'סמן כהושלם ועבור לשלב הבא ✅';
      nextBtn.className = 'btn btn-gold btn-lg';
    }
  }
}

function updateTimerDisplay() {
  const display = document.getElementById('timerDigitsDisplay');
  if (!display) return;
  const s = Math.max(0, state.workflow.timerSeconds);
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;

  if (hours > 0) {
    display.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  } else {
    display.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
}

function updateTimerButtonsUI() {
  const btn = document.getElementById('btnToggleTimer');
  const status = document.getElementById('timerStatusLabel');
  if (!btn || !status) return;

  if (state.workflow.isRunning) {
    btn.textContent = '⏸️ השהה טיימר';
    btn.className = 'btn btn-timer-primary';
    status.textContent = 'סופר לאחור...';
    status.className = 'timer-status running';
  } else {
    btn.textContent = state.workflow.timerSeconds < state.workflow.initialStepSeconds ? '▶️ המשך טיימר' : '▶️ הפעל טיימר';
    btn.className = 'btn btn-timer-primary';
    status.textContent = state.workflow.timerSeconds <= 0 ? 'הסתיים! 🔔' : 'מוכן להפעלה';
    status.className = 'timer-status';
  }
}

function toggleTimer() {
  if (state.workflow.isRunning) {
    if (state.workflow.timerInterval) clearInterval(state.workflow.timerInterval);
    state.workflow.timerInterval = null;
    state.workflow.isRunning = false;
    updateTimerButtonsUI();
  } else {
    if (state.workflow.timerSeconds <= 0) {
      state.workflow.timerSeconds = state.workflow.initialStepSeconds;
    }
    state.workflow.isRunning = true;
    updateTimerButtonsUI();
    state.workflow.timerInterval = setInterval(tickTimer, 1000);
  }
}

function addTimerSeconds(secs) {
  state.workflow.timerSeconds += secs;
  updateTimerDisplay();
  showToast(`נוספו ${Math.round(secs / 60)} דקות לטיימר ⏱️`);
}

function resetCurrentStepTimer() {
  if (state.workflow.timerInterval) clearInterval(state.workflow.timerInterval);
  state.workflow.timerInterval = null;
  state.workflow.isRunning = false;
  state.workflow.timerSeconds = state.workflow.initialStepSeconds;
  updateTimerDisplay();
  updateTimerButtonsUI();
  showToast("הטיימר אופס לזמן המקורי של השלב");
}

function tickTimer() {
  state.workflow.timerSeconds--;
  updateTimerDisplay();

  if (state.workflow.timerSeconds <= 0) {
    if (state.workflow.timerInterval) clearInterval(state.workflow.timerInterval);
    state.workflow.timerInterval = null;
    state.workflow.isRunning = false;
    updateTimerButtonsUI();

    playBakeryChime();
    if (navigator.vibrate) {
      try { navigator.vibrate([300, 150, 300, 150, 400]); } catch(e){}
    }

    const step = state.workflow.recipe.steps[state.workflow.currentStepIndex];
    showToast(`⏰ הטיימר לשלב "${step ? step.phase : 'הנוכחי'}" הסתיים! עברו לשלב הבא.`);
  }
}

function playBakeryChime() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    const playTone = (freq, start, dur) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.35, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + dur);
    };

    playTone(523.25, now, 0.7);
    playTone(659.25, now + 0.18, 0.9);
    playTone(783.99, now + 0.36, 1.4);
  } catch (e) {
    console.warn("Audio playback not allowed:", e);
  }
}

function completeAndNextWorkflowStep() {
  const total = state.workflow.recipe.steps.length;
  const current = state.workflow.currentStepIndex;

  if (current < total - 1) {
    renderWorkflowStep(current + 1);
    showToast("שלב סומן כהושלם! ממשיכים לשלב הבא 🌾");
  } else {
    if (state.workflow.timerInterval) clearInterval(state.workflow.timerInterval);
    state.workflow.timerInterval = null;
    state.workflow.isRunning = false;

    if (!state.user.stats) state.user.stats = { bakesCompleted: 0 };
    state.user.stats.bakesCompleted = (state.user.stats.bakesCompleted || 0) + 1;
    saveUser();
    updateUserUI();

    playBakeryChime();
    closeModal('bakerWorkflowModal');
    showToast(`🎉 ברכות חמות! השלמתם אפייה מוצלחת של ${state.workflow.recipe.title}!`);
    switchTab('tab-profile');
  }
}

function goToPrevWorkflowStep() {
  if (state.workflow.currentStepIndex > 0) {
    renderWorkflowStep(state.workflow.currentStepIndex - 1);
  }
}

// ==========================================
// 11. WHATSAPP SHARING & DEEP LINKING
// ==========================================

function shareRecipeWhatsApp(recipeId) {
  const recipe = state.recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://the-bakery-house-app.netlify.app';
  const pathname = window.location.pathname || '/';
  const link = `${origin}${pathname}?recipe=${encodeURIComponent(recipe.id)}`;
  
  let text = `🍞 *מתכון מבית האפיות (The Bakery House)* 🌾\n`;
  text += `✨ *${recipe.title}* (${recipe.titleEn || ''})\n`;
  text += `${recipe.description || ''}\n\n`;
  text += `💧 הידרציה: *${recipe.hydrationPercent}%*\n`;
  text += `🧂 מלח: *${recipe.saltPercent}%*\n`;
  text += `🧪 מערכת התפחה: *${getFermDisplayName(recipe.fermentationType)} (${recipe.starterPercent}%)*\n`;
  if (recipe.flourBlend && recipe.flourBlend.length > 0) {
    text += `🌾 הרכב קמחים: ${recipe.flourBlend.map(f => f.name + ' (' + f.percent + '%)').join(', ')}\n`;
  }
  text += `\n👇 *לפתיחת המתכון המלא ומצב אפייה פעיל:*\n${link}`;

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

function shareCurrentModalRecipeWhatsApp() {
  if (state.selectedRecipeForModal) {
    shareRecipeWhatsApp(state.selectedRecipeForModal.id);
  }
}

function shareCalculatorWhatsApp() {
  const flourText = document.getElementById('displayBaseFlour').textContent;
  const doughText = document.getElementById('totalDoughWeight').textContent;
  const loavesText = document.getElementById('summaryLoafCount').textContent;

  const totalFlour = parseFloat(document.getElementById('inputBaseFlour').value) || 1000;
  const origin = window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://the-bakery-house-app.netlify.app';
  const pathname = window.location.pathname || '/';
  const link = `${origin}${pathname}?flour=${Math.round(totalFlour)}&hyd=${state.hydrationPct}&salt=${state.saltPct}&ferm=${state.fermType}&starter=${state.starterPct}&yeast=${state.yeastPct}&oil=${state.oilPct}&sugar=${state.sugarPct}`;

  let text = `🥣 *שקילה ונוסחת בצק — בית האפיות (The Bakery House)* 🌾\n`;
  text += `🌾 סה"כ קמח: *${flourText}*\n`;
  text += `💧 הידרציה: *${state.hydrationPct}%*\n`;
  text += `🧂 מלח: *${state.saltPct}%*\n`;
  text += `🧪 מערכת התפחה: *${getFermDisplayName(state.fermType)}*\n`;
  text += `🥖 משקל בצק כולל: *${doughText}* (${loavesText})\n\n`;
  text += `--- שקילה בפועל למלוש ---\n`;

  const rows = document.querySelectorAll('#scaleTableBody tr');
  rows.forEach(tr => {
    const cols = tr.querySelectorAll('td');
    if (cols.length >= 4) {
      text += `• ${cols[0].textContent.trim()}: *${cols[3].textContent.trim()}*\n`;
    }
  });

  text += `\n👇 *לפתיחת המחשבון החכם עם נוסחה זו בדיוק:*\n${link}`;

  const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(waUrl, '_blank');
}

function checkUrlDeepLinks() {
  try {
    const params = new URLSearchParams(window.location.search);
    
    const recipeId = params.get('recipe');
    if (recipeId) {
      setTimeout(() => {
        const found = state.recipes.find(r => r.id === recipeId);
        if (found) {
          switchTab('tab-recipes');
          openRecipeModal(recipeId);
          showToast(`המתכון "${found.title}" נפתח דרך הקישור! 📖`);
        }
      }, 400);
      return;
    }

    const bakeId = params.get('bake');
    if (bakeId) {
      setTimeout(() => {
        const found = state.recipes.find(r => r.id === bakeId);
        if (found) {
          startBakerWorkflow(bakeId);
        }
      }, 400);
      return;
    }

    if (params.get('flour') || params.get('hyd')) {
      if (params.get('flour')) document.getElementById('inputBaseFlour').value = params.get('flour');
      if (params.get('hyd')) {
        document.getElementById('rangeHydration').value = params.get('hyd');
        document.getElementById('numHydration').value = params.get('hyd');
      }
      if (params.get('salt')) {
        document.getElementById('rangeSalt').value = params.get('salt');
        document.getElementById('numSalt').value = params.get('salt');
      }
      if (params.get('starter')) {
        document.getElementById('rangeStarter').value = params.get('starter');
        document.getElementById('numStarter').value = params.get('starter');
      }
      if (params.get('yeast')) {
        document.getElementById('rangeYeast').value = params.get('yeast');
        document.getElementById('numYeast').value = params.get('yeast');
      }
      if (params.get('ferm')) {
        toggleLeavenParams(params.get('ferm'));
      } else {
        recalculate();
      }
      switchTab('tab-calculator');
      showToast("נוסחת הבצק המשותפת נטענה למחשבון! 🌾");
    }
  } catch (e) {
    console.error("Error parsing URL deep links:", e);
  }
}

// ==========================================================================
// 12. BILINGUAL I18N SYSTEM (Hebrew & English)
// ==========================================================================

const I18N = {
  he: {
    lang_btn_text: "English",
    brand_title: "בית האפיות",
    brand_sub: "ארטיזן, מחמצות ואפיית בוטיק",
    keshet_badge: "🛡️ בפיקוח קשת",
    nav_calculator: "מחשבון אופים חכם",
    nav_recipes: "ארסנל מתכונים",
    nav_profile: "אזור אישי ומועדפים",
    
    // Calculator
    calc_title: "🌾 מחשבון אופים חכם וקיזוז מחמצות מדויק",
    calc_sub: "חישוב דינמי לפי גרם קמח או כמות יחידות, עם קיזוז מדויק של נוזלים וקמח מתוך המחמצת או הפסטה מדרה לתוך המלוש.",
    reset_btn: "🔄 איפוס",
    save_notebook_btn: "📓 שמור למחברת",
    share_wa_btn: "📲 שתף בווטסאפ",
    share_scale_btn: "📋 שתף / העתק",
    mode_flour_btn: "⚖️ חישוב לפי גרם קמח (Flour Mode)",
    mode_units_btn: "🍞 חישוב לפי כמות יחידות / כיכרות (Units Mode)",
    flour_label: "משקל קמח כולל במתכון (גרם):",
    units_label: "כמות יחידות / כיכרות לאפייה:",
    unit_weight_label: "משקל ממוצע של כיכר בצק (גרם):",
    ferm_picker_label: "מערכת התפחה נבחרת לקיזוז (Fermentation System):",
    col_ingredient: "מרכיב לשקילה",
    col_pct: "אחוז אופים",
    col_gross: "משקל ברוטו (כולל)",
    col_mixer: "שקילה בפועל למלוש 🥣",
    col_offset_notes: "הערת קיזוז",
    copy_recipe_btn: "📋 העתק שקילה ללוח",
    download_txt_btn: "💾 הורד קובץ שקילה",
    smart_rec_title: "הצעת מערכת חכמה והמלצות מאסטר לאפייה",
    smart_rec_sub: "בחרו סגנון אפייה לקבלת יחס הידרציה מומלץ, אחוזי מלח וטמפרטורת סיום לישה (DDT)",
    apply_preset_btn: "✨ החל הגדרות מומלצות למחשבון",

    // Recipes
    recipes_title: "📖 ארסנל המתכונים של בית האפיות",
    recipes_sub: "מאגר מתכוני בוטיק מקצועיים עם שלבי הכנה כרונולוגיים מלאים, טמפרטורות מדויקות, וזמני מנוחה. בחרו מתכון להטענה ישירה למחשבון או לצפייה בשלבים.",
    filter_all: "הכל",
    filter_fav: "מועדפים שלי ⭐",
    filter_free: "מתכונים חינמיים 🌾",
    filter_pro: "מתכוני פרימיום 👑 Pro",
    search_placeholder: "🔍 חפש מתכון, קמח, מרכיב...",
    category_all: "כל הקטגוריות",
    btn_start_bake: "🔥 התחל אפייה",
    btn_calc: "🧮 מחשבון",
    btn_steps: "📖 שלבים",

    // Profile & Subscription
    profile_guest_title: "אופה אורח",
    profile_role_guest: "אורח",
    profile_role_baker: "🌾 אופה רשום",
    profile_role_pro: "👑 Pro אופה מאסטר",
    profile_role_team: "👥 קברניט צוות מאפייה",
    stat_favorites: "מתכונים מועדפים",
    stat_saved_batches: "שקילות שמורות",
    stat_bakes_completed: "אפייות שהושלמו 🔥",
    btn_login_switch: "🔑 התחבר / החלף חשבון",
    btn_logout: "🚪 התנתק",
    sub_current_plan: "מנוי נוכחי: אופה ביתי (חינם)",
    sub_status_free: "חינם 🌾",
    sub_status_pro: "👑 Master Pro",
    sub_status_team: "👥 חבילת צוות (5 מושבים)",
    sub_free_desc: "גישה למחשבון החכם, מתכוני הבסיס ועד 3 שקילות שמורות במחברת.",
    sub_pro_desc: "מנוי Master Pro פעיל! כל 10 המתכונים פתוחים, טיימרים קוליים ומחברת ללא הגבלה.",
    sub_team_desc: "חבילת צוות פעילה! סנכרון 5 מושבי אופים, ייצוא פתקי מלוש ותמיכת VIP ממלונת קשת.",
    sub_btn_upgrade: "💎 שדרג ל-Master Pro / צוות",
    sub_btn_chat: "צ'אט שירות מול קשת",
    benefit_timers: "מצב אפייה פעיל וטיימרים קוליים",
    benefit_all_recipes: "כל 10 מתכוני הבוטיק פתוחים",
    benefit_team_seats: "חבילת צוות: עד 5 אופים במקביל",
    benefit_keshet_support: "ליווי מקצועי ישיר ממלונת קשת",
    fav_section_title: "⭐ המתכונים המועדפים שלי",
    fav_section_sub: "מתכוני הבוטיק שסימנתם בכוכב לגישה מהירה",
    notebook_section_title: "📓 מחברת השקילות השמורות שלי",
    notebook_section_sub: "נוסחאות בצק שהרכבתם במחשבון האופים ושמרתם לשימוש חוזר",

    // Subscription Modal
    sub_modal_title: "תוכניות מנוי ושדרוג — בית האפיות",
    sub_modal_sub: "סנכרון מלא מול מלונת קשת • ביטול בכל עת",
    sub_cycle_monthly: "חיוב חודשי",
    sub_cycle_annual: "חיוב שנתי",
    sub_annual_save: "חיסכון 17% 🎁",
    tier_free_title: "חובב ביתי (חינם)",
    tier_free_tagline: "לאופים בתחילת הדרך",
    tier_pro_title: "מאסטר אופה Pro",
    tier_pro_tagline: "לאופי מחמצות ומאפיות ביתיות",
    tier_team_title: "חבילת צוות (Team Crew)",
    tier_team_tagline: "לקונדיטוריות וצוותי אופים (עד 5 משתמשים)",
    badge_popular: "⭐ הכי פופולרי",
    badge_team: "👥 חבילת צוות ומאפיות",
    per_month: "/חודש",
    per_year: "/שנה",
    feat_calc: "מחשבון אופים חכם וקיזוז מחמצת",
    feat_presets: "המלצות מערכת ל-8 סגנונות בצק",
    feat_free_recipes: "צפייה בסיסית במתכוני ארסנל",
    feat_notebook_3: "שמירת עד 3 שקילות במחברת",
    feat_no_timers: "מצב אפייה וטיימרים קוליים",
    feat_all_10_recipes: "כל 10 מתכוני הבוטיק פתוחים מלא",
    feat_active_timers: "מצב אפייה פעיל + טיימרים וצלילי תנור",
    feat_unlimited_notebook: "מחברת שקילות בלתי מוגבלת",
    feat_pro_badge: "תג Master Baker מוזהב בפרופיל",
    feat_wa_share: "שיתוף שקילות ומתכונים בווטסאפ",
    feat_direct_chat: "ערוץ צ'אט ייעוץ אישי",
    feat_5_seats: "עד 5 מושבי אופים (Baker Seats)",
    feat_team_sync: "סנכרון שקילות ונוסחאות בין חברי הצוות",
    feat_pro_included: "כל תכונות ה-Master Pro כלולות",
    feat_mixer_export: "ייצוא פתקי שקילה ייעודיים למלוש",
    feat_keshet_vip: "תמיכה עסקית וליווי ישיר ממלונת קשת",
    feat_tax_invoice: "הפקת חשבוניות מס מרוכזות לעסקים",
    plan_btn_current: "התוכנית הנוכחית שלך",
    plan_btn_select_pro: "👑 בחר ב-Master Pro",
    plan_btn_select_team: "👥 בחר בחבילת צוות",
    checkout_desc: "החיוב מתבצע בצורה מאובטחת ומפוקחת ע״י מערך התשלומים של מלונת קשת 🛡️",
    pay_method_card: "כרטיס אשראי",
    pay_method_bit: "אפליקציית ביט (Bit)",
    pay_method_apple: "Apple / Google Pay",
    label_card_num: "מספר כרטיס אשראי:",
    label_card_exp: "תוקף (MM/YY):",
    label_card_cvv: "CVV (3 ספרות):",
    label_card_holder: "שם מלא של בעל/ת הכרטיס:",
    bit_title: "תשלום מאובטח באמצעות ביט (Bit)",
    bit_desc: "בלחיצה על אישור תועברו לאישור מהיר של הבקשה ישירות באפליקציית ביט בנייד שלכם.",
    apple_title: "תשלום מהיר בנגיעה אחת (One-Touch Pay)",
    apple_desc: "זיהוי ביומטרי (Face ID / Touch ID) ואישור מיידי של המנוי ללא הקלדת כרטיס.",
    btn_confirm_pay: "אישור תשלום והפעלת מנוי מיידית",
    btn_cancel: "ביטול",

    // Support Chat Modal
    chat_modal_title: "מלונת קשת — שירות וליווי אופים",
    chat_modal_sub: "ערוץ ייעוץ ישיר למנויים, חשבוניות ונוסחאות אפייה",
    chat_status_online: "נציג מלונת קשת מחובר ומסייע בזמן אמת",
    chip_team: "👥 איך עובדת חבילת הצוות?",
    chip_hyd: "🥖 ייעוץ הידרציה לקמח",
    chip_invoice: "🧾 חשבונית מס למאפייה",
    chip_timer: "⏱️ שאלה על טיימר האפייה",
    chat_input_placeholder: "הקלד/י הודעה למלונת קשת...",
    chat_btn_send: "שלח"
  },
  en: {
    lang_btn_text: "עברית",
    brand_title: "The Bakery House",
    brand_sub: "Artisan Sourdough & Boutique Baking",
    keshet_badge: "🛡️ Supervised by Keshet",
    nav_calculator: "Smart Baker's Calc",
    nav_recipes: "Recipe Arsenal",
    nav_profile: "Personal Area & Favs",
    
    // Calculator
    calc_title: "🌾 Smart Baker's Calculator & Offset Engine",
    calc_sub: "Dynamic calculation by flour grams or loaf units, with exact offset of flour and water from starter directly into the mixer.",
    reset_btn: "🔄 Reset",
    save_notebook_btn: "📓 Save to Notebook",
    share_wa_btn: "📲 Share WhatsApp",
    share_scale_btn: "📋 Share / Copy",
    mode_flour_btn: "⚖️ By Flour Weight (Flour Mode)",
    mode_units_btn: "🍞 By Unit / Loaf Count (Units Mode)",
    flour_label: "Total Recipe Flour (Grams):",
    units_label: "Number of Loaves / Units:",
    unit_weight_label: "Target Loaf Dough Weight (Grams):",
    ferm_picker_label: "Fermentation System for Leaven Offset:",
    col_ingredient: "Ingredient to Weigh",
    col_pct: "Baker's %",
    col_gross: "Gross Weight",
    col_mixer: "Mixer Weighing 🥣",
    col_offset_notes: "Offset Notes",
    copy_recipe_btn: "📋 Copy Weighing to Clipboard",
    download_txt_btn: "💾 Download Weighing File",
    smart_rec_title: "Smart System Advice & Master Recommendations",
    smart_rec_sub: "Select a baking style for recommended hydration ratio, salt percentage, and desired dough temperature (DDT)",
    apply_preset_btn: "✨ Apply Recommended Settings",

    // Recipes
    recipes_title: "📖 The Bakery House Recipe Arsenal",
    recipes_sub: "Professional boutique formulas with chronological preparation stages, exact temperatures, and resting times. Select a recipe for direct calculation or view steps.",
    filter_all: "All",
    filter_fav: "My Favorites ⭐",
    filter_free: "Free Formulas 🌾",
    filter_pro: "Premium 👑 Pro",
    search_placeholder: "🔍 Search formula, flour, ingredient...",
    category_all: "All Categories",
    btn_start_bake: "🔥 Start Bake",
    btn_calc: "🧮 Calculator",
    btn_steps: "📖 Steps",

    // Profile & Subscription
    profile_guest_title: "Guest Baker",
    profile_role_guest: "Guest",
    profile_role_baker: "🌾 Registered Baker",
    profile_role_pro: "👑 Master Baker Pro",
    profile_role_team: "👥 Bakery Crew Lead",
    stat_favorites: "Favorite Recipes",
    stat_saved_batches: "Saved Weighings",
    stat_bakes_completed: "Completed Bakes 🔥",
    btn_login_switch: "🔑 Login / Switch Account",
    btn_logout: "🚪 Logout",
    sub_current_plan: "Current Subscription: Home Artisan (Free)",
    sub_status_free: "Free 🌾",
    sub_status_pro: "👑 Master Pro",
    sub_status_team: "👥 Bakery Crew (5 Seats)",
    sub_free_desc: "Access to smart calculator, base formulas, and up to 3 saved notebook recipes.",
    sub_pro_desc: "Active Master Pro plan! All 10 formulas unlocked, active timers, and unlimited notebook.",
    sub_team_desc: "Active Team Crew plan! 5 synchronized baker seats, mixer printouts, and VIP Keshet Kennel support.",
    sub_btn_upgrade: "💎 Upgrade to Master Pro / Team",
    sub_btn_chat: "Keshet Concierge Chat",
    benefit_timers: "Interactive Baker Mode & Chime Timers",
    benefit_all_recipes: "All 10 Boutique Formulas Unlocked",
    benefit_team_seats: "Bakery Crew: Up to 5 Bakers",
    benefit_keshet_support: "Direct Supervision by Keshet's Kennel",
    fav_section_title: "⭐ My Favorite Recipes",
    fav_section_sub: "Boutique formulas starred for instant access",
    notebook_section_title: "📓 My Saved Weighings Notebook",
    notebook_section_sub: "Dough formulas configured in the calculator and saved for future bakes",

    // Subscription Modal
    sub_modal_title: "Subscription Plans & Upgrades — The Bakery House",
    sub_modal_sub: "Synchronized with Keshet's Kennel • Cancel Anytime",
    sub_cycle_monthly: "Monthly Billing",
    sub_cycle_annual: "Annual Billing",
    sub_annual_save: "Save 17% 🎁",
    tier_free_title: "Home Artisan (Free)",
    tier_free_tagline: "For bakers starting out",
    tier_pro_title: "Master Baker Pro",
    tier_pro_tagline: "For sourdough lovers & artisan micro-bakers",
    tier_team_title: "Bakery Crew / Team Tier",
    tier_team_tagline: "For bakeries, confectionery & teams (up to 5 users)",
    badge_popular: "⭐ MOST POPULAR",
    badge_team: "👥 BAKERY CREW & SHOPS",
    per_month: "/month",
    per_year: "/year",
    feat_calc: "Smart Baker's Calculator & Starter Offset",
    feat_presets: "System Presets for 8 Dough Styles",
    feat_free_recipes: "Basic View for Recipe Arsenal",
    feat_notebook_3: "Save up to 3 Recipes in Notebook",
    feat_no_timers: "Active Baker Mode & Chime Timers",
    feat_all_10_recipes: "All 10 Boutique Formulas Fully Unlocked",
    feat_active_timers: "Active Baker Mode + Oven Chimes & Timers",
    feat_unlimited_notebook: "Unlimited Dough Formula Notebook",
    feat_pro_badge: "Gold Master Baker Profile Badge",
    feat_wa_share: "Share Formulas & Weighing via WhatsApp",
    feat_direct_chat: "Direct Concierge Consulting Channel",
    feat_5_seats: "Up to 5 Baker Seats (Multi-User)",
    feat_team_sync: "Team Formula & Weighing Sheet Sync",
    feat_pro_included: "All Master Pro Features Included",
    feat_mixer_export: "Dedicated Production Mixer Printouts",
    feat_keshet_vip: "VIP Business Support from Keshet's Kennel",
    feat_tax_invoice: "Consolidated Digital Tax Invoices",
    plan_btn_current: "Current Plan",
    plan_btn_select_pro: "👑 Choose Master Pro",
    plan_btn_select_team: "👥 Choose Bakery Crew",
    checkout_desc: "Payments are processed securely under Keshet's Kennel supervision 🛡️",
    pay_method_card: "Credit Card",
    pay_method_bit: "Bit Payment App",
    pay_method_apple: "Apple / Google Pay",
    label_card_num: "Credit Card Number:",
    label_card_exp: "Expiration (MM/YY):",
    label_card_cvv: "CVV (3 digits):",
    label_card_holder: "Cardholder Full Name:",
    bit_title: "Secure Bit Payment",
    bit_desc: "Tap confirm to complete instant payment verification in your Bit mobile app.",
    apple_title: "One-Touch Fast Checkout",
    apple_desc: "Biometric authentication (Face ID / Touch ID) for instant activation.",
    btn_confirm_pay: "Confirm Payment & Activate Subscription",
    btn_cancel: "Cancel",

    // Support Chat Modal
    chat_modal_title: "Keshet's Kennel — Baker Concierge & Support",
    chat_modal_sub: "Direct VIP channel for subscriptions, invoices, and dough formulas",
    chat_status_online: "Keshet's Kennel concierge is online and assisting live",
    chip_team: "👥 How does the Team Crew plan work?",
    chip_hyd: "🥖 Hydration advice for strong flour",
    chip_invoice: "🧾 Tax invoice for bakery",
    chip_timer: "⏱️ Active baker timer question",
    chat_input_placeholder: "Type a message to Keshet's Kennel...",
    chat_btn_send: "Send"
  }
};

function initLanguage() {
  const savedLang = localStorage.getItem('bakery_house_lang') || 'he';
  state.lang = savedLang;
  applyLanguage(savedLang, false);
}

function toggleLanguage() {
  state.lang = state.lang === 'he' ? 'en' : 'he';
  localStorage.setItem('bakery_house_lang', state.lang);
  applyLanguage(state.lang, true);
}

function applyLanguage(lang, showNotification = true) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';

  const label = document.getElementById('langLabel');
  if (label) {
    label.textContent = lang === 'he' ? 'English' : 'עברית';
  }

  const dict = I18N[lang] || I18N.he;

  // Apply to all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // Apply placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // Apply titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (dict[key]) {
      el.title = dict[key];
    }
  });

  // Refresh dynamic UI elements
  updateFermInputVisibility();
  recalculate();
  renderRecipesGrid();
  updateUserUI();
  setSubBillingCycle(state.subBillingCycle || 'monthly');

  if (state.selectedRecipeForModal) {
    openRecipeModal(state.selectedRecipeForModal.id);
  }

  if (showNotification) {
    showToast(lang === 'en' ? "Language switched to English 🌐" : "השפה שונתה לעברית 🌐");
  }
}

// ==========================================================================
// 13. SUBSCRIPTION & PAYMENT MANAGEMENT (Keshet Kennel Supervision)
// ==========================================================================

function openSubscriptionModal() {
  setSubBillingCycle(state.subBillingCycle || 'monthly');
  hideCheckoutDrawer();
  openModal('subscriptionModal');
}

function setSubBillingCycle(cycle) {
  state.subBillingCycle = cycle;
  const isEn = state.lang === 'en';

  const btnMonthly = document.getElementById('cycleBtnMonthly');
  const btnAnnual = document.getElementById('cycleBtnAnnual');

  if (btnMonthly && btnAnnual) {
    if (cycle === 'monthly') {
      btnMonthly.classList.add('active');
      btnAnnual.classList.remove('active');
    } else {
      btnAnnual.classList.add('active');
      btnMonthly.classList.remove('active');
    }
  }

  const pricePro = document.getElementById('planPricePro');
  const periodPro = document.getElementById('planPeriodPro');
  const priceTeam = document.getElementById('planPriceTeam');
  const periodTeam = document.getElementById('planPeriodTeam');

  if (cycle === 'annual') {
    if (pricePro) pricePro.textContent = isEn ? '$110' : '₪390';
    if (periodPro) periodPro.textContent = isEn ? '/year' : '/שנה';
    if (priceTeam) priceTeam.textContent = isEn ? '$275' : '₪990';
    if (periodTeam) periodTeam.textContent = isEn ? '/year' : '/שנה';
  } else {
    if (pricePro) pricePro.textContent = isEn ? '$11' : '₪39';
    if (periodPro) periodPro.textContent = isEn ? '/month' : '/חודש';
    if (priceTeam) priceTeam.textContent = isEn ? '$28' : '₪99';
    if (periodTeam) periodTeam.textContent = isEn ? '/month' : '/חודש';
  }

  updateCheckoutDrawerSummary();
}

function showCheckoutDrawer(tier) {
  state.checkoutSelectedTier = tier;
  const drawer = document.getElementById('checkoutDrawer');
  if (drawer) {
    drawer.classList.remove('d-none');
    drawer.scrollIntoView({ behavior: 'smooth' });
  }
  updateCheckoutDrawerSummary();
}

function hideCheckoutDrawer() {
  const drawer = document.getElementById('checkoutDrawer');
  if (drawer) drawer.classList.add('d-none');
}

function setPaymentMethod(method, btn) {
  state.paymentMethod = method;
  document.querySelectorAll('.payment-tab-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const formCard = document.getElementById('paymentFormCard');
  const formBit = document.getElementById('paymentFormBit');
  const formApple = document.getElementById('paymentFormApplePay');

  if (formCard) formCard.classList.add('d-none');
  if (formBit) formBit.classList.add('d-none');
  if (formApple) formApple.classList.add('d-none');

  if (method === 'card' && formCard) formCard.classList.remove('d-none');
  if (method === 'bit' && formBit) formBit.classList.remove('d-none');
  if (method === 'applepay' && formApple) formApple.classList.remove('d-none');
}

function updateCheckoutDrawerSummary() {
  const titleEl = document.getElementById('checkoutPlanSummaryTitle');
  const submitText = document.getElementById('submitPaymentText');
  if (!titleEl) return;

  const isEn = state.lang === 'en';
  const isAnnual = state.subBillingCycle === 'annual';
  const tierName = state.checkoutSelectedTier === 'team'
    ? (isEn ? 'Bakery Crew (5 Seats)' : 'חבילת צוות (5 אופים)')
    : (isEn ? 'Master Baker Pro' : 'מאסטר אופה Pro');

  let priceStr = '';
  if (state.checkoutSelectedTier === 'team') {
    priceStr = isAnnual ? (isEn ? '$275/year' : '₪990/שנה') : (isEn ? '$28/month' : '₪99/חודש');
  } else {
    priceStr = isAnnual ? (isEn ? '$110/year' : '₪390/שנה') : (isEn ? '$11/month' : '₪39/חודש');
  }

  titleEl.textContent = isEn
    ? `Activate ${tierName} — ${priceStr}`
    : `הפעלת מנוי ${tierName} — ${priceStr}`;

  if (submitText) {
    submitText.textContent = isEn
      ? `Pay ${priceStr.split('/')[0]} & Start Now`
      : `שלם ${priceStr.split('/')[0]} והפעל מנוי`;
  }
}

function processCheckoutSubmission() {
  const tier = state.checkoutSelectedTier || 'pro';
  const cycle = state.subBillingCycle || 'monthly';
  const isEn = state.lang === 'en';

  if (state.paymentMethod === 'card') {
    const cardNum = (document.getElementById('checkoutCardNumber').value || '').trim();
    if (cardNum && cardNum.length < 12) {
      showToast(isEn ? "Please enter a valid card number" : "נא להזין מספר כרטיס תקין", "error");
      return;
    }
  }

  activateSubscription(tier, cycle);
  hideCheckoutDrawer();
  closeModal('subscriptionModal');
}

function activateSubscription(tier, cycle = 'monthly') {
  if (!state.user) initUser();
  if (!state.user.subscription) {
    state.user.subscription = {};
  }

  state.user.subscription.tier = tier;
  state.user.subscription.cycle = cycle;
  state.user.subscription.active = true;
  state.user.subscription.teamSeats = tier === 'team' ? 5 : 1;
  state.user.subscription.activatedAt = new Date().toISOString();

  if (tier === 'pro' || tier === 'team') {
    state.user.role = 'pro_baker';
  } else {
    state.user.role = state.user.email ? 'baker' : 'guest';
  }

  saveUser();
  updateUserUI();
  renderProfileArea();

  const isEn = state.lang === 'en';
  const successMsg = tier === 'team'
    ? (isEn ? "🎉 Bakery Crew Subscription Activated! 5 Baker seats ready." : "🎉 חבילת צוות הופעלה בהצלחה! 5 מושבי אופים מוכנים לעבודה.")
    : (tier === 'pro'
      ? (isEn ? "👑 Master Baker Pro Activated! All boutique formulas and timers unlocked." : "👑 מנוי Master Pro הופעל בהצלחה! כל המתכונים והטיימרים פתוחים.")
      : (isEn ? "🌾 Switched to Home Artisan Free tier." : "🌾 עברת לתוכנית אופה ביתי חינם."));

  showToast(successMsg);
  playBakeryChime();
}

// ==========================================================================
// 14. KESHET CONCIERGE LIVE SUPPORT CHAT
// ==========================================================================

const DEFAULT_CHAT_HISTORY = [
  {
    sender: 'bot',
    time: '12:00',
    text: 'שלום אופה יקר! 🌾 כאן נציג השירות והתמיכה של מלונת קשת לבית האפיות. נשמח לעזור בכל שאלה לגבי מנויים, חבילות צוות, חשבוניות או נוסחאות אפייה. כיצד נוכל לסייע היום?'
  }
];

function initChat() {
  try {
    const saved = localStorage.getItem('bakery_house_chat_history');
    if (saved) {
      state.chatHistory = JSON.parse(saved);
    } else {
      state.chatHistory = [...DEFAULT_CHAT_HISTORY];
      saveChatHistory();
    }
  } catch(e) {
    state.chatHistory = [...DEFAULT_CHAT_HISTORY];
  }
}

function saveChatHistory() {
  try {
    localStorage.setItem('bakery_house_chat_history', JSON.stringify(state.chatHistory));
  } catch(e){}
}

function openSupportChatModal() {
  initChat();
  renderChatMessages();
  openModal('supportChatModal');
  setTimeout(() => {
    const input = document.getElementById('chatInputMessage');
    if (input) input.focus();
  }, 200);
}

function renderChatMessages() {
  const container = document.getElementById('chatMessagesContainer');
  if (!container) return;

  container.innerHTML = state.chatHistory.map(msg => `
    <div class="chat-bubble ${msg.sender}">
      <div class="chat-bubble-text">${msg.text}</div>
      <span class="chat-bubble-time">${msg.time}</span>
    </div>
  `).join('');

  container.scrollTop = container.scrollHeight;
}

function sendUserChatMessage() {
  const input = document.getElementById('chatInputMessage');
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  state.chatHistory.push({
    sender: 'user',
    time: timeStr,
    text: text
  });

  input.value = '';
  saveChatHistory();
  renderChatMessages();

  setTimeout(() => {
    generateConciergeResponse(text);
  }, 700);
}

function sendQuickChatMessage(text) {
  const input = document.getElementById('chatInputMessage');
  if (input) {
    input.value = text;
    sendUserChatMessage();
  }
}

function handleChatKeyPress(event) {
  if (event.key === 'Enter') {
    sendUserChatMessage();
  }
}

function generateConciergeResponse(userQuery) {
  const q = userQuery.toLowerCase();
  let reply = '';
  const isEn = state.lang === 'en';

  if (q.includes('צוות') || q.includes('team') || q.includes('seat') || q.includes('מושב') || q.includes('אנשים')) {
    reply = isEn
      ? "👥 The Bakery Crew / Team tier is designed for bakery shops and shared kitchens! It includes up to 5 individual baker seats, shared production weighing sheets, and prioritized direct sync with Keshet's Kennel. You can activate it anytime via the Subscription Hub."
      : "👥 חבילת הצוות (Team Crew) מיועדת לקונדיטוריות, מאפיות וצוותי אופים! היא מעניקה 5 מושבי משתמש פעילים, סנכרון שקילות מלוש משותפות ותמיכת VIP ישירה ממלונת קשת. ניתן להפעיל אותה בלשונית המנויים באזור האישי.";
  } else if (q.includes('הידרציה') || q.includes('קמח') || q.includes('flour') || q.includes('hydration') || q.includes('מים')) {
    reply = isEn
      ? "🥖 For high-protein flour (12.5%-14% like Manitoba or T65 Label Rouge), we recommend starting at 74%-76% hydration with a 45-minute autolyse. For weaker flour (10%-11%), keep hydration between 65%-68% to maintain gluten structure!"
      : "🥖 לקמחים עתירי חלבון (12.5%-14% כמו מניטובה או T65 צרפתי), מומלץ להתחיל בהידרציה של 74%-76% עם אוטוליזה של 45 דקות. לקמחים מקומיים רגילים מומלץ לא לעבור 68% כדי לשמור על מבנה ויציבות בכיכר!";
  } else if (q.includes('חשבונית') || q.includes('invoice') || q.includes('קבלה') || q.includes('מס') || q.includes('עסק')) {
    reply = isEn
      ? "🧾 All subscription payments (monthly and annual) are automatically invoiced with Israeli Tax Authority compliance through Keshet's Kennel billing portal. A digital invoice is sent to your registered email immediately upon payment confirmation."
      : "🧾 כל התשלומים על המנויים (חודשי ושנתי) מופקים כחשבונית מס-קבלה ירוקה כחוק ע״י מערך החשבוניות של מלונת קשת. החשבונית נשלחת מיידית לכתובת האימייל שהזנתם בפרופיל.";
  } else if (q.includes('טיימר') || q.includes('שעון') || q.includes('timer') || q.includes('מצלצל') || q.includes('צליל')) {
    reply = isEn
      ? "⏱️ The Active Baker Mode timers use real-time Web Audio API chimes and mobile vibration! To ensure continuous sound playback on mobile, please keep the browser tab active, or tap the screen once to allow audio permissions."
      : "⏱️ טיימרי האפייה משתמשים במערכת צלילים סינתטית של Web Audio ורטט למובייל! כדי להבטיח השמעת צליל מושלמת בנייד, יש להשאיר את הטאב פתוח או לגעת במסך פעם אחת להפעלת הרשאות סאונד.";
  } else if (q.includes('מנוי') || q.includes('מחיר') || q.includes('subscription') || q.includes('price') || q.includes('עלות')) {
    reply = isEn
      ? "💎 We offer two upgrade plans: Master Baker Pro ($11/mo or $110/yr) for dedicated artisans, and Bakery Crew ($28/mo or $275/yr) for up to 5 bakers. Both plans include full access to boutique formulas and active timers."
      : "💎 אנו מציעים שתי תוכניות שדרוג: Master Baker Pro (39 ₪ לחודש או 390 ₪ לשנה), וחבילת צוות של עד 5 אופים (99 ₪ לחודש או 990 ₪ לשנה). שתיהן כוללות ביטול בכל עת וסנכרון מלא.";
  } else {
    reply = isEn
      ? "🌾 Thank you for your inquiry! Keshet's Kennel concierge has logged your message. If you need immediate assistance with dough formulas, check the Smart Presets on the calculator or reply here anytime."
      : "🌾 תודה על פנייתך! הודעתך תועדה במערכת השירות של מלונת קשת. לכל שאלה על מתכונים מומלץ לבדוק גם את כרטיס המלצות המאסטר במחשבון, ונציגנו זמין כאן עבורך תמיד.";
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  state.chatHistory.push({
    sender: 'bot',
    time: timeStr,
    text: reply
  });

  saveChatHistory();
  renderChatMessages();
  playBakeryChime();
}
