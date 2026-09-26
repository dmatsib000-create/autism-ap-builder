// DCD diagnosis with no motor box checked. DCD alone adds school OT and PT, so the OT paragraph
// must still carry the motor planning goal (it previously checked only the coordination box,
// leaving an OT recommendation with no goal).
export default {
  name: 'dcd-only-school-ot',
  describe: 'Suspected ASD, school-age, DCD comorbidity only, school OT + PT',
  outputs: ['iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.diagStatus = 'suspected';
    ['a1', 'a2'].forEach(k => S.criteriaA.add(k));
    S.criteriaB.add('b1');
    S.comorbid.add('dcd');
    S.comorbidInPlan.add('dcd');
    S.schoolDoc = 'iep_needed';
    ['ot_school', 'pt_school'].forEach(k => S.schoolSvc.add(k));
    S.rtcInterval = '3 months';
  },
};
