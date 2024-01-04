import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(() => ({
  test: {
    globals: true, // This enables global test keywords like `describe`
    environment: "jsdom", // This simulates the browser environment
    setupFiles: "./vitest.setup.ts", // Optional setup file for Vitest
  },
  plugins: [
    react(), // Ensures compatibility with React
  ],
}));
