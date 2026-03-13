// ── TOOLS ─────────────────────────────────────────────────────────────────
// CSV→JSON, Password, Base64, Lorem Ipsum, Doc→PDF, Image Converter, URL Shortener
// Depends on: utils.js (escH), lang.js (L)

// ── Clipboard helpers ─────────────────────────────────────────────────────
function _doCopy(txt) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(txt).then(() => _cpOk()).catch(() => _cpFallback(txt));
  } else {
    _cpFallback(txt);
  }
}
function _cpFallback(txt) {
  const ta = document.createElement('textarea');
  ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
  document.body.appendChild(ta); ta.focus(); ta.select();
  try { document.execCommand('copy'); _cpOk(); } catch (e) { alert('Copy failed'); }
  document.body.removeChild(ta);
}
function _cpOk() {
  const t = document.createElement('div');
  t.textContent = L === 'pt' ? '✓ Copiado!' : '✓ Copied!';
  t.style.cssText = 'position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:#1BAF6E;color:#fff;padding:9px 22px;border-radius:20px;font-size:13px;font-weight:600;z-index:99999;box-shadow:0 4px 16px rgba(0,0,0,.2);pointer-events:none;';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2000);
}
function cpEl(id)  { _doCopy(document.getElementById(id).textContent); }
function cpTxt(id) { const el = document.getElementById(id); _doCopy(el.value || el.textContent); }

// ── CSV → JSON ────────────────────────────────────────────────────────────
function csv2j() {
  const raw = document.getElementById('csv-in').value.trim();
  if (!raw) return;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const hdr   = lines[0].split(',').map(h => h.trim());
  const json  = lines.slice(1).map(l => {
    const v = l.split(',');
    return Object.fromEntries(hdr.map((h, i) => [h, (v[i] || '').trim()]));
  });
  const out = document.getElementById('json-out');
  out.textContent = JSON.stringify(json, null, 2);
  out.style.display = 'block';
  document.getElementById('csv-cp-btn').style.display = 'inline-flex';
}
function csvFileLoad(inp) {
  const f = inp.files[0]; if (!f) return;
  document.getElementById('csv-file-name').textContent = f.name;
  const r = new FileReader();
  r.onload = e => { document.getElementById('csv-in').value = e.target.result; };
  r.readAsText(f);
}

// ── Password Generator ────────────────────────────────────────────────────
function genPw() {
  const len = parseInt(document.getElementById('pw-l').value) || 16;
  const tp  = document.getElementById('pw-t').value;
  const ch  = tp === 'all' ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
             : tp === 'an'  ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
             : tp === 'n'   ? '0123456789'
             : 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const pw = [...Array(len)].map(() => ch[Math.floor(Math.random() * ch.length)]).join('');
  document.getElementById('pw-out').textContent = pw;
  document.getElementById('pw-cp-btn').style.display = 'inline-flex';
  const sc = Math.min(100, len * 3 + (tp === 'all' ? 30 : tp === 'an' ? 15 : 0));
  const bar = document.getElementById('pw-bar');
  bar.style.width      = sc + '%';
  bar.style.background = sc > 80 ? 'var(--a3)' : sc > 50 ? 'var(--a5)' : '#E84040';
}

// ── Base64 ────────────────────────────────────────────────────────────────
function b64e() {
  try {
    document.getElementById('b64-out').value = btoa(unescape(encodeURIComponent(document.getElementById('b64-in').value)));
    document.getElementById('b64-cp-btn').style.display = 'inline-flex';
  } catch (e) { document.getElementById('b64-out').value = 'Error: ' + e.message; }
}
function b64d() {
  try {
    document.getElementById('b64-out').value = decodeURIComponent(escape(atob(document.getElementById('b64-in').value)));
    document.getElementById('b64-cp-btn').style.display = 'inline-flex';
  } catch (e) { document.getElementById('b64-out').value = 'Error: invalid Base64'; }
}
function b64FileLoad(inp) {
  const f = inp.files[0]; if (!f) return;
  document.getElementById('b64-file-name').textContent = f.name;
  const r = new FileReader();
  r.onload = e => { document.getElementById('b64-in').value = e.target.result; };
  r.readAsText(f);
}

// ── Lorem Ipsum ───────────────────────────────────────────────────────────
const LW = ['lorem','ipsum','dolor','sit','amet','consectetur','adipiscing','elit','sed','do','eiusmod','tempor','incididunt','ut','labore','et','dolore','magna','aliqua','enim','ad','minim','veniam','quis','nostrud','exercitation','ullamco','laboris','nisi','aliquip','ex','ea','commodo','consequat','duis','aute','irure','in','reprehenderit','voluptate','velit','esse','cillum','eu','fugiat','nulla','pariatur'];
function lPara(st) {
  const n = 7 + Math.floor(Math.random() * 8);
  const w = [...Array(n)].map(() => LW[Math.floor(Math.random() * LW.length)]);
  if (st) { w[0]='Lorem'; w[1]='ipsum'; w[2]='dolor'; w[3]='sit'; w[4]='amet'; }
  w[0] = w[0][0].toUpperCase() + w[0].slice(1);
  return w.join(' ') + '.';
}
function genLorem() {
  const n = parseInt(document.getElementById('li-n').value) || 3;
  const s = document.getElementById('li-s').value === '1';
  document.getElementById('lorem-out').value = [...Array(n)].map((_, i) => lPara(i === 0 && s)).join('\n\n');
  document.getElementById('lorem-cp-btn').style.display = 'inline-flex';
}

// ── Doc → PDF ─────────────────────────────────────────────────────────────
let d2pDocxHtml = null, d2pCsvData = null;

function d2pTab(n) {
  [1, 2].forEach(i => {
    document.getElementById('d2pt' + i).classList.toggle('on', i === n);
    document.getElementById('d2p-panel' + i).style.display = i === n ? 'block' : 'none';
  });
}

function d2pDocxLoad(inp) {
  const f = inp.files[0]; if (!f) return;
  document.getElementById('d2p-docx-name').textContent = f.name;
  const st = document.getElementById('d2p-status');
  st.style.display = 'block'; st.textContent = L === 'pt' ? 'Lendo arquivo...' : 'Reading file...';
  const r = new FileReader();
  r.onload = async e => {
    try {
      const res = await mammoth.convertToHtml({ arrayBuffer: e.target.result });
      d2pDocxHtml = res.value;
      const prev = document.getElementById('d2p-docx-prev');
      prev.innerHTML = d2pDocxHtml; prev.style.display = 'block';
      document.getElementById('d2p-docx-btn').style.display = 'inline-flex';
      st.textContent = L === 'pt' ? '✓ Pronto — clique em Gerar PDF' : '✓ Ready — click Generate PDF';
      st.style.color = 'var(--a3)';
    } catch (err) { st.textContent = 'Error: ' + err.message; st.style.color = '#E84040'; }
  };
  r.readAsArrayBuffer(f);
}

function d2pDocx2pdf() {
  if (!d2pDocxHtml) return;
  const st = document.getElementById('d2p-status');
  st.style.display = 'block'; st.textContent = L === 'pt' ? 'Gerando PDF...' : 'Generating PDF...'; st.style.color = 'var(--ink2)';
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const tmp = document.createElement('div'); tmp.innerHTML = d2pDocxHtml;
    const paras = [];
    tmp.querySelectorAll('p,h1,h2,h3,h4,li').forEach(el => { const txt = el.textContent.trim(); if (txt) paras.push({ txt, tag: el.tagName.toLowerCase() }); });
    let y = 20, marg = 18, maxW = 175;
    doc.setFont('helvetica');
    paras.forEach(({ txt, tag }) => {
      const isHeading = tag.startsWith('h'), sz = isHeading ? 14 : 11;
      doc.setFontSize(sz);
      if (isHeading) doc.setFont('helvetica', 'bold'); else doc.setFont('helvetica', 'normal');
      const lines = doc.splitTextToSize(txt, maxW);
      if (y + lines.length * (sz * 0.35 + 2) > 285) { doc.addPage(); y = 20; }
      doc.text(lines, marg, y);
      y += lines.length * (sz * 0.35 + 2) + (isHeading ? 4 : 2);
    });
    doc.save('document.pdf');
    st.textContent = L === 'pt' ? '✓ PDF baixado!' : '✓ PDF downloaded!'; st.style.color = 'var(--a3)';
  } catch (e) { st.textContent = 'Error: ' + e.message; st.style.color = '#E84040'; }
}

function d2pCsvLoad(inp) {
  const f = inp.files[0]; if (!f) return;
  document.getElementById('d2p-csv-name').textContent = f.name;
  document.getElementById('d2p-pdf-title').value = f.name.replace(/\.csv$/i, '');
  const st = document.getElementById('d2p-status');
  st.style.display = 'block'; st.textContent = L === 'pt' ? 'Lendo CSV...' : 'Reading CSV...';
  const r = new FileReader();
  r.onload = e => {
    const rows = e.target.result.trim().split('\n').map(l => l.split(',').map(c => c.trim().replace(/^"|"$/g, '')));
    d2pCsvData = rows;
    const prev = document.getElementById('d2p-csv-prev');
    // escH prevents XSS from malicious CSV content
    const th    = rows[0]?.map(h => `<th style="padding:5px 10px;border:1px solid var(--bdr);background:var(--sur2);font-weight:600;white-space:nowrap">${escH(h)}</th>`).join('');
    const tbody = rows.slice(1).map(row => `<tr>${row.map(c => `<td style="padding:4px 10px;border:1px solid var(--bdr)">${escH(c)}</td>`).join('')}</tr>`).join('');
    prev.innerHTML = `<table style="border-collapse:collapse;width:100%;font-size:12px"><thead><tr>${th}</tr></thead><tbody>${tbody}</tbody></table>`;
    prev.style.display = 'block';
    document.getElementById('d2p-csv-btn').style.display = 'inline-flex';
    st.textContent = L === 'pt' ? `✓ ${rows.length - 1} linhas lidas` : `✓ ${rows.length - 1} rows loaded`;
    st.style.color = 'var(--a3)';
  };
  r.readAsText(f);
}

function d2pCsv2pdf() {
  if (!d2pCsvData || !d2pCsvData.length) return;
  const st = document.getElementById('d2p-status');
  st.style.display = 'block'; st.textContent = L === 'pt' ? 'Gerando PDF...' : 'Generating PDF...'; st.style.color = 'var(--ink2)';
  try {
    const { jsPDF } = window.jspdf;
    const doc     = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    const title   = document.getElementById('d2p-pdf-title').value || 'Data Export';
    doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(title, 14, 18);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(new Date().toLocaleString(), 14, 24);
    const headers = d2pCsvData[0], rows = d2pCsvData.slice(1);
    const cw = Math.min(40, Math.floor(262 / headers.length)), ch = 8, sy = 32;
    doc.setFillColor(45, 107, 228); doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
    headers.forEach((h, i) => { doc.rect(14 + i * cw, sy, cw, ch, 'F'); doc.text(String(h).substring(0, Math.floor(cw / 2)), 14 + i * cw + 2, sy + 5.5); });
    doc.setTextColor(30, 28, 24); doc.setFont('helvetica', 'normal');
    let ry = sy + ch;
    rows.forEach((row, ri) => {
      if (ry > 190) { doc.addPage(); ry = 20; }
      if (ri % 2 === 0) { doc.setFillColor(247, 245, 240); doc.rect(14, ry, headers.length * cw, ch, 'F'); }
      row.forEach((c, ci) => { doc.text(String(c || '').substring(0, Math.floor(cw / 2)), 14 + ci * cw + 2, ry + 5.5); });
      ry += ch;
    });
    const fname = (title || 'export').replace(/[^a-z0-9]/gi, '_') + '.pdf';
    doc.save(fname);
    st.textContent = L === 'pt' ? '✓ PDF baixado!' : '✓ PDF downloaded!'; st.style.color = 'var(--a3)';
  } catch (e) { st.textContent = 'Error: ' + e.message; st.style.color = '#E84040'; }
}

// ── Image Converter ───────────────────────────────────────────────────────
let imgcFile = null;
document.addEventListener('DOMContentLoaded', () => {
  const q = document.getElementById('imgc-q');
  if (q) q.addEventListener('input', () => document.getElementById('imgc-qlbl').textContent = Math.round(q.value * 100) + '%');
});

function imgcLoad(inp) {
  const f = inp.files[0]; if (!f) return;
  imgcFile = f;
  const url  = URL.createObjectURL(f);
  const prev = document.getElementById('imgc-preview');
  prev.src = url;
  document.getElementById('imgc-preview-wrap').style.display = 'block';
  document.getElementById('imgc-btn').style.display = 'inline-flex';
  prev.onload = () => { document.getElementById('imgc-info').textContent = `${prev.naturalWidth} × ${prev.naturalHeight}px · ${(f.size / 1024).toFixed(1)} KB · ${f.type || 'unknown'}`; };
  document.getElementById('imgc-lbl').textContent = f.name;
}

function imgcConvert() {
  if (!imgcFile) return;
  const fmt = document.getElementById('imgc-fmt').value;
  const q   = parseFloat(document.getElementById('imgc-q').value);
  const img = new Image(), url = URL.createObjectURL(imgcFile);
  img.onload = () => {
    const cv = document.getElementById('imgc-canvas');
    cv.width = img.naturalWidth; cv.height = img.naturalHeight;
    cv.getContext('2d').drawImage(img, 0, 0);
    const ext = fmt === 'image/png' ? 'png' : fmt === 'image/webp' ? 'webp' : 'jpg';
    const a = document.createElement('a'); a.download = 'converted.' + ext; a.href = cv.toDataURL(fmt, q); a.click();
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// ── URL Shortener ─────────────────────────────────────────────────────────
function fetchT(url, ms) {
  const ctrl = new AbortController();
  const tid  = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(tid));
}

async function shortenURL() {
  let url = document.getElementById('short-in').value.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  document.getElementById('r-short').style.display     = 'none';
  document.getElementById('short-err').style.display   = 'none';
  document.getElementById('short-qr-wrap').style.display = 'none';
  const ld  = document.getElementById('short-loading'); ld.style.display = 'flex';
  const btn = document.getElementById('short-btn'); btn.disabled = true;
  let link  = null;
  const proxy = 'https://corsproxy.io/?';
  try {
    const r = await fetchT(proxy + encodeURIComponent('https://tinyurl.com/api-create.php?url=' + encodeURIComponent(url)), 8000);
    const txt = (await r.text()).trim();
    if (txt.startsWith('http')) link = txt;
  } catch (_) {}
  if (!link) {
    try {
      const r = await fetchT(proxy + encodeURIComponent('https://is.gd/create.php?format=json&url=' + encodeURIComponent(url)), 8000);
      const d = await r.json();
      if (d.shorturl) link = d.shorturl;
    } catch (_) {}
  }
  if (!link) {
    try {
      const r = await fetchT('https://api.shrtco.de/v2/shorten?url=' + encodeURIComponent(url), 8000);
      const d = await r.json();
      if (d.ok && d.result && d.result.full_short_link) link = d.result.full_short_link;
    } catch (_) {}
  }
  ld.style.display = 'none'; btn.disabled = false;
  document.getElementById('short-qr-img').src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=' + encodeURIComponent(url);
  document.getElementById('short-qr-wrap').style.display = 'block';
  if (link) {
    document.getElementById('short-open').textContent     = link;
    document.getElementById('short-open').href            = link;
    document.getElementById('short-open-btn').href        = link;
    document.getElementById('short-cp-ok').style.display = 'none';
    document.getElementById('r-short').style.display     = 'block';
  } else {
    const err = document.getElementById('short-err');
    err.style.display = 'block';
    err.textContent = L === 'pt' ? '⚠️ Não foi possível encurtar. QR Code gerado como alternativa.' : '⚠️ Could not shorten. QR Code generated as alternative.';
  }
}

function shortCopy() {
  const url = document.getElementById('short-open').textContent || '';
  if (!url) return;
  navigator.clipboard.writeText(url).then(() => {
    const ok = document.getElementById('short-cp-ok');
    ok.style.display = 'block';
    setTimeout(() => ok.style.display = 'none', 2500);
  }).catch(() => {
    const r = document.createRange();
    r.selectNodeContents(document.getElementById('short-open'));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
  });
}
