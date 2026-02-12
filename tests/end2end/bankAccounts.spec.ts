import { test, expect } from '@playwright/test';
import { login } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import {
  bankAccountsUserPassword,
  getBankAccountsUser,
  goToBankAccountsPage,
  openAddBankAccountModal,
  fillBankAccountForm,
  saveBankAccount,
  addCreditCard,
  deleteCreditCardFromForm,
  editBankAccount,
  deleteBankAccount,
} from './bankAccountsPageUtils';

test.describe.serial('Bank Accounts', () => {
  const getAccountNames = () => {
    const suffix = test.info().project.name;
    return {
      accountName1: `Account test ${suffix}`,
      accountName2: `Account test two ${suffix}`,
      accountName3: `Account test three ${suffix}`,
    };
  };
  let currentAccountName: string;

  test('should see the page empty', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await expect(page.getByRole('heading', { name: i18nKeys.translation.bankAccounts })).toBeVisible();
    await expect(page.getByRole('button', { name: i18nKeys.translation.createAccount })).toBeVisible();
    await expect(page.getByText(new RegExp(`${i18nKeys.translation.bankAccountNumber}: \\d+`))).not.toBeVisible();
  });

  test('should add a bank account with no cards', async ({ page }) => {
    const { accountName1 } = getAccountNames();
    currentAccountName = accountName1;
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await openAddBankAccountModal(page);
    await fillBankAccountForm(page, {
      name: accountName1,
      currency: 'BRL',
      accountNumber: '12345',
      agency: '0001',
    });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountCreated)).toBeVisible();
    await expect(page.getByText(currentAccountName)).toBeVisible();
    await expect(page.getByText(`${i18nKeys.translation.bankAccountNumber}: 12345`)).toBeVisible();
    await expect(page.getByText(`${i18nKeys.translation.bankAgencyNumber}: 0001`)).toBeVisible();
  });

  test('should edit bank account - name', async ({ page }) => {
    const { accountName1 } = getAccountNames();
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    const newName = `Updated account test ${test.info().project.name}`;
    currentAccountName = newName;
    await editBankAccount(page, accountName1);
    await fillBankAccountForm(page, { name: newName });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
    await expect(page.getByText(newName)).toBeVisible();
  });

  test('should edit bank account - currency', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await editBankAccount(page, currentAccountName);
    await fillBankAccountForm(page, { currency: 'USD' });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
  });

  test('should edit bank account - account number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await editBankAccount(page, currentAccountName);
    await fillBankAccountForm(page, { accountNumber: '99999' });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
    await expect(page.getByText(`${i18nKeys.translation.bankAccountNumber}: 99999`)).toBeVisible();
  });

  test('should edit bank account - agency', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await editBankAccount(page, currentAccountName);
    await fillBankAccountForm(page, { agency: '9999' });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
    await expect(page.getByText(`${i18nKeys.translation.bankAgencyNumber}: 9999`)).toBeVisible();
  });

  test('should edit bank account by adding 2 cards', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await editBankAccount(page, currentAccountName);
    await addCreditCard(page, '4111111111111111');
    await addCreditCard(page, '5100000000000000');
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
    await expect(page.getByText('1111')).toBeVisible();
    await expect(page.getByText('0000')).toBeVisible();
  });

  test('should edit bank account by deleting one card at a time', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await editBankAccount(page, currentAccountName);
    await deleteCreditCardFromForm(page, 0);
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
    await expect(page.getByText('1111')).not.toBeVisible();
    await expect(page.getByText('0000')).toBeVisible();

    await editBankAccount(page, currentAccountName);
    await deleteCreditCardFromForm(page, 0);
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountUpdated)).toBeVisible();
    await expect(page.getByText('0000')).not.toBeVisible();
  });

  test('should add multiple bank accounts', async ({ page }) => {
    const { accountName2, accountName3 } = getAccountNames();
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await openAddBankAccountModal(page);
    await fillBankAccountForm(page, {
      name: accountName2,
      currency: 'EUR',
      accountNumber: '22222',
      agency: '0002',
    });
    await saveBankAccount(page);

    await openAddBankAccountModal(page);
    await fillBankAccountForm(page, {
      name: accountName3,
      currency: 'GBP',
      accountNumber: '33333',
      agency: '0003',
    });
    await saveBankAccount(page);

    await expect(page.getByText(currentAccountName)).toBeVisible();
    await expect(page.getByText(accountName2)).toBeVisible();
    await expect(page.getByText(accountName3)).toBeVisible();
  });

  test('should delete one bank account', async ({ page }) => {
    const { accountName2, accountName3 } = getAccountNames();
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await deleteBankAccount(page, accountName2);

    await expect(page.getByText(i18nKeys.translation.bankAccountDeleted)).toBeVisible();
    await expect(page.getByText(accountName2)).not.toBeVisible();
    await expect(page.getByText(currentAccountName)).toBeVisible();
    await expect(page.getByText(accountName3)).toBeVisible();
  });

  test('should delete all bank accounts', async ({ page }) => {
    const { accountName3 } = getAccountNames();
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);

    await deleteBankAccount(page, currentAccountName);
    await expect(page.getByText(i18nKeys.translation.bankAccountDeleted)).toBeVisible();

    await deleteBankAccount(page, accountName3);
    await expect(page.getByText(i18nKeys.translation.bankAccountDeleted)).toBeVisible();

    await expect(page.getByText(currentAccountName)).not.toBeVisible();
    await expect(page.getByText(accountName3)).not.toBeVisible();
    await expect(page.getByRole('heading', { name: i18nKeys.translation.bankAccounts })).toBeVisible();
  });
});

test.describe('Bank Account Modal - Card Flags', () => {
  test('should show correct flag for Visa card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('4111111111111111');
    await expect(page.getByTestId('card-flag-visa')).toBeVisible();
  });

  test('should show correct flag for Mastercard card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('5100000000000000');
    await expect(page.getByTestId('card-flag-master')).toBeVisible();
  });

  test('should show correct flag for Amex card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('340000000000000');
    await expect(page.getByTestId('card-flag-amex')).toBeVisible();
  });

  test('should show correct flag for Discover card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('6011000000000000');
    await expect(page.getByTestId('card-flag-discover')).toBeVisible();
  });

  test('should show correct flag for Diners card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('36000000000000');
    await expect(page.getByTestId('card-flag-diners')).toBeVisible();
  });

  test('should show correct flag for Maestro card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('5012345678901234');
    await expect(page.getByTestId('card-flag-maestro')).toBeVisible();
  });

  test('should show no flag icon for unknown card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('credit-card-number-input').fill('0000000000000000');
    const creditCardInputContainer = page.getByTestId('add-bank-account-modal').locator('.MuiInputBase-root').filter({ has: page.getByTestId('credit-card-number-input') });
    await expect(creditCardInputContainer.locator('svg')).toHaveCount(0);
  });
});

test.describe('Bank Account Modal - Validation', () => {
  test('should show required errors when submitting empty form', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.nameRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.currencyRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.accountNumberRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.agencyRequired)).toBeVisible();
  });

  test('should show invalid format error for account number with non-digits', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await fillBankAccountForm(page, {
      name: 'Valid Account',
      currency: 'BRL',
      accountNumber: '12345abc',
      agency: '0001',
    });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.accountNumberInvalid)).toBeVisible();
  });

  test('should show invalid format error for agency with non-digits', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await fillBankAccountForm(page, {
      name: 'Valid Account',
      currency: 'BRL',
      accountNumber: '12345',
      agency: '0001xyz',
    });
    await saveBankAccount(page);

    await expect(page.getByText(i18nKeys.translation.agencyInvalid)).toBeVisible();
  });
});

test.describe('Bank Account Modal - Credit Card Validation', () => {
  test('should show required error when adding card with empty card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    const modal = page.getByTestId('add-bank-account-modal');
    const monthSection = modal.getByRole('spinbutton', { name: 'Month' });
    await monthSection.click();
    await monthSection.pressSequentially('12');
    await monthSection.press('Tab');
    const yearSection = modal.getByRole('spinbutton', { name: 'Year' });
    await yearSection.pressSequentially('2030');
    await yearSection.press('Tab');
    await modal.getByTestId('credit-card-add-button').click();

    await expect(page.getByText(i18nKeys.translation.creditCardNumberRequired)).toBeVisible();
  });

  test('should show invalid format error when adding card with non-digits in card number', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await addCreditCard(page, '4111abc1111111111', '12/30');

    await expect(page.getByText(i18nKeys.translation.creditCardNumberInvalid)).toBeVisible();
  });

  test('should show required error when adding card with empty expiration date', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    const modal = page.getByTestId('add-bank-account-modal');
    await modal.getByTestId('credit-card-number-input').fill('4111111111111111');
    await modal.getByTestId('credit-card-add-button').click();

    await expect(page.getByText(i18nKeys.translation.expirationDateRequired)).toBeVisible();
  });

  test('should show invalid error when adding card with past expiration date', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await addCreditCard(page, '4111111111111111', '01/24');

    await expect(page.getByText(i18nKeys.translation.expirationDateInvalid)).toBeVisible();
  });
});

test.describe('Bank Account Modal - Currency Select', () => {
  const expectedCurrencies = [
    'R$ - BRL',
    '$ - USD',
    '€ - EUR',
    '£ - GBP',
    '¥ - JPY',
    '₩ - KRW',
  ];

  test('should show all available currencies in the select', async ({ page }) => {
    await login(page, getBankAccountsUser(test.info().project.name).email, bankAccountsUserPassword);
    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);

    await page.getByTestId('bank-account-currency-select').click();

    for (const currency of expectedCurrencies) {
      await expect(page.getByRole('option', { name: currency })).toBeVisible();
    }
  });
});
