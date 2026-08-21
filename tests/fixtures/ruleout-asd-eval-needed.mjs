// Autism ruled out at a school-age evaluation, no IEP or 504 in place yet.
// Exercises the ASD-ruled-out IEP letter path: the rule-out diagnosis paragraph
// (criteria not met + co-occurring diagnoses carried forward), the related-services
// note, the derived eligibility candidates (Other Health Impaired from ADHD,
// Language Impaired from the language disorder, Specific Learning Disability from
// the suspected SLD), and the conditional core accommodations — the schedule item
// fires on sensory/emotional-regulation findings, the visual item on communication
// findings, and neither is claimed as ASD-specific.
export default {
  name: 'ruleout-asd-eval-needed',
  describe: 'ASD ruled out, school-age, confirmed ADHD + language disorder, no IEP yet',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';

    S.diagStatus = 'ruleOut';

    ['a1'].forEach(k => S.criteriaA.add(k));

    ['adhd_combined', 'language_disorder', 'ld_suspected', 'anxiety'].forEach(k => S.comorbid.add(k));

    S.needsComm.add('expressive');
    S.needsComm.add('receptive');
    S.needsSensory.add('hypersensitivity');
    S.needsBehavior.add('noncompliance');
    S.emotionalReg = true;

    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep_needed';
    ['sped', 'slp_school', 'counseling', 'psychoed', 'fba', 'visual'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '6 months';
  },
};
