// Primary care list with "DBP follow-up continues" and every kind of edit applied.
// Composes comorbid-internalizing-inplan (adolescent, anxiety + depression + OCD in the
// plan, Return to Clinic 3 months).
// Exercises: a line left out (pcpOmit), two lines moved up in click order (pcpFirst, so
// tDocs prints before tNewConcern, and tSuicide leads its own group), the clinician's own
// typed lines after the generated actions (a pasted bullet mark is dropped), the mood and
// safety recheck staying with DBP (named in the follow-up line, as in the note's own
// depression plan), the "Contact DBP before the return visit if" heading, "patient"
// wording for an adolescent, and the list kept out of the note (pcpInNote off) while
// still on its tab.
import base from './comorbid-internalizing-inplan.mjs';

export default {
  name: 'pcp-dbp-continues-edits',
  describe: 'Confirmed ASD, adolescent, DBP follow-up continues: left-out line, reordered triggers, typed lines, list not in the note',
  outputs: ['note', 'pcp'],
  apply(S) {
    base.apply(S);
    S.ag.add('transition');

    S.dbpFollowUp = 'dbp';
    S.pcpInNote = false;
    S.pcpOmit.add('tBehavior');
    ['tDocs', 'tSuicide'].forEach(k => S.pcpFirst.add(k));
    S.pcpExtra = 'PCP (next visit): Recheck weight after the medication change\n- Family: Bring the school progress report to the next visit';
  },
};
