// Sleep dedup guard (needsSummaryLines): when §4 S.sleep AND §5 sleep_disorder
// are BOTH set and sleep_disorder is promoted in-plan, the lightweight "sleep"
// echo is suppressed from the "Additional concerns:" line, because the coded
// sleep-disorder problem block already documents it. Mirrors the SLEEP MANAGEMENT
// dedup at the note-generator's sleep block (same in-plan condition).
//
// S.academic is set so the "Additional concerns:" line is PRESENT but sleep-free —
// this pins the guard precisely (proves "sleep" specifically is dropped, not that
// the whole line vanished). A future regression that drops the guard would re-add
// "sleep" to that line and show up here as a golden diff.
export default {
  name: 'sleep-guard-inplan',
  describe: 'Confirmed ASD, school-age — §4 sleep + §5 sleep_disorder in-plan: "sleep" echo suppressed in needs summary',
  outputs: ['note'],
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

    S.needsSocial.add('perspective');

    // §4 lightweight "I'm noting/managing sleep" flag (Work-up & referrals).
    S.sleep = true;
    // §5 coded sleep disorder, promoted into the plan (Medical diagnoses).
    S.comorbid.add('sleep_disorder');
    S.comorbidInPlan.add('sleep_disorder');
    // A second §4 concern so the "Additional concerns:" line still renders,
    // letting the golden show the line present-but-sleep-free.
    S.academic = true;

    S.rtcInterval = '3 months';
  },
};
