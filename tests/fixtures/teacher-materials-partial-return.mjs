// Teacher materials partially returned: three requested, one back. Locks the
// returned/awaited two-list rendering in fixed form order, the conditional
// chase-the-family line (prints — something is still outstanding), and the
// other_teacher free-text label flowing into the awaited list.
export default {
  name: 'teacher-materials-partial-return',
  describe: 'Suspected preschool, 3 teacher materials requested / 1 returned — two-list rendering + conditional family line',
  outputs: ['note'],
  apply(S) {
    S.ageGroup = 'preschool';
    S.pronouns = 'they';
    S.langLevel = 'singleWords';
    S.cogProfile = 'unknown';

    S.diagStatus = 'suspected';

    ['uf_classroom', 'srs2', 'other_teacher'].forEach(k => S.teacherMaterials.add(k));
    S.teacherMaterialsReturned.add('srs2');
    S.teacherMaterialOther = 'OT classroom sensory questionnaire';

    S.needsComm.add('expressive');
    S.needsSensory.add('hyper');

    S.rtcInterval = '3 months';
  },
};
