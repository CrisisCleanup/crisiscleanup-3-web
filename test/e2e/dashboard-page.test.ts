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
    testTitleWithTags(`should return ok status code for all links on page`, [
      'slow',
      'primary',
    ]),
    async ({ page, context }) => {
      const navLinks = [
        'testdashboardLink',
        'testworkLink',
        'testphoneLink',
        'testmy_organizationLink',
        'testother_organizationsLink',
        'testreportsLink',
        'testtrainingLink',
      ];
      const links = navLinks;
      const linkLocators = links.map((l) => page.getByTestId(l));
      console.info('Total links found:', linkLocators.length);
      const visitedLinks = new Set();
      const linkInfos: Array<Record<string, unknown>> = [];
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

          const linkInfo = {
            url: response.url(),
            ok: response.ok(),
            status: response.status(),
            headers: response.headers(),
          };
          linkInfos.push(linkInfo);
          console.info(`Response from ${href}`, linkInfo);
          // close newly opened page (tab) to avoid OOM issues
          await newPage.close();
          // bring root page back into focus
          await page.bringToFront();
        }
      }

      const statuses = linkInfos.map((l) => l.status);
      const isStatusOKForAllLinks = statuses.every((s) =>
        [200, 304].includes(s),
      );
      expect(isStatusOKForAllLinks).toBe(true);
    },
  );
});
