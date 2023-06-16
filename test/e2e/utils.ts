import type { Page } from '@playwright/test';

/**
 * Query for all data-testid on a given page.
 * @param page
 * @param testIdIdentifier
 */
export async function getAllTestIds(page: Page, testIdIdentifier = 'testid') {
  const locators = await page.getByTestId(/.*/).all();
  const dataTestIds = await Promise.all(
    locators.map(async (e) => e.getAttribute(`data-${testIdIdentifier}`)),
  );
  console.info(`Found all testIds on ${page.url()}`, dataTestIds);
  return dataTestIds;
}
