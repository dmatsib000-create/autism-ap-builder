// Golden-output test runner.
//
//   node tests/run.mjs              compare each fixture's output to its saved reference
//   node tests/run.mjs --update     re-save references — shows what changed and asks first
//   node tests/run.mjs --update --yes   re-save without the confirmation prompt
//   node tests/run.mjs <name>       run only fixtures whose name includes <name>
//
// A fixture (tests/fixtures/*.mjs) default-exports { name, describe, outputs,
// apply(S) }. `outputs` is any of 'note' | 'aba' | 'iep'. The reference file for
// each is tests/golden/<name>.<output>.txt and holds the exact plain text a
// clinician would copy from the corresponding tab.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { makeApp } from './harness.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXT_DIR = join(HERE, 'fixtures');
const GOLD_DIR = join(HERE, 'golden');

const args = process.argv.slice(2);
const UPDATE = args.includes('--update');
const ASSUME_YES = args.includes('--yes');
const filter = args.find(a => !a.startsWith('--'));

// Maps an output kind to the exact plain text the clinician copies from that tab.
const GENERATORS = {
  note: app => app.generateNote().main,
  aba: app => app.generateABALetterPlain(),
  iep: app => app.generateIEPLetterPlain(),
};

// Normalize line endings before comparing. The generators always emit \n, so a
// golden that has been checked out (or hand-edited) as CRLF should still match.
// This keeps the comparison correct even on a machine where .gitattributes was
// not honored — we never want a whole-file false failure over line endings.
const norm = s => s.replace(/\r\n/g, '\n');

function firstDiff(expected, actual) {
  const e = expected.split('\n');
  const a = actual.split('\n');
  const n = Math.max(e.length, a.length);
  for (let i = 0; i < n; i++) {
    if (e[i] !== a[i]) {
      return { line: i + 1, expected: e[i] ?? '<EOF>', actual: a[i] ?? '<EOF>' };
    }
  }
  return null;
}

// Ask a yes/no question on the terminal. Returns true only on an explicit yes.
// If there's no interactive terminal (e.g. output is piped) we don't hang — we
// refuse and tell the user to pass --yes deliberately.
async function confirm(question) {
  if (ASSUME_YES) return true;
  if (!process.stdin.isTTY) {
    console.log('\nNot an interactive terminal, so nothing was saved.');
    console.log('Re-run with --yes if you are sure you want to overwrite the references.');
    return false;
  }
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = (await rl.question(`\n${question} `)).trim().toLowerCase();
  rl.close();
  const ok = answer === 'yes' || answer === 'y';
  if (!ok) console.log('\nAborted. Nothing was changed.');
  return ok;
}

async function main() {
  if (UPDATE && !existsSync(GOLD_DIR)) mkdirSync(GOLD_DIR, { recursive: true });

  const files = readdirSync(FIXT_DIR).filter(f => f.endsWith('.mjs')).sort();
  let pass = 0, fail = 0, matched = 0;
  const failures = [];
  const pending = []; // in --update mode: the changes we would make, pending confirmation
  const catalog = []; // {name, describe} for every loaded fixture — used in the "nothing ran" list

  for (const file of files) {
    const mod = await import(pathToFileURL(join(FIXT_DIR, file)).href);
    const fx = mod.default;
    if (!fx || !fx.name || !Array.isArray(fx.outputs) || typeof fx.apply !== 'function') {
      throw new Error(`${file}: must default-export { name, outputs[], apply(S) }`);
    }
    catalog.push({ name: fx.name, describe: fx.describe || '' });
    if (filter && !fx.name.includes(filter)) continue;
    matched++;

    const app = makeApp();
    fx.apply(app.S);

    for (const out of fx.outputs) {
      const gen = GENERATORS[out];
      if (!gen) throw new Error(`${fx.name}: unknown output "${out}"`);
      const actual = gen(app);
      const goldPath = join(GOLD_DIR, `${fx.name}.${out}.txt`);
      const label = `${fx.name}.${out}`;
      const hadGold = existsSync(goldPath);
      // Compare on line-ending-normalized text (norm); write the raw actual (LF).
      const expected = hadGold ? norm(readFileSync(goldPath, 'utf8')) : null;
      const actualN = norm(actual);

      if (UPDATE) {
        // Only record real changes; identical references need no confirmation.
        if (!hadGold) {
          pending.push({ goldPath, label, actual, status: 'new', lines: actualN.split('\n').length });
        } else if (expected !== actualN) {
          pending.push({ goldPath, label, actual, status: 'changed', diff: firstDiff(expected, actualN) });
        }
        continue;
      }

      if (!hadGold) {
        fail++;
        failures.push(`${label}: no reference file — run \`node tests/run.mjs --update\``);
      } else if (expected === actualN) {
        pass++;
      } else {
        fail++;
        const d = firstDiff(expected, actualN);
        failures.push(
          `${label}: differs at line ${d.line}\n` +
          `    saved: ${JSON.stringify(d.expected)}\n` +
          `    now:   ${JSON.stringify(d.actual)}`
        );
      }
    }

    // Loud check for the v3() silent-fallback bug: a finite verb used with a
    // "they" patient but missing from V3_MAP renders ungrammatically ("they
    // has") AND warns. The harness captured those warnings. We anchor on the
    // stable "v3():" prefix of the app's warning, not the wording after it (the
    // app has a matching back-reference comment on that prefix).
    const v3Missing = [...new Set((app.__warnings || []).filter(w => w.startsWith('v3():')))];
    if (v3Missing.length) {
      if (UPDATE) {
        // Update mode doesn't fail (the human reviews the diff), but it must not
        // bake "they has" into a golden unannounced — surface the missing verbs.
        console.log(
          `\n⚠ ${fx.name}: singular-"they" verb(s) missing from V3_MAP — the saved golden ` +
          `will contain ungrammatical output until they are added:\n` +
          v3Missing.map(w => '    ' + w).join('\n')
        );
      } else {
        fail++;
        failures.push(
          `${fx.name}: singular-"they" verb-agreement bug — verb(s) missing from V3_MAP:\n` +
          v3Missing.map(w => '    ' + w).join('\n') +
          `\n    Fix: add the verb(s) to V3_MAP in autism-ap-builder.html (see docs/audits/verb-agreement.md).`
        );
      }
    }
  }

  // Running zero scenarios must never look like a clean pass. Two ways it happens:
  // an empty fixtures dir, or a filter (usually a typo'd name) that matched nothing.
  if (matched === 0) {
    if (catalog.length === 0) {
      console.log('\nNo fixtures found in tests/fixtures — nothing ran.');
    } else {
      console.log(`\nNo scenario name contains "${filter}" — nothing ran.`);
      console.log('Check the spelling, or run without a name to run them all. Available scenarios:');
      const w = Math.max(...catalog.map(c => c.name.length));
      for (const c of catalog) {
        console.log(`  ${c.name.padEnd(w)}${c.describe ? '  — ' + c.describe : ''}`);
      }
    }
    process.exit(1);
  }

  if (UPDATE) {
    await runUpdate(pending);
    return;
  }

  console.log('');
  for (const f of failures) console.log('✗ ' + f);
  console.log('');
  console.log(`${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
}

// The "look before you sign" gate: show every reference that would change, then
// require an explicit yes before overwriting anything.
async function runUpdate(pending) {
  if (pending.length === 0) {
    console.log('\nEverything already matches — no references need updating.');
    return;
  }

  console.log(`\n${pending.length} reference(s) would change:\n`);
  for (const p of pending) {
    if (p.status === 'new') {
      console.log(`  NEW      ${p.label}  (${p.lines} lines, no previous version)`);
    } else {
      console.log(`  CHANGED  ${p.label}  (first change at line ${p.diff.line})`);
      console.log(`             was: ${JSON.stringify(p.diff.expected)}`);
      console.log(`             now: ${JSON.stringify(p.diff.actual)}`);
    }
  }

  // confirm() prints its own reason on a no (non-TTY notice, or "Aborted").
  const ok = await confirm('Save these as the new correct output? Type "yes" to confirm:');
  if (!ok) process.exit(1);

  for (const p of pending) writeFileSync(p.goldPath, p.actual);
  console.log(`\nSaved ${pending.length} reference(s).`);
}

main().catch(err => { console.error(err); process.exit(1); });
