// ── UTILITIES ─────────────────────────────────────────────────────────────
// Depends on: data/holidays.js (HOL), js/core/lang.js (L)

function ds(d) {
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0');
}

function isH(s)   { return !!HOL[s]; }
function isSun(d) { return d.getDay() === 0; }
function isSat(d) { return d.getDay() === 6; }
function isWD(d)  { return !isSun(d) && !isSat(d) && !isH(ds(d)); }

function f2(n, d = 2) {
  return n.toLocaleString(
    L === 'pt' ? 'pt-BR' : 'en-US',
    { minimumFractionDigits: d, maximumFractionDigits: d }
  );
}

function fmtD(s) {
  if (!s) return L === 'pt' ? 'Selecione...' : 'Select...';
  const [y, m, day] = s.split('-');
  return L === 'pt' ? `${day}/${m}/${y}` : `${m}/${day}/${y}`;
}

// Parse currency — delegates to global parseCurrency from currency.js when available.
// Always use parseCurrency(el.value) before calculations.
function parseCurrency(str) {
  if (typeof globalThis !== 'undefined' && typeof globalThis.parseCurrency === 'function') {
    return globalThis.parseCurrency(str);
  }
  if (!str || typeof str !== 'string') return NaN;
  const isPT = (typeof L !== 'undefined' && L === 'pt');
  let s = str.replace(/\s/g, '').replace(/[^\d,.\-]/g, '');
  if (isPT) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? NaN : n;
}

// HTML entity escaping — prevents XSS when injecting user content into innerHTML
function escH(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
