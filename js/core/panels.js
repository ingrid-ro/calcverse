// ── PANEL TOGGLE ──────────────────────────────────────────────────────────
// Controls open/close of calculator panels and smooth scroll.

function tog(id, card) {
  const p = document.getElementById(id);
  const open = p.classList.contains('open');
  document.querySelectorAll('.panel').forEach(x => x.classList.remove('open'));
  document.querySelectorAll('.card').forEach(x => x.classList.remove('on'));
  if (!open) {
    p.classList.add('open');
    card.classList.add('on');
    setTimeout(() => scrollToPanel(p), 80);
  }
  dpClose();
}

function scrollToPanel(p) {
  const r = p.getBoundingClientRect();
  const panelH = r.height, winH = window.innerHeight;
  const top = window.scrollY + r.top;
  const dest = top - (winH / 2) + (Math.min(panelH, winH * .7) / 2);
  window.scrollTo({ top: Math.max(0, dest), behavior: 'smooth' });
}

function cls(id) {
  document.getElementById(id).classList.remove('open');
  document.querySelectorAll('.card').forEach(x => x.classList.remove('on'));
}
