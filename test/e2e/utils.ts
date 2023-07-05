import process from 'node:process';
import type { Page } from '@playwright/test';
import { z } from 'zod';

export const TestTags = {
  ALL: 'all', // Runs in all stages
  DEVELOPMENT: 'development', // Only runs on development stage
  STAGING: 'staging', // Only runs on staging stage
  PRODUCTION: 'production', // Only runs on production stage
  PRIMARY: 'primary', // Runs everytime in CI
  SECONDARY: 'secondary', // Runs outside of CI
  FAST: 'fast', // Fast tests
  SLOW: 'slow', // Slow tests
} as const;
export const TestTagEnum = z.nativeEnum(TestTags);
export type TestTag = z.infer<typeof TestTagEnum>;

export const LoginCredentialSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type LoginCredential = z.infer<typeof LoginCredentialSchema>;

/**
 * Generate test title with given tags
 * @param title
 * @param tags
 *
 * @example
 * ```ts
 * test(
 *   testTitleWithTags('has title', [
 *     'fast',
 *     'primary',
 *     'development',
 *     'staging',
 *     'production',
 *   ]),
 *   async ({ page }) => {
 *      await page.goto('https://app.dev.crisiscleanup.io/');
 *      // Expect a title "to contain" a substring.
 *      await expect(page).toHaveTitle(/Crisis Cleanup/);
 *      // Expect page url to be /login
 *      await expect(page).toHaveURL(/.*\/login/);
 *   },
 * );
 *
 * // Outputs: 'has title (@fast,@primary,@development,@staging,@production)'
 * ```
 */
export function testTitleWithTags(title: string, tags: TestTag[]) {
  // prefix test tag with @
  const testTags = tags.map((t) => `@${t}`);
  const tagsString = testTags.length > 0 ? ` (${testTags.join(',')})` : '';
  return `${title}${tagsString}`;
}

/**
 * Get login credentials for app.
 * Uses TEST_APP_EMAIL & TEST_APP_PASSWORD
 */
export function getLoginCredentials(): LoginCredential {
  const email = process.env.TEST_APP_EMAIL!;
  const password = process.env.TEST_APP_PASSWORD!;
  if (!email || !password) {
    throw new Error(`
      Cannot find login credentials.
      TEST_APP_EMAIL: ${email}
      TEST_APP_PASSWORD: ${password}
    `);
  }

  return LoginCredentialSchema.parse({
    email,
    password,
  });
}

/**
 * Do login on given page
 * @param page
 */
export async function doLogin(page: Page): Promise<boolean> {
  const { email, password } = getLoginCredentials();
  const emailField = page.getByPlaceholder('Email');
  const passwordField = page.getByPlaceholder('Password');
  const loginSubmitButton = page.getByTestId('testLoginButton');
  try {
    await emailField.click();
    await emailField.fill(email);
    await passwordField.click();
    await passwordField.fill(password);
    await loginSubmitButton.click();

    await page.waitForLoadState('networkidle');

    // wait for dashboard root div
    await page.waitForSelector('[data-testid="testDashboarddiv"]');
    return true;
  } catch (error: unknown) {
    console.error('Error Logging In', error);
  }

  return false;
}

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
  return dataTestIds as string[];
}

/**
 * Generate a jest-like snapshot from given array | object
 * This is here because playwright doesn't support
 * taking object snapshots in snapshots dir yet.
 * @see https://github.com/microsoft/playwright/issues/9006
 *
 * @param data
 */
export function generateSnapshot<T>(data: T) {
  return JSON.stringify(data, null, 2);
}
