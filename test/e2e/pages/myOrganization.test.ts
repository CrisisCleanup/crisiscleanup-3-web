import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';
import { normalUserStatePath, testTitleWithTags } from '../utils';

test.describe('WorkPage', () => {
  test.use({ storageState: normalUserStatePath });

  const tabTestIds = [
    'testMyOrganizationNavinvitationsLink',
    'testMyOrganizationNavusersLink',
    'testMyOrganizationNavteamsLink',
    'testMyOrganizationNavprofileLink',
    'testMyOrganizationNavaffiliatesLink',
    'testMyOrganizationNavlayersLink',
  ];

  const commonTestIds = ['testMyOrganizationDashboardDiv'];

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/dashboard');
    const myOrgLink = page.getByTestId('testmy_organizationLink');
    await myOrgLink.click();
    await page.waitForURL(/.*\/organization\/.*/);
    await page.waitForLoadState('networkidle');
  });

  test.only(
    testTitleWithTags('should have visible data-testids', [
      'primary',
      'slow',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      test.slow();
      const dataTestIds = [...commonTestIds, ...tabTestIds];
      const locators: Locator[] = [];
      for (const testId of dataTestIds) {
        const l = page.getByTestId(testId).first();
        locators.push(l);
        console.info('Checking visibility of', testId);
        await expect(l).toBeVisible({ timeout: 30_000 });
      }

      await test.info().attach('my-organization-page-screenshot', {
        body: await page.screenshot({
          mask: locators,
          maskColor: '#ff00ff11',
          fullPage: true,
        }),
        contentType: 'image/png',
      });
    },
  );
});
