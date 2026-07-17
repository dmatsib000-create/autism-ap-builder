// Exposure flag + confirmed ASD with the A2 criterion UNDOCUMENTED.
// Locks the R6c gate staying silent: the anchor (R6b) prints, but the
// evidentiary sentence ("deficits in nonverbal communicative behaviors...")
// must NOT appear, because this note does not itself document A2. Composes
// confirmed-asd-school-age and removes a2 — a deliberate documentation gap,
// which also exercises the confirmed-with-incomplete-criteria presentation.
// Exposure-only opener uses the singular verb ("exposure ... warrants").
import base from './confirmed-asd-school-age.mjs';

export default {
  name: 'fasd-exposure-confirmed-a2-gap',
  describe: 'Confirmed ASD with a2 undocumented + exposure flag only — R6b prints, R6c stays silent',
  outputs: ['note'],
  apply(S) {
    base.apply(S);
    S.criteriaA.delete('a2');

    S.prenatalAlcohol = true;
    S.paeEvidence.add('screenPositive');
  },
};
