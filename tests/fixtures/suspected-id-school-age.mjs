// Suspected INTELLECTUAL DISABILITY in a school-age child (IQ tier) — the
// counterpart to suspected-preschool-gdd, which covers the developmental tier.
// Locks the IQ-tier arm of the comprehensive-evaluation referral: cognitive
// battery (WISC-V/WPPSI-IV/DAS-II/SB-5), KBIT-2R named as the insufficient
// screener, and eligibility phrased for Intellectual Disability alone.
//
// Before this fixture existed, NO golden set withSuspectedID, so the IQ-tier
// referral paragraph was unlocked — the tier-split fix could have silently
// rewritten it with nothing failing. Both tiers are now pinned.
export default {
  name: 'suspected-id-school-age',
  describe: 'Suspected ASD + suspected ID, school-age, screener-grade cognitive data — IQ-tier evaluation referral',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';

    S.cogProfile = 'id_mild';
    S.cogDataSource = 'screener';
    S.adaptProfile = 'moderatelyImpaired';
    S.adaptiveStandardized = false;

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'uncertainADOS';

    // Bridge-equivalent: the pathway recommends withSuspectedID for id_mild on
    // screener-grade data, but the bridge fires from DOM handlers the golden lane
    // cannot reach, so the fixture sets the specifier the bridge would have set.
    S.specifiers.add('withSuspectedID');

    S.needsComm.add('expressive');
    S.needsAdaptive.add('selfCare');
    S.needsBehavior.add('noncompliance');

    S.rtcInterval = '3 months';
  },
};
