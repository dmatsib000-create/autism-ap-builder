// Locks the reduce_pica ABA-target LABEL in the ABA letter. The pica target was
// keyed `reduce_pica` everywhere except the TL label map (which had `pica_reduction`),
// so an active reduce_pica target rendered the raw key "reduce_pica" in the ABA
// letter's target list instead of a human label. This fixture sets reduce_pica as an
// active target and snapshots the ABA letter; the golden must show the proper label
// "Reduction of pica (ingestion of non-food items)", never the raw key.
//
// abaTargets is set DIRECTLY (the golden lane does not run syncABATargetsFromNeeds);
// needsBehavior.pica is set too so the scenario reads coherently.
export default {
  name: 'aba-target-pica-label',
  describe: 'Confirmed ASD with an active reduce_pica ABA target — ABA letter must show the pica label, not the raw key',
  outputs: ['aba'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'they';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.needsBehavior.add('pica');

    S.insuranceType = 'commercial';
    S.abaHours = '20';
    ['reduce_pica', 'reduce_sib'].forEach(k => S.abaTargets.add(k));

    S.rtcInterval = '6 months';
  },
};
