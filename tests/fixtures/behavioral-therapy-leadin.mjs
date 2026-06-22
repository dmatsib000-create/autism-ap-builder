// School-age, suspected ASD, verbal, with anxiety + a peer-interaction social need and NO
// communication/motor/sensory/adaptive/behavior needs. This fires the three behavioral/
// psychological therapy sections (PCIT, Autism-Informed Psychotherapy, Social Skills) but NOT
// ABA/SLP/OT/PT.
//
// Regression lock for the lead-in call-site fix (2026-06-22): the collaborative-deference lead-in
// (therapyIntro()) was originally wired only into ABA/SLP/OT/PT, so on a note like this one it
// printed mid-block (before SLP, after PCIT) or, with no SLP/OT/PT at all, never. PCIT,
// psychotherapy, and social skills now also call therapyIntro(), so the lead-in leads the very
// first therapy section. This golden must show the lead-in sentence immediately before the PCIT
// header; if it drifts below PCIT the call-site coverage has regressed. See branching-logic.md 7.8.
export default {
  name: 'behavioral-therapy-leadin',
  describe: 'School-age suspected ASD, anxiety + social need only — lead-in must precede PCIT (no ABA/SLP/OT/PT)',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';

    S.diagStatus = 'suspected';
    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b1');

    // anxiety -> PCIT + Autism-Informed Psychotherapy; peer social need -> Social Skills.
    S.comorbid.add('anxiety');
    S.needsSocial.add('peer');

    S.rtcInterval = '3 months';
  },
};
