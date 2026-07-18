// Developmental-profile-only path with testing completed (preschool, so the
// KBIT-2R twin line is included). Locks the devOnly completed trio: both
// instrument lines pointing to the profile documented above, and the
// "Results have been incorporated into treatment planning..." closing line.
export default {
  name: 'devonly-completed',
  describe: 'Suspected preschool, devOnly path completed — profile cross-reference lines + incorporated-results closing',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'he';
    S.langLevel = 'phrases';
    S.cogProfile = 'unknown';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'devOnly';
    S.evalProfileStatus = 'done';

    S.needsComm.add('expressive');

    S.rtcInterval = '3 months';
  },
};
