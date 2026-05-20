# Quickstart — Generate your first note in 5 minutes

This guide shows the **minimum** inputs to produce a usable A&P note, ABA letter, and IEP letter. It does not cover every option. Once you've made one note, the other inputs are self-explanatory.

**Live tool:** https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html

Before you start, **read [LIMITATIONS.md](LIMITATIONS.md)** — what this tool does *not* do, and why every output needs your review before sending.

---

## Step 1 — Diagnosis status (blue banner at top)

The first thing you choose. Three options:

- **Confirmed ASD** — you are diagnosing today
- **Suspected / Under evaluation** — concerns present, eval in progress
- **Rule out ASD** — eval did not meet criteria

*Then pick a Visit Type to the right:* Initial / Re-evaluation / Follow-up.

> [Screenshot: dx-banner with all three radio buttons visible and Visit Type row below]

**The tool will not generate output until you pick a diagnosis status.**

---

## Step 2 — Patient profile (Section 1)

Fill these six:

1. **Age group** — toddler / preschool / school-age / adolescent / young adult
2. **Pronouns** — he / she / they / not specified
3. **Language level** — pick the closest match (nonverbal, single words, phrases, simple sentences, conversational, fluent)
4. **Cognitive profile** — choose the closest descriptor (ID severity, GDD severity, average, BIF, etc.)
5. **Adaptive behavior** — severely impaired through age-appropriate
6. **Identified strengths** — optional free text or click the chips

> [Screenshot: Section 1 expanded, six fields highlighted]

Several things happen automatically as you fill these in — for example, choosing "nonverbal" will pre-check expressive language and AAC needs in Section 4. You can always uncheck them.

---

## Step 3 — DSM-5 criteria (Section 3, only if confirming)

For confirmed ASD, check the boxes for criteria you observed:
- **A1, A2, A3** — all three required for ASD
- **At least two of B1, B2, B3, B4** — required for ASD
- **C, D, E** — context, impairment, and not-better-explained criteria

The badge below the checkboxes tells you whether DSM-5 threshold is met.

> [Screenshot: DSM-5 section with criteria badge showing "✓ DSM-5 criteria complete"]

Optional: add a brief evidence note under each criterion (your clinical example). These flow into the note.

---

## Step 4 — Severity levels (Section 2, only if confirming)

Two radios:
- **Social Communication (SC):** Level 1 / 2 / 3
- **Restricted & Repetitive Behaviors (RRB):** Level 1 / 2 / 3

These often differ. The tool uses the higher of the two for IEP and ABA letter severity, so the letters reflect the highest support need.

---

## Step 5 — Functional needs (Section 4)

Click any need that applies across the six domains:
**Communication · Behavior · Adaptive · Sensory · Motor · Social**

For tier-2 interfering behaviors (tantrums, noncompliance, etc.), a frequency field appears — fill it in if you have it, leave blank otherwise.

> [Screenshot: Section 4 with several behavior boxes checked and a frequency field filled in]

This is the section that most strongly drives the ABA letter and IEP recommended services.

---

## Step 6 — School documentation (Section 6, only if ASD confirmed/suspected)

Pick one:
- **IEP in place** — student already has one
- **504 plan**
- **IEP needed** — request new evaluation
- **None / neither**

This determines whether the **IEP Letter** tab appears on the right, and which type of letter generates (request vs. amendment vs. 504 update vs. eval-support).

---

## Step 7 — Generate and copy

The right panel updates live. Three tabs at the top:

- **A&P Note** — for your medical chart (Epic)
- **ABA Letter** — only appears for confirmed ASD with school-related need
- **IEP Letter** — only appears when school documentation is selected

For each tab, three copy buttons:
- **Copy Rich Text** — pastes formatted into Epic / Word
- **Copy Plain Text** — for systems that don't render formatting
- **Copy for Epic (***)** — replaces `{placeholder}` fields with `***` so you can Tab through them in Epic's note composer

> [Screenshot: right panel with the three tabs and the three copy buttons highlighted]

---

## If something looks wrong

- Click **Clear All** (top right) and start over — confirms first
- Check Section 7 (Therapy / Referral Overrides) — anything auto-suggested can be manually excluded
- Check Section 5 — if "Include plan" pill on a comorbidity is off, that condition won't get a plan block in the note
- Review [LIMITATIONS.md](LIMITATIONS.md) before sending the IEP letter — there are known legal-language items still pending fixes

---

## What's next

After your first note, the other inputs (safety counseling, anticipatory guidance, ABA letter parameters, etc.) are mostly self-explanatory. The full input reference is in [README.md](README.md) if you want to dig deeper.

Found something wrong? See [CHEATSHEET.html](CHEATSHEET.html) for the one-page reference, or send feedback to the clinical lead.
