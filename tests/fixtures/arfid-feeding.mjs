// Confirmed ASD, preschool, with co-occurring ARFID (sensory + fear mechanism).
// Exercises: feeding/ARFID problem block, GI referral rule, OT/SLP feeding
// content, growth-monitoring lines.
export default {
  name: 'arfid-feeding',
  describe: 'Confirmed ASD, preschool, co-occurring ARFID (sensory + fear of aversive consequences)',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'he';
    S.langLevel = 'phrase';
    S.cogProfile = 'average';
    S.cogDataSource = 'clinical';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2', 'b4'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.feeding = true;
    S.comorbid.add('arfid');
    S.arfidMechanism.add('sensory');
    S.arfidMechanism.add('fear');

    S.needsSensory.add('hypersensitivity');
    S.needsSensory.add('avoidance');
    S.needsComm.add('expressive');

    S.rtcInterval = '3 months';
  },
};
