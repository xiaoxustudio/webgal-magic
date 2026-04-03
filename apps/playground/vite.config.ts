import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "webgal-magic",
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "monaco",
              test: /node_modules\/monaco-editor/,
              minSize: 100000, // 100KB
              maxSize: 250000, // 250KB
              priority: 15,
            },
            {
              name: "vendor",
              test: /node_modules/,
              priority: 10,
            },
            {
              name: "common",
              minShareCount: 2,
              minSize: 10000,
              priority: 5,
            },
          ],
        },
      },
    },
  },
});
