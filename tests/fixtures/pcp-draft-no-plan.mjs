// Primary care list before a follow-up plan is chosen. Composes adult-asd-transition
// (young adult, transition guidance selected). The tab shows the rows the selections
// produce, a copy carries a {placeholder} where the follow-up line goes, and the note is
// untouched (adult-asd-transition's own note golden stays the proof of that).
import base from './adult-asd-transition.mjs';

export default {
  name: 'pcp-draft-no-plan',
  describe: 'Young adult, no follow-up plan chosen: draft list with a {placeholder} follow-up line',
  outputs: ['pcp'],
  apply(S) {
    base.apply(S);
  },
};
