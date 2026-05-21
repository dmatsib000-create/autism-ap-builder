# DBP Autism A&P Builder

A clinical note generator for Developmental Behavioral Pediatrics autism evaluations. Produces a fully structured Assessment & Plan note, an ABA Letter of Medical Necessity, and an IEP recommendation letter — all from a single set of checkboxes.

**Live tool:** https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html

## For clinicians using this tool

Start here — these three docs are written for the clinician using the tool, not the engineer maintaining it:

- **[QUICKSTART.md](QUICKSTART.md)** — Generate your first note in 5 minutes. The minimum inputs to produce a usable A&P note, ABA letter, and IEP letter.
- **[LIMITATIONS.md](LIMITATIONS.md)** — What this tool does *not* do. Read before sending any letter to a school district.
- **[CHEATSHEET.html](CHEATSHEET.html)** — One-page printable reference. Open in a browser, `Ctrl+P` to PDF, pin next to your monitor.

The rest of this README is the technical reference for the underlying logic, auto-rules, and code architecture. Useful for clinicians who want to dig deeper, and for anyone maintaining the tool.

---

## What it does

The clinician fills in one left-side panel. Three outputs update in real time on the right:

| Tab | Output |
|---|---|
| **A&P Note** | Full problem-based Assessment & Plan, DSM-5 criteria table, clinical summary, therapy referrals, safety counseling, anticipatory guidance, and return-to-clinic interval |
| **ABA Letter** | Letter of Medical Necessity for ABA insurance authorization, pre-filled with diagnosis, DSM-5 specifiers, functional needs, severity level, requested hours, and treatment setting. ABA severity uses max(SC, RRB) so the highest support need across either domain drives the authorization request. |
| **IEP Letter** | Physician recommendation letter to the school from the UF Behavior and Development Clinic, with service-specific rationale paragraphs, educational impact bullets, accommodation lists, DSM-5 specifiers (including `withGenetic` and `withNDD`), and IDEA statutory citations. IEP severity also uses max(SC, RRB) so educational placement reflects the highest support need across either domain. |

All output can be copied as rich text (for direct paste into Epic or Word), plain text, or **Epic format** (replaces `{placeholder}` fields with `***` cursor stops for Tab-navigation in the Epic note composer).

---

## Input sections

### 1 — Patient Profile
- **Age group:** Toddler / Preschool / School-age / Adolescent / Young adult  
  Age group gates several features: RITA-T and CARS-2 pathways, community independence checkbox, social skills group resources, transition planning language, and IEP tab visibility.
- **Pronouns:** He / She / They / Not specified — used throughout note and IEP letter
- **Visit type:** Initial evaluation / Re-evaluation / Follow-up — sets opening sentence of clinical summary
- **Language level:** Nonverbal / min. verbal → Single words → 2–3 word phrases → Simple sentences → Conversational → Fluent / no concerns → Mixed / hard to characterize (SLP eval)  
  A green **"Age-appropriate for developmental level"** qualifier card sits below the radio — checking it signals the output level is normal for the child's developmental stage and suppresses SLP / communication auto-triggers without changing the selected level.  
  **Language Features / Concerns** chip strip (domain-grouped): Pragmatics (pragmatic deficits, echolalic/scripted speech) · Language Form (morphosyntax errors, semantic deficits / literal thinking) · Speech (speech-sound errors, reduced intelligibility) · Other (formal/pedantic speech, advanced vocabulary).  
  Selecting nonverbal or single words automatically checks expressive language needs (and functional AAC for nonverbal) in the Communication domain — add-only, manual unchecks respected.
- **Cognitive profile:** Severe / Moderate / Mild ID → Global Developmental Delay (unspecified / mild / moderate / severe) → Borderline (BIF) → Low average → Average → High average (110–119) → Superior (120–129) → Very superior / gifted (130+) → Unknown / under evaluation.  
  ID options are hidden and cleared for toddler/preschool (DSM-5: ID requires reliable standardized testing, typically ≥5 years). GDD options are hidden and cleared for school-age and older (GDD is a placeholder diagnosis for children under 5). Selecting a cognitive option automatically pre-checks the matching DSM-5 specifier.
- **Adaptive behavior:** Severely / moderately / mildly impaired → Below cognitive potential → Commensurate with cognitive level → Age-appropriate / WNL
- **Identified strengths:** Free-text field with clickable chips (visual learner, strong memory, hyperlexia, special interests, etc.). Hyperlexia is documented here — it auto-triggers SLP referral and psychoeducational evaluation via text-search on this field.

### 2 — Diagnostic Workup & Next Steps
- **Diagnosis status:** Confirmed / Suspected / Rule-out — changes note language, ICD-10 codes, and IEP letter branch throughout
- **ASD severity levels (SC and RRB):** Levels 1–3 per DSM-5's two-domain model; justification text boxes included
- **Diagnostic eval path:** Selects which evaluation route is documented (CARS-2 scheduled, ADOS-2 uncertain, RITA-T, development-only, etc.)
- **Prior testing reviewed:** CARS-2 ST/HF, ADOS-2 (with module), ADI-R, ASD-PEDS, MIGDAS-2, SRS-2, GARS-3 — each with outcome dropdown (Consistent / Equivocal / Not consistent). Vineland-3, BASC-3, and Conners 4 included as behavioral/adaptive instruments. Consistent results are cited automatically in the ABA Letter and IEP Letter.
- **CARS-2 completed at this visit:** Flips CARS-2 note language from future to past tense
- **Seizure concern:** Checkbox for non-emergent seizure history (triggers EEG referral); sub-checkbox to also refer to neurology now without waiting for EEG result

### 3 — DSM-5 Criteria Evidence
- Checkboxes for A1, A2, A3 (all required) and B1–B4 (≥2 required), plus C/D/E specifying criteria
- Free-text evidence boxes under each criterion for specific clinical examples
- Live badge shows criteria met count and whether threshold is reached
- **B2 (insistence on sameness)** automatically populates `rigidity` in the behavioral needs Set, which activates transition accommodations, counseling school-service auto-select, and IEP transition impact language

### 4 — Functional Need Domains
Six domain Sets, each with specific checkboxes:

| Domain | Examples |
|---|---|
| **Communication** | Expressive, receptive, pragmatic, functional AAC |
| **Behavior** | Aggression, SIB, elopement, tantrums, noncompliance, property destruction, pica, disruptive vocalizations |
| **Adaptive / Self-care** | Toileting, dressing, feeding ADL, hygiene, community safety, community independence |
| **Sensory** | Auditory, tactile, visual, vestibular/proprioceptive, oral |
| **Motor** | Fine motor, handwriting, gross motor, coordination/praxis |
| **Social** | Peer interaction, play, perspective-taking, emotional recognition, conversation, reciprocity |

Checked items auto-populate ABA targets and school services (see Auto-logic below).

**Behavior frequency inputs:** For Tier 2 interfering behaviors (tantrums, noncompliance, property destruction, disruptive vocalizations) and emotional regulation, an optional text field appears when the behavior is checked. If filled, the description is appended to that behavior in the ABA medical necessity paragraph (e.g., "tantrums/meltdowns (3–5x/day, 10–20 min each)"). If left blank, the behavior name alone appears — no placeholder, no post-copy editing required.

### 5 — Comorbid Conditions
Checkboxes for co-occurring diagnoses with ICD-10 codes. Each generates its own Assessment and Plan block in the note when "Include plan" is toggled:

- ADHD (combined / inattentive / hyperactive / suspected)
- Anxiety disorder
- Major depressive disorder
- OCD
- Trauma / adverse childhood experiences — appears in the A&P note by default; inclusion in the IEP letter is gated behind an explicit per-letter opt-in sub-checkbox (default off) since the IEP letter becomes part of the cumulative educational record. When on, the IEP letter uses functional language ("additional psychosocial history with ongoing impact on emotional regulation and stress response") rather than the ICD-10 code, and a reminder banner above the letter preview prompts the clinician to verify family consent
- Language disorder
- Specific learning disorders — reading (dyslexia), math, written expression, or suspected (domain-uncharacterized). Suspected SLD is mutually exclusive with the confirmed-domain options: checking any confirmed-domain LD clears `suspected` and vice versa, while multiple confirmed domains may coexist
- DCD (developmental coordination disorder)
- Sleep disorder
- GI issues
- Pediatric Feeding Disorder — chronic, acute, or suspected
- ARFID (Avoidant/Restrictive Food Intake Disorder)
- Epilepsy / seizure disorder
- Intellectual disability / Global developmental delay (suspected or confirmed)
- Catatonia

### 6 — School & Educational Supports
- **School placement** and **documentation status** (IEP / 504 / neither / needed)
- **School services:** Checkboxes for SLP, OT, PT, counseling, social skills group, 1:1 aide, ESY, low ratio classroom, sensory accommodations, visual supports, FBA, psychoeducational evaluation, specialized academic instruction
- Services can be manually toggled on or off; auto-selected services show a blue "auto" badge
- **IEP tab** appears when school documentation is set and age group is not toddler (toddlers use Early Steps, not K-12 IDEA)

### 7 — Therapy / Referral Overrides
Each therapy recommendation has an Auto / Include / Exclude toggle, allowing the clinician to override the auto-logic for any referral without losing it on re-render.

### ABA Letter Parameters *(appears when ABA is included)*
- Insurance type, requested hours/week, therapy settings (home / clinic / school / community / telehealth)
- ABA target checkboxes (pre-populated by auto-logic, manually adjustable)
- ABA start date, authorization period
- Therapist name fields

### 8 — Safety Counseling
Checkboxes for safety topics addressed at the visit: elopement/wandering, road safety, water safety, fire/heat, SIB safety, medication safety, online safety. Each generates a dedicated safety counseling documentation paragraph.

### 9 — Anticipatory Guidance
Topics addressed with family: ABA overview, school/IEP, sleep, feeding, communication strategies, caregiver support, sibling guidance, transition planning, UF CARD, social skills, puberty, driving, and more.

---

## Auto-logic

The tool uses rule functions and sync helpers to reduce repetitive data entry.

### Therapy referrals (auto-triggered)

| Therapy | Triggers |
|---|---|
| ABA | Confirmed or suspected ASD, language needs, behavioral needs, adaptive needs, social needs |
| SLP | Any communication need checked; any language level other than "Fluent / no concerns" unless the age-appropriate qualifier is active; any language feature chip selected (pragmatic, echolalic, morphosyntax, semantic, speech-sound, intelligibility, pedantic, advanced vocab); language disorder comorbid; hyperlexia in strengths field |
| OT | Sensory needs, fine motor / handwriting / coordination needs, adaptive needs, DCD |
| PT | Gross motor needs, coordination needs, DCD |
| Psychotherapy | Anxiety, depression, OCD, trauma, emotional regulation flag (school-age+, verbal enough) |
| PCIT | Behavioral needs (toddler/preschool) |
| Social skills group | Social needs (preschool+, verbal enough) |
| Genetics | Confirmed ASD |
| Neurology | Epilepsy, focal neurological findings, neurology-now checkbox |
| Psychiatry | Medication for comorbids, severe behavioral needs (school-age+) |
| GI | GI comorbid, feeding concern, PFD, ARFID, pica |
| Audiology | Language delay, articulation concerns, hearing screen fail |
| QB Test | ADHD suspected (school-age+) |
| Early Steps | Toddler/preschool with any need |
| FDLRS | Confirmed ASD (school-age), school documentation needed |
| EEG | Seizure concern |

All referrals can be overridden via Section 7.

### ABA target auto-population

Checking needs checkboxes and DSM-5 criteria automatically checks the corresponding ABA targets:

- B1 (stereotypy) or any behavioral need → Reduce interfering repetitive behaviors
- B2 (insistence on sameness) → Transitions; also sets `rigidity` for IEP/accommodation logic
- Elopement → Reduce elopement
- SIB → Reduce self-injurious behavior
- Aggression / property destruction → Reduce aggression
- Tantrums / emotional regulation → Reduce tantrums / emotional dysregulation
- Pica → Reduction of pica
- Social needs → Play skills / peer interaction
- Communication needs → Functional communication
- Adaptive needs → Self-help / ADL
- Community safety / independence → Safety skills
- Academic flag → Academic readiness / instruction-following skills (toddler/preschool only — excluded from ABA letter for school-age+ due to FAPE/IDEA insurance denial risk)
- Toddler/preschool with social or communication needs → Joint attention, Imitation
- Emotional regulation → Self-regulation and coping strategies

ABA target auto-population is **add-only** — manually unchecked targets are not re-checked on re-render.

### Communication needs auto-population

Selecting a language level automatically pre-checks communication functional needs:

| Language level | Auto-checked |
|---|---|
| Nonverbal / min. verbal | Expressive language delays + Functional AAC needs |
| Single words, 2–3 word phrases, Simple sentences | Expressive language delays |
| Conversational, Fluent / no concerns | *(none)* |

Suppressed entirely if the age-appropriate qualifier card is checked. Add-only — manual unchecks are respected.

### School service auto-population

- Communication needs, language level, language disorder, or social communication needs (conversation/reciprocity) → SLP school
- Sensory, fine motor, adaptive, coordination, or DCD → OT school
- Gross motor or DCD → PT school
- Social needs → Social skills school
- Behavioral needs → FBA
- Elopement, aggression, SIB, pica, or disruptive vocalizations → Aide + FBA
- Anxiety, depression, ADHD, OCD, trauma, rigidity (B2), or emotional regulation → Counseling
- LD suspected → Psychoeducational evaluation

School service auto-population is also add-only; manual overrides are respected.

---

## Output details

### A&P Note structure

```
CLINICAL SUMMARY
  [Auto-generated narrative: age, visit type, language, cognitive profile,
   DSM-5 status, severity levels, prior testing, specifiers]

ASSESSMENT
  DSM-5 Criteria table (A1-A3, B1-B4, C/D/E) with evidence text

PLAN
  Problem 1: Autism Spectrum Disorder
    1. Diagnostic evaluation pathway
    2. Therapy referrals (SLP, OT, PT, ABA, social skills, psychotherapy, PCIT)
       ABA section includes:
         - Tiered medical necessity paragraph (BOD behaviors with fixed impact
           language; interfering behaviors with optional clinician-entered
           frequency; skill deficits named without frequency framing)
         - ABA Treatment Targets list with one-sentence clinical rationale per target
         - Age-appropriate service model language (EIBI/NDBI for young children;
           FBA-guided comprehensive services for school-age; self-determination
           framing for adolescents/young adults)
    3. School/educational supports
    4. Safety counseling
    5. Anticipatory guidance topics
    6. Medical referrals (genetics, neurology, GI, audiology, etc.)
    7–8. Sleep management / additional concerns

  Problem 2–N: Comorbid condition blocks (when "Include plan" is on)
    [Assessment paragraph + Plan paragraph per condition]

  RETURN TO CLINIC
    [Interval and next-visit instructions]
```

### IEP letter branches

| School documentation status | Letter type |
|---|---|
| IEP needed / no documentation | Branch A: Initial evaluation request (IDEA §300.302, 60-day timeline) |
| IEP in place | Branch B: IEP review / amendment request (IDEA §300.324) |
| 504 plan | Branch C: 504 update + IEP eligibility upgrade recommendation |
| Rule-out / no diagnosis | Evaluation support letter (IDEA §300.301, neutral eligibility language) |

Each school service generates a rationale paragraph (not just a label) connecting the service to the documented functional need.

---

## Copy formats

| Button | What it copies |
|---|---|
| Copy Rich Text | Formatted HTML — pastes with fonts, bold, and structure into Word/Epic |
| Copy Plain Text | Monospaced plain text with section dividers |
| Copy for Epic (***) | Plain text with all `{placeholder}` fields replaced by `***` Epic cursor stops; Tab-navigable in Epic note composer |

---

## Technical notes

- **Single file** — no build system, no dependencies, no network requests. Open directly in any browser.
- **No PHI is transmitted or stored** — everything runs locally in the browser.
- **Mobile responsive** — a sticky Input / View Note toggle nav appears at ≤768px; section headers also become sticky at `top:44px` (just below the nav) so the current section title stays visible while scrolling long forms; section collapse is animated via `max-height` transition with `inert` applied to collapsed bodies to keep tab-nav clean; touch targets enlarged throughout. Designed for desktop-first use but fully usable on a tablet or phone.
- State resets completely with the **Clear All** button (with confirmation).
- The file can be saved locally and used offline.
- Smart/curly quotes in JS string literals will silently break the script — the CLAUDE.md has the PowerShell fix if this ever happens from copy-paste.

---

## File structure

```
autism-ap-builder.html   — the entire application (CSS + HTML + JS, ~4400 lines)
clinicalnotes.py         — separate CLI tool: pipes clinical text through UF AI API
clinicalnotes_shared.py  — distributable version of clinicalnotes.py (prompts for key)
```

---

## Roadmap / known plan backlog

A multi-session council review has produced an approved implementation plan. The council includes: DBP (lead), clinical psychologist, child & adolescent psychiatrist, BCBA-D, developmental therapist subcommittee (SLP/OT/PT), feeding therapist, ESE director, specialist medicine subcommittee (sleep, PM&R, neurology, GI, ENT), claims examiner, English professor, general pediatrician (UF BDC), software engineer / GUI/UX, technical reviewer / QA, clinical workflow specialist, and an autistic parent reviewer.

- Em dash reduction in running prose (structural headers exempt)
- Additional comorbidity blocks and accommodation logic
- Social cognition → soft *medical* SLP referral trigger (school-side SLP already triggers from `needsSocial` conversation/reciprocity)
- B4 (sensory) → sensory need suggestion
- Leisure / recreation skills ABA target
- Fecal smearing (scatolia) — add as a behavior-domain checkbox in Section 4 with auto-population of a corresponding ABA target; consider linkage to GI/constipation comorbid logic and to sensory (tactile/oral) domain
- Interoception as sensory subtype
- Implement print stylesheet (GUI Phase 7, approved by council but never shipped)
- **Write-in / "Other…" fallback fields** in input groups where the preset list is occasionally insufficient. Pattern: a small "Other:" text field that appears (or is always visible) below the preset options, with typed content flowing into the corresponding note prose verbatim and tagged as clinician-entered (not auto-generated). Priority candidates to scope first (highest clinical leverage): cognitive profile (cases that don't map cleanly to ID/GDD/BIF/average bands), adaptive behavior, identified strengths (already has free-text + chips — verify it works), prior-testing reviewed (current list is fixed; new instruments appear regularly), and the comorbidity section (low-frequency diagnoses like Fragile X, Tourette's, Rett syndrome that aren't in the checkbox list). Lower priority: the functional-need domains, which are already broad enough that adding write-ins risks duplication with existing checkboxes. Out of scope: diagnosis status, age group, pronouns, DSM-5 criteria — these are structured by design.

See `C:\Users\davem\.claude\plans\partitioned-seeking-octopus.md` for the full approved plan.
