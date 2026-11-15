// Confirmed ASD at a follow-up visit with no DSM-5 criteria re-ticked: the common
// follow-up case (maintainer, 2026-11-14). The summary must cite the earlier diagnosis
// with a year-and-setting fill-in instead of "0 of three Criterion A domains ... meets
// full DSM-5 criteria" and a pointer to a criteria table that does not print.
export default {
  name: 'confirmed-followup-no-criteria',
  describe: 'Confirmed ASD, school-age, follow-up visit, no criteria re-ticked',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.visitType = 'followup';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    S.needsSocial.add('peer');
    S.needsBehavior.add('tantrums');

    S.rtcInterval = '6 months';
  },
};
