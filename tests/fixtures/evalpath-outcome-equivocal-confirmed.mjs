// Confirmed diagnosis + CARS-2 administered today with an EQUIVOCAL outcome.
// Locks two things nothing else covers: the administered-today line with a
// non-consistent outcome ("Results were inconclusive..."), and the heading
// downshift rule — on a confirmed note an equivocal result must render the
// neutral "CARS-2 Pathway (age < 5)" heading, NOT "Standardized Diagnostic
// Support" (the heading never asserts support the data don't back).
import base from './confirmed-certain-young-evalpath.mjs';

export default {
  name: 'evalpath-outcome-equivocal-confirmed',
  describe: 'Confirmed, certainYoung, CARS-2 today + equivocal — inconclusive sentence, heading downshifts to neutral pathway name',
  outputs: ['note'],
  apply(S) {
    base.apply(S);
    S.evalDxStatus = 'today';
    S.evalDxOutcome = 'equivocal';
  },
};
