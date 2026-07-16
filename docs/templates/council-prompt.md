# Council prompt template

Reusable structure for multi-voice deliberation prompts. Drop in the placeholders (`{{LIKE_THIS}}`), keep the protocol, and you'll get the same disciplined output style the project has been using for PR-A through PR-G.

**The reader is a physician, not a programmer.** Everything the council shows the user — the council plan, the ratings, the report — is written in plain clinical English. The discipline mechanics below keep their function but carry plain names in output; see the Plain-language rule inside the protocol.

## When to use this

- Substantive design decisions where there are multiple defensible options.
- Cross-disciplinary questions (clinical + UX + implementation).
- Anywhere "consensus drift" would be worse than honest residual uncertainty.

## When NOT to use this

- Bug fixes with one obvious solution.
- Small cleanups where the question is "do this small thing — yes or no?"
- Anything where two rounds of council is more work than just doing the thing.

## How to use it

1. Copy the prompt below into a new conversation.
2. Replace every `{{PLACEHOLDER}}`. Don't leave any unfilled — vague placeholders produce vague councils.
3. Cite `file:line` for every claim about current behavior. This is the single biggest predictor of council quality. Vague grounding produces guesswork; explicit grounding produces real signal.
4. Pick voices that OWN distinct dimensions. Two voices sharing a dimension is acceptable only when the *disagreement* between them is the signal (e.g., DBP attending vs. psychologist on a clinical question where their perspectives can legitimately diverge).
5. Set `{{THRESHOLD}}` to 95% for substantive design decisions, 90% for smaller cleanup. Don't go lower — that pushes honesty out.
6. Set `{{MAX_ROUNDS}}` to 3–5. Past 5, you're either anchored or the question is genuinely hard and needs real-world evidence, not more deliberation.
7. Use conditional sub-councils to skip implementation discussion when clinical-validity resolves "no change needed."

---

## The template

```
You are running a structured multi-voice clinical-design council on
{{PROJECT_NAME}} ({{FILE_PATH}} on the {{BRANCH}} branch). {{N}}
clinical/UX concerns are on the table, each gets its own council;
{{ADDITIONAL_DELIVERABLES_IF_ANY}}. Produce all outputs in one pass.

# Concerns under review

<concern_1>
{{CONCERN_1_FRAMING}} — describe the issue with concrete enumeration,
not vague qualifiers.

Concrete grounding:
- {{FILE}}:{{LINE}} — {{WHAT_IT_DOES}}
- {{FILE}}:{{LINE}} — {{WHAT_IT_DOES}}
- (Include enough file:line citations that the council cannot guess
  at scope)

The council question: {{EXPLICIT_BINARY_OR_OPTION_QUESTION}}.
"Keep" decisions need a reason that ties back to {{EVIDENCE_BASE}};
"change" decisions need a concrete proposal with file:line target.
</concern_1>

<concern_2>
{{CONCERN_2_FRAMING}} (repeat the structure for each concern.)

The council question: {{EXPLICIT_QUESTION}}.
Sub-questions if the answer is {{TRIGGER_CONDITION}}:
- {{SUB_QUESTION_A}}
- {{SUB_QUESTION_B}}
</concern_2>

# Council protocol

Each council uses the same iteration discipline; only the voices
differ per concern.

**Plain-language rule — applies to every line the user sees.** The
reader is a physician, not a programmer. Write the council plan,
every rating, and the final report in plain clinical English:

- Name options descriptively — "Option A: extend the existing
  section" — never with Greek letters, codenames, or invented
  shorthand.
- Use the plain names for the discipline mechanics, not the method
  jargon:

  | Instead of | Write |
  |---|---|
  | falsifier | "What would change my mind: ..." |
  | tree-of-thought branching | "considering several options at each fork" |
  | calibration self-check | "score honesty check" |
  | pre-committed distribution | "the score spread we expect, declared upfront" |
  | residual(s) | "unresolved questions" |
  | scaffold | "council plan" |
  | synthesis (σ) | "combined recommendation" |

- A technical term that must appear (a function name, a DSM
  specifier, a payer term of art) gets a one-phrase plain-English
  gloss at first use.
- Clinical analogies are encouraged — "what finding would make you
  abandon this diagnosis" teaches the change-my-mind line better
  than any process word.
- Confidence percentages and FOR/AGAINST/UNRESOLVED stay as they
  are — they read like pretest probabilities and need no
  translation.

**Voice ownership** — each voice OWNS one evaluation dimension.
Other voices may comment but the rating belongs to the owner. No
two voices own overlapping dimensions, UNLESS the disagreement
between voices sharing a dimension is itself the signal (e.g., two
clinical perspectives that may diverge).

**Per-rating discipline** (every voice every round, for OWN proposal
AND every other voice's proposal):
1. Three-direction rating that sums to 100%:
   - **FOR %** — confidence this option should ship as proposed
   - **AGAINST %** — confidence this option fails or has a material
     defect that hasn't been addressed
   - **UNRESOLVED %** — genuine uncertainty that could move with new
     evidence (NOT a synonym for low confidence — UNRESOLVED means
     "I don't know AND I have a specific question that would move me")
2. {{RATIONALE_WORD_COUNT}} word reasoning covering both FOR and
   AGAINST directions (not just the dominant one).
3. Required "what would change my mind" line PER DIRECTION:
   - "FOR — what would change my mind: I would drop my FOR % to 0
     if I observed [specific observable]"
   - "AGAINST — what would change my mind: I would drop my AGAINST %
     to 0 if I observed [specific observable]"
   A vague line here indicates the voice didn't engage; restate with
   a concrete observable.
4. Confidence anchoring: no two of a voice's FOR ratings (across
   rounds and across options) may be within 2 percentage points of
   each other.
5. UNRESOLVED ≥10% triggers question discipline below — without a
   concrete question, UNRESOLVED must be restated as FOR or AGAINST.
   "I don't know" without a path to find out is not a rating, it's
   abstention.

**Option branching** — at each decision point, voices propose
several options (not just react to a single proposal), score each,
and discard the weak ones. Each option gets its own confidence
rating. Final recommendation is the highest-confidence surviving
option. Options carry short descriptive names in output ("Option A:
extend the existing section"), never letters or codenames alone.

**Question discipline** — triggered when any voice has UNRESOLVED
≥10%:

*Inter-member questions.* Any voice may direct a specific question
at another voice whose answer would move their UNRESOLVED. Format:
"[AskerVoice → TargetVoice]: [specific resolvable question]." The
target voice must respond before the round closes. Silent UNRESOLVED
is not permitted — name the question or collapse to FOR/AGAINST.

*Member-to-user questions.* If resolution requires an external fact
the council cannot supply (clinical reference, real-world data,
file:line, user preference), the voice states: "User question:
[specific resolvable question that would drop my UNRESOLVED to 0]."
The user answers at their discretion; the council may not stall on
unanswered user questions — proceed with honest residual if no
answer arrives within the round.

*Per-round question audit.* At round close, report: (a) every
inter-member question asked and whether it was answered, (b) every
user question asked and whether it was answered, (c) any UNRESOLVED
that shifted as a direct result of answers received.

**Iteration**:
- Minimum 2 rounds per concern.
- Round 2+ re-examines any voice <{{THRESHOLD}}% FOR OR any cross-
  voice disagreement on a SHARED observation.
- **Position-shift tracking.** At the start of each round ≥2, each
  voice states its prior-round FOR/AGAINST/UNRESOLVED per option,
  then re-rates fresh. After the round, report the delta per voice
  per option. Any shift ≥15 points in any direction requires a
  named cause: "Shifted because: [specific argument or new evidence
  received this round]." An un-named shift ≥15 points is a
  consensus-drift flag — note it in the round summary and flag it
  in the score honesty check.
- Stop when: all voices ≥{{THRESHOLD}}% FOR on the final option AND
  calibration check passes, OR {{MAX_ROUNDS}} rounds (submit honest
  residual).
- Do NOT inflate confidence to hit thresholds. Low confidence with
  defensible reasoning > high confidence built on consensus drift.

**Score honesty check at the end of each council** (older council
records call this the calibration self-check):
1. Rating distribution — FOR/AGAINST/UNRESOLVED tallies vs. expected
   (~{{EXPECTED_HIGH}}% of FOR ratings ≥95, ~{{EXPECTED_MID}}% at
   85–94, ~{{EXPECTED_LOW}}% at <85 across ~{{TOTAL_RATINGS}}
   ratings). If skewed, name where and re-audit the affected ratings.
2. Shift audit — count all ≥15-point round-over-round deltas. Were
   all named? Un-named large shifts are a consensus-drift flag.
3. Question resolution — count questions asked (inter-member + user-
   facing) vs. answered. Low answer rate with persistent UNRESOLVED
   signals the decision may need real-world evidence before it ships.

# Standing council

All councils for this project draw from the following permanent
roster. Per-concern sections below name which voices are ACTIVE
for each concern and what dimension each owns. Not every voice
appears in every concern.

**Core clinical triad:**
- **DBP attending.** Lead clinician. Eloquent, insurance-resistant
  documentation. Authority: DSM-5 autism/ID diagnosis, A&P note
  quality, medical-model framing.
- **Clinical psychologist.** Authority: psychometric interpretation,
  assessment documentation, diagnostic disambiguation.
- **Child and adolescent psychiatrist.** Authority: pharmacologic
  management, DSM differential, medical-model assessment.

**Implementation and workflow:**
- **Software engineer / UX specialist.** Authority: technical
  feasibility, GUI behavior, pediatric health-tech conventions.
- **Clinical workflow specialist.** Authority: real-world clinical
  use, friction and error reduction, time-to-completion.
- **Medical claims examiner.** Authority: denial risk, documentation
  completeness, payer review logic.

**Language and accessibility:**
- **English professor.** Authority: grammar, word choice, prose
  readability, medical documentation standards.
- **General pediatrician.** Authority: referring-GP readability,
  usability in a general-pediatrics practice at the UF Behavioral
  and Development Clinic.
- **Autistic parent / community reviewer.** Owns person-first and
  identity-first language (both acceptable). Authority: respectful,
  strengths-aware, non-stigmatizing, understandable, actionable
  language that does not minimize support needs.

**Specialist subcommittees (activate by concern):**
- **BCBA-D.** Authority: behavior analysis, ABA letter content,
  target and setting selection.
- **Allied health panel (SLP, OT, PT).** Authority: therapy
  recommendations, cross-discipline coordination, pediatric
  disability and feeding overlap.
- **Feeding therapist.** Authority: feeding-specific clinical
  content.
- **ESE director.** Authority: IEP letter content, FAPE, school
  accommodation language.
- **Specialist panel (sleep medicine / PM&R / neurology /
  gastroenterology / ENT).** Authority: co-occurring condition
  management, specialist referral language.

# Concern 1 voices

Active voices for this concern (select from standing council above):

- **{{VOICE_NAME_1}}.** Owns: {{DIMENSION_1}}. Authority on
  {{AUTHORITY_AREA_1}}.
- **{{VOICE_NAME_2}}.** Owns: {{DIMENSION_2}}. Authority on
  {{AUTHORITY_AREA_2}}.
- (2–5 voices per concern is the sweet spot; name Standing By
  voices if they may be activated mid-council.)

(Repeat per concern. If concerns share voices but have different
questions, voices may carry confidence across concerns but each
concern gets its own rating event.)

# Conditional sub-councils

If a concern requires {{TRIGGER_CONDITION}} (e.g., "if the clinical-
validity sub-council finds the predicate is over-strict"), run a
{{SUB_COUNCIL_TYPE}} sub-council with these voices:

- **{{SUB_VOICE_1}}.** Owns: {{SUB_DIMENSION_1}}.
- **{{SUB_VOICE_2}}.** Owns: {{SUB_DIMENSION_2}}.
- (etc.)

# Deliverables

## Deliverable 1 — {{CONCERN_1}} council report
- Per-option table (one row per voice per option):

  | Option | Voice | FOR% | AGAINST% | UNRESOLVED% | What would change my mind (FOR) | What would change my mind (AGAINST) | Verdict |
  |--------|-------|------|----------|-------------|---------------------------------|-------------------------------------|---------|

- Round-over-round shift table: any voice×option pair with ≥15pt
  delta; named cause or "UNNAMED — flag" per row
- Question log: inter-member questions asked / answered; user
  questions asked / answered
- Combined recommendation with overall confidence and an honest
  list of unresolved questions
- Score honesty check (score spread vs. expected + shift audit +
  question resolution count)
- Coupling notes for {{ADJACENT_CONCERNS}} if any items intersect

## Deliverable 2 — {{CONCERN_2}} council report
- {{Sub-deliverables as appropriate, e.g., 2a clinical sub-council,
  2b implementation sub-council}}
- Score honesty check

## (Additional deliverables as needed.)

# Constraints

- Cite {{FILE_PATH}}:line for every claim about current behavior.
- Do not propose changes that violate invariants documented in
  {{PROJECT_INVARIANTS_DOC}} ({{LIST_KEY_INVARIANTS}}).
- "{{REOPENS_TAG}}" any recommendation that revisits a prior
  council's merged decision.
- "spawn_task candidate: <short>" for adjacent findings outside scope.
- This prompt should run in one pass — do not ask clarifying
  questions; proceed with the most defensible interpretation and
  flag ambiguities as honest residual at the end.
- {{ADDITIONAL_PROJECT_CONSTRAINTS}}
```

---

## Worked example

For a concrete example of this template in use — including the per-asymmetry table, the option branching, the score honesty check, and a conditional implementation sub-council — see the **PR-G commit message** (`git log`, search for the ID vs GDD predicate split). The `docs/branching-logic.md` §11.14 / §11.15 entries record only the resulting current-state invariants, not the deliberation that produced them — by design, since §11 is a fragile-areas inventory, not a changelog.

## Patterns worth keeping

- **Concrete enumeration over vague qualifiers.** "BIF branching is underpowered" produces guesswork; "BIF has no severity tiers, no auto-bridge, no priorExternal attribution, etc." produces verdicts.
- **FOR/AGAINST/UNRESOLVED symmetry.** Scoring only the winning direction hides the magnitude of dissent. Requiring all three forces each voice to quantify what it's actually worried about, making low-confidence unanimity distinguishable from high-confidence consensus.
- **A "what would change my mind" line per direction.** Requiring one for FOR and one for AGAINST forces the voice to engage with specific observables in both directions — not just the side it believes. (The clinical shape of the question: what finding would make you abandon this diagnosis?)
- **2-point spread across a voice's FOR ratings.** Forces real ordering; no two FOR ratings can be within 2% of each other across rounds and options.
- **Inter-member questions.** "I don't know" as UNRESOLVED without a named question is an abstention. Requiring a specific addressable question either resolves the uncertainty (UNRESOLVED moves) or surfaces a genuine gap the real world needs to close.
- **Position-shift naming.** A ≥15-point shift between rounds that is un-named is a red flag for social pressure or anchoring. Named causes create an audit trail for why the council moved.
- **Declare the expected score spread upfront.** Knowing roughly what % of ratings should land in each bucket catches anchoring (too pessimistic / too optimistic) before it ships.
- **Conditional sub-councils.** Don't spend implementation-council tokens on questions that resolve "no change needed" upstream.
- **`clinical-council reopens` tag.** Any recommendation that revisits a prior merged decision should be flagged explicitly in the commit, so future you can audit which decisions have been re-litigated and why.
- **REVERSAL marker on the superseded entry.** Whenever a council reverses a prior decision documented in `docs/branching-logic.md`, append a marker directly under the superseded entry's heading: `> **REVERSED YYYY-MM-DD** — see entry "[Title]" for the current decision. Reason: [one sentence].` This is the backward-pointer companion to the `clinical-council reopens` tag — together they make the audit trail navigable from either end, so a reader who lands on the superseded entry learns immediately that it's no longer in force. See branching-logic.md "How to read this doc" for the full convention.
- **One-pass execution.** Pause-for-clarifying-questions kills momentum and produces less honest councils than a single pass with residuals flagged at the end.

## Patterns to avoid

- **Voices that share dimensions without intent.** If two voices both "own" clinical validity without a reason for their disagreement to be the signal, you'll get consensus drift.
- **Threshold below 90%.** Anything lower stops being a council and starts being a vote.
- **Skipping the score honesty check.** Inflation creeps in fast. The check is cheap.
- **Method jargon in user-facing output.** "Tree-of-thought," "falsifier," "calibration," Greek-letter option names — these are process words for the machinery, not for the reader. The Plain-language rule in the protocol maps each to its plain name; if a new mechanism gets added, name it in plain English from day one.
- **Anonymous large shifts.** If a voice moves ≥15 points between rounds without explaining why, assume social pressure rather than epistemic movement until proven otherwise. The shift-naming rule makes this visible.
- **Stalling on unanswered user questions.** A voice may ask the user for real-world data. If the user does not answer within the round, the council proceeds with its unresolved questions stated honestly — it may not collapse UNRESOLVED to 0 by assumption or defer indefinitely.

## Terminology note (2026-07-16)

Council records before this date use the original method jargon; the mechanisms are identical, only the reader-facing names changed (ratified at David's request — the reader is a physician, and the process vocabulary was leaking into outputs):

| Old records say | Current name |
|---|---|
| falsifier | "what would change my mind" line |
| tree-of-thought (branching) | option branching |
| calibration self-check | score honesty check |
| pre-committed distribution | expected score spread, declared upfront |
| residual(s) | unresolved questions |
| scaffold | council plan |
| synthesis (σ) | combined recommendation |
