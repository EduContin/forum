// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    forceRerunTriggers: ["**/*"], // Watch all TypeScript files in your src folder
    hookTimeout: 60000, // Increase timeout to 60 seconds
  },
});
