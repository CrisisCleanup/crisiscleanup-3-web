import { test, expect } from '@playwright/test';

test.describe('LoginPage', () => {
  test('should login', async ({ page }) => {
    await page.goto('https://app.dev.crisiscleanup.io/');
    await page.goto('https://app.dev.crisiscleanup.io/login?from=/');
    await page.getByPlaceholder('Email').click();
    await page.getByPlaceholder('Email').fill('demo@crisiscleanup.org');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill('demodemo1');
    await page.getByRole('button', { name: 'Login' }).click();

    await page.waitForLoadState('networkidle');

    // Expect page url to be /incident/*/dashboard
    await expect(page).toHaveURL(/.*\/incident\/.*\/dashboard/);

    // Expect dashboard span to be visible
    const dashboardSpan = page.locator('span').filter({ hasText: 'Dashboard' });
    await expect(dashboardSpan).toBeVisible();
  });

  test('checks for powered by aws link', async ({ page }) => {
    // grab all data test ids on the page
    await page.goto('https://app.dev.crisiscleanup.io/');
    await page.goto('https://app.dev.crisiscleanup.io/login?from=/');
    const awsLink = page.getByTestId('testAwsLink');
    expect(awsLink).toBeDefined();
  });
});
