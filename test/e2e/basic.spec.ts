import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('https://app.dev.crisiscleanup.io/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Crisis Cleanup/);
});
