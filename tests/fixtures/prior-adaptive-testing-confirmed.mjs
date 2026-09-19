// Prior-testing citation gate, all three surfaces: a confirmed ASD case where the family
// brings BOTH an autism-specific instrument (ADOS-2, consistent) and an adaptive/behavior
// instrument (Vineland-3, consistent). Only the ADOS-2 may be cited as evidence for the
// diagnosis: the note's "Objective autism-specific assessment (...) supports this
// diagnosis" sentence and the ABA/IEP letters' "Supporting prior diagnostic assessments"
// clause all filter with ASD_DX_TEST_KEYS. The Vineland-3 appears only in the note's
// Prior Testing block under "Behavioral/adaptive assessments reviewed". Before this gate
// the Vineland-3 leaked into the note sentence as a raw key ('vineland3'); once labels
// were shared it would have printed as a clean "Vineland-3", a false claim that reads
// as intended. Setup is the minimum that makes all three outputs render.
export default {
  name: 'prior-adaptive-testing-confirmed',
  describe: 'Confirmed ASD, school-age — ADOS-2 and Vineland-3 both consistent; only the ADOS-2 may support the diagnosis',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '1';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.priorTesting.add('ados2');
    S.priorTestingOutcome.ados2 = 'consistent';
    S.ados2Module = 'Module 3';
    S.priorTesting.add('vineland3');
    S.priorTestingOutcome.vineland3 = 'consistent';

    // One communication and one social need so ruleABA includes ABA (ABA letter renders);
    // schoolDoc so the IEP letter renders.
    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');
    S.schoolDoc = 'iep';
  },
};
