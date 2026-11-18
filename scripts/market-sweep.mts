// The market sweep: does any test fail because the MARKET moved? The price bot runs the whole suite
// against each new poe.ninja sheet and holds the update when a test fails, so a test that asserts a
// market fact on the live sheet blocks fresh prices on a day nothing is broken. This runs every test
// file that reads the live sheet (the same detector `liveSheetReaders.test.ts` uses) against every
// sheet `main` has shipped, any sheet passed with --sheet (the bot's latest, say), and four synthetic
// markets made from main's current sheet:
//
//   ×0.3, ×3              every exalt price scaled — the whole market moved, nothing relative did
//   shuffle seed 1, 2     each key scaled on its own, log-uniform in ×0.5–2 — relative prices moved
//
// `omenQuotes` is left alone in the synthetics: it is a fallback quoted in its own native unit, not an
// exalt price.
//
//   npx tsx scripts/market-sweep.mts [--sheet <prices.json>]... [--days 60] [--jobs N] [--workers K]
//                                    [--only <test file>]... [--ref origin/main] [--sheets-only]
//
// `--sheets-only` runs the --sheet sheets alone, without history or synthetics: for checking that a
// deliberately broken sheet fails the test written for it. It is not the gate.
//
// Nothing in the working tree is written: each job runs in its own temporary copy of it (tracked and
// untracked files, so uncommitted fixes are what is tested; `node_modules` symlinked), with the sheet
// under test written into the copy. The copies are removed on exit.
//
// Every failure is re-run ALONE once before it counts: under a full machine a 30 s test timeout is
// load, not the market. A failure that does not reproduce is listed as flaky and does not gate.
//
// A failure on a sheet of an OLDER SHAPE — one missing a key or field today's sheet has (the rune keys,
// the ancient bones, `leagueSince`) — is re-run once more on that sheet with the missing entries copied
// in from today's. If it passes there, the test needed a key the sheet predates: "older shape", never
// gating. If it still fails, the market failed it, like any other.
//
// The gate: no reproduced market failure on any sheet from the last --days days, any --sheet, or any
// synthetic one. Older sheets are reported, not gated. The last line is `GATE PASSED` or `GATE FAILED`,
// and the exit code follows it.
import { execFileSync, spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { availableParallelism, tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { findLiveSheetReaders } from '../src/test/liveSheet.ts';

const SHEET_PATH = 'data/patches/0.5.0/prices.json';
const root = process.cwd();
if (!existsSync(join(root, SHEET_PATH))) throw new Error(`run from the repo root (no ${SHEET_PATH} here)`);

// ---- arguments ----------------------------------------------------------------------------------
const argv = process.argv.slice(2);
const many = (flag: string): string[] => argv.flatMap((a, i) => (a === flag && argv[i + 1] ? [argv[i + 1]!] : []));
const one = (flag: string, dflt: string): string => many(flag).at(-1) ?? dflt;
const days = Number(one('--days', '60'));
const ref = one('--ref', 'origin/main');
const workers = Number(one('--workers', '2'));
const jobs = Number(one('--jobs', String(Math.max(1, Math.floor(availableParallelism() / workers)))));
const only = many('--only');
const sheetsOnly = argv.includes('--sheets-only');

// ---- the sheets ---------------------------------------------------------------------------------
type Json = Record<string, unknown> & { prices: Record<string, number>; omens?: Record<string, number>; bones?: Record<string, number> };
interface Sheet { label: string; kind: 'history' | 'extra' | 'synthetic'; date: string; inGate: boolean; olderShape: string[]; text: string; }

const git = (...args: string[]): string => execFileSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 });
const today = new Date();
const cutoff = new Date(today.getTime() - days * 86_400_000).toISOString().slice(0, 10);
const current = JSON.parse(git('show', `${ref}:${SHEET_PATH}`)) as Json;

/** The keys a test can depend on: top-level fields and every priced key. `omenQuotes` is a fallback. */
const shapeOf = (s: Json): Set<string> => {
  const keys = new Set(Object.keys(s).map((k) => `field ${k}`));
  for (const sec of ['prices', 'omens', 'bones'] as const) for (const k of Object.keys(s[sec] ?? {})) keys.add(`${sec}.${k}`);
  return keys;
};
const currentShape = shapeOf(current);
const missingFrom = (s: Json): string[] => { const have = shapeOf(s); return [...currentShape].filter((k) => !have.has(k)); };
/** The sheet with every entry it lacks copied in from today's: the same market, today's shape. */
const filled = (text: string): string => {
  const s = JSON.parse(text) as Json;
  for (const key of missingFrom(s)) {
    if (key.startsWith('field ')) { const f = key.slice(6); s[f] = structuredClone(current[f]); continue; }
    const [sec, k] = [key.slice(0, key.indexOf('.')), key.slice(key.indexOf('.') + 1)] as ['prices' | 'omens' | 'bones', string];
    (s[sec] ??= {})[k] = current[sec]![k]!;
  }
  return JSON.stringify(s, null, 2);
};
const sheets: Sheet[] = [];
for (const line of sheetsOnly ? [] : git('log', '--format=%H %cs', ref, '--', SHEET_PATH).trim().split('\n')) {
  const [sha, date] = line.split(' ') as [string, string];
  const text = git('show', `${sha}:${SHEET_PATH}`);
  sheets.push({ label: `${date} ${sha.slice(0, 8)}`, kind: 'history', date, inGate: date >= cutoff, olderShape: missingFrom(JSON.parse(text) as Json), text });
}
for (const path of many('--sheet')) {
  const text = readFileSync(path, 'utf8');
  const s = JSON.parse(text) as Json;
  sheets.push({ label: `${basename(path)} (${String(s.updated ?? '?')})`, kind: 'extra', date: String(s.updated ?? ''), inGate: true, olderShape: missingFrom(s), text });
}

/** mulberry32: a seeded PRNG, so a shuffled market is the same market on every run. */
const rng = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
// Keys are visited in sorted order, so a seeded factor lands on the same key every run.
const scaled = (factor: () => number): string => {
  const out = structuredClone(current);
  for (const sec of ['prices', 'omens', 'bones'] as const) {
    const block = out[sec];
    if (!block) continue;
    for (const k of Object.keys(block).sort()) block[k] = block[k]! * factor();
  }
  return JSON.stringify(out, null, 2);
};
const shuffle = (seed: number): string => { const r = rng(seed); return scaled(() => 0.5 * 4 ** r()); };
const synth = (label: string, text: string): Sheet => ({ label, kind: 'synthetic', date: '', inGate: true, olderShape: [], text });
if (!sheetsOnly) {
  sheets.push(synth('synthetic ×0.3', scaled(() => 0.3)), synth('synthetic ×3', scaled(() => 3)),
    synth('synthetic shuffle seed 1', shuffle(1)), synth('synthetic shuffle seed 2', shuffle(2)));
}

// ---- the files ----------------------------------------------------------------------------------
const files = only.length ? only : [...findLiveSheetReaders(root).keys()];

// ---- workspaces ---------------------------------------------------------------------------------
const tmpRoot = mkdtempSync(join(tmpdir(), 'market-sweep-'));
const cleanup = (): void => { rmSync(tmpRoot, { recursive: true, force: true }); };
process.on('exit', cleanup);
for (const sig of ['SIGINT', 'SIGTERM'] as const) process.on(sig, () => { cleanup(); process.exit(130); });

const tree = git('ls-files', '-co', '--exclude-standard', '-z').split('\0').filter((f) => f && existsSync(join(root, f)));
const nodeModules = realpathSync(join(root, 'node_modules'));
const makeSlot = (n: number): string => {
  const dir = join(tmpRoot, `slot-${n}`);
  for (const f of tree) { mkdirSync(dirname(join(dir, f)), { recursive: true }); cpSync(join(root, f), join(dir, f)); }
  symlinkSync(nodeModules, join(dir, 'node_modules'));
  return dir;
};

// ---- running ------------------------------------------------------------------------------------
interface Failure { test: string; message: string; }
type FileFailures = Map<string, Failure[]>;

interface VitestJson { testResults: { name: string; status: string; message?: string; assertionResults: { fullName: string; status: string; failureMessages: string[] }[] }[]; }

const firstLine = (s: string): string => s.split('\n').find((l) => l.trim())?.trim().slice(0, 160) ?? '';

const escapeRe = (t: string): string => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function runVitest(slot: string, text: string, which: string[], maxWorkers: number, only?: string[]): Promise<FileFailures> {
  writeFileSync(join(slot, SHEET_PATH), text);
  const out = join(slot, 'sweep-result.json');
  rmSync(out, { force: true });
  return new Promise((done) => {
    const child = spawn(process.execPath, [join(slot, 'node_modules/vitest/vitest.mjs'), 'run', ...which,
      '--reporter=json', `--outputFile=${out}`, `--maxWorkers=${maxWorkers}`, '--no-cache',
      ...(only ? [`--testNamePattern=^(?:${only.map(escapeRe).join('|')})$`] : [])],
    { cwd: slot, env: { ...process.env, FORCE_COLOR: '0' }, stdio: ['ignore', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d: Buffer) => { stderr = (stderr + d.toString()).slice(-4000); });
    child.on('close', () => {
      const fails: FileFailures = new Map();
      if (!existsSync(out)) { fails.set('(vitest)', [{ test: '(run)', message: firstLine(stderr) || 'no result file' }]); done(fails); return; }
      const res = JSON.parse(readFileSync(out, 'utf8')) as VitestJson;
      for (const r of res.testResults) {
        const file = r.name.slice(slot.length + 1);
        const failed = r.assertionResults.filter((a) => a.status === 'failed')
          .map((a) => ({ test: a.fullName, message: firstLine(a.failureMessages.join('\n')) }));
        if (!failed.length && r.status === 'failed') failed.push({ test: '(file failed to run)', message: firstLine(r.message ?? '') });
        if (failed.length) fails.set(file, failed);
      }
      done(fails);
    });
  });
}

// Every copy is made up front, so the tree under test is the one on disk when the sweep started — an
// edit made while it runs reaches neither pass.
const slots = Array.from({ length: jobs }, (_, i) => makeSlot(i));

// eslint-disable-next-line no-unused-vars -- names in a function TYPE; the untyped script tier reads them as variables
async function pool<T>(tasks: T[], n: number, work: (task: T, slot: string) => Promise<void>): Promise<void> {
  let next = 0;
  await Promise.all(slots.slice(0, n).map(async (slot) => {
    while (next < tasks.length) await work(tasks[next++]!, slot);
  }));
}

const t0 = Date.now();
const secs = (): string => `${Math.round((Date.now() - t0) / 1000)}s`;
console.log(`${files.length} live-sheet test files × ${sheets.length} sheets ` +
  `(${sheets.filter((s) => s.kind === 'history').length} from ${ref}, ${sheets.filter((s) => s.kind === 'history' && s.inGate).length} since ${cutoff}; ` +
  `${sheets.filter((s) => s.kind === 'extra').length} extra; ${sheets.filter((s) => s.kind === 'synthetic').length} synthetic), ${jobs} jobs × ${workers} workers`);
for (const f of files) console.log(`  ${f}`);

// Pass 1: every sheet, all files at once.
const firstPass = new Map<Sheet, FileFailures>();
let finished = 0;
await pool(sheets, jobs, async (sheet, slot) => {
  const fails = await runVitest(slot, sheet.text, files, workers);
  firstPass.set(sheet, fails);
  finished++;
  const n = [...fails.values()].reduce((a, f) => a + f.length, 0);
  console.log(`[${secs()}] ${finished}/${sheets.length} ${sheet.label}: ${n ? `${n} failing` : 'ok'}`);
});

// Pass 2: each failing (sheet, file) alone, a few at a time, so load cannot be what fails it — and on
// an older-shape sheet, again with today's shape filled in.
// Only the tests that failed are re-run (a file that failed to load re-runs whole): `solve.test.ts` alone
// is two minutes, and it would be paid again for every sheet one of its tests failed on.
const reruns = [...firstPass].flatMap(([sheet, fails]) => [...fails].filter(([f]) => f !== '(vitest)')
  .flatMap(([file, list]) => {
    const tests = list.some((f) => f.test === '(file failed to run)') ? undefined : list.map((f) => f.test);
    return [{ sheet, file, tests, fill: false }, ...(sheet.olderShape.length ? [{ sheet, file, tests, fill: true }] : [])];
  }));
const confirmed = new Map<Sheet, FileFailures>();
const onFilled = new Map<Sheet, FileFailures>();
console.log(`[${secs()}] re-running ${reruns.length} failing file(s) alone`);
await pool(reruns, Math.min(jobs, 4), async ({ sheet, file, tests, fill }, slot) => {
  const got = (await runVitest(slot, fill ? filled(sheet.text) : sheet.text, [file], 1, tests)).get(file);
  if (!got) return;
  const into = fill ? onFilled : confirmed;
  if (!into.has(sheet)) into.set(sheet, new Map());
  into.get(sheet)!.set(file, got);
});
for (const [sheet, fails] of firstPass) {
  const v = fails.get('(vitest)');
  if (v) { if (!confirmed.has(sheet)) confirmed.set(sheet, new Map()); confirmed.get(sheet)!.set('(vitest)', v); }
}

// ---- the report ---------------------------------------------------------------------------------
interface Row { file: string; test: string; reproduced: Map<Sheet, string>; flaky: Sheet[]; }
const rows = new Map<string, Row>();
const rowOf = (file: string, test: string): Row => {
  const key = `${file} > ${test}`;
  if (!rows.has(key)) rows.set(key, { file, test, reproduced: new Map(), flaky: [] });
  return rows.get(key)!;
};
for (const [sheet, fails] of firstPass) {
  for (const [file, list] of fails) {
    for (const f of list) {
      const again = confirmed.get(sheet)?.get(file)?.find((g) => g.test === f.test);
      if (again) rowOf(file, f.test).reproduced.set(sheet, again.message);
      else rowOf(file, f.test).flaky.push(sheet);
    }
  }
}
const byDate = (a: Sheet, b: Sheet): number => sheets.indexOf(a) - sheets.indexOf(b);
const list = (xs: Sheet[]): string => [...xs].sort(byDate).map((s) => s.label).join(', ');
/** A long run of history sheets reads better as its count and its two ends. */
const span = (xs: Sheet[]): string => {
  const sorted = [...xs].sort(byDate);
  return sorted.length <= 4 ? list(sorted) : `${sorted.at(-1)!.label} … ${sorted[0]!.label}`;
};
let gateFails = 0;
const table: string[][] = [];
const detail: string[] = [];
for (const row of [...rows.values()].sort((a, b) => a.file.localeCompare(b.file) || a.test.localeCompare(b.test))) {
  const failing = [...row.reproduced.keys()];
  const fillPasses = (s: Sheet): boolean => s.olderShape.length > 0
    && !onFilled.get(s)?.get(row.file)?.some((f) => f.test === row.test);
  const shapeOnly = failing.filter(fillPasses);
  const market = failing.filter((s) => !fillPasses(s));
  const gating = market.filter((s) => s.inGate);
  const outside = market.filter((s) => !s.inGate);
  gateFails += gating.length;
  table.push([gating.length ? 'FAIL' : 'ok', `${row.file} > ${row.test}`, String(gating.length), String(outside.length), String(shapeOnly.length), String(row.flaky.length)]);
  detail.push(`\n${gating.length ? 'FAIL' : 'ok  '} ${row.file} > ${row.test}`);
  if (gating.length) detail.push(`  gating (${gating.length}): ${list(gating)}`, `    e.g. ${row.reproduced.get(gating[0]!)}`);
  if (outside.length) detail.push(`  on its content, before ${cutoff} (${outside.length}): ${span(outside)}`, `    e.g. ${row.reproduced.get(outside[0]!)}`);
  if (shapeOnly.length) {
    // What every one of those sheets lacks, grouped (`prices.rune:… (13)`): the test needs one of these.
    const lacks = shapeOnly.map((s) => new Set(s.olderShape)).reduce((a, b) => new Set([...a].filter((k) => b.has(k))));
    const groups = new Map<string, number>();
    for (const k of lacks) { const g = k.replace(/^(prices\.[^:]+):.*/, '$1:…'); groups.set(g, (groups.get(g) ?? 0) + 1); }
    const named = [...groups].map(([g, n]) => (n > 1 ? `${g} (${n})` : g));
    detail.push(`  older shape, passes once filled (${shapeOnly.length}): ${span(shapeOnly)}`,
      `    all of them lack ${named.slice(0, 6).join(', ')}${named.length > 6 ? `, … ${named.length - 6} more` : ''}`);
  }
  if (row.flaky.length) detail.push(`  flaky, passed alone (${row.flaky.length}): ${list(row.flaky)}`);
}
console.log('\n==== test → sheets it fails on ====');
if (!rows.size) console.log('  (none: every live-sheet test passed on every sheet)');
else {
  console.log(`gating = since ${cutoff}, --sheet or synthetic; content = an older sheet failed on what it holds, not its shape;`);
  console.log('shape = failed only for want of a key the sheet predates; flaky = did not reproduce alone\n');
  console.log("      gating content shape flaky  test");
  for (const [v, name, g, m, sh, f] of table) console.log(`${v!.padEnd(5)} ${g!.padStart(6)} ${m!.padStart(6)} ${sh!.padStart(5)} ${f!.padStart(5)}  ${name}`);
  for (const line of detail) console.log(line);
}
console.log(`\n${sheets.length} sheets, ${files.length} files, ${rows.size} failing test(s), ${gateFails} gating failure(s), ${secs()}`);
console.log(gateFails ? 'GATE FAILED' : sheetsOnly ? 'NO FAILURES (--sheets-only: not the gate)' : 'GATE PASSED');
process.exitCode = gateFails ? 1 : 0;
