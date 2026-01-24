import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 62,
        functions: 57,
        branches: 42,
        statements: 62,
      },
    },
  },
});
