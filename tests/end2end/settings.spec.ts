import { test, expect } from '@playwright/test';
import { login, testUser, loginUserPassword } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import { goToSettingsPage, changeEmailUser, changePasswordUser } from './settingsPageUtils';

const newEmail = `andre-${Date.now()}@gmail.com`;

test('should allow user to change name', async ({ page }) => {
  const newName = `Andre-${Date.now()}`;
  await login(page);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.firstName).fill(newName);
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.settingsUpdated)).toBeVisible();
  await expect(page.getByRole('textbox', { name: i18nKeys.translation.firstName })).toHaveValue(newName);

  await page.getByRole('button', { name: /menu/i }).click();

  await expect(page.getByText(newName)).toBeVisible();
});

test('should allow user to change last name', async ({ page }) => {
  const newLastName = `Doe-${Date.now()}`;
  await login(page);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.lastName).fill(newLastName);
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.settingsUpdated)).toBeVisible();
  await expect(page.getByRole('textbox', { name: i18nKeys.translation.lastName })).toHaveValue(newLastName);
});

test('should allow user to change email', async ({ page }) => {
  await login(page, changeEmailUser.email, loginUserPassword);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.email).fill(newEmail);
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.settingsUpdated)).toBeVisible();
  await expect(page.getByRole('textbox', { name: i18nKeys.translation.email })).toHaveValue(newEmail);

  changeEmailUser.email = newEmail;
});

test('should not allow user to change email to an invalid email', async ({ page }) => {
  await login(page);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.email).fill('invalid-email');
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.emailInvalid)).toBeVisible();
});

test('should not allow user to change to an empty name', async ({ page }) => {
  await login(page);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.firstName).fill('');
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.firstNameRequired)).toBeVisible();
});

test('should not allow user to change to an empty last name', async ({ page }) => {
  await login(page);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.lastName).fill('');
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.lastNameRequired)).toBeVisible();
});

test('should not allow user to change to an empty email', async ({ page }) => {
  await login(page);
  
  await goToSettingsPage(page);

  await page.getByLabel(i18nKeys.translation.email).fill('');
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();

  await expect(page.getByText(i18nKeys.translation.emailInvalid)).toBeVisible();
});

test('should allow user to change password', async ({ page }) => {
  const newPassword = `Maro-cjan94`;
  await login(page, changePasswordUser.email, loginUserPassword);
  
  await goToSettingsPage(page);
  await page.getByRole('button', { name: i18nKeys.translation.changePassword }).click();

  await page.getByLabel(i18nKeys.translation.currentPassword).fill(testUser.password);
  await page.getByLabel(i18nKeys.translation.newPassword).fill(newPassword);
  await page.getByLabel(i18nKeys.translation.confirmPassword).fill(newPassword);
  await page.getByRole('button', { name: /change-password-button/i }).click();

  await expect(page.getByText(i18nKeys.translation.passwordChangedSuccess)).toBeVisible();
});
