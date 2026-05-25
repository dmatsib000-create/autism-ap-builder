# Intake prompt template

Standing protocol for surfacing the questions whose answers will most change what Claude produces. Designed to scale — does little for small asks, runs full intake for non-trivial ones.

## When to use this

- Non-trivial requests where the deliverable shape depends on choices Claude shouldn't make alone.
- Anywhere a wrong assumption would cost more than asking one clarifying question.
- Project-shape decisions (architecture, layout, dependencies) before any file is written.

## When NOT to use this

- Single-line bug fixes with one obvious diagnosis.
- Renames, copyedits, reading a file, running a verification.
- Tasks where you've already given the equivalent answers earlier in the conversation.
- Anything where running the protocol takes longer than the task itself.

## How to use it

1. Paste the prompt below at the top of a new conversation, OR rely on the CLAUDE.md trigger to invoke it for non-trivial requests.
2. Let Claude run the four phases. Phase 4 (working assumptions) runs whether or not questions are asked — that's the redirect surface you want even when no clarification is needed.
3. If Claude asks too many questions, the protocol is misfiring — tell it to drop to its fallback interpretation and proceed. The skip clause exists for that.

---

## The template

```
Before you build, change, or recommend anything for this request, run
the intake protocol. The goal is to surface the questions whose answers
will most change what you produce — not to interrogate me.

## Phase 1 — Look before you ask

Read what's already in front of you: project files, conventions
(CLAUDE.md), my standing memory, recent commits in the affected area,
anything I cited or linked. Answer to yourself: what is the smallest,
most defensible interpretation of this request that you could act on
right now? Hold that — it's your fallback if I tell you to proceed
without answering.

## Phase 2 — Sort the unknowns

For everything you'd otherwise guess at, sort into:

- **Decision-forcing.** Different answers produce visibly different
  deliverables. (Scope boundary, format, which of two reasonable
  patterns, how to handle a known edge case.)
- **Inferable.** State the inference and move on. ("I'm taking 'fix
  this' to mean the deselect bug we just discussed — say if I'm
  wrong.")
- **Nice to know.** Drop. Don't ask.

## Phase 3 — Ask the decision-forcing ones, well

Each question must:

1. Name the decision it forces. ("This affects whether the helper
   lives inline or as a util.")
2. Offer 2-4 concrete options. Free-text only when options genuinely
   don't fit, and say why.
3. Be answerable without me re-reading the codebase — quote the
   file:line or paste the snippet if my answer depends on it.
4. Be ranked by impact. If I bail after question 1, you still got
   the most important thing.

Cap at the smallest number that matters. Three sharp questions beats
seven mediocre ones.

Anti-pattern to avoid: "What's your priority — speed, simplicity, or
correctness?" Phrased that way, every answer is "all three." The
better form names the actual trade in the codebase: "The status-row
handler can either re-fire syncTherapyStatusFromActivity on every
click (slower, simpler) or diff against last state (faster, more
code). Which do you want?"

## Phase 4 — Declare your working assumptions

Whether or not you ask questions, list the assumptions you'll proceed
on if I say "go." Phrase each as: "Assuming X. If wrong, the right
move is Y." This lets me redirect without you having to ask.

## When to skip the protocol entirely

- Spec is already precise.
- Task is small enough that asking costs more than getting it slightly
  wrong once. (Single-line bug fixes with one diagnosis, renames,
  copyedits, reading a file.)
- I've answered the equivalent questions earlier in this conversation.

If you skip, say so in one line: "Skipping intake — [reason]."
```

---

## Patterns worth keeping

- **Phase 1 forces homework before asking.** The dominant failure mode of "ask clarifying questions" prompts is that Claude asks about things visible in the code. Requiring a defensible-interpretation fallback before any question is allowed kills that.
- **Three buckets, not one.** Decision-forcing / inferable / nice-to-know split eliminates 60% of the noise. Inferable ones get stated and moved past; nice-to-know gets dropped entirely.
- **Forced-choice questions over open-ended.** Open-ended questions take work to answer and produce worse signal. The anti-pattern example uses a real function from `autism-ap-builder.html` so the model sees the concrete shape rather than the abstract rule.
- **Ranked questions with bail-out logic.** If you answer one and skip the rest, the most important answer is the one you gave. Caps "interrogation" feel.
- **Working assumptions run even when no questions are asked.** Highest-leverage move in the whole protocol — gives you a redirect surface without requiring a question round-trip.
- **Skip clause has teeth.** Three concrete skip conditions plus a one-line announcement. Without this, the protocol becomes a tax on every interaction.

## Patterns to avoid

- **Asking permission to start.** "Should I run the intake protocol?" is itself a meta-question that violates the protocol. Either run it or skip it with the one-liner.
- **Mechanical questionnaires.** If you find yourself asking the same three questions on every non-trivial request, the protocol is misfiring — the questions should come from this codebase, not a template.
- **Open-ended "what's your vision" questions.** Always reformulate as forced-choice on a specific trade visible in the code.
