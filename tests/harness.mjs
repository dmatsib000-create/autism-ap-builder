// Golden-output test harness for autism-ap-builder.html.
//
// The app is a single HTML file with all logic at <script> scope; none of its
// functions are on window (intentional — see CLAUDE.md). generateNote() is
// pure (reads S, returns strings, touches no DOM) and the only top-level DOM
// access is one DOMContentLoaded handler that never fires under Node. So we can
// run the REAL shipped script here without modifying it: extract the <script>
// body, evaluate it inside a Function with no-op DOM stubs, and append a return
// epilogue that hands back the generators plus the S state object.
//
// makeApp() returns a FRESH instance each call (the script is re-evaluated), so
// fixtures never leak state through the shared module-scope S object.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const HTML_PATH = join(HERE, '..', 'autism-ap-builder.html');

// Symbols the wrapper exposes back to the tests. All are top-level function /
// const declarations in the script; if one is renamed there, update it here.
const EXPORTS = [
  'S',
  'generateNote',
  'generateClinicalSummary',
  'generateABALetter',
  'generateABALetterPlain',
  'generateIEPLetterHTML',
  'generateIEPLetterPlain',
  '_abaContent',
  '_iepLetterContent',
];

function extractScript(html) {
  const open = html.indexOf('<script>');
  const close = html.lastIndexOf('</script>');
  if (open < 0 || close < 0) throw new Error('Could not find <script> block in HTML');
  return html.slice(open + '<script>'.length, close);
}

// Forgiving DOM/browser stubs. Because the DOMContentLoaded callback never runs,
// these only need to be non-throwing: the top-level script merely *registers*
// the handler and defines functions. Any element-like access returns a proxy
// that swallows reads/writes so a stray top-level reference can't crash eval.
function makeStubs() {
  const noop = () => {};
  const elHandler = {
    get(_, p) {
      if (p === 'style') return {};
      if (p === 'dataset') return {};
      if (p === 'classList') return { add: noop, remove: noop, toggle: noop, contains: () => false };
      if (p === 'querySelector') return () => null;
      if (p === 'querySelectorAll') return () => [];
      if (p === 'appendChild' || p === 'insertBefore' || p === 'removeChild' ||
          p === 'addEventListener' || p === 'removeEventListener' ||
          p === 'setAttribute' || p === 'remove' || p === 'focus' ||
          p === 'setSelectionRange' || p === 'closest') return noop;
      if (p === 'value' || p === 'textContent' || p === 'className' || p === 'innerHTML') return '';
      if (p === 'checked') return false;
      return el;
    },
    set() { return true; },
  };
  const el = new Proxy({}, elHandler);
  const document = {
    addEventListener: noop,
    removeEventListener: noop,
    getElementById: () => el,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => el,
    body: el,
  };
  const window = {
    addEventListener: noop,
    matchMedia: () => ({ matches: false, addEventListener: noop, removeEventListener: noop }),
  };
  const navigator = { clipboard: { writeText: async () => {}, write: async () => {} } };
  return { document, window, navigator };
}

let scriptCache = null;
function scriptBody() {
  if (scriptCache == null) scriptCache = extractScript(readFileSync(HTML_PATH, 'utf8'));
  return scriptCache;
}

export function makeApp() {
  const { document, window, navigator } = makeStubs();
  const noop = () => {};
  const body = scriptBody() + `\n;return { ${EXPORTS.join(', ')} };`;
  let factory;
  try {
    // eslint-disable-next-line no-new-func
    factory = new Function('document', 'window', 'navigator', 'setTimeout', 'clearTimeout', 'console', body);
  } catch (err) {
    // We get here when the app's own code has a syntax problem (e.g. a stray
    // smart/curly quote, an unclosed bracket). The checker can't even read it.
    throw friendlyError(
      'The checker could not read the app\'s code at all.',
      'This usually means autism-ap-builder.html has a typo in its <script> — a stray ' +
      'curly quote (‘ ’) or an unclosed bracket are the usual causes. Open the app ' +
      'in a browser; if it is broken too, fix it there first.',
      err
    );
  }
  try {
    return factory(document, window, navigator, noop, noop, console);
  } catch (err) {
    // We get here when the code reads fine but something it relies on is missing
    // when run outside a browser — most often a generator function was renamed,
    // so the export list below no longer matches the app.
    throw friendlyError(
      'The checker loaded the app but could not find the parts that build the note.',
      'If you renamed one of the note/letter builders in autism-ap-builder.html, update the ' +
      'matching name in tests/harness.mjs (the EXPORTS list). It currently looks for:\n  ' +
      EXPORTS.join(', '),
      err
    );
  }
}

// Build a clear, two-part message and keep the raw technical error at the bottom
// for anyone who wants it. Plain explanation first, then what to do, then details.
function friendlyError(headline, whatToDo, original) {
  const e = new Error(
    `\n${headline}\n\nWhat to check:\n${whatToDo}\n\n` +
    `(Technical detail, for reference: ${original && original.message ? original.message : original})`
  );
  e.cause = original;
  return e;
}
