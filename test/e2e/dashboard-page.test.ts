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
      const dataTestIds = _dataTestIds.filter(
        (id) =>
          ![
            'testShowAcceptTermsModal',
            'testModalCancelIcon',
            'testTermsmodalAcceptButton',
          ].includes(id ?? ''),
      ) as string[];
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
});
