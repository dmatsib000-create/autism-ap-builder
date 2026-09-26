// Confirmed ASD, school-age, with community safety as the only functional need and no safety
// counseling box checked. Covers community safety alone not referring to outpatient OT, and
// the Community Safety block opening the Safety Counseling section on its own, with the
// equipment/registry lines and the {specify: ...} concern placeholder.
export default {
  name: 'community-safety-only',
  describe: 'Confirmed ASD, school-age, community safety only (no OT referral, Safety Counseling block)',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'ageAppropriate';
    S.diagStatus = 'confirmed';
    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.needsAdaptive.add('commSafety');
    S.rtcInterval = '6 months';
  },
};
