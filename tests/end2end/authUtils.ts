import { Page, expect } from "@playwright/test";
import i18nKeys from "../../src/client/i18n/en";

export const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: `delete.me.${Date.now()}@gmail.com`,
  password: 'Maro-cja99',
};

export const loginUser = {
  email: 'delete.me.login@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0
};

export const resetPasswordUser = {
  email: 'delete.me.reset@gmail.com',
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0
};

export const loginUserPassword = 'Maro-cja99';

export async function fillRegisterForm(page: Page, info: typeof testUser = testUser) {
  await page.getByLabel(i18nKeys.translation.firstName).fill(info.firstName);
  await page.getByLabel(i18nKeys.translation.lastName).fill(info.lastName);
  await page.getByLabel(i18nKeys.translation.email).fill(info.email);
  await page.getByRole('textbox', { name: i18nKeys.translation.password, exact: true }).fill(info.password);
  await page.getByLabel(i18nKeys.translation.confirmPassword).fill(info.password);
}

export async function goToRegisterPageFromLoginPage(page: Page) {
  await page.goto('http://localhost:3000/');
  await page.getByRole('button', { name: i18nKeys.translation.register }).click();
}

export async function checkFailedForm(page: Page, error: string) {
  await expect(page.getByText(error)).toBeVisible();
  await expect(page.getByText(i18nKeys.translation.reviewDataProvided)).toBeVisible();
}

export async function login(page: Page, email = loginUser.email, password = loginUserPassword) {
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(1000); // Webkit was being too fast and not finding the email input
  await page.getByRole('textbox', { name: i18nKeys.translation.email, exact: true }).fill(email);
  await page.getByRole('textbox', { name: i18nKeys.translation.password, exact: true }).fill(password);
  await page.getByRole('button', { name: i18nKeys.translation.login }).click();
  await page.waitForLoadState('domcontentloaded');
}
