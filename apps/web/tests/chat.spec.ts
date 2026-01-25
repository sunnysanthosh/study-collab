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
  const adminToken = await adminPage.evaluate(() => localStorage.getItem('studycollab_token'));
  if (!adminToken) {
    throw new Error('Missing admin auth token');
  }
  const apiUrl = process.env.E2E_API_URL || 'http://localhost:3001';
  const adminMessageResponse = await adminPage.request.post(
    `${apiUrl}/api/messages/topic/${roomHref.split('/').pop()}`,
    {
      data: { content: message },
      headers: { Authorization: `Bearer ${adminToken}` },
    }
  );
  expect(adminMessageResponse.ok()).toBe(true);

  const token = await page.evaluate(() => localStorage.getItem('studycollab_token'));
  if (!token) {
    throw new Error('Missing auth token for notifications');
  }
  const maxAttempts = 10;
  let foundNotification = false;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await page.request.get(`${apiUrl}/api/notifications?limit=20&offset=0`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok()) {
      const body = await response.json();
      const notifications = body?.notifications || [];
      if (notifications.some((item: { title?: string }) => item.title?.includes('New message in'))) {
        foundNotification = true;
        break;
      }
    }
    await page.waitForTimeout(1000);
  }

  expect(foundNotification).toBe(true);

  const bellButton = page.locator('button', { hasText: '🔔' }).first();
  await bellButton.click();
  await expect(page.getByText('New message in').first()).toBeVisible({ timeout: 10000 });

  await adminContext.close();
});
