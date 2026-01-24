import { test, expect } from '@playwright/test';
test('user can log in and reach topics', async ({ page }) => {
  await page.goto('/topics');
  await expect(page.getByRole('heading', { name: 'Study Topics' })).toBeVisible();
});
