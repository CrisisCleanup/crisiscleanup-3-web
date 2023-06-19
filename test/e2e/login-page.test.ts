import { test, expect } from '@playwright/test';
import { testTitleWithTags, getAllTestIds, getLoginCredentials } from './utils';

test.describe('LoginPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test(
    testTitleWithTags('should login', ['slow', 'primary']),
    async ({ page }) => {
      const { email, password } = getLoginCredentials();
      const emailField = page.getByPlaceholder('Email');
      const passwordField = page.getByPlaceholder('Password');
      const loginSubmitButton = page.getByTestId('testLoginButton');

      await emailField.click();
      await emailField.fill(email);
      await passwordField.click();
      await passwordField.fill(password);
      await loginSubmitButton.click();

      await page.waitForLoadState('networkidle');

      // wait for dashboard root div
      await page.waitForSelector('[data-testid="testDashboarddiv"]');

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
    testTitleWithTags(`should have data-testids`, ['fast', 'primary']),
    async ({ page }) => {
      const dataTestIds = await getAllTestIds(page);
      expect(dataTestIds).toMatchObject([
        'testIsUnauthenticatedDiv',
        'testLogoIcon',
        'testSurvivorContactDiv',
        'testNavRouteblogLink',
        'testNavRoutecontactLink',
        'testRegisterButton',
        'testLoginTextContent',
        'testSigninTextContent',
        'testEmailTextInput',
        'testPasswordTextInput',
        'testRequestPasswordResetLink',
        'testLoginButton',
        'testRequestAccessButton',
        'testGlobeIcon',
        'testBottomSectionDiv',
        'testAwsLink',
        'testAwsImgIcon',
      ]);
      await test.info().attach('login-page-screenshot', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    },
  );
});
