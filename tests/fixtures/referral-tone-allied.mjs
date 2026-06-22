// School-age, SUSPECTED ASD, with speech-sound + oral-motor + fine-motor needs.
// Coverage lock for the council-ratified allied-provider tone softening (2026-06-22). This is the
// only fixture that exercises the three reframed referral lines, so without it those edits ship
// untested:
//   - SLP motor-speech / CAS line — now "Differential includes... assessment and treatment
//     approach rest with the treating SLP"; the method names (DTTC, Nuffield, ReST) are gone.
//   - oral-motor swallowing line — now "may be warranted prior to feeding therapy" (was the
//     sequence-command "is indicated before feeding therapy begins"). No feeding Dx here, so the
//     non-MBSS variant fires.
//   - OT visual-perceptual line — subtest enumeration (form constancy, figure-ground, etc.) dropped.
// Suspected (not confirmed) so ABA is hidden and SLP is the FIRST therapy section, which also locks
// the print-once collaborative-deference lead-in firing before SLP when no ABA section precedes it.
export default {
  name: 'referral-tone-allied',
  describe: 'School-age suspected ASD; speech-sound + oral-motor + fine-motor — locks softened SLP/OT referral prose + lead-in',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';

    S.diagStatus = 'suspected';
    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b1');

    // Fires hasAnyArticulation() -> SLP articulation + motor-speech/CAS line
    S.langModifiers.add('speechSound');
    // Fires the oral-motor / swallowing line (no feeding Dx -> the non-MBSS variant)
    S.needsComm.add('oral_motor');
    S.needsComm.add('expressive');
    // Fires the OT visual-perceptual line
    S.needsMotor.add('fine');

    S.rtcInterval = '3 months';
  },
};
