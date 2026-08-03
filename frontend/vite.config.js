import { defineConfig } from "vite";

// Production build is minified + tree-shaken by default. This config makes the
// intent explicit and splits rarely-changing vendor code (Bootstrap JS + Popper)
// into its own long-cached chunk, separate from app code that changes often.
export default defineConfig({
  build: {
    target: "es2020",
    cssCodeSplit: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
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
