// Unit 6 lock — fecal smearing (scatolia) with the medical cause RULED OUT.
// smearWorkup='ruled_out' means smearing stops contributing to ruleGI; with no other GI
// trigger set (no comorbid GI, feeding, or pica), the dedicated Pediatric GI referral is
// SUPPRESSED — re-referring an already-excluded cause is contradictory. The note must show
// the reduce_smearing behavioral target / Tier-2 specR line foregrounded, and NO
// "Pediatric GI" referral bullet. This is the contrast to smearing-suspected (which fires
// the GI referral); together they lock both branches of the ruleGI dedup clause.
//
// abaTargets is set DIRECTLY (the golden lane does not run syncABATargetsFromNeeds).
export default {
  name: 'smearing-ruled-out',
  describe: 'Confirmed ASD, school-age, fecal smearing with medical cause ruled out — GI referral SUPPRESSED, behavioral foregrounded',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
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

    S.needsBehavior.add('smearing');
    S.smearWorkup = 'ruled_out';

    // Post-sync state (golden lane does not run syncABATargetsFromNeeds). The behavioral
    // target persists even though the medical cause is ruled out.
    S.abaTargets.add('reduce_smearing');
    S.insuranceType = 'commercial';
    S.abaHours = '20';

    S.rtcInterval = '6 months';
  },
};
