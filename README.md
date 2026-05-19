# DBP Autism A&P Builder

A clinical note generator for Developmental Behavioral Pediatrics autism evaluations. Produces a fully structured Assessment & Plan note, an ABA Letter of Medical Necessity, and an IEP recommendation letter — all from a single set of checkboxes.

**Live tool:** https://dmatsib000-create.github.io/autism-ap-builder/autism-ap-builder.html

---

## What it does

The clinician fills in one left-side panel. Three outputs update in real time on the right:

| Tab | Output |
|---|---|
| **A&P Note** | Full problem-based Assessment & Plan, DSM-5 criteria table, clinical summary, therapy referrals, safety counseling, anticipatory guidance, and return-to-clinic interval |
| **ABA Letter** | Letter of Medical Necessity for ABA insurance authorization, pre-filled with diagnosis, functional needs, severity level, requested hours, and treatment setting |
| **IEP Letter** | Physician recommendation letter to the school from the UF Behavior and Development Clinic, with service-specific rationale paragraphs, educational impact bullets, accommodation lists, and IDEA statutory citations |

All output can be copied as rich text (for direct paste into Epic or Word), plain text, or **Epic format** (replaces `{placeholder}` fields with `***` cursor stops for Tab-navigation in the Epic note composer).

---

## Input sections

### 1 — Patient Profile
- **Age group:** Toddler / Preschool / School-age / Adolescent / Young adult  
  Age group gates several features: RITA-T and CARS-2 pathways, community independence checkbox, social skills group resources, transition planning language, and IEP tab visibility.
- **Pronouns:** He / She / They / Not specified — used throughout note and IEP letter
- **Visit type:** Initial evaluation / Re-evaluation / Follow-up — sets opening sentence of clinical summary
- **Language level:** Nonverbal → Fluent with impairment  
  Modifier chips add nuance: pragmatic deficits, reduced intelligibility, morphosyntactic errors, phonological errors, advanced vocabulary / hyperlexic, articulation errors
- **Cognitive / adaptive profile:** radio options feeding clinical summary phrasing
- **Strengths:** Free-text field with clickable chips (visual learner, strong memory, etc.)

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
- Trauma / PTSD
- Language disorder
- Specific learning disorders — reading (dyslexia), math, written expression, suspected
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
| SLP | Any communication need, any language level selected, language disorder comorbid |
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
- State resets completely with the **Clear All** button (with confirmation).
- The file can be saved locally and used offline.
- Smart/curly quotes in JS string literals will silently break the script — the CLAUDE.md has the PowerShell fix if this ever happens from copy-paste.

---

## File structure

```
autism-ap-builder.html   — the entire application (CSS + HTML + JS, ~3900 lines)
clinicalnotes.py         — separate CLI tool: pipes clinical text through UF AI API
clinicalnotes_shared.py  — distributable version of clinicalnotes.py (prompts for key)
```

---

## Roadmap / known plan backlog

A multi-session council review has produced an approved implementation plan. The council includes: DBP (lead), clinical psychologist, child & adolescent psychiatrist, BCBA-D, developmental therapist subcommittee (SLP/OT/PT), feeding therapist, ESE director, specialist medicine subcommittee (sleep, PM&R, neurology, GI, ENT), claims examiner, English professor, general pediatrician (UF BDC), software engineer / GUI/UX, technical reviewer / QA, clinical workflow specialist, and an autistic parent reviewer.

- Em dash reduction throughout note output
- IEP letter pronoun substitution and specifier integration
- Line spacing normalization (collapse triple blank lines)
- Additional comorbidity blocks and accommodation logic
- Boundary violations checkbox (age-gated, school-age+)
- Social cognition → soft SLP referral trigger
- B4 (sensory) → sensory need suggestion
- Leisure / recreation skills ABA target
- Menstrual care adaptive checkbox (adolescent female)
- Interoception as sensory subtype
- Low-priority diagnostic workup: ASD-PEDS/MIGDAS-2 date fields, CARS-2 sentence fragment fix, rule-out closing sentence, em dash in suspected header

See `C:\Users\davem\.claude\plans\partitioned-seeking-octopus.md` for the full approved plan.
