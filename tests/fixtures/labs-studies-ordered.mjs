// Labs & studies ordered: the clinician's free-text list prints as its own numbered plan
// section after Medical Referrals, exactly as typed. Locks the three input shapes: a
// reason line ending in a colon with tests stacked beneath it, a one-line "reason: test",
// and a test with no reason. Also locks the tidying (blank-line padding, pasted list
// markers) and that the section number slots in ahead of Safety Counseling.
//
// Genetics is on (confirmed dx) and a microarray is typed, the combination that raises the
// tool-only genetics warning; the warning never reaches the note, so the genetics
// paragraph here must be byte-identical to any other confirmed-dx note.
export default {
  name: 'labs-studies-ordered',
  describe: 'Confirmed ASD, preschool — labs box with grouped, one-line, and standalone entries',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'she';
    S.langLevel = 'phrase';
    S.cogProfile = 'unknown';

    S.diagStatus = 'confirmed';
    S.asdLevelSC = '2';
    S.asdLevelRRB = '2';

    ['a1', 'a2', 'a3'].forEach(k => S.criteriaA.add(k));
    ['b1', 'b2'].forEach(k => S.criteriaB.add(k));
    S.criteriaC = true;
    S.criteriaD = true;
    S.criteriaE = true;

    S.safety.add('elopement_counsel');

    S.labsOrdered = [
      '',
      'Pica, screen for iron deficiency and lead exposure:',
      '- CBC with differential',
      '- Ferritin',
      '- Lead level',
      '',
      '',
      'Global developmental delay:',
      'Chromosomal microarray',
      '',
      'Hypotonia: CK',
      '',
      'Vitamin D  ',
    ].join('\n');

    S.rtcInterval = '6 months';
  },
};
