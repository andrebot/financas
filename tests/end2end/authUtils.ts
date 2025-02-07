import { Page, expect } from "@playwright/test";
import i18nKeys from "../../src/client/i18n/en";

export const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: `delete.me@gmail.com`,
  password: 'Maro-cja99',
};

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
