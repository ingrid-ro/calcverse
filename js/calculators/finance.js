// ── FINANCE CALCULATORS ───────────────────────────────────────────────────
// Depends on: utils.js (f2), lang.js (L)

// ── Interest (Simple & Compound) ──────────────────────────────────────────
function itab(n) {
  document.getElementById('ip1').style.display = n === 1 ? 'block' : 'none';
  document.getElementById('ip2').style.display = n === 2 ? 'block' : 'none';
  document.getElementById('it1').className = n === 1 ? 'tab on' : 'tab';
  document.getElementById('it2').className = n === 2 ? 'tab on' : 'tab';
}

function iRow(m, im, acc, bal) {
  return `<tr><td>${m}</td><td>${f2(im)}</td><td>${f2(acc)}</td><td>${f2(bal)}</td></tr>`;
}

function calcJS() {
  const C = parseFloat(document.getElementById('js-c').value);
  const r = parseFloat(document.getElementById('js-r').value) / 100;
  const n = parseInt(document.getElementById('js-p').value);
  if (isNaN(C) || isNaN(r) || isNaN(n)) return;
  const jT = C * r * n, tot = C + jT;
  document.getElementById('js-tot').textContent = f2(tot);
  document.getElementById('js-int').textContent = f2(jT);
  document.getElementById('js-ret').textContent = f2(jT / C * 100) + '%';
  let rows = '', acc = 0;
  for (let m = 1; m <= Math.min(n, 24); m++) {
    const im = C * r; acc += im;
    rows += iRow(m, im, acc, C + acc);
  }
  if (n > 24) rows += `<tr><td colspan="4" style="text-align:center;font-size:11px;color:var(--ink2)">+${n - 24} more</td></tr>`;
  document.getElementById('js-tb').innerHTML = rows;
  document.getElementById('r-js').classList.add('show');
}

function calcJC() {
  const C = parseFloat(document.getElementById('jc-c').value);
  const r = parseFloat(document.getElementById('jc-r').value) / 100;
  const n = parseInt(document.getElementById('jc-p').value);
  if (isNaN(C) || isNaN(r) || isNaN(n)) return;
  const tot = C * Math.pow(1 + r, n), jT = tot - C;
  document.getElementById('jc-tot').textContent = f2(tot);
  document.getElementById('jc-int').textContent = f2(jT);
  document.getElementById('jc-ret').textContent = f2(jT / C * 100) + '%';
  let rows = '', s = C, acc = 0;
  for (let m = 1; m <= Math.min(n, 24); m++) {
    const im = s * r; s += im; acc += im;
    rows += iRow(m, im, acc, s);
  }
  if (n > 24) rows += `<tr><td colspan="4" style="text-align:center;font-size:11px;color:var(--ink2)">+${n - 24} more</td></tr>`;
  document.getElementById('jc-tb').innerHTML = rows;
  document.getElementById('r-jc').classList.add('show');
}

// ── Discount ──────────────────────────────────────────────────────────────
function calcDisc() {
  const p = parseFloat(document.getElementById('dc-p').value);
  const d = parseFloat(document.getElementById('dc-d').value);
  if (isNaN(p) || isNaN(d)) return;
  const sv = p * d / 100;
  document.getElementById('dc-f').textContent = f2(p - sv);
  document.getElementById('dc-s').textContent = f2(sv);
  document.getElementById('r-dc').classList.add('show');
}

// ── Installments ──────────────────────────────────────────────────────────
function calcInst() {
  const v = parseFloat(document.getElementById('in-v').value);
  const n = parseInt(document.getElementById('in-n').value);
  const r = parseFloat(document.getElementById('in-r').value) / 100 || 0;
  if (isNaN(v) || isNaN(n)) return;
  const inst = r === 0 ? v / n : v * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const tot = inst * n, jt = tot - v, add = ((tot / v) - 1) * 100;
  document.getElementById('in-inst').textContent = f2(inst);
  document.getElementById('in-tot').textContent  = f2(tot);
  document.getElementById('in-int').textContent  = f2(jt);
  document.getElementById('in-add').textContent  = add > 0 ? '+' + f2(add) + '%' : (L === 'pt' ? 'Sem juros' : 'No interest');
  document.getElementById('r-in').classList.add('show');
}

// ── Percentage ────────────────────────────────────────────────────────────
function ptab(n) {
  [1, 2, 3].forEach(i => {
    document.getElementById('pp' + i).style.display = i === n ? 'block' : 'none';
    document.getElementById('pt' + i).className = i === n ? 'tab on' : 'tab';
  });
}

function cp1() {
  const p = parseFloat(document.getElementById('p1p').value);
  const t2 = parseFloat(document.getElementById('p1t').value);
  if (isNaN(p) || isNaN(t2)) return;
  const r = (p / 100) * t2;
  document.getElementById('pr1').textContent = f2(r);
  document.getElementById('pr1').style.display = 'block';
  document.getElementById('ps1').textContent = `${p}% of ${f2(t2)} = ${f2(r)}`;
}

function cp2() {
  const x = parseFloat(document.getElementById('p2x').value);
  const y = parseFloat(document.getElementById('p2y').value);
  if (isNaN(x) || isNaN(y) || y === 0) return;
  const r = (x / y) * 100;
  document.getElementById('pr2').textContent = f2(r) + '%';
  document.getElementById('pr2').style.display = 'block';
  document.getElementById('ps2').textContent = `${f2(x)} is ${f2(r)}% of ${f2(y)}`;
}

function cp3() {
  const i = parseFloat(document.getElementById('p3i').value);
  const f = parseFloat(document.getElementById('p3f').value);
  if (isNaN(i) || isNaN(f) || i === 0) return;
  const r = ((f - i) / i) * 100, sg = r >= 0 ? '+' : '';
  document.getElementById('pr3').textContent = sg + f2(r) + '%';
  document.getElementById('pr3').style.color = r >= 0 ? 'var(--a3)' : '#E84040';
  document.getElementById('pr3').style.display = 'block';
  document.getElementById('ps3').textContent = `${f2(i)} → ${f2(f)}: ${sg}${f2(r)}%`;
}
