import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  cacheDir: process.env.VITE_CACHE_DIR ?? "node_modules/.vite",
  plugins: [react(), tailwindcss()],
  server: {
    port: 1420,
    strictPort: true,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-leaflet") || id.includes("/leaflet")) {
            return "vendor-map";
          }
          if (id.includes("@tauri-apps/api")) {
            return "vendor-tauri";
          }
          if (id.includes("uplot")) return "vendor-charts";
          return "vendor";
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "tests/contracts/**/*.test.ts",
    ],
    exclude: ["tests/playwright/**"],
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "lcov"],
      include: [
        "src/stores/**/*.ts",
        "src/hooks/**/*.ts",
        "src/components/**/*.tsx",
      ],
      exclude: ["src/main.tsx", "src/test/**"],
    },
  },
});
