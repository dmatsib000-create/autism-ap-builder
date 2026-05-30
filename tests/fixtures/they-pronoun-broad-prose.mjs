// Verb-agreement net for the singular-"they" pronoun path.
//
// v3() rewrites third-person-singular verbs to the bare form when S.pronouns is
// 'they' ("they have", not "they has"), driven by a hardcoded V3_MAP. A finite
// verb missing from that map falls through silently to ungrammatical output and
// only fires a console.warn (see the WARY comment on v3() in the app, and
// docs/audits/verb-agreement.md). This fixture deliberately turns on as much
// prose as possible under one "they" patient — every needs category, ABA and
// IEP letters, comorbidities, ID specifier — so any verb that slips through the
// map surfaces as a captured warning, which the runner treats as a hard failure.
//
// The golden is the second line of defense: even a verb that doesn't warn (e.g.
// a wrong agreement produced some other way) shows up as a reviewable diff.
export default {
  name: 'they-pronoun-broad-prose',
  describe: 'Confirmed ASD, adolescent, singular-"they" — wide prose coverage for verb-agreement',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    S.ageGroup = 'adolescent';
    S.pronouns = 'they';
    S.langLevel = 'phrase';
    S.langModifiers.add('echolalic');
    S.cogProfile = 'unknown';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'severelyImpaired';
    S.adaptiveStandardized = true;

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '3';
    // Co-occurring ID as a specifier (set + pinned, mirroring protected state).
    S.specifiers.add('withID');
    S.specifiersManuallySet.add('withID');

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2', 'b3', 'b4'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    // Every needs category so each prose generator that uses a "they" subject runs.
    S.needsComm.add('functional_aac');
    S.needsComm.add('receptive');
    S.needsComm.add('expressive');
    S.needsSocial.add('reciprocity');
    S.needsSocial.add('peer');
    S.needsSocial.add('perspective');
    S.needsBehavior.add('rigidity');
    S.needsBehavior.add('aggression');
    S.needsBehavior.add('sib');
    S.needsBehavior.add('elopement');
    S.needsBehavior.add('noncompliance');
    S.needsAdaptive.add('commSafety');
    S.needsAdaptive.add('toileting');
    S.needsAdaptive.add('feeding_adl');
    S.needsSensory.add('seeking');
    S.needsSensory.add('avoiding');
    S.needsMotor.add('coordination');
    S.safety.add('elopement');
    S.safety.add('aggression');

    // Comorbidities to exercise the comorbid plan prose.
    S.comorbid.add('adhd_combined');
    S.comorbidInPlan.add('adhd_combined');
    S.comorbid.add('anxiety');

    S.schoolPlacement = 'selfContained';
    S.schoolDoc = 'iep';
    ['sped', 'slp_school', 'ot_school', 'aide', 'lowRatio', 'fba', 'esy', 'social_skills_school', 'visual'].forEach(k => S.schoolSvc.add(k));

    S.insuranceType = 'commercial';
    S.abaHours = '30';
    ['comm', 'sib', 'aggression', 'elopement', 'transitions'].forEach(k => S.abaTargets.add(k));

    S.rtcInterval = '3 months';
  },
};
