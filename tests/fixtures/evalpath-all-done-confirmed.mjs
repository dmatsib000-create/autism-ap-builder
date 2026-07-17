// All workup completed on a confirmed note. Composes confirmed-asd-school-age's exact
// state, then adds: certainOlder with BOTH steps completed (CARS-2 at a prior visit,
// outcome consistent) and two teacher materials both returned and reviewed.
// Locks: no scheduling language anywhere in the workup block ("Standardized Diagnostic
// Support" title, Step 1/Step 2 past-tense, consistent-outcome sentence), the
// all-returned teacher rendering (no "Family to provide contact information" chase
// line), pendingTesting=false (immediate ABA-waitlist wording in Family Resources),
// and the letters fence: .aba.txt and .iep.txt must stay BYTE-IDENTICAL to
// confirmed-asd-school-age's goldens — completion state never reaches the letters.
import base from './confirmed-asd-school-age.mjs';

export default {
  name: 'evalpath-all-done-confirmed',
  describe: 'Confirmed ASD, certainOlder fully completed + teacher materials all returned — completed-workup documentation, letters fenced',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    base.apply(S);

    S.dxEvalPath = 'certainOlder';
    S.evalProfileStatus = 'done';
    S.evalDxStatus = 'done';
    S.evalDxOutcome = 'consistent';

    ['srs2', 'vanderbilt_teacher'].forEach(k => {
      S.teacherMaterials.add(k);
      S.teacherMaterialsReturned.add(k);
    });
  },
};
