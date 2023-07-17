import { test as setup } from '@playwright/test';
import {
  doLogin,
  doLoginAsAdmin,
  normalUserStatePath,
  adminUserStatePath,
} from './utils';

setup('authenticate as user', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await doLogin(page);
  await page.context().storageState({ path: normalUserStatePath });
});

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await doLoginAsAdmin(page);
  await page.context().storageState({ path: adminUserStatePath });
});
