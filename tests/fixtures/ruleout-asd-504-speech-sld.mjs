// Autism ruled out for a school-age student who already has a 504 Plan.
// Covers the three ruled-out branches the first two rule-out fixtures miss:
//   - `ruleOutAsk504` (the 504 branch, which must suppress the Autism-category ask
//     and promise the categories that follow it)
//   - the Speech Impaired candidate (speech-sound errors + reduced intelligibility)
//   - the CONFIRMED Specific Learning Disability candidate (the other fixture only
//     reaches the "suspected" variant)
//   - the Intellectual Disability candidate
// Also pins the accomIDMod double gate on a ruled-out letter: cogProfile is an ID
// profile so hasID() is true, but the withID specifier is deliberately NOT set, so
// no modified curriculum or alternate assessment may appear.
export default {
  name: 'ruleout-asd-504-speech-sld',
  describe: 'ASD ruled out, school-age, 504 in place, speech-sound + confirmed reading SLD + ID profile',
  outputs: ['note', 'iep'],
  apply(S) {
    S.ageGroup = 'schoolAge';
    S.pronouns = 'he';
    S.langLevel = 'simpleSentence';
    S.cogProfile = 'id_mild';
    S.cogDataSource = 'comprehensive';
    S.adaptProfile = 'moderatelyImpaired';
    S.adaptiveStandardized = true;

    S.diagStatus = 'ruleOut';

    S.langModifiers.add('speechSound');
    S.langModifiers.add('reducedIntell');

    S.comorbid.add('ld_reading');

    S.needsComm.add('expressive');
    S.needsAdaptive.add('dressing');
    S.needsMotor.add('fine');

    S.schoolPlacement = 'genEd';
    S.schoolDoc = '504';
    ['sped', 'slp_school', 'ot_school'].forEach(k => S.schoolSvc.add(k));

    S.rtcInterval = '6 months';
  },
};
