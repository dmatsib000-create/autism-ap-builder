// Export / Restore round trip. Run through the headless driver:
//
//   node .claude/skills/verify/scripts/drive.mjs .claude/skills/verify/scripts/roundtrip.js --timeout 580
//
// Why this exists: the test lanes cover the selections codec (encodeSelections /
// decodeSelections), but nothing in `npm test` can reach paintFormFromState(), which
// needs a real page. This builds RUNS random forms by clicking the real controls,
// exports each at Full, clears the form, restores the string, and requires the form
// and every output to come back identical: each control's checked/disabled/highlight
// state, each menu, the visibility of every element with an id, the modifier chips,
// plan pills and referral pills, the on-screen note, and the text of generateNote(),
// the ABA letter and the IEP letter (plain and preview), and the primary care list
// (plain, Word copy and workspace view, with its left-out and moved-up lines).
//
// The clicks come from a fixed seed, so a failure reproduces. Typed text is blanked
// before each export on purpose: a selections string never carries it. A restore that
// the panel reports as "not kept" is counted separately (announced), and must come
// with a real difference; a difference with no notice is the failure this looks for.
//
// Run it after changing: any form control or its change handler, clearAll(),
// updateAgeBasedVisibility(), the SEL_* tables, or paintFormFromState().
// Exit code 1 (the snippet throws) means at least one form did not survive.
const RUNS = 300;
let seed = 12345;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const pick = a => a[Math.floor(rnd() * a.length)];
const $ = q => [...document.querySelectorAll(q)];
const byId = id => document.getElementById(id);
const usable = el => el.offsetParent !== null && !el.disabled && !el.closest('dialog');
const openPanel = () => $('.header-actions button').find(b => b.textContent === 'Export / Restore').click();
const fire = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

function exportFull() {
  openPanel();
  document.querySelector('.sel-level-btn[data-level=full]').click();
  const v = byId('selExportField').value;
  byId('selDialog').close();
  return v;
}
function clearForm() {
  $('.header-actions .btn-danger')[0].click();
  const yes = $('.confirm-inline .btn-danger')[0];
  if (yes) yes.click();
}
function snapshot() {
  const o = {};
  // A blank-valued radio ("not specified") is not distinguishable in S from no choice,
  // so its checked state is not part of what a string promises to restore.
  $('input[type=radio],input[type=checkbox]')
    .filter(e => !e.closest('dialog') && !e.dataset.swReason && !(e.type === 'radio' && e.value === ''))
    .forEach((e, i) => {
      o['in' + i + ':' + (e.name || e.dataset.key || e.id) + '=' + e.value] =
        e.checked + '|' + e.disabled + '|' + (e.offsetParent !== null && (e.closest('.r-opt')?.classList.contains('is-on') || false));
    });
  $('select').forEach((e, i) => { o['sel' + i] = e.value; });
  $('[id],[data-for],[data-tm-returned]')
    .filter(e => !e.closest('dialog') && !e.closest('#notePreview') && !e.closest('.toast-container') && e.id !== 'toastContainer' && e.id !== 'srAnnounce')
    .forEach((e, i) => { o['disp' + i + ':' + (e.id || e.dataset.for || e.dataset.tmReturned)] = getComputedStyle(e).display === 'none' ? 'none' : 'shown'; });
  $('.mod-chip').forEach(e => { o['chip:' + e.id] = e.className + e.getAttribute('aria-pressed'); });
  $('.plan-pill').forEach(e => { o['pill:' + e.dataset.cv] = e.className + (e.className === 'plan-pill' ? '' : e.textContent); });
  $('.ov-pill').forEach((e, i) => { o['ov' + i] = e.className + e.textContent; });
  o['preview'] = byId('notePreview').innerText;
  const gen = (n, f) => { try { const r = f(); o[n] = typeof r === 'string' ? r : JSON.stringify(r); } catch (e) { o[n] = 'THREW ' + e.message; } };
  gen('gen:note', () => generateNote());
  gen('gen:abaPlain', () => generateABALetterPlain());
  gen('gen:abaPreview', () => generateABALetter(true));
  gen('gen:iepPlain', () => generateIEPLetterPlain());
  gen('gen:iepPreview', () => generateIEPLetterHTML());
  gen('gen:pcpPlain', () => generatePCPPlain());
  gen('gen:pcpRich', () => generatePCPHTML(false));
  gen('gen:pcpView', () => generatePCPHTML(true));
  o['eligible:aba'] = String(abaLetterEligible());
  o['eligible:iep'] = String(iepLetterEligible());
  return o;
}

byId('secToggleAllBtn').click(); // open every section so its controls can be clicked
const failures = [];
const stats = { runs: RUNS, abaLetters: 0, iepLetters: 0, pcpEdits: 0, announced: 0, generatorErrors: 0 };
for (let run = 0; run < RUNS; run++) {
  clearForm();
  const clicks = 10 + Math.floor(rnd() * 70);
  for (let i = 0; i < clicks; i++) {
    const el = pick([...$('input[type=radio]'), ...$('input[type=checkbox]'), ...$('.mod-chip'), ...$('.plan-pill'), ...$('.ov-pill'), ...$('select')].filter(usable));
    if (el.tagName === 'SELECT') { el.value = pick([...el.options].filter(x => !x.disabled)).value; fire(el, 'change'); }
    else el.click();
  }
  // The primary care list's leave-out and move-up buttons exist only on its own tab, so
  // the random clicks above never reach them: open the tab on about half the forms, press
  // a few, and return to the note. Every press redraws the list, so re-query each time.
  if (rnd() < 0.5) {
    byId('tabPCP').click();
    for (let i = Math.floor(rnd() * 5); i > 0; i--) {
      const btns = $('.pcp-btn').filter(b => !b.disabled);
      if (!btns.length) break;
      pick(btns).click();
    }
    byId('tabNote').click();
  }
  $('textarea,input[type=text],input[type=number]').filter(e => !e.closest('dialog')).forEach(e => { if (e.value) { e.value = ''; fire(e, 'input'); } });
  const exported = exportFull(), before = snapshot();
  clearForm();
  openPanel();
  const box = byId('selImportField'); box.value = exported; fire(box, 'input');
  byId('selRestoreBtn').click();
  const panel = byId('selDialog'), status = byId('selStatus').textContent;
  let announced = false;
  if (panel.open) { announced = /not kept/.test(status); if (!announced) failures.push({ run, panelStayedOpen: status }); panel.close(); }
  const reExported = exportFull(), after = snapshot();
  const diffs = Object.keys(before).filter(k => before[k] !== after[k])
    .map(k => (k === 'preview' || k.startsWith('gen:')) ? k + ' differs' : k + ': ' + before[k] + ' -> ' + after[k]);
  if (exported !== reExported) diffs.unshift('re-exported string differs');
  if (before['eligible:aba'] === 'true') stats.abaLetters++;
  if (before['eligible:iep'] === 'true') stats.iepLetters++;
  if (/;pcp(Omit|First)=/.test(exported)) stats.pcpEdits++;
  if (Object.keys(before).some(k => k.startsWith('gen:') && before[k].startsWith('THREW'))) stats.generatorErrors++;
  if (announced) { stats.announced++; if (!diffs.length) failures.push({ run, note: 'panel announced a drop but nothing differed' }); }
  else if (diffs.length) failures.push({ run, clicks, diffs: diffs.slice(0, 12), exported });
}
if (failures.length || stats.generatorErrors)
  throw new Error('round trip FAILED for ' + failures.length + ' of ' + RUNS + ' forms: ' + JSON.stringify({ stats, failures: failures.slice(0, 5) }, null, 1));
return 'round trip OK: ' + JSON.stringify(stats);
