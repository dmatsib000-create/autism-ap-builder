// Comprehensive outside evaluation returned on a still-suspected note, no
// outcome selected. Locks: the "Comprehensive diagnostic evaluation completed
// ... Report reviewed." lines, the neutral default outcome sentence ("Results
// reviewed and incorporated into the diagnostic formulation."), the neutral
// "Comprehensive Evaluation Pathway" heading, and pendingTesting flipping off
// (immediate ABA-waitlist wording) once the report is back.
export default {
  name: 'uncertaincomp-completed-suspected',
  describe: 'Suspected preschool, comprehensive eval report back, no outcome picked — neutral completed rendering',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'they';
    S.langLevel = 'singleWords';
    S.cogProfile = 'unknown';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'uncertainComp';
    S.evalDxStatus = 'done';

    S.needsComm.add('expressive');
    S.needsBehavior.add('tantrums');

    S.rtcInterval = '3 months';
  },
};
