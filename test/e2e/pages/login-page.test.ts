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
    testTitleWithTags('should login', ['slow', 'primary']),
    async ({ page }) => {
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
    testTitleWithTags(
      'should show error toast on login with invalid credentials',
      ['slow', 'primary'],
    ),
    async ({ page }) => {
      const email = 'a@a.com';
      const password = 'pass123abc';
      const emailField = page.getByPlaceholder('Email');
      const passwordField = page.getByPlaceholder('Password');
      const loginSubmitButton = page.getByTestId('testLoginButton');
      await emailField.click();
      await emailField.fill(email);
      await passwordField.click();
      await passwordField.fill(password);
      await loginSubmitButton.click();
      // make sure error toast shows
      const errorToastElement = await page.waitForSelector(
        '.Vue-Toastification__toast--error',
      );
      expect(errorToastElement).toBeTruthy();
    },
  );

  // Skip bc we are serving login page from api and it doesn't contain eye icon yet
  test.skip(
    testTitleWithTags('should show & hide password on eye icon click', [
      'fast',
      'primary',
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
    testTitleWithTags(`should have data-testids`, ['fast', 'primary']),
    async ({ page }) => {
      const _dataTestIds = await getAllTestIds(page);
      // don't include testIncidentPhoneDiv (current incident hotline) as it changes based on current incident
      const dataTestIds = _dataTestIds.filter(
        (id) => !['testIncidentPhoneDiv'].includes(id ?? ''),
      );
      expect(dataTestIds).toMatchObject([
        'testLogoIcon',
        'testSurvivorContactDiv',
        'testIncidentPhoneDiv',
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
    ]),
    async ({ page, context }) => {
      const linkInfos = await visitAllLinksAndGetResponseInfo(page, context);
      const statuses = linkInfos.map((l) => l.status);
      const isStatusOKForAllLinks = statuses.every((s) =>
        [200, 304].includes(s),
      );
      expect(isStatusOKForAllLinks).toBe(true);
    },
  );
});
