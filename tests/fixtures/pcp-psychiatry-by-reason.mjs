// Primary care list and note when psychiatry is brought in for a stated reason, and the
// follow-up plan was not discussed with the family at the visit.
// Composes pcp-handback-adolescent-mood-adhd (confirmed ADHD and depression in the plan,
// hand-back). On their own those diagnoses no longer refer to psychiatry (attending,
// 2026-11-12 and 2026-11-13: this clinic prescribes). Ticking "treatment has not worked"
// adds the referral with its reason in the note, puts child psychiatry in the list's
// referral check, adds "even if the psychiatry visit has not yet happened" to the mood
// recheck, and changes the substance-use line to "tell child psychiatry promptly".
import base from './pcp-handback-adolescent-mood-adhd.mjs';

export default {
  name: 'pcp-psychiatry-by-reason',
  describe: 'Hand-back with a psychiatry referral for a selected reason; plan not yet discussed with the family',
  outputs: ['note', 'pcp'],
  apply(S) {
    base.apply(S);

    S.psychReasons.add('treatment_failure');
    S.pcpNotDiscussed = true;
  },
};
