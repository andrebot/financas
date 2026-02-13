import { test, expect } from '@playwright/test';
import { login } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import {
  categoryUserPassword,
  getCategoryUser,
  goToCategoriesPage,
  openAddCategoryModal,
  fillCategoryName,
  saveCategory,
  addSubCategory,
  deleteSubCategory,
  editCategory,
  deleteCategory,
} from './categoriesPageUtils';

test.describe.serial('Categories', () => {
  const getCategoryNames = () => {
    const suffix = test.info().project.name;
    return {
      category1: `Category test ${suffix}`,
      category2: `Category test two ${suffix}`,
      category3: `Category test three ${suffix}`,
      subCategory1: `Sub category ${suffix}`,
      subCategory2: `Sub category two ${suffix}`,
    };
  };
  let currentCategoryName: string;

  test('should show up with empty list', async ({ page }) => {
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    await expect(page.getByRole('heading', { name: i18nKeys.translation.categories })).toBeVisible();
    await expect(page.getByRole('button', { name: i18nKeys.translation.createCategory })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3 })).toHaveCount(0);
  });

  test('should add category', async ({ page }) => {
    const { category1 } = getCategoryNames();
    currentCategoryName = category1;
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    await openAddCategoryModal(page);
    await fillCategoryName(page, category1);
    await saveCategory(page);

    await expect(page.getByText(i18nKeys.translation.categoryCreated)).toBeVisible();
    await expect(page.getByText(category1)).toBeVisible();
  });

  test('should add sub category', async ({ page }) => {
    const { category1, subCategory1 } = getCategoryNames();
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    await addSubCategory(page, category1, subCategory1);

    await expect(page.getByText(i18nKeys.translation.subCategoryCreated)).toBeVisible();
    await expect(page.getByText(subCategory1)).toBeVisible();
  });

  test('should add multiple categories', async ({ page }) => {
    const { category2, category3 } = getCategoryNames();
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    await openAddCategoryModal(page);
    await fillCategoryName(page, category2);
    await saveCategory(page);

    await expect(page.getByText(i18nKeys.translation.categoryCreated)).toBeVisible();

    await openAddCategoryModal(page);
    await fillCategoryName(page, category3);
    await saveCategory(page);

    await expect(page.getByText(i18nKeys.translation.categoryCreated)).toBeVisible();
    await expect(page.getByText(currentCategoryName)).toBeVisible();
    await expect(page.getByText(category2)).toBeVisible();
    await expect(page.getByText(category3)).toBeVisible();
  });

  test('should delete sub category', async ({ page }) => {
    const { category1, subCategory1 } = getCategoryNames();
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    await deleteSubCategory(page, category1, subCategory1);

    await expect(page.getByText(i18nKeys.translation.subCategoryDeleted)).toBeVisible();
    await expect(page.getByText(subCategory1)).not.toBeVisible();
    await expect(page.getByText(category1)).toBeVisible();
  });

  test('should delete one category and delete all subcategories', async ({ page }) => {
    const { category1, category2, subCategory2 } = getCategoryNames();
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    await addSubCategory(page, category1, subCategory2);
    await expect(page.getByText(i18nKeys.translation.subCategoryCreated)).toBeVisible();

    await deleteCategory(page, category1);

    await expect(page.getByText(i18nKeys.translation.categoryDeleted)).toBeVisible();
    await expect(page.getByText(category1)).not.toBeVisible();
    await expect(page.getByText(subCategory2)).not.toBeVisible();
    await expect(page.getByText(category2)).toBeVisible();
  });

  test('should edit category', async ({ page }) => {
    const { category2 } = getCategoryNames();
    await login(page, getCategoryUser(test.info().project.name).email, categoryUserPassword);
    await goToCategoriesPage(page);

    const newName = `Updated category ${test.info().project.name}`;
    currentCategoryName = newName;
    await editCategory(page, category2);
    await fillCategoryName(page, newName);
    await saveCategory(page);

    await expect(page.getByText(i18nKeys.translation.categoryUpdated)).toBeVisible();
    await expect(page.getByText(newName)).toBeVisible();
    await expect(page.getByText(category2)).not.toBeVisible();
  });
});
