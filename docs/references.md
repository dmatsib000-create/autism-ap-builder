# References

Centralized bibliography for `autism-ap-builder.html` and its companion docs.

## How this document works

- Each entry has a short handle in `[brackets]` (e.g., `[greenspan-2017]`). When a citation is referenced inline in code or docs, the comment links to the handle so a grep finds every consumer.
- **Used for:** lists where the source appears (file + section/line).
- **Supports the claim:** one sentence on what the source is being cited *for* in this tool — not a full abstract.
- **Verified:** your initials + the date you pulled the actual paper or guideline. A blank `Verified:` field means the citation surfaced in a Claude session and has **not** yet been confirmed by the maintainer.
- A source marked `needs verification` should not be quoted in a clinical letter, chart note, or council deliberation until the bibliographic detail is confirmed.
- **PubMed pass, 2026-10-31.** Every journal citation below was looked up in PubMed in a Claude session; entries that matched now carry a PMID and a `Verified:` line saying so, with maintainer initials still pending. That pass confirms the paper exists and the details are right. Where the abstract bears on the claim the tool makes, the entry says whether it supports it; a claim the abstract does not reach is marked as such rather than assumed.

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
- [§10 Toe walking & gait](#10-toe-walking--gait)
- [§11 Primary care hand-back](#11-primary-care-hand-back)

---

## 1. ABA therapy & ASD management — medical-necessity evidence base

The four citations in this section are the complete reference set the tool surfaces in the ABA Letter of Medical Necessity and the A&P note's ASD management plan. They are the references payors, school districts, and TRICARE/ChampVA reviewers see. Each is conditionally enumerated (Ref. 1 through Ref. 3 or 4 depending on `young` and `isMilitary` flags) so the in-letter numbering tracks the actual citations included.

### `[hyman-2020]` — AAP Clinical Practice Guideline on ASD

Hyman SL, Levy SE, Myers SM, et al.; Council on Children with Disabilities, Section on Developmental and Behavioral Pediatrics. **Identification, Evaluation, and Management of Children With Autism Spectrum Disorder.** *Pediatrics.* 2020;145(1):e20193447. doi:10.1542/peds.2019-3447 (PMID 31843864)

- **Used for:** A&P note reference #1 ([autism-ap-builder.html:3305](../autism-ap-builder.html#L3305)); ABA letter reference #1 ([autism-ap-builder.html:4554](../autism-ap-builder.html#L4554)).
- **Supports the claim:** AAP-endorsed standard of care for identification, evaluation, and management of ASD — the canonical citation for medical-necessity arguments in the ABA letter.
- **Verified:** bibliographic details confirmed against PubMed PMID 31843864 on 2026-10-31 (Claude session; published online 2019-12-16, print issue January 2020) — maintainer initials pending

### `[weitlauf-ahrq-2014]` — AHRQ Comparative Effectiveness Review on ABA

Weitlauf AS, McPheeters ML, Peters B, et al. **Therapies for Children with Autism Spectrum Disorder: Behavioral Interventions Update.** Comparative Effectiveness Review No. 137. Rockville, MD: Agency for Healthcare Research and Quality; 2014. <https://www.ncbi.nlm.nih.gov/books/NBK241444> (PMID 25210724)

- **Used for:** A&P note reference #2 ([autism-ap-builder.html:3306](../autism-ap-builder.html#L3306)); ABA letter reference #2 ([autism-ap-builder.html:4555](../autism-ap-builder.html#L4555)).
- **Supports the claim:** AHRQ-level evidence base for ABA-class behavioral interventions; the federal-agency citation that strengthens medical-necessity arguments for payors.
- **Verified:** partially, 2026-10-31 (Claude session). A PubMed search on author Weitlauf AS plus the exact title returns PMID 25210724, the NCBI Bookshelf record for this report, so the report exists under this title and lead author. PubMed's metadata service does not return Bookshelf records and the Bookshelf page blocked automated reading, so report number, co-authors, and year were not re-read. Maintainer to open NBK241444 and initial.

### `[reichow-cochrane-2018]` — Cochrane EIBI review

Reichow B, Hume K, Barton EE, Boyd BA. **Early intensive behavioral intervention (EIBI) for young children with autism spectrum disorders (ASD).** *Cochrane Database Syst Rev.* 2018;(5):CD009260. doi:10.1002/14651858.CD009260.pub3 (PMID 29742275; PMC6494600)

- **Used for:** A&P note reference #3 and ABA letter reference #3 — only when the patient is `young` (toddler or preschool). ([autism-ap-builder.html:3307, 4556](../autism-ap-builder.html#L3307)).
- **Supports the claim:** Cochrane-level evidence base for EIBI in the under-6 cohort specifically. Citing this for an older patient would overstate scope, which is why the tool age-gates the reference.
- **Caution for payer-facing use:** the review itself rates the evidence low to very low quality (GRADE) and concludes there is "weak evidence" that EIBI may help some children; five studies, one of them randomized. It is a fair citation for "EIBI has a systematic-review evidence base in under-6s" but not for "strong evidence." A reviewer who reads the abstract will see that wording.
- **Verified:** bibliographic details confirmed against PubMed PMID 29742275 on 2026-10-31 (Claude session) — maintainer initials pending

### `[nasem-2025]` — National Academies on TRICARE Autism Care Demonstration

National Academies of Sciences, Engineering, and Medicine. **The Comprehensive Autism Care Demonstration: Solutions for Military Families.** Washington, DC: National Academies Press; 2025. doi:10.17226/29139

- **Used for:** A&P note reference and ABA letter reference — only when `isMilitary` is true ([autism-ap-builder.html:3308, 4557, 4592](../autism-ap-builder.html#L3308)).
- **Supports the claim:** NASEM evaluation reaffirming medical necessity and effectiveness of ABA for military-connected ASD; gated to TRICARE/ChampVA patients because that is where the rebuttal value sits.
- **Verified:** title, publisher, year, and DOI confirmed on the National Academies publication page (nationalacademies.org/publications/29139) on 2026-10-31 (Claude session). The page's summary is consistent with the claim: it finds ABA meets the Department of Defense's own standard for reliable medical evidence and recommends ABA be authorized as a TRICARE Basic benefit. Not a PubMed-indexed source. Maintainer initials pending.

### `[aap-2025-asd]` — AAP 2025 ASD timing-based urgency (needs verification)

Referenced in an inline comment as `AAP-2025` ([autism-ap-builder.html:3660](../autism-ap-builder.html#L3660)). **Full bibliographic details have not been entered into the tool** — the comment refers to clinical-experience-based timing-urgency differentiation said to be aligned with AAP 2025. Confirm whether this is the same as `[hyman-2020]` (the most recent AAP CPG) or a newer 2025 statement before quoting in any external letter.

- **Used for:** rationale comment only; no patient-facing output.
- **Supports the claim:** unclear — pending maintainer verification.
- **Likely identity (2026-10-31 PubMed pass):** possibly `[rodan-2025]`, but this is an inference from location, not a match. The comment sits inside the genetics-referral block, and Rodan is the 2025 AAP report the tool already cites for genetic evaluation. Rodan's abstract does not mention regression, and its full text is not in PubMed Central, so whether it discusses regression at all was not checked. One narrow PubMed search (AAP-authored *Pediatrics* items with "autism" or "regression" in the title) found no 2025 statement; that does not rule one out. If the maintainer confirms, re-point the comment to `[rodan-2025]` and retire this entry.
- **Verified:** **needs verification**

---

## 2. Cognitive assessment — IQ/DQ psychometrics, screening, BIF

### `[pitts-mervis-2016]` — KBIT-2 floor effects in Williams syndrome

Pitts CH, Mervis CB. **Performance on the Kaufman Brief Intelligence Test-2 by Children With Williams Syndrome.** *Am J Intellect Dev Disabil.* 2016;121(1):33–47. doi:10.1352/1944-7558-121.1.33 (PMID 26701073; PMC5005797)

- **Used for:** floor-effect warning comment ([autism-ap-builder.html:6249](../autism-ap-builder.html#L6249)); branching-logic.md §11.6 floor-effect warning rationale.
- **Supports the claim:** Brief IQ screeners (specifically KBIT-2R) have documented floor effects in young children, making KBIT-2R results unreliable for distinguishing BIF from mild ID/GDD under age 5. Drives the passive floor-effect warning that fires on `screener × {toddler, preschool}`.
- **How far the paper reaches (2026-10-31):** narrower than the claim. It studied 292 children aged 4–17 with Williams syndrome on the KBIT-2 (not the later KBIT-2 Revised). It found the test lacks easy enough items for the lowest-scoring quarter of 4-year-olds, and works for all but the very lowest-functioning 5- to 7-year-olds. That is a real floor effect at age 4, but in one genetic syndrome and one edition; it does not by itself establish floor effects for brief IQ screeners in young children generally. The on-screen warning's wording ("Brief IQ screeners specifically (e.g., KBIT-2R) have documented floor effects in children under 5") is broader than this source.
- **Verified:** bibliographic details confirmed against PubMed PMID 26701073 on 2026-10-31 (Claude session). The previous entry had the wrong title and pages (54–64); corrected here. Claim support: partial, see above. Maintainer initials pending.

### `[greenspan-2017]` — Argument against the BIF category

Greenspan S. **Borderline intellectual functioning: an update.** *Current Opinion in Psychiatry.* 2017;30(2):113–122. doi:10.1097/YCO.0000000000000317 (PMID 28079674)

- **Used for:** BIF never-auto-bridge rationale comments in autism-ap-builder.html (grep "Greenspan 2017"; several sites, around the specifier bridge and the withSuspected* degradation path); branching-logic.md §11.7 BIF asymmetry; branching-logic-for-clinicians.html.
- **Supports the claim:** BIF (R41.83) is a contested clinical-attention category. Greenspan argues for dropping BIF entirely. Drives the no-auto-bridge rule for `borderline` → `withBIF` and the prohibition on a `withSuspectedBIF` specifier.
- **Verified:** bibliographic details confirmed against PubMed PMID 28079674 on 2026-10-31 (Claude session). The abstract supports the claim directly: it argues the BIF category be dropped rather than elevated to a formal disorder. Note it is a single-author opinion review, not a consensus statement. Maintainer initials pending.

### `[aacap-id-practice-parameter]` — AACAP Practice Parameter on intellectual disability

Siegel M, McGuire K, Veenstra-VanderWeele J, et al. **Practice Parameter for the Assessment and Treatment of Psychiatric Disorders in Children and Adolescents With Intellectual Disability (Intellectual Developmental Disorder).** *J Am Acad Child Adolesc Psychiatry.* 2020;59(4):468–496. doi:10.1016/j.jaac.2019.11.018 (PMID 33928910)

- **Used for:** branching-logic.md §11.6 (floor-effect warning rationale); cognitive-profile audit framework (IQ-reliability boundary); inline comment beside the floor-effect warning ([autism-ap-builder.html:6249](../autism-ap-builder.html#L6249)).
- **Supports the claim:** IQ testing is unreliable under age 5; brief screener results in this age range cannot reliably distinguish BIF from mild ID/GDD. Drives the under-6 age gate on ID-tier cogProfile selections.
- **Verified:** bibliographic details confirmed against PubMed PMID 33928910 on 2026-10-31 (Claude session). The previous entry dropped "Psychiatric Disorders in" from the title; corrected here. **Claim support not confirmed:** this parameter's subject is co-occurring psychiatric disorders in children with ID, and its abstract says nothing about IQ reliability under 5. The full text may; it was not read. DSM-5-TR's own definition of Global Developmental Delay (reserved for children under 5 when severity cannot be reliably assessed) states the age-5 boundary directly and may be the cleaner source. Maintainer to decide.

### `[aacn-2020]` — AACN consensus on uniform labeling

Guilmette TJ, Sweet JJ, Hebben N, et al. **American Academy of Clinical Neuropsychology consensus conference statement on uniform labeling of performance test scores.** *Clin Neuropsychol.* 2020;34(3):437–453. doi:10.1080/13854046.2020.1722244 (PMID 32037942)

- **Used for:** cognitive-profile audit meta-finding (`AACN labeling alignment`); not currently cited inline in the tool.
- **Supports the claim:** AACN consensus replaced "borderline" with "below average" (FSIQ 70–79) and "low average" (FSIQ 80–89) in performance-test labeling. Surfaced as a meta-finding for future PR consideration — not yet acted on, but motivates the BIF source qualifier in PR-D (commit c77eb8f).
- **Verified:** bibliographic details confirmed against PubMed PMID 32037942 on 2026-10-31 (Claude session). The AACN abstract does not list the score bands, but the `[wexler-2023]` abstract (also PubMed) states them exactly as above, describing this statement as placing children formerly called "borderline" into low average (80–89) or below average (70–79). Maintainer initials pending.

### `[wexler-2023]` — BIF vs low-average adaptive functioning

Wexler D, Pritchard AE, Ludwig NN. **Characterizing and comparing adaptive and academic functioning in children with low average and below average intellectual abilities.** *Clin Neuropsychol.* 2023;37(6):1239–1256 (published online 2022-07-14). doi:10.1080/13854046.2022.2096484 (PMID 35833873)

- **Used for:** cognitive-profile audit meta-finding (`AACN labeling alignment`).
- **Supports the claim:** No meaningful adaptive-functioning difference between FSIQ 70–79 and 80–89 groups, suggesting the BIF/low-average distinction may be an artificial construct. Reinforces `[greenspan-2017]` and `[aacn-2020]`.
- **How far the paper reaches (2026-10-31):** mostly, with two qualifiers. In 2,516 clinically referred children aged 6–13, the two groups did not differ in overall, social, or practical adaptive functioning, but the low-average group was slightly stronger in the conceptual domain. The "artificial construct" reading is this tool's inference; the authors' own conclusion is that adaptive functioning should be measured even when FSIQ is not extremely low. The sample is a referral clinic, not the general population.
- **Verified:** bibliographic details confirmed against PubMed PMID 35833873 on 2026-10-31 (Claude session). The earlier placeholder author "Wexler B" was wrong (first author is Danielle Wexler) and the title was a paraphrase; both corrected. Maintainer initials pending.

---

## 3. Genetic evaluation

The two citations below are the **only** two genetics citations the tool emits (superscripts ¹ and ² in the A&P note Plan section at [autism-ap-builder.html:3698–3699](../autism-ap-builder.html#L3698); the reference lines themselves are the `gxCitations` array at 3749–3750). Other clinical concepts mentioned in the genetics referral prose — Fragile X (FMR1) testing, chromosomal microarray (CMA), exome/genome sequencing as first-tier, screening for treatable inborn errors of metabolism — are framed as deriving from `[rodan-2025]` and `[srivastava-2019]` rather than being separately cited. If a future edit adds a Plan-section claim that cannot be sourced to one of these two papers, add the new citation here and add an inline superscript marker in the Plan text.

### `[rodan-2025]` — AAP Council on Genetics clinical report on ID/GDD

Rodan LH, Stoler J, Chen E, Geleske T; Council on Genetics. **Genetic evaluation of the child with intellectual disability or global developmental delay: clinical report.** *Pediatrics.* 2025;156(1):e2025072219. doi:10.1542/peds.2025-072219 (PMID 40545261)

- **Used for:** A&P note Plan section, genetic evaluation rationale ([autism-ap-builder.html:3749](../autism-ap-builder.html#L3749)).
- **Supports the claim:** AAP guidance on genetic evaluation indications for children with ID or GDD — drives the genetic referral recommendation when cogProfile is in the ID/GDD tiers.
- **Verified:** bibliographic details confirmed against PubMed PMID 40545261 on 2026-10-31 (Claude session) — maintainer initials pending

### `[srivastava-2019]` — Exome sequencing as first-tier for NDD

Srivastava S, Love-Nichols JA, Dies KA, et al. **Meta-analysis and multidisciplinary consensus statement: exome sequencing is a first-tier clinical diagnostic test for individuals with neurodevelopmental disorders.** *Genet Med.* 2019;21(11):2413–2421. doi:10.1038/s41436-019-0554-6 (PMID 31182824; PMC6831729)

- **Used for:** A&P note Plan section, genetic evaluation rationale ([autism-ap-builder.html:3750](../autism-ap-builder.html#L3750)).
- **Supports the claim:** Multidisciplinary consensus that exome sequencing should be a first-tier test in NDD evaluation. Strengthens the genetic referral language for payors.
- **Verified:** bibliographic details confirmed against PubMed PMID 31182824 on 2026-10-31 (Claude session). The abstract supports the claim directly (exome yield 36% vs 15–20% for microarray; proposes exome first). Maintainer initials pending.

---

## 4. Service coverage & insurance

### `[apa-dsm-5-2013]` — DSM-5 (2013 first edition)

American Psychiatric Association. **Diagnostic and Statistical Manual of Mental Disorders, Fifth Edition (DSM-5).** Arlington, VA: American Psychiatric Publishing; 2013.

- **Used for:** ABA letter opening paragraph ([autism-ap-builder.html:4564](../autism-ap-builder.html#L4564)).
- **Supports the claim:** Standard diagnostic reference cited in the ABA letter opening for medical-necessity framing. The tool uses 2013 in the letter rather than DSM-5-TR (2022) because the 2013 edition is the originally-named reference for the ASD criteria.
- **Verified:**

### `[nasem-2025]` (re-used)

See §1 above. Cited additionally in the ABA letter evidence paragraph for military-connected patients ([autism-ap-builder.html:4592](../autism-ap-builder.html#L4592)).

---

## 5. Comorbidity & medication

### `[fl-bhc-2022]` — Florida Best Practice Psychotherapeutic Medication Guidelines, 2022-2023

University of South Florida, Florida Center for Behavioral Health Improvements and Solutions (Florida Medicaid Drug Therapy Management Program for Behavioral Health). **2022-2023 Florida Best Practice Psychotherapeutic Medication Guidelines for Children and Adolescents.** Tampa, FL: University of South Florida; 2023. <https://floridabhcenter.org/child-guidelines/2022-2023-florida-best-practice-psychotherapeutic-medication-guidelines-for-children-and-adolescents/>

- **Used for:** every medication block of the A&P note (`RX_DOSE_SOURCE`: "Doses follow the 2022-2023 Florida Best Practice Psychotherapeutic Medication Guidelines for Children and Adolescents and are confirmed with the attending"); the "Medication reasoning" sentences of the ADHD, anxiety, depression and OCD blocks for a child without confirmed autism; the OCD block's combination and 8 to 12 week statements; the sleep block's short-term-use, taper and not-recommended lines; `RX_MELATONIN`.
- **Why this source:** the attending named it as the clinic's dose reference on 2026-11-13 ("Dose should be taken from the ... Florida Best Practice Psychotherapeutic Medication Guidelines ... but clear with attendings"). The note prints no dose from it; the clinician types the dose.
- **Supports the claim (read in the 72-page PDF the attending supplied, 2026-11-13):**
  - ADHD, ages 6 to 17. Level 1: "Psychostimulant monotherapy (methylphenidate class or amphetamine class ...). If first choice is ineffective, try monotherapy with another stimulant". Level 2: extended-release alpha-2 agonist with a stimulant or alone, "Atomoxetine or Viloxazine monotherapy". Level 0: "closely monitor height, weight and appetite ... periodically monitor pulse and blood pressure".
  - Anxiety, ages 6 to 17. Level 2: "Initiate treatment with fluoxetine or sertraline monotherapy or in combination with CBT. Combination therapy with CBT has been shown to be more effective than medication alone. Review boxed warning with family and monitor for treatment emergent suicidality and behavioral activation".
  - Major depression, ages 6 to 17. Level 1: active support for 6 weeks if mild. Level 2: "Fluoxetine or combination of CBT or IPT psychotherapy with fluoxetine"; "May consider use of escitalopram for age 12 years and above".
  - OCD, ages 6 to 17. Level 1b: moderate to severe, "start with combination of behavioral therapy (CBT + ERP) and an FDA approved monotherapy with an SSRI such as sertraline (6+ years and older)". Treatment considerations: time to full effect "may be long (8-12 weeks)".
  - Insomnia. Level 2: melatonin "administered from 30 to 60 minutes prior to the desired bedtime"; "Consider recommending the use of pharmaceutical grade melatonin". Table 11 gives different ceilings for children and adolescents, which is why the note prints no milligrams. Level 3: "Pharmacotherapy should only be considered for short-term use"; clonidine is tapered. Not recommended list includes amitriptyline, benzodiazepines, doxepin, first and second generation antipsychotics, and zolpidem.
- **Not from this source:** the guideline does not address ADHD, anxiety or depression treatment in autistic children specifically. Sentences in the note that begin "this clinic" are the attending's stated practice, not the guideline's.
- **Watch item:** a Florida Department of Health document titled *GUIDANCE: Avoidance of Psychotropic Pharmacotherapy in Children*, posted July 2026 on floridahealth.gov, surfaced in an earlier search. It could not be read (image-only PDF). Worth the maintainer reading, since it may bear on these lines. A newer edition of the guideline, when published, replaces this entry and the year printed in `RX_DOSE_SOURCE`.
- **Verified:** 2026-11-13, full text (PDF supplied by the attending). The quoted passages above were read; the dose tables were not transcribed because no dose is printed.

### `[rupp-2005]` — methylphenidate in autism with hyperactivity

Research Units on Pediatric Psychopharmacology Autism Network. Randomized, controlled, crossover trial of methylphenidate in pervasive developmental disorders with hyperactivity. *Arch Gen Psychiatry.* 2005;62(11):1266-1274. [doi:10.1001/archpsyc.62.11.1266](https://doi.org/10.1001/archpsyc.62.11.1266). PMID 16275814.

- **Used for:** the ADHD block's reasoning sentence with confirmed autism ("49% of 72 children in one trial"; "side effects stop treatment more often"); the `adhd` row of `PCP_DEFS` ("more stimulant side effects").
- **Supports the claim:** Abstract: "Thirty-five (49%) of 72 enrolled subjects were classified as methylphenidate responders"; adverse effects were more frequent than in typically developing children with ADHD, and 13 of 72 (18%) stopped for them.
- **Verified:** 2026-11-12, PubMed abstract.

### `[king-2009]` and `[herscu-2020]` — SSRI trials in autism targeted repetitive behavior

King BH, Hollander E, Sikich L, et al. Lack of efficacy of citalopram in children with autism spectrum disorders and high levels of repetitive behavior. *Arch Gen Psychiatry.* 2009;66(6):583-590. [doi:10.1001/archgenpsychiatry.2009.30](https://doi.org/10.1001/archgenpsychiatry.2009.30). PMID 19487623.

Herscu P, Handen BL, Arnold LE, et al. The SOFIA study: negative multi-center study of low dose fluoxetine on repetitive behaviors in children and adolescents with autistic disorder. *J Autism Dev Disord.* 2020;50(9):3233-3244. [doi:10.1007/s10803-019-04120-y](https://doi.org/10.1007/s10803-019-04120-y). PMID 31267292.

- **Used for:** the anxiety block's reasoning sentence with confirmed autism ("No SSRI has been tested against placebo for anxiety in autistic youth; the autism SSRI trials targeted repetitive behavior").
- **Supports the claim:** both trials recruited for repetitive behavior, not anxiety. The sentence replaced an earlier one that said SSRIs "showed NO superiority over placebo" for anxiety, which these trials cannot show.
- **Verified:** 2026-11-12. King 2009 full text; Herscu 2020 PubMed abstract.

### `[ozonoff-2011]` and `[ozonoff-2024]` — sibling recurrence

Ozonoff S, Young GS, Carter A, et al. Recurrence risk for autism spectrum disorders: a Baby Siblings Research Consortium study. *Pediatrics.* 2011;128(3):e488-e495. [doi:10.1542/peds.2010-2825](https://doi.org/10.1542/peds.2010-2825). PMID 21844053.

Ozonoff S, Young GS, Bradshaw J, et al. Familial Recurrence of Autism: Updates From the Baby Siblings Research Consortium. *Pediatrics.* 2024;154(2). [doi:10.1542/peds.2023-065297](https://doi.org/10.1542/peds.2023-065297). PMID 39011552.

- **Used for:** the note's Anticipatory Guidance sibling line ("About 1 in 5 younger siblings of an autistic child are later diagnosed with autism (Ozonoff 2011; Ozonoff 2024)"). These two are named in the chart note itself.
- **Supports the claim:** 18.7% (2011) and 20.2%, 95% CI 16.6 to 24.3 (2024). Autism only; the earlier wording "ASD/developmental risk (~10–20%)" mixed outcomes.
- **Verified:** 2026-11-12, full text of both (PMC). The 2024 article number is not shown in the PubMed record.

### `[mcelhanon-2014]` — gastrointestinal symptoms in autism

McElhanon BO, McCracken C, Karpen S, Sharp WG. Gastrointestinal symptoms in autism spectrum disorder: a meta-analysis. *Pediatrics.* 2014;133(5):872-883. [doi:10.1542/peds.2013-3995](https://doi.org/10.1542/peds.2013-3995). PMID 24777214.

- **Used for:** the GI problem block's Assessment sentence ("more common in autistic children than in comparison children").
- **Supports the claim:** odds ratio 4.42 (95% CI 1.90 to 10.28) against study controls; constipation, diarrhea and abdominal pain were each more common. The note used to say "4-5x more frequently", which restates an odds ratio as a frequency; no multiple is printed now.
- **Verified:** 2026-11-12, PubMed abstract.

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
- **Supports the claim:** Code assignments throughout the tool. F88 has no severity sub-coding in ICD-10-CM — the rationale for carrying GDD severity as a prose adjective at output (a maintainer clinical-judgment call; see the retired `[mehler-2016]` entry).
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

Hoyme HE, Kalberg WO, Elliott AJ, et al. **Updated Clinical Guidelines for Diagnosing Fetal Alcohol Spectrum Disorders.** *Pediatrics.* 2016;138(2):e20154256. doi:10.1542/peds.2015-4256 (PMID 27464676; PMC4960726)

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
  - **§300.8(b)** — developmental delay, ages three through nine or a subset, subject to §300.111(b); (b)(1) names the five developmental areas (physical, cognitive, communication, social or emotional, adaptive). Consumed by the Developmental Delay eligibility candidate, the `ddConsider` paragraph, and the GDD-marked `evalDomains` sentence.
  - **§300.8(c)(1)** Autism, **(c)(6)** Intellectual disability, **(c)(9)** Other health impairment, **(c)(10)** Specific learning disability, **(c)(11)** Speech or language impairment. Consumed by the eligibility candidates and the Autism-category ask.
  - **§300.34(a)** — related services expressly include "speech-language pathology and audiology services... physical and occupational therapy." Consumed by `ruleOutRelatedSvcNote`.
  - **§300.111(a)(1)(i) and (c)(1)** — child find; (c)(1) expressly reaches children suspected of having a disability "even though they are advancing from grade to grade." Consumed by `ruleOutEvalRequest`. Note that §300.111(a)(1) is framed as a **State** obligation ("The State must have in effect policies and procedures to ensure that..."), so the letter states the requirement in the passive voice and attributes the district-level duty to the introductory text of Florida Rule 6A-6.0331, which is where it actually sits.
  - **§300.301(b)** — either a parent or the public agency may request an initial evaluation. **§300.301(c)(1)** — the 60-day evaluation timeline, or the State's timeframe where the State sets one. Consumed by `ruleOutEvalRequest` and the evaluation-timeline paragraph.
  - **§300.304(c)(6)** — the evaluation must be "sufficiently comprehensive to identify all of the child's special education and related services needs, whether or not commonly linked to the disability category in which the child has been classified." Consumed by `ruleOutDxRest`.
  - **§300.306(c)(1)(i)** — in interpreting evaluation data the agency must draw on information from a variety of sources, expressly including "information about the child's physical condition, social or cultural background, and adaptive behavior." Consumed by `ruleOutDxRest`.
  - **§300.324(b)(1)(ii)(C)** — the IEP Team must revise the IEP as appropriate to address "information about the child provided to, or by, the parents." Consumed by the `schoolDoc === 'iep'` branch.
- **Supports the claim:** that IDEA eligibility rests on an educationally-defined disability category plus a resulting need for special education, not on any particular medical diagnosis — the load-bearing argument of the ASD-ruled-out letter.
- **Verified:** DM 2026-08-21. Read in full on eCFR by Claude the same day; maintainer reviewed and confirmed. Cleared for clinical use.

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
| 6A-6.03016 | 12/15/2009 | ESE Eligibility for Students with Emotional/Behavioral Disabilities | Emotional/Behavioral Disability candidate |
| 6A-6.03018 | 1/7/2016 | Exceptional Education Eligibility for Students with Specific Learning Disabilities | SLD candidate, suspected-SLD impact bullet, `psychoed` service block |
| 6A-6.03023 | 4/1/2015 | ESE Eligibility for Students With Autism Spectrum Disorder | Autism-category ask on confirmed and suspected letters |
| 6A-6.03027 | 9/20/2022 | Special Programs for Children Three Through Nine Years Old who are Developmentally Delayed | Developmental Delay candidate; `ddConsider` paragraph and GDD-marked `psychoed` block on confirmed/suspected letters; GDD-marked `psychoed` bullet in the A&P note |
| 6A-6.03028 | 8/27/2024 | Provision of Free Appropriate Public Education (FAPE) and Development of Individual Educational Plans for Students with Disabilities | FAPE reference in the 504 branch (subsection (1)); the IEP Team's duty to revise the IEP to address information provided by the parents, on the IEP-in-place branch ((3)(j)2.c.); (3)(g)1., the Team's duty to consider student strengths, is deliberately NOT cited — see note below |
| 6A-1.0943 | 7/14/2021 | Statewide Assessment for Students with Disabilities | Florida Alternate Assessment, in the `sped` block and `accomIDMod` |

Independent cross-check: the introductory text of 6A-6.0331 itself enumerates the ESE eligibility rules by number, and every rule number this tool cites appears in that list.

**Citation density was deliberately reduced on 2026-08-21.** A ruled-out letter carried 17 legal citations against 2 in a confirmed-autism letter. The maintainer's direction was to cite "as a pediatrician would and not a lawyer, in a way that increases likelihood of collaboration." In-prose citations were cut to the few that carry real weight and reframed in a collaborative register; category citations now appear only in the eligibility list, where they route a referral rather than argue a case, and each carries its Florida rule alone since that is the one a Florida district operates under. The letter now carries 10. Several federal sections remain verified and documented here but are no longer surfaced in the letter — that is intentional, not drift.

**6A-6.03028 was added on 2026-08-21 after the maintainer asked whether it was relevant.** It was not cited before, and it should have been: it is the Florida rule that governs FAPE and IEP development, which is the entire subject of this letter. Three provisions now carry citations, each chosen because it converts something the letter merely asks for into something the district owes:

- **(1) Entitlement to FAPE** — extends to "any individual student with a disability who needs special education and related services, even though the student has not failed or been retained in a course or grade, and is advancing from grade to grade." This is the Florida analogue to 34 C.F.R. §300.111(c)(1), and it is stronger: it frames a passing student's entitlement as FAPE, not merely as a child-find duty.
- **(3)(j)2.c.** — the IEP Team must revise the IEP as appropriate to address "Information about the student provided to, or by, the parents." The exact Florida parallel to 34 C.F.R. §300.324(b)(1)(ii)(C), which the letter already cited. A Florida district acts on the Florida rule.
- **(3)(g)1.** — the Team must consider "The strengths of the student and the concerns of the parents for enhancing the education of their student." This was briefly cited on the strengths sentence and **reverted the same day at the maintainer's direction**. The rule is real and does oblige the team; the letter deliberately does not invoke it. The strengths sentence is the one warm, child-centred line in an otherwise heavily-cited document, and converting it into a compliance obligation cost more in tone than the leverage was worth. Do not re-add it. A comment at the source site says the same.

- **Supports the claim:** the Florida-specific eligibility and procedural hooks a district in this region actually applies. Florida splits the single federal "speech or language impairment" category into two separate eligibilities (6A-6.03012 and 6A-6.030121) with different criteria and different evaluators, which is why the letter can list both.
- **Verified:** DM 2026-08-21. Checked against the adopted rule text at flrules.org and cross-checked on Cornell LII by Claude the same day; maintainer reviewed and confirmed. Cleared for clinical use.

**A consequential error was found and corrected on 2026-08-21.** The tool cited "Florida Rule 6A-6.0331(3)(d)" for a "60 **school** day" initial-evaluation timeline. Both halves were wrong:

- **(3)(d)** is the general-education-intervention documentation requirement, not a timeline.
- **(3)(f)** does carry a 60-school-day rule, but only for consent signed **on or before June 30, 2015**. It is a legacy provision.
- **(3)(g)** is the operative rule: initial evaluations must be completed within **sixty (60) calendar days** of the district's receipt of parent consent, excluding school holidays and breaks, summer vacation, and student absences beyond eight school days, with a limited extension for district closure due to inclement weather or natural disaster (added effective 9/23/2025).

Sixty school days is roughly three calendar months; sixty calendar days is about two. Every evaluation-request letter the tool produced before this fix handed the district a month it does not have.

**Watch item, and it is development-stage only.** A multi-rule Notice of Rule Development published 3/16/2026 (Vol. 52/51, notice 30620298) covers **6A-6.030121**, **6A-6.03018**, and **6A-6.0331** among others, "to ensure students with disabilities are properly identified and served under the requirements of the Individuals with Disabilities Education Act and state laws." As of 2026-08-21 it remains at the development stage: not proposed, not adopted, not effective, and **nothing from it is cited in this tool.** Florida rulemaking runs Development, then Proposed, then Final; watch for a Final notice before assuming any of these rule numbers or their content has changed.

A second item, further along: **6A-6.03028 has a Notice of Proposed Rule** from the 2026 session (House Bill 1279, Section 14, amending s. 1003.5716, F.S.) requiring parents to be notified when a scheduled related service is not delivered. Proposed is one stage past development but still **not adopted**, and nothing from it is cited. It is worth watching specifically because it bears on delivery of the speech, occupational, and physical therapy this letter requests: if adopted, a district would owe the family notice when those sessions are missed.

The Developmental Delay age language is quoted from the adopted 9/20/2022 text of 6A-6.03027: "A child who is developmentally delayed is three (3) through nine (9) years of age, or through the student's completion of grade 2, whichever occurs first," with eligibility criterion (2)(a) reading "The child is three (3) through nine (9) years of age, unless the child has completed grade 2." That 2022 amendment is what widened this rule from three-through-five to three-through-nine, and it also renamed the rule. The letter reflects the current adopted version, not the superseded one.

### `[section-504]` — Section 504 of the Rehabilitation Act

Section 504 of the Rehabilitation Act of 1973, 29 U.S.C. §794; implementing regulations at 34 C.F.R. Part 104.

- **Used for:** referenced by name, not by section number, in the `schoolDoc === '504'` branch, which argues a 504 accommodation plan may be insufficient to provide FAPE and asks the team to evaluate IEP eligibility.
- **Supports the claim:** that a 504 plan and an IEP are different instruments with different scope and enforceability. The 504 disability definition is functional rather than diagnosis-dependent — 34 C.F.R. §104.3(j)(1) covers a person who "has a physical or mental impairment which substantially limits one or more major life activities," and §104.3(j)(2)(ii) lists learning among those activities. Part 104 still uses the term "handicapped person"; the tool does not reproduce that term.
- **Verified:** DM 2026-08-21. §104.3 read in full on eCFR by Claude the same day; maintainer reviewed and confirmed. Cleared for clinical use.

---

## 10. Toe walking & gait

Citations behind the toe-walking / gait problem in the A&P note (`gaitFindings()`, docs/branching-logic.md §7.10). They print in a numbered "References (gait):" list, in order of first use, only when that problem prints. They never reach the ABA or IEP letters. Gathered 2026-10-31 by a multi-agent research pass whose claims were cross-checked, then each confirmed against PubMed.

### `[gelfer-2024]` — BSCOS/APCP Delphi consensus on idiopathic toe walking

Gelfer Y, McNee AE, Harris JD, et al. **The management of idiopathic toe walking.** *Bone Joint J.* 2024;106-B(10):1190-1196. doi:10.1302/0301-620X.106B10.BJJ-2024-0466.R1 (PMID 39348908)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** Definition (bilateral from walking onset, beyond age 2, no neurologic cause); autism/ADHD do not exclude the diagnosis; no treatment needed without contracture, pain, or other impact; non-surgical treatment first, orthopaedic referral when it fails; CK not required at primary assessment; neurodiverse children offered treatment with counseling about recurrence. Drives `gaitFindings().ptIndicated` / `observeOnly` / the no-routine-CK rule.
- **Verified:** bibliographic details confirmed against PubMed PMID 39348908 on 2026-10-31 (Claude session) — maintainer initials pending. The 31 approved statements were read from the publisher's full text the same day; the abstract alone does not list them.

### `[barrow-2011]` — Persistent toe walking in autism (clinic sample)

Barrow WJ, Jaworski M, Accardo PJ. **Persistent toe walking in autism.** *J Child Neurol.* 2011;26(5):619-621. doi:10.1177/0883073810385344 (PMID 21285033)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** Persistent toe walking in 20.1% and tight heel cords in 12.0% of 324 children with ASD at a developmental pediatrics clinic. Supports "toe walking is more common in autistic children."
- **Verified:** bibliographic details confirmed against PubMed PMID 21285033 on 2026-10-31 (Claude session) — maintainer initials pending

### `[leyden-2019]` — Autism and toe walking in US private-payer claims

Leyden J, Fung L, Frick S. **Autism and toe-walking: are they related? Trends and treatment patterns between 2005 and 2016.** *J Child Orthop.* 2019;13(4):340-345. doi:10.1302/1863-2548.13.180160 (PMID 31489038)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** 8.4% of children with ASD vs 0.47% of typically developing children had a toe-walking code; without intervention 63.6% vs 19.3% still carried it within 10 years; persistence after treatment was similar in both groups. Supports "resolves without treatment less often" and the recurrence-counseling line. Caveat: outcome is a persisting billing code, not observed gait; private-payer only.
- **Verified:** bibliographic details confirmed against PubMed PMID 31489038 on 2026-10-31 (Claude session) — maintainer initials pending

### `[haynes-2018]` — Neurologic causes of toe walking after orthopaedic referral

Haynes KB, Wimberly RL, VanPelt JM, et al. **Toe walking: a neurological perspective after referral from pediatric orthopaedic surgeons.** *J Pediatr Orthop.* 2018;38(3):152-156. doi:10.1097/BPO.0000000000001115 (PMID 29309384)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** Red flags for a neurologic cause (concerning birth history, late walking, unilateral toe walking, upper or lower motor neuron signs); 71% of unilateral toe walkers had cerebral palsy; ankle contracture did not predict a neurologic cause. Drives `GAIT_RED_FLAGS` and the "tight heel cord alone" sentence. Caveat: tertiary pre-selected cohort.
- **Verified:** bibliographic details confirmed against PubMed PMID 29309384 on 2026-10-31 (Claude session) — maintainer initials pending

### `[noritz-2013]` — AAP clinical report on motor delays

Noritz GH, Murphy NA, et al. **Motor delays: early identification and evaluation.** *Pediatrics.* 2013;131(6):e2016-e2027. doi:10.1542/peds.2013-1056 (PMID 23713113)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** Brain MRI for children with high muscle tone; serum CK for those with decreased tone. Drives the MRI and low-tone CK lines and the gait-only assessment sentence.
- **Verified:** bibliographic details confirmed against PubMed PMID 23713113 on 2026-10-31 (Claude session) — maintainer initials pending. The third author position is a collective panel name that PubMed did not return; the tool prints "et al."

### `[ciafaloni-2009]` — Delayed diagnosis in Duchenne muscular dystrophy

Ciafaloni E, Fox DJ, Pandya S, et al. **Delayed diagnosis in Duchenne muscular dystrophy: data from the Muscular Dystrophy Surveillance, Tracking, and Research Network (MD STARnet).** *J Pediatr.* 2009;155(3):380-385. doi:10.1016/j.jpeds.2009.02.007 (PMID 19394035)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** About 2.5-year delay from first symptoms to DMD diagnosis; authors recommend early CK in boys with unexplained developmental delay. Supports the CK line. Applying it to toe walking with weakness signs is an inference, not something the study tested.
- **Verified:** bibliographic details confirmed against PubMed PMID 19394035 on 2026-10-31 (Claude session) — maintainer initials pending

### `[caserta-cochrane-2019]` — Cochrane review of interventions for idiopathic toe walking

Caserta AJ, Pacey V, Fahey M, et al. **Interventions for idiopathic toe walking.** *Cochrane Database Syst Rev.* 2019;10(10):CD012363. doi:10.1002/14651858.CD012363.pub2 (PMID 31587271; PMC6778693)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** Four trials, one with usable data; casting plus botulinum toxin vs casting alone showed no clear difference, very low certainty. Supports "evidence is limited and of low certainty" and "adding botulinum toxin to casting has not shown clear benefit." Do not strengthen this to "botulinum toxin does not help."
- **Verified:** bibliographic details confirmed against PubMed PMID 31587271 on 2026-10-31 (Claude session) — maintainer initials pending

### `[van-kuijk-2014]` — Systematic review of treatment for idiopathic toe walking

van Kuijk AA, Kosters R, Vugts M, Geurts AC. **Treatment for idiopathic toe walking: a systematic review of the literature.** *J Rehabil Med.* 2014;46(10):945-957. doi:10.2340/16501977-1881 (PMID 25223807)

- **Used for:** autism-ap-builder.html, toe-walking/gait problem block (`GAIT_REFS`, after the DCD problem); docs/branching-logic.md §7.10.
- **Supports the claim:** Preliminary evidence that casting and surgery improve passive dorsiflexion and walking mechanics, though gait does not normalize; functional benefit not demonstrated. Supports the orthopaedics line. The abstract also says botulinum toxin does not improve casting and that only surgery has effects beyond 1 year; the tool deliberately does not repeat either, because a cross-check against the Cochrane review rated them as stronger than the evidence supports.
- **Verified:** bibliographic details confirmed against PubMed PMID 25223807 on 2026-10-31 (Claude session) — maintainer initials pending

---

## Retired

### `[mehler-2016]` — retired 2026-10-31: citation does not appear to exist

Was listed as: Mehler MF, Mehler MF. "Classification of mild and minor developmental delay." *JAMA Pediatrics.* 2016. Cited for descriptive mild/moderate/severe severity language on F88 Global Developmental Delay in the under-6 cohort.

- **Why retired:** a PubMed search on 2026-10-31 found no such paper: nothing by any Mehler on developmental delay, and no 2016 *JAMA Pediatrics* article with "developmental delay" in the title. The only Mark F. Mehler in PubMed researches Huntington's disease and neural stem cells, and the doubled author line suggests the reference was generated rather than copied from a source.
- **What changed:** the only inline consumer, the comment above `gddSevWord()` in autism-ap-builder.html, now states the severity adjective is a maintainer clinical-judgment call. No note or letter output ever showed this citation, and output is unchanged. The design choice stands; if a real source is found later, add it as a new entry.

---

## 11. Primary care hand-back

Sources behind the Recommendations for Primary Care list (`PCP_DEFS` in `autism-ap-builder.html`; `docs/branching-logic.md` §13). None of these is printed in the note, the list, or either letter: they are cited from code comments and from §13.6. Every entry below was checked against its PubMed record in a Claude session on 2026-11-12. Guideline full texts could not be opened in that session (publisher sites were blocked), so each `Supports the claim` line says whether the claim rests on the abstract or on full text. `[hyman-2020]` (§1), `[noritz-2013]`, `[gelfer-2024]` (§10), `[idea-34cfr300]` (§9) and `[apa-dsm-5-tr-2022]` (§6) are reused by §13 and keep their own entries.

### `[lipkin-2020]` — AAP clinical report on developmental surveillance and screening

Lipkin PH, Macias MM; Council on Children With Disabilities, Section on Developmental and Behavioral Pediatrics. **Promoting optimal development: identifying infants and young children with developmental disorders through developmental surveillance and screening.** *Pediatrics.* 2020;145(1):e20193449. doi:10.1542/peds.2019-3449 (PMID 31843861)

- **Used for:** docs/branching-logic.md §13.6; the `sibling` row of `PCP_DEFS` (autism screening at the 18- and 24-month visits).
- **Supports the claim:** Abstract states that children with a diagnosed developmental disorder are identified as having special health care needs "with initiation of chronic condition management in the pediatric medical home", and gives general developmental screening at 9, 18 and 30 months with autism screening at 18 and 24 months. This is the basis for placing ongoing care with primary care. It does not say that subspecialty follow-up is unnecessary; no guideline found does.
- **Verified:** bibliographic details and the quoted abstract wording confirmed against PubMed PMID 31843861 on 2026-11-12 (Claude session). The corporate-author string was not returned by PubMed and should be checked on the article page. Maintainer initials pending.

### `[wolraich-2019]` — AAP clinical practice guideline for ADHD

Wolraich ML, Hagan JF Jr, Allan C, et al; Subcommittee on Children and Adolescents With Attention-Deficit/Hyperactive Disorder. **Clinical practice guideline for the diagnosis, evaluation, and treatment of attention-deficit/hyperactivity disorder in children and adolescents.** *Pediatrics.* 2019;144(4):e20192528. doi:10.1542/peds.2019-2528 (PMID 31570648; PMC7067282)

- **Used for:** docs/branching-logic.md §13.6; the `adhd` row of `PCP_DEFS` (primary care continues ADHD medication once the dose is stable and checks heart rate and blood pressure).
- **Supports the claim:** Full text read (PMC). The guideline is written for the primary care clinician, treats ADHD as a chronic condition managed in the medical home, and encourages monitoring of heart rate and blood pressure; it gives no visit interval in the guideline text itself. Read with `[barbaresi-2020]`, which points the other way for a child who also has autism.
- **Verified:** bibliographic details confirmed against PubMed PMID 31570648 on 2026-11-12 (Claude session); the points above were read in the PMC full text in that session. Maintainer initials pending.

### `[barbaresi-2020]` — SDBP clinical practice guideline for complex ADHD

Barbaresi WJ, Campbell L, Diekroger EA, et al. **Society for Developmental and Behavioral Pediatrics clinical practice guideline for the assessment and treatment of children and adolescents with complex attention-deficit/hyperactivity disorder.** *J Dev Behav Pediatr.* 2020;41 Suppl 2S:S35-S57. doi:10.1097/DBP.0000000000000770 (PMID 31996577)

- **Used for:** docs/branching-logic.md §13.6; the `tAdhd` row of `PCP_DEFS` (re-refer when ADHD symptoms remain impairing despite treatment).
- **Supports the claim:** Abstract defines ADHD with a coexisting condition (autism included) as complex ADHD that warrants specialist assessment, and names an inadequate response to treatment as a reason for that assessment. This is why the list sends treatment failure back to DBP. The guideline states no number of failed trials; "two failed medication trials" was searched for and is in no source.
- **Verified:** bibliographic details confirmed against PubMed PMID 31996577 on 2026-11-12 (Claude session). Abstract only; the key action statement wording was not read. Maintainer initials pending.

### `[williams-buckley-2020]` — AAN practice guideline on insomnia in autism

Williams Buckley A, Hirtz D, Oskoui M, et al. **Practice guideline: Treatment for insomnia and disrupted sleep behavior in children and adolescents with autism spectrum disorder: report of the Guideline Development, Dissemination, and Implementation Subcommittee of the American Academy of Neurology.** *Neurology.* 2020;94(9):392-404. doi:10.1212/WNL.0000000000009033 (PMID 32051244; PMC7238942)

- **Used for:** the note's sleep-disorder block with confirmed autism ("Melatonin is the only sleep medication the AAN autism sleep guideline (2020) recommends"); `RX_MELATONIN`; the `sleepRecheck`, `sleep` and `tSleep` rows of `PCP_DEFS` (behavioral sleep plan first, melatonin alongside it, come back if both fail); docs/branching-logic.md §13.6.
- **Supports the claim (AAN Practice Guideline Summary for Clinicians, 3 pages, supplied by the attending and read 2026-11-13):** assess coexisting conditions and review medications that disrupt sleep; behavioral strategies "as a first-line treatment approach"; "offer melatonin ... if behavioral strategies have not been helpful"; "write a prescription for melatonin or recommend using a high-purity pharmaceutical grade"; "a low dose (one to three mg per day), 30 to 60 minutes before bedtime, and titrate to effect, not exceeding 10 mg per day"; counsel on adverse effects "and the lack of long-term safety data" (all Level B). Melatonin is the only medication it makes a recommendation for.
- **Corrected 2026-11-13:** the note briefly said "No other sleep medication has been studied in autistic children (AAN 2020)". The summary does not say that, and the full guideline text was not read, so the sentence now states only what the summary shows.
- **Dose discrepancy, left to the attending:** this guideline allows up to 10 mg per day in autistic children and adolescents; the Florida guideline's Table 11 caps children at 3 mg and adolescents at 10 mg, with a 0.5 to 1 mg start for children `[fl-bhc-2022]`. The note prints no milligrams and names the Florida guideline as the dose reference, per the attending. The 4 to 6 week reassessment is this clinic's practice, not a guideline number.
- **Not yet used:** the Level B recommendation to counsel families on melatonin's adverse effects and the lack of long-term safety data. The note does not print it.
- **Verified:** bibliographic details against PubMed PMID 32051244 on 2026-11-12; clinician summary read in full 2026-11-13. The full *Neurology* article was not read.

### `[aguinaldo-2021]` — ASQ validated in primary care and outpatient specialty clinics

Aguinaldo LD, Sullivant S, Lanzillo EC, et al. **Validation of the ask suicide-screening questions (ASQ) with youth in outpatient specialty and primary care clinics.** *Gen Hosp Psychiatry.* 2021;68:52-58. doi:10.1016/j.genhosppsych.2020.11.006 (PMID 33310014; PMC7855604)

- **Used for:** autism-ap-builder.html, comment on the `mood` row of `PCP_DEFS`; docs/branching-logic.md §13.6.
- **Supports the claim:** In 515 youth aged 10 to 21, the ASQ had 100% sensitivity in both the outpatient specialty and the primary care samples (specificity 91.2% and 87.9%). Supports naming the ASQ as the suicide-risk screen a PCP can use at the mood and safety recheck. The sample was not an autism sample and did not include children under 10.
- **Verified:** bibliographic details and figures confirmed against PubMed PMID 33310014 on 2026-11-12 (Claude session). PubMed lists the electronic publication date as November 2020; the volume year is 2021 and should be checked on the article page. Maintainer initials pending.

### `[horowitz-2012]` — Original ASQ development study

Horowitz LM, Bridge JA, Teach SJ, et al. **Ask Suicide-Screening Questions (ASQ): a brief instrument for the pediatric emergency department.** *Arch Pediatr Adolesc Med.* 2012;166(12):1170-1176. doi:10.1001/archpediatrics.2012.1276 (PMID 23027429; PMC6889955)

- **Used for:** autism-ap-builder.html, comment on the `mood` row of `PCP_DEFS`; docs/branching-logic.md §13.6.
- **Supports the claim:** Derivation of the four-question ASQ in 524 emergency department patients aged 10 to 21 (sensitivity 96.9%, specificity 87.6%). Cited as the origin of the instrument; `[aguinaldo-2021]` is the evidence for use outside the emergency department.
- **Verified:** bibliographic details and figures confirmed against PubMed PMID 23027429 on 2026-11-12 (Claude session). Maintainer initials pending.

### `[forrest-2000]` — What referring pediatricians value in a specialist's letter

Forrest CB, Glade GB, Baker AE, Bocian A, von Schrader S, Starfield B. **Coordination of specialty referrals and physician satisfaction with referral care.** *Arch Pediatr Adolesc Med.* 2000;154(5):499-506. doi:10.1001/archpedi.154.5.499 (PMID 10807303)

- **Used for:** docs/branching-logic.md §13.6 (why each action row names an owner and why the follow-up lines always print).
- **Supports the claim:** Across 963 referrals from 122 pediatricians, a stated plan for co-managing the patient was the only letter element significantly related to the referring physician's overall satisfaction. Supports the list's shape. It measured physician satisfaction, not child outcomes.
- **Verified:** bibliographic details confirmed against PubMed PMID 10807303 on 2026-11-12 (Claude session). Abstract only. Maintainer initials pending.

### `[baum-2024]` — DBP workforce supply, 2020 to 2040

Baum RA, Berman BD, Fussell JJ, et al. **Child health needs and the developmental-behavioral pediatrics workforce supply: 2020-2040.** *Pediatrics.* 2024;153(Suppl 2). doi:10.1542/peds.2023-063678H (PMID 38300001)

- **Used for:** docs/branching-logic.md §13.6 (why the feature exists).
- **Supports the claim:** About 1.0 DBP subspecialist per 100,000 US children in 2023, projected to stay at 0.8 to 1.0 through 2040. Supports the premise that follow-up visits compete with new evaluations for a fixed supply. No study was found that tests whether handing stable patients back to primary care improves access or is safe; §13.6 says so.
- **Verified:** bibliographic details confirmed against PubMed PMID 38300001 on 2026-11-12 (Claude session). PubMed returned no page or e-locator; **needs verification** on the article page before quoting outside this repo. Maintainer initials pending.

### `[aap-mh-toolkit-2e]` — AAP Mental Health Toolkit, 2nd edition (needs verification)

American Academy of Pediatrics. **Addressing Mental Health Concerns in Pediatrics: A Practical Resource Toolkit for Clinicians, 2nd edition.**

- **Used for:** docs/branching-logic.md §13.6. Named by the maintainer on 2026-11-12 as the source primary care can draw on for the mood and safety recheck, together with the NIMH ASQ toolkit.
- **Supports the claim:** Not yet established. The maintainer's copy could not be read in the session that built the list (the folder was reachable but its files were not returned), so no wording in the `mood` row comes from it. The title above is from memory.
- **Verified:** **needs verification**. Title, edition, year and publisher detail are unconfirmed; do not quote from this entry.

### `[nimh-asq-toolkit]` — NIMH Ask Suicide-Screening Questions toolkit, outpatient pathway

National Institute of Mental Health. **Ask Suicide-Screening Questions (ASQ) Toolkit: Youth ASQ Toolkit, Outpatient Primary Care and Specialty Clinics.** <https://www.nimh.nih.gov/research/research-conducted-at-nimh/asq-toolkit-materials/youth-asq-toolkit>

- **Used for:** autism-ap-builder.html, the `mood` and `tSuicide` rows of `PCP_DEFS`; docs/branching-logic.md §13.6.
- **Supports the claim (read 2026-11-13: the outpatient clinical pathway, the Brief Suicide Safety Assessment guide and worksheet, the information sheet, the nurse script and the parent flyer):** screening is for ages 10 and older (8 and 9 with behavioral health complaints); a non-acute positive screen is followed by the Brief Suicide Safety Assessment (BSSA) before the patient leaves; the BSSA worksheet's dispositions are emergency evaluation, further evaluation with a mental health referral "preferably within 72 hours", non-urgent mental health follow-up, or no further intervention; every positive screen gets a safety plan and counseling on storing or removing lethal means.
- **Not from this source:** the local services named in `tSuicide` (UF Psychiatric Hospital (Vista), Meridian, SMA, Charlie Health, the Community Action Treatment team and its number, myflfamilies.com/catt). Those are the attending's list for this region (2026-11-13) and were not independently checked. The toolkit's accuracy in autistic youth, and any screen for a child under 10 or one who does not use speech, are not established in the sources read; the `mood` row says to ask the child and caregiver and names no tool for them.
- **Verified:** 2026-11-13, the six outpatient documents listed above, downloaded from nimh.nih.gov.

---

## Maintenance

**In-commit update rule** (mirrored in CLAUDE.md): when you add or remove a citation in any tracked file — inline JS comment, A&P note reference line, ABA letter reference line, IEP letter reference line, or anywhere in `docs/` — update this file in the same commit. Do not let drift accumulate.

### Adding a citation

1. Add an entry to this file with a `[short-handle]` (kebab-case, includes year — e.g., `[greenspan-2017]`).
2. In the inline location (code comment, A&P/ABA/IEP letter reference line, or prose), use the short handle so `grep -rn "[greenspan-2017]"` finds every consumer.
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
