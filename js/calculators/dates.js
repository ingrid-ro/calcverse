// ── DATES & TIME CALCULATORS ──────────────────────────────────────────────
// Depends on: utils.js, lang.js, datepicker.js, data/holidays.js

// ── Embedded Holiday Calendar ─────────────────────────────────────────────
let ecY = 2026, ecM = 0;

function ecRender() {
  const ml = t('months'), dl = t('days');
  document.getElementById('ec-lbl').textContent = ml[ecM] + ' ' + ecY;
  document.getElementById('ec-htit').textContent = ml[ecM];
  const g = document.getElementById('ec-grid'), tod = ds(new Date());
  let gh = dl.map(d => `<div class="ecdh">${d}</div>`).join('');
  const first = new Date(ecY, ecM, 1).getDay();
  const last  = new Date(ecY, ecM + 1, 0).getDate();
  for (let i = 0; i < first; i++) gh += `<div class="ecd"></div>`;
  for (let d = 1; d <= last; d++) {
    const s = `${ecY}-${String(ecM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const obj = new Date(ecY, ecM, d);
    let c = 'ecd';
    if (s === tod)   c += ' et';
    else if (isH(s)) c += ' ef';
    else if (isSun(obj)) c += ' es';
    gh += `<div class="${c}" title="${HOL[s] || ''}">${d}</div>`;
  }
  g.innerHTML = gh;
  const mh = Object.entries(HOL).filter(([k]) => k.startsWith(`${ecY}-${String(ecM + 1).padStart(2, '0')}`));
  const list = document.getElementById('ec-hlist');
  if (!mh.length) {
    list.innerHTML = `<div style="font-size:12px;color:var(--ink2)">${L === 'pt' ? 'Nenhum feriado este mês.' : 'No holidays this month.'}</div>`;
    return;
  }
  list.innerHTML = mh.map(([k, v]) => {
    const dt = new Date(k + 'T00:00:00');
    return `<div class="hi">
      <span class="hdate">${dt.toLocaleDateString(L === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'short' })}</span>
      <span class="hname">${v}</span>
      <span class="htag2">National</span>
    </div>`;
  }).join('');
}

function ecNav(d) {
  ecM += d;
  if (ecM > 11) { ecM = 0; ecY++; }
  if (ecM < 0)  { ecM = 11; ecY--; }
  ecRender();
}

// ── Business Days ─────────────────────────────────────────────────────────
function calcBD() {
  const a = dpGet('bd1'), b = dpGet('bd2');
  if (!a || !b) { alert(L === 'pt' ? 'Selecione as duas datas.' : 'Select both dates.'); return; }
  const da = new Date(a + 'T00:00:00'), db = new Date(b + 'T00:00:00');
  if (db < da) { alert(L === 'pt' ? 'Data final deve ser posterior.' : 'End must be after start.'); return; }
  let u = 0, tot = 0, h = 0, we = 0, cur = new Date(da);
  while (cur <= db) {
    tot++;
    if (isSun(cur) || isSat(cur)) we++;
    else if (isH(ds(cur))) h++;
    else u++;
    cur.setDate(cur.getDate() + 1);
  }
  document.getElementById('bd-w').textContent = u;
  document.getElementById('bd-t').textContent = tot;
  document.getElementById('bd-h').textContent = h;
  document.getElementById('bd-k').textContent = we;
  document.getElementById('r-bd').classList.add('show');
}

// ── Date Difference ───────────────────────────────────────────────────────
function calcDiff() {
  const as = dpGet('df1'), bs = dpGet('df2');
  if (!as || !bs) { alert(L === 'pt' ? 'Selecione as duas datas.' : 'Select both dates.'); return; }
  let a = new Date(as + 'T00:00:00'), b = new Date(bs + 'T00:00:00');
  if (b < a) [a, b] = [b, a];
  const totD = Math.round((b - a) / 864e5), wks = Math.floor(totD / 7);
  let y = b.getFullYear() - a.getFullYear(), m = b.getMonth() - a.getMonth(), d = b.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(b.getFullYear(), b.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  document.getElementById('df-y').textContent = y;
  document.getElementById('df-m').textContent = m;
  document.getElementById('df-w').textContent = wks.toLocaleString();
  document.getElementById('df-d').textContent = totD.toLocaleString();
  document.getElementById('df-sum').textContent = L === 'pt'
    ? `${y} ano${y !== 1 ? 's' : ''}, ${m} ${m === 1 ? 'mês' : 'meses'} e ${d} dia${d !== 1 ? 's' : ''} — ${totD.toLocaleString('pt-BR')} dias — ${wks.toLocaleString('pt-BR')} semanas`
    : `${y} year${y !== 1 ? 's' : ''}, ${m} month${m !== 1 ? 's' : ''} and ${d} day${d !== 1 ? 's' : ''} — ${totD.toLocaleString()} total days — ${wks.toLocaleString()} weeks`;
  document.getElementById('r-diff').classList.add('show');
}

// ── Deadline Calculator ───────────────────────────────────────────────────
function calcDL() {
  const s = dpGet('dl'), days = parseInt(document.getElementById('dl-n').value);
  if (!s || !days) { alert(L === 'pt' ? 'Preencha todos os campos.' : 'Fill all fields.'); return; }
  let c = 0, cur = new Date(s + 'T00:00:00');
  while (c < days) { cur.setDate(cur.getDate() + 1); if (isWD(cur)) c++; }
  document.getElementById('dl-d').textContent = cur.toLocaleDateString(L === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: 'long', year: 'numeric' });
  document.getElementById('dl-dow').textContent = t('wdays')[cur.getDay()];
  document.getElementById('r-dl').classList.add('show');
}

// ── Age Calculator ────────────────────────────────────────────────────────
// Uses the same proven algorithm as calcDiff: direct year/month/day difference
// with proper borrow for month boundaries, day differences, and leap years.
function calcAge() {
  const s = dpGet('age');
  if (!s) { alert(L === 'pt' ? 'Selecione a data de nascimento.' : 'Select date of birth.'); return; }
  const a = new Date(s + 'T00:00:00');
  const b = new Date(); b.setHours(0, 0, 0, 0);
  if (a > b) { alert(L === 'pt' ? 'Data no futuro.' : 'Future date.'); return; }

  // Years, months, days: use effective birth day for boundaries (Feb 29→28 in non-leap, end-of-month)
  let y = b.getFullYear() - a.getFullYear();
  let m = b.getMonth() - a.getMonth();
  const lastDayPrev = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  const effectiveBirthDay = Math.min(a.getDate(), lastDayPrev);
  let d = b.getDate() - effectiveBirthDay;
  if (d < 0) { m--; d += lastDayPrev; }
  if (m < 0) { y--; m += 12; }

  document.getElementById('age-y').textContent = y + (L === 'pt' ? ' anos' : ' years');
  document.getElementById('age-det').textContent = L === 'pt'
    ? `${m} ${m === 1 ? 'mês' : 'meses'} e ${d} ${d === 1 ? 'dia' : 'dias'}`
    : `${m} month${m !== 1 ? 's' : ''} and ${d} day${d !== 1 ? 's' : ''}`;

  // Days until next birthday: next occurrence of (birthMonth, birthDay), clamp Feb 29 in non-leap years
  let nbY = b.getFullYear();
  let nbD = Math.min(a.getDate(), new Date(nbY, a.getMonth() + 1, 0).getDate());
  let prx = new Date(nbY, a.getMonth(), nbD);
  if (prx < b) {
    nbY = b.getFullYear() + 1;
    nbD = Math.min(a.getDate(), new Date(nbY, a.getMonth() + 1, 0).getDate());
    prx = new Date(nbY, a.getMonth(), nbD);
  }
  const df = Math.round((prx - b) / 864e5);
  document.getElementById('age-bd').textContent = df === 0
    ? (L === 'pt' ? '🎉 Feliz aniversário para você! Aproveite seu dia!' : '🎉 Happy Birthday to you! Enjoy your special day!')
    : (L === 'pt' ? `🎂 Faltam ${df} dias para o próximo aniversário` : `🎂 ${df} days until next birthday`);
  document.getElementById('r-age').classList.add('show');
}
