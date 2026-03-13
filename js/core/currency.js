/**
 * ── CURRENCY SYSTEM ─────────────────────────────────────────────────────────
 * Centralized architecture for financial inputs across the project.
 *
 * Responsibilities:
 * 1. formatCurrency  — Display formatting only (number → formatted string)
 * 2. parseCurrency   — Convert formatted text → pure number for calculations
 * 3. sanitizeCurrencyInput — Clean user input without breaking cursor or valid chars
 *
 * Input behavior:
 * - Format only on blur or after user pauses typing (debounced)
 * - Never format on every keystroke (prevents cursor jump, deletion blocking)
 * - Always use parseCurrency(el.value) before any calculation
 */

(function (global) {
  "use strict";

  const CURRENCY_IDS = [
    "js-c", "jc-c", "dc-p", "in-v", "cc-a", "das-rb", "das-rm", "pl-s",
    "v-s", "t-s", "ot-s", "is-s", "rs-s", "rs-f", "ir-s",
    "liq-s", "liq-out", "liq-vt", "liq-vr", "liq-ps", "liq-pd", "liq-prev", "liq-cons",
    "p1t", "p2x", "p2y", "p3i", "p3f",
  ];

  /**
   * Get locale from global L (language). Defaults to en-US if L not set.
   */
  function getLocale() {
    return (typeof global.L !== "undefined" && global.L === "pt") ? "pt-BR" : "en-US";
  }

  /**
   * formatCurrency(value, locale?)
   * Responsible ONLY for display formatting.
   * Converts a numeric value to a locale-formatted string.
   *
   * PT (pt-BR): 1500.75 → "1.500,75" (dot=thousand, comma=decimal)
   * EN (en-US): 1500.75 → "1,500.75" (comma=thousand, dot=decimal)
   *
   * @param {number|string} value - Numeric value to format
   * @param {string} [locale] - Optional locale override (uses L if not provided)
   * @returns {string} Formatted string (number part only; prefix is separate in UI)
   */
  function formatCurrency(value, locale) {
    if (value === "" || value === null || value === undefined) return "";
    const n = parseFloat(value);
    if (isNaN(n)) return "";
    const loc = locale || getLocale();
    return new Intl.NumberFormat(loc, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  /**
   * parseCurrency(value, locale?)
   * Responsible for converting formatted text into a pure number.
   * Use this ALWAYS before calculations — never use formatted strings in math.
   *
   * PT: "1.500,75" → 1500.75
   * EN: "1,500.75" → 1500.75
   *
   * @param {string} value - Formatted or raw input string
   * @param {string} [locale] - Optional locale override
   * @returns {number} Pure numeric value, or NaN if invalid
   */
  function parseCurrency(value, locale) {
    if (!value || typeof value !== "string") return NaN;
    const isPT = (locale || getLocale()) === "pt-BR";
    let s = value.replace(/\s/g, "").replace(/[^\d,.\-]/g, "");
    if (isPT) {
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      s = s.replace(/,/g, "");
    }
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  /**
   * sanitizeCurrencyInput(value, locale?)
   * Cleans user input during typing without breaking cursor or removing valid chars.
   * Removes only invalid characters (letters, symbols except digits, comma, dot, minus).
   * Does NOT add formatting — use formatCurrency for that.
   *
   * @param {string} value - Raw user input
   * @param {string} [locale] - Optional locale override
   * @returns {string} Cleaned string (digits, comma, dot, minus only)
   */
  function sanitizeCurrencyInput(value, locale) {
    if (!value || typeof value !== "string") return "";
    return value.replace(/\s/g, "").replace(/[^\d,.\-]/g, "");
  }

  /**
   * Get currency prefix for display (R$ or $) based on selected language.
   * PT → "R$ " (BRL) | EN → "$ " (USD)
   */
  function getCurrencyPrefix() {
    return getLocale() === "pt-BR" ? "R$ " : "$ ";
  }

  /**
   * formatCurrencyWithSymbol(value)
   * Returns full formatted string with symbol: "R$ 1.500,75" or "$1,500.75"
   * Use for calculated results, summaries, and any monetary display.
   */
  function formatCurrencyWithSymbol(value) {
    const n = parseFloat(value);
    if (isNaN(n)) return getCurrencyPrefix() + formatCurrency(0);
    return getCurrencyPrefix() + formatCurrency(n);
  }

  // ── Input handling (debounced, format on pause or blur only) ───────────────
  const debounceTimers = {};
  const DEBOUNCE_MS = 500;

  function applyFormat(el) {
    const v = parseCurrency(el.value);
    el.value = (isNaN(v) || v === 0) ? "" : formatCurrency(v);
    const id = el.id;
    if (id && debounceTimers[id]) {
      debounceTimers[id] = null;
    }
  }

  function onCurrencyInput(e) {
    const el = e.target;
    const id = el.id || "c" + Math.random();
    if (debounceTimers[id]) clearTimeout(debounceTimers[id]);
    debounceTimers[id] = setTimeout(() => {
      debounceTimers[id] = null;
      applyFormat(el);
    }, DEBOUNCE_MS);
  }

  function onCurrencyBlur(e) {
    const el = e.target;
    const id = el.id;
    if (id && debounceTimers[id]) {
      clearTimeout(debounceTimers[id]);
      debounceTimers[id] = null;
    }
    applyFormat(el);
  }

  function wrapCurrencyInput(el) {
    if (el.closest(".currency-input-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "currency-input-wrap";
    const prefix = document.createElement("span");
    prefix.className = "currency-prefix";
    prefix.textContent = getCurrencyPrefix();
    el.parentNode.insertBefore(wrap, el);
    wrap.appendChild(prefix);
    wrap.appendChild(el);
  }

  function initCurrencyMasks() {
    CURRENCY_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el.dataset.currencyMask) {
        wrapCurrencyInput(el);
        el.dataset.currencyMask = "1";
        el.setAttribute("inputmode", "decimal");
        el.addEventListener("input", onCurrencyInput);
        el.addEventListener("blur", onCurrencyBlur);
      }
    });
  }

  function refreshCurrencyMasks() {
    CURRENCY_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el && el.dataset.currencyMask) {
        const wrap = el.closest(".currency-input-wrap");
        if (wrap) {
          const prefix = wrap.querySelector(".currency-prefix");
          if (prefix) prefix.textContent = getCurrencyPrefix();
        }
        const v = parseCurrency(el.value);
        el.value = (isNaN(v) || v === 0) ? "" : formatCurrency(v);
      }
    });
  }

  // Export to global
  global.CURRENCY_IDS = CURRENCY_IDS;
  global.formatCurrency = formatCurrency;
  global.formatCurrencyWithSymbol = formatCurrencyWithSymbol;
  global.parseCurrency = parseCurrency;
  global.sanitizeCurrencyInput = sanitizeCurrencyInput;
  global.getCurrencyPrefix = getCurrencyPrefix;
  global.initCurrencyMasks = initCurrencyMasks;
  global.refreshCurrencyMasks = refreshCurrencyMasks;

})(typeof window !== "undefined" ? window : this);
