import { test, expect } from '@playwright/test';
import { login } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import {
  getTransactionUser,
  transactionUserPassword,
  goToTransactionsPage,
  clickAddTransaction,
  fillTransactionForm,
  saveTransaction,
  cancelTransactionForm,
  getTransactionItem,
  clickEditOnTransaction,
  clickDeleteOnTransaction,
  confirmDeleteTransaction,
  selectDashboardMonth,
} from './transactionsPageUtils';
import {
  goToBankAccountsPage,
  openAddBankAccountModal,
  fillBankAccountForm,
  saveBankAccount,
} from './bankAccountsPageUtils';
import {
  goToGoalsPage,
  fillGoalForm,
  saveGoal,
} from './goalsPageUtils';
import {
  goToCategoriesPage,
  openAddCategoryModal,
  fillCategoryName,
  saveCategory,
  addSubCategory,
} from './categoriesPageUtils';
import {
  goToBudgetPage,
  fillBudgetForm,
  saveBudget,
} from './budgetPageUtils';

test.describe.serial('Transactions', () => {
  const getNames = () => {
    const suffix = test.info().project.name;
    return {
      accountName: `Txn Test Account ${suffix}`,
      txn1: `Salary ${suffix}`,
      txn1Edited: `Salary Edited ${suffix}`,
      txnToDelete: `Delete Me Txn ${suffix}`,
      goalName: `Dashboard Goal ${suffix}`,
      parentCategory: `Spending ${suffix}`,
      subCategory: `Groceries ${suffix}`,
      categoryLabel: `Spending ${suffix} - Groceries ${suffix}`,
      budgetName: `Grocery Budget ${suffix}`,
    };
  };

  const txnDate = '15/06/2026';
  const dueDateFuture = '12/27';

  test('should load the transactions page with dashboard visible', async ({ page }) => {
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    await expect(page.getByRole('heading', { name: i18nKeys.translation.transactions })).toBeVisible();
    await expect(page.getByRole('button', { name: i18nKeys.translation.add })).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.bankAccountBalances)).toBeVisible();
  });

  test('should create a transaction and see it in the list', async ({ page }) => {
    const { accountName, txn1, parentCategory, subCategory, categoryLabel } = getNames();
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);

    await goToBankAccountsPage(page);
    await openAddBankAccountModal(page);
    await fillBankAccountForm(page, {
      name: accountName,
      currency: 'BRL',
      accountNumber: '123456',
      agency: '0001',
    });
    await saveBankAccount(page);
    await page.getByTestId('add-bank-account-modal').waitFor({ state: 'hidden' });
    await expect(page.getByText(i18nKeys.translation.bankAccountCreated)).toBeVisible();

    await goToCategoriesPage(page);
    await openAddCategoryModal(page);
    await fillCategoryName(page, parentCategory);
    await saveCategory(page);
    await expect(page.getByText(i18nKeys.translation.categoryCreated)).toBeVisible();
    await addSubCategory(page, parentCategory, subCategory);
    await expect(page.getByText(i18nKeys.translation.subCategoryCreated)).toBeVisible();

    await goToTransactionsPage(page);
    await clickAddTransaction(page);
    await expect(page.getByRole('heading', { name: i18nKeys.translation.addTransaction })).toBeVisible();

    await fillTransactionForm(page, {
      name: txn1,
      category: categoryLabel,
      bankAccount: accountName,
      type: i18nKeys.translation.deposit,
      date: txnDate,
      value: 1500,
    });
    await saveTransaction(page);

    await expect(page.getByText(i18nKeys.translation.transactionCreated)).toBeVisible();
    await expect(getTransactionItem(page, txn1)).toBeVisible();
    await expect(getTransactionItem(page, txn1)).toContainText('+ $1,500.00');
  });

  test('should edit a transaction and see the updated name', async ({ page }) => {
    const { txn1, txn1Edited } = getNames();
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    await clickEditOnTransaction(page, txn1);
    await expect(page.getByRole('heading', { name: i18nKeys.translation.addTransaction })).toBeVisible();

    await page.getByLabel(i18nKeys.translation.name, { exact: true }).fill(txn1Edited);
    await saveTransaction(page);

    await expect(page.getByText(i18nKeys.translation.transactionCreated)).toBeVisible();
    await expect(getTransactionItem(page, txn1Edited)).toBeVisible();
    await expect(getTransactionItem(page, txn1)).not.toBeVisible();
  });

  test('should delete a transaction and remove it from the list', async ({ page }) => {
    const { accountName, txnToDelete, categoryLabel } = getNames();
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    await clickAddTransaction(page);
    await fillTransactionForm(page, {
      name: txnToDelete,
      category: categoryLabel,
      bankAccount: accountName,
      type: i18nKeys.translation.deposit,
      date: txnDate,
      value: 100,
    });
    await saveTransaction(page);
    await expect(page.getByText(i18nKeys.translation.transactionCreated)).toBeVisible();

    await clickDeleteOnTransaction(page, txnToDelete);
    await confirmDeleteTransaction(page);

    await expect(page.getByText(i18nKeys.translation.transactionDeletedSuccessfully)).toBeVisible();
    await expect(getTransactionItem(page, txnToDelete)).not.toBeVisible();
  });

  test('should show validation errors when saving an empty form', async ({ page }) => {
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    await clickAddTransaction(page);
    await saveTransaction(page);

    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
  });

  test('should reject a transaction with value of zero', async ({ page }) => {
    const { accountName, categoryLabel } = getNames();
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    await clickAddTransaction(page);
    await fillTransactionForm(page, {
      name: 'Zero Value',
      category: categoryLabel,
      bankAccount: accountName,
      type: i18nKeys.translation.deposit,
      date: txnDate,
      value: 0,
    });
    await saveTransaction(page);

    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.valueMustBeGreaterThanZero)).toBeVisible();
  });

  test('should cancel adding a transaction and return to dashboard', async ({ page }) => {
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    await clickAddTransaction(page);
    await expect(page.getByRole('heading', { name: i18nKeys.translation.addTransaction })).toBeVisible();

    await cancelTransactionForm(page);

    await expect(page.getByText(i18nKeys.translation.bankAccountBalances)).toBeVisible();
    await expect(page.getByRole('heading', { name: i18nKeys.translation.addTransaction })).not.toBeVisible();
  });

  test('should show goals on the dashboard goals card', async ({ page }) => {
    const { goalName } = getNames();
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);

    await goToGoalsPage(page);
    await fillGoalForm(page, { name: goalName, value: 500, dueDate: dueDateFuture });
    await saveGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();

    await goToTransactionsPage(page);
    await page.waitForTimeout(1000);

    await expect(page.getByText(i18nKeys.translation.goals)).toBeVisible();
    await expect(page.getByText(goalName)).toBeVisible();
    await expect(page.getByText('$0.00 / $500.00')).toBeVisible();
  });

  test('should reflect budget spending on the dashboard after a categorised transaction', async ({ page }) => {
    const { accountName, categoryLabel, budgetName } = getNames();
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);

    // Create a budget linked to the sub-category covering June 2026
    await goToBudgetPage(page);
    await fillBudgetForm(page, {
      name: budgetName,
      value: 500,
      startDate: '03/26',
      endDate: '06/26',
      categories: [categoryLabel],
    });
    await saveBudget(page);
    await expect(page.getByText(i18nKeys.translation.budgetCreated)).toBeVisible();

    // Create a withdraw transaction assigned to that sub-category
    await goToTransactionsPage(page);
    await clickAddTransaction(page);
    await fillTransactionForm(page, {
      name: 'Grocery Run',
      category: categoryLabel,
      bankAccount: accountName,
      type: i18nKeys.translation.withdraw,
      date: txnDate,
      value: 200,
    });
    await saveTransaction(page);
    await expect(page.getByText(i18nKeys.translation.transactionCreated)).toBeVisible();
    await page.getByRole('button', { name: i18nKeys.translation.cancel }).click();
    await page.waitForTimeout(1000);

    // Dashboard for June should show the budget with $200.00 spent of $500.00
    await selectDashboardMonth(page, 'Jun');
    await expect(page.getByText(budgetName)).toBeVisible();
    await expect(page.getByText('$200.00 / $500.00')).toBeVisible();
  });

  test('should filter bank account balances by month in the dashboard', async ({ page }) => {
    await login(page, getTransactionUser(test.info().project.name).email, transactionUserPassword);
    await goToTransactionsPage(page);

    // June 2026 has the deposit transaction — balance should be $1,500.00
    await selectDashboardMonth(page, 'Jun');
    await expect(page.getByText('$1,300.00').first()).toBeVisible();

    // January has no transactions — all accounts show the "no data" dash
    await selectDashboardMonth(page, 'Jan');
    await expect(page.getByText('$1,300.00')).not.toBeVisible();
    await expect(page.getByText('—').first()).toBeVisible();
  });
});
