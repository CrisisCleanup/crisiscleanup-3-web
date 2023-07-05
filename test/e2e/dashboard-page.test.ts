import { test, expect } from '@playwright/test';
import {
  testTitleWithTags,
  getAllTestIds,
  doLogin,
  generateSnapshot,
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
      const linkInfos = await visitAllLinksAndGetResponseInfo(page, context);
      const statuses = linkInfos.map((l) => l.status);
      const isStatusOKForAllLinks = statuses.every((s) => s === 200);
      expect(isStatusOKForAllLinks).toBe(true);
    },
  );
});
