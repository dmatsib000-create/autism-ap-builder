// Confirmed ASD, school-age, community safety as the only functional need, with elopement and
// Medical ID counseling checked. Covers the Community Safety block's identification line
// dropping both the GPS device (named in the Elopement/Wandering line) and the medical ID
// (named in the Medical ID line), leaving only the "If I am found" card.
export default {
  name: 'community-safety-medid',
  describe: 'Confirmed ASD, school-age, community safety + elopement + Medical ID counseling (no repeated ID)',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'they';
    S.langLevel = 'ageAppropriate';
    S.diagStatus = 'confirmed';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.needsAdaptive.add('commSafety');
    S.safety.add('elopement_counsel');
    S.safety.add('medID');
    S.rtcInterval = '6 months';
  },
};
