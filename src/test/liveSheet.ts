// Node-only, test-facing: which test files read the LIVE price sheet (`data/patches/0.5.0/prices.json`,
// rewritten daily by the price bot). One definition shared by the allowlist test
// (`liveSheetReaders.test.ts`) and the market sweep (`scripts/market-sweep.mts`), so the files the
// sweep exercises are exactly the files the allowlist vouches for.
//
// It reads source text, not a module graph at run time, and it errs toward FLAGGING: a `loadPrices`
// argument it cannot resolve to the frozen fixture or the Java-era anchor counts as live. A false flag
// costs one allowlist line with a reason; a missed reader costs a red price bot on a day nothing broke.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, dirname, resolve, sep } from 'node:path';

/** What a path expression names. Only `live` changes with the market. */
type Sheet = 'live' | 'frozen' | 'anchor' | 'found';

/**
 * `frozen-patch` is `loadFrozenPrices()`'s fixture; `data/patches/0.5` is the Java-era anchor for the
 * differential tests (never refreshed); `data/found/` is the found sheet, which the bot never touches.
 * Anything else that names a price sheet is the one the bot rewrites.
 */
export function classifySheetPath(text: string): Sheet {
  if (/frozen-patch|FROZEN_PATCH_DIR|loadFrozenPrices/.test(text)) return 'frozen';
  if (/data\/found\//.test(text)) return 'found';
  if (/patches\/0\.5(?![.\d])/.test(text)) return 'anchor';
  return 'live';
}

/** `code` is the source with comments blanked; `quoted` marks where in it string-literal text sits. */
interface Scanned { code: string; strings: string[]; quoted: [number, number][]; }

/**
 * Comments out, string literals collected. A small lexer rather than a regex because comments here
 * routinely MENTION `prices.json` and `loadPrices(` (the staleTab test's header does), and a regex that
 * strips `//…` would also eat the `//` inside a URL string. Regex literals are skipped as a unit so a
 * quote inside one does not open a string.
 */
export function scanSource(src: string): Scanned {
  let code = '';
  const strings: string[] = [];
  const quoted: [number, number][] = [];
  // A stack of open template literals; each holds the brace depth of the `${…}` currently being read.
  const templates: { depth: number }[] = [];
  let lastSignificant = '';
  let i = 0;
  const readQuoted = (q: string): string => {
    let s = '';
    i++;
    while (i < src.length && src[i] !== q) {
      if (src[i] === '\\') { s += src.slice(i, i + 2); i += 2; continue; }
      if (src[i] === '\n') break; // an unterminated quote: stop at the line, as the parser would
      s += src[i];
      i++;
    }
    i++;
    return s;
  };
  // Reads template text up to the closing backtick or the next `${`, into both the collected string and
  // the code. Returns true when it stopped at `${` (the expression inside is then lexed as code).
  const readTemplate = (into: { text: string }): boolean => {
    const from = code.length;
    while (i < src.length) {
      const c = src[i]!;
      if (c === '\\') { into.text += src.slice(i, i + 2); code += src.slice(i, i + 2); i += 2; continue; }
      if (c === '`') { quoted.push([from, code.length]); code += c; i++; return false; }
      if (c === '$' && src[i + 1] === '{') { quoted.push([from, code.length]); into.text += '${'; code += '${'; i += 2; return true; }
      into.text += c;
      code += c;
      i++;
    }
    quoted.push([from, code.length]);
    return false;
  };
  const tplText: { text: string }[] = [];
  const openTemplate = (t: { text: string }): void => {
    if (readTemplate(t)) { tplText.push(t); templates.push({ depth: 0 }); } else strings.push(t.text);
    lastSignificant = '`';
  };
  while (i < src.length) {
    const c = src[i]!;
    const n = src[i + 1];
    if (c === '/' && n === '/') { while (i < src.length && src[i] !== '\n') i++; continue; }
    if (c === '/' && n === '*') {
      const end = src.indexOf('*/', i + 2);
      const stop = end < 0 ? src.length : end + 2;
      code += src.slice(i, stop).replace(/[^\n]/g, ' ');
      i = stop;
      continue;
    }
    if (c === '/' && (lastSignificant === '' || /[(,=:[!&|?{};+\-*%<>~^]/.test(lastSignificant))) {
      // A regex literal: copy it through untouched, honouring escapes and character classes.
      let inClass = false;
      code += c;
      i++;
      while (i < src.length && src[i] !== '\n') {
        const r = src[i]!;
        code += r;
        i++;
        if (r === '\\') { code += src[i] ?? ''; i++; continue; }
        if (r === '[') inClass = true;
        else if (r === ']') inClass = false;
        else if (r === '/' && !inClass) break;
      }
      lastSignificant = '/';
      continue;
    }
    if (c === "'" || c === '"') {
      const s = readQuoted(c);
      strings.push(s);
      quoted.push([code.length + 1, code.length + 1 + s.length]);
      code += c + s + c;
      lastSignificant = c;
      continue;
    }
    if (c === '`') {
      code += c;
      i++;
      openTemplate({ text: '' });
      continue;
    }
    if (templates.length && (c === '{' || c === '}')) {
      const top = templates[templates.length - 1]!;
      if (c === '{') top.depth++;
      else if (top.depth > 0) top.depth--;
      else {
        // The `}` that closes a `${…}`: resume the template it belongs to.
        templates.pop();
        const t = tplText.pop()!;
        t.text += '}';
        code += '}';
        i++;
        openTemplate(t);
        continue;
      }
    }
    code += c;
    if (!/\s/.test(c)) lastSignificant = c;
    i++;
  }
  return { code, strings, quoted };
}

const inQuotes = (at: number, quoted: [number, number][]): boolean => quoted.some(([a, b]) => at >= a && at < b);

/**
 * The argument text of every call to `name(` in `code`, balanced over nested parentheses. A call
 * spelled inside a string (a test's description, a fixture's source) is not a call.
 */
function callArgs({ code, quoted }: Scanned, name: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`(?<![\\w$.])(?<!function\\s+)${name}\\s*\\(`, 'g');
  for (let m = re.exec(code); m; m = re.exec(code)) {
    if (inQuotes(m.index, quoted)) continue;
    let depth = 1;
    let j = m.index + m[0].length;
    const start = j;
    while (j < code.length && depth > 0) {
      if (code[j] === '(') depth++;
      else if (code[j] === ')') depth--;
      j++;
    }
    out.push(code.slice(start, j - 1).trim());
  }
  return out;
}

/** Every way this one source text reads the live sheet itself, ignoring what it imports. */
export function liveSheetReads(src: string): string[] {
  const scanned = scanSource(src);
  const { code, strings, quoted } = scanned;
  const reasons: string[] = [];
  // A path to a price sheet: readFileSync, a static or dynamic JSON import, a join(…) of pieces. A
  // `?url` import is a URL the app FETCHES, which no test does unstubbed, so it is not a read.
  for (const s of strings) {
    if (/(^|\/)prices\.json$/.test(s) && classifySheetPath(s) === 'live') reasons.push(`names ${s}`);
  }
  // `loadPrices(<dir>)`, under its own name or an import alias.
  const names = ['loadPrices'];
  for (const m of code.matchAll(/\bloadPrices\s+as\s+([\w$]+)/g)) if (!inQuotes(m.index, quoted)) names.push(m[1]!);
  for (const name of names) {
    for (const arg of callArgs(scanned, name)) {
      let text = arg;
      if (/^[A-Za-z_$][\w$]*$/.test(arg)) {
        // A PATCH-style constant: judge what it was set to, if this file says.
        const decl = new RegExp(`(?:const|let|var)\\s+${arg.replace(/\$/g, '\\$')}\\s*(?::[^=]+)?=\\s*([^;\\n]+)`).exec(code);
        if (decl) text = `${arg} = ${decl[1]!.trim()}`;
      }
      if (classifySheetPath(text) === 'live') reasons.push(`${name}(${text})`);
    }
  }
  return reasons;
}

/** The loader itself: whether IT reads the live sheet is decided by each caller's argument. */
const LOADER = 'packages/optimizer/src/loadPrices.ts';
/** This file, whose patterns describe the reads rather than perform them. */
const SELF = 'src/test/liveSheet.ts';

const SKIP_DIRS = new Set(['node_modules', 'dist', 'e2e', '.git', 'release', 'coverage']);

function testFiles(root: string, dir = root, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) testFiles(root, full, out);
    else if (/\.test\.(ts|tsx|mts)$/.test(name)) out.push(full);
  }
  return out;
}

/** Local modules a source imports — static, dynamic, side-effect — resolved to files in the repo. */
function localImports(root: string, file: string, code: string): string[] {
  const specs = new Set<string>();
  for (const m of code.matchAll(/(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\1/g)) specs.add(m[2]!);
  const out: string[] = [];
  for (const spec of specs) {
    if (spec.includes('?')) continue; // ?url / ?raw: not a module whose code runs
    let base: string;
    if (spec.startsWith('.')) base = resolve(dirname(file), spec);
    else if (spec.startsWith('@/')) base = join(root, 'src', spec.slice(2));
    else continue;
    for (const cand of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
      if (/\.(ts|tsx|mts)$/.test(cand) && existsSync(cand) && statSync(cand).isFile()) { out.push(cand); break; }
    }
  }
  return out;
}

const posix = (p: string): string => p.split(sep).join('/');

/**
 * Every test file that reads the live sheet, directly or through a local module it imports, with what
 * it reads. Keys are repo-relative POSIX paths.
 */
export function findLiveSheetReaders(root: string): Map<string, string[]> {
  const memo = new Map<string, string[]>();
  const readsVia = (file: string, stack: Set<string>): string[] => {
    const hit = memo.get(file);
    if (hit) return hit;
    const rel = posix(relative(root, file));
    if (rel === LOADER || rel === SELF || stack.has(file)) return [];
    stack.add(file);
    const src = readFileSync(file, 'utf8');
    const reasons = liveSheetReads(src);
    for (const dep of localImports(root, file, scanSource(src).code)) {
      for (const r of readsVia(dep, stack)) {
        reasons.push(r.startsWith('via ') ? r : `via ${posix(relative(root, dep))}: ${r}`);
      }
    }
    stack.delete(file);
    memo.set(file, reasons);
    return reasons;
  };
  const found = new Map<string, string[]>();
  for (const file of testFiles(root).sort()) {
    const reasons = readsVia(file, new Set());
    if (reasons.length) found.set(posix(relative(root, file)), [...new Set(reasons)]);
  }
  return found;
}
