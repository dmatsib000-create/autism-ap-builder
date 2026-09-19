// Prior-testing citation gate: a confirmed ASD case where the family brings BOTH an
// autism-specific instrument (ADOS-2, consistent) and an adaptive/behavior instrument
// (Vineland-3, consistent). The note's "Objective autism-specific assessment (...) is
// consistent with and supports this diagnosis" sentence must cite the ADOS-2 only.
// Before this gate the Vineland-3 leaked into that sentence as a raw key ('vineland3'),
// and once instrument labels were shared across surfaces it would have printed as a
// clean "Vineland-3", a clinically false claim that reads as intended. The Vineland-3
// still appears in the Prior Testing block, where it belongs.
export default {
  name: 'prior-adaptive-testing-confirmed',
  describe: 'Confirmed ASD, school-age — ADOS-2 and Vineland-3 both consistent; only the ADOS-2 may support the diagnosis',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';
    S.adaptiveStandardized = true;

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

    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');
    S.needsAdaptive.add('toileting');
    S.abaTargets.add('functional_comm');
    S.abaSetting.add('home');
    S.abaHours = '15';

    S.schoolDoc = 'iep';
    S.schoolSvc.add('sped');
    S.insuranceType = 'medicaid';
    S.rtcInterval = '6 months';
  },
};
