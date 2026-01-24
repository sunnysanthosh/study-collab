import { test, expect } from '@playwright/test';

test.use({ storageState: { cookies: [], origins: [] } });

test('login page renders core fields', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.locator('input#password')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
});

test('signup page renders core fields', async ({ page }) => {
  await page.goto('/signup');
  await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
  await expect(page.getByLabel('Full Name')).toBeVisible();
  await expect(page.getByLabel('Email')).toBeVisible();
  await expect(page.locator('input#password')).toBeVisible();
  await expect(page.locator('input#confirmPassword')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
});
