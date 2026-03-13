// ── MAIN — initialisation ─────────────────────────────────────────────────
// Runs after all scripts load. Sets up datepicker defaults and triggers
// initial renders that depend on the full DOM being ready.

const tod = new Date(), fim = new Date(tod);
fim.setDate(fim.getDate() + 30);

// Init all datepicker instances
['bd1', 'bd2', 'df1', 'df2', 'dl', 'age'].forEach(id => dpInit(id, null));
dpInit('bd1', ds(tod));
dpInit('bd2', ds(fim));
dpInit('dl',  ds(tod));

// Initial renders
loadRates();
genPw();
genLorem();
setTimeout(ecRender, 50);
