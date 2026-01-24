import { test, expect } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';

test('chat message persists after reload', async ({ page }) => {
  await page.goto('/topics');
  const roomLink = page.getByRole('link', { name: 'Join Room' }).first();
  const roomHref = await roomLink.getAttribute('href');
  await roomLink.click();
  await page.waitForURL('**/topics/**');
  await expect(page.getByText('• Connected')).toBeVisible({ timeout: 10000 });

  if (!roomHref) {
    throw new Error('Room link not found');
  }

  const topicId = roomHref.split('/').pop();
  const token = await page.evaluate(() => localStorage.getItem('studycollab_token'));
  if (!topicId || !token) {
    throw new Error('Missing topic id or token');
  }

  const message = `E2E message ${Date.now()}`;
  const apiUrl = process.env.E2E_API_URL || 'http://localhost:3001';
  const response = await page.request.post(`${apiUrl}/api/messages/topic/${topicId}`, {
    data: { content: message },
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(response.ok()).toBe(true);

  await page.reload();
  await page.waitForURL('**/topics/**');
  await expect(page.getByText(message).first()).toBeVisible();

  expect(roomHref).toBeTruthy();
});

test('presence and notification update', async ({ page, browser }) => {
  await page.goto('/topics');
  const roomLink = page.getByRole('link', { name: 'Join Room' }).first();
  const roomHref = await roomLink.getAttribute('href');
  await roomLink.click();
  await page.waitForURL('**/topics/**');
  await expect(page.getByText('• Connected')).toBeVisible({ timeout: 10000 });

  if (!roomHref) {
    throw new Error('Room link not found');
  }

  const adminContext = await browser.newContext({
    storageState: 'tests/.auth/admin.json',
  });
  const adminPage = await adminContext.newPage();
  await adminPage.goto(`${baseURL}${roomHref}`);
  await adminPage.waitForURL('**/topics/**');
  await expect(adminPage.getByText('• Connected')).toBeVisible({ timeout: 10000 });

  const message = `Notification ping ${Date.now()}`;
  const adminInput = adminPage.getByPlaceholder('Type a message...');
  await adminInput.fill(message);
  await adminPage.getByRole('button', { name: 'Send' }).click();

  const bellButton = page.locator('button', { hasText: '🔔' }).first();
  await bellButton.click();
  await expect(page.getByText('New message in')).toBeVisible({ timeout: 10000 });

  await adminContext.close();
});
