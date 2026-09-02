// Generate the Craft-of-Exile cross-check worksheet (HTML) from /tmp/coe.json.
// Run: npx tsx scripts/coe-artifact.mts  →  writes the artifact HTML to the scratchpad path below.
import { readFileSync, writeFileSync } from 'node:fs';

const OUT = '/tmp/claude-0/-home-dorian-Poe2Craft/fdc9d5e5-0604-43db-aa56-93b1c998a4e9/scratchpad/coe-crosscheck.html';
interface Row { text: string; id: string; weight: number; family: string; tiers: number }
interface Base {
  prefixCount: number; suffixCount: number; preTotal: number; sufTotal: number; poolTotal: number;
  prefixes: Row[]; suffixes: Row[];
  familyGroups: { family: string; sides: string; mods: string[] }[];
}
const data = JSON.parse(readFileSync('/tmp/coe.json', 'utf8')) as Record<string, Base>;

/**
 * HTML-escape, including BOTH quote characters — this output lands inside attributes as well as in
 * text, and an escaper that only covers `& < >` is one attribute away from producing broken markup.
 *
 * Not theoretical on this data: nine shipped mods carry an apostrophe ("if you've Hit Recently",
 * "Nature's Archon"). They are harmless in today's double-quoted attributes and would not have been
 * in single-quoted ones, which is exactly the kind of difference nobody notices while editing markup.
 * `&` must stay first or it would re-escape the ampersands the later rules introduce.
 */
const esc = (s: string) => s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');
const fmt = (n: number) => n.toLocaleString('en-US');
const pct = (w: number, tot: number) => (100 * w / tot).toFixed(3);
const coeUrl = 'https://www.craftofexile.com/?game=poe2';

// A per-base note on what to scrutinise, tuned to what our data shows.
const NOTES: Record<string, string> = {
  Body_Armours_str:
    'Our data lists <strong>no</strong> mutually-exclusive mods here — every mod is its own family. Armour usually has exclusion groups, so this is the prime suspect. On CoE, check whether <em>“#% increased Armour”</em> and the hybrid <em>“#% increased Armour and +# to maximum Life”</em> are mutually exclusive (you can only roll one). If they are, our family data is missing that group.',
  Amulets:
    'One exclusion group found: the four <em>“+# to Level of all … Skills”</em> suffixes share a family (correct — only one can roll). Confirm CoE shows the same four as mutually exclusive, and that nothing else on the amulet should be grouped.',
  Bows:
    'Our data lists no exclusion groups. The four <em>“Adds # to # &lt;element&gt; Damage”</em> prefixes are <em>flat</em> added damage and are normally independent (you can stack them), so separate families is likely correct — but confirm CoE agrees, and that the accuracy/attack-speed mods aren’t grouped.',
};

function table(rows: Row[], tot: number, side: string): string {
  const body = rows.map((r) => `
      <tr>
        <td class="chk"><input type="checkbox" aria-label="checked ${esc(r.text)}"></td>
        <td class="mod">${esc(r.text)}</td>
        <td class="num">${fmt(r.weight)}</td>
        <td class="num pctcol">${pct(r.weight, tot)}%</td>
        <td class="fam">${esc(r.family)}</td>
      </tr>`).join('');
  return `
    <div class="tablewrap">
      <table>
        <caption>${side} · ${rows.length} mods · Σ weight ${fmt(tot)}</caption>
        <thead><tr><th class="chk"></th><th>Modifier</th><th class="num">Weight</th><th class="num">Roll %</th><th>Family</th></tr></thead>
        <tbody>${body}
        </tbody>
      </table>
    </div>`;
}

function baseSection(id: string, b: Base): string {
  const groups = b.familyGroups.length === 0
    ? `<p class="muted">None — our data has no two mods sharing a family on this base.</p>`
    : b.familyGroups.map((g) => `
        <div class="group ${g.sides.includes('+') ? 'group--mixed' : ''}">
          <div class="group__fam">${esc(g.family)} <span class="group__sides">${g.sides}</span></div>
          <ul>${g.mods.map((m) => `<li>${esc(m)}</li>`).join('')}</ul>
        </div>`).join('');
  return `
  <section class="base">
    <header class="base__head">
      <div class="eyebrow">Base</div>
      <h2>${esc(id.replace(/_/g, ' '))}</h2>
    </header>
    <div class="stats">
      <div class="stat"><div class="stat__n">${b.prefixCount}</div><div class="stat__l">prefixes</div></div>
      <div class="stat"><div class="stat__n">${b.suffixCount}</div><div class="stat__l">suffixes</div></div>
      <div class="stat"><div class="stat__n">${fmt(b.preTotal)}</div><div class="stat__l">prefix Σ weight</div></div>
      <div class="stat"><div class="stat__n">${fmt(b.sufTotal)}</div><div class="stat__l">suffix Σ weight</div></div>
      <div class="stat stat--hero"><div class="stat__n">${fmt(b.poolTotal)}</div><div class="stat__l">pool total</div></div>
    </div>
    <div class="tables">
      ${table(b.prefixes, b.preTotal, 'Prefixes')}
      ${table(b.suffixes, b.sufTotal, 'Suffixes')}
    </div>
    <div class="groups">
      <div class="eyebrow">Mutual-exclusion groups (our data)</div>
      ${groups}
    </div>
    <aside class="verify">
      <div class="verify__tag">Verify on CoE</div>
      <p>${NOTES[id] ?? ''}</p>
      <ul class="verify__list">
        <li><input type="checkbox"> Pool total <b>${fmt(b.poolTotal)}</b> matches CoE</li>
        <li><input type="checkbox"> Top mod weights match (spot-check 3–4 rows above)</li>
        <li><input type="checkbox"> Mutual-exclusion groups match — same groupings, none missing</li>
      </ul>
    </aside>
  </section>`;
}

const sections = Object.entries(data).map(([id, b]) => baseSection(id, b)).join('\n');

const html = `<title>Craft of Exile cross-check — POE2_HTC</title>
<style>
  :root {
    --bg:#f6f6f9; --surface:#ffffff; --surface-2:#f0f0f5; --text:#1b1d24; --muted:#6a6d7c;
    --border:#e4e4ec; --accent:#6b5cf0; --accent-soft:#efedfe;
    --warn:#b4700a; --warn-soft:#fdf3e0; --warn-border:#eccf95;
    --ok:#2f9e64;
    --mono:ui-monospace,"SF Mono",Menlo,Consolas,monospace;
    --sans:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg:#121318; --surface:#191b22; --surface-2:#20232c; --text:#e7e8f0; --muted:#9a9db0;
      --border:#2a2d38; --accent:#9a8cff; --accent-soft:#241f3d;
      --warn:#f0ad3c; --warn-soft:#2c2312; --warn-border:#5a441c; --ok:#4fce8e;
    }
  }
  :root[data-theme="light"] {
    --bg:#f6f6f9; --surface:#ffffff; --surface-2:#f0f0f5; --text:#1b1d24; --muted:#6a6d7c;
    --border:#e4e4ec; --accent:#6b5cf0; --accent-soft:#efedfe;
    --warn:#b4700a; --warn-soft:#fdf3e0; --warn-border:#eccf95; --ok:#2f9e64;
  }
  :root[data-theme="dark"] {
    --bg:#121318; --surface:#191b22; --surface-2:#20232c; --text:#e7e8f0; --muted:#9a9db0;
    --border:#2a2d38; --accent:#9a8cff; --accent-soft:#241f3d;
    --warn:#f0ad3c; --warn-soft:#2c2312; --warn-border:#5a441c; --ok:#4fce8e;
  }

  * { box-sizing:border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font-family:var(--sans);
    line-height:1.55; -webkit-font-smoothing:antialiased; }
  .wrap { max-width:1000px; margin:0 auto; padding:48px 24px 96px; }

  .eyebrow { font-size:11px; font-weight:700; letter-spacing:.13em; text-transform:uppercase;
    color:var(--accent); margin-bottom:6px; }
  h1 { font-size:34px; line-height:1.1; margin:0 0 14px; text-wrap:balance; letter-spacing:-.01em; }
  h2 { font-size:23px; margin:0; letter-spacing:-.01em; }
  p { margin:0 0 12px; }
  .muted { color:var(--muted); }
  a { color:var(--accent); }

  .intro { max-width:70ch; color:var(--text); }
  .how { margin-top:22px; background:var(--surface); border:1px solid var(--border); border-radius:12px;
    padding:20px 22px; }
  .how h3 { margin:0 0 10px; font-size:15px; }
  .how ol { margin:0; padding-left:20px; }
  .how li { margin:5px 0; }
  .how .btn { display:inline-block; margin-top:14px; background:var(--accent); color:#fff;
    text-decoration:none; font-weight:600; font-size:14px; padding:9px 16px; border-radius:9px; }
  .legend { margin-top:12px; font-size:13px; color:var(--muted); }
  .legend code { font-family:var(--mono); color:var(--text); }

  .base { margin-top:56px; padding-top:8px; border-top:1px solid var(--border); }
  .base__head { margin:20px 0 18px; }
  .base__head .eyebrow { color:var(--muted); }

  .stats { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:22px; }
  .stat { background:var(--surface); border:1px solid var(--border); border-radius:10px;
    padding:12px 16px; min-width:120px; flex:1; }
  .stat--hero { border-color:var(--accent); background:var(--accent-soft); }
  .stat__n { font-family:var(--mono); font-size:22px; font-weight:600; font-variant-numeric:tabular-nums; }
  .stat__l { font-size:11px; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-top:2px; }

  .tables { display:grid; grid-template-columns:1fr 1fr; gap:18px; }
  @media (max-width:760px){ .tables{ grid-template-columns:1fr; } }
  .tablewrap { overflow-x:auto; border:1px solid var(--border); border-radius:10px; background:var(--surface); }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  caption { text-align:left; padding:11px 14px; font-weight:600; font-size:12px; color:var(--muted);
    border-bottom:1px solid var(--border); text-transform:uppercase; letter-spacing:.05em; }
  th, td { padding:7px 12px; text-align:left; border-bottom:1px solid var(--border); }
  thead th { font-size:11px; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); font-weight:600; }
  tbody tr:last-child td { border-bottom:none; }
  tbody tr:hover { background:var(--surface-2); }
  .num { text-align:right; font-family:var(--mono); font-variant-numeric:tabular-nums; white-space:nowrap; }
  .pctcol { color:var(--muted); }
  .mod { min-width:150px; }
  .fam { font-family:var(--mono); font-size:11px; color:var(--muted); white-space:nowrap; }
  .chk { width:26px; padding-left:12px; padding-right:0; }
  input[type=checkbox]{ accent-color:var(--accent); width:15px; height:15px; cursor:pointer; }

  .groups { margin-top:20px; }
  .group { background:var(--surface); border:1px solid var(--border); border-radius:9px; padding:10px 14px; margin-top:8px; }
  .group--mixed { border-color:var(--warn-border); background:var(--warn-soft); }
  .group__fam { font-family:var(--mono); font-size:13px; font-weight:600; }
  .group__sides { color:var(--muted); font-weight:400; }
  .group ul { margin:6px 0 0; padding-left:18px; font-size:13px; color:var(--muted); }

  .verify { margin-top:20px; background:var(--warn-soft); border:1px solid var(--warn-border);
    border-radius:12px; padding:18px 20px; }
  .verify__tag { display:inline-block; font-size:11px; font-weight:700; letter-spacing:.1em;
    text-transform:uppercase; color:var(--warn); margin-bottom:8px; }
  .verify p { max-width:72ch; }
  .verify__list { list-style:none; margin:12px 0 0; padding:0; }
  .verify__list li { display:flex; align-items:baseline; gap:9px; margin:7px 0; font-size:14px; }

  footer { margin-top:64px; padding-top:20px; border-top:1px solid var(--border); font-size:13px; color:var(--muted); }
  input:focus-visible { outline:2px solid var(--accent); outline-offset:2px; }
</style>

<div class="wrap">
  <header>
    <div class="eyebrow">POE2_HTC · Data validation</div>
    <h1>Craft of Exile cross-check</h1>
    <p class="intro">These are our engine’s normal-pool <strong>weights</strong> and <strong>family
      (exclusion) groups</strong> for three bases. Read the same numbers off Craft of Exile and tick the
      boxes — where they disagree, we’ve found a data bug (this is how the wand check caught the D7 family
      error). Weights are the robust check: they’re exact integers and don’t depend on item level.</p>

    <div class="how">
      <h3>How to read it off Craft of Exile</h3>
      <ol>
        <li>Open Craft of Exile (PoE2 mode) and pick the base — Body Armour (STR), Amulet, Bow.</li>
        <li>Set the item level high (95+) so every tier is in the pool, matching our “all tiers” weights.</li>
        <li>In the modifier list, each mod shows a <strong>weight</strong> and a roll chance. Compare a few
          against the tables below — start with the pool totals, then spot-check the heaviest mods.</li>
        <li>Note which mods CoE treats as <strong>mutually exclusive</strong> (can’t both roll) and compare
          to our exclusion groups. Missing or extra groups are the bugs we’re hunting.</li>
      </ol>
      <a class="btn" href="${coeUrl}" target="_blank" rel="noopener">Open Craft of Exile ↗</a>
      <p class="legend"><strong>Roll %</strong> = a mod’s weight ÷ the whole pool = its chance on a
        Transmute (one mod on a white item), the number CoE shows per mod. <code>P</code>/<code>S</code> in a
        group = prefix / suffix.</p>
    </div>
  </header>

  ${sections}

  <footer>
    Generated from <code>data/patches/0.5</code> (extracted 1:1 from the Java golden reference). Report any
    mismatch back and it’s logged in <code>docs/validation.md</code> and fixed at the data layer — never by
    tweaking engine math. Checkboxes persist in this browser only.
  </footer>
</div>

<script>
  // Persist checkbox state per browser so the worksheet survives a refresh.
  const KEY = 'coe-crosscheck-v1';
  const boxes = Array.from(document.querySelectorAll('input[type=checkbox]'));
  boxes.forEach((b, i) => (b.dataset.i = String(i)));
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '[]');
    saved.forEach((i) => { if (boxes[i]) boxes[i].checked = true; });
  } catch (e) { /* ignore */ }
  document.addEventListener('change', (e) => {
    if (e.target && e.target.matches('input[type=checkbox]')) {
      const on = boxes.filter((b) => b.checked).map((b) => Number(b.dataset.i));
      localStorage.setItem(KEY, JSON.stringify(on));
    }
  });
</script>`;

writeFileSync(OUT, html);
console.log('wrote', OUT, `(${(html.length / 1024).toFixed(1)} KB)`);
