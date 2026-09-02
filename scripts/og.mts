/**
 * Render `scripts/og-card.html` to `public/og.jpg` — the link-preview image.
 *
 * The card is HTML rather than a binary somebody exported from a design tool once, so it can be
 * re-rendered when the tagline, the palette or the domain changes. Edit the HTML, run `npm run og`.
 *
 * JPEG at quality 90 because that is the extension `index.html` already declares and every reader has
 * cached; a format change would need the meta tags and the filename changed together, and readers
 * cache the URL. A dark gradient compresses to well under Discord's limits either way.
 *
 * The card is laid out at 1200x630 CSS px — Facebook's spec, which every other reader inherited — and
 * captured at SCALE 2, so the FILE is 2400x1260. That is deliberate: Discord shows it near 500 CSS px,
 * which is 1000 device px on any modern screen, and Facebook's own guidance is "at least 1200x630 for
 * high resolution devices". A screenshot is NOT downsampled by the encoder — an earlier comment here
 * claimed it was, and the meta tags went on declaring 1200x630 for a file twice that size.
 * `og:image:width` / `og:image:height` must state the FILE's size; socialMeta.test.ts pins that.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { statSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const card = join(here, 'og-card.html');
const out = join(here, '..', 'public', 'og.jpg');

const CARD_W = 1200; // the CSS box scripts/og-card.html is written against
const CARD_H = 630;
const SCALE = 2; // ...captured at 2x, so the emitted file is twice this. See the note above.

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: CARD_W, height: CARD_H },
  deviceScaleFactor: SCALE,
});
await page.goto(`file://${card}`);
// The two <img> layers are local files, but a screenshot taken before they decode renders the card
// without its own logo — silently, and it looks deliberate.
// The callback below is serialised and runs IN the page, where `document` is the browser's; ESLint
// lints this file as Node, where it is not. (A two-line disable does not work — the directive applies
// to the line straight after it, which would be the second comment line.)
// eslint-disable-next-line no-undef -- browser context, not Node
await page.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth > 0));
await page.screenshot({ path: out, type: 'jpeg', quality: 90 });
await browser.close();

console.log(
  `og.jpg ${CARD_W * SCALE}x${CARD_H * SCALE} -> ${out} (${(statSync(out).size / 1024).toFixed(1)} kB)`
  + `\n  index.html must declare og:image:width ${CARD_W * SCALE} / og:image:height ${CARD_H * SCALE}`
  + ' — and bump the ?v= on og:image, or no reader will refetch it.',
);
