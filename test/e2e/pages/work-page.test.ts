import { test, expect } from '@playwright/test';
import { testTitleWithTags, normalUserStatePath } from '../utils';

test.describe.only('WorkPage', () => {
  test.use({ storageState: normalUserStatePath });

  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard');
    const workLink = page.getByTestId('testworkLink');
    await workLink.click();
    await page.waitForURL(/.*\/incident\/.*\/work.*/);
    await page.waitForLoadState('networkidle');
  });

  test(
    testTitleWithTags('should have visible data-testids', ['primary', 'slow']),
    async ({ page }) => {
      test.slow();
      const dataTestIds = [
        'testMapViewIcon',
        'testTableViewIcon',
        'testWorksiteSearch',
        'testLayersButton',
        'testWorksiteFiltersButton',
        'testDownloadCsvButton',
        'testCollapseUtilityBarIcon',
        'testCollapsedFormIcon',
        'testSviSliderInput',
        'testUpdatedSliderInput',
        'testSimpleMapdiv',
        'testPhoneComponentChatButton',
        'testPhoneSystemActionButtonDiv',
        'testPhoneComponentNewsDiv',
        'testNewCaseIcon',
      ];
      const locators = dataTestIds.map((tId) => page.getByTestId(tId).first());
      for (const l of locators) {
        await expect(l).toBeVisible({ timeout: 30_000 });
      }

      await test.info().attach('work-page-screenshot', {
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
