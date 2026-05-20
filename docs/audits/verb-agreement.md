# Audit: singular-they verb agreement in prose generators

Re-run this audit whenever new prose content is added to the tool (new prose generator function, new template literal inside an existing one, or any change that introduces text referring to the patient with a finite verb).

## The bug

When `S.pronouns === 'they'`, the patient is referred to with singular-they ("they exhibits", "they has received"). Prose generators that hardcode third-person-singular verbs produce ungrammatical output:

| Wrong (current bug) | Correct (after fix) |
|---|---|
| They has received a diagnosis… | They have received a diagnosis… |
| they carries the following co-occurring diagnoses… | they carry the following co-occurring diagnoses… |
| They exhibits behavioral inflexibility… | They exhibit behavioral inflexibility… |
| With respect to communication, they uses two- to three-word phrases. | With respect to communication, they use two- to three-word phrases. |

For he/she patients and for the "the child" / "the individual" fallback, the same hardcoded singular verbs are grammatically correct, so the bug is invisible until a clinician selects "they" pronouns.

## The fix pattern

A module-scope helper `v3(verb)` lives just after `getPron()` in the source file. It returns the bare-form verb when `S.pronouns === 'they'`, and the original third-person-singular verb otherwise. Every finite verb whose subject is a `getPron()`-derived variable must be wrapped:

```js
// Before:
`${pr.cap} has received a diagnosis…`

// After:
`${pr.cap} ${v3('has')} received a diagnosis…`
```

Compound verbs: only the auxiliary needs to be fixed.

```js
// "has been evaluated" → only "has" is the at-risk auxiliary
`${pr.cap} ${v3('has')} been evaluated…`     // ✓
`${pr.cap} ${v3('has')} ${v3('been')} ${v3('evaluated')}` // ✗ double-wrap, wrong
```

When a verb appears inside a lookup table (the verb is in data, not in the template), restructure the lookup or split the verb off at the call site:

```js
// Lookup table case (langShort in _abaContent):
const langShort = { nonverbal: 'is nonverbal/minimally verbal', ... };
const langStr = langShort[S.langLevel] || '';
if (langStr) {
  const sp = langStr.indexOf(' ');
  template += ` ${p.subj} ${v3(langStr.slice(0,sp))} ${langStr.slice(sp+1)}.`;
}
```

## What is NOT a bug

- **Subject is a placeholder span** like `${ph('{Student Name}')}` — placeholders are filled with a person's name and treated as grammatically singular. "{Student Name} has received" is correct.
- **Subject is a fixed string** like "The patient" or "The parent" — also grammatically singular. No wrap needed.
- **Verb is a modal** (can, may, should, would, will) — modals don't conjugate. "They can," "they may," "they should" are all correct.
- **Verb is a participle, not the finite verb** — "received," "being," "evaluated" do not change. Only wrap the auxiliary that carries tense agreement.
- **Sentence subject is a different noun than the patient pronoun** — e.g., an embedded label like "ADHD presents differently in girls" inside a sentence about the patient: the inner verb's subject is "ADHD," not the patient.

## Audit procedure

Run this against the source file:

```
src: C:\Users\davem\OneDrive\Documents\Claude programming\autism-ap-builder.html
```

**Step 1 — Identify in-scope prose generators.**
Use grep to find functions that call `getPron()`:

```
grep -n "= ?getPron()" autism-ap-builder.html
```

Each call site identifies a function that produces prose. Note the function name and line range.

**Step 2 — Within each function, find all at-risk subject tokens.**
The variables holding getPron()-derived values vary in name. Look for any of:

- `pr.cap`, `pr.subj`
- `p.cap`, `p.subj`
- `pCap`, `pSub`, `pSubCap`
- `subj` (when assigned from a ternary involving pr or p)
- Anything assigned from `const p = getPron()` or `const pr = getPron()`

**Step 3 — For each prose-emitting template literal, scan for EVERY finite verb after each at-risk subject token.**

Do not stop at the first hit. A single template may contain multiple at-risk verbs ("They has received… they carries…").

At-risk verbs include any third-person-singular conjugation whose bare ("they") form differs:

- is, was, has, does
- presents, demonstrates, shows, exhibits, meets
- carries, communicates, uses, experiences, engages
- any other `-s`-form verb whose bare equivalent is the verb stem

If a verb you encounter is not yet in `V3_MAP` (the module-scope verb map in the source), add it both to the audit report and to V3_MAP itself.

**Step 4 — False-positive guard.**

For each candidate finding, mentally substitute `S.pronouns='they'` into the template and read the rendered sentence out loud. If it is grammatical English, drop the finding.

Specific patterns that often look like bugs but aren't:
- Modal verbs (see "What is NOT a bug" above)
- Plural-form -s nouns ("address," "process," "discuss" used as nouns)
- Verbs inside quoted strings or labels embedded in the template

**Step 5 — Report findings.**

For each real finding, document:

```
Line <N>:
  Current: <80-char snippet>
  Subject: <token>
  Verb: <verb>
  For S.pronouns='they' would render: <rendered sentence>
  Fix: ${subjectToken} ${v3('verb')} <rest>
```

**Step 6 — Verify the fix.**

Run a programmatic test via the preview server with `S.pronouns='they'` and inspect the rendered output for the bug pattern `\bThey [a-z]+s\b` (case-sensitive match for capitalized "They" followed by lowercase third-person-singular -s verb).

```js
preview_eval: |
  S.pronouns='they'; S.diagStatus='confirmed'; render();
  const output = generate<TargetFunction>();
  return output.match(/\bThey [a-z]+s\b/g) || 'no bugs found';
```

## When to re-run

- After any commit that adds or modifies a prose generator
- After any commit that touches a template literal in `_abaContent`, `generateClinicalSummary`, `generateIEPLetterPlain`, `generateIEPLetterHTML`, `generateNote`, or any function called from those
- Before any external review of generated letters
- As part of pre-beta release checks

## History

- 2026-05-20: P1 grammar pass — first v3() helper added to `generateClinicalSummary`
- 2026-05-20: IEP letter audit — v3() added to `generateIEPLetterPlain`
- 2026-05-20: ABA letter audit — v3() added to `_abaContent`, 9 sites + 1 verb-in-data case fixed
- 2026-05-20: v3() and aOr() hoisted to module scope to prevent local-redefinition drift
