// Primary care list, hand-back of an adolescent with treated co-occurring conditions.
// Composes adhd-comorbid-adolescent (confirmed ADHD in the plan, anxiety listed), adds a
// depression plan and transition guidance, and chooses "No routine DBP follow-up" with no
// return interval.
// Exercises the attending decisions of 2026-11-12: ADHD medication at a stable dose and
// the 4 to 6 week mood and safety recheck (with the NIMH ASQ screen) are primary care's,
// so neither forces a DBP visit; the note's depression plan names primary care for the
// recheck instead of a shortened clinic return; psychiatry is named only for mania,
// psychosis or complicating substance use; suicidal thoughts go to crisis care.
import base from './adhd-comorbid-adolescent.mjs';

export default {
  name: 'pcp-handback-adolescent-mood-adhd',
  describe: 'Confirmed ASD + ADHD + depression, adolescent, hand-back: medication and mood recheck owned by primary care',
  outputs: ['note', 'pcp'],
  apply(S) {
    base.apply(S);

    S.comorbid.add('depression');
    S.comorbidInPlan.add('depression');
    S.ag.add('transition');

    S.dbpFollowUp = 'pcp';
    S.rtcInterval = '';
  },
};
