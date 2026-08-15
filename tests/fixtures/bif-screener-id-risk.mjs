// Borderline IQ reached by BRIEF SCREENER (the KBIT-2R case) — intellectual
// disability is NOT yet excluded. Locks the whole derived ID-risk path:
//   - the clinical-summary clause carries the screening qualifier and the
//     "does not exclude intellectual disability" language (previously this
//     rendered identically to a WISC-V-grounded BIF call);
//   - the confirmatory-evaluation referral fires WITHOUT any suspected-ID
//     specifier being set, and names both routes by which ID can still be the
//     answer (comprehensive score in the ID range, or confirmed borderline plus
//     impaired adaptive functioning);
//   - the withBIF specifier line keeps its own screener parenthetical.
// Deliberately sets withBIF manually (the bridge never auto-asserts it) so the
// note exercises the specifier line and the derived risk state together.
export default {
  name: 'bif-screener-id-risk',
  describe: 'Confirmed ASD, school-age, borderline IQ on brief screener — ID not excluded, confirmatory eval referral fires',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';

    S.cogProfile = 'borderline';
    S.cogDataSource = 'screener';
    S.adaptProfile = 'mildlyImpaired';
    S.adaptiveStandardized = false;

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

    S.needsComm.add('expressive');
    S.needsSocial.add('peer');

    S.rtcInterval = '6 months';
  },
};
