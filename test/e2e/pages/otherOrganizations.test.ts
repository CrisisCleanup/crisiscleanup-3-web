import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  normalUserStatePath,
  selectorMaskColor,
  testTitleWithTags,
} from '../utils';

test.describe('OtherOrganizations', () => {
  test.use({ storageState: normalUserStatePath });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/dashboard');
    const otherOrgLink = page.getByTestId('testother_organizationsLink');
    await otherOrgLink.click();
    await page.waitForURL(/.*\/other_organizations.*/);
    await page.waitForLoadState('networkidle');
  });

  test(
    testTitleWithTags('should have visible data-testids', [
      'primary',
      'slow',
      'read',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      test.slow();
      const dataTestIds = [
        'testDoNotSharePublicDiv',
        'testOrganizationsSearchTextInput',
        'testOrganizationsDataTable',
        // These testids are ignored because they are inside table columns
        // 'testPrimaryContactsDiv',
        // 'testApprovedRolesContent',
        // 'testOverdueCountButton',
      ];
      const locators: Locator[] = [];
      for (const testId of dataTestIds) {
        const l = page.getByTestId(testId).first();
        locators.push(l);
        console.info('Checking visibility of', testId);
        await expect(l).toBeVisible();
      }

      await test.info().attach('other-organization-page-screenshot', {
        body: await page.screenshot({
          mask: locators,
          maskColor: selectorMaskColor,
          fullPage: true,
        }),
        contentType: 'image/png',
      });
    },
  );
});
