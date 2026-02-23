import { Page } from '@playwright/test';
import i18nKeys from '../../src/client/i18n/en';
import { fillMuiMonthYear } from './datePickerUtils';

const createBankAccountsUser = (browser: string) => ({
  email: `delete.me.bank.accounts.${browser}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0,
});

export const bankAccountsUsers: Record<string, ReturnType<typeof createBankAccountsUser>> = {
  chromium: createBankAccountsUser('chromium'),
  firefox: createBankAccountsUser('firefox'),
  webkit: createBankAccountsUser('webkit'),
};

export const bankAccountsUserPassword = 'Maro-cja99';

export function getBankAccountsUser(projectName: string) {
  return bankAccountsUsers[projectName] ?? bankAccountsUsers.chromium;
}

export async function goToBankAccountsPage(page: Page) {
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('button', { name: i18nKeys.translation.bankAccounts }).click();
}

export async function openAddBankAccountModal(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.createAccount }).click();
  await page.getByTestId('add-bank-account-modal').waitFor({ state: 'visible' });
}

export async function fillBankAccountForm(
  page: Page,
  data: {
    name?: string;
    currency?: string;
    accountNumber?: string;
    agency?: string;
  },
) {
  const modal = page.getByTestId('add-bank-account-modal');
  await modal.waitFor({ state: 'visible' });
  if (data.name !== undefined) {
    await modal.getByTestId('bank-account-name-input').fill(data.name);
  }
  if (data.currency !== undefined) {
    await modal.getByTestId('bank-account-currency-select').click();
    await page.getByRole('option', { name: new RegExp(data.currency) }).click();
  }
  if (data.accountNumber !== undefined) {
    await modal.getByTestId('bank-account-number-input').fill(data.accountNumber);
  }
  if (data.agency !== undefined) {
    await modal.getByTestId('bank-account-agency-input').fill(data.agency);
  }
}

export async function saveBankAccount(page: Page) {
  await page.getByTestId('bank-account-save-button').click();
}

export async function addCreditCard(page: Page, cardNumber: string, expirationDate = '12/30') {
  const modal = page.getByTestId('add-bank-account-modal');
  await modal.getByTestId('credit-card-number-input').fill(cardNumber);
  await fillMuiMonthYear(modal, expirationDate);
  await modal.getByTestId('credit-card-add-button').click();
}

export async function deleteCreditCardFromForm(page: Page, cardIndex: number) {
  const modal = page.getByTestId('add-bank-account-modal');
  const deleteItem = modal.getByTestId('credit-card-delete-item').nth(cardIndex);
  const cardHolder = deleteItem.locator('xpath=..');
  await cardHolder.hover();
  await cardHolder.click();
}

export async function openBankAccountMenu(page: Page, accountName: string) {
  await page.locator('.MuiPaper-root').filter({ hasText: accountName }).first().getByRole('button', { name: i18nKeys.translation.actionMenu }).click();
}

export async function editBankAccount(page: Page, accountName: string) {
  await openBankAccountMenu(page, accountName);
  await page.getByRole('menuitem', { name: i18nKeys.translation.edit }).click();
}

export async function deleteBankAccount(page: Page, accountName: string) {
  await openBankAccountMenu(page, accountName);
  await page.getByRole('menuitem', { name: i18nKeys.translation.delete }).click();
  await page.getByRole('button', { name: /confirm/i }).click();
}
