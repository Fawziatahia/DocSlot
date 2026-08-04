import { defineConfig } from "vite";

// Production build is minified + tree-shaken by default. This config makes the
// intent explicit and splits rarely-changing vendor code (Bootstrap JS + Popper)
// into its own long-cached chunk, separate from app code that changes often.
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap's own SCSS still uses @import internally (not yet migrated
        // to @use), which is noise-only under modern Dart Sass — this silences
        // just that upstream warning, not warnings from our own code.
        silenceDeprecations: ["import", "global-builtin", "color-functions"],
        quietDeps: true,
      },
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    assetsInlineLimit: 4096,
    modulePreload: { polyfill: false },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("bootstrap") || id.includes("@popperjs")) return "vendor-bootstrap";
          }
        },
      },
    },
  },
});
