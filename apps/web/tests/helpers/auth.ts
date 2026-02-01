import { Page, expect } from '@playwright/test';

interface LoginOptions {
  email: string;
  password: string;
}

export const login = async (page: Page, { email, password }: LoginOptions) => {
  const apiUrl = process.env.E2E_API_URL || 'http://localhost:3001';
  let csrfToken: string | null = null;
  const csrfRes = await page.request.get(`${apiUrl}/api/csrf/token`);
  if (csrfRes.ok()) {
    const j = await csrfRes.json();
    csrfToken = (j as { csrfToken?: string }).csrfToken ?? null;
  }
  const headers: Record<string, string> = {};
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  const response = await page.request.post(`${apiUrl}/api/auth/login`, {
    data: { email, password },
    headers: Object.keys(headers).length ? headers : undefined,
  });
  const bodyText = await response.text();
  if (!response.ok()) {
    throw new Error(`Login failed (${response.status()}): ${bodyText}`);
  }

  let data: { accessToken: string; user: unknown };
  try {
    data = JSON.parse(bodyText);
  } catch {
    throw new Error(`Login response was not JSON: ${bodyText}`);
  }

  await page.addInitScript(
    ({ token, user }) => {
      localStorage.setItem('studycollab_token', token);
      localStorage.setItem('studycollab_user', JSON.stringify(user));
    },
    { token: data.accessToken, user: data.user }
  );

  await page.goto('/topics');
  await expect(page.getByRole('heading', { name: 'Study Topics' })).toBeVisible();
};
