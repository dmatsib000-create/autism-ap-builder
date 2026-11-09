// Boundary violations / impaired personal space in an ADOLESCENT with confirmed ASD.
// The boundaryViol checkbox is school-age+ only (render() hides it and clears the key
// for younger age groups), and adolescence is where it does the most work: the note's
// Functional Needs summary must NAME the finding (this was the last needsBehavior key
// that printed "  • Behavior/interfering: " with nothing after the colon), rulePsychotherapy
// fires on it at teen+, the plan adds the boundary-safety priority paragraph (consent,
// appropriate touch, ASD-adapted relationship education), the ABA letter carries the
// boundary_skills target and the no-safe-frequency specR line, and the IEP letter adds
// the "Boundary and personal space" accommodation. boundaryViol is the ONLY behavior
// key checked so every one of those lines is unambiguously boundaryViol-driven.
//
// abaTargets is set DIRECTLY (the golden lane does not run syncABATargetsFromNeeds).
export default {
  name: 'boundary-violations-adolescent',
  describe: 'Confirmed ASD, adolescent, boundary violations as the only interfering behavior; note + ABA + IEP',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.needsBehavior.add('boundaryViol');

    // Post-sync state (golden lane does not run syncABATargetsFromNeeds).
    S.abaTargets.add('boundary_skills');
    S.insuranceType = 'commercial';
    S.abaHours = '15';

    S.schoolPlacement = 'genEdSupport';
    S.schoolDoc = 'iep_needed';

    S.rtcInterval = '6 months';
  },
};
