// Confirmed ASD, school-age, community safety as the only functional need, with elopement and
// road safety counseling checked. Covers the Community Safety block dropping the GPS and
// registry lines (the Elopement/Wandering line names them) while keeping the medical ID and
// "If I am found" card line, and no concern line (the counseling bullets above name it).
export default {
  name: 'community-safety-wandering',
  describe: 'Confirmed ASD, school-age, community safety + elopement/road counseling (ID line kept)',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'ageAppropriate';
    S.diagStatus = 'confirmed';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.needsAdaptive.add('commSafety');
    S.safety.add('elopement_counsel');
    S.safety.add('road_counsel');
    S.rtcInterval = '6 months';
  },
};
