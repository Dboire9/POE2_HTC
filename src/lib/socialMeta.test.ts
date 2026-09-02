import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

// The link-preview tags in index.html and the file in public/ describe each other, and nothing else
// checks that they agree. Nothing here runs in the app, so the whole suite could stay green while the
// image every Discord, Slack and X post shows was the wrong size, or was one no reader would refetch.
//
// This exists because both failures happened on the same afternoon: og.jpg was replaced under its own
// URL (so every reader kept serving its cached copy of the old one), and the replacement was captured
// at 2x while the tags went on declaring 1200x630.

const html = readFileSync('index.html', 'utf8');

/** Read a meta tag's content by its `property=` or `name=`. */
function meta(key: string): string {
  const m = new RegExp(`<meta (?:property|name)="${key}" content="([^"]*)"`).exec(html);
  expect(m, `index.html has no <meta ${key}>`).not.toBeNull();
  return m![1]!;
}

/**
 * A JPEG's real pixel size, from its first Start-Of-Frame marker.
 *
 * Parsed rather than pulled from a library because the point is to read the FILE, not to trust
 * whatever wrote it. Segments are `FF <marker> <2-byte length> ...`; SOF0/1/2/3 carry height then
 * width as big-endian 16-bit at offsets 5 and 7. Standalone markers (SOI/EOI/RSTn) have no length.
 */
function jpegSize(path: string): { width: number; height: number } {
  const d = readFileSync(path);
  let i = 2; // skip SOI
  while (i < d.length - 8) {
    if (d[i] !== 0xff) { i++; continue; }
    const marker = d[i + 1]!;
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: d.readUInt16BE(i + 5), width: d.readUInt16BE(i + 7) };
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    i += 2 + d.readUInt16BE(i + 2);
  }
  throw new Error(`no SOF marker in ${path}`);
}

describe('link-preview metadata', () => {
  const og = jpegSize('public/og.jpg');

  it('declares the dimensions the image actually has', () => {
    expect(Number(meta('og:image:width'))).toBe(og.width);
    expect(Number(meta('og:image:height'))).toBe(og.height);
  });

  // The spec ratio is 1200:630 — 1.9048, not the 1.91 it is usually rounded to, which is close enough
  // to trip a tolerance if you assert the rounded number. Drift far from it and Discord letterboxes
  // the card or drops to a small square thumbnail, which is the opposite of `summary_large_image`.
  it('keeps the aspect every reader lays the card out at', () => {
    expect(og.width / og.height).toBeCloseTo(1200 / 630, 3);
  });

  // Facebook's floor, and the reason the file is captured at 2x: Discord renders near 500 CSS px,
  // which is 1000 device px on a modern screen.
  it('is big enough for a high-resolution screen', () => {
    expect(og.width).toBeGreaterThanOrEqual(1200);
  });

  // THE one that matters when the image changes. Discord, Slack, X and Facebook cache a preview
  // against the image URL and hold it a long time, so re-rendering the file under the same URL leaves
  // everyone who has already seen the old card still seeing it — including in messages already posted.
  // The query string is the only cache key any of them expose.
  it('versions the image URL so a re-render is actually refetched', () => {
    expect(meta('og:image')).toMatch(/\/og\.jpg\?v=\d+$/);
    expect(meta('twitter:image')).toBe(meta('og:image'));
  });

  it('points every absolute URL at one host', () => {
    const host = (u: string): string => new URL(u).host;
    const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)![1]!;
    for (const [what, url] of [
      ['og:url', meta('og:url')], ['twitter:url', meta('twitter:url')],
      ['og:image', meta('og:image')], ['canonical', canonical],
    ] as const) {
      expect(host(url), `${what} disagrees with og:url's host`).toBe(host(meta('og:url')));
    }
  });

  // `summary_large_image` is what asks X (and Discord, which reads the Twitter tags as a fallback) for
  // the wide card rather than a thumbnail beside the text.
  it('asks for the large card', () => {
    expect(meta('twitter:card')).toBe('summary_large_image');
  });
});
