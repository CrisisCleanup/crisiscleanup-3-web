import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  normalUserStatePath,
  selectorMaskColor,
  testTitleWithTags,
} from '../utils';

test.describe('Training', () => {
  test.use({ storageState: normalUserStatePath });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/dashboard');
    const myOrgLink = page.getByTestId('testtrainingLink');
    await myOrgLink.click();
    await page.waitForURL(/.*\/training.*/);
    await page.waitForLoadState('networkidle');
  });

  test(
    testTitleWithTags('should have visible data-testids', [
      'primary',
      'slow',
      'development',
      'staging',
      'production',
    ]),
    async ({ page }) => {
      test.slow();
      const dataTestIds = [
        'testTrainingDiv',
        // Any one of these videos should work. Doesn't matter which one. - Aaron
        'testMandatoryTrainingVideoIframe',
        'testSupplimentPhoneTrainingIframe',
        'testCalldownTrainingIframe',
        'testCcuDuringCovidIframe',
      ];
      const locators: Locator[] = [];
      for (const testId of dataTestIds) {
        const l = page.getByTestId(testId).first();
        locators.push(l);
        console.info('Checking visibility of', testId);
        await expect(l).toBeVisible();
      }

      await test.info().attach('reports-page-screenshot', {
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
