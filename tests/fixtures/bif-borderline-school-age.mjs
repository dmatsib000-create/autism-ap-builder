// BIF-gating coverage: confirmed ASD with cognitive profile in the borderline
// (BIF) range and the withBIF specifier checked. bifSpecifierAllowed() gates
// withBIF on cogProfile==='borderline' AND a non-empty cogDataSource; withBIF
// is never auto-bridged (Greenspan 2017), so the clinician checks it manually —
// mirrored here by adding it to both specifiers and specifiersManuallySet.
//
// No other fixture uses cogProfile='borderline' or the withBIF specifier, so
// this is the only check on the BIF cognitive label and the withBIF specifier
// prose in the note. The IEP letter is included to cover BIF in that surface too.
export default {
  name: 'bif-borderline-school-age',
  describe: 'Confirmed ASD, school-age — borderline cognitive profile with the withBIF specifier',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'they';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'borderline';
    // Gate requires a data source; prior outside eval is the documented BIF path.
    S.cogDataSource = 'priorExternal';
    S.adaptProfile = 'belowPotential';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    // withBIF is checked manually (never auto-bridged); pin it so it survives.
    S.specifiers.add('withBIF');
    S.specifiersManuallySet.add('withBIF');

    S.needsSocial.add('reciprocity');
    S.needsBehavior.add('rigidity');

    S.schoolPlacement = 'genEdSupport';
    S.schoolDoc = 'iep';
    ['sped', 'slp_school', 'counseling'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '6 months';
  },
};
