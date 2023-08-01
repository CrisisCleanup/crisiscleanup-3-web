import { test, expect } from '@playwright/test';
import {
  testTitleWithTags,
  getAllTestIds,
  doLogin,
  visitAllLinksAndGetResponseInfo,
} from '../utils';

test.describe('LoginPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test(
    testTitleWithTags('should login', [
      'slow',
      'primary',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      test.slow();
      await doLogin(page);

      await expect(page).toHaveURL(/.*\/incident\/.*\/dashboard/);
      await expect(page).toHaveTitle(/.*Dashboard.*/);

      // Expect dashboard span to be visible
      const dashboardSpan = page
        .locator('span')
        .filter({ hasText: 'Dashboard' });
      await expect(dashboardSpan).toBeVisible();

      // attach info screenshot to test reports
      await test.info().attach('dashboard-page-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    },
  );

  test(
    testTitleWithTags('should show error on login with invalid credentials', [
      'slow',
      'primary',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      const email = 'a@a.com';
      const password = 'pass123abc';
      const emailField = page.getByPlaceholder('Email');
      const passwordField = page.getByPlaceholder('Password');
      const loginSubmitButton = page.getByTestId('testLoginButton');
      const errorContainer = page.getByTestId('testLoginErrorDiv');
      await expect(errorContainer).toBeHidden();
      await emailField.click();
      await emailField.fill(email);
      await passwordField.click();
      await passwordField.fill(password);
      await loginSubmitButton.click();
      await expect(errorContainer).toBeVisible();
    },
  );

  test(
    testTitleWithTags('should show & hide password on eye icon click', [
      'fast',
      'primary',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      const passwordField = page.getByPlaceholder('Password');
      const eyeIcon = page.locator('.fa-eye');
      await expect(eyeIcon).toBeVisible();
      await passwordField.type('abc');
      // Password field should have type password on init
      await expect(passwordField).toHaveAttribute('type', 'password');
      await eyeIcon.click();
      // should have type text after click
      await expect(passwordField).toHaveAttribute('type', 'text');
    },
  );

  test(
    testTitleWithTags(`should have data-testids`, [
      'fast',
      'primary',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      const _dataTestIds = await getAllTestIds(page);
      // don't include testIncidentPhoneDiv (current incident hotline) as it changes based on current incident
      const dataTestIds = _dataTestIds.filter(
        (id) => !['testIncidentPhoneDiv', 'testNoPhoneDiv'].includes(id),
      );
      expect(dataTestIds).toMatchObject([
        'testLogoIcon',
        'testSurvivorContactDiv',
        'testLoginTextContent',
        'testSigninTextContent',
        'testEmailTextInput',
        'testPasswordTextInput',
        'testMagicLink',
        'testRequestPasswordResetLink',
        'testLoginButton',
        'testRequestAccessButton',
        'testAwsLink',
        'testAwsImgIcon',
        'testGlobeIcon',
      ]);
      await test.info().attach('login-page-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    },
  );

  test(
    testTitleWithTags(`should return ok status code for all links`, [
      'slow',
      'primary',
      'development',
      'staging',
      'production',
    ]),
    async ({ page, context }) => {
      test.setTimeout(60_000);
      const linkInfos = await visitAllLinksAndGetResponseInfo(page, context);
      const statuses = linkInfos.map((l) => l.status);
      const isStatusOKForAllLinks = statuses.every((s) =>
        [200, 304].includes(s),
      );
      expect(isStatusOKForAllLinks).toBe(true);
    },
  );
});
