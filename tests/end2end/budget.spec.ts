import { test, expect } from '@playwright/test';
import { login } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import {
  addSubCategory,
  fillCategoryName,
  getCategoryCard,
  goToCategoriesPage,
  openAddCategoryModal,
  saveCategory,
} from './categoriesPageUtils';
import {
  budgetUserPassword,
  clearBudgetCategories,
  clickDeleteOnBudget,
  clickEditOnBudget,
  confirmDeleteBudget,
  fillBudgetForm,
  getBudgetRow,
  getBudgetUser,
  goToBudgetPage,
  saveBudget,
  selectBudgetCategories,
} from './budgetPageUtils';

test.describe.serial('Budget', () => {
  const getBudgetTestData = () => {
    const suffix = test.info().project.name;

    return {
      parentCategory: `Budget Category ${suffix}`,
      foodCategory: `Food ${suffix}`,
      restaurantCategory: `Restaurants ${suffix}`,
      transportCategory: `Transport ${suffix}`,
      firstBudget: `Groceries Budget ${suffix}`,
      multiCategoryBudget: `Lifestyle Budget ${suffix}`,
      editBudget: `Edit Budget ${suffix}`,
      deleteBudget: `Delete Budget ${suffix}`,
      invalidUpdateBudget: `Invalid Update Budget ${suffix}`,
    };
  };

  const startDate = '01/26';
  const endDate = '12/26';

  test('should load page with no budgets', async ({ page }) => {
    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await expect(page.getByRole('heading', { name: i18nKeys.translation.budget })).toBeVisible();
    await expect(page.getByLabel(i18nKeys.translation.budgetName)).toBeVisible();
    await expect(page.getByLabel(i18nKeys.translation.budgetValue)).toBeVisible();
    await expect(page.getByRole('group', { name: i18nKeys.translation.start })).toBeVisible();
    await expect(page.getByRole('group', { name: i18nKeys.translation.end })).toBeVisible();
    await expect(page.getByRole('combobox', { name: i18nKeys.translation.budgetCategories })).toBeVisible();
    await expect(page.getByRole('button', { name: i18nKeys.translation.saveBudget })).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.noBudgets)).toBeVisible();
  });

  test('should create categories for budget tests', async ({ page }) => {
    const {
      foodCategory,
      parentCategory,
      restaurantCategory,
      transportCategory,
    } = getBudgetTestData();

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToCategoriesPage(page);

    await openAddCategoryModal(page);
    await fillCategoryName(page, parentCategory);
    await saveCategory(page);
    await expect(page.getByText(i18nKeys.translation.categoryCreated)).toBeVisible();

    await addSubCategory(page, parentCategory, foodCategory);
    await expect(page.getByText(i18nKeys.translation.subCategoryCreated)).toBeVisible();

    await addSubCategory(page, parentCategory, restaurantCategory);
    await expect(page.getByText(i18nKeys.translation.subCategoryCreated).first()).toBeVisible();

    await addSubCategory(page, parentCategory, transportCategory);
    await expect(page.getByText(i18nKeys.translation.subCategoryCreated).first()).toBeVisible();
  });

  test('should not create budget without categories', async ({ page }) => {
    const { firstBudget } = getBudgetTestData();

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: firstBudget,
      value: 500,
      startDate,
      endDate,
    });
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.budgetCategoriesRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
    await expect(getBudgetRow(page, firstBudget)).not.toBeVisible();
  });

  test('should not create budget with invalid value', async ({ page }) => {
    const { foodCategory, parentCategory } = getBudgetTestData();
    const categoryLabel = `${parentCategory} - ${foodCategory}`;
    const invalidBudget = `Invalid Value Budget ${test.info().project.name}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: invalidBudget,
      value: -100,
      startDate,
      endDate,
      categories: [categoryLabel],
    });
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.valueMustBeGreaterThanZero)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
    await expect(getBudgetRow(page, invalidBudget)).not.toBeVisible();
  });

  test('should not submit empty required fields', async ({ page }) => {
    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.nameRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.valueRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.budgetCategoriesRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.noBudgets)).toBeVisible();
  });

  test('should not create budget when end date is before start date', async ({ page }) => {
    const { foodCategory, parentCategory } = getBudgetTestData();
    const categoryLabel = `${parentCategory} - ${foodCategory}`;
    const invalidBudget = `Invalid Date Budget ${test.info().project.name}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: invalidBudget,
      value: 400,
      startDate: '12/26',
      endDate: '01/26',
      categories: [categoryLabel],
    });
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.endDateMustBeAfterStartDate)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
    await expect(getBudgetRow(page, invalidBudget)).not.toBeVisible();
  });

  test('should create budget with one category', async ({ page }) => {
    const { firstBudget, foodCategory, parentCategory } = getBudgetTestData();
    const categoryLabel = `${parentCategory} - ${foodCategory}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: firstBudget,
      value: 500,
      startDate,
      endDate,
      categories: [categoryLabel],
    });
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.budgetCreated).first()).toBeVisible();
    await expect(getBudgetRow(page, firstBudget)).toBeVisible();
    await expect(getBudgetRow(page, firstBudget)).toContainText(foodCategory);

    await page.reload();
    await expect(getBudgetRow(page, firstBudget)).toBeVisible();
    await expect(getBudgetRow(page, firstBudget)).toContainText(foodCategory);
  });

  test('should create budget with multiple categories', async ({ page }) => {
    const {
      foodCategory,
      multiCategoryBudget,
      parentCategory,
      restaurantCategory,
    } = getBudgetTestData();
    const foodLabel = `${parentCategory} - ${foodCategory}`;
    const restaurantLabel = `${parentCategory} - ${restaurantCategory}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: multiCategoryBudget,
      value: 800,
      startDate,
      endDate,
      categories: [foodLabel, restaurantLabel],
    });
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.budgetCreated).first()).toBeVisible();
    await expect(getBudgetRow(page, multiCategoryBudget)).toContainText(foodCategory);
    await expect(getBudgetRow(page, multiCategoryBudget)).toContainText(restaurantCategory);

    await page.reload();
    await expect(getBudgetRow(page, multiCategoryBudget)).toContainText(foodCategory);
    await expect(getBudgetRow(page, multiCategoryBudget)).toContainText(restaurantCategory);
  });

  test('should edit budget and change categories', async ({ page }) => {
    const {
      editBudget,
      foodCategory,
      parentCategory,
      restaurantCategory,
    } = getBudgetTestData();
    const foodLabel = `${parentCategory} - ${foodCategory}`;
    const restaurantLabel = `${parentCategory} - ${restaurantCategory}`;
    const editedBudget = `Edited Budget ${test.info().project.name}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: editBudget,
      value: 350,
      startDate,
      endDate,
      categories: [foodLabel],
    });
    await saveBudget(page);
    await expect(page.getByText(i18nKeys.translation.budgetCreated).first()).toBeVisible();

    await clickEditOnBudget(page, editBudget);
    await page.getByLabel(i18nKeys.translation.budgetName).fill(editedBudget);
    await selectBudgetCategories(page, [restaurantLabel]);
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.budgetCreated).first()).toBeVisible();
    await expect(getBudgetRow(page, editedBudget)).toContainText(foodCategory);
    await expect(getBudgetRow(page, editedBudget)).toContainText(restaurantCategory);

    await page.reload();
    await expect(getBudgetRow(page, editedBudget)).toContainText(foodCategory);
    await expect(getBudgetRow(page, editedBudget)).toContainText(restaurantCategory);
  });

  test('should not update budget into invalid state', async ({ page }) => {
    const {
      invalidUpdateBudget,
      parentCategory,
      transportCategory,
    } = getBudgetTestData();
    const categoryLabel = `${parentCategory} - ${transportCategory}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: invalidUpdateBudget,
      value: 600,
      startDate,
      endDate,
      categories: [categoryLabel],
    });
    await saveBudget(page);
    await expect(page.getByText(i18nKeys.translation.budgetCreated).first()).toBeVisible();

    await clickEditOnBudget(page, invalidUpdateBudget);
    await page.getByLabel(i18nKeys.translation.budgetValue).fill('-200');
    await clearBudgetCategories(page, [categoryLabel]);
    await saveBudget(page);

    await expect(page.getByText(i18nKeys.translation.valueMustBeGreaterThanZero)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.budgetCategoriesRequired)).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.fixErrorsBeforeSaving)).toBeVisible();
    await expect(getBudgetRow(page, invalidUpdateBudget)).toContainText('600');
    await expect(getBudgetRow(page, invalidUpdateBudget)).toContainText(transportCategory);

    await page.reload();
    await expect(getBudgetRow(page, invalidUpdateBudget)).toContainText('600');
    await expect(getBudgetRow(page, invalidUpdateBudget)).toContainText(transportCategory);
  });

  test('should delete budget with categories', async ({ page }) => {
    const { deleteBudget, foodCategory, parentCategory } = getBudgetTestData();
    const categoryLabel = `${parentCategory} - ${foodCategory}`;

    await login(page, getBudgetUser(test.info().project.name).email, budgetUserPassword);
    await goToBudgetPage(page);

    await fillBudgetForm(page, {
      name: deleteBudget,
      value: 250,
      startDate,
      endDate,
      categories: [categoryLabel],
    });
    await saveBudget(page);
    await expect(page.getByText(i18nKeys.translation.budgetCreated).first()).toBeVisible();

    await clickDeleteOnBudget(page, deleteBudget);
    await confirmDeleteBudget(page);

    await expect(page.getByText(i18nKeys.translation.budgetDeletedSuccessfully)).toBeVisible();
    await expect(getBudgetRow(page, deleteBudget)).not.toBeVisible();

    await page.reload();
    await expect(getBudgetRow(page, deleteBudget)).not.toBeVisible();

    await goToCategoriesPage(page);
    await expect(page.getByRole('heading', { name: i18nKeys.translation.categories })).toBeVisible();
    await expect(getCategoryCard(page, parentCategory)).toContainText(foodCategory);
  });
});
