import { test as setup } from '@playwright/test';
import {
  doLogin,
  doLoginAsAdmin,
  normalUserStatePath,
  adminUserStatePath,
  testTitleWithTags,
} from './utils';

setup(
  testTitleWithTags('authenticate as user', [
    'primary',
    'slow',
    'read',
    'development',
    'staging',
    'production',
  ]),
  async ({ page }) => {
    setup.slow();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await doLogin(page);
    await page.context().storageState({ path: normalUserStatePath });
  },
);

setup(
  testTitleWithTags('authenticate as admin', [
    'primary',
    'slow',
    'read',
    'development',
    'staging',
    'production',
  ]),
  async ({ page }) => {
    setup.slow();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await doLoginAsAdmin(page);
    await page.context().storageState({ path: adminUserStatePath });
  },
);
