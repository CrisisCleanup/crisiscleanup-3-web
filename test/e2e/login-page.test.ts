import { test, expect } from '@playwright/test';
import { testTitleWithTags, getAllTestIds, doLogin } from './utils';

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
    testTitleWithTags(`should return 200 status code for all links`, [
      'slow',
      'primary',
    ]),
    async ({ page, context }) => {
      const linkLocators = await page.getByRole('link').all();
      const visitedLinks = new Set();
      for (const link of linkLocators) {
        const href = await link.getAttribute('href');
        console.info('Found link', href);
        const isVisited = visitedLinks.has(href);
        if (isVisited) {
          console.info('Skipping already visited link', href);
        } else if (href && !href.startsWith('mailto:')) {
          const newPage = await context.newPage();
          await newPage.bringToFront();
          const response = await newPage.goto(href, {
            waitUntil: 'commit',
          });
          // Add link to visited links
          visitedLinks.add(href);
          if (!response) {
            console.error('No response from', href);
            continue;
          }

          console.info(`Response from ${href}`, {
            url: response.url(),
            ok: response.ok(),
            status: response.status(),
            headers: response.headers(),
          });
          const status = response.status();
          expect(status).toBe(200);
          // close newly opened page (tab) to avoid OOM issues
          await newPage.close();
          // bring root page back into focus
          await page.bringToFront();
        }
      }
    },
  );
});
