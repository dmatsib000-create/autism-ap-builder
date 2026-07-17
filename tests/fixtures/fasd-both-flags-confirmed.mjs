// Both FASD flags + confirmed ASD with the full criteria pattern documented.
// Composes confirmed-asd-school-age's exact state, then adds only the FASD flags —
// so this fixture's .aba.txt and .iep.txt goldens must stay BYTE-IDENTICAL to
// confirmed-asd-school-age's. That diff-visible identity IS the ratified fence:
// FASD content never reaches the payer-facing letters.
// Exercises: R4 exposure line (evidence categories + pattern detail + free-text
// sentence), R6b anchor with the both-flags plural opener ("warrant"), R6c firing
// (a2 + b1/b2 documented), genetics FASD clause + phenocopy continuation line,
// FASD-only audiology variant (school-age, no hearing-screen fail), ophthalmology
// (both flags), and the Florida Center self-referral line.
// P1 additions: the feature-domain sub-select (enriched features line, fixed
// Hoyme-domain order) and the fasd_support social-work reason. The domain-less
// features line stays locked by fasd-features-only-suspected.
import base from './confirmed-asd-school-age.mjs';

export default {
  name: 'fasd-both-flags-confirmed',
  describe: 'Confirmed ASD (full criteria) + both FASD flags — full referral wiring, R6b+R6c, letters fenced',
  outputs: ['note', 'aba', 'iep'],
  apply(S) {
    base.apply(S);

    S.prenatalAlcohol = true;
    ['quantityFrequency', 'socialLegal', 'biomarkers'].forEach(k => S.paeEvidence.add(k));
    S.paeQuantity = '3_5';
    S.paeFrequency = 'weeklyPlus';
    S.paeTiming = 'throughout';
    S.paeDetail = 'Exposure history corroborated across obstetric records and caregiver report';

    S.fasdFeatures = true;
    // All four domains selected so every domain phrase is golden-locked (a typo in
    // any one would otherwise pass the suite unseen).
    ['facial', 'growth', 'brain', 'neurobehavioral'].forEach(k => S.fasdDomains.add(k));

    S.socialWork = true;
    S.socialWorkReasons.add('fasd_support');
  },
};
