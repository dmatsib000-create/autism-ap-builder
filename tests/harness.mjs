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
  // Pure clinical-decision functions for the unit lane (tests/unit.mjs). They
  // read S and return a value with no DOM access, so they run under the harness
  // even though the DOM wrappers that call them in the app (e.g.
  // bridgeCogProfileToSpecifier) don't with the default null DOM.
  // See tests/README.md "Two test lanes".
  'bifSpecifierAllowed',
  'currentClinicalPathway',
  // Workup-completion resolver: pure read of S.dxEvalPath + the eval*Status fields into
  // step roles, completion booleans, and the Family Resources pendingTesting predicate.
  'evalPathSteps',
  // DOM wrapper whose gate-cleanup branch (delete unsupported withBIF) is exercised
  // by the unit lane via an injected querySelector (see makeStubs opts) — the one
  // wrapper the unit lane drives directly rather than through its pure core.
  'toggleBifSpecifierGate',
  // Add-only ABA-target sync. DOM-driven (fires from onchange/render) and mutates
  // S.abaTargets via add(); its querySelector/cb.checked step is best-effort, so the
  // Set mutation runs under the harness's null DOM and the unit lane can assert on
  // S.abaTargets directly. Covers the behavior->target mapping the golden lane can't
  // reach (golden fixtures set S.abaTargets directly and never invoke the sync).
  'syncABATargetsFromNeeds',
  // Add-only school-service sync, same shape as syncABATargetsFromNeeds: DOM-driven,
  // mutates S.schoolSvc via a guarded add() whose querySelector/cb.checked/badge steps
  // are best-effort under the null DOM. The unit lane drives it to lock the Unit 5
  // academic->psychoed wiring (and its preschool-and-up age gate), which the golden lane
  // can't reach because fixtures set S.schoolSvc directly and never invoke the sync.
  'syncSchoolSvcFromNeeds',
];

function extractScript(html) {
  // The app keeps ALL its logic in one BARE `<script>` block at the end of
  // <body>. Small bootstrap blocks are permitted but MUST carry an attribute
  // (e.g. `<script data-theme-boot>` for the pre-paint theme restore in <head>)
  // so they are distinguishable and excluded here. We evaluate ONLY the bare
  // block. A naive first-open/last-close span would silently swallow everything
  // between an added block and the app; matching the bare-tag span avoids that,
  // and asserting exactly one bare block still fails loudly if a second
  // attribute-less <script> is ever introduced.
  const openTags = html.match(/<script>/gi) || [];   // bare <script> only, no attrs
  if (openTags.length !== 1) {
    throw new Error(
      `Expected exactly one bare <script> block (the application), found ${openTags.length}. ` +
      `Bootstrap blocks must carry an attribute (e.g. data-theme-boot). ` +
      `If the app's structure changed, update extractScript().`
    );
  }
  const open = html.indexOf(openTags[0]);
  const close = html.indexOf('</script>', open);
  return html.slice(open + openTags[0].length, close);
}

// Forgiving DOM/browser stubs. Because the DOMContentLoaded callback never runs,
// these only need to be non-throwing: the top-level script merely *registers*
// the handler and defines functions. Any element-like access returns a proxy
// that swallows reads/writes so a stray top-level reference can't crash eval.
// opts.querySelector (optional): a function (selector) => stub-element | null that
// replaces the default null-returning document.querySelector. The unit lane uses
// this to hand a mutable fake checkbox to DOM wrappers like toggleBifSpecifierGate
// so their state-cleanup branches can run and be asserted. Default stays () => null
// so the golden lane and the pure-decider unit cases see "no DOM" as before.
function makeStubs({ querySelector } = {}) {
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
    querySelector: querySelector || (() => null),
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

export function makeApp(opts = {}) {
  const { document, window, navigator } = makeStubs(opts);
  const noop = () => {};
  // Capture console.warn so the runner can turn the v3() silent-fallback warning
  // (a verb missing from V3_MAP → ungrammatical output for a "they" patient) into
  // a hard test failure. The app warns during note generation, which happens
  // after makeApp() returns, so we hand the live array back by reference on
  // app.__warnings and let it fill in as the generators run. Everything else on
  // console (log/error) passes through unchanged.
  const warnings = [];
  const captureConsole = Object.assign(Object.create(console), {
    warn: (...a) => { warnings.push(a.join(' ')); },
  });
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
      'curly/smart quote or an unclosed bracket are the usual causes. Open the app ' +
      'in a browser; if it is broken too, fix it there first.',
      err
    );
  }
  try {
    const app = factory(document, window, navigator, noop, noop, captureConsole);
    app.__warnings = warnings;
    return app;
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
