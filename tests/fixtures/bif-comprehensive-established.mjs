// Borderline IQ confirmed by a COMPREHENSIVE battery — the contrast case to
// bif-screener-id-risk. Locks the negative half of the rule: with comprehensive
// data the summary states BIF as an established finding ("on comprehensive
// testing"), NO "does not exclude intellectual disability" language appears, and
// the confirmatory-evaluation referral must NOT fire (nothing left to confirm).
// If a future edit widens bifIdRisk() to include 'comprehensive', this golden
// breaks immediately.
export default {
  name: 'bif-comprehensive-established',
  describe: 'Confirmed ASD, school-age, borderline IQ on comprehensive battery — established BIF, no confirmatory referral',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'conversational';

    S.cogProfile = 'borderline';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'commensurate';
    S.adaptiveStandardized = true;

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.specifiers.add('withBIF');
    S.specifiersManuallySet.add('withBIF');

    S.needsSocial.add('peer');

    S.rtcInterval = '6 months';
  },
};
