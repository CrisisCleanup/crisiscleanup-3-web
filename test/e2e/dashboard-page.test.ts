import { test, expect } from '@playwright/test';
import {
  testTitleWithTags,
  getAllTestIds,
  doLogin,
  generateSnapshot,
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
      const _dataTestIds = await getAllTestIds(page);
      const idsWithNumRegex = /\d/;
      const dataTestIds = _dataTestIds.filter((id) => {
        return (
          !idsWithNumRegex.test(id) &&
          ![
            'testShowAcceptTermsModal',
            'testModalCancelIcon',
            'testTermsmodalAcceptButton',
          ].includes(id)
        );
      });
      expect(generateSnapshot(dataTestIds)).toMatchSnapshot({
        name: 'dashboard-page-dataTestIds',
      });
      await test.info().attach('dashboard-page-screenshot', {
        body: await page.screenshot({
          mask: dataTestIds.map((id) => page.getByTestId(id)),
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
      const linkLocators = await page.getByRole('link').all();
      const visitedLinks = new Set();
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

          console.info(`Response from ${href}`, {
            url: response.url(),
            ok: response.ok(),
            status: response.status(),
            headers: response.headers(),
          });
          const status = response.status();
          expect(status).toBe(200);
          // close newly opened page (tab) to avoid OOM issues
          await newPage.close();
          // bring root page back into focus
          await page.bringToFront();
        }
      }
    },
  );
});
