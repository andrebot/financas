import { test, expect } from '@playwright/test';

import i18nKeys from '../../src/client/i18n/en';
import { goToRegisterPageFromLoginPage, fillRegisterForm, checkFailedForm, testUser } from './authUtils';

test('should register successfully and not allow to register again', async ({ page }) => {
  await test.step('Register successfully', async () => {
    await goToRegisterPageFromLoginPage(page);
    await fillRegisterForm(page);
    await page.getByRole('button', { name: i18nKeys.translation.register }).click();
    await expect(page.getByText(i18nKeys.translation.registerSuccess)).toBeVisible();
  });

  await test.step('Try to register again', async () => {
    await page.context().clearCookies();
    await goToRegisterPageFromLoginPage(page);
    await fillRegisterForm(page);
    await page.getByRole('button', { name: i18nKeys.translation.register }).click();
    await expect(page.getByText(i18nKeys.translation.duplicateUser)).toBeVisible();
  });
});

test('should not allow user to register with invalid email', async ({ page }) => {
  await goToRegisterPageFromLoginPage(page);
  await fillRegisterForm(page, { ...testUser, email: 'invalid-email' });
  await page.getByRole('button', { name: i18nKeys.translation.register }).click();
  await checkFailedForm(page, i18nKeys.translation.emailInvalid);
});

test('should not allow user to register with invalid password', async ({ page }) => {
  await goToRegisterPageFromLoginPage(page);
  await fillRegisterForm(page, { ...testUser, password: 'short' });
  await page.getByRole('button', { name: i18nKeys.translation.register }).click();
  await checkFailedForm(page, i18nKeys.translation.passwordInvalid);
});

test('should not allow user to register with invalid confirm password', async ({ page }) => {
  await goToRegisterPageFromLoginPage(page);
  await fillRegisterForm(page);
  await page.getByLabel(i18nKeys.translation.confirmPassword).fill('invalid-password');
  await page.getByRole('button', { name: i18nKeys.translation.register }).click();
  await checkFailedForm(page, i18nKeys.translation.passwordsDoNotMatch);
});

test('should not allow user to register with names empty', async ({ page }) => {
  await goToRegisterPageFromLoginPage(page);
  await fillRegisterForm(page, { ...testUser, firstName: '', lastName: '' });
  await page.getByRole('button', { name: i18nKeys.translation.register }).click();
  await checkFailedForm(page, i18nKeys.translation.firstNameRequired);
  await checkFailedForm(page, i18nKeys.translation.lastNameRequired);
});

test('should not allow user to register with names with invalid characters', async ({ page }) => {
  await goToRegisterPageFromLoginPage(page);
  await fillRegisterForm(page, { ...testUser, firstName: 'John-123', lastName: 'Doe-123' });
  await page.getByRole('button', { name: i18nKeys.translation.register }).click();
  await expect(page.locator(`text=${i18nKeys.translation.nameInvalid}`)).toHaveCount(2);
  await expect(page.getByText(i18nKeys.translation.reviewDataProvided)).toBeVisible();
});


