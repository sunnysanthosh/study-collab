import { chromium, request } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const baseURL = process.env.E2E_BASE_URL || 'http://localhost:3000';
const apiURL = process.env.E2E_API_URL || 'http://localhost:3001';

const authDir = path.join(__dirname, '.auth');
const userStatePath = path.join(authDir, 'user.json');
const adminStatePath = path.join(authDir, 'admin.json');

const loginViaApi = async (email: string, password: string) => {
  const apiContext = await request.newContext({ baseURL: apiURL });
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await apiContext.post('/api/auth/login', {
      data: { email, password },
    });
    const bodyText = await response.text();

    if (response.ok()) {
      await apiContext.dispose();
      return JSON.parse(bodyText) as { accessToken: string; user: unknown };
    }

    if (response.status() !== 429 || attempt === maxAttempts) {
      await apiContext.dispose();
      throw new Error(`Login failed (${response.status()}): ${bodyText}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  await apiContext.dispose();
  throw new Error('Login failed after retries');
};

const saveStorageState = async (statePath: string, token: string, user: unknown) => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(baseURL);
  await page.evaluate(
    ({ accessToken, userData }) => {
      localStorage.setItem('studycollab_token', accessToken);
      localStorage.setItem('studycollab_user', JSON.stringify(userData));
    },
    { accessToken: token, userData: user }
  );
  await page.context().storageState({ path: statePath });
  await browser.close();
};

const globalSetup = async () => {
  fs.mkdirSync(authDir, { recursive: true });

  const userLogin = await loginViaApi('test@studycollab.com', 'Test1234!');
  await saveStorageState(userStatePath, userLogin.accessToken, userLogin.user);

  const adminLogin = await loginViaApi('admin@studycollab.com', 'Admin1234!');
  await saveStorageState(adminStatePath, adminLogin.accessToken, adminLogin.user);
};

export default globalSetup;
