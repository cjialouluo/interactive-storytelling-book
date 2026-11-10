import { defineConfig } from "vite";

// Minimal config. The engine is a large single file; raise the warning limit
// so production builds don't spam about chunk size.
export default defineConfig({
  server: {
    port: 5199,
    open: false,
  },
  // The engine uses top-level await, so target browsers that support it.
  esbuild: { target: "es2022" },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 2000,
  },
});
