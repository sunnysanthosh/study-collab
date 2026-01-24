import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60000,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  expect: {
    timeout: 10000,
  },
  use: {
    baseURL,
    headless: true,
    storageState: 'tests/e2e/.auth/user.json',
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
});
