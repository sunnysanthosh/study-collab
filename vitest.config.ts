import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'jsdom',
    setupFiles: ['src/setupTests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['backend/**', 'node_modules/**'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 50,
        functions: 40,
        branches: 30,
        statements: 50,
      },
    },
  },
});
