// ── TAX CALCULATORS (INSS, IRRF, DAS, Simples, Pró-labore) ───────────────
// Atualizar anualmente: INF, IRRF_TAB, IRRF_DEP, SM2025, SN
// Depends on: utils.js (f2), lang.js (L)

// ── INSS 2025 — tabela progressiva ───────────────────────────────────────
const INF = [
  { a: 1518.00,  r: 0.075 },
  { a: 2793.88,  r: 0.09  },
  { a: 4190.83,  r: 0.12  },
  { a: 8157.41,  r: 0.14  },
];

function inssCalc(s) {
  let d = 0, p = 0;
  for (const f of INF) {
    if (s > p) { const b = Math.min(s, f.a) - p; d += b * f.r; p = f.a; }
    if (s <= f.a) break;
  }
  return d;
}

function calcINSS() {
  const s = parseFloat(document.getElementById('is-s').value);
  if (isNaN(s)) return;
  const d = inssCalc(s), n = s - d, a = d / s * 100, fg = s * 0.08;
  document.getElementById('is-d').textContent = f2(d);
  document.getElementById('is-a').textContent = f2(a) + '%';
  document.getElementById('is-n').textContent = f2(n);
  document.getElementById('is-f').textContent = f2(fg);
  let rows = '', p = 0;
  for (const f of INF) {
    if (s > p) {
      const b = Math.min(s, f.a) - p, d2 = b * f.r;
      rows += `<tr><td>≤ ${f2(f.a)}</td><td>${(f.r * 100).toFixed(1)}%</td><td>${f2(d2)}</td></tr>`;
      p = f.a;
    }
    if (s <= f.a) break;
  }
  document.getElementById('is-tb').innerHTML = rows;
  document.getElementById('r-inss').classList.add('show');
}

// ── DAS MEI ───────────────────────────────────────────────────────────────
let SM2025 = 1518; // updated by fetchSM() on load

function dasTab(n) {
  [1, 2].forEach(i => {
    document.getElementById('das-t' + i).classList.toggle('on', i === n);
    document.getElementById('das-p' + i).style.display = i === n ? 'block' : 'none';
  });
}

function calcDAS() {
  const act = document.getElementById('das-act').value;
  const emp = parseInt(document.getElementById('das-emp').value);
  const INSS_MEI = SM2025 * 0.05;
  let iss = 0, icms = 0, lblTax = '';
  if      (act === 'com')  { icms = 1; lblTax = 'ICMS (R$ 1,00)'; }
  else if (act === 'svc')  { iss  = 5; lblTax = 'ISS (R$ 5,00)';  }
  else                     { icms = 1; iss = 5; lblTax = 'ICMS+ISS (R$ 6,00)'; }
  const taxFix = icms + iss, empV = emp ? SM2025 * 0.08 : 0, tot = INSS_MEI + taxFix + empV;
  document.getElementById('das-inss').textContent    = 'R$ ' + f2(INSS_MEI);
  document.getElementById('das-iss').textContent     = 'R$ ' + taxFix.toFixed(2);
  document.getElementById('das-iss-lbl').textContent = lblTax;
  document.getElementById('das-emp-v').textContent   = emp ? 'R$ ' + f2(empV) : '—';
  document.getElementById('das-tot').textContent     = 'R$ ' + f2(tot);
  document.getElementById('r-das').classList.add('show');
}

// ── Simples Nacional 2025 — [receita_max, aliq_nominal, deducao] ──────────
const SN = {
  1: [[180000,.04,0],[360000,.073,5940],[720000,.095,13860],[1800000,.107,22500],[3600000,.143,87300],[4800000,.19,378000]],
  2: [[180000,.045,0],[360000,.078,5940],[720000,.1,13860],[1800000,.112,22500],[3600000,.147,85500],[4800000,.195,378000]],
  3: [[180000,.06,0],[360000,.112,9360],[720000,.135,17640],[1800000,.16,35640],[3600000,.21,125640],[4800000,.33,648000]],
  4: [[180000,.045,0],[360000,.09,8100],[720000,.102,12420],[1800000,.14,39780],[3600000,.22,183780],[4800000,.33,828000]],
  5: [[180000,.155,0],[360000,.18,4500],[720000,.195,9900],[1800000,.205,17100],[3600000,.23,62100],[4800000,.305,540000]],
};

function calcSimples() {
  const rb  = parseFloat(document.getElementById('das-rb').value) || 0;
  const rm  = parseFloat(document.getElementById('das-rm').value) || 0;
  const anx = parseInt(document.getElementById('das-anx').value);
  if (!rb || !rm) { alert(L === 'pt' ? 'Preencha receita bruta e do mês.' : 'Fill in revenue fields.'); return; }
  const tab = SN[anx];
  let aliq = 0, ded = 0;
  for (const [lim, a, d] of tab) { if (rb <= lim) { aliq = a; ded = d; break; } }
  if (!aliq) { aliq = tab[tab.length - 1][1]; ded = tab[tab.length - 1][2]; }
  const ef = (aliq * rb - ded) / rb, das = rm * ef;
  document.getElementById('sn-al').textContent  = (aliq * 100).toFixed(2) + '%';
  document.getElementById('sn-ef').textContent  = (ef * 100).toFixed(2) + '%';
  document.getElementById('sn-das').textContent = 'R$ ' + f2(das);
  document.getElementById('sn-liq').textContent = 'R$ ' + f2(rm - das);
  document.getElementById('r-simples').classList.add('show');
}

// ── Pró-labore ────────────────────────────────────────────────────────────
function calcProl() {
  const s = parseFloat(document.getElementById('pl-s').value) || 0;
  const sm = SM2025, minLegal = sm * 0.28;
  document.getElementById('pl-min').textContent = 'R$ ' + f2(minLegal);
  if (!s) {
    document.getElementById('pl-inss').textContent = '—';
    document.getElementById('pl-net').textContent  = '—';
    document.getElementById('pl-pct').textContent  = '—';
    document.getElementById('pl-warn').style.display = 'none';
    return;
  }
  const inss = s * 0.11, net = s - inss, pct = s / sm * 100;
  document.getElementById('pl-inss').textContent = 'R$ ' + f2(inss);
  document.getElementById('pl-net').textContent  = 'R$ ' + f2(net);
  document.getElementById('pl-pct').textContent  = pct.toFixed(1) + '%';
  const w = document.getElementById('pl-warn');
  if (s < minLegal) {
    w.style.display = 'block';
    w.style.cssText += 'background:color-mix(in srgb,#E84040 10%,white);border:1px solid #E84040;color:#c0392b;border-radius:8px;padding:10px 14px;font-size:12px;margin-top:8px;';
    w.textContent = L === 'pt'
      ? `⚠️ Valor abaixo do mínimo legal (R$ ${f2(minLegal)} = 28% do SM). Risco de autuação pela Receita Federal.`
      : `⚠️ Below legal minimum (R$ ${f2(minLegal)} = 28% of minimum wage). Risk of tax authority penalty.`;
  } else {
    w.style.display = 'block';
    w.style.cssText += 'background:color-mix(in srgb,var(--a3) 10%,white);border:1px solid var(--a3);color:#1a7a4e;border-radius:8px;padding:10px 14px;font-size:12px;margin-top:8px;';
    w.textContent = L === 'pt' ? '✓ Pró-labore dentro do mínimo legal.' : '✓ Pro-labore meets legal minimum.';
  }
}

// ── IRRF 2025 ─────────────────────────────────────────────────────────────
// [base_max, aliquota, deducao]
const IRRF_TAB = [
  [2259.20,    0,     0     ],
  [2826.65,    0.075, 169.44],
  [3751.05,    0.15,  381.44],
  [4664.68,    0.225, 662.77],
  [Infinity,   0.275, 896.00],
];
const IRRF_DEP = 189.59; // dedução por dependente 2025

function calcIRRF() {
  const s   = parseFloat(document.getElementById('ir-s').value);
  const dep = parseInt(document.getElementById('ir-d').value) || 0;
  if (isNaN(s)) return;
  const inss = inssCalc(s), dedDep = dep * IRRF_DEP, base = Math.max(0, s - inss - dedDep);
  let aliq = 0, ded = 0;
  for (const [lim, a, d] of IRRF_TAB) { if (base <= lim) { aliq = a; ded = d; break; } }
  const irrfBruto = Math.max(0, base * aliq - ded);
  // Redutor adicional Lei 15.270/2025 (vigente jan/2026)
  let redutor = 0;
  if      (s <= 5000) redutor = Math.min(312.89, irrfBruto);
  else if (s <= 7350) redutor = Math.max(0, 978.62 - (0.133145 * s));
  const irrf = Math.max(0, irrfBruto - redutor), net = s - inss - irrf;
  const isentoIR = irrf === 0, efAliq = s > 0 ? (irrf / s * 100) : 0;
  // verdict block
  const vd = document.getElementById('ir-verdict');
  vd.style.background = isentoIR ? 'color-mix(in srgb,var(--a3) 8%,white)' : 'color-mix(in srgb,#E84040 7%,white)';
  vd.style.border = '1px solid ' + (isentoIR ? 'color-mix(in srgb,var(--a3) 20%,white)' : 'color-mix(in srgb,#E84040 20%,white)');
  document.getElementById('ir-verdict-ico').textContent = isentoIR ? '🟢' : '🔴';
  document.getElementById('ir-verdict-lbl').textContent = L === 'pt'
    ? (isentoIR ? 'Você está isento de IR neste mês' : 'Será descontado do seu salário')
    : (isentoIR ? 'You are exempt from income tax this month' : 'Will be withheld from your salary');
  document.getElementById('ir-verdict-val').textContent = isentoIR ? 'R$ 0,00' : '- R$ ' + f2(irrf);
  document.getElementById('ir-verdict-val').style.color = isentoIR ? 'var(--a3)' : '#E84040';
  const redTxt = redutor > 0
    ? (L === 'pt' ? ` · redutor Lei 15.270/25: -R$ ${f2(redutor)}` : ` · Lei 15.270/25 redutor: -R$ ${f2(redutor)}`)
    : '';
  document.getElementById('ir-verdict-sub').textContent = isentoIR
    ? (L === 'pt' ? `Nenhum valor retido na fonte${redTxt}.` : `No tax withheld${redTxt}.`)
    : (L === 'pt' ? `Alíquota efetiva sobre o bruto: ${efAliq.toFixed(2)}%${redTxt}` : `Effective rate on gross: ${efAliq.toFixed(2)}%${redTxt}`);
  document.getElementById('ir-verdict-sub').style.color = isentoIR ? 'var(--a3)' : '#c0392b';
  document.getElementById('ir-inss').textContent = 'R$ ' + f2(inss);
  document.getElementById('ir-dep-v').textContent = 'R$ ' + f2(dedDep);
  const depBox = document.getElementById('ir-dep-box');
  if (depBox) depBox.style.display = dep > 0 ? 'block' : 'none';
  document.getElementById('ir-base').textContent = 'R$ ' + f2(base);
  document.getElementById('ir-aliq').textContent = (aliq * 100).toFixed(1) + '% → ' + efAliq.toFixed(2) + '% efetiva';
  document.getElementById('ir-net').textContent  = 'R$ ' + f2(net);
  document.getElementById('r-irrf').classList.add('show');
}

// ── Salário Mínimo via BrasilAPI (atualização ao vivo) ────────────────────
async function fetchSM() {
  try {
    const r = await fetch('https://brasilapi.com.br/api/salario-minimo/v1');
    if (!r.ok) throw new Error('status ' + r.status);
    const data = await r.json();
    const current = Array.isArray(data) ? data[0] : data;
    const val = parseFloat(current.valor || current.salario_minimo || current.value);
    if (!val || isNaN(val)) throw new Error('invalid value');
    SM2025 = val;
    const disp = document.getElementById('pl-sm-display');
    if (disp) disp.textContent = 'R$ ' + val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const badge = document.getElementById('pl-sm-badge');
    if (badge) badge.style.display = 'inline';
    const src = document.getElementById('pl-sm-src');
    if (src) {
      const since = current.data_inicio || current.inicio || current.effectiveDate || '';
      src.style.display = 'block';
      src.textContent = 'Fonte: BrasilAPI' + (since ? ' · desde ' + since.slice(0, 10) : '');
    }
    if (document.getElementById('pl-s')?.value) calcProl();
  } catch (e) {
    console.warn('SM fetch failed:', e.message);
    const err = document.getElementById('pl-sm-err');
    if (err) err.style.display = 'inline';
    const src = document.getElementById('pl-sm-src');
    if (src) { src.style.display = 'block'; src.textContent = 'Usando valor fixo: R$ ' + SM2025.toFixed(2); }
  }
}
window.addEventListener('DOMContentLoaded', () => { fetchSM(); });
