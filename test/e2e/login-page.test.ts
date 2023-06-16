import { test, expect } from '@playwright/test';
import { testTitleWithTags, getAllTestIds } from './utils';

test.describe('LoginPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

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
    },
  );
});
