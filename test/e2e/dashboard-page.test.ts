import { test, expect } from '@playwright/test';
import {
  testTitleWithTags,
  doLogin,
  visitAllLinksAndGetResponseInfo,
} from './utils';

test.describe('DashboardPage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await doLogin(page);
    await page.waitForLoadState('networkidle');
  });

  test(
    testTitleWithTags(`should have data-testids`, ['fast', 'primary']),
    async ({ page }) => {
      const dataTestIds = [
        'testIsAuthenticatedDiv',
        'testCrisiscleanupLogoIcon',
        'testdashboardLink',
        'testdashboardIcon',
        'testworkLink',
        'testworkIcon',
        'testmy_organizationLink',
        'testmy_organizationIcon',
        'testother_organizationsLink',
        'testother_organizationsIcon',
        'testreportsLink',
        'testreportsIcon',
        'testtrainingLink',
        'testtrainingIcon',
        'testDisasterIcon',
        'testIncidentImageIcon',
        'testLogoutLink',
        'testCurrentUserFullNameContent',
        'testDashboarddiv',
        'testRequestRedeployButton',
        'testInviteNewUserButton',
        'testMetricCardMyClaimedCasesDiv',
        'testMyClaimedCasesIcon',
        'testMetricCardTotalClaimedDiv',
        'testTotalClaimedIcon',
        'testMetricCardInProgressDiv',
        'testInProgressIcon',
        'testInProgressDiv',
        'testMetricCardClosedDiv',
        'testClosedIcon',
        'testClosedDiv',
        'testClaimedWorksitesTable',
        'testCaseTransferRequestsDiv',
        'testInboundRequestsButton',
        'testOutboundRequestsButton',
        'testArchivedRequestsButton',
        'testWorksiteRequestsTable',
        'testUserTransferRequestTable',
      ];
      const locators = dataTestIds.map((tId) => page.getByTestId(tId));
      const resolved = await Promise.all(
        locators.map(async (l) => l.isVisible()),
      );
      const isEveryLocatorVisible = resolved.every(Boolean);
      expect(isEveryLocatorVisible).toBe(true);
      await test.info().attach('dashboard-page-screenshot', {
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
    testTitleWithTags(`should return 200 status code for all links on page`, [
      'slow',
      'primary',
    ]),
    async ({ page, context }) => {
      const linkInfos = await visitAllLinksAndGetResponseInfo(page, context);
      const statuses = linkInfos.map((l) => l.status);
      const isStatusOKForAllLinks = statuses.every((s) => s === 200);
      expect(isStatusOKForAllLinks).toBe(true);
    },
  );
});
