# §4 Functional Need Domains — validity review & roadmap

**Status:** roadmap — **Units 1, 2, 3, 4-C2 implemented 2026-06-02; Unit 5 implemented 2026-06-06; Unit 6 implemented 2026-06-12** (Unit 1 D1/D2 ABA-sync fixes; Unit 2 motor split + hypotonia→PT; Unit 3 clarity relabels; Unit 4 C2 OT/PT co-management line; Unit 5 academic→psychoeducational-eval auto-recommendation; Unit 6 fecal-smearing feature); Unit 4-E2, Unit 7 pending · **Reviewed:** 2026-06-02 · **Scope:** the §4 Functional Need Domains section of [`autism-ap-builder.html`](../autism-ap-builder.html) — validity/completeness of the input items in each domain, and the output text those inputs drive (needs-summary prose + therapy-rule + plan/letter text).

This is a point-in-time **review record**, not a re-runnable procedure (contrast `docs/audits/`). It captures a four-pass clinical-design council and the implementation roadmap it ratified. Source references use the house `file:line` convention (e.g., `autism-ap-builder.html:5952`); `§N` references point to `branching-logic.md`. Implemented units are marked ✅ in the roadmap above; everything unmarked is the agreed plan of record, not yet built.

---

## TL;DR — ratified roadmap (sequenced by clinical stakes)

The council's headline finding: the two highest-value defects are **output-logic errors in the ABA-target sync, not input-label problems** — checking a behavior today can produce the *wrong* ABA target, invisibly. Those lead.

| # | Unit | Contents | Golden? | branching-logic.md | Effort |
|---|---|---|---|---|---|
| **1** ✅ | **ABA-sync logic fixes** (highest stakes) — **DONE 2026-06-02** | **D1** added `instructional_control` ABA target; `noncompliance` now maps to it and no longer adds `reduce_stereotypy`. **D2** `reduce_stereotypy` gated to `b1` + `vocalDisruption` only; **D3** FBA-function note added. Locked by 4 new unit-lane cases. | Yes (golden unchanged — sync is DOM-only) | §9.2 updated | done |
| **2** ✅ | **Motor validity** — **DONE 2026-06-02** | **C1** split "Gross motor delays / hypotonia" → "Gross motor delays" + "Hypotonia / low muscle tone" (new `needsMotor` Set value, not a scalar); `hypotonia` wired into `rulePT` + all 5 `gross`-specific output sites (needs-summary, in-clinic PT, IEP PT goal, `syncSchoolSvc` pt_school); PT-only scope (neuro/genetics deferred). Locked by the `motor-hypotonia-pt` golden fixture. | Yes (1 new fixture; existing goldens unchanged) | §7 updated | done |
| **3** ✅ | **Clarity relabels** — **DONE 2026-06-02** | **A2** `oral_motor` → "Oral-motor / motor speech". **B2** `feeding_adl` → "Self-feeding / utensil use". **E1** `academic` label kept + an honest-pointer field-hint directing to the psychoeducational-eval (School & Educational Supports) and SLD-suspected (Comorbid Conditions) controls. Form-only; no golden change. | No | — | done |
| **4** ◐ | **Output annotations** — **C2 DONE 2026-06-02; E2 deferred** | **C2** ✅ OT/PT co-management line added to the in-clinic PT block (fires on coordination/DCD when OT is also active). Code-review refinement: names "(DCD)" only when the `dcd` comorbidity is set (a bare coordination need is not a diagnosis). Both branches locked: `they-pronoun-broad-prose` (no DCD → bare) + `c2-dcd-comorbid` (DCD → tagged). **E2** deferred — council rated it KEEP-only / lowest value; revisit only if the dual criteria-vs-needs listing has actually confused a note reader. | Yes (1 golden updated) | §7 note added | C2 done |
| **5** ✅ | **Scheduled follow-up** — **DONE 2026-06-06** | Academic **Option B** implemented: `S.academic` (preschool and up) now routes to the `psychoed` school eval via `syncSchoolSvcFromNeeds`, deduped through the `schoolSvc` Set with the suspected-SLD and hyperlexia triggers; surfaces in the note School block + IEP letter. Toddlers excluded (Part C, not Part B). The academic-*ABA*-target FAPE gate is preserved untouched. Auto-checks the §7 psychoed box with an "auto" badge (the `ld_suspected` pattern). Locked by 6 new unit-lane cases + the `academic-psychoed` golden (note + IEP). | Yes (1 new fixture; existing goldens unchanged) | §10.9 added; §9.2 + §1.4 cross-refs | done |
| **6** ✅ | **New feature — fecal smearing (scatolia)** — **DONE 2026-06-12** | §4 Behavior checkbox `smearing` + conditional `smearWorkup` sub-option (suspected / ruled out / unclear); dedicated medical-first GI referral routed through the existing `gi` override key — **suppressed when the medical cause is ruled out** (no new override, no invariants-code change); `reduce_smearing` ABA target across all 4 tables (Tier-2, not a Behavior of Danger — no pica emergency language); audience-tailored output (note + ABA letter name it clinically; IEP letter stays discreet — "toileting and hygiene support"). Locked by `smearing-suspected` (note+ABA+IEP) and `smearing-ruled-out` (note, GI suppressed) goldens; browser-verified reveal + suppression + cleanup. Design council 2026-06-02 — see "Unit 6" below. | Yes (2 new fixtures; existing goldens unchanged) | §7.2 / §9.2 / §10.6 updated | done |
| **7** | **Toddler scoping** | Early Steps wording "under 34 months" → "under 36 months" + generic promptness caveat (1B); a Part C→Part B transition-timing sentence for all toddlers; suppress school-based-service output for toddlers (incl. gating `syncSchoolSvcFromNeeds` on `!toddler`); hide §7 School section for toddlers with dynamic visible-folio renumbering. Designed + confirmed by a separate council 2026-06-02 (Q4 verified nothing reads folio numbers) — see "Unit 7" below. | Yes | §12 | Med |

**Deferred — David's call:** **C4** add toe-walking / gait item (clinically real; scope vs. neurology-overlap tradeoff). **Keeps (ratified, no change):** B1 sensory model, D4 `boundaryViol` dual-home, E3 pragmatics stays in Social/Play, E4 `emotionalReg` placement.

**Bundling rule (Ruling 4):** never mix golden and no-golden changes in one commit — keeps each `npm run test:update` diff legible (the project's existing discipline).

---

## How to read this

- **Verdict tags:** **SHIP** (ratified change), **KEEP** (reviewed, no change), **FOLD** (merged into another finding), **DEFER** (David's call).
- A finding's ID encodes its concern: A=Communication/SLP, B=Sensory+FineMotor+Adaptive/OT, C=Motor/PT, D=Behavior/BCBA-D, E=Social+Regulatory/Psychologist.
- "Output text" = the three places a §4 input surfaces: the needs-summary line (`needsSummaryLines`, `autism-ap-builder.html:2480`), the therapy-rule gates (`rule*`, ~`autism-ap-builder.html:2076`), and the plan/letter prose (~`autism-ap-builder.html:3000`, ~`:4300`).

---

## The two headline defects (Unit 1)

Both live in `syncABATargetsFromNeeds()` (`autism-ap-builder.html:5952`) and are invisible to the user because they silently alter the ABA-target set.

### D1 — `noncompliance` has no target, and mis-fires stereotypy
`noncompliance` (`autism-ap-builder.html:1266`) is a listed interfering behavior and appears in the ABA medical-necessity rationale (`:2836`), but the sync map (`:5962–5981`) has **no compliance / instructional-control target** for it — a core ABA target is simply missing. Worse, because the stereotypy trigger is `needsBehavior.size>0`, checking `noncompliance` *adds* `reduce_stereotypy`. A note that lists noncompliance as a need but generates a stereotypy target and no compliance target is an internal inconsistency a reviewer would catch.
**Verdict: SHIP.** Add a compliance/instructional-control target; remove `noncompliance` from the stereotypy path.

### D2 — `reduce_stereotypy` over-fires
The trigger `S.criteriaB.has('b1')||S.needsBehavior.size>0||S.needsBehavior.has('vocalDisruption')` (`autism-ap-builder.html:5978`) means **any** interfering behavior (aggression, elopement, SIB…) auto-adds a stereotypy-reduction target. Aggression alone should not generate stereotypy treatment.
**Verdict: SHIP.** Gate to `b1` (repetitive movements/speech) + `vocalDisruption` only. **D3 folded in:** add a note that `vocalDisruption`'s function (stereotypy vs. communicative/attention-maintained) is an FBA determination.

---

## Per-domain findings

### Concern A — Communication (SLP)
- **A1 (resolved):** pragmatic/social-communication is split across out-of-§4 language modifiers and Social/Play (`conversation`, `reciprocity`). **Verdict: KEEP** — Social/Play is the functional-needs home for pragmatics; adding a Communication item would triple-code. (See E3.)
- **A2: SHIP (relabel).** `oral_motor` (`autism-ap-builder.html:1233`) "Oral motor / feeding-related speech" conflates speech motor and feeding; the plan text already separates them (`:3020–3027`). Relabel → "Oral-motor / motor speech" to match.

### Concern B — Sensory + Fine Motor + Adaptive (OT)
- **B1: KEEP.** The four-way sensory model (hyper/hypo/seeking/avoidance, `autism-ap-builder.html:1290–1293`) is clinically standard and drives a correct OT eval block (`:3036`).
- **B2: SHIP (relabel).** `feeding_adl` "Mealtime / self-feeding" (`autism-ap-builder.html:1242`) reads as feeding-disorder overlap; it is an adaptive motor skill feeding `self_help` (`:5968`). Relabel → "Self-feeding / utensil use".

### Concern C — Motor (PT)
- **C1: SHIP.** "Gross motor delays / hypotonia" (`autism-ap-builder.html:1300`) is one checkbox for two constructs; `gross` drives `rulePT` (`:2089`) but hypotonia (which independently warrants PT) is buried. Split into two items; wire `hypotonia` into `rulePT`.
- **C2: SHIP (annotation).** DCD/`coordination` is co-managed by OT (praxis/fine-motor) and PT (gross-motor); both rules include it (`autism-ap-builder.html:2088–2089`). Add one output line clarifying the coordination roles. *(Ruling 3: dual referral is correct, not redundant.)*
- **C4: DEFER.** Add toe-walking / gait item — clinically real, but scope vs. neurology-overlap is David's call.

### Concern D — Behavior / Interfering (BCBA-D)
- **D1, D2, D3:** see headline defects above (Unit 1).
- **D4: KEEP.** `boundaryViol` is dual-homed (behavior + drives `ruleSocialSkills` `autism-ap-builder.html:2079` + psychiatry `:2073`); the placement is defensible — it is a behavior with social/safety dimensions.

### Concern E — Social/Play + Regulatory/Behavioral (Psychologist)
- **E1 → see academic (Pass 3).** Reframed from "weakly wired" to **missed-FAPE-trigger**.
- **E2: SHIP (note).** `reciprocity` + `perspective`/ToM (`autism-ap-builder.html:1280–1282`) restate DSM-5 Criterion A constructs. Keep them (criteria = diagnostic evidence; needs = treatment targets), add a one-line note distinguishing the two purposes.
- **E3: KEEP (resolves A1).** Do not add pragmatics to Communication; Social/Play is the home.
- **E4: KEEP.** `emotionalReg` in Regulatory/Behavioral is well-wired (`reduce_tantrum` `autism-ap-builder.html:5965`, PCIT, IEP accommodation `:3125`).

---

## The `academic` item (Pass 3 — ESE director)

**Finding:** `S.academic` (`autism-ap-builder.html:1312`) is nearly disconnected from the educational machinery. It drives only the needs-summary line (`:2498`) and a young-only pre-academic ABA target (`:3985`, `:5974`). The rich academic/IEP content — psychoeducational-eval recommendation, IDEA 60-day pathway, SLD eligibility (Florida Rule 6A-6.03018) — is driven by **other** inputs: the `ld_*` comorbidities (`:3608–3635`) and `schoolSvc.has('psychoed')` (`:4562`). So for a school-age child, checking "Academic / learning difficulties" produces **no** psychoed-eval recommendation and **no** IEP content. That is a **missed FAPE trigger**, not just a labeling nit.

**ESE implications:**
1. The single highest-value action a checked academic concern should produce is the **IDEA psychoeducational-evaluation request** (district's 60-school-day obligation), which disambiguates SLD vs. ASD-related academic impact and unlocks eligibility/services.
2. The existing Case-19 gate (`autism-ap-builder.html:3981–3983`) excluding school-age academic ABA targets is **legally correct** — academic instruction is the district's FAPE obligation; billing medical ABA for it is improper cost-shifting and a denial driver. **Preserve it in any change.**
3. Three paths can each recommend a psychoed eval (`academic`-if-wired, `schoolSvc` psychoed, `ld_suspected`) — wiring must **dedupe** to one recommendation.

**Options:** A status quo (dead-end) · B wire → IDEA psychoed pathway · C relabel + cross-reference · D remove. **A and D rejected.**

---

## Adjudication & sequencing (Pass 4 — DBP + full council)

- **Ruling 1 — sequence by clinical stakes, not effort.** D1/D2 lead despite being more work than the relabels: they produce clinically wrong output invisible to the user.
- **Ruling 2 — academic: honest-pointer relabel now, wiring scheduled.** A naive Option C is rejected — a relabel that *implies* the eval is handled would mask the defect. Ship C as an **explicitly honest pointer** ("academic concern — also flag a psychoeducational evaluation and consider LD workup," directing to the existing `schoolSvc` psychoed / `ld_suspected` controls); **schedule Option B** (auto-wire + dedupe) as a focused follow-up. FAPE gate preserved in both.
- **Ruling 3 — OT↔PT coordination:** dual referral stands; annotate (C2).
- **Ruling 4 — bundle by golden-impact** (see roadmap).
- **Ruling 5 — C4 deferred to David.**
- **Ruling 6 — meta-finding:** the highest-value outputs were output-logic defects, not label problems → §4 input validity cannot be judged from labels alone; the input→output trace is mandatory. The "§4 item that is really a pointer to machinery elsewhere" pattern (academic→School/IEP; the already-migrated feeding) is a recurring theme to watch when adding items.

---

## Unit 6 — Fecal smearing (scatolia)  *(separate council, 2026-06-02)*

A new functional-need addition, designed by its own multi-voice council (DBP lead · BCBA-D · Gastroenterology · OT · Autistic parent/community reviewer · Clinical workflow analyst). Grounded against the **pica** wiring as the closest template (input checkbox `autism-ap-builder.html:1270`, `ruleGI` `:2115`, `reduce_pica` target `:5989`, ABA safety clause `:2831`, IEP accommodation `:3123`). PLAN ONLY — not implemented.

**Headline principle: medical-first.** Fecal smearing is *behaviorally expressed but frequently medically driven* — chronic constipation with overflow incontinence / encopresis is a common cause and must be excluded before any behavioral framing. The design makes that sequencing structural, not advisory.

- **Placement (1B) — SHIP.** A checkbox in §4 Behavior/Interfering (where it's observed, paralleling pica), **plus a conditional GI-workup-status sub-option** (constipation/overflow suspected · medical ruled out · unclear) that foregrounds "is this medical?" at the point of entry. Patterned on the existing conditional-reveal sub-options (`socialWorkReasonsRow`, PFD domains, `depressionSafety`), so it costs nothing until the item is checked. *(Rejected: 1C pure-medical-flag underweights the ABA dimension; 1D split doubles the control; 1A bare-checkbox is the fallback if the sub-option is later deemed over-built.)*
- **Branching / referrals (2B+2C) — SHIP.** A **dedicated GI encopresis/constipation/overflow referral** (not generic `ruleGI`) fires whenever smearing is checked, **deduped** with `ruleGI` so GI isn't double-recommended. The sub-option **conditions the framing**: driver = "suspected/unclear" → plan leads with GI workup and softens behavioral language; "ruled out" → behavioral/ABA framing foregrounded. ABA fires concurrently (behavioral support can run during workup); OT sensory is conditional on a sensory-function indication.
- **ABA target (C3) — SHIP.** New `reduce_smearing`, auto-synced from the checkbox, registered across all four parallel tables — **now auto-enforced by the invariants-lane ABA-target guard** (added 2026-06-02), so a partial registration fails `npm test` rather than shipping a raw key. Function-based; rationale explicitly *exclude medical cause first; FBA for sensory/communicative/escape function; non-punitive, skill-building* (the `reduce_pica` rationale `:2892` is the structural template, but **not** its "no safe frequency threshold / medical emergency" clause — clinically wrong for smearing). Label (autistic-parent-owned): **"Reduction of fecal smearing (scatolia); toileting and hygiene skill-building"**; `TL_OLDER` variant "Hygiene independence and self-management."
- **Output & framing (C4) — SHIP.** Note prose, ABA letter rationale, and IEP accommodation all lead medical/communication and preserve dignity. Framed as a **health/hygiene risk** (infection/social), explicitly **not** pica's ingestion-emergency language. Non-stigmatizing throughout — no "disgusting/gross," no willful-misbehavior framing; the behavior is presented as a medical/communication/regulation signal.

**Unit-6 residuals (eyeball on implement):** exact sub-option labels; the GI-dedupe mechanics with `ruleGI`; the final target label. **Tests on implement:** golden fixtures exercising the behavior + each sub-option state; `branching-logic.md` §7/§9 update.

---

## Unit 7 — Toddler scoping  *(separate council, 2026-06-02; clinical questions answered by David)*

Toddlers (under 3) are served under **IDEA Part C** (early intervention / Early Steps), not **Part B** school services / IEP. Three changes align the tool with that boundary. Clinical forks were resolved by David (Q1–Q3); the one design question (folio numbering) was confirmed by a code check (Q4). PLAN ONLY — not implemented.

**1. Early Steps age wording (`autism-ap-builder.html:3092`) — option 1B.** Change "Given developmental concerns and age **under 34 months**" → "**under 36 months**" (Florida Part C eligibility is birth to 36 months; the toddler bucket is 12–35mo, so always under 36). Append a generic promptness caveat: "Referral should be made promptly, as Part C eligibility must be established before the third birthday." Q3: the ~34-month practical cutoff is *soft guidance*, so the caveat names no hard number.

**2. Part C → Part B transition sentence (Q1) — for all toddlers.** Add near the Early Steps block: "Around the third birthday, Early Steps coordinates transition to the local school district for evaluation of Part B (IEP) eligibility; transition planning begins several months before age 3." *Open micro-point:* the Early Steps block only fires for confirmed/suspected — default is to place the sentence there (covers nearly all toddlers); if it should also appear for rule-out toddlers, gate it independently on `ageGroup==='toddler'`.

**3. Suppress school-based-service output for toddlers (fix 1).** Gate the school-based clauses on `ageGroup!=='toddler'`: the SLP/OT/PT "School-based and clinic-based … address different goals" lines (`:3032`, `:3068`, PT equivalent), the "Recommended school-based services:" block (`:3117`), and the concurrent-services note (`:3163`). **Critical coupling:** also gate `syncSchoolSvcFromNeeds` (`:6109` region) on `!toddler` — otherwise it auto-populates `S.schoolSvc` from needs and the school-based output fires anyway despite §7 being hidden. Fix 1 and fix 2 are coupled, not independent.

**4. Hide §7 for toddlers + dynamic folios (fix 2 + option 2B).** Hide the §7 "School & Educational Supports" sec-head/body for toddlers (the IEP output tab is already toddler-gated). Renumber **visible** folios sequentially in `updateSectionHeaders` rather than relying on the static `1…9` text, so toddlers see a contiguous 1–8 with no gap. **Q4 confirmed safe:** nothing reads `.sec-folio` (the dot/summary logic is by `sh-*` id), no generated output or test references a form section by number, and `branching-logic.md`'s `§N` are independent doc anchors. This also future-proofs any later conditional section.

**Unit-7 residuals (eyeball on implement):** exact transition-sentence wording; the rule-out-toddler micro-point above. **Tests on implement:** the `suspected-toddler` golden updates (Early Steps wording + transition line + removal of school-based text) — review the diff; add a toddler assertion that school-based text is absent. **Docs:** `branching-logic.md` §12 (toddler gates + the dynamic-folio mechanism).

---

## Open residuals

- **Scheduled-B timing (resolved 2026-06-06).** The ESE director endorsed the sequencing only on condition that Option B not drift indefinitely; B shipped (Unit 5), so this residual is closed. The honest-pointer field-hint (Unit 3 / E1-C) remains in place as the in-form complement to the auto-wiring.
- **C4 (toe-walking/gait)** awaits David's scope decision.
- **Standing §4-label validation residual.** As with the prior §4/§5 reorg, the relabels (A2, B2, E1-C) carry the same unresolved real-clinician test — they are internally defensible but unvalidated against live use. All are one-line reversible.

---

## Provenance

Four-pass clinical-design council, 2026-06-02, per `docs/templates/council-prompt.md` (95% threshold, falsifier-per-rating, 2-pt spread, tree-of-thought, calibration self-check):

- **Pass 1** — therapy domains: SLP, OT, PT (+ DBP, General pediatrician as leaders; Clinical workflow analyst on friction).
- **Pass 2** — Behavior (BCBA-D), Social/Play + Regulatory (Psychologist).
- **Pass 3** — `academic` options & implications (ESE director owning; DBP/Ped/Workflow adjudicating).
- **Pass 4** — DBP + full-council adjudication, sequencing, and ratification.

No new bibliographic citations were introduced (regulatory references — IDEA, Florida Rule 6A-6.03018 — already exist in `autism-ap-builder.html`), so `docs/references.md` requires no update for this doc. When any roadmap unit is implemented, follow the in-commit update obligations in `branching-logic.md` §12 and the `docs/references.md` rule in `CLAUDE.md`.
