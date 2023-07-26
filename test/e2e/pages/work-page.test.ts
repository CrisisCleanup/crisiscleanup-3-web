import { test, expect, type Locator } from '@playwright/test';
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
        // intake form
        'testIntakeFormDiv',
        // form fields
        'testNameTextInput',
        'testWorksiteSearchInputSearch',
        'testPhone1TextInput',
        'testAddPhoneLink',
        'testEmailTextInput',
        'testPrimaryLanguageTextInput',
        'testAutoContactFrequencySelect',
        'testWorksiteSearchInputInput',
        'testWhat3WordsTextInput',
        'testUseMyLocationButton',
        'testToggleSelectOnMapButton',
        'testSaveNoteInput',
        'testAddNoteButton',
        'testAddressProblemsCheckbox',
        'testIsHighPriorityCheckbox',
        'testMemberOfMyOrgCheckbox',
        // TODO: find a way to test dynamic form tree fields
        // form action buttons
        'testCloseWorksiteButton',
        'testSaveButton',
        'testSaveClaimButton',
      ];
      const locators: Locator[] = [];
      for (const testId of dataTestIds) {
        const l = page.getByTestId(testId).first();
        locators.push(l);
        console.info('Checking visibility of', testId);
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
