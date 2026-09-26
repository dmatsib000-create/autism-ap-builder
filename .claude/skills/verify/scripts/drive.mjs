#!/usr/bin/env node
// Headless driver for /verify in cloud sessions, where there is no browser pane.
// Opens autism-ap-builder.html from disk (file://, the way clinicians open it) in
// a headless Chromium via the DevTools protocol, runs a snippet of page JS, and
// prints the result, any page errors, and (optionally) a screenshot. Each run is
// a fresh page with a fresh profile, so every snippet must set up its own state.
//
// Zero npm dependencies on purpose (Node >= 22 ships a global WebSocket). The
// browser is fetched into ~/.cache/verify-chrome/<version> unless CHROME_PATH
// points at an existing Chrome/Edge (handy for testing the driver on a desktop).
//
// Usage:
//   node .claude/skills/verify/scripts/drive.mjs [steps.js] [--eval "js"]
//        [--shot out.png] [--width 1400] [--height 1000] [--timeout 60]
//        [--page autism-ap-builder.html]

import { spawn, execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdtempSync, mkdirSync,
  rmSync, renameSync, chmodSync, utimesSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
// The latest stable version number is published only on googlechromelabs.github.io,
// which is not on the cloud allowlist; the zips themselves are on
// storage.googleapis.com, which is. So: ask for the latest, and fall back to this
// pin (with an age warning) when the lookup is blocked. Refresh the pin now and then.
// VERIFY_CHROME_VERSION overrides both.
const PINNED_VERSION = '154.0.8037.57';
const PINNED_ON = '2026-09-26';
const RECHECK_DAYS = 7;
const CACHE_ROOT = join(homedir(), '.cache', 'verify-chrome');
const PLATFORM = { linux: 'linux64', win32: 'win64' }[process.platform];
const DAY = 86400000;

function parseArgs(argv) {
  const o = { width: 1400, height: 1000, timeout: 60, page: 'autism-ap-builder.html' };
  const val = i => { if (i >= argv.length) throw new Error(`${argv[i - 1]} needs a value`); return argv[i]; };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--eval') o.eval = val(++i);
    else if (a === '--shot') o.shot = val(++i);
    else if (a === '--width') o.width = +val(++i);
    else if (a === '--height') o.height = +val(++i);
    else if (a === '--timeout') o.timeout = +val(++i);
    else if (a === '--page') o.page = val(++i);
    else if (!a.startsWith('--')) o.file = a;
    else throw new Error(`Unknown option ${a}`);
  }
  return o;
}

const delay = ms => new Promise(r => setTimeout(r, ms));

// Polls check() until it returns a truthy value (returned) or throws (propagated).
async function until(check, ms, what) {
  const deadline = Date.now() + ms;
  while (Date.now() < deadline) {
    const v = await check();
    if (v) return v;
    await delay(100);
  }
  throw new Error(`${what} (gave up after ${ms / 1000}s)`);
}

const VERSION_RE = /^\d+\.\d+\.\d+\.\d+$/;

// Returns null when the lookup fails, so the caller can tell "blocked" apart from
// "the latest is the pin" and never trade a newer cached Chrome for the older pin.
function latestVersion() {
  try {
    const v = execFileSync('curl', ['-fsS', '--max-time', '5',
      'https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_STABLE'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (VERSION_RE.test(v)) return v;
  } catch {}
  return null;
}

function pinnedVersion() {
  const days = Math.floor((Date.now() - Date.parse(PINNED_ON)) / DAY);
  console.error(`[drive] Latest Chrome version lookup blocked; using pinned ${PINNED_VERSION} (${days} days old).` +
    (days > 60 ? ' Consider updating PINNED_VERSION in drive.mjs.' : ''));
  return PINNED_VERSION;
}

// Numeric, part by part: '154.0.8037.57' is newer than '99.0.1.2'.
function isNewer(a, b) {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 4; i++) if (pa[i] !== pb[i]) return pa[i] > pb[i];
  return false;
}

const exeIn = dir => join(dir, `chrome-headless-shell-${PLATFORM}`,
  process.platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell');

// Downloads into a private temp folder and renames it into place, so a version
// folder exists only once complete and parallel first runs cannot clobber each other.
function install(version) {
  const final = join(CACHE_ROOT, version);
  mkdirSync(CACHE_ROOT, { recursive: true });
  // A run killed mid-download (SIGKILL, container reclaimed) skips the finally
  // below and leaves up to ~120 MB behind. An hour is far longer than a download,
  // so this never touches a parallel run's folder that is still filling.
  for (const d of readdirSync(CACHE_ROOT)) {
    if (!d.startsWith('.tmp-')) continue;
    const p = join(CACHE_ROOT, d);
    try { if (Date.now() - statSync(p).mtimeMs > 3600000) rmSync(p, { recursive: true, force: true }); } catch {}
  }
  const tmp = mkdtempSync(join(CACHE_ROOT, '.tmp-'));
  try {
    const zip = join(tmp, 'chrome.zip');
    const url = `https://storage.googleapis.com/chrome-for-testing-public/${version}/${PLATFORM}/chrome-headless-shell-${PLATFORM}.zip`;
    console.error(`[drive] Downloading chrome-headless-shell ${version} (~120 MB)...`);
    // curl rather than fetch(): curl honours the cloud's proxy environment variables.
    execFileSync('curl', ['-fsSL', '--retry', '2', '-o', zip, url], { stdio: ['ignore', 'ignore', 'inherit'] });
    if (process.platform === 'win32') {
      execFileSync('tar', ['-xf', zip, '-C', tmp], { stdio: 'inherit' });
    } else {
      try { execFileSync('unzip', ['-q', zip, '-d', tmp], { stdio: 'inherit' }); }
      catch {
        // Python's zipfile drops the executable bit, so restore it afterwards.
        execFileSync('python3', ['-m', 'zipfile', '-e', zip, tmp], { stdio: 'inherit' });
        const dir = dirname(exeIn(tmp));
        for (const f of readdirSync(dir)) { try { chmodSync(join(dir, f), 0o755); } catch {} }
      }
    }
    rmSync(zip, { force: true });
    if (!existsSync(exeIn(tmp))) throw new Error(`Download finished but ${exeIn(tmp)} is missing`);
    try { renameSync(tmp, final); } catch { if (!existsSync(exeIn(final))) throw new Error(`Could not place ${final}`); }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  // Drop superseded downloads so an older Chrome is never picked up again.
  for (const d of readdirSync(CACHE_ROOT)) {
    if (d !== version && !d.startsWith('.tmp-')) rmSync(join(CACHE_ROOT, d), { recursive: true, force: true });
  }
  return exeIn(final);
}

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (!PLATFORM) throw new Error(`No Chrome download for ${process.platform}; set CHROME_PATH`);
  const pinned = process.env.VERIFY_CHROME_VERSION;
  if (pinned) {
    // It becomes a folder name and part of a URL, so accept only a version number.
    if (!VERSION_RE.test(pinned)) throw new Error(`VERIFY_CHROME_VERSION must look like 154.0.8037.57, got "${pinned}"`);
    return existsSync(exeIn(join(CACHE_ROOT, pinned))) ? exeIn(join(CACHE_ROOT, pinned)) : install(pinned);
  }
  // Reuse a recent download without a network call; once it is RECHECK_DAYS old,
  // look up the latest version again so an outdated Chrome does not linger.
  const cached = existsSync(CACHE_ROOT) ? readdirSync(CACHE_ROOT).find(d => VERSION_RE.test(d) && existsSync(exeIn(join(CACHE_ROOT, d)))) : null;
  if (cached && Date.now() - statSync(join(CACHE_ROOT, cached)).mtimeMs < RECHECK_DAYS * DAY) return exeIn(join(CACHE_ROOT, cached));
  const latest = latestVersion();
  // Keep the cached copy when it is the latest, or when the lookup failed and it is
  // at least as new as the pin; a failed lookup must never downgrade Chrome.
  if (cached && (latest ? latest === cached : !isNewer(PINNED_VERSION, cached))) {
    if (!latest) console.error(`[drive] Latest Chrome version lookup blocked; keeping cached ${cached}.`);
    const now = new Date(); utimesSync(join(CACHE_ROOT, cached), now, now);
    return exeIn(join(CACHE_ROOT, cached));
  }
  return install(latest ?? pinnedVersion());
}

async function launch(bin, profile, isShell) {
  const args = [
    // Cloud containers usually can't use Chrome's sandbox.
    ...(process.platform === 'linux' ? ['--no-sandbox'] : []),
    ...(isShell ? [] : ['--headless=new']),
    // Every hostname lookup fails and no proxy is used, so the page cannot reach the
    // internet by name. That, plus the app making no network requests by design, is
    // what makes an out-of-date Chrome and --no-sandbox acceptable here. It is not a
    // full network block: URLs with a literal IP address have not been verified.
    '--host-resolver-rules=MAP * ~NOTFOUND', '--proxy-server=direct://',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--disable-dev-shm-usage', 'about:blank',
  ];
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let log = '', exited = null;
  proc.stderr.on('data', d => { log += d; });
  proc.on('error', e => { exited = String(e); });
  // Exit code 0 alone is not fatal: on Windows the Edge/Chrome launcher can hand
  // off to a child process and exit. A signal (SIGTRAP, SIGSEGV...) is a crash.
  // Readiness comes from the DevToolsActivePort file the browser writes into the
  // profile (stderr is not reliably attached on Windows).
  proc.on('exit', (c, sig) => { if (c || sig) exited = sig ? `killed by ${sig}` : `exited with code ${c}`; });
  const portFile = join(profile, 'DevToolsActivePort');
  try {
    const wsUrl = await until(() => {
      if (exited) throw new Error(`${exited}\n${log}`);
      if (!existsSync(portFile)) return null;
      const [port, path] = readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
      return port && path ? `ws://127.0.0.1:${port}${path}` : null;
    }, 30000, 'timed out waiting for DevTools');
    return { proc, wsUrl };
  } catch (e) {
    try { proc.kill(); } catch {}
    throw launchError(bin, `${e.message}\n${log}`);
  }
}

async function closeBrowser(browser) {
  if (!browser) return;
  // Browser.close reaches the real browser even if the launcher process already exited.
  try {
    const b = new CDP(browser.wsUrl); await b.open();
    await b.send('Browser.close', {}, 2000).catch(() => {});
    b.close();
  } catch {}
  const { proc } = browser;
  if (proc.exitCode === null && proc.signalCode === null) {
    // unref'd so a browser that exits promptly doesn't leave Node idling for 3 s.
    await Promise.race([new Promise(r => proc.once('exit', r)), new Promise(r => setTimeout(r, 3000).unref())]);
  }
  try { proc.kill(); } catch {}
}

function launchError(bin, detail) {
  let hint = '';
  if (process.platform === 'linux') {
    try {
      const missing = execFileSync('ldd', [bin], { encoding: 'utf8' }).split('\n').filter(l => /not found/.test(l));
      if (missing.length) hint = `\nMissing system libraries:\n${missing.join('\n')}\n` +
        'Install them with:  npx -y playwright install-deps chromium   (needs root; uses apt only)';
    } catch {}
  }
  return new Error(`Browser failed to start (${bin}): ${detail.slice(-1500)}${hint}`);
}

class CDP {
  constructor(url) { this.url = url; this.seq = 0; this.pending = new Map(); this.listeners = []; }
  open() {
    this.ws = new WebSocket(this.url);
    this.ws.onmessage = e => {
      const m = JSON.parse(e.data);
      if (m.id && this.pending.has(m.id)) {
        const p = this.pending.get(m.id); this.pending.delete(m.id); clearTimeout(p.timer);
        m.error ? p.rej(new Error(m.error.message)) : p.res(m.result);
      } else this.listeners.forEach(fn => fn(m));
    };
    // A closed socket (browser or tab crashed) must fail every pending call, not hang.
    this.ws.onclose = () => {
      for (const p of this.pending.values()) { clearTimeout(p.timer); p.rej(new Error('Browser connection closed (crash?)')); }
      this.pending.clear();
    };
    return new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = () => rej(new Error('CDP socket error')); });
  }
  send(method, params = {}, ms = 30000) {
    const id = ++this.seq;
    return new Promise((res, rej) => {
      const timer = setTimeout(() => { this.pending.delete(id); rej(new Error(`${method} timed out after ${ms / 1000}s`)); }, ms);
      this.pending.set(id, { res, rej, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }
  close() { try { this.ws.close(); } catch {} }
  on(fn) { this.listeners.push(fn); }
}

async function newPage(wsUrl) {
  const res = await fetch(`http://${new URL(wsUrl).host}/json/new?about:blank`,
    { method: 'PUT', signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Could not open a browser tab: HTTP ${res.status}`);
  return (await res.json()).webSocketDebuggerUrl;
}

// Only Windows needs this: Edge there can hold profile files for several seconds
// after exit, so the per-run removal sometimes fails. Linux removes it cleanly,
// and sweeping there could delete a profile a parallel run is still using.
function sweepOldProfiles() {
  if (process.platform !== 'win32') return;
  for (const name of readdirSync(tmpdir())) {
    if (!name.startsWith('verify-profile-')) continue;
    const p = join(tmpdir(), name);
    try { if (Date.now() - statSync(p).mtimeMs > 10 * 60000) rmSync(p, { recursive: true, force: true }); } catch {}
  }
}

async function loadApp(cdp, url) {
  const nav = await cdp.send('Page.navigate', { url });
  if (nav.errorText) throw new Error(`Could not open ${url}: ${nav.errorText}`);
  // Poll the document instead of waiting for a load event, which could belong
  // to the startup about:blank page rather than this navigation. Evaluating
  // mid-navigation can hit a destroyed context, so errors just mean "not yet".
  await until(async () => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: 'location.href + "|" + document.readyState', returnByValue: true }).catch(() => null);
    return r?.result?.value === `${url}|complete`;
  }, 20000, `Page did not finish loading: ${url}`);
}

async function main() {
  if (typeof WebSocket !== 'function') {
    throw new Error(`Node ${process.version} has no global WebSocket; drive.mjs needs Node 22 or newer`);
  }
  const o = parseArgs(process.argv.slice(2));
  const body = o.eval ?? (o.file ? readFileSync(o.file, 'utf8') : null);
  const page = resolve(REPO, o.page);
  if (!existsSync(page)) throw new Error(`No such page: ${page}`);
  const bin = findBrowser();
  const isShell = /headless-shell/.test(bin);
  sweepOldProfiles();
  const profile = mkdtempSync(join(tmpdir(), 'verify-profile-'));
  let browser, cdp, loaded = false, failed = false;
  const errors = [];
  try {
    browser = await launch(bin, profile, isShell);
    cdp = new CDP(await newPage(browser.wsUrl));
    await cdp.open();
    cdp.on(m => {
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        failed = true;
        errors.push(`exception: ${d.exception?.description || d.text} (line ${d.lineNumber + 1})`);
      } else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(m.params.type)) {
        errors.push(`console.${m.params.type}: ${m.params.args.map(a => a.value ?? a.description).join(' ')}`);
      } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        errors.push(`log: ${m.params.entry.text}`);
      }
    });
    await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Log.enable'),
      cdp.send('Emulation.setDeviceMetricsOverride', { width: o.width, height: o.height, deviceScaleFactor: 1, mobile: false })]);
    await loadApp(cdp, pathToFileURL(page).href);
    loaded = true;
    console.log(`[drive] loaded ${o.page} (${isShell ? 'chrome-headless-shell' : bin})`);

    if (body) {
      const r = await cdp.send('Runtime.evaluate', {
        expression: `(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms));\n${body}\n})()`,
        awaitPromise: true, returnByValue: true, userGesture: true,
      }, o.timeout * 1000);
      if (r.exceptionDetails) {
        failed = true;
        console.log(`== step threw ==\n${r.exceptionDetails.exception?.description || r.exceptionDetails.text}`);
      } else {
        const v = r.result.value;
        console.log('== result ==');
        console.log(v === undefined ? '(no return value)' : typeof v === 'string' ? v : JSON.stringify(v, null, 2));
      }
    }
    if (o.shot) {
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      writeFileSync(o.shot, Buffer.from(data, 'base64'));
      console.log(`[drive] screenshot -> ${o.shot}`);
    }
  } finally {
    // Page errors are only meaningful if the page actually loaded; "none" after a
    // failed launch would read as a clean page that was never opened.
    if (loaded) console.log(errors.length ? `== page errors (${errors.length}) ==\n${errors.join('\n')}` : '== page errors: none ==');
    else if (errors.length) console.log(`== errors before the page finished loading ==\n${errors.join('\n')}`);
    cdp?.close();
    await closeBrowser(browser);
    // No retries: on Windows Edge may still hold files, and sweepOldProfiles()
    // removes the folder on a later run.
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
  if (failed) process.exitCode = 1;
}

// exitCode rather than process.exit(): exiting while sockets are still closing
// trips a libuv assertion on Windows.
main().catch(e => { console.error(`[drive] FAILED: ${e.message}`); process.exitCode = 2; });
