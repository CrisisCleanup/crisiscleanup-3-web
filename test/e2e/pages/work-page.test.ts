import { test, expect, type Locator } from '@playwright/test';
import { testTitleWithTags, normalUserStatePath } from '../utils';
import worksiteData from '../fixtures/worksiteCreateData.json' assert { type: 'json' };

test.describe('WorkPage', () => {
  test.use({ storageState: normalUserStatePath });

  const utilityBarTestIds = [
    'testMapViewIcon',
    'testTableViewIcon',
    'testWorksiteSearch',
    'testLayersButton',
    'testWorksiteFiltersButton',
    'testDownloadCsvButton',
  ];
  const worksiteFormTestIds = [
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

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/dashboard');
    const workLink = page.getByTestId('testworkLink');
    await workLink.click();
    await page.waitForURL(/.*\/incident\/.*\/work.*/);
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
        ...utilityBarTestIds,
        'testCollapseUtilityBarIcon',
        'testCollapsedFormIcon',
        'testSviSliderInput',
        'testUpdatedSliderInput',
        'testSimpleMapdiv',
        'testPhoneComponentChatButton',
        'testPhoneSystemActionButtonDiv',
        'testPhoneComponentNewsDiv',
        'testNewCaseIcon',
        ...worksiteFormTestIds,
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

  test(
    testTitleWithTags(
      'should have working collapsable utility bar & worksite form',
      ['primary', 'slow', 'development', 'staging', 'production'],
    ),
    async ({ page }) => {
      test.setTimeout(60_000);
      // by default, utility bar and worksite form should be visible
      const utilityBarItems = utilityBarTestIds;
      const utilityBarCollapseButton = page.getByTestId(
        'testCollapseUtilityBarIcon',
      );
      for (const testId of utilityBarItems) {
        const l = page.getByTestId(testId).first();
        await expect(l).toBeVisible({ timeout: 30_000 });
      }

      await utilityBarCollapseButton.click();
      // utility bar items should now be hidden
      for (const testId of utilityBarItems) {
        const l = page.getByTestId(testId).first();
        await expect(l).toBeHidden();
      }

      const worksiteFormItems = worksiteFormTestIds;
      const worksiteFormCollapseButton = page.getByTestId(
        'testCollapsedFormIcon',
      );
      for (const testId of worksiteFormItems) {
        const l = page.getByTestId(testId).first();
        await expect(l).toBeVisible({ timeout: 30_000 });
      }

      await worksiteFormCollapseButton.click();
      // worksite form items should now be hidden
      for (const testId of worksiteFormItems) {
        const l = page.getByTestId(testId).first();
        await expect(l).toBeHidden();
      }
    },
  );

  test(
    testTitleWithTags('should create new worksite', [
      'primary',
      'slow',
      'development',
      'staging',
    ]),
    async ({ page }) => {
      test.slow();
      const d = worksiteData[12];
      const nameField = page.getByTestId('testNameTextInput').locator('input');
      const phoneField = page
        .getByTestId('testPhone1TextInput')
        .locator('input');
      const addressField = page
        .getByTestId('testWorksiteSearchInputInput')
        .locator('input');
      const addressSearchResults = page
        .getByTestId('testWorsiteSearchResultsDiv')
        .locator('div');
      const addressSearchPickedResult = addressSearchResults
        .filter({
          hasText: 'Geocode',
        })
        .locator('div')
        .first();
      const outOfRangeWorksiteButton = page.getByRole('button', {
        name: 'Continue Anyway',
      });
      const muckOutCheckbox = page
        .getByTestId('testmuck_out_infoCheckbox')
        .getByText('Muck Out');
      const treeWorkCheckbox = page
        .getByTestId('testtree_infoCheckbox')
        .getByText('Tree Work');
      const saveWorksiteButton = page.getByTestId('testSaveButton');
      await nameField.click();
      await nameField.fill(d.residentName);
      await phoneField.click();
      await phoneField.fill(d.phone);
      await addressField.click();
      await addressField.fill(d.address);
      await page.waitForTimeout(2000);
      await addressSearchPickedResult.click();
      await page.waitForTimeout(2000);
      const isOutOfRangeBtnVisible = await outOfRangeWorksiteButton.isVisible();
      // Click 'Case Outside Current Incident' button if needed
      if (isOutOfRangeBtnVisible) {
        await outOfRangeWorksiteButton.click();
      }

      await muckOutCheckbox.click();
      await treeWorkCheckbox.click();
      await saveWorksiteButton.click();
      // make sure error toast shows
      const successToast = page.locator('.Vue-Toastification__toast--success');
      await expect(successToast).toBeVisible({ timeout: 15_000 });
      await expect(successToast).toHaveText(/.*success.*/i);
    },
  );
});
