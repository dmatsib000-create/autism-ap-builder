# Council prompt template

Reusable scaffold for structured multi-voice deliberation prompts. Drop in the placeholders (`{{LIKE_THIS}}`), keep the protocol, and you'll get the same disciplined output style the project has been using for PR-A through PR-G.

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
6. Set `{{MAX_ROUNDS}}` to 3–5. Past 5, you're either anchored or the question is genuinely hard and needs a falsifier from the real world, not more deliberation.
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

**Voice ownership** — each voice OWNS one evaluation dimension.
Other voices may comment but the rating belongs to the owner. No
two voices own overlapping dimensions, UNLESS the disagreement
between voices sharing a dimension is itself the signal (e.g., two
clinical perspectives that may diverge).

**Per-rating discipline** (every voice every round):
1. Rating 0–100%
2. {{RATIONALE_WORD_COUNT}} word reasoning
3. Required falsifier: "I would lower this rating by 10+ points if
   I observed: [specific observable thing]." Vague falsifiers
   indicate the voice didn't engage; restate with concrete
   observable.
4. Confidence anchoring: no two of a voice's ratings (across rounds
   and across options) may be within 2 percentage points of each
   other.

**Tree-of-thought structure** — at each decision point, voices
propose multiple options (not just react to a single proposal),
evaluate each, and prune. Each option gets its own confidence
rating. Final recommendation is the highest-confidence surviving
option.

**Iteration**:
- Minimum 2 rounds per concern.
- Round 2+ re-examines any voice <{{THRESHOLD}}% OR any cross-voice
  disagreement on a SHARED observation.
- Stop when: all voices ≥{{THRESHOLD}}% on the final option AND
  calibration check passes, OR {{MAX_ROUNDS}} rounds (submit honest
  residual).
- Do NOT inflate confidence to hit thresholds. Low confidence with
  defensible reasoning > high confidence built on consensus drift.

**Calibration self-check at the end of each council**: report the
distribution of ratings against expected (~{{EXPECTED_HIGH}}% at
≥95%, ~{{EXPECTED_MID}}% at 85–94%, ~{{EXPECTED_LOW}}% at <85%
across ~{{TOTAL_RATINGS}} ratings). If skewed, name where and
re-audit the affected ratings.

# Concern 1 voices

- **{{VOICE_NAME_1}}.** Owns: {{DIMENSION_1}}. Authority on
  {{AUTHORITY_AREA_1}}.
- **{{VOICE_NAME_2}}.** Owns: {{DIMENSION_2}}. Authority on
  {{AUTHORITY_AREA_2}}.
- (Add more if needed; 2–5 voices per council is the sweet spot.)

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
- Per-option (or per-item) table: rating per voice, falsifier
  per rating, verdict
- Final synthesis with combined confidence
- Calibration self-check
- Coupling notes for {{ADJACENT_CONCERNS}} if any items intersect

## Deliverable 2 — {{CONCERN_2}} council report
- {{Sub-deliverables as appropriate, e.g., 2a clinical sub-council,
  2b implementation sub-council}}
- Calibration self-check

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

For a concrete example of this template in use — including the per-asymmetry table, the tree-of-thought option branching, calibration self-check, and conditional implementation sub-council — see the commit message and `docs/branching-logic.md` §11.14 / §11.15 entries from PR-G.

## Patterns worth keeping

- **Concrete enumeration over vague qualifiers.** "BIF branching is underpowered" produces guesswork; "BIF has no severity tiers, no auto-bridge, no priorExternal attribution, etc." produces verdicts.
- **Required falsifier per rating.** Forces the voice to engage with a specific observable rather than hand-waving.
- **2-point spread across a voice's ratings.** Forces real ordering; no two ratings can be within 2% of each other across rounds and options.
- **Pre-committed distribution.** Knowing roughly what % of ratings should land in each bucket catches anchoring (too pessimistic / too optimistic) before it ships.
- **Conditional sub-councils.** Don't spend implementation-council tokens on questions that resolve "no change needed" upstream.
- **`clinical-council reopens` tag.** Any recommendation that revisits a prior merged decision should be flagged explicitly in the commit, so future you can audit which decisions have been re-litigated and why.
- **One-pass execution.** Pause-for-clarifying-questions kills momentum and produces less honest councils than a single pass with residuals flagged at the end.

## Patterns to avoid

- **Voices that share dimensions without intent.** If two voices both "own" clinical validity without a reason for their disagreement to be the signal, you'll get consensus drift.
- **Threshold below 90%.** Anything lower stops being a council and starts being a vote.
- **Skipping calibration self-check.** Inflation creeps in fast. The check is cheap.
- **"Tree-of-thought" as a buzzword.** Define what it means operationally in the prompt (branch multiple options at decision points, evaluate each, prune) or drop it.
