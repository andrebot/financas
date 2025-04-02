import { test, expect } from '@playwright/test';
import { login, goToRegisterPageFromLoginPage, fillRegisterForm } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import { goToSettingsPage } from './settingsPageUtils';

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

test('should not allow user to change email', async ({ page }) => {
  await login(page);
  
  await goToSettingsPage(page);

  await expect(page.getByLabel(i18nKeys.translation.email)).toBeDisabled();
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

test('should allow user to change password', async ({ page }) => {
  const newPassword = `Maro-cjan95`;
  const changePasswordUser = {
    firstName: 'Andre',
    lastName: 'Silva',
    email: `delete.${Date.now()}@gmail.com`,
    password: 'Maro-cjan94',
  };

  await test.step('Register successfully', async () => {
    await goToRegisterPageFromLoginPage(page);
    await fillRegisterForm(page, changePasswordUser);
    await page.getByRole('button', { name: i18nKeys.translation.register }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(i18nKeys.translation.registerSuccess)).toBeVisible();
  });

  await test.step('Try change password', async () => {
    await goToSettingsPage(page);
    await page.getByRole('button', { name: i18nKeys.translation.changePassword }).click();

    await page.getByLabel(i18nKeys.translation.currentPassword).fill(changePasswordUser.password);
    await page.getByLabel(i18nKeys.translation.newPassword).fill(newPassword);
    await page.getByLabel(i18nKeys.translation.confirmPassword).fill(newPassword);
    await page.getByRole('button', { name: /change-password-button/i }).click();

    await expect(page.getByText(i18nKeys.translation.passwordChangedSuccess)).toBeVisible();
  });
});

test('should allow user to delete account', async ({ page }) => {
  const changePasswordUser = {
    firstName: 'Andre',
    lastName: 'Silva',
    email: `delete.${Date.now()}@gmail.com`,
    password: 'Maro-cjan94',
  };

  await test.step('Register successfully', async () => {
    await goToRegisterPageFromLoginPage(page);
    await fillRegisterForm(page, changePasswordUser);
    await page.getByRole('button', { name: i18nKeys.translation.register }).click();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText(i18nKeys.translation.registerSuccess)).toBeVisible();
  });

  await test.step('Delete account', async () => {
    await goToSettingsPage(page);
    await page.getByRole('button', { name: i18nKeys.translation.deleteAccount }).click();
    await page.getByRole('button', { name: i18nKeys.translation.delete }).click();
    await expect(page.getByText(i18nKeys.translation.accountDeleted)).toBeVisible();
    await expect(page.getByRole('heading', { name: i18nKeys.translation.login })).toBeVisible();
  });
});
