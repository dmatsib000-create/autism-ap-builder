// Override-system coverage (resolveOv): a confirmed ASD case where the auto
// rules would INCLUDE ABA and EXCLUDE psychotherapy, with the clinician
// flipping both via S.overrides. The golden pins that resolveOv('aba','no')
// drops the ABA plan section entirely and resolveOv('psychotherapy','yes')
// forces the psychotherapy section in despite its rule. This is the only
// fixture that exercises the manual-override path (25 call sites); without it,
// a regression in resolveOv or the section gating would ship silently.
//
// Clinically plausible: a child already established in ABA elsewhere (so the
// clinician suppresses a duplicate recommendation) for whom individual
// psychotherapy is being added on judgment outside the auto rule.
export default {
  name: 'override-suppress-and-force',
  describe: 'Confirmed ASD, school-age — ABA force-excluded and psychotherapy force-included via overrides',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'average';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'mildlyImpaired';
    S.adaptiveStandardized = true;

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    // Behavior + social needs make ABA auto-include under ruleABA — so the
    // 'no' override below is what removes it, proving the suppress path.
    // Verified: with overrides reset to 'auto', ABA IS present and psychotherapy
    // is ABSENT in this exact state — so the golden's "ABA absent / psychotherapy
    // present" genuinely reflects the overrides, not the rules. If a rule change
    // ever makes ABA auto-exclude (or psychotherapy auto-include) here, this
    // fixture stops testing the override and the comment above is the tripwire.
    S.needsBehavior.add('rigidity');
    S.needsBehavior.add('noncompliance');
    S.needsSocial.add('reciprocity');
    S.needsSocial.add('peer');

    // The two overrides under test.
    S.overrides.aba = 'no';            // auto rule includes; force it out
    S.overrides.psychotherapy = 'yes'; // auto rule excludes; force it in

    S.insuranceType = 'commercial';
    S.rtcInterval = '6 months';
  },
};
