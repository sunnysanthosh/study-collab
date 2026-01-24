import { test, expect } from '@playwright/test';
test('favorites can be toggled on topics', async ({ page }) => {
  await page.goto('/topics');
  await expect(page.getByRole('heading', { name: 'Study Topics' })).toBeVisible();

  const favoriteButton = page.locator(
    'button[aria-label="Add favorite"], button[aria-label="Remove favorite"]'
  ).first();

  await expect(favoriteButton).toBeVisible();
  const currentLabel = await favoriteButton.getAttribute('aria-label');
  const expectedLabel = currentLabel === 'Add favorite' ? 'Remove favorite' : 'Add favorite';

  await favoriteButton.click();
  await expect(favoriteButton).toHaveAttribute('aria-label', expectedLabel);
});
