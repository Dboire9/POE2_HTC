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

// Bundle analysis is OPT-IN (`ANALYZE=1 npm run build`) so an ordinary build stays byte-identical —
// the visualiser only writes a report, but keeping it out of the default pipeline means CI and
// deploys can never be affected by it. Opens nothing; writes dist/stats.html.
const analyze = process.env.ANALYZE === "1"

export default defineConfig({
  plugins: [
    react(),
    preloadPatchData(),
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
