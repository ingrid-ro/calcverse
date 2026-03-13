#!/usr/bin/env node
/**
 * Age Calculator validation — run: node test-age-calc.js
 * Uses fixed "today" = 2025-03-13 for reproducible tests.
 */
function calcAge(birthStr, todayStr) {
  const a = new Date(birthStr + 'T00:00:00');
  const b = new Date(todayStr + 'T00:00:00');

  let y = b.getFullYear() - a.getFullYear();
  let m = b.getMonth() - a.getMonth();
  const lastDayPrev = new Date(b.getFullYear(), b.getMonth(), 0).getDate();
  const effectiveBirthDay = Math.min(a.getDate(), lastDayPrev);
  let d = b.getDate() - effectiveBirthDay;
  if (d < 0) { m--; d += lastDayPrev; }
  if (m < 0) { y--; m += 12; }

  let nbY = b.getFullYear();
  let nbD = Math.min(a.getDate(), new Date(nbY, a.getMonth() + 1, 0).getDate());
  let prx = new Date(nbY, a.getMonth(), nbD);
  if (prx < b) {
    nbY = b.getFullYear() + 1;
    nbD = Math.min(a.getDate(), new Date(nbY, a.getMonth() + 1, 0).getDate());
    prx = new Date(nbY, a.getMonth(), nbD);
  }
  const df = Math.round((prx - b) / 864e5);

  return { y, m, d, daysUntilNextBday: df };
}

const TODAY = '2025-03-13';
const tests = [
  { birth: '1997-07-01', desc: '07/01/1997 (July 1) — birthday later this year', expect: { y: 27, m: 8, d: 12, daysUntilNextBday: 110 } },
  { birth: '1997-01-07', desc: '01/07/1997 (Jan 7) — birthday passed this year', expect: { y: 28, m: 2, d: 6, daysUntilNextBday: 300 } },
  { birth: '2000-03-13', desc: 'Birthday today', expect: { y: 25, m: 0, d: 0, daysUntilNextBday: 0 } },
  { birth: '2000-03-14', desc: 'Birthday tomorrow', expect: { y: 24, m: 11, d: 27, daysUntilNextBday: 1 } },
  { birth: '2000-01-01', desc: 'Birthday passed this year', expect: { y: 25, m: 2, d: 12, daysUntilNextBday: 294 } },
  { birth: '1996-02-29', desc: 'Leap year Feb 29 — non-leap today', expect: { y: 29, m: 0, d: 13, daysUntilNextBday: 352 } },
  { birth: '1997-01-31', desc: 'End of month (Jan 31)', expect: { y: 28, m: 1, d: 13, daysUntilNextBday: 324 } },
  { birth: '1997-03-12', desc: 'Yesterday (Mar 12 → Mar 13, 28th bday passed)', expect: { y: 28, m: 0, d: 1, daysUntilNextBday: 364 } },
];

let ok = 0, fail = 0;
for (const t of tests) {
  const r = calcAge(t.birth, TODAY);
  const pass = r.y === t.expect.y && r.m === t.expect.m && r.d === t.expect.d && r.daysUntilNextBday === t.expect.daysUntilNextBday;
  if (pass) ok++; else fail++;
  const status = pass ? '✓' : '✗';
  console.log(`${status} ${t.desc}`);
  if (!pass) {
    console.log(`   got: ${r.y}y ${r.m}m ${r.d}d, ${r.daysUntilNextBday} days to next`);
    console.log(`   exp: ${t.expect.y}y ${t.expect.m}m ${t.expect.d}d, ${t.expect.daysUntilNextBday} days`);
  }
}
console.log(`\n${ok} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
