import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
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
