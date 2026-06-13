// Unit 6 lock — fecal smearing (scatolia) with a SUSPECTED medical contribution.
// smearWorkup='suspected' means the medical cause is NOT ruled out, so smearing
// contributes to ruleGI and the dedicated, medical-first Pediatric GI referral fires
// (constipation with overflow / encopresis, bowel-management plan). Captures all three
// surfaces: the note (Tier-2 specR line + the GI referral bullet), the ABA letter (the
// reduce_smearing target label, named clinically for the medical-necessity audience), and
// the IEP letter (discreet "Toileting and hygiene support" accommodation — never the
// graphic label, per the audience-tailoring guardrail).
//
// abaTargets is set DIRECTLY (the golden lane does not run syncABATargetsFromNeeds);
// smearing is the only GI trigger here (no comorbid GI, feeding, pica) so the GI bullet
// is unambiguously smearing-driven.
export default {
  name: 'smearing-suspected',
  describe: 'Confirmed ASD, school-age, fecal smearing with suspected medical cause — GI referral fires (medical-first); note + ABA + IEP',
  outputs: ['note', 'aba', 'iep'],
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
    S.smearWorkup = 'suspected';

    // Post-sync state (golden lane does not run syncABATargetsFromNeeds).
    S.abaTargets.add('reduce_smearing');
    S.insuranceType = 'commercial';
    S.abaHours = '20';

    S.schoolPlacement = 'genEd';
    S.schoolDoc = 'iep_needed';

    S.rtcInterval = '6 months';
  },
};
