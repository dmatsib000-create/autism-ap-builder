// Primary care list where the clinician chose "No routine DBP follow-up" but the form
// still holds work only this clinic can finish. Composes suspected-toddler (diagnosis
// under evaluation, comprehensive evaluation referral placed, Return to Clinic 3 months).
// Exercises: the override of the standing line ("DBP follow-up is limited to one return
// visit in 3 months to complete the autism diagnostic evaluation"), the Early Steps
// action, and Return to Clinic keeping the typed interval because a visit is still owed.
import base from './suspected-toddler.mjs';

export default {
  name: 'pcp-open-work-toddler',
  describe: 'Suspected ASD, toddler, "no routine DBP follow-up" chosen while the evaluation is still open: follow-up line names the one return visit',
  outputs: ['note', 'pcp'],
  apply(S) {
    base.apply(S);
    S.dbpFollowUp = 'pcp';
  },
};
