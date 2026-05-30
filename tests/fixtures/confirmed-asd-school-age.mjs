// Confirmed ASD, school-age, Level 1/1, on an IEP, ABA recommended.
// Exercises: confirmed diagnosis branch, DSM criteria lines, ABA letter
// (confirmed-only gate), IEP letter (schoolDoc set + not toddler).
export default {
  name: 'confirmed-asd-school-age',
  describe: 'Confirmed ASD, school-age, Level 1 SC / 1 RRB, IEP in place, ABA recommended',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';
    S.adaptiveStandardized = true;

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');
    S.needsSocial.add('peer');
    S.needsBehavior.add('rigidity');
    S.needsBehavior.add('noncompliance');

    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    ['sped', 'slp_school', 'social_skills_school', 'visual'].forEach(k => S.schoolSvc.add(k));

    S.insuranceType = 'commercial';
    S.abaHours = '20';
    ['comm', 'imitation', 'play', 'transitions'].forEach(k => S.abaTargets.add(k));

    S.rtcInterval = '6 months';
  },
};
