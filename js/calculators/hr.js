// ── HR CALCULATORS (Brazil) ───────────────────────────────────────────────
// Depends on: utils.js (f2), lang.js (L), tax.js (inssCalc, IRRF_TAB, IRRF_DEP)

// ── Vacation Pay ──────────────────────────────────────────────────────────
function calcVac() {
  const s  = parseFloat(document.getElementById('v-s').value);
  const dy = parseInt(document.getElementById('v-d').value) || 30;
  const ab = parseInt(document.getElementById('v-a').value);
  if (isNaN(s)) return;
  const dp  = ab ? 20 : dy;
  const vg  = (s / 30) * dp;
  const ter = vg / 3;
  const aval = ab ? (s / 30) * 10 : 0;
  const base = vg + ter;
  const inss = inssCalc(base);
  const net  = base - inss + aval;
  document.getElementById('v-g').textContent  = f2(vg);
  document.getElementById('v-t').textContent  = f2(ter);
  document.getElementById('v-ab').textContent = ab ? f2(aval) : (L === 'pt' ? 'Não solicitado' : 'Not requested');
  document.getElementById('v-i').textContent  = f2(inss);
  document.getElementById('v-n').textContent  = f2(net);
  document.getElementById('r-vac').classList.add('show');
}

// ── 13th Salary ───────────────────────────────────────────────────────────
function calc13() {
  const s = parseFloat(document.getElementById('t-s').value);
  const m = parseInt(document.getElementById('t-m').value) || 12;
  if (isNaN(s)) return;
  const g = s * (m / 12), p1 = g / 2, inss = inssCalc(g), p2 = g / 2 - inss, tot = p1 + p2;
  document.getElementById('t-g').textContent = f2(g);
  document.getElementById('t-1').textContent = f2(p1);
  document.getElementById('t-i').textContent = f2(inss);
  document.getElementById('t-2').textContent = f2(p2);
  document.getElementById('t-n').textContent = f2(tot);
  document.getElementById('r-13').classList.add('show');
}

// ── Overtime ──────────────────────────────────────────────────────────────
function calcOT() {
  const s    = parseFloat(document.getElementById('ot-s').value);
  const h    = parseFloat(document.getElementById('ot-h').value) || 220;
  const h50  = parseFloat(document.getElementById('ot-50').value) || 0;
  const h100 = parseFloat(document.getElementById('ot-100').value) || 0;
  if (isNaN(s)) return;
  const vh = s / h, v50 = vh * 1.5, v100 = vh * 2;
  const ext = h50 * v50 + h100 * v100;
  document.getElementById('ot-hv').textContent   = f2(vh);
  document.getElementById('ot-50v').textContent  = f2(v50);
  document.getElementById('ot-100v').textContent = f2(v100);
  document.getElementById('ot-ext').textContent  = f2(ext);
  document.getElementById('ot-tot').textContent  = f2(s + ext);
  document.getElementById('r-ot').classList.add('show');
}

// ── Rescisão CLT ──────────────────────────────────────────────────────────
function calcResc() {
  const s    = parseFloat(document.getElementById('rs-s').value);
  const m    = parseInt(document.getElementById('rs-m').value) || 0;
  const d    = parseInt(document.getElementById('rs-d').value) || 0;
  const tp   = document.getElementById('rs-t').value;
  const fgts = parseFloat(document.getElementById('rs-f').value) || 0;
  if (isNaN(s)) return;
  const saldo   = (s / 30) * d;
  const ferProp = s * (m % 12 / 12) * (4 / 3);
  const t13     = s * (m % 12 / 12);
  let multa = 0, aviso = 0, obs = '';
  if      (tp === 'sem')   { multa = fgts * 0.4; aviso = s; obs = L === 'pt' ? 'Aviso prévio indenizado incluso. Multa de 40% FGTS.' : 'Includes indemnified prior notice. 40% FGTS fine.'; }
  else if (tp === 'comum') { multa = fgts * 0.2; aviso = s / 2; obs = L === 'pt' ? 'Acordo art. 484-A: aviso de 15 dias, multa de 20% FGTS, saque de 80% do fundo.' : 'Art. 484-A agreement: 15-day notice, 20% FGTS fine, 80% fund withdrawal.'; }
  else if (tp === 'ped')   { obs = L === 'pt' ? 'Pedido de demissão: sem multa, sem aviso indenizado.' : 'Resignation: no fine, no indemnified notice.'; }
  else if (tp === 'justa') { obs = L === 'pt' ? 'Justa causa: sem aviso, sem multa, sem férias vencidas.' : 'For cause: no notice, no fine, no accrued vacation.'; }
  const bruto = saldo + ferProp + t13 + multa + aviso;
  const inss  = inssCalc(s);
  const net   = bruto - inss;
  document.getElementById('rs-sb').textContent   = 'R$ ' + f2(saldo);
  document.getElementById('rs-fv').textContent   = 'R$ ' + f2(ferProp);
  document.getElementById('rs-13v').textContent  = 'R$ ' + f2(t13);
  document.getElementById('rs-mult').textContent = multa ? 'R$ ' + f2(multa) : '—';
  document.getElementById('rs-tot').textContent  = 'R$ ' + f2(bruto);
  document.getElementById('rs-net').textContent  = 'R$ ' + f2(net);
  document.getElementById('rs-obs').textContent  = obs;
  document.getElementById('r-resc').classList.add('show');
}

// ── Salário Líquido Completo ──────────────────────────────────────────────
function calcLiq() {
  const s = parseFloat(document.getElementById('liq-s').value) || 0;
  if (!s) return;
  const dep    = parseInt(document.getElementById('liq-dep').value)  || 0;
  const vt     = parseFloat(document.getElementById('liq-vt').value)  || 0;
  const vr     = parseFloat(document.getElementById('liq-vr').value)  || 0;
  const ps     = parseFloat(document.getElementById('liq-ps').value)  || 0;
  const pd     = parseFloat(document.getElementById('liq-pd').value)  || 0;
  const prev   = parseFloat(document.getElementById('liq-prev').value) || 0;
  const cons   = parseFloat(document.getElementById('liq-cons').value) || 0;
  const outros = parseFloat(document.getElementById('liq-out').value)  || 0;
  const inss   = inssCalc(s);
  const vtDesc = Math.min(vt, s * 0.06);
  const dedDep = dep * IRRF_DEP;
  const baseIR = Math.max(0, s - inss - dedDep);
  let aliqIR = 0, dedIR = 0;
  for (const [lim, a, d] of IRRF_TAB) { if (baseIR <= lim) { aliqIR = a; dedIR = d; break; } }
  const irrfBruto2 = Math.max(0, baseIR * aliqIR - dedIR);
  let redutor2 = 0;
  if      (s <= 5000) redutor2 = Math.min(312.89, irrfBruto2);
  else if (s <= 7350) redutor2 = Math.max(0, 978.62 - (0.133145 * s));
  const irrf       = Math.max(0, irrfBruto2 - redutor2);
  const fgts       = s * 0.08;
  const totalDesc  = inss + irrf + vtDesc + vr + ps + pd + prev + cons + outros;
  const net        = s - totalDesc;
  const pt         = L === 'pt';
  const rows = [
    { label: 'INSS', val: inss, type: 'obrig', note: pt ? 'Previdência social (tabela progressiva)' : 'Social security (progressive table)' },
    { label: pt ? 'IRRF (Imposto de Renda)' : 'Income Tax (IRRF)', val: irrf, type: 'obrig', note: pt ? `Alíquota nominal ${(aliqIR*100).toFixed(1)}% sobre base de R$ ${f2(baseIR)}` : `Nominal rate ${(aliqIR*100).toFixed(1)}% on base R$ ${f2(baseIR)}` },
    ...(vtDesc > 0 ? [{ label: pt ? 'Vale-transporte (6% do bruto)' : 'Transportation voucher (6% cap)', val: vtDesc, type: 'ben', note: pt ? `Desconto limitado a 6% do bruto (seu benefício: R$ ${f2(vt)})` : `Capped at 6% of gross (your benefit: R$ ${f2(vt)})` }] : []),
    ...(vr   > 0 ? [{ label: pt ? 'Vale-refeição/alimentação' : 'Meal / food voucher',  val: vr,   type: 'ben',   note: '' }] : []),
    ...(ps   > 0 ? [{ label: pt ? 'Plano de saúde' : 'Health plan',                     val: ps,   type: 'ben',   note: '' }] : []),
    ...(pd   > 0 ? [{ label: pt ? 'Plano dental'   : 'Dental plan',                     val: pd,   type: 'ben',   note: '' }] : []),
    ...(prev > 0 ? [{ label: pt ? 'Previdência privada' : 'Private pension',             val: prev, type: 'ben',   note: '' }] : []),
    ...(cons > 0 ? [{ label: pt ? 'Empréstimo consignado' : 'Payroll loan',              val: cons, type: 'other', note: '' }] : []),
    ...(outros>0 ? [{ label: pt ? 'Outros descontos' : 'Other deductions',               val: outros,type:'other', note: '' }] : []),
  ];
  document.getElementById('liq-net').textContent      = 'R$ ' + f2(net);
  document.getElementById('liq-tot-desc').textContent = '- R$ ' + f2(totalDesc);
  const COLORS = { obrig: '#E84040', ben: 'var(--a5)', other: 'var(--a4)', liq: 'var(--a3)' };
  const segments = [...rows.map(r => ({ val: r.val, color: COLORS[r.type], label: r.label })), { val: net, color: COLORS.liq, label: pt ? 'Líquido' : 'Net' }];
  document.getElementById('liq-bar').innerHTML    = segments.map(sg => `<div style="flex:${sg.val/s};background:${sg.color};min-width:${sg.val>0?3:0}px"></div>`).join('');
  document.getElementById('liq-legend').innerHTML = segments.map(sg => `<div style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--ink2)"><div style="width:10px;height:10px;border-radius:3px;background:${sg.color};flex-shrink:0"></div>${sg.label}: <strong>R$ ${f2(sg.val)}</strong></div>`).join('');
  let html = '';
  rows.forEach((r, i) => {
    const bg = i % 2 === 0 ? '' : 'background:var(--bg)';
    html += `<tr style="${bg}">
      <td style="padding:9px 14px"><div style="font-weight:500">${r.label}</div>${r.note ? `<div style="font-size:11px;color:var(--ink2);margin-top:1px">${r.note}</div>` : ''}</td>
      <td style="padding:9px 14px;text-align:right;font-weight:600;color:#E84040">- R$ ${f2(r.val)}</td>
      <td style="padding:9px 14px;text-align:right;color:var(--ink2);font-size:12px">${(r.val/s*100).toFixed(2)}%</td>
    </tr>`;
  });
  document.getElementById('liq-rows').innerHTML = html;
  document.getElementById('liq-foot').innerHTML = `
    <tr style="background:var(--sur2);font-weight:700">
      <td style="padding:9px 14px">${pt ? 'Total descontado' : 'Total deducted'}</td>
      <td style="padding:9px 14px;text-align:right;color:#E84040">- R$ ${f2(totalDesc)}</td>
      <td style="padding:9px 14px;text-align:right;color:var(--ink2);font-size:12px">${(totalDesc/s*100).toFixed(2)}%</td>
    </tr>
    <tr style="background:color-mix(in srgb,var(--a3) 9%,white);font-weight:800">
      <td style="padding:11px 14px;color:var(--a3)">${pt ? '💵 Salário líquido' : '💵 Net salary'}</td>
      <td style="padding:11px 14px;text-align:right;color:var(--a3);font-size:15px">R$ ${f2(net)}</td>
      <td style="padding:11px 14px;text-align:right;color:var(--a3);font-size:12px">${(net/s*100).toFixed(2)}%</td>
    </tr>`;
  document.getElementById('liq-fgts-note').innerHTML = `<strong>🏦 FGTS:</strong> ${pt ? `R$ ${f2(fgts)} depositados pelo empregador (8% do bruto) — não desconta do seu salário, mas é seu direito.` : `R$ ${f2(fgts)} deposited by employer (8% of gross) — not deducted from your pay, but it's yours.`}`;
  document.getElementById('r-liq').classList.add('show');
}
