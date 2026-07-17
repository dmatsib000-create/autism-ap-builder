// uncertainADOS path fully completed on a still-suspected note, ADOS-2 NOT
// consistent with ASD. Locks: the completed Step 2 ADOS-2 line, the
// not-consistent weighting sentence, the completed Step 1 cross-reference,
// and the neutral "ADOS-2 Pathway" heading (no certainty language).
export default {
  name: 'uncertainados-completed-notconsistent',
  describe: 'Suspected school-age, uncertainADOS both steps done, ADOS-2 not consistent — honest weighting language',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';

    S.diagStatus = 'suspected';
    S.dxEvalPath = 'uncertainADOS';
    S.evalProfileStatus = 'done';
    S.evalDxStatus = 'done';
    S.evalDxOutcome = 'notConsistent';

    S.needsSocial.add('peer');
    S.needsBehavior.add('rigidity');

    S.rtcInterval = '3 months';
  },
};
