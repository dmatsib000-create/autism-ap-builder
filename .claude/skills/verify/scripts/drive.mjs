#!/usr/bin/env node
// Headless driver for /verify in cloud sessions, where there is no browser pane.
// Serves the repo over loopback, opens autism-ap-builder.html in a headless
// Chromium via the DevTools protocol, runs a snippet of page JS, and prints the
// result, any page errors, and (optionally) a screenshot. Each run is a fresh
// page with a fresh profile, so every snippet must set up its own state.
//
// Zero npm dependencies on purpose (Node >= 22 ships a global WebSocket). The
// browser itself is fetched once into ~/.cache/verify-chrome from Chrome for
// Testing (storage.googleapis.com, on the cloud default allowlist) unless
// CHROME_PATH points at an existing Chrome/Edge.
//
// Usage:
//   node .claude/skills/verify/scripts/drive.mjs [steps.js] [--eval "js"]
//        [--shot out.png] [--width 1400] [--height 1000] [--page autism-ap-builder.html]

import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, dirname, extname, sep } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
const CACHE = join(homedir(), '.cache', 'verify-chrome');

function parseArgs(argv) {
  const o = { width: 1400, height: 1000, page: 'autism-ap-builder.html' };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--eval') o.eval = argv[++i];
    else if (a === '--shot') o.shot = argv[++i];
    else if (a === '--width') o.width = +argv[++i];
    else if (a === '--height') o.height = +argv[++i];
    else if (a === '--page') o.page = argv[++i];
    else if (!a.startsWith('--')) o.file = a;
    else throw new Error(`Unknown option ${a}`);
  }
  return o;
}

function findCached(dir) {
  if (!existsSync(dir)) return null;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { const hit = findCached(p); if (hit) return hit; }
    else if (/^chrome-headless-shell(\.exe)?$/.test(name)) return p;
  }
  return null;
}

function findBrowser() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const cached = findCached(CACHE);
  if (cached) return cached;
  console.error('[drive] No browser cached; downloading chrome-headless-shell (one time, ~100 MB)...');
  const out = execFileSync('npx', ['-y', '@puppeteer/browsers', 'install', 'chrome-headless-shell@stable', '--path', CACHE],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], shell: process.platform === 'win32' });
  const found = findCached(CACHE);
  if (!found) throw new Error(`Download finished but no executable found under ${CACHE}:\n${out}`);
  return found;
}

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

function serve() {
  const server = createServer((req, res) => {
    const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
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
  // Cloud containers usually can't use Chrome's sandbox. The page is local and trusted.
  if (process.platform === 'linux') args.unshift('--no-sandbox');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let log = '', exited = null;
  proc.stderr.on('data', d => { log += d; });
  proc.on('error', e => { exited = String(e); });
  // Exit code 0 is not fatal: on Windows the Edge/Chrome launcher can hand off to
  // a child process and exit. Readiness comes from the DevToolsActivePort file the
  // browser writes into the profile (stderr is not reliably attached on Windows).
  proc.on('exit', c => { if (c) exited = `exited with code ${c}`; });
  const portFile = join(profile, 'DevToolsActivePort');
  return new Promise((res, rej) => {
    const start = Date.now();
    const poll = setInterval(() => {
      if (exited) { clearInterval(poll); return rej(launchError(bin, `${exited}\n${log}`)); }
      if (existsSync(portFile)) {
        const [port, path] = readFileSync(portFile, 'utf8').trim().split(/\r?\n/);
        if (port && path) { clearInterval(poll); return res({ proc, wsUrl: `ws://127.0.0.1:${port}${path}` }); }
      }
      if (Date.now() - start > 30000) { clearInterval(poll); rej(launchError(bin, log || 'timed out waiting for DevTools')); }
    }, 100);
  });
}

async function closeBrowser(browser) {
  if (!browser) return;
  // Browser.close reaches the real browser even if the launcher process already exited.
  try {
    const b = new CDP(browser.wsUrl); await b.open();
    await Promise.race([b.send('Browser.close'), new Promise(r => setTimeout(r, 2000))]);
    b.ws.close();
  } catch {}
  if (browser.proc.exitCode === null) {
    await new Promise(r => { browser.proc.once('exit', r); setTimeout(r, 3000); });
  }
  try { browser.proc.kill(); } catch {}
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
        const { res, rej } = this.pending.get(m.id); this.pending.delete(m.id);
        m.error ? rej(new Error(m.error.message)) : res(m.result);
      } else this.listeners.forEach(fn => fn(m));
    };
    return new Promise((res, rej) => { this.ws.onopen = res; this.ws.onerror = () => rej(new Error('CDP socket error')); });
  }
  send(method, params = {}) {
    const id = ++this.seq;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((res, rej) => this.pending.set(id, { res, rej }));
  }
  on(fn) { this.listeners.push(fn); }
  waitFor(method, ms) {
    return new Promise((res, rej) => {
      const t = setTimeout(() => rej(new Error(`Timed out waiting for ${method}`)), ms);
      this.on(m => { if (m.method === method) { clearTimeout(t); res(m.params); } });
    });
  }
}

async function pageTarget(wsUrl) {
  const base = 'http://' + new URL(wsUrl).host;
  for (let i = 0; i < 20; i++) {
    const list = await (await fetch(`${base}/json/list`)).json();
    const page = list.find(t => t.type === 'page');
    if (page) return page.webSocketDebuggerUrl;
    await new Promise(r => setTimeout(r, 150));
  }
  return (await (await fetch(`${base}/json/new?about:blank`, { method: 'PUT' })).json()).webSocketDebuggerUrl;
}

function sweepOldProfiles() {
  for (const name of readdirSync(tmpdir())) {
    if (!name.startsWith('verify-profile-')) continue;
    const p = join(tmpdir(), name);
    try { if (Date.now() - statSync(p).mtimeMs > 60000) rmSync(p, { recursive: true, force: true }); } catch {}
  }
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const body = o.eval ?? (o.file ? readFileSync(o.file, 'utf8') : null);
  const bin = findBrowser();
  const server = await serve();
  sweepOldProfiles();
  const profile = mkdtempSync(join(tmpdir(), 'verify-profile-'));
  let browser, cdp, failed = false;
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
    const url = `http://127.0.0.1:${server.address().port}/${o.page}`;
    const loaded = cdp.waitFor('Page.loadEventFired', 20000);
    await cdp.send('Page.navigate', { url });
    await loaded;
    await new Promise(r => setTimeout(r, 300));
    console.log(`[drive] loaded ${o.page} (${bin.includes('headless-shell') ? 'chrome-headless-shell' : bin})`);

    if (body) {
      const r = await cdp.send('Runtime.evaluate', {
        expression: `(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms));\n${body}\n})()`,
        awaitPromise: true, returnByValue: true, userGesture: true,
      });
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
    console.log(errors.length ? `== page errors (${errors.length}) ==\n${errors.join('\n')}` : '== page errors: none ==');
    try { cdp?.ws.close(); } catch {}
    await closeBrowser(browser);
    server.close();
    // Edge on Windows can hold profile files for several seconds after exit; if this
    // fails, sweepOldProfiles() removes the folder on a later run.
    try { rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); } catch {}
  }
  if (failed || errors.some(e => e.startsWith('exception'))) process.exitCode = 1;
}

main().catch(e => { console.error(`[drive] ${e.message}`); process.exit(2); });
