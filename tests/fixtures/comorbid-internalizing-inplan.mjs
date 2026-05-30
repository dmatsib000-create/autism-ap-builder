// Comorbid-plan coverage: confirmed ASD with three internalizing comorbidities
// (anxiety, depression, OCD) all promoted into the plan via comorbidInPlan.
// The existing adhd-comorbid-adolescent fixture covers the ADHD plan block and
// an anxiety "note only" entry; nothing exercises the anxiety/depression/OCD
// *in-plan* prose blocks. This fixture pins those three, so a regression in any
// of their plan-block generators (or the comorbidInPlan gating) shows up as a
// golden diff instead of shipping a wrong or missing management block.
export default {
  name: 'comorbid-internalizing-inplan',
  describe: 'Confirmed ASD, adolescent — anxiety + depression + OCD all in the plan (not note-only)',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'she';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'belowPotential';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.needsSocial.add('perspective');

    // The three internalizing comorbidities, each promoted into the plan.
    ['anxiety', 'depression', 'ocd'].forEach(k => {
      S.comorbid.add(k);
      S.comorbidInPlan.add(k);
    });

    S.rtcInterval = '3 months';
  },
};
