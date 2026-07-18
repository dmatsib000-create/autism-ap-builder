// Mid-path workup completion: certainOlder with Step 1 (DP-4/KBIT-2R) completed and
// the CARS-2 still scheduled. Locks the split rendering — Step 1 past-tense with the
// profile cross-reference, Step 2 keeping its "to follow" action language — and that
// pendingTesting stays TRUE until the diagnostic step is done (the Family Resources
// ABA-waitlist step keeps the "Once testing results are available" wording).
export default {
  name: 'certainolder-step1-done',
  describe: 'Suspected school-age, certainOlder path, Step 1 completed / CARS-2 scheduled — live-plan split rendering',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'unknown';
    S.adaptProfile = 'mildlyImpaired';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'certainOlder';
    S.evalProfileStatus = 'done';

    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');
    S.needsBehavior.add('rigidity');

    S.rtcInterval = '3 months';
  },
};
