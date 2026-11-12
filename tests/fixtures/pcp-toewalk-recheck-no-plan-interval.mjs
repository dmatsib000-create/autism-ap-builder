// Primary care list for watch-only toe walking with no Return to Clinic interval.
// Composes toewalk-family-pt-pcp. With "No routine DBP follow-up" chosen, the recheck has
// one owner: the note's gait problem names primary care instead of printing the
// {primary care or this clinic} choice, and the list carries the same recheck as a PCP
// action with the 12-month ceiling.
import base from './toewalk-family-pt-pcp.mjs';

export default {
  name: 'pcp-toewalk-recheck-no-plan-interval',
  describe: 'Watch-only toe walking handed back to primary care: gait recheck owned by the PCP in both the note and the list',
  outputs: ['note', 'pcp'],
  apply(S) {
    base.apply(S);
    S.dbpFollowUp = 'pcp';
  },
};
