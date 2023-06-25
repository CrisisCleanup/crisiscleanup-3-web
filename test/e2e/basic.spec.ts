import { test, expect } from '@playwright/test';
import { testTitleWithTags } from './utils';

test(
  testTitleWithTags('should have valid title & url', ['fast', 'primary']),
  async ({ page }) => {
    await page.goto('/');
    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Crisis Cleanup/);
    // Expect page url to be /login
    await expect(page).toHaveURL(/.*\/login/);
  },
);

// Checks if localizations are loading on Login page
test(
  testTitleWithTags('should have valid localizations', ['fast', 'primary']),
  async ({ page }) => {
    // Should navigate to login page
    await page.goto('/');

    // Check if text on page matches the regex for localization
    // Examples:
    // actions.login
    // loginForm.sign_in_msg
    // loginForm.email_placeholder
    // homeVue.phone_or_website
    // publicNav.home
    // publicNav.blog
    // publicNav.relief_orgs_only

    // Localization Regex to match
    const localizationRegex = /^\w+(\.\w+)+$/;

    const loginHeader = page.getByTestId('testLoginTextContent');
    const loginMsg = page.getByTestId('testSigninTextContent');

    // Check if login header & login msg divs have valid text
    // We can simply tell if the current stage (i.e. development, staging, etc) is broken
    // if any of these elements' text content matches the localization regex
    await expect(loginHeader).not.toHaveText(localizationRegex);
    await expect(loginMsg).not.toHaveText(localizationRegex);
  },
);
