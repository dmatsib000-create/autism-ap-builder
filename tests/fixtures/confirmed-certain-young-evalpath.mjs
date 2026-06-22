// Confirmed ASD, preschool, "fairly certain" eval path (certainYoung), CARS-2 not
// yet administered. Regression lock for the eval-path-on-confirmed fix: before the
// fix, selecting a Confirmed diagnosis suppressed ALL evaluation-path text while
// still opening the DIAGNOSTIC WORKUP section, leaving a bare header. The
// certainYoung/certainOlder ("fairly certain", CARS-2-backed) paths now survive a
// Confirmed diagnosis and render confirmed-framed wording ("Standardized Diagnostic
// Support", "formalizes the severity rating ... for the confirmed diagnosis"),
// while the uncertain*/devOnly paths stay suppressed. See branching-logic.md §2.1.
export default {
  name: 'confirmed-certain-young-evalpath',
  describe: 'Confirmed ASD, preschool, certainYoung eval path, CARS-2 pending — confirmed-framed workup text',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';
    S.adaptiveStandardized = true;

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    // The eval path under test: "fairly certain", young child, CARS-2 not yet done.
    S.dxEvalPath = 'certainYoung';
    S.cars2Done = false;

    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');
    S.needsBehavior.add('rigidity');

    S.rtcInterval = '6 months';
  },
};
