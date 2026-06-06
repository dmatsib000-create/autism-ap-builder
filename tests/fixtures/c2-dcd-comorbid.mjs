// Locks the WITH-DCD branch of the OT/PT co-management line (C2 + the "(DCD)"
// review fix). The line appends " (DCD)" only when S.comorbid.has('dcd'); the
// they-pronoun-broad-prose fixture covers the no-DCD path (coordination need
// alone → bare "motor coordination difficulty is co-managed..."). This fixture
// sets the formal DCD comorbidity (plus a coordination need so the PT targets
// line renders cleanly), so the golden must show "motor coordination difficulty
// (DCD) is co-managed...". A regression that always-on or never-on the tag would
// surface here or in the they-pronoun golden.
export default {
  name: 'c2-dcd-comorbid',
  describe: 'Confirmed ASD with DCD comorbidity + coordination need — OT/PT co-management line names "(DCD)"',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    // Coordination need makes the PT targets list non-empty; the DCD comorbidity
    // is what flips the "(DCD)" tag on in the co-management line.
    S.needsMotor.add('coordination');
    S.comorbid.add('dcd');

    S.rtcInterval = '6 months';
  },
};
