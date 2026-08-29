import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"
import { visualizer } from "rollup-plugin-visualizer"
import type { Plugin } from "vite"

/**
 * Start the 3.1 MB `mods.json` download while the browser is still fetching and parsing the JS bundle.
 * Without this the fetch cannot begin until `loadEngine()` runs, so the two biggest downloads on the
 * critical path are strictly serial.
 *
 * It hands `loadEngine` the actual Promise rather than emitting `<link rel="preload" as="fetch">`.
 * A preload link only avoids a second request when its mode and credentials match the later `fetch()`
 * exactly; get that wrong and the browser downloads 3.1 MB TWICE, which is worse than not preloading
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
        const mods = Object.keys(ctx.bundle ?? {}).find((f) => /static\/json\/mods-[^/]*\.json$/.test(f))
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
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  // The solve worker is built separately from the main bundle, with its own asset pipeline — and it
  // imports the same `?url` data files, so with default naming it emitted a SECOND copy of them
  // (mods.json alone is 3.1 MB). Giving it the identical naming scheme makes both builds resolve to
  // the same content-hashed path, so the file is written once and both entry points fetch it.
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        entryFileNames: 'static/js/[name]-[hash].js',
        chunkFileNames: 'static/js/[name]-[hash].js',
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]'
      }
    }
  },
  server: {
    port: 5173,
  },
})
