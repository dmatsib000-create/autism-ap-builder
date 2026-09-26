#!/usr/bin/env node
// Headless driver for /verify in cloud sessions, where there is no browser pane.
// Serves the repo over loopback, opens autism-ap-builder.html in a headless
// Chromium via the DevTools protocol, runs a snippet of page JS, and prints the
// result, any page errors, and (optionally) a screenshot. Each run is a fresh
// page with a fresh profile, so every snippet must set up its own state.
//
// Zero npm dependencies on purpose (Node >= 22 ships a global WebSocket). The
// browser is fetched once into ~/.cache/verify-chrome/<version> unless
// CHROME_PATH points at an existing Chrome/Edge.
//
// Usage:
//   node .claude/skills/verify/scripts/drive.mjs [steps.js] [--eval "js"]
//        [--shot out.png] [--width 1400] [--height 1000] [--timeout 60]
//        [--page autism-ap-builder.html]

import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdtempSync, mkdirSync, rmSync, chmodSync } from 'node:fs';
import { join, resolve, dirname, extname, sep } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
// The latest stable version number is published only on googlechromelabs.github.io,
// which is not on the cloud allowlist; the zips themselves are on
// storage.googleapis.com, which is. So: ask for the latest, and fall back to this
// pin (with an age warning) when the lookup is blocked. Refresh the pin now and then.
// VERIFY_CHROME_VERSION overrides both.
const PINNED_VERSION = '154.0.8037.57';
const PINNED_ON = '2026-09-26';
const CACHE_ROOT = join(homedir(), '.cache', 'verify-chrome');
const PLATFORM = { linux: 'linux64', win32: 'win64' }[process.platform];

function chromeVersion() {
  if (process.env.VERIFY_CHROME_VERSION) return process.env.VERIFY_CHROME_VERSION;
  try {
    const v = execFileSync('curl', ['-fsS', '--max-time', '5',
      'https://googlechromelabs.github.io/chrome-for-testing/LATEST_RELEASE_STABLE'],
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (/^\d+\.\d+\.\d+\.\d+$/.test(v)) return v;
  } catch {}
  const days = Math.floor((Date.now() - Date.parse(PINNED_ON)) / 86400000);
  console.error(`[drive] Latest Chrome version lookup blocked; using pinned ${PINNED_VERSION} (${days} days old).` +
    (days > 60 ? ' Consider updating PINNED_VERSION in drive.mjs.' : ''));
  return PINNED_VERSION;
}

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

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (!PLATFORM) throw new Error(`No Chrome download for ${process.platform}; set CHROME_PATH`);
  const CHROME_VERSION = chromeVersion();
  const CACHE = join(CACHE_ROOT, CHROME_VERSION);
  const exe = join(CACHE, `chrome-headless-shell-${PLATFORM}`,
    process.platform === 'win32' ? 'chrome-headless-shell.exe' : 'chrome-headless-shell');
  // The marker is written only after a complete extraction, so an interrupted
  // download is re-fetched instead of being trusted forever.
  const marker = join(CACHE, '.complete');
  if (existsSync(marker) && existsSync(exe)) return exe;

  rmSync(CACHE, { recursive: true, force: true });
  mkdirSync(CACHE, { recursive: true });
  const zip = join(CACHE, 'chrome.zip');
  const url = `https://storage.googleapis.com/chrome-for-testing-public/${CHROME_VERSION}/${PLATFORM}/chrome-headless-shell-${PLATFORM}.zip`;
  console.error(`[drive] Downloading chrome-headless-shell ${CHROME_VERSION} (one time, ~120 MB)...`);
  // curl rather than fetch(): curl honours the cloud's proxy environment variables.
  execFileSync('curl', ['-fsSL', '--retry', '2', '-o', zip, url], { stdio: ['ignore', 'ignore', 'inherit'] });
  if (process.platform === 'win32') {
    execFileSync('tar', ['-xf', zip, '-C', CACHE], { stdio: 'inherit' });
  } else {
    try { execFileSync('unzip', ['-q', zip, '-d', CACHE], { stdio: 'inherit' }); }
    catch {
      // Python's zipfile drops the executable bit, so restore it afterwards.
      execFileSync('python3', ['-m', 'zipfile', '-e', zip, CACHE], { stdio: 'inherit' });
      const dir = join(CACHE, `chrome-headless-shell-${PLATFORM}`);
      for (const f of readdirSync(dir)) { try { chmodSync(join(dir, f), 0o755); } catch {} }
    }
  }
  rmSync(zip, { force: true });
  if (!existsSync(exe)) throw new Error(`Download finished but ${exe} is missing`);
  writeFileSync(marker, url);
  // Drop older downloads so a superseded Chrome is never picked up again.
  for (const d of readdirSync(CACHE_ROOT)) {
    if (d !== CHROME_VERSION) rmSync(join(CACHE_ROOT, d), { recursive: true, force: true });
  }
  return exe;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

function serve() {
  const server = createServer((req, res) => {
    let rel;
    try { rel = decodeURIComponent(new URL(req.url, 'http://x').pathname); }
    catch { res.writeHead(400); return res.end(); }
    // The app ships no favicon; a 404 here would read as a page error.
    if (rel === '/favicon.ico') { res.writeHead(204); return res.end(); }
    const p = resolve(REPO, '.' + rel);
    if (!(p + sep).startsWith(REPO + sep) || !existsSync(p) || statSync(p).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    res.writeHead(200, { 'content-type': TYPES[extname(p)] || 'application/octet-stream' });
    res.end(readFileSync(p));
  });
  return new Promise(r => server.listen(0, '127.0.0.1', () => r(server)));
}

function launch(bin, profile) {
  const args = ['--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
    '--no-default-browser-check', '--disable-gpu', '--disable-dev-shm-usage', 'about:blank'];
  if (!/headless-shell/.test(bin)) args.unshift('--headless=new');
  // Offline except for loopback: the app makes no network requests by design, and
  // cutting the browser off from the internet means an out-of-date Chrome never
  // sees untrusted content, which also makes --no-sandbox below acceptable.
  args.unshift('--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE 127.0.0.1', '--proxy-server=direct://');
  // Cloud containers usually can't use Chrome's sandbox.
  if (process.platform === 'linux') args.unshift('--no-sandbox');
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
  return new Promise((res, rej) => {
    const start = Date.now();
    const fail = msg => { clearInterval(poll); try { proc.kill(); } catch {} rej(launchError(bin, msg)); };
    const poll = setInterval(() => {
      if (exited) return fail(`${exited}\n${log}`);
      if (existsSync(portFile)) {
        const [port, path] = readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
        if (port && path) { clearInterval(poll); return res({ proc, wsUrl: `ws://127.0.0.1:${port}${path}` }); }
      }
      if (Date.now() - start > 30000) fail(log || 'timed out waiting for DevTools');
    }, 100);
  });
}

const delay = ms => new Promise(r => setTimeout(r, ms).unref());

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
    await Promise.race([new Promise(r => proc.once('exit', r)), delay(3000)]);
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
    // A closed socket (browser or tab crashed) must fail every pending call,
    // otherwise the run hangs with the HTTP server keeping Node alive.
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

async function pageTarget(wsUrl) {
  const base = 'http://' + new URL(wsUrl).host;
  for (let i = 0; i < 20; i++) {
    const list = await (await fetch(`${base}/json/list`)).json();
    const page = list.find(t => t.type === 'page');
    if (page) return page.webSocketDebuggerUrl;
    await delay(150);
  }
  return (await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json()).webSocketDebuggerUrl;
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
  // to the startup about:blank page rather than this navigation.
  const deadline = Date.now() + 20000;
  while (Date.now() < deadline) {
    // Evaluating mid-navigation can hit a destroyed context; just retry.
    const r = await cdp.send('Runtime.evaluate',
      { expression: 'location.href + "|" + document.readyState', returnByValue: true }).catch(() => null);
    if (r?.result?.value === `${url}|complete`) return;
    await delay(100);
  }
  throw new Error(`Page did not finish loading within 20s: ${url}`);
}

async function main() {
  if (typeof WebSocket !== 'function') {
    throw new Error(`Node ${process.version} has no global WebSocket; drive.mjs needs Node 22 or newer`);
  }
  const o = parseArgs(process.argv.slice(2));
  const body = o.eval ?? (o.file ? readFileSync(o.file, 'utf8') : null);
  const bin = findBrowser();
  const server = await serve();
  sweepOldProfiles();
  const profile = mkdtempSync(join(tmpdir(), 'verify-profile-'));
  let browser, cdp, loaded = false, failed = false;
  const errors = [];
  try {
    browser = await launch(bin, profile);
    cdp = new CDP(await pageTarget(browser.wsUrl));
    await cdp.open();
    cdp.on(m => {
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params.exceptionDetails;
        errors.push(`exception: ${d.exception?.description || d.text} (line ${d.lineNumber + 1})`);
      } else if (m.method === 'Runtime.consoleAPICalled' && ['error', 'warning', 'assert'].includes(m.params.type)) {
        errors.push(`console.${m.params.type}: ${m.params.args.map(a => a.value ?? a.description).join(' ')}`);
      } else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') {
        errors.push(`log: ${m.params.entry.text}`);
      }
    });
    await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Log.enable')]);
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: o.width, height: o.height, deviceScaleFactor: 1, mobile: false });
    await loadApp(cdp, `http://127.0.0.1:${server.address().port}/${o.page}`);
    loaded = true;
    await delay(300);
    console.log(`[drive] loaded ${o.page} (${bin.includes('headless-shell') ? 'chrome-headless-shell' : bin})`);

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
    server.close();
    // On Windows this can fail while Edge releases its files; sweepOldProfiles()
    // removes the folder on a later run.
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
  }
  if (failed || errors.some(e => e.startsWith('exception'))) process.exitCode = 1;
}

// exitCode rather than process.exit(): exiting while sockets are still closing
// trips a libuv assertion on Windows.
main().catch(e => { console.error(`[drive] FAILED: ${e.message}`); process.exitCode = 2; });
