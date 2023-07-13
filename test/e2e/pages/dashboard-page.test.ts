import type { Locator } from '@playwright/test';
import { test, expect } from '@playwright/test';
import { testTitleWithTags, doLogin } from '../utils';

test.describe('DashboardPage', () => {
  test.beforeEach(async ({ page }) => {
    test.slow();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await doLogin(page);
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
      for (const l of locators) {
        await expect(l).toBeVisible({ timeout: 15_000 });
      }

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
        // 'testphoneLink',
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
        [200, 304].includes(s as number),
      );
      expect(isStatusOKForAllLinks).toBe(true);
    },
  );

  test(
    testTitleWithTags('should have working incident selector', [
      'slow',
      'primary',
    ]),
    async ({ page }) => {
      test.setTimeout(2 * 60 * 1000);
      const infoDivsTestIds = [
        'testMetricCardMyClaimedCasesDiv',
        'testMetricCardTotalClaimedDiv',
        'testMetricCardInProgressDiv',
        'testMetricCardClosedDiv',
      ];
      const infoDivLocators = infoDivsTestIds.map((d) => page.getByTestId(d));
      const incidentSelector = page
        .getByTestId('testIncidentSelectorSelect')
        .first();
      // NOTE: Relying on <div class="multiselect-single-label"><span class="multiselect-single-label-text">Medium Fire</span></div>
      // to infer current incident name.
      // It comes from @vueform/multiselect dependency.
      // If the dependency changes in the future, this needs to be updated
      const getIncidentSelectorLabelLocator = (locator: Locator) =>
        locator.locator('.multiselect-single-label');
      const getIncidentSelectorTextContent = async (locator: Locator) => {
        const text = await getIncidentSelectorLabelLocator(
          locator,
        ).textContent();
        if (!text) {
          console.error(
            'Incident Selector Text Content is invalid... Returning empty value',
          );
          return '';
        }

        return text;
      };

      const initialSelectedIncidentName = await getIncidentSelectorTextContent(
        incidentSelector,
      );
      if (!initialSelectedIncidentName) {
        throw new Error('Unable to infer initial incident name');
      }

      console.info(
        'Found initialSelectedIncidentName',
        initialSelectedIncidentName,
      );

      const selectOptionFromIncidentSelector = async (n: number) => {
        await page.waitForTimeout(1000);
        await incidentSelector.click();
        for (let i = 0; i < n; i++) {
          await incidentSelector.press('ArrowDown');
        }

        await incidentSelector.press('Enter');
        await incidentSelector.press('Enter');
      };

      const assertIncidentNameInInfoDivs = async (incidentName: string) => {
        for (const l of infoDivLocators) {
          const matchRegex = new RegExp(`.*${incidentName}.*`);
          await expect(l).toHaveText(matchRegex, { timeout: 25_000 }); // changing incidents is really slow :(
        }
      };

      // initial incident name should show inside dashboard info divs
      await assertIncidentNameInInfoDivs(initialSelectedIncidentName);

      await selectOptionFromIncidentSelector(4);
      const newIncidentName = await getIncidentSelectorTextContent(
        incidentSelector,
      );
      // expect(newIncidentName).not.toBe(initialSelectedIncidentName);
      console.info('New Incident Name', newIncidentName);
      await assertIncidentNameInInfoDivs(newIncidentName);

      await selectOptionFromIncidentSelector(1);
      const anotherIncidentName = await getIncidentSelectorTextContent(
        incidentSelector,
      );
      // expect(anotherIncidentName).not.toBe(initialSelectedIncidentName);
      console.info('Another Incident Name', anotherIncidentName);
      await assertIncidentNameInInfoDivs(anotherIncidentName);
    },
  );

  test(
    testTitleWithTags(
      'should show/hide add incident, request redeploy & invite user modals correctly',
      ['slow', 'primary'],
    ),
    async ({ page }) => {
      const incidentSelector = page
        .getByTestId('testIncidentSelectorSelect')
        .first();
      await page.waitForTimeout(1000);
      await incidentSelector.click();

      const addIncidentBtn = page.getByText('Add Incident');
      await addIncidentBtn.click();
      const addIncidentModal = page.getByTestId('testShowRedeployModal');
      await expect(addIncidentModal).toBeVisible();
      await page.getByTestId('testCancelButton').click();
      await expect(addIncidentModal).toBeHidden();

      const reqRedeployBtn = page.getByTestId('testRequestRedeployButton');
      const redeployModal = page.getByTestId('testShowRedeployModal');
      await expect(redeployModal).toBeHidden();
      await reqRedeployBtn.click();
      await expect(redeployModal).toBeVisible();
      await page.getByTestId('testCancelButton').click();
      await expect(redeployModal).toBeHidden();

      const inviteUserBtn = page.getByTestId('testInviteNewUserButton');
      const inviteModal = page.getByTestId('testInviteUserModal');
      await expect(inviteModal).toBeHidden();
      await inviteUserBtn.click();
      await expect(inviteModal).toBeVisible();
      await page.getByTestId('testCancelButton').click();
      await expect(inviteModal).toBeHidden();
    },
  );
});
