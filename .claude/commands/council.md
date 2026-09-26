---
description: Set up and run a multi-voice council on a substantive design decision
---

Topic: $ARGUMENTS

Set up the council per `docs/templates/council-prompt.md`. The setup phase is interactive; the council itself runs in one pass after David approves the council plan.

## Plain language, always

David is a physician, not a programmer. Every line he sees — the council plan, the ratings, the report — is plain clinical English:

- Options get short descriptive names ("Option A: extend the existing section"), never Greek letters, codenames, or invented shorthand.
- Use the plain names for the discipline mechanics: "what would change my mind" (not falsifier), "considering several options at each fork" (not tree-of-thought), "score honesty check" (not calibration self-check), "the score spread we expect, declared upfront" (not pre-committed distribution), "unresolved questions" (not residuals), "council plan" (not scaffold), "combined recommendation" (not synthesis/σ).
- Any unavoidable technical term (a function name, a payer term of art) gets a one-phrase plain-English gloss at first use.
- Clinical analogies are encouraged — "what finding would make you abandon this diagnosis" explains the change-my-mind line better than any process word.
- Confidence percentages and FOR/AGAINST/UNRESOLVED stay — they read like pretest probabilities.

## Setup phase

1. **Identify the concerns.** Enumerate concretely — no vague qualifiers ("BIF branching is underpowered" produces guesswork; "BIF has no severity tiers, no auto-bridge, no priorExternal attribution" produces verdicts).
2. **Ground each concern with file:line citations.** Read the relevant source, don't guess. Citations are the single biggest predictor of council quality.
3. **Propose 2-5 voices per concern.** Each owns one distinct dimension. State why each voice is needed. Two voices on the same dimension is allowed only when their disagreement is the signal (e.g., DBP attending vs. psychologist on a clinical question).
4. **Recommend threshold and max rounds.** Default: 95% threshold for substantive design, 90% for cleanup; 3-5 max rounds.
5. **Recommend a deliberation mode and state its cost.** *One sitting*: one Claude plays every voice in a single pass (how every council ran before 2026-09-21). *Independent voices*: each voice is a separate Claude run that scores blind in round one, then deliberates from the written scores in later rounds. Recommend independent voices when the topic is substantive clinical content or note prose, when two voices are expected to legitimately diverge, or when the recommendation reopens a prior council's merged decision. Recommend one sitting for cleanup councils, questions one clinical voice can answer, or when David asks for a quick council. State the cost as a run count: voices × rounds.
6. **Present the filled-in council plan — in plain language per the rule above — and ask:** "Run as-is, or adjust voices/concerns/threshold/grounding/mode first?"

## Council execution

After David approves, run the council in one pass per the protocol in `docs/templates/council-prompt.md`. Maintain all discipline, under the plain names:

- A "what would change my mind" line with every rating ("I would lower this rating by 10+ points if I observed: [specific observable]")
- 2-point spread within a round (no two of a voice's FOR scores for different options within 2 points of each other — forces a real ranking of the options). The rule is silent across rounds on purpose: a voice that still believes the same thing keeps the same score, and a score nudged only to satisfy this rule would pollute the shift audit below.
- Several options considered at every decision point, each scored, weak ones discarded
- Score honesty check at the end (how the scores actually landed vs. the spread we expected — e.g. ~X% at ≥95, ~Y% at 85-94, ~Z% below 85)
- One pass only — no clarifying questions mid-council; end with unresolved questions stated honestly

### Independent voices: how it runs

The main session is the coordinator. It never scores and never adjusts a voice's number; every score in the report is a voice's own, quoted verbatim. Full description and the voice packet are in `docs/templates/council-prompt.md` under "Independent voices".

- **Round 1 — blind reads.** Spawn one Agent per active voice, all in the same turn so they run in parallel. Each packet carries: the concern framing and council question; every file:line citation from the council plan (the voice reads those ranges itself and cites file:line for every claim); the voice's role, the dimension it owns, and its authority; the project constraints and invariants; the per-rating discipline under the plain names; and the required output shape. The packet carries constraints, never a preferred answer, and never another voice's scores. Each voice proposes its own options with descriptive names, scores every one with both change-my-mind lines, and lists its inter-member and user questions.
- **Merge.** Fold the voices' options into one named list. Combine duplicates; keep a voice's own wording where it differs in substance. Discard nothing at this step.
- **Round 2 and later — deliberation.** Load SendMessage via ToolSearch and continue each voice in its own run, so it genuinely remembers what it said. The packet carries the merged option list, every voice's prior-round scores and reasoning, the questions directed at this voice (it answers those first), the answers it received, and the position-shift instructions. The voice restates its prior scores, then re-scores every surviving option and names the cause of any shift of 15 points or more. A question asked in round N is answered at the start of round N+1; a final-round question stays open and goes in the unresolved list.
- **Form violations go back to the voice.** A missing or vague change-my-mind line, two options scored within 2 points, or an UNRESOLVED of 10% or more without a question is returned to that voice for restatement before the round closes. Fix form, never scores.
- **Write-up.** Same report as one-sitting mode, plus a header line: "Deliberation mode: independent voices — N voices, M rounds, K runs." The combined recommendation is the highest-FOR surviving option under the threshold rule. The unresolved section quotes every below-threshold voice's AGAINST reasoning in its own words. The authority rule stands: clinical leads decide content, implementation leads decide how, and the coordinator adds no opinion of its own.

## When NOT to run this

If the topic is a bug fix with one obvious solution, a small cleanup, or anything where two rounds of council is more work than just doing the thing — say so plainly and don't run the council. The skip clause from the template applies.

## Argument handling

- `$ARGUMENTS` empty → ask David what the council should deliberate on, in one sentence; then proceed.
- `$ARGUMENTS` is a single topic → set up one concern.
- `$ARGUMENTS` lists multiple topics → each gets its own concern + voices.
