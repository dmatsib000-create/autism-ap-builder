// Confirmed ASD, young adult, conversational, with co-occurring anxiety and
// depression. Exercises the youngAdult age branch (transition-age prose,
// adult-oriented plan language) and the comorbid mood/anxiety plan blocks.
// No school document — adults are past the IEP/504 path, so the IEP tab is
// intentionally not requested here.
export default {
  name: 'adult-asd-transition',
  describe: 'Confirmed ASD, young adult, conversational, co-occurring anxiety + depression, transition focus',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'youngAdult';
    S.pronouns = 'he';
    S.langLevel = 'conversational';
    S.cogProfile = 'average';
    S.cogDataSource = 'priorExternal';
    S.adaptProfile = 'belowPotential';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '1';
    S.asdLevelRRB = '1';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b3'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.comorbid.add('anxiety');
    S.comorbid.add('depression');
    S.comorbidInPlan.add('anxiety');
    S.comorbidInPlan.add('depression');

    S.needsSocial.add('conversation');
    S.needsSocial.add('perspective');
    S.needsAdaptive.add('commIndependence');
    S.safety.add('internet');

    S.rtcInterval = '6 months';
  },
};
