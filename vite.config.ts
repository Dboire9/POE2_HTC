import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { createHash } from "node:crypto"
import { visualizer } from "rollup-plugin-visualizer"
import type { Plugin } from "vite"
import { shipModsJson } from "./packages/engine/src/shipMods.ts"
import { userGuidePlugin } from "./src/lib/guide/vitePlugin.ts"
import type { ModsFile } from "./packages/engine/src/indexPatch.ts"

/** The emitted patch-data assets. One regex, because two plugins below both have to find them. */
const JSON_ASSET_RE = /^static\/json\/.*\.json$/
const MODS_ASSET_RE = /^static\/json\/mods-[^/]*\.json$/

/**
 * Ship the patch data as bytes rather than as the repo's working copy of it.
 *
 * `data/patches/<patch>/*.json` is a RECORD: pretty-printed so a refresh produces a readable diff,
 * and complete down to fields nothing reads (see shipMods.ts). None of that should reach a phone on
 * a bad connection. Every emitted JSON asset is re-serialized minified, and the mods file is also
 * projected onto exactly the fields `Mod` declares.
 *
 * Measured against the live site's own compression (brotli q3 / lgwin 19, which reproduces
 * poe2htc.com's byte counts exactly) — see docs/validation.md:
 *
 *   mods.json        137,701 -> 65,013 wire bytes (-52.8%), JSON.parse 6.15ms -> 3.32ms
 *   base_items.json   14,132 -> 13,142
 *   prices.json        7,567 ->  7,444
 *
 * A build with no data asset means the naming scheme moved, and silently shipping the unstripped
 * file would be a 2x regression nobody would notice, so it warns rather than passing quietly.
 */
function shipPatchData(): Plugin {
  return {
    name: "ship-patch-data",
    apply: "build",
    generateBundle(_options, bundle) {
      let sawMods = false
      for (const [fileName, out] of Object.entries(bundle)) {
        if (out.type !== "asset" || !JSON_ASSET_RE.test(fileName)) continue
        sawMods ||= MODS_ASSET_RE.test(fileName)
        out.source = shippedJson(sourceName(out), asText(out.source))
      }
      if (!sawMods) this.warn("no mods asset in this build — shipping patch data unstripped")
    },
  }
}

const asText = (source: string | Uint8Array): string =>
  typeof source === "string" ? source : Buffer.from(source).toString("utf8")

/** The original filename of an emitted asset, across Rollup's `name` (deprecated) and `names`. */
const sourceName = (info: { names?: readonly string[]; name?: string | undefined }): string =>
  info.names?.[0] ?? info.name ?? ""

/** The bytes a patch-data asset ships as. Minified always; the mods file also projected onto `Mod`. */
function shippedJson(sourceFileName: string, text: string): string {
  const parsed: unknown = JSON.parse(text)
  return sourceFileName === "mods.json" ? shipModsJson(parsed as ModsFile) : JSON.stringify(parsed)
}


/**
 * Name a JSON asset after the bytes it SHIPS, not after the repo's copy of them.
 *
 * Rollup fixes an asset's content hash before `generateBundle`, so a plugin that rewrites the content
 * there — which `shipPatchData` does — leaves the URL describing a file that no longer exists at it.
 * Harmless the day it lands, and a silent correctness bug the day the projection changes without the
 * DATA changing: same hash, same `immutable, max-age=31536000` URL, and every returning browser keeps
 * an asset missing whatever field was just added to `Mod`. Hashing the shipped bytes makes the URL
 * turn over exactly when the download does, which is what a content hash is for.
 *
 * `shippedJson` is shared with the rewrite above rather than reimplemented, because a name hashed
 * over bytes the build then does not write would be worse than not hashing at all.
 */
const DEFAULT_ASSET_NAMES = "static/[ext]/[name]-[hash].[ext]"
function assetFileNames(info: { names?: readonly string[]; name?: string | undefined; source: string | Uint8Array }): string {
  const name = sourceName(info)
  if (!name.endsWith(".json")) return DEFAULT_ASSET_NAMES
  const hash = createHash("sha256").update(shippedJson(name, asText(info.source))).digest("base64url").slice(0, 8)
  return `static/json/${name.replace(/\.json$/, "")}-${hash}.json`
}

/**
 * Start the `mods.json` download while the browser is still fetching and parsing the JS bundle.
 * Without this the fetch cannot begin until `loadEngine()` runs, so the two biggest downloads on the
 * critical path are strictly serial.
 *
 * It hands `loadEngine` the actual Promise rather than emitting `<link rel="preload" as="fetch">`.
 * A preload link only avoids a second request when its mode and credentials match the later `fetch()`
 * exactly; get that wrong and the browser downloads the whole asset TWICE, which is worse than not preloading
 * at all. Reusing one Promise makes it a single request by construction, with no matching rules to
 * get wrong. The filename is content-hashed, so the tag can only be written once the bundle exists.
 *
 * The solve worker has no `window` and falls through to its own `fetch` — the HTTP cache serves it.
 */
function preloadPatchData(): Plugin {
  return {
    name: "preload-patch-data",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      handler(html, ctx) {
        const mods = Object.keys(ctx.bundle ?? {}).find((f) => MODS_ASSET_RE.test(f))
        if (!mods) return html // no data asset in this build — inject nothing rather than a broken URL
        const url = JSON.stringify(`./${mods}`)
        return {
          html,
          tags: [{
            tag: "script",
            // head-PREPEND: the point is to start this download before anything else in the document.
            // (Module scripts defer, so appending would also work — prepending makes it not depend on that.)
            injectTo: "head-prepend" as const,
            // Failures are swallowed: loadEngine falls back to its own fetch and reports errors properly.
            children: `window.__patchPreload={mods:fetch(${url}).catch(function(){return null})};`,
          }],
        }
      },
    },
  }
}

/**
 * Say out loud when a production build ships with no error reporting.
 *
 * `VITE_SENTRY_DSN` is read at BUILD time — Vite inlines `import.meta.env.*` as a literal, so with
 * the variable unset the guard in src/lib/sentry.ts is provably true and Rollup deletes the whole
 * init. The build succeeds, the site works, and not one error ever reaches anybody. That is a bad
 * thing to discover from a user report, and nothing in the pipeline mentioned it.
 *
 * A WARNING rather than a hard failure: reporting being off does not break the app, and failing the
 * build would take the site down over telemetry config — a worse outcome than the one being fixed.
 */
function warnIfUnmonitored(): Plugin {
  return {
    name: "warn-if-unmonitored",
    apply: "build",
    configResolved(config) {
      if (config.env.VITE_SENTRY_DSN || config.mode !== "production") return
      config.logger.warn(
        "\n  \x1b[33m⚠  No VITE_SENTRY_DSN — this build reports no errors to anyone.\x1b[0m\n" +
        "     Sentry's init is dead-code-eliminated without it, by design.\n" +
        "     To turn it on: Vercel → Settings → Environment Variables → VITE_SENTRY_DSN,\n" +
        "     then redeploy. It is read at build time, so a redeploy is required.\n"
      )
    },
  }
}

// Bundle analysis is OPT-IN (`ANALYZE=1 npm run build`) so an ordinary build stays byte-identical —
// the visualiser only writes a report, but keeping it out of the default pipeline means CI and
// deploys can never be affected by it. Opens nothing; writes dist/stats.html.
const analyze = process.env.ANALYZE === "1"

export default defineConfig({
  plugins: [
    react(),
    shipPatchData(),
    userGuidePlugin(__dirname),
    preloadPatchData(),
    warnIfUnmonitored(),
    ...(analyze ? [visualizer({ filename: "dist/stats.html", gzipSize: true, brotliSize: false })] : []),
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: 'static',
    /**
     * Source maps, served publicly alongside the bundles.
     *
     * Without them a Sentry issue reads `index-R5rPqtGC.js:1:284729` inside a function called `Xe` —
     * you learn that something broke and on which craft, but not where. With them the stack names the
     * real file and line.
     *
     * Public is the right trade HERE specifically: this repo is public and AGPL-3.0, so the source is
     * already readable on GitHub and a `.map` reveals nothing new. That is also what makes this the
     * cheap option — the alternative (`'hidden'` plus @sentry/vite-plugin uploading them) needs a
     * SENTRY_AUTH_TOKEN, which unlike a DSN is a real secret to store and rotate. Reach for that only
     * if this repo ever stops being public.
     *
     * Users do not pay for them: a browser fetches a `.map` only when devtools are open, so the cost
     * is deploy size, not page weight.
     */
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames
      }
    }
  },
  // The solve worker is built separately from the main bundle, with its own asset pipeline — and it
  // imports the same `?url` data files, so with default naming it emitted a SECOND copy of them
  // (mods.json is the big one). Giving it the identical naming scheme — including the `assetFileNames`
  // FUNCTION above, which both outputs must share — makes both builds resolve to
  // the same content-hashed path, so the file is written once and both entry points fetch it.
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames
      }
    }
  },
  server: {
    port: 5173,
  },
})
