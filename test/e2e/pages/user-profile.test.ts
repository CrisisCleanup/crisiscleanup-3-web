import type { Locator } from '@playwright/test';
import { expect, test } from '@playwright/test';
import {
  normalUserStatePath,
  selectorMaskColor,
  testTitleWithTags,
} from '../utils';

test.describe('UserProfile', () => {
  test.use({ storageState: normalUserStatePath });

  test.beforeEach(async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/dashboard');
    const profileMenuDiv = page.getByTestId('testAvatarIcon').first();
    await profileMenuDiv.click();
    const userProfileLink = page.getByTestId('testUserprofileProfileLink');
    await userProfileLink.click();
    await page.waitForURL(/.*\/profile.*/);
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
        'testProfileDiv',
        // 'testLogoutButton', // hidden on md and larger screens
        'testSaveButton',
        'testFirstNameAvatarIcon',
        'testProfilePictureUploadFile',
        'testChangePhotoButton',
        'testViewIdBadgeButton',
        'testFirstNameTextInput',
        'testMobileTextInput',
        'testLastNameTextInput',
        'testEmailTextInput',
        'testUserRolesSelect',
        'testEquipmentSelect',
        'testLanguagesSelect',
        'testFacebookTextInput',
        'testTwitterTextInput',
        'testChangePasswordButton',
        'testChangeOrganizationButton',
        'testNotificationSettingsDiv',
        'testHasNotificationsYesRadio',
        'testHasNotificationsNoRadio',
        'testResetUserStatesButton',
        'testResetUserPreferencesButton',
        // 'testEnableWorksiteCachingCheckbox', // disabled in ui
      ];
      const locators: Locator[] = [];
      for (const testId of dataTestIds) {
        const l = page.getByTestId(testId).first();
        locators.push(l);
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
