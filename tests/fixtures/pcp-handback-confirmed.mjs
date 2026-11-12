// Primary care list, hand-back case: confirmed ASD with nothing left for this clinic to
// finish, follow-up plan "No routine DBP follow-up", and no Return to Clinic interval.
// Composes confirmed-asd-school-age's state, then adds the selections that drive each
// group of the list: a sleep disorder and a GI disorder in the plan (the "primary care can
// monitor and manage" rows and the sleep re-referral trigger), sibling guidance and two
// safety topics (well-visit actions), and a requested IEP evaluation (a family action).
// Exercises: the standing follow-up line, the list printed in the note directly above
// Return to Clinic, and Return to Clinic stating that no return visit is scheduled instead
// of leaving an {interval} stop.
import base from './confirmed-asd-school-age.mjs';

export default {
  name: 'pcp-handback-confirmed',
  describe: 'Confirmed ASD, school-age, hand-back to primary care: standing "no routine DBP follow-up" line, list in the note',
  outputs: ['note', 'pcp'],
  apply(S) {
    base.apply(S);

    ['sleep_disorder', 'gi'].forEach(k => {
      S.comorbid.add(k);
      S.comorbidInPlan.add(k);
    });
    S.ag.add('sibling');
    ['elopement_counsel', 'water_counsel'].forEach(k => S.safety.add(k));
    S.schoolDoc = 'iep_needed';

    S.dbpFollowUp = 'pcp';
    S.rtcInterval = '';
  },
};
