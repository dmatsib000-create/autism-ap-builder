// Autism ruled out for an adolescent who already holds an IEP. Exercises the
// existing-IEP branch of the ruled-out path: the category-review sentence (which
// tells the team to re-categorize rather than drop eligibility), and the empty
// eligibility-candidate case — nothing here derives a category, so the letter falls
// back to the clinician bracket instead of going out silent on category. Also pins
// the split core accommodations: the schedule item fires (sensory, emotional
// dysregulation, anxiety) but the visual item does not (no communication findings,
// conversational language, no intellectual disability).
export default {
  name: 'ruleout-asd-existing-iep',
  describe: 'ASD ruled out, adolescent, IEP already in place, no eligibility category derives',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'they';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';

    S.diagStatus = 'ruleOut';

    S.comorbid.add('anxiety');

    S.needsSensory.add('hypersensitivity');
    S.needsBehavior.add('rigidity');
    S.needsBehavior.add('tantrums');
    S.emotionalReg = true;

    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    ['sped', 'counseling', 'sensory', 'esy', 'social_skills_school'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '3 months';
  },
};
