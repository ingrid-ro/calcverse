// ── SEARCH ────────────────────────────────────────────────────────────────
// Depends on: lang.js (L, TR, setLang), panels.js (scrollToPanel)

function buildIndex() {
  const idx = [];
  document.querySelectorAll('.card').forEach(card => {
    const t = card.querySelector('.ctitle');
    const d = card.querySelector('.cdesc');
    if (t) idx.push({ title: t.textContent, desc: d ? d.textContent : '', card });
  });
  return idx;
}

let _idx = null;

function doSearch(q) {
  if (!_idx) _idx = buildIndex();
  const clr = document.getElementById('search-clr');
  const box = document.getElementById('search-results');
  q = q.trim();
  if (clr) clr.style.display = q ? 'block' : 'none';
  if (!q) { box.style.display = 'none'; return; }
  const hits = _idx.filter(i =>
    i.title.toLowerCase().includes(q.toLowerCase()) ||
    i.desc.toLowerCase().includes(q.toLowerCase())
  );
  if (!hits.length) {
    const none = TR[L].search_none || 'No results for';
    box.innerHTML = `<div style="padding:14px 16px;font-size:13px;color:var(--ink2)">${none} <strong>"${q}"</strong></div>`;
  } else {
    box.innerHTML = hits.map(h => {
      const escQ = q.replace(/[-.*+?^${}()|[\]\\]/g, '\\$&');
      const hl   = s => s.replace(new RegExp('(' + escQ + ')', 'gi'), '<mark style="background:color-mix(in srgb,var(--a2) 18%,white);color:var(--a2);border-radius:3px;padding:0 2px">$1</mark>');
      const oc   = h.card.getAttribute('onclick') || '';
      const pm   = (oc.match(/tog\('([^']+)'/) || [])[1] || '';
      return `<div onclick="searchClick(this)" data-panel-id="${pm}" style="display:flex;align-items:center;gap:12px;padding:11px 16px;cursor:pointer;border-bottom:1px solid var(--bdr);transition:.12s" onmouseenter="this.style.background='var(--bg)'" onmouseleave="this.style.background=''">
        <div style="font-size:18px">${h.card.querySelector('.cico') ? h.card.querySelector('.cico').textContent : '🔢'}</div>
        <div><div style="font-size:13px;font-weight:600">${hl(h.title)}</div><div style="font-size:11px;color:var(--ink2);margin-top:1px">${hl(h.desc)}</div></div>
      </div>`;
    }).join('');
  }
  box.style.display = 'block';
}

function searchClick(el) {
  const pid = el.getAttribute('data-panel-id');
  if (!pid) return;
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('open'));
  document.querySelectorAll('.card').forEach(x => x.classList.remove('on'));
  const panel = document.getElementById(pid);
  if (panel) { panel.classList.add('open'); clearSearch(); setTimeout(() => scrollToPanel(panel), 100); }
}

function clearSearch() {
  const inp = document.getElementById('search-inp');
  if (inp) inp.value = '';
  document.getElementById('search-clr').style.display      = 'none';
  document.getElementById('search-results').style.display  = 'none';
  _idx = null; // rebuild on next search (lang may have changed)
}

document.addEventListener('click', e => {
  if (!e.target.closest('#search-wrap')) document.getElementById('search-results').style.display = 'none';
});

// Extend setLang to also reset the search index and update placeholder
const _origSetLang = setLang;
setLang = function (l) {
  _origSetLang(l);
  _idx = null;
  const inp = document.getElementById('search-inp');
  if (inp) inp.placeholder = TR[l].search_ph || 'Search…';
};
