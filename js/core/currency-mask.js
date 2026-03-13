/**
 * ── CURRENCY MASK (legacy/module entry) ─────────────────────────────────────
 * Re-exports from js/core/currency.js for module builds.
 * The canonical implementation lives in currency.js.
 *
 * Use parseCurrency(el.value) before any calculation.
 * Format only on blur or after user pauses (debounced).
 */

const CURRENCY_IDS = [
  "js-c", "jc-c", "dc-p", "in-v", "cc-a", "das-rb", "das-rm", "pl-s",
  "v-s", "t-s", "ot-s", "is-s", "rs-s", "rs-f", "ir-s",
  "liq-s", "liq-out", "liq-vt", "liq-vr", "liq-ps", "liq-pd", "liq-prev", "liq-cons",
  "p1t", "p2x", "p2y", "p3i", "p3f",
];

// When used as module, delegate to global currency system if loaded
function formatCurrency(num) {
  if (typeof globalThis !== "undefined" && typeof globalThis.formatCurrency === "function") {
    return globalThis.formatCurrency(num);
  }
  if (num === "" || num === null || isNaN(num)) return "";
  const n = parseFloat(num);
  if (isNaN(n)) return "";
  const isPT = (typeof L !== "undefined" && L === "pt");
  return new Intl.NumberFormat(isPT ? "pt-BR" : "en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function parseCurrency(str) {
  if (typeof globalThis !== "undefined" && typeof globalThis.parseCurrency === "function") {
    return globalThis.parseCurrency(str);
  }
  if (!str || typeof str !== "string") return NaN;
  const isPT = (typeof L !== "undefined" && L === "pt");
  let s = str.replace(/\s/g, "").replace(/[^\d,.\-]/g, "");
  if (isPT) s = s.replace(/\./g, "").replace(",", ".");
  else s = s.replace(/,/g, "");
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

function initCurrencyMasks() {
  if (typeof globalThis !== "undefined" && typeof globalThis.initCurrencyMasks === "function") {
    return globalThis.initCurrencyMasks();
  }
  CURRENCY_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && !el.dataset.currencyMask) {
      el.dataset.currencyMask = "1";
      el.setAttribute("inputmode", "decimal");
      el.addEventListener("blur", (e) => {
        const v = parseCurrency(e.target.value);
        e.target.value = isNaN(v) || v === 0 ? "" : formatCurrency(v);
      });
    }
  });
}

function refreshCurrencyMasks() {
  if (typeof globalThis !== "undefined" && typeof globalThis.refreshCurrencyMasks === "function") {
    return globalThis.refreshCurrencyMasks();
  }
  CURRENCY_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.dataset.currencyMask) {
      const v = parseCurrency(el.value);
      el.value = isNaN(v) || v === 0 ? "" : formatCurrency(v);
    }
  });
}
