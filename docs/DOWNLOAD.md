# Running POE2HTC

**There is nothing to download. POE2HTC is a web page — open it and it works.**

👉 **[poe2htc.com](https://poe2htc.com/)**

Nothing to install, nothing to update: the page always serves the current version, and your settings
(the currencies you don't have, your search effort, the craft you were working on) are kept in your
own browser.

## "I want to share a craft"

Use **Copy link**. It encodes the whole workspace — base, mods, tiers, budget — into the URL, so
whoever opens it sees exactly what you were looking at. It is also the fastest way to report a
problem: the **🐛 Report a problem** button builds a message with that link already in it.

## Was there a desktop version?

Yes, until 2026-08-22. It was an Electron build published to GitHub Releases, and it was retired when
solving moved into a Web Worker: Chromium blocks module Workers on the `file://` origin a packaged
Electron app loads from, so the desktop build could not run the solver at all. The web version is
the whole product now — and it is the same code, so it is not a lesser one.

Older `.AppImage` / `.exe` files may still exist under GitHub Releases. **Don't use them**: they are
frozen at 0.5-era data and predate every crafting-mechanic correction since.

From 1.0.0 a release also attaches a `POE2HTC-web-<version>.zip`. That is **not** an app to install —
it is the built site, for anyone who wants to host their own copy (see below). Nothing on the Releases
page is something you need in order to use POE2HTC.

## Running it yourself

```bash
git clone https://github.com/Dboire9/POE2_HTC
cd POE2_HTC
npm install
npm run dev      # http://localhost:5173
```

`npm run build` produces a static site in `dist/` — any static host will serve it.
