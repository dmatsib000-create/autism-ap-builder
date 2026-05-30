// Confirmed ASD, school-age, Level 3/3, nonverbal with AAC need, co-occurring
// intellectual disability, safety behaviors, self-contained placement, Medicaid.
// Exercises the severe end of the range: Level 3 language, withID specifier,
// AAC / adaptive-safety needs, interfering/safety behaviors driving ABA safety
// targets, the Medicaid insurance branch, and a self-contained school placement.
export default {
  name: 'nonverbal-level3-id',
  describe: 'Confirmed ASD, school-age, Level 3/3, nonverbal (AAC), co-occurring ID, safety behaviors, Medicaid',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'nonverbal';
    S.cogProfile = 'unknown';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'severelyImpaired';
    S.adaptiveStandardized = true;

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '3';
    S.asdLevelRRB = '3';
    // ID is a specifier, not a cognitive-profile tier. Set it directly and pin
    // it (no UI bridge runs in tests, but pinning mirrors the real protected state).
    S.specifiers.add('withID');
    S.specifiersManuallySet.add('withID');

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2', 'b3', 'b4'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.needsComm.add('functional_aac');
    S.needsComm.add('receptive');
    S.needsAdaptive.add('commSafety');
    S.needsAdaptive.add('toileting');
    S.needsAdaptive.add('feeding_adl');
    S.needsBehavior.add('aggression');
    S.needsBehavior.add('sib');
    S.needsBehavior.add('elopement');
    S.needsSensory.add('seeking');

    S.schoolPlacement = 'selfContained';
    S.schoolDoc = 'iep';
    ['sped', 'slp_school', 'ot_school', 'aide', 'lowRatio', 'fba', 'esy', 'visual'].forEach(k => S.schoolSvc.add(k));

    S.insuranceType = 'medicaid';
    S.abaHours = '40';
    ['comm', 'sib', 'aggression', 'elopement'].forEach(k => S.abaTargets.add(k));

    S.rtcInterval = '3 months';
  },
};
