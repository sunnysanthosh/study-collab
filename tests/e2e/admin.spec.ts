import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/e2e/.auth/admin.json' });
test('admin dashboard loads stats and users', async ({ page }) => {
  await page.goto('/admin');
  const statsResponse = await page.waitForResponse((response) =>
    response.url().includes('/api/admin/stats')
  );
  expect(statsResponse.status()).toBe(200);
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await expect(page.getByText('Total Users')).toBeVisible();
  await expect(page.getByText('Active Topics')).toBeVisible();
});
