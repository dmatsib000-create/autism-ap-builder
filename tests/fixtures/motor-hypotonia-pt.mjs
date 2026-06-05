// Unit 2 lock: hypotonia is now a standalone needsMotor value (split out of the
// former "Gross motor delays / hypotonia" checkbox) and independently triggers PT.
// This fixture sets ONLY hypotonia among motor needs (no 'gross') to prove the
// split works — pre-split, hypotonia had no separate key and rode on 'gross'.
// Golden captures: the needs-summary "Motor: hypotonia" line, the in-clinic PT
// block (rulePT fires on hypotonia alone), and the IEP PT goal for low tone.
//
// schoolSvc.pt_school is set directly (the golden lane does not run
// syncSchoolSvcFromNeeds); needsMotor.hypotonia is what fires rulePT for the note.
export default {
  name: 'motor-hypotonia-pt',
  describe: 'Confirmed ASD, school-age — hypotonia alone triggers PT (note + IEP), no gross motor delay',
  outputs: ['note', 'iep'],
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

    // Only hypotonia — deliberately NOT 'gross' — to prove independent PT trigger.
    S.needsMotor.add('hypotonia');

    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep';
    S.schoolSvc.add('pt_school');

    S.rtcInterval = '6 months';
  },
};
