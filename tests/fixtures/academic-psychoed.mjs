// Unit 5 lock: a flagged academic/learning concern routes to the psychoeducational-
// evaluation recommendation (the IDEA 60-school-day request). At runtime, checking
// "Academic / learning difficulties" auto-adds schoolSvc.psychoed via
// syncSchoolSvcFromNeeds (the unit lane locks that causation; the golden lane does not
// run the sync). Here schoolSvc.psychoed is set DIRECTLY to capture the resulting
// OUTPUT: the note's School / Educational Supports psychoed line and the IEP letter's
// psychoed paragraph. S.academic is also set so the scenario reads coherently (its
// needs-summary "academic/learning" line appears too). No SLD comorbidity is set, so
// the academic concern is the only psychoed driver.
export default {
  name: 'academic-psychoed',
  describe: 'Confirmed ASD, school-age, academic concern — psychoeducational-evaluation recommendation in note + IEP letter',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'she';
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

    S.academic = true;            // the §4 driver
    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep_needed';   // enables the IEP letter
    S.schoolSvc.add('psychoed');  // post-sync state (golden lane does not run the sync)

    S.rtcInterval = '6 months';
  },
};
