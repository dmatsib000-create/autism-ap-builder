// Suspected ASD, school-age, IEP evaluation requested.
//
// Every other 'suspected' fixture in the suite is note-only, so before this one
// the entire suspected path through the IEP letter was untested: the "under
// evaluation" diagnosis line, the Z03.89 code with no severity level, the
// unconditional core accommodations with their across-the-spectrum rationale, and
// the Autism-category ask. All of those differ from both the confirmed and the
// ruled-out paths.
//
// Also carries S.strengths, so the strengths paragraph and its Florida citation
// (the IEP Team must consider student strengths and parent concerns) render.
export default {
  name: 'suspected-asd-iep-letter',
  describe: 'Suspected ASD, school-age, IEP evaluation requested, strengths documented',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'they';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';

    S.diagStatus = 'suspected';

    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b2');

    S.needsSocial.add('peer');
    S.needsSocial.add('reciprocity');
    S.needsBehavior.add('rigidity');
    S.needsSensory.add('hypersensitivity');

    S.strengths = 'strong visual memory, persistence with preferred tasks, and kindness toward younger children';

    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep_needed';
    ['sped', 'counseling', 'visual', 'fba'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '3 months';
  },
};
