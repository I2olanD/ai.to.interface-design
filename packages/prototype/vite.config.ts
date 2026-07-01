import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    target: "ES2020",
    lib: {
      entry: resolve(__dirname, "src/prototype.ts"),
      formats: ["iife"],
      name: "aitdPrototype",
      fileName: () => "prototype.min.js"
    },
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    outDir: resolve(__dirname, "dist")
  }
});
