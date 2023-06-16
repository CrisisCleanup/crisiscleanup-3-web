import { test, expect } from '@playwright/test';
import { testTitleWithTags } from './utils';

test(testTitleWithTags('has title', ['fast', 'primary']), async ({ page }) => {
  await page.goto('/');
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Crisis Cleanup/);
  // Expect page url to be /login
  await expect(page).toHaveURL(/.*\/login/);
});
