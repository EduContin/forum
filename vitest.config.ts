// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    forceRerunTriggers: ["**/*"], // Watch all TypeScript files in your src folder
  },
});
