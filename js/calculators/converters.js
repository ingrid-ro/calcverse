// ── CONVERTERS ────────────────────────────────────────────────────────────
// Depends on: utils.js (f2), lang.js (L)

// ── Currency ──────────────────────────────────────────────────────────────
const CURS = ['USD','EUR','BRL','GBP','JPY','CAD','AUD','CHF','CNY','MXN','INR','ARS','CLP','COP','PEN','KRW','SGD','TRY','ZAR','SEK'];
let rates = {};

async function loadRates() {
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const d = await r.json();
    rates = d.rates;
  } catch (e) {
    rates = { USD:1,EUR:.92,BRL:5.05,GBP:.79,JPY:149,CAD:1.36,AUD:1.53,CHF:.88,CNY:7.24,MXN:17.2,INR:83.1,ARS:870,CLP:960,COP:3900,PEN:3.72,KRW:1330,SGD:1.34,TRY:30.5,ZAR:18.8,SEK:10.4 };
  }
  document.getElementById('cc-load').style.display = 'none';
  document.getElementById('cc-res').style.display  = 'block';
  const sf = document.getElementById('cc-f'), st = document.getElementById('cc-t');
  sf.innerHTML = CURS.map(c => `<option value="${c}"${c === 'USD' ? ' selected' : ''}>${c}</option>`).join('');
  st.innerHTML = CURS.map(c => `<option value="${c}"${c === 'BRL' ? ' selected' : ''}>${c}</option>`).join('');
  calcCur();
}

function calcCur() {
  const amt = parseFloat(document.getElementById('cc-a')?.value) || 1;
  const fr  = document.getElementById('cc-f')?.value || 'USD';
  const to  = document.getElementById('cc-t')?.value || 'BRL';
  if (!rates[fr] || !rates[to]) return;
  const res = amt * (rates[to] / rates[fr]), rt = rates[to] / rates[fr];
  document.getElementById('cc-val').textContent  = `${to} ${f2(res)}`;
  document.getElementById('cc-sub').textContent  = `${f2(amt)} ${fr} = ${f2(res)} ${to}`;
  document.getElementById('cc-rate').textContent = `1 ${fr} = ${f2(rt, 4)} ${to}  ·  1 ${to} = ${f2(1 / rt, 4)} ${fr}`;
}

function swapCur() {
  const sf = document.getElementById('cc-f'), st = document.getElementById('cc-t'), tmp = sf.value;
  sf.value = st.value; st.value = tmp;
  calcCur();
}

// ── BMI ───────────────────────────────────────────────────────────────────
function calcBMI() {
  const w = parseFloat(document.getElementById('bmi-w').value);
  const h = parseFloat(document.getElementById('bmi-h').value) / 100;
  if (isNaN(w) || isNaN(h) || h === 0) return;
  const v = w / (h * h);
  let cat, rng, col;
  if      (v < 18.5) { cat = L === 'pt' ? 'Abaixo do peso'   : 'Underweight';     rng = '< 18.5';    col = 'var(--a2)'; }
  else if (v < 25)   { cat = L === 'pt' ? 'Peso normal ✓'    : 'Normal weight ✓'; rng = '18.5–24.9'; col = 'var(--a3)'; }
  else if (v < 30)   { cat = L === 'pt' ? 'Sobrepeso'        : 'Overweight';      rng = '25.0–29.9'; col = 'var(--a5)'; }
  else if (v < 35)   { cat = L === 'pt' ? 'Obesidade I'      : 'Obese Class I';   rng = '30.0–34.9'; col = 'var(--a1)'; }
  else if (v < 40)   { cat = L === 'pt' ? 'Obesidade II'     : 'Obese Class II';  rng = '35.0–39.9'; col = '#E84040';   }
  else               { cat = L === 'pt' ? 'Obesidade III'    : 'Obese Class III'; rng = '≥ 40.0';    col = '#9B1010';   }
  const bv = document.getElementById('bmi-v'); bv.textContent = f2(v); bv.style.color = col;
  const bc = document.getElementById('bmi-c'); bc.textContent = cat;   bc.style.color = col;
  document.getElementById('bmi-r').textContent = 'BMI ' + rng;
  document.getElementById('r-bmi').classList.add('show');
}

// ── Number Converter ──────────────────────────────────────────────────────
function ntab(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById('np' + i).style.display = i === n ? 'block' : 'none';
    document.getElementById('nt' + i).className = i === n ? 'tab on' : 'tab';
  });
}

function gcd(a, b) { return b ? gcd(b, a % b) : a; }

function f2d() {
  const n = parseFloat(document.getElementById('fn').value);
  const d = parseFloat(document.getElementById('fd').value);
  if (isNaN(n) || isNaN(d) || d === 0) return;
  const dec = n / d;
  document.getElementById('f2d-v').textContent = String(dec);
  document.getElementById('f2d-l').textContent = `${n}/${d} = ${dec} = ${f2(dec * 100, 4)}%`;
  document.getElementById('r-f2d').classList.add('show');
  document.getElementById('r-f2d').style.display = 'block';
}

function d2f() {
  const dv = parseFloat(document.getElementById('d2f-v').value);
  if (isNaN(dv)) return;
  const p = 1000000, ni = Math.round(dv * p), g = gcd(Math.abs(ni), p), num = ni / g, den = p / g;
  document.getElementById('d2f-r').textContent = `${num}/${den}`;
  document.getElementById('d2f-l').textContent = `${dv} ≈ ${num}/${den}`;
  document.getElementById('r-d2f').classList.add('show');
  document.getElementById('r-d2f').style.display = 'block';
}

function p2d() {
  const p = parseFloat(document.getElementById('pd-p').value);
  if (!isNaN(p)) document.getElementById('pd-rv').textContent = String(p / 100);
}

function d2p() {
  const d = parseFloat(document.getElementById('pd-d').value);
  if (!isNaN(d)) document.getElementById('pd-rp').textContent = f2(d * 100, 4) + '%';
}

// ── Unit Converter ────────────────────────────────────────────────────────
function utab(n) {
  [1, 2, 3, 4].forEach(i => {
    document.getElementById('ub' + i).style.display = i === n ? 'block' : 'none';
    document.getElementById('ut' + i).className = i === n ? 'tab on' : 'tab';
  });
}

const toM  = { m:1,km:1000,cm:.01,mm:.001,mi:1609.344,ft:.3048,in:.0254,yd:.9144 };
const toKg = { kg:1,g:.001,mg:.000001,lb:.453592,oz:.0283495,t:1000 };
const toL  = { l:1,ml:.001,m3:1000,gal:3.78541,fl:.0295735,cup:.236588 };
const LENS = ['m','km','cm','mm','mi','ft','in','yd'];
const WGTS = ['kg','g','mg','lb','oz','t'];
const VOLS = ['l','ml','m3','gal','fl','cup'];

function uRow(u, v) {
  return `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--bdr);font-size:13px">
    <span style="color:var(--ink2)">${u}</span>
    <strong>${typeof v === 'number' ? String(+v.toPrecision(6)) : v}</strong>
  </div>`;
}

function cu(type) {
  if (type === 'len') {
    const v = parseFloat(document.getElementById('ul-v').value), fv = document.getElementById('ul-f').value;
    if (isNaN(v)) return;
    const b = v * toM[fv];
    document.getElementById('len-o').innerHTML = LENS.filter(u => u !== fv).map(u => uRow(u, b / toM[u])).join('');
  }
  if (type === 'wt') {
    const v = parseFloat(document.getElementById('uw-v').value), fv = document.getElementById('uw-f').value;
    if (isNaN(v)) return;
    const b = v * toKg[fv];
    document.getElementById('wt-o').innerHTML = WGTS.filter(u => u !== fv).map(u => uRow(u, b / toKg[u])).join('');
  }
  if (type === 'tmp') {
    const v = parseFloat(document.getElementById('ut-v').value), fv = document.getElementById('ut-f').value;
    if (isNaN(v)) return;
    let c, fa, k;
    if      (fv === 'c') { c = v; fa = v * 9/5 + 32; k = v + 273.15; }
    else if (fv === 'f') { c = (v - 32) * 5/9; fa = v; k = c + 273.15; }
    else                 { k = v; c = v - 273.15; fa = c * 9/5 + 32; }
    const mp = { '°C': c, '°F': fa, 'K': k };
    document.getElementById('tmp-o').innerHTML = Object.entries(mp)
      .filter(([u]) => u !== ({ c:'°C', f:'°F', k:'K' }[fv]))
      .map(([u, val]) => uRow(u, f2(val, 2))).join('');
  }
  if (type === 'vol') {
    const v = parseFloat(document.getElementById('uv-v').value), fv = document.getElementById('uv-f').value;
    if (isNaN(v)) return;
    const b = v * toL[fv];
    document.getElementById('vol-o').innerHTML = VOLS.filter(u => u !== fv).map(u => uRow(u, b / toL[u])).join('');
  }
}
