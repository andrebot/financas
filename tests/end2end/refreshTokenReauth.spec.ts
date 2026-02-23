import { test, expect } from '@playwright/test';
import { login } from './authUtils';
import { goToCategoriesPage, getCategoryUser, categoryUserPassword } from './categoriesPageUtils';
import i18nKeys from '../../src/client/i18n/en';

/**
 * E2E tests for the refresh-token reauth flow: when an API request returns 401,
 * the app calls /user/refresh-tokens (with the refresh cookie), gets a new
 * access token, retries the request, and the page should load normally.
 */
test.describe('Refresh token reauth', () => {
  test('should recover from 401 by refreshing token and retrying when opening a protected page', async ({
    page,
  }) => {
    const projectName = test.info().project.name;
    await login(page, getCategoryUser(projectName).email, categoryUserPassword);

    // Simulate expired/missing access token: first GET to list categories returns 401.
    // The app will call /user/refresh-tokens (with cookie), then retry. We let the retry hit the real server.
    let firstCategoryGet = true;
    await page.route('**/api/v1/category', async (route) => {
      const request = route.request();
      if (request.method() === 'GET' && firstCategoryGet) {
        firstCategoryGet = false;
        await route.fulfill({ status: 401 });
      } else {
        await route.continue();
      }
    });

    await goToCategoriesPage(page);

    await expect(page.getByRole('heading', { name: i18nKeys.translation.categories })).toBeVisible();
    await expect(page.getByRole('button', { name: i18nKeys.translation.createCategory })).toBeVisible();
  });
});
