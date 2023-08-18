import process from 'node:process';
import { type BrowserContext, type Page } from '@playwright/test';
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
  READ: 'read', // Tests that only perform read operations
  WRITE: 'write', // Tests that only perform write operations
  DELETE: 'delete', // Tests that only perform delete operations
} as const;
export const TestTagEnum = z.nativeEnum(TestTags);
export type TestTag = z.infer<typeof TestTagEnum>;

export const LoginCredentialSchema = z.object({
  email: z.string(),
  password: z.string(),
});
export type LoginCredential = z.infer<typeof LoginCredentialSchema>;

interface LinkInfo {
  url: string;
  ok: boolean;
  status: number;
  headers: Record<string, string>;
}

export const normalUserStatePath = 'playwright/.auth/user.json';
export const adminUserStatePath = 'playwright/.auth/admin.json';

export const selectorMaskColor = '#ff00ff11';

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
  // Add prefix in front of test title.
  // Mainly used in CI e2e report to differentiate between dev, staging, prod tests
  const testTitlePrefix = process.env.PW_TEST_TITLE_PREFIX ?? '';
  const tagsString = testTags.length > 0 ? ` - ( ${testTags.join(' ')} )` : '';
  return `${testTitlePrefix}${title}${tagsString}`;
}

/**
 * Get login credentials for app.
 * Uses TEST_APP_EMAIL & TEST_APP_PASSWORD
 */
export function getLoginCredentials(admin = false): LoginCredential {
  let email = process.env.TEST_APP_EMAIL!;
  let password = process.env.TEST_APP_PASSWORD!;
  if (admin) {
    email = process.env.TEST_APP_ADMIN_EMAIL!;
    password = process.env.TEST_APP_ADMIN_PASSWORD!;
  }

  if (!email || !password) {
    throw new Error(`
      Cannot find login credentials. (Admin = ${admin.toString()})
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
export async function doLogin(
  page: Page,
  credentials?: LoginCredential,
): Promise<boolean> {
  const { email, password } = credentials ?? getLoginCredentials();
  const emailField = page.getByPlaceholder('Email');
  const passwordField = page.getByPlaceholder('Password');
  const loginSubmitButton = page.getByTestId('testLoginButton');
  try {
    await emailField.click();
    await emailField.fill(email);
    await passwordField.click();
    await passwordField.fill(password);

    await loginSubmitButton.click();

    // wait for dashboard root div
    await page.waitForSelector('[data-testid="testDashboarddiv"]', {
      state: 'visible',
    });
    return true;
  } catch (error: unknown) {
    console.error('Error Logging In', error);
  }

  return false;
}

export async function doLoginAsAdmin(page: Page) {
  const adminCreds = getLoginCredentials(true);
  return doLogin(page, adminCreds);
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

export async function visitAllLinksAndGetResponseInfo(
  page: Page,
  context: BrowserContext,
) {
  const linkLocators = await page.getByRole('link').all();
  console.info('Total links found:', linkLocators.length);
  const visitedLinks = new Set();
  const linkInfos: LinkInfo[] = [];
  for (const link of linkLocators) {
    const href = await link.getAttribute('href');
    const isHrefValid = !['mailto:', 'tel:'].some((s) => href?.startsWith(s));
    console.info('Found link', href);
    const isVisited = visitedLinks.has(href);
    if (isVisited) {
      console.info('Skipping already visited link', href);
    } else if (href && isHrefValid) {
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

      const linkInfo: LinkInfo = {
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

  return linkInfos;
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
