# References

Centralized bibliography for `autism-ap-builder.html` and its companion docs.

## How this document works

- Each entry has a short handle in `[brackets]` (e.g., `[mehler-2016]`). When a citation is referenced inline in code or docs, the comment links to the handle so a grep finds every consumer.
- **Used for:** lists where the source appears (file + section/line).
- **Supports the claim:** one sentence on what the source is being cited *for* in this tool — not a full abstract.
- **Verified:** your initials + the date you pulled the actual paper or guideline. A blank `Verified:` field means the citation surfaced in a Claude session and has **not** yet been confirmed by the maintainer.
- A source marked `needs verification` should not be quoted in a clinical letter, chart note, or council deliberation until the bibliographic detail is confirmed.

---

## Index

- [§1 ABA therapy & ASD management — medical-necessity evidence base](#1-aba-therapy--asd-management--medical-necessity-evidence-base)
- [§2 Cognitive assessment — IQ/DQ psychometrics, screening, BIF](#2-cognitive-assessment--iqdq-psychometrics-screening-bif)
- [§3 Genetic evaluation](#3-genetic-evaluation)
- [§4 Service coverage & insurance](#4-service-coverage--insurance)
- [§5 Comorbidity & medication](#5-comorbidity--medication)
- [§6 DSM-5 / ICD-10 source documents](#6-dsm-5--icd-10-source-documents)
- [§7 Epidemiology & population prevalence](#7-epidemiology--population-prevalence)
- [§8 Fetal alcohol spectrum disorders](#8-fetal-alcohol-spectrum-disorders)
- [§9 Education law — IDEA and Florida ESE rules](#9-education-law--idea-and-florida-ese-rules)
- [§9 Education law — IDEA and Florida ESE rules](#9-education-law--idea-and-florida-ese-rules)

---

## 1. ABA therapy & ASD management — medical-necessity evidence base

The four citations in this section are the complete reference set the tool surfaces in the ABA Letter of Medical Necessity and the A&P note's ASD management plan. They are the references payors, school districts, and TRICARE/ChampVA reviewers see. Each is conditionally enumerated (Ref. 1 through Ref. 3 or 4 depending on `young` and `isMilitary` flags) so the in-letter numbering tracks the actual citations included.

### `[hyman-2020]` — AAP Clinical Practice Guideline on ASD

Hyman SL, Levy SE, Myers SM, et al.; Council on Children with Disabilities, Section on Developmental and Behavioral Pediatrics. **Identification, Evaluation, and Management of Children With Autism Spectrum Disorder.** *Pediatrics.* 2020;145(1):e20193447. doi:10.1542/peds.2019-3447

- **Used for:** A&P note reference #1 ([autism-ap-builder.html:2125](../autism-ap-builder.html#L2125)); ABA letter reference #1 ([autism-ap-builder.html:3231](../autism-ap-builder.html#L3231)).
- **Supports the claim:** AAP-endorsed standard of care for identification, evaluation, and management of ASD — the canonical citation for medical-necessity arguments in the ABA letter.
- **Verified:**

### `[weitlauf-ahrq-2014]` — AHRQ Comparative Effectiveness Review on ABA

Weitlauf AS, McPheeters ML, Peters B, et al. **Therapies for Children with Autism Spectrum Disorder: Behavioral Interventions Update.** Comparative Effectiveness Review No. 137. Rockville, MD: Agency for Healthcare Research and Quality; 2014. <https://www.ncbi.nlm.nih.gov/books/NBK241444>

- **Used for:** A&P note reference #2 ([autism-ap-builder.html:2126](../autism-ap-builder.html#L2126)); ABA letter reference #2 ([autism-ap-builder.html:3232](../autism-ap-builder.html#L3232)).
- **Supports the claim:** AHRQ-level evidence base for ABA-class behavioral interventions; the federal-agency citation that strengthens medical-necessity arguments for payors.
- **Verified:**

### `[reichow-cochrane-2018]` — Cochrane EIBI review

Reichow B, Hume K, Barton EE, Boyd BA. **Early intensive behavioral intervention (EIBI) for young children with autism spectrum disorders (ASD).** *Cochrane Database Syst Rev.* 2018;(5):CD009260. doi:10.1002/14651858.CD009260.pub3

- **Used for:** A&P note reference #3 and ABA letter reference #3 — only when the patient is `young` (toddler or preschool). ([autism-ap-builder.html:2127, 3233](../autism-ap-builder.html#L2127)).
- **Supports the claim:** Cochrane-level evidence base for EIBI in the under-6 cohort specifically. Citing this for an older patient would overstate scope, which is why the tool age-gates the reference.
- **Verified:**

### `[nasem-2025]` — National Academies on TRICARE Autism Care Demonstration

National Academies of Sciences, Engineering, and Medicine. **The Comprehensive Autism Care Demonstration: Solutions for Military Families.** Washington, DC: National Academies Press; 2025. doi:10.17226/29139

- **Used for:** A&P note reference and ABA letter reference — only when `isMilitary` is true ([autism-ap-builder.html:2128, 3234, 3271](../autism-ap-builder.html#L2128)).
- **Supports the claim:** NASEM evaluation reaffirming medical necessity and effectiveness of ABA for military-connected ASD; gated to TRICARE/ChampVA patients because that is where the rebuttal value sits.
- **Verified:**

### `[aap-2025-asd]` — AAP 2025 ASD timing-based urgency (needs verification)

Referenced in an inline comment as `AAP-2025` ([autism-ap-builder.html:2405](../autism-ap-builder.html#L2405)). **Full bibliographic details have not been entered into the tool** — the comment refers to clinical-experience-based timing-urgency differentiation said to be aligned with AAP 2025. Confirm whether this is the same as `[hyman-2020]` (the most recent AAP CPG) or a newer 2025 statement before quoting in any external letter.

- **Used for:** rationale comment only; no patient-facing output.
- **Supports the claim:** unclear — pending maintainer verification.
- **Verified:** **needs verification**

---

## 2. Cognitive assessment — IQ/DQ psychometrics, screening, BIF

### `[pitts-mervis-2016]` — KBIT-2 floor effects in Williams syndrome

Pitts CH, Mervis CB. **Performance of Williams syndrome children on the Kaufman Brief Intelligence Test, Second Edition (KBIT-2).** *American Journal on Intellectual and Developmental Disabilities.* 2016;121(1):54–64. (citation as cited inline in the tool; **needs verification** — full bibliographic detail confirmed against the journal record.)

- **Used for:** floor-effect warning comment ([autism-ap-builder.html:4181](../autism-ap-builder.html#L4181)); branching-logic.md §11.6 floor-effect warning rationale.
- **Supports the claim:** Brief IQ screeners (specifically KBIT-2R) have documented floor effects in young children, making KBIT-2R results unreliable for distinguishing BIF from mild ID/GDD under age 5. Drives the passive floor-effect warning that fires on `screener × {toddler, preschool}`.
- **Verified:** **needs verification**

### `[greenspan-2017]` — Argument against the BIF category

Greenspan S. **Borderline intellectual functioning: an update.** *Current Opinion in Psychiatry.* 2017;30(2):113–122. (citation as cited inline; **needs verification**.)

- **Used for:** BIF asymmetry rationale comment ([autism-ap-builder.html:4524](../autism-ap-builder.html#L4524)); branching-logic.md §11.7 BIF asymmetry; branching-logic-for-clinicians.html.
- **Supports the claim:** BIF (R41.83) is a contested clinical-attention category. Greenspan argues for dropping BIF entirely. Drives the no-auto-bridge rule for `borderline` → `withBIF` and the prohibition on a `withSuspectedBIF` specifier.
- **Verified:** **needs verification**

### `[mehler-2016]` — Descriptive severity language for DQ 70–85

Mehler MF, Mehler MF, [primary author confirmation needed]. **Classification of mild and minor developmental delay** (general topic — exact title needs verification). *JAMA Pediatrics.* 2016. (citation as referenced in audit prompts and inline comments; **full bibliographic detail needs verification**.)

- **Used for:** GDD severity rendering rationale ([autism-ap-builder.html](../autism-ap-builder.html) near the `gddSevWord` helper); branching-logic.md §11.11 (GDD severity injection); cognitive-profile audit framework state 4 (under-6 sub-state).
- **Supports the claim:** Descriptive severity language ("mild developmental delay" for DQ 70–85) is the literature-preferred framing for the under-6 cohort, where formal IQ-based labels are unreliable. Drives the choice to thread `mild`/`moderate`/`severe` adjectives through all four GDD output sites (PR-C, commit 79b956b).
- **Verified:** **needs verification — full citation pending**

### `[aacap-id-practice-parameter]` — AACAP Practice Parameter on intellectual disability

American Academy of Child and Adolescent Psychiatry. **Practice Parameter for the Assessment and Treatment of Children and Adolescents With Intellectual Disability (Intellectual Developmental Disorder).** *J Am Acad Child Adolesc Psychiatry.* (year and full citation **needs verification**.)

- **Used for:** branching-logic.md §11.6 (floor-effect warning rationale); cognitive-profile audit framework (IQ-reliability boundary).
- **Supports the claim:** IQ testing is unreliable under age 5; brief screener results in this age range cannot reliably distinguish BIF from mild ID/GDD. Drives the under-6 age gate on ID-tier cogProfile selections.
- **Verified:** **needs verification**

### `[aacn-2020]` — AACN consensus on uniform labeling

American Academy of Clinical Neuropsychology. **Uniform labeling of performance test scores: AACN consensus conference statement.** *The Clinical Neuropsychologist.* 2020. (citation surfaced in 2026 cognitive-profile audit; **needs verification**.)

- **Used for:** cognitive-profile audit meta-finding (`AACN labeling alignment`); not currently cited inline in the tool.
- **Supports the claim:** AACN consensus replaced "borderline" with "below average" (FSIQ 70–79) and "low average" (FSIQ 80–89) in performance-test labeling. Surfaced as a meta-finding for future PR consideration — not yet acted on, but motivates the BIF source qualifier in PR-D (commit c77eb8f).
- **Verified:** **needs verification**

### `[wexler-2023]` — BIF vs low-average adaptive functioning

Wexler B [primary author confirmation needed]. **Adaptive functioning differences between FSIQ 70–79 and 80–89 groups in children aged 6–13.** *The Clinical Neuropsychologist.* 2023. (citation surfaced in 2026 cognitive-profile audit, n≈2,516; **needs verification**.)

- **Used for:** cognitive-profile audit meta-finding (`AACN labeling alignment`).
- **Supports the claim:** No meaningful adaptive-functioning difference between FSIQ 70–79 and 80–89 groups, suggesting the BIF/low-average distinction may be an artificial construct. Reinforces `[greenspan-2017]` and `[aacn-2020]`.
- **Verified:** **needs verification — primary author, journal volume/issue/pages pending**

---

## 3. Genetic evaluation

The two citations below are the **only** two genetics citations the tool emits (superscripts ¹ and ² in the A&P note Plan section at [autism-ap-builder.html:2439–2440](../autism-ap-builder.html#L2439)). Other clinical concepts mentioned in the genetics referral prose — Fragile X (FMR1) testing, chromosomal microarray (CMA), exome/genome sequencing as first-tier, screening for treatable inborn errors of metabolism — are framed as deriving from `[rodan-2025]` and `[srivastava-2019]` rather than being separately cited. If a future edit adds a Plan-section claim that cannot be sourced to one of these two papers, add the new citation here and add an inline superscript marker in the Plan text.

### `[rodan-2025]` — AAP Council on Genetics clinical report on ID/GDD

Rodan LH, Stoler J, Chen E, Geleske T; Council on Genetics. **Genetic evaluation of the child with intellectual disability or global developmental delay: clinical report.** *Pediatrics.* 2025;156(1):e2025072219. doi:10.1542/peds.2025-072219

- **Used for:** A&P note Plan section, genetic evaluation rationale ([autism-ap-builder.html:2488](../autism-ap-builder.html#L2488)).
- **Supports the claim:** AAP guidance on genetic evaluation indications for children with ID or GDD — drives the genetic referral recommendation when cogProfile is in the ID/GDD tiers.
- **Verified:**

### `[srivastava-2019]` — Exome sequencing as first-tier for NDD

Srivastava S, Love-Nichols JA, Dies KA, et al. **Meta-analysis and multidisciplinary consensus statement: exome sequencing is a first-tier clinical diagnostic test for individuals with neurodevelopmental disorders.** *Genet Med.* 2019;21(11):2413–2421. doi:10.1038/s41436-019-0554-6

- **Used for:** A&P note Plan section, genetic evaluation rationale ([autism-ap-builder.html:2489](../autism-ap-builder.html#L2489)).
- **Supports the claim:** Multidisciplinary consensus that exome sequencing should be a first-tier test in NDD evaluation. Strengthens the genetic referral language for payors.
- **Verified:**

---

## 4. Service coverage & insurance

### `[apa-dsm-5-2013]` — DSM-5 (2013 first edition)

American Psychiatric Association. **Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5).** Arlington, VA: American Psychiatric Publishing; 2013.

- **Used for:** ABA letter opening paragraph ([autism-ap-builder.html:3243](../autism-ap-builder.html#L3243)).
- **Supports the claim:** Standard diagnostic reference cited in the ABA letter opening for medical-necessity framing. The tool uses 2013 in the letter rather than DSM-5-TR (2022) because the 2013 edition is the originally-named reference for the ASD criteria.
- **Verified:**

### `[nasem-2025]` (re-used)

See §1 above. Cited additionally in the ABA letter evidence paragraph for military-connected patients ([autism-ap-builder.html:3271](../autism-ap-builder.html#L3271)).

---

## 5. Comorbidity & medication

### `[fl-bhc-2022]` — Florida Behavioral Health Center medication guidelines

Florida Behavioral Health Center (FL BHC). **Children & Adolescent Best Practice Psychotherapeutic Medication Guidelines.** 2022. (Florida organizational guideline. Full citation/URL **needs verification** — this is an organizational source, not a peer-reviewed publication.)

- **Used for:** ADHD stimulant recommendations ([autism-ap-builder.html:2639](../autism-ap-builder.html#L2639)); anxiety SSRI/SNRI recommendations ([2680](../autism-ap-builder.html#L2680)); depression medication recommendations ([2711](../autism-ap-builder.html#L2711)); sleep pharmacotherapy ([2882](../autism-ap-builder.html#L2882)).
- **Supports the claim:** Florida-jurisdiction medication guidance — locally relevant because the practice is at UF Behavior and Developmental Clinic. Distinct from national guidance; do not substitute AAP or AACAP citations here.
- **Verified:** **needs verification — exact document title and URL**

---

## 6. DSM-5 / ICD-10 source documents

### `[apa-dsm-5-tr-2022]` — DSM-5-TR

American Psychiatric Association. **Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition, Text Revision (DSM-5-TR).** Washington, DC: American Psychiatric Association Publishing; 2022.

- **Used for:** background reference for diagnostic categories and criteria language across the tool; cited in cognitive-profile audit and in the BIF discussion (R41.83 remains in DSM-5-TR).
- **Supports the claim:** Current authoritative source for ASD, ID, and BIF diagnostic categories. DSM-5-TR retains R41.83 (BIF) as a clinical-attention category despite the contested literature on the construct.
- **Verified:**

### `[icd-10-cm]` — ICD-10-CM diagnostic codes

National Center for Health Statistics. **International Classification of Diseases, 10th Revision, Clinical Modification (ICD-10-CM).** US edition, current year.

- **Used for:** all ICD-10-CM codes appearing in the A&P note (F84.0, F70/F71/F72, F88, R41.83, F90.0/.1/.2, F41.9, F32.9, F42.9, G40.909, K59.00, R63.32/.31/.30, F50.82, G47.9, Z03.89).
- **Supports the claim:** Code assignments throughout the tool. F88 has no severity sub-coding in ICD-10-CM — the rationale for `[mehler-2016]`-style prose adjectives at output.
- **Verified:**

---

## 7. Epidemiology & population prevalence

### `[cdc-addm-2022]` — CDC ADDM Network ASD prevalence (2022 surveillance year)

Shaw KA, Williams S, Patrick ME, et al. **Prevalence and Early Identification of Autism Spectrum Disorder Among Children Aged 4 and 8 Years — Autism and Developmental Disabilities Monitoring Network, 16 Sites, United States, 2022.** *MMWR Surveill Summ.* 2025;74(SS-2):1–22. doi:10.15585/mmwr.ss7402a1

- **Used for:** archetype-preset design rationale — branching-logic.md §11.17 (council provenance). **Not surfaced in any patient-facing output** (no A&P/ABA/IEP reference line); it grounds a design decision only.
- **Supports the claim:** ASD prevalence ~1 in 31 among 8-year-olds; co-occurring intellectual disability ~37–40% (IQ ≤70), borderline ~24%, ~3–4:1 male:female. Combined with the Medicaid-population skew toward higher support needs and later diagnosis, this grounds the council's weighting of the six archetype presets toward higher-support and language-delayed early-eval cases rather than the "verbal, no-ID, Level 1" stereotype. Co-occurring ADHD (~40–60%) and minimally-verbal (~25–30%) figures cited alongside it in the council are from the broader ASD-comorbidity literature, not this single source.
- **Verified:** DM 2026-05-29

---

## 8. Fetal alcohol spectrum disorders

### `[hoyme-2016]` — NIAAA consensus clinical guidelines for diagnosing FASD

Hoyme HE, Kalberg WO, Elliott AJ, et al. **Updated Clinical Guidelines for Diagnosing Fetal Alcohol Spectrum Disorders.** *Pediatrics.* 2016;138(2):e20154256. doi:10.1542/peds.2015-4256 (PMC4960726)

- **Used for:** every "per NIAAA consensus guidelines/guidance" attribution in the A&P note's FASD wiring — the exposure documentation line and genetics phenocopy-exclusion rationale in Diagnostic Workup and Medical Referrals (`autism-ap-builder.html`, FASD Considerations block and genetics referral); the FASD-triggered audiology and ophthalmology plan lines; the five NIAAA evidence categories behind the `paeEvidence` checkboxes; the exposure-threshold field hint (Table 2 operational definition) and the four-domain `fasdDomains` sub-select (facial / growth / brain / neurobehavioral); branching-logic.md §7.9. **Attribution convention (David's call): the note names the organization (NIAAA), never the lead author** — this entry is the only place the Hoyme citation lives.
- **Supports the claim:** NIAAA-supported consensus guidelines defining "clinically significant" documented prenatal alcohol exposure (the five evidence categories), and recommending dysmorphology/genetic evaluation to exclude phenocopies plus audiologic and dilated ophthalmologic examination as part of the FASD workup.
- **Verified:** bibliographic details confirmed against PMC4960726 on 2026-07-16 (Claude session; David supplied the source URL) — maintainer initials pending

---

## 9. Education law — IDEA and Florida ESE rules

These are the regulatory citations the IEP letter puts in front of a school district. They are not clinical literature, but they carry the same do-not-invent rule and a sharper consequence for being wrong: a district that checks a citation and finds it does not say what the letter implies discounts the whole letter. Every citation is surfaced by section number and subject only — the tool never paraphrases regulatory text as if quoting it.

**Verification method.** Each federal section below was read in full on eCFR (the official, continuously updated C.F.R.) on 2026-08-21, against Title 34 as amended through 7/24/2026. eCFR's Recent Changes view for Title 34 Part 300 shows **no amendment to Part 300 since 8/10/2017**, so the federal sections cited here are stable adopted text and the 7/24/2026 Title 34 amendment did not reach them. The Florida rules were read from the adopted FAC text published by the Florida Department of State at flrules.org, specifically the document linked under each rule's "Latest version of the final adopted rule" header, and cross-checked against Cornell LII. Case law was searched on CourtListener and deliberately **not** cited: a physician recommendation letter argues from the regulations, and citing litigation in it would misrepresent what the document is.

**Adopted text only.** No citation in this tool rests on a proposed, draft, or under-development rule. Where rulemaking is in progress it is recorded as a watch item below and nothing from it is used.

### `[idea-34cfr300]` — IDEA Part B implementing regulations

U.S. Department of Education. **Assistance to States for the Education of Children with Disabilities**, 34 C.F.R. Part 300. Read at <https://www.ecfr.gov/current/title-34/subtitle-B/chapter-III/part-300>.

- **Used for**, by section:
  - **§300.8(a)(1)** — "child with a disability" means a child evaluated as having one of the listed impairments "and who, by reason thereof, needs special education and related services." Both prongs. Consumed by the rule-out diagnosis paragraph (`ruleOutDxRest`).
  - **§300.8(b)** — developmental delay, ages three through nine or a subset, subject to §300.111(b). Consumed by the Developmental Delay eligibility candidate.
  - **§300.8(c)(1)** Autism, **(c)(6)** Intellectual disability, **(c)(9)** Other health impairment, **(c)(10)** Specific learning disability, **(c)(11)** Speech or language impairment. Consumed by the eligibility candidates and the Autism-category ask.
  - **§300.34(a)** — related services expressly include "speech-language pathology and audiology services... physical and occupational therapy." Consumed by `ruleOutRelatedSvcNote`.
  - **§300.111(a)(1)(i) and (c)(1)** — child find; (c)(1) expressly reaches children suspected of having a disability "even though they are advancing from grade to grade." Consumed by `ruleOutEvalRequest`. Note that §300.111(a)(1) is framed as a **State** obligation ("The State must have in effect policies and procedures to ensure that..."), so the letter states the requirement in the passive voice and attributes the district-level duty to the introductory text of Florida Rule 6A-6.0331, which is where it actually sits.
  - **§300.301(b)** — either a parent or the public agency may request an initial evaluation. **§300.301(c)(1)** — the 60-day evaluation timeline, or the State's timeframe where the State sets one. Consumed by `ruleOutEvalRequest` and the evaluation-timeline paragraph.
  - **§300.304(c)(6)** — the evaluation must be "sufficiently comprehensive to identify all of the child's special education and related services needs, whether or not commonly linked to the disability category in which the child has been classified." Consumed by `ruleOutDxRest`.
  - **§300.306(c)(1)(i)** — in interpreting evaluation data the agency must draw on information from a variety of sources, expressly including "information about the child's physical condition, social or cultural background, and adaptive behavior." Consumed by `ruleOutDxRest`.
  - **§300.324(b)(1)(ii)(C)** — the IEP Team must revise the IEP as appropriate to address "information about the child provided to, or by, the parents." Consumed by the `schoolDoc === 'iep'` branch.
- **Supports the claim:** that IDEA eligibility rests on an educationally-defined disability category plus a resulting need for special education, not on any particular medical diagnosis — the load-bearing argument of the ASD-ruled-out letter.
- **Verified:** Claude 2026-08-21, each section read in full on eCFR. Maintainer confirmation still recommended before first clinical use.

**Three citation errors were found and corrected on 2026-08-21.** All three predated the ruled-out work and affected confirmed and suspected letters too:

| Was | Problem | Now |
|---|---|---|
| `34 C.F.R. §§300.301–302` for the evaluation timeline | §300.302 is "Screening for instructional purposes is not evaluation." It says nothing about timelines. | `34 C.F.R. §300.301(c)(1)` |
| `34 C.F.R. §300.324(b)(1)` for "a parent may request an IEP team meeting at any time" | §300.324(b)(1) does not say that. It obligates the team to review at least annually and to revise the IEP to address enumerated matters. The proposition is real but lives in OSEP commentary, not in this section. | `34 C.F.R. §300.324(b)(1)(ii)(C)`, with the sentence rewritten to the team's obligation to address information provided by the parents — accurate, and a stronger hook for an enclosed evaluation |
| "limited alertness to educational stimuli" for OHI | Inverts the definition. The regulation reads "limited strength, vitality, or alertness, including a heightened alertness to environmental stimuli, that results in limited alertness with respect to the educational environment." | Wording now tracks §300.8(c)(9), and notes that ADHD and epilepsy are named in the regulation itself |

### `[fl-ese-rules]` — Florida State Board of Education ESE rules

Florida Administrative Code, Rule Chapter 6A-6 (Special Programs I) and Rule 6A-1.0943. Read at <https://www.flrules.org>.

**Every rule below is an adopted rule in the Florida Administrative Code, not a proposed or draft one.** The Effective column is the date of the currently operative adopted version, read from the "Latest version of the final adopted rule presented in Florida Administrative Code (FAC)" header on each rule's flrules.org page. Where rule text was quoted, the document read was the one linked under that header, which is the adopted FAC text, never a Notice of Proposed Rule.

| Rule | Effective | Title | Used for |
|---|---|---|---|
| 6A-6.0331(3)(g) | 9/23/2025 | General Education Intervention Procedures, Evaluation, Determination of Eligibility, Reevaluation and the Provision of Exceptional Student Education Services | Initial-evaluation timeline; introductory text also cited for district child-find responsibility |
| 6A-6.03011 | 1/4/2009 | ESE Eligibility for Students with Intellectual Disabilities | Intellectual Disability candidate |
| 6A-6.03012 | 7/1/2010 | ESE Eligibility for Students with Speech Impairments and Qualifications and Responsibilities for the Speech-Language Pathologists Providing Speech Services | Speech Impaired candidate |
| 6A-6.030121 | 1/7/2016 | ESE Eligibility for Students with Language Impairments and Qualifications and Responsibilities for the Speech-Language Pathologists Providing Language Services | Language Impaired candidate |
| 6A-6.030152 | 12/15/2009 | ESE Eligibility for Students with Other Health Impairment | Other Health Impaired candidate |
| 6A-6.03018 | 1/7/2016 | Exceptional Education Eligibility for Students with Specific Learning Disabilities | SLD candidate, suspected-SLD impact bullet, `psychoed` service block |
| 6A-6.03023 | 4/1/2015 | ESE Eligibility for Students With Autism Spectrum Disorder | Autism-category ask on confirmed and suspected letters |
| 6A-6.03027 | 9/20/2022 | Special Programs for Children Three Through Nine Years Old who are Developmentally Delayed | Developmental Delay candidate |
| 6A-1.0943 | 7/14/2021 | Statewide Assessment for Students with Disabilities | Florida Alternate Assessment, in the `sped` block and `accomIDMod` |

Independent cross-check: the introductory text of 6A-6.0331 itself enumerates the ESE eligibility rules by number, and every rule number this tool cites appears in that list.

- **Supports the claim:** the Florida-specific eligibility and procedural hooks a district in this region actually applies. Florida splits the single federal "speech or language impairment" category into two separate eligibilities (6A-6.03012 and 6A-6.030121) with different criteria and different evaluators, which is why the letter can list both.
- **Verified:** Claude 2026-08-21 against the official rule text at flrules.org, cross-checked on Cornell LII.

**A consequential error was found and corrected on 2026-08-21.** The tool cited "Florida Rule 6A-6.0331(3)(d)" for a "60 **school** day" initial-evaluation timeline. Both halves were wrong:

- **(3)(d)** is the general-education-intervention documentation requirement, not a timeline.
- **(3)(f)** does carry a 60-school-day rule, but only for consent signed **on or before June 30, 2015**. It is a legacy provision.
- **(3)(g)** is the operative rule: initial evaluations must be completed within **sixty (60) calendar days** of the district's receipt of parent consent, excluding school holidays and breaks, summer vacation, and student absences beyond eight school days, with a limited extension for district closure due to inclement weather or natural disaster (added effective 9/23/2025).

Sixty school days is roughly three calendar months; sixty calendar days is about two. Every evaluation-request letter the tool produced before this fix handed the district a month it does not have.

**Watch item, and it is development-stage only.** A multi-rule Notice of Rule Development published 3/16/2026 (Vol. 52/51, notice 30620298) covers **6A-6.030121**, **6A-6.03018**, and **6A-6.0331** among others, "to ensure students with disabilities are properly identified and served under the requirements of the Individuals with Disabilities Education Act and state laws." As of 2026-08-21 it remains at the development stage: not proposed, not adopted, not effective, and **nothing from it is cited in this tool.** Florida rulemaking runs Development, then Proposed, then Final; watch for a Final notice before assuming any of these rule numbers or their content has changed.

The Developmental Delay age language is quoted from the adopted 9/20/2022 text of 6A-6.03027: "A child who is developmentally delayed is three (3) through nine (9) years of age, or through the student's completion of grade 2, whichever occurs first," with eligibility criterion (2)(a) reading "The child is three (3) through nine (9) years of age, unless the child has completed grade 2." That 2022 amendment is what widened this rule from three-through-five to three-through-nine, and it also renamed the rule. The letter reflects the current adopted version, not the superseded one.

### `[section-504]` — Section 504 of the Rehabilitation Act

Section 504 of the Rehabilitation Act of 1973, 29 U.S.C. §794; implementing regulations at 34 C.F.R. Part 104.

- **Used for:** referenced by name, not by section number, in the `schoolDoc === '504'` branch, which argues a 504 accommodation plan may be insufficient to provide FAPE and asks the team to evaluate IEP eligibility.
- **Supports the claim:** that a 504 plan and an IEP are different instruments with different scope and enforceability. The 504 disability definition is functional rather than diagnosis-dependent — 34 C.F.R. §104.3(j)(1) covers a person who "has a physical or mental impairment which substantially limits one or more major life activities," and §104.3(j)(2)(ii) lists learning among those activities. Part 104 still uses the term "handicapped person"; the tool does not reproduce that term.
- **Verified:** Claude 2026-08-21, §104.3 read in full on eCFR.

---

## Maintenance

**In-commit update rule** (mirrored in CLAUDE.md): when you add or remove a citation in any tracked file — inline JS comment, A&P note reference line, ABA letter reference line, IEP letter reference line, or anywhere in `docs/` — update this file in the same commit. Do not let drift accumulate.

### Adding a citation

1. Add an entry to this file with a `[short-handle]` (kebab-case, includes year — e.g., `[mehler-2016]`).
2. In the inline location (code comment, A&P/ABA/IEP letter reference line, or prose), use the short handle so `grep -rn "[mehler-2016]"` finds every consumer.
3. Fill in `Used for:` with the file path and the line range or section that consumes the citation.
4. Fill in `Supports the claim:` with one sentence on what the source is being cited *for* in this tool. Do not paste an abstract.
5. If you have already pulled the actual paper or guideline and confirmed the bibliographic detail, fill in `Verified:` with your initials + date (e.g., `DM 2026-05-24`). If not, mark `needs verification` and surface it.

### Removing or replacing a citation

1. Grep for the short handle across the entire repo first: `grep -rn "\[handle-here\]"` (PowerShell: `Select-String -Pattern "\[handle-here\]" -Path . -Recurse`).
2. Decide for each consumer whether to update to a new source, remove the inline citation, or replace with a different handle.
3. Update all consumers in the same commit as the references.md change.
4. If the citation is removed entirely from the tool but you want to preserve the historical record, move the entry to a "Retired" section at the bottom of this file with a removal date and reason — do not just delete.

### Orphan / unregistered check

A handle in references.md with no inline consumer is an **orphan** (citation we documented but no longer use). An inline handle with no references.md entry is **unregistered** (a citation in patient-facing output with no documented source). Both are drift. The branching-logic.md §12 protocol implies a periodic audit; do the same here. A grep-based audit script in `scripts/` is a future addition only if drift is observed.

### Do-not-invent rule

Citations the tool currently surfaces must be real. When adding a new entry whose bibliographic detail you do not have in hand (e.g., the citation came up in a Claude session as a short reference), do not fabricate journal volume, issue, page numbers, or DOIs. Mark the entry `needs verification` and explicitly say `full bibliographic detail pending` in the entry body. The maintainer fills it in after pulling the source.
