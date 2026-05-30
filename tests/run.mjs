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
  return answer === 'yes' || answer === 'y';
}

async function main() {
  if (UPDATE && !existsSync(GOLD_DIR)) mkdirSync(GOLD_DIR, { recursive: true });

  const files = readdirSync(FIXT_DIR).filter(f => f.endsWith('.mjs')).sort();
  let pass = 0, fail = 0;
  const failures = [];
  const pending = []; // in --update mode: the changes we would make, pending confirmation

  for (const file of files) {
    const mod = await import(pathToFileURL(join(FIXT_DIR, file)).href);
    const fx = mod.default;
    if (!fx || !fx.name || !Array.isArray(fx.outputs) || typeof fx.apply !== 'function') {
      throw new Error(`${file}: must default-export { name, outputs[], apply(S) }`);
    }
    if (filter && !fx.name.includes(filter)) continue;

    const app = makeApp();
    fx.apply(app.S);

    for (const out of fx.outputs) {
      const gen = GENERATORS[out];
      if (!gen) throw new Error(`${fx.name}: unknown output "${out}"`);
      const actual = gen(app);
      const goldPath = join(GOLD_DIR, `${fx.name}.${out}.txt`);
      const label = `${fx.name}.${out}`;
      const hadGold = existsSync(goldPath);
      const expected = hadGold ? readFileSync(goldPath, 'utf8') : null;

      if (UPDATE) {
        // Only record real changes; identical references need no confirmation.
        if (!hadGold) {
          pending.push({ goldPath, label, actual, status: 'new', lines: actual.split('\n').length });
        } else if (expected !== actual) {
          pending.push({ goldPath, label, actual, status: 'changed', diff: firstDiff(expected, actual) });
        }
        continue;
      }

      if (!hadGold) {
        fail++;
        failures.push(`${label}: no reference file — run \`node tests/run.mjs --update\``);
      } else if (expected === actual) {
        pass++;
      } else {
        fail++;
        const d = firstDiff(expected, actual);
        failures.push(
          `${label}: differs at line ${d.line}\n` +
          `    saved: ${JSON.stringify(d.expected)}\n` +
          `    now:   ${JSON.stringify(d.actual)}`
        );
      }
    }
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

  const ok = await confirm('Save these as the new correct output? Type "yes" to confirm:');
  if (!ok) {
    console.log('\nAborted. Nothing was changed.');
    process.exit(1);
  }

  for (const p of pending) writeFileSync(p.goldPath, p.actual);
  console.log(`\nSaved ${pending.length} reference(s).`);
}

main().catch(err => { console.error(err); process.exit(1); });
