// ── DATEPICKER ────────────────────────────────────────────────────────────
// Depends on: utils.js (ds, isH, isSun, fmtD), lang.js (L, t, TR), data/holidays.js (HOL)
//
// HTML structure expected per field (no emoji icon needed):
//   <div class="dpw">
//     <input type="text" class="dpin" id="dp-{id}" placeholder="MM/DD/YYYY"
//            readonly onclick="dpOpen('{id}')">
//     <span class="dparr" onclick="dpOpen('{id}')">▾</span>
//   </div>
//
// Must be loaded AFTER #dp-pop exists in the DOM (place scripts at </body>).

const DP = {};
const dpBuf = {};           // raw digit buffer per id while user is typing
const dpListeners = new Set(); // tracks which ids already have listeners bound
let dpA = null;             // currently active picker id

// Lazy accessor — safe even if #dp-pop is resolved after script parse
function _pop() { return document.getElementById("dp-pop"); }

// ── Init ──────────────────────────────────────────────────────────────────
function dpInit(id, def) {
  const d = def ? new Date(def + "T00:00:00") : new Date();
  DP[id] = { y: d.getFullYear(), m: d.getMonth(), sel: def || null };

  if (!dpListeners.has(id)) {
    dpListeners.add(id);
    const el = document.getElementById("dp-" + id);
    if (el) {
      el.addEventListener("keydown", (e) => dpHandleKey(e, id));
      el.addEventListener("focus", () => {
        dpBuf[id] = "";
        el.classList.remove("dpd-typing", "dpd-invalid");
      });
      el.addEventListener("blur", () => {
        dpBuf[id] = "";
        el.value = DP[id].sel ? fmtD(DP[id].sel) : "";
        el.classList.remove("dpd-typing", "dpd-invalid");
      });
    }
  }

  // Always sync displayed value — dpInit may be called a second time with a
  // real default after listeners are already registered (see main.js pattern).
  const el = document.getElementById("dp-" + id);
  if (el) {
    el.value = def ? fmtD(def) : "";
    if (id === "age") el.placeholder = L === "pt" ? "DD/MM/AAAA" : "DD/MM/YYYY";
  }
}

// ── Open / close ──────────────────────────────────────────────────────────
function dpOpen(id) {
  const el = document.getElementById("dp-" + id);
  if (!el) return;

  // Toggle: clicking an already-open picker closes it
  if (dpA === id) {
    dpClose();
    return;
  }

  dpClose(); // close any other open picker

  dpA = id;
  dpBuf[id] = "";
  el.classList.remove("dpd-typing", "dpd-invalid");
  el.classList.add("dpo");
  el.value = DP[id].sel ? fmtD(DP[id].sel) : "";

  el.focus();

  // Position popup below the input
  const r = el.getBoundingClientRect();
  let l = r.left, tp = r.bottom + 6, w = 278;
  if (l + w > window.innerWidth - 8) l = window.innerWidth - w - 8;
  if (l < 8) l = 8;

  const pop = _pop();
  pop.style.cssText = `left:${l}px;top:${tp}px;width:${w}px;`;
  dpRender();
  pop.classList.add("show");
}

function dpClose() {
  if (dpA) {
    document.getElementById("dp-" + dpA)?.classList.remove("dpo");
    dpA = null;
  }
  _pop()?.classList.remove("show");
}

// ── Render calendar ───────────────────────────────────────────────────────
function dpRender() {
  if (!dpA || !DP[dpA]) return;
  const s = DP[dpA];
  const tod = ds(new Date());
  const ml = t("months");
  const dl = t("days");
  const first = new Date(s.y, s.m, 1).getDay();
  const last  = new Date(s.y, s.m + 1, 0).getDate();

  let h = `<div class="dpnav">
    <button class="dpnb" onclick="dpMo(-1);event.stopPropagation()">‹</button>
    <span class="dpml">${ml[s.m]} ${s.y}</span>
    <button class="dpnb" onclick="dpMo(1);event.stopPropagation()">›</button>
  </div>
  <div class="dpg">${dl.map((d) => `<div class="dpdh">${d}</div>`).join("")}`;

  for (let i = 0; i < first; i++) h += `<button class="dpd dpe"></button>`;
  for (let d = 1; d <= last; d++) {
    const str = `${s.y}-${String(s.m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const obj = new Date(s.y, s.m, d);
    let c = "dpd";
    if (str === s.sel)    c += " dpsel";
    else if (str === tod) c += " dpt";
    if (isH(str))         c += " dpfh";
    else if (isSun(obj))  c += " dpsun";
    h += `<button class="${c}" title="${HOL[str] || ""}" onclick="dpSel('${str}')">${d}</button>`;
  }

  h += `</div>
  <div class="dpft">
    <button class="dptbtn" onclick="dpSel('${tod}')">${L === "pt" ? "Hoje" : "Today"}</button>
    <button class="dpcbtn" onclick="dpClr()">${L === "pt" ? "Limpar" : "Clear"}</button>
  </div>`;

  _pop().innerHTML = h;
}

function dpMo(d) {
  if (!dpA) return;
  DP[dpA].m += d;
  if (DP[dpA].m > 11) { DP[dpA].m = 0;  DP[dpA].y++; }
  if (DP[dpA].m < 0)  { DP[dpA].m = 11; DP[dpA].y--; }
  dpRender();
}

// ── Select / clear ────────────────────────────────────────────────────────
function dpSel(s) {
  if (!dpA) return;
  DP[dpA].sel = s;
  DP[dpA].y   = parseInt(s.slice(0, 4));
  DP[dpA].m   = parseInt(s.slice(5, 7)) - 1;
  dpBuf[dpA]  = "";
  const el = document.getElementById("dp-" + dpA);
  if (el) {
    el.value = fmtD(s);
    el.classList.remove("dpd-typing", "dpd-invalid");
  }
  setTimeout(dpClose, 120);
}

function dpClr() {
  if (!dpA) return;
  DP[dpA].sel = null;
  dpBuf[dpA]  = "";
  const el = document.getElementById("dp-" + dpA);
  if (el) {
    el.value = "";
    el.classList.remove("dpd-typing", "dpd-invalid");
  }
  dpRender();
}

function dpGet(id)  { return DP[id]?.sel || null; }

function dpRefreshAll() {
  Object.keys(DP).forEach((id) => {
    dpBuf[id] = "";
    const el = document.getElementById("dp-" + id);
    if (el) {
      el.value = DP[id].sel ? fmtD(DP[id].sel) : "";
      el.classList.remove("dpd-typing", "dpd-invalid");
    }
  });
}

// ── Keyboard / mask typing ────────────────────────────────────────────────
function dpHandleKey(e, id) {
  if (e.key === "Tab") return; // let Tab/Shift+Tab navigate normally

  if (e.key === " " || e.key === "Enter") {
    e.preventDefault();
    dpOpen(id);
    return;
  }

  if (e.key === "Escape") {
    e.preventDefault();
    dpBuf[id] = "";
    const el = document.getElementById("dp-" + id);
    if (el) {
      el.value = DP[id].sel ? fmtD(DP[id].sel) : "";
      el.classList.remove("dpd-typing", "dpd-invalid");
    }
    dpClose();
    return;
  }

  if (e.key === "Backspace") {
    e.preventDefault();
    if (!dpBuf[id]) {
      // no typing in progress — clear the committed selection
      DP[id].sel = null;
      const el = document.getElementById("dp-" + id);
      if (el) {
        el.value = "";
        el.classList.remove("dpd-typing", "dpd-invalid");
      }
      return;
    }
    dpBuf[id] = dpBuf[id].slice(0, -1);
    dpUpdateTyping(id);
    return;
  }

  if (!/^\d$/.test(e.key)) return; // ignore non-digit keys
  e.preventDefault();

  if (dpA === id) dpClose(); // close calendar so user can see the mask

  dpBuf[id] = dpBuf[id] || "";
  if (dpBuf[id].length >= 8) return; // buffer full

  dpBuf[id] += e.key;
  dpUpdateTyping(id);
}

function dpUpdateTyping(id) {
  const digits = dpBuf[id] || "";
  const el = document.getElementById("dp-" + id);
  if (!el) return;

  if (!digits.length) {
    el.value = DP[id].sel ? fmtD(DP[id].sel) : "";
    el.classList.remove("dpd-typing", "dpd-invalid");
    return;
  }

  // Build the masked display: DD/MM/YYYY (PT) or MM/DD/YYYY (EN)
  // Slashes always appear after positions 2 and 4 in the digit stream.
  let display = "";
  for (let i = 0; i < digits.length; i++) {
    if (i === 2 || i === 4) display += "/";
    display += digits[i];
  }
  // Pad remaining positions with underscores
  let pos = digits.length;
  for (let i = pos; i < 8; i++) {
    if (i === 2 || i === 4) display += "/";
    display += "_";
  }

  el.classList.add("dpd-typing");
  el.classList.remove("dpd-invalid");
  el.value = display; // write mask first so user sees it even on validation

  // Auto-commit when all 8 digits have been entered
  if (digits.length === 8) {
    const dateStr = dpParseTyped(digits, id);
    if (dateStr) {
      DP[id].sel = dateStr;
      DP[id].y   = parseInt(dateStr.slice(0, 4));
      DP[id].m   = parseInt(dateStr.slice(5, 7)) - 1;
      dpBuf[id]  = "";
      el.value   = fmtD(dateStr);
      el.classList.remove("dpd-typing", "dpd-invalid");
      dpClose();
    } else {
      // Invalid date — show red border; user must Backspace to fix
      el.classList.add("dpd-invalid");
      el.classList.remove("dpd-typing");
    }
  }
}

function dpParseTyped(digits, id) {
  // digits: exactly 8 chars, no slashes
  const p1 = parseInt(digits.slice(0, 2), 10);
  const p2 = parseInt(digits.slice(2, 4), 10);
  const yr  = parseInt(digits.slice(4, 8), 10);
  // Age Calculator (date of birth) always uses DD/MM/YYYY; others follow locale
  const useDDMM = id === "age" || L === "pt";
  const day   = useDDMM ? p1 : p2;
  const month = useDDMM ? p2 : p1;
  if (month < 1 || month > 12 || day < 1 || yr < 1000) return null;
  const str = `${yr}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const obj = new Date(str + "T00:00:00");
  if (isNaN(obj) || obj.getFullYear() !== yr || obj.getMonth() !== month - 1 || obj.getDate() !== day)
    return null;
  return str;
}

// ── Global close triggers ─────────────────────────────────────────────────
document.addEventListener("click", (e) => {
  if (!e.target.closest(".dpw") && !e.target.closest("#dp-pop")) dpClose();
});
document.addEventListener("scroll", () => { if (dpA) dpClose(); }, { passive: true });
