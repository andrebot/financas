import { Page } from '@playwright/test';
import i18nKeys from '../../src/client/i18n/en';

const createTransactionUser = (browser: string) => ({
  email: `delete.me.transactions.${browser}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0,
});

export const transactionUsers: Record<string, ReturnType<typeof createTransactionUser>> = {
  chromium: createTransactionUser('chromium'),
  firefox: createTransactionUser('firefox'),
  webkit: createTransactionUser('webkit'),
};

export const transactionUserPassword = 'Maro-cja99';

export function getTransactionUser(projectName: string) {
  return transactionUsers[projectName] ?? transactionUsers.chromium;
}

export async function goToTransactionsPage(page: Page) {
  await page.getByRole('button', { name: 'menu', exact: true }).click();
  await page.getByRole('button', { name: i18nKeys.translation.transactions }).click();
}

export type TransactionFormData = {
  name?: string;
  category?: string; // displayed label, e.g. "Parent - Child"
  bankAccount?: string;
  type?: string;
  date?: string; // DD/MM/YYYY
  value?: number;
};

/**
 * Fills the add/edit transaction form with the provided data.
 * Only fields present in `data` are interacted with.
 */
export async function fillTransactionForm(page: Page, data: TransactionFormData) {
  if (data.name !== undefined) {
    await page.getByLabel(i18nKeys.translation.name, { exact: true }).fill(data.name);
  }
  if (data.category !== undefined) {
    await page.getByRole('combobox', { name: i18nKeys.translation.category }).click();
    await page.getByRole('option', { name: data.category }).first().click();
  }
  if (data.bankAccount !== undefined) {
    await page.getByRole('combobox', { name: new RegExp(i18nKeys.translation.bankAccount, 'i') }).click();
    await page.getByRole('option', { name: data.bankAccount }).first().click();
  }
  if (data.type !== undefined) {
    await page.getByRole('combobox', { name: i18nKeys.translation.type }).click();
    await page.getByRole('option', { name: data.type }).click();
  }
  if (data.date !== undefined) {
    const [day, month, year] = data.date.split('/');
    const daySpinner = page.getByRole('spinbutton', { name: 'Day' });
    await daySpinner.click();
    await daySpinner.pressSequentially(day);
    await daySpinner.press('Tab');
    const monthSpinner = page.getByRole('spinbutton', { name: 'Month' });
    await monthSpinner.pressSequentially(month);
    await monthSpinner.press('Tab');
    const yearSpinner = page.getByRole('spinbutton', { name: 'Year' });
    await yearSpinner.pressSequentially(year);
    await page.keyboard.press('Escape');
  }
  if (data.value !== undefined) {
    const valueInput = page.getByLabel(i18nKeys.translation.value, { exact: true });
    await valueInput.click();
    await valueInput.fill(String(data.value));
  }
}

export async function saveTransaction(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.save }).click();
}

export async function cancelTransactionForm(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.cancel }).click();
}

export function getTransactionItem(page: Page, name: string) {
  return page.getByTestId('transaction-item').filter({ hasText: name }).first();
}

export async function clickAddTransaction(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.add }).click();
}

/**
 * Selects a transaction item (clicking it reveals the actions panel),
 * then clicks the Edit button.
 */
export async function clickEditOnTransaction(page: Page, name: string) {
  const item = getTransactionItem(page, name);
  await item.click();
  await item.getByRole('button', { name: new RegExp(i18nKeys.translation.edit, 'i') }).click();
}

/**
 * Selects a transaction item and clicks the Delete button.
 */
export async function clickDeleteOnTransaction(page: Page, name: string) {
  const item = getTransactionItem(page, name);
  await item.click();
  await item.getByRole('button', { name: new RegExp(i18nKeys.translation.delete, 'i') }).click();
}

export async function confirmDeleteTransaction(page: Page) {
  await page.getByRole('button', { name: new RegExp(i18nKeys.translation.confirm, 'i') }).click();
}

/**
 * Clicks a month tab in the dashboard header (e.g. 'Jan', 'Jun').
 */
export async function selectDashboardMonth(page: Page, monthAbbrev: string) {
  await page.getByRole('tab', { name: monthAbbrev }).click();
}
