import { Page } from '@playwright/test';
import i18nKeys from '../../src/client/i18n/en';
import { fillMuiMonthYear } from './datePickerUtils';

const createBudgetUser = (browser: string) => ({
  email: `delete.me.budget.${browser}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0,
});

export const budgetUsers: Record<string, ReturnType<typeof createBudgetUser>> = {
  chromium: createBudgetUser('chromium'),
  firefox: createBudgetUser('firefox'),
  webkit: createBudgetUser('webkit'),
};

export const budgetUserPassword = 'Maro-cja99';

/**
 * Gets the budget test user for the active Playwright project.
 *
 * @param projectName - Current Playwright project name.
 * @returns The matching seeded budget user.
 */
export function getBudgetUser(projectName: string) {
  return budgetUsers[projectName] ?? budgetUsers.chromium;
}

/**
 * Opens the Budget page from the protected navigation menu.
 *
 * @param page - Playwright page under test.
 */
export async function goToBudgetPage(page: Page) {
  await page.getByRole('button', { name: 'menu', exact: true }).click();
  await page.getByRole('button', { name: i18nKeys.translation.budget }).click();
}

/**
 * Fills a budget month/year date field.
 *
 * @param page - Playwright page under test.
 * @param label - Accessible label for the date field.
 * @param monthYear - Date value in MM/YY format.
 */
export async function fillBudgetDate(page: Page, label: string, monthYear: string) {
  const dateField = page.getByRole('group', { name: label });
  await dateField.click();
  await dateField.getByRole('spinbutton', { name: 'Month' }).waitFor({ state: 'visible' });
  await fillMuiMonthYear(dateField, monthYear);
  await page.keyboard.press('Escape');
}

export type BudgetFormData = {
  name: string;
  value: number;
  startDate?: string;
  endDate?: string;
  categories?: string[];
};

/**
 * Fills the budget form with the supplied values.
 *
 * @param page - Playwright page under test.
 * @param data - Budget form values.
 */
export async function fillBudgetForm(page: Page, data: BudgetFormData) {
  await page.getByLabel(i18nKeys.translation.budgetName).fill(data.name);
  await page.getByLabel(i18nKeys.translation.budgetValue).fill(String(data.value));

  if (data.startDate) {
    await fillBudgetDate(page, i18nKeys.translation.start, data.startDate);
  }

  if (data.endDate) {
    await fillBudgetDate(page, i18nKeys.translation.end, data.endDate);
  }

  if (data.categories) {
    await selectBudgetCategories(page, data.categories);
  }
}

/**
 * Selects one or more categories in the budget category selector.
 *
 * @param page - Playwright page under test.
 * @param categories - Visible category option labels to select.
 */
export async function selectBudgetCategories(page: Page, categories: string[]) {
  await page.getByRole('combobox', { name: i18nKeys.translation.budgetCategories }).click();

  for (const category of categories) {
    await page.getByRole('option', { name: category }).click();
  }

  await page.keyboard.press('Escape');
}

/**
 * Saves the currently filled budget form.
 *
 * @param page - Playwright page under test.
 */
export async function saveBudget(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.saveBudget }).click();
}

/**
 * Gets a budget table row by budget name.
 *
 * @param page - Playwright page under test.
 * @param budgetName - Budget name shown in the table.
 * @returns The matching table row locator.
 */
export function getBudgetRow(page: Page, budgetName: string) {
  return page.locator('tbody tr').filter({ hasText: budgetName }).first();
}

/**
 * Starts editing a budget from its table row.
 *
 * @param page - Playwright page under test.
 * @param budgetName - Budget name shown in the table.
 */
export async function clickEditOnBudget(page: Page, budgetName: string) {
  await getBudgetRow(page, budgetName).getByRole('button', { name: i18nKeys.translation.edit }).click();
}

/**
 * Deletes a budget from its table row.
 *
 * @param page - Playwright page under test.
 * @param budgetName - Budget name shown in the table.
 */
export async function clickDeleteOnBudget(page: Page, budgetName: string) {
  await getBudgetRow(page, budgetName).getByRole('button', { name: i18nKeys.translation.delete }).click();
}

/**
 * Confirms the open delete budget modal.
 *
 * @param page - Playwright page under test.
 */
export async function confirmDeleteBudget(page: Page) {
  await page.getByRole('button', { name: new RegExp(i18nKeys.translation.confirm, 'i') }).click();
}

/**
 * Clears all selected budget categories by toggling each selected option.
 *
 * @param page - Playwright page under test.
 * @param categories - Visible category option labels to clear.
 */
export async function clearBudgetCategories(page: Page, categories: string[]) {
  await page.getByRole('combobox', { name: i18nKeys.translation.budgetCategories }).click();

  for (const category of categories) {
    await page.getByRole('option', { name: category }).click();
  }

  await page.keyboard.press('Escape');
}
