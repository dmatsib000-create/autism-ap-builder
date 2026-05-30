# DBP Autism A&P Builder

A single-file clinical note generator for pediatric autism evaluations. Produces a full Assessment & Plan note, an ABA Letter of Medical Necessity, and an IEP physician letter — all from one set of checkboxes.

**Try it now:** <https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html>

**Reference docs:**

- [Clinician's guide](docs/branching-logic-for-clinicians.html) — plain English; what the tool decides and why, with diagrams and vignettes
- [Technical reference](docs/branching-logic.md) — for maintainers and future Claude Code sessions making code changes

## Why this tool exists

The tool generates a full A&P note, ABA Letter of Medical Necessity, and IEP physician letter in about 15 minutes — three deliverables that, at this level of detail, would otherwise take an hour or more, and that most clinical workflows skip or shortcut entirely. One form on the left; three coordinated outputs on the right, updating in real time as you check boxes. No more staring at a blank Epic note after a 90-minute evaluation visit.

The point isn't only speed. The tool catches the things that are easy to forget after a long visit — DSM-5 specifiers, therapy justifications, referral logic for comorbid presentations, IEP service-specific rationales — and ensures they land in every note that needs them. When all three deliverables come from one shared input, they say the same thing about the same patient, with the same clinical reasoning behind each recommendation.

Across a clinic, that consistency matters. Two clinicians seeing similar patients produce notes built on the same evidence-based rules, which means insurance reviewers see consistent justifications for ABA hours, school districts see consistent rationales for IEP services, and approval rates rise as a result. The tool was built by a general pediatrician at the UF Behavior and Development Clinic to address persistent gaps in autism documentation that Epic SmartForms don't cover and in-Epic AI assistants don't help with.

The tool does not replace clinical judgment, the evaluation itself, or any diagnostic decision-making. It writes up what you decide; it doesn't decide for you.

**Who this tool is for:** developmental-behavioral pediatricians, neurodevelopmental specialists, and general pediatricians practicing in developmental-behavioral clinic settings — clinicians who already perform autism evaluations and write the resulting A&P, ABA medical-necessity, and IEP physician documentation. Clinicians outside that workflow (e.g., a community pediatrician seeing the patient once for a different concern) may not have the standing or scope to send ABA Letters of Medical Necessity or IEP physician letters in their jurisdiction; check your institutional and payer requirements before using the letter outputs in a setting outside specialty developmental clinics.

---

# Part 1 — For clinicians using this tool

## Quick start

A 5-minute walk-through using a worked example. Open the [live tool](https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html) in a separate tab and follow along.

**The patient:** Maya, age 7, new ASD evaluation referred by her pediatrician. Parent reports speech delays since age 2, difficulty with peer interaction in second grade, and ongoing attention/restlessness concerns at school. Currently in general education with no IEP.

![Quick start screenshot — input panel on the left, live note preview on the right](docs/quickstart.png)

### The minimum to produce a complete A&P note

The eight categories below cover the minimum to generate an A&P note without the ⚠ Incomplete badge. Most categories are a single click; the DSM-5 Criteria step (#7) is itself eight individual checkboxes, so the full minimum is closer to 15 clicks.

1. **Patient Profile → Age Group:** *School-age*
2. **Patient Profile → Pronouns:** *She*
3. **Patient Profile → Base Communication Level:** *Conversational* (Maya speaks in full sentences with peers)
4. **Diagnostic Workup → Diagnosis status:** *Confirmed*
5. **Diagnostic Workup → ASD Severity (Social Communication):** *Level 1 — Requiring support*
6. **Diagnostic Workup → ASD Severity (RRB):** *Level 1 — Requiring support*
7. **DSM-5 Criteria Evidence:** check all three A criteria, at least two of four B criteria, and C/D/E
8. **Functional Need Domains:** check at least one need (e.g., *Social → Peer interaction*) — this drives therapy referrals

At this point the A&P Note tab on the right shows a complete clinical summary, DSM-5 criteria table, problem-based plan with auto-triggered therapy referrals (SLP, ABA, social skills group), safety counseling section, and return-to-clinic interval.

### Recommended additions for a polished note

The eight above produce a clinically defensible note. These six additions are what turn it into a complete documentation package:

- **Patient Profile → Cognitive Profile** (e.g., *Average*) — affects the clinical summary and the genetics referral framing
- **Patient Profile → Adaptive Behavior** — captures functional impairment level for the plan
- **Diagnostic Workup → Prior testing reviewed** — entering ADOS-2 / CARS-2 / Vineland-3 outcomes pulls them into the clinical summary and ABA/IEP letters as supporting evidence
- **Comorbid Conditions** — for Maya, you'd check ADHD (suspected) + Language Disorder; each generates its own Assessment & Plan block
- **School & Educational Supports → Documentation status:** *No IEP / 504 — needs evaluation* — unlocks the IEP Letter tab on the right
- **ABA Letter Parameters** (insurance type, requested hours, setting) — populates the ABA Letter with a complete medical-necessity case

### Copy the note into Epic

The A&P Note tab has three buttons in the top toolbar: **Print**, **Copy Plain**, and **★ Copy Rich Text**. For Maya's note, click **Copy Rich Text** → switch to Epic → paste into the note composer; formatting (bold, bullets, section structure) is preserved.

The ABA Letter and IEP Letter tabs each have their own per-tab toolbar with a third option: **Copy for Epic (`***`)**. This copies the letter as plain text with every `{placeholder}` field replaced by `***` Epic cursor stops — once pasted into the Epic note composer, you can Tab through and fill or skip each placeholder. Use this for the letter tabs; use Rich Text for the A&P note.

### If you see ⚠ Incomplete

The DSM-5 Criteria section shows a live badge: ✓ All criteria met when complete, or ⚠ Incomplete with the specific gap (e.g., `A: 2/3 documented`). Almost all incomplete states are missing checks in Criteria A or B. Scroll back to Section 3 and verify all three A criteria are checked and at least two B criteria are checked.

### The other two tabs

The **ABA Letter** and **IEP Letter** tabs activate as their inputs are populated. The ABA Letter tab appears when the ABA referral fires (see the [technical reference](docs/branching-logic.md) §7 for the full trigger list — it's needs-driven, not gated on diagnosis status alone) or is manually included via the Adjust Referrals override pills. The IEP Letter tab appears when school documentation status is set and the patient is not a toddler. Both tabs use the same one-form-three-outputs model — you don't enter anything separately, the letters auto-generate from the same checkboxes that drove the A&P note.

## What you get

One form on the left produces three coordinated outputs on the right. You don't enter anything separately for the ABA Letter or IEP Letter — they're derived from the same state that drives the A&P note.

| Output tab | What it contains | When the tab appears |
|---|---|---|
| **A&P Note** | Clinical summary (auto-generated narrative covering age, visit type, language, cognitive profile, DSM-5 status, severity levels, prior testing, specifiers); DSM-5 criteria table with evidence text; problem-based plan including therapy referrals with clinical rationale, medical referrals (genetics with AMA-cited guideline framing, neurology, audiology, GI, etc.), safety counseling, anticipatory guidance, and return-to-clinic interval | Always visible |
| **ABA Letter** | Pre-filled medical-necessity intro paragraph; diagnosis statement with DSM-5 specifiers and severity level (uses max of Social Communication and RRB so highest support need drives authorization); requested weekly hours; recommended setting(s); treatment targets each with a one-sentence clinical rationale; authorization period and therapist signature block | When the ABA referral fires (needs-driven, not gated on diagnosis status alone; see the [technical reference](docs/branching-logic.md) §7) or is manually included via the Adjust Referrals override pills |
| **IEP Letter** | IDEA-branch-appropriate opening (initial evaluation request / amendment / 504 upgrade / rule-out evaluation support); diagnosis statement with DSM-5 specifiers and severity; educational impact bullets; one rationale paragraph per requested school service; accommodation list; statutory citations (IDEA §300.301 / §300.302 / §300.324) | When school documentation status is set AND age group is not toddler (toddlers route through Early Steps, not K-12 IDEA) |

> *To see concrete output, open the [live tool](https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html) and work the quick-start example above — it's faster and always current than any sample pasted here.*

## What this tool does not do

A few boundaries to know before you rely on the output. Read this section before sending any letter to a school district, ABA agency, or insurance reviewer.

- **Doesn't make clinical decisions or replace the evaluation itself.** The tool writes up decisions you've already made — diagnostic determination, severity assignment, comorbidity recognition, therapy choice. History-taking, observation, examination, and clinical judgment remain yours; the tool has no role in any of those.

- **Doesn't verify ICD-10 codes, billing codes, dates, or signatures.** Always verify these against your encounter and your institution's billing requirements before submission. The codes embedded in the output are clinically accurate but not validated for your specific payer or visit type.

- **Doesn't guarantee insurance or school approval.** The tool provides guideline-aligned justification language for ABA Letters of Medical Necessity and IEP physician letters; approval still depends on the reviewing payer or school district. Strong documentation reduces denial rates but does not eliminate them.

- **Doesn't auto-update cited guidelines.** Citations (e.g., AAP 2025 genetics evaluation guidance, Srivastava 2019 consensus statement) are accurate as of the date the tool was authored. Always verify currency before letters go out — guidelines change, and the tool will not warn you.

- **Doesn't save your inputs between sessions.** The form is stateless by design (no PHI is stored or transmitted). Closing the browser tab discards everything. Copy your outputs into Epic *before* closing the tab.

- **Doesn't integrate with Epic or any other EMR.** Copy-paste is manual. The Copy for Epic (`***`) button produces Epic SmartText-compatible output with Tab-navigable cursor stops, but the paste itself is a manual step.

- **Doesn't cover every neurodevelopmental presentation.** Focused on autism evaluations with common comorbidities (ADHD, anxiety, depression, OCD, trauma, language disorder, SLDs, sleep, GI, PFD/ARFID, epilepsy, ID/GDD, catatonia). Less common comorbidities (Fragile X, Rett, Tourette's, etc.) are not yet in the checkbox lists — note them manually in the relevant free-text fields.

## Deploying in your clinic

Two paths. The first is recommended for almost everyone.

### Option A — Use the live URL (recommended)

Open the [live tool](https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html) and use it. No install, no sign-up, no account. The page is a single static HTML file served from GitHub Pages.

**What this means for PHI:** the entire tool runs locally in your browser. There is no backend, no telemetry, no analytics, no third-party fetches, no data ever sent off your machine. The patient information you enter exists only in the open browser tab and is gone the moment you close it. You can use it offline by saving the page (`Ctrl+S` → "Webpage, Complete") and opening the saved file later.

UF-specific references (CARD center contact info; "UF Behavior and Development Clinic" in the IEP letter signature) will appear in your output as written. For most outside clinicians using the tool occasionally, this is acceptable — you can simply edit them out of the copied output before pasting into your EMR.

### Option B — Fork and host your own copy

For clinics that want to customize the UF-specific references at the source, brand the tool for their institution, or host on their own domain.

> **Licensing note:** the repository does not currently have an explicit open-source license. Outside clinicians are welcome to use the live URL (Option A) freely. If you want to fork, modify, or redistribute the source, please [open a GitHub Issue](https://github.com/dmatsib000-create/autism-ap-builder/issues) first to discuss — licensing intent will be formalized as adoption grows.

If licensing is sorted, the technical setup for a self-hosted GitHub Pages copy:

1. **Fork the repo.** Sign in to GitHub, navigate to <https://github.com/dmatsib000-create/autism-ap-builder>, click the **Fork** button (top right). This creates a copy under your own GitHub account.
2. **Enable GitHub Pages.** In your forked repo, go to **Settings → Pages** (left sidebar). Under "Build and deployment," set Source to **Deploy from a branch**, Branch to **main**, folder to **/ (root)**. Click Save.
3. **Wait for the build.** GitHub Pages typically deploys in about a minute. Refresh the Pages settings page until you see "Your site is live at https://YOUR-USERNAME.github.io/autism-ap-builder/".
4. **Visit your copy** at `https://YOUR-USERNAME.github.io/autism-ap-builder/autism-ap-builder.html`. It's now yours to customize.
5. **Customize UF-specific references.** Open `autism-ap-builder.html` in any text editor and search for `card.ufl.edu`, `(352) 273-0517`, and `UF Behavior and Development Clinic`. Replace each with your institution's equivalents. Commit and push; the live copy updates automatically on next deploy.

### Reporting bugs or requesting features

[GitHub Issues](https://github.com/dmatsib000-create/autism-ap-builder/issues) is the channel for both — bug reports, feature requests, and adoption questions. PRs welcome from forks once licensing is formalized.

<!-- AI MAINTENANCE NOTE: This section's UF customization list (CARD contact info, IEP letter signature line) reflects the touch-points as of May 2026. When new UF-specific references are added elsewhere in autism-ap-builder.html, the Option B customization step above should be updated. Search the file for "UF", "Florida", "Gainesville", and "card.ufl.edu" to verify the list is current. -->


---

# Part 2 — Reference for maintainers and power users

## Glossary

Quick decoder for the acronyms and short forms used in the rest of this document. Florida-specific items are flagged because outside-Florida adopters will need to substitute local equivalents.

**Diagnostic frameworks and codes**
- **DSM-5** — Diagnostic and Statistical Manual of Mental Disorders, 5th edition (APA)
- **ICD-10** — International Classification of Diseases, 10th revision (WHO billing codes)
- **AAP 2025** — American Academy of Pediatrics 2025 clinical report on genetic evaluation of GDD/ID
- **Srivastava 2019** — Srivastava et al., 2019 consensus statement on exome sequencing as first-tier NDD testing

**Severity / DSM-5 specifiers**
- **SC** — Social Communication (DSM-5 ASD severity domain)
- **RRB** — Restricted/Repetitive Behaviors (DSM-5 ASD severity domain)
- **ID** — Intellectual Disability
- **GDD** — Global Developmental Delay (DSM-5 placeholder diagnosis for children under 5)
- **BIF** — Borderline Intellectual Functioning (IQ ~70–84)

**Therapy approaches**
- **ABA** — Applied Behavior Analysis
- **EIBI** — Early Intensive Behavioral Intervention (early-childhood ABA service model)
- **NDBI** — Naturalistic Developmental Behavioral Intervention
- **PCIT** — Parent-Child Interaction Therapy
- **SLP / OT / PT** — Speech-Language Pathology / Occupational Therapy / Physical Therapy
- **AAC** — Augmentative and Alternative Communication

**Comorbidities and clinical conditions**
- **ARFID** — Avoidant/Restrictive Food Intake Disorder
- **PFD** — Pediatric Feeding Disorder
- **DCD** — Developmental Coordination Disorder
- **SLD** — Specific Learning Disorder
- **OCD** — Obsessive-Compulsive Disorder
- **SIB** — Self-Injurious Behavior
- **ESES** — Electrical Status Epilepticus during Sleep
- **Landau-Kleffner syndrome** — acquired epileptic aphasia with EEG abnormalities

**Behavior intervention terms**
- **FBA** — Functional Behavior Assessment
- **BIP** — Behavior Intervention Plan
- **BCBA-D** — Board Certified Behavior Analyst with Doctoral designation
- **Behaviors of Danger** — clinical category for SIB, aggression, elopement, and pica (used in ABA letter prose to flag behaviors warranting immediate function-based BIP)
- **Tier 2 interfering behaviors** — tantrums, noncompliance, property destruction, disruptive vocalizations (non-emergent behaviors that interfere with function but aren't immediate dangers)

**Other**
- **AMA-style citation** — formatting convention from the American Medical Association Manual of Style; uses superscript numerical markers in prose and a numbered reference list (distinct from "AMA" as in "against medical advice")
- **SPED** — special education / specialized academic instruction (school-based service category)
- **NAMI** — National Alliance on Mental Illness (caregiver mental-health support resource referenced in Family Resources output)
- **SmartText / SmartForms** — Epic terminology for reusable text templates with cursor-stop navigation (the `***` Epic copy format produces SmartText-compatible output)

**Educational / IDEA**
- **IDEA** — Individuals with Disabilities Education Act (U.S. federal law governing special education)
- **IEP** — Individualized Education Program
- **504** — Section 504 of the Rehabilitation Act (accommodations plan, less formal than IEP)
- **FAPE** — Free Appropriate Public Education (IDEA core entitlement)
- **ESY** — Extended School Year services
- **ESE** — Exceptional Student Education (Florida's term for special education)

**Assessment instruments**
- **ADOS-2** — Autism Diagnostic Observation Schedule, 2nd ed.
- **CARS-2** — Childhood Autism Rating Scale, 2nd ed. (ST = Standard, HF = High-Functioning forms)
- **ADI-R** — Autism Diagnostic Interview, Revised
- **ASD-PEDS** — Autism Spectrum Disorder–Pediatric Evaluation of Developmental Status
- **MIGDAS-2** — Monteiro Interview Guidelines for Diagnosing the Autism Spectrum, 2nd ed.
- **SRS-2** — Social Responsiveness Scale, 2nd ed.
- **GARS-3** — Gilliam Autism Rating Scale, 3rd ed.
- **RITA-T** — Rapid Interactive Screening Test for Autism in Toddlers
- **Vineland-3** — Vineland Adaptive Behavior Scales, 3rd ed.
- **ABAS-3** — Adaptive Behavior Assessment System, 3rd ed.
- **SIB-R** — Scales of Independent Behavior, Revised
- **DABS** — Diagnostic Adaptive Behavior Scale
- **BASC-3** — Behavior Assessment System for Children, 3rd ed.
- **Conners 4** — Conners Comprehensive Behavior Rating Scales, 4th ed. (ADHD screening)
- **KBIT-2R** — Kaufman Brief Intelligence Test, 2nd ed. Revised (cognitive screener — not sufficient for DSM-5 ID diagnosis)
- **QbTest** — Quantified Behavior Test (FDA-cleared objective ADHD measurement)

**Florida-specific resources** (substitute local equivalents if deploying outside Florida)
- **UF CARD** — University of Florida Center for Autism and Related Disabilities (caregiver support, training, community resources)
- **APD** — Agency for Persons with Disabilities (Florida — Medicaid waiver and community support)
- **Early Steps** — Florida's IDEA Part C program for infants and toddlers with developmental delays
- **FDLRS** — Florida Diagnostic and Learning Resources System (preschool early-intervention network for children not yet in public school)

**Tool-internal conventions**
- **Add-only** — auto-population helpers add checks but never remove them; the clinician's manual unchecks persist across re-renders
- **The bridge** — the cognitive-profile → DSM-5 specifier auto-link (see the [technical reference](docs/branching-logic.md) §11.7 and the clinician guide)
- **Override pill** — the three-state Auto/Include/Exclude toggle in the Adjust Referrals section that overrides a referral rule
- **`{placeholder}` field** — bracketed text in letter output that the clinician fills in after copying (e.g., `{Student Name}`); the Copy for Epic format replaces these with `***` cursor stops

## How it works

One checkbox form on the left drives all three outputs on the right. Each input mutates a single state object; on every change the tool re-runs its rule functions to decide which therapy referrals, school services, ABA targets, and note sections fire, then regenerates the A&P note, ABA letter, and IEP letter from scratch. Nothing is entered twice: the letters derive from the same state that drives the note.

The full mechanics, every input field, every auto-trigger rule, the cognitive-profile/specifier bridge, the DSM-5 gate, and the letter content rules, are documented in two companion references rather than repeated here:

- **[Clinician's guide](docs/branching-logic-for-clinicians.html)** — plain English, with vignettes and diagrams. Start here to understand *what the tool decides and why* without reading code.
- **[Technical reference](docs/branching-logic.md)** — the maintainer- and Claude-facing spec, with every output-shaping branch keyed to `autism-ap-builder.html` line numbers. Start here if you are changing the code.

These two are the single source of truth for the tool's behavior; this README intentionally does not restate them, so they cannot drift out of sync.

## Technical notes

- **Single file, no build system, no dependencies, no network requests.** Open `autism-ap-builder.html` directly in any modern browser. All CSS is in `<style>`, all JavaScript is in `<script>` at script scope (no module system). File is ~4,900 lines.
- **No PHI is transmitted or stored.** Everything runs locally in the browser. State lives in a single object `S` declared near the top of the `<script>` block; closing the browser tab discards everything.
- **Mobile responsive.** At viewport widths ≤768px, a sticky Input Form / View Note toggle nav appears at the top of the screen, section headers become sticky at `top:44px` (just below the nav) so the current section title stays visible while scrolling long forms, section collapse is animated via `max-height` transition with `inert` applied to collapsed bodies (keeps tab-nav clean), and touch targets are enlarged. Designed desktop-first but fully usable on tablet or phone.
- **State resets completely** via the **Clear All** button (with inline confirmation prompt).
- **Offline use:** save the page (`Ctrl+S` → "Webpage, Complete") and open the saved file. No functionality is lost.
- **Smart/curly quotes (U+2018 `'`, U+2019 `'`) must never appear in JS string literals.** They cause "Invalid or unexpected token" syntax errors and silently break the entire script with no console output. If a copy-paste introduces one, the PowerShell fix is in `CLAUDE.md`.
- **Box-drawing characters** (`─` U+2500, `═` U+2550) in JS string literals are intentional section dividers in note output — do not replace them with ASCII.
- **Em dashes in generated note prose are avoided** (use commas, semicolons, or parentheticals instead); em dashes are acceptable only in structural headers where they serve as visual separators. See `CLAUDE.md` for the full convention.
- **`// WARY:` comments** mark code that works but is fragile or under-tested — read the full comment before modifying. `grep -rn "WARY:"` gives a full inventory.
- **Project conventions** for code comments, state model, output pipeline, pronoun system, and verb-agreement helpers (`v3()`, `aOr()`) are documented in `CLAUDE.md`. New maintainers should read it before substantial changes.

### Files in the repository

| File | Purpose |
|---|---|
| `autism-ap-builder.html` | The entire application — CSS, HTML, and JS in one file (~4,900 lines) |
| `CLAUDE.md` | Project conventions and architecture notes for future contributors and AI assistants |
| `README.md` | This document |
| `docs/audits/` | Audit procedure documents (e.g., the verb-agreement audit procedure referenced from `CLAUDE.md`) |
| `docs/quickstart.png` | Screenshot referenced from the Quick start section above |

## Roadmap

Open backlog as of May 2026. The implementation plan is shaped by ongoing multi-session council review (DBP attending, clinical psychologist, child & adolescent psychiatrist, BCBA-D, developmental therapist subcommittee, feeding therapist, ESE director, specialist medicine subcommittee, claims examiner, English professor, general pediatrician at UF Behavior and Development Clinic, software engineer / GUI/UX, technical reviewer / QA, clinical workflow specialist, and an autistic parent reviewer).

- **Write-in / "Other…" fallback fields** in input groups where the preset list is occasionally insufficient. Pattern: a small "Other:" text field that appears (or is always visible) below preset options, with typed content flowing into the corresponding note prose verbatim and tagged as clinician-entered. Priority candidates (highest clinical leverage first): cognitive profile (cases not mapping cleanly to ID/GDD/BIF/average bands), adaptive behavior, prior-testing reviewed (new instruments appear regularly), and comorbidity (low-frequency diagnoses like Fragile X, Tourette's, Rett syndrome not currently in checkbox lists). Out of scope: diagnosis status, age group, pronouns, DSM-5 criteria — structured by design.
- **Fecal smearing (scatolia)** as a behavior-domain checkbox in Section 4 with auto-population of a corresponding ABA target; consider linkage to GI/constipation comorbid logic and to sensory (tactile/oral) domain.
- **Leisure / recreation skills ABA target** for school-age and older patients.
- **Interoception as a sensory subtype** in Section 4 Sensory domain.
- **Social cognition → soft medical SLP referral trigger** (school-side SLP already triggers from `needsSocial` conversation/reciprocity).
- **B4 (sensory) → sensory need suggestion** so checking B4 in DSM-5 criteria auto-populates relevant sensory needs in Section 4.
- **Phase 2 of the genetics referral council:** family-history capture (premature ovarian failure, ataxia/tremor, ≥3 miscarriages, consanguinity, advanced parental age) for phenotype-driven Fragile X escalation; growth-parameter capture (microcephaly/macrocephaly) for genetics referral language.

The full multi-session approved plan lives in the maintainer's local environment (not in this repo); summaries of council decisions are folded into commit messages and the inline `// council ruling` code comments where they apply.
