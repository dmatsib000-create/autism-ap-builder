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
- [§7 HIPAA compliance & persistence design](#7-hipaa-compliance--persistence-design)

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

## 7. HIPAA compliance & persistence design

Grounding for the persistence module (PR-N). The HIPAA Security Rule splits implementation specifications into "required" and "addressable" — addressable specs must still be implemented "if reasonable and appropriate," and the guide below explicitly recommends implementing them in the default case.

### `[truevault-hipaa-guide]` — Developers Guide to HIPAA Compliance (TrueVault)

TrueVault. **Developers Guide to HIPAA Compliance, Version 1.0.** GitHub: `truevault-safe/hipaa-compliance-developers-guide`, 2014–2023 (1,739 stars). <https://github.com/truevault-safe/hipaa-compliance-developers-guide>

- **Used for:** all HIPAA Security Rule interpretation in the persistence module ([autism-ap-builder.html](../autism-ap-builder.html) PERSISTENCE block); §13 of `docs/branching-logic.md`; the persistence design council deliberation.
- **Supports the claim:** Specifically §04 Technical Safeguards — Encryption and Automatic Logoff are addressable specifications that should be implemented by default ("when in doubt, implement"); Disposal and Media Re-Use are required; Workstation Security is required but handled by the institution rather than the tool. §09 Mobile Applications — encryption guidance extends to any client-side PHI storage, including browser localStorage.
- **Companion references:** authoritative HHS sources cited in the guide — [Technical Safeguards PDF](https://www.hhs.gov/sites/default/files/ocr/privacy/hipaa/administrative/securityrule/techsafeguards.pdf), [Physical Safeguards PDF](https://www.hhs.gov/sites/default/files/ocr/privacy/hipaa/administrative/securityrule/physsafeguards.pdf). Always defer to HHS over the secondary guide if they conflict.
- **Caveats:** The Truevault guide is plain-English secondary literature ("we're not lawyers" disclaimer in §00). For tool-as-deployed-in-clinic compliance questions, the operative authority is the UF compliance office, not this guide. The guide is appropriate for **design decisions** (what addressable specs should the tool implement); UF compliance is appropriate for **deployment decisions** (is this tool approved for clinical use under our BAA).
- **Verified:** DM 2026-05-25 (table of contents + §04 + §09 fetched via `gh api`)

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
