import { Page } from "@playwright/test";

export async function goToSettingsPage(page: Page) {
  await page.getByRole('button', { name: 'menu', exact: true }).click();
  await page.getByRole('button', { name: /settings/i }).click();
}
