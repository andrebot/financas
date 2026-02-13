import { Page } from '@playwright/test';
import i18nKeys from '../../src/client/i18n/en';

const createCategoryUser = (browser: string) => ({
  email: `delete.me.categories.${browser}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0,
});

export const categoryUsers: Record<string, ReturnType<typeof createCategoryUser>> = {
  chromium: createCategoryUser('chromium'),
  firefox: createCategoryUser('firefox'),
  webkit: createCategoryUser('webkit'),
};

export const categoryUserPassword = 'Maro-cja99';

export function getCategoryUser(projectName: string) {
  return categoryUsers[projectName] ?? categoryUsers.chromium;
}

export async function goToCategoriesPage(page: Page) {
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('button', { name: i18nKeys.translation.categories }).click();
}

export async function openAddCategoryModal(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.createCategory }).click();
  await page.getByRole('textbox', { name: i18nKeys.translation.categoryName, exact: true }).waitFor({ state: 'visible' });
}

export async function fillCategoryName(page: Page, name: string) {
  await page.getByRole('textbox', { name: i18nKeys.translation.categoryName, exact: true }).fill(name);
}

export async function saveCategory(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.saveCategory }).click();
}

export function getCategoryCard(page: Page, categoryName: string) {
  return page.locator('.MuiPaper-root').filter({ hasText: categoryName }).first();
}

export async function editCategory(page: Page, categoryName: string) {
  const card = getCategoryCard(page, categoryName);
  await card.getByRole('button').nth(0).click();
  await page.getByRole('textbox', { name: i18nKeys.translation.categoryName, exact: true }).waitFor({ state: 'visible' });
}

export async function deleteCategory(page: Page, categoryName: string) {
  const card = getCategoryCard(page, categoryName);
  await card.getByRole('button').nth(1).click();
  await page.getByRole('button', { name: new RegExp(i18nKeys.translation.confirm, 'i') }).click();
}

export async function addSubCategory(page: Page, categoryName: string, subCategoryName: string) {
  const card = getCategoryCard(page, categoryName);
  const subCategoryInput = card.getByLabel(i18nKeys.translation.subCategoryName);
  await subCategoryInput.fill(subCategoryName);
  await card.getByRole('button', { name: i18nKeys.translation.addSubCategory }).click();
}

export async function deleteSubCategory(page: Page, categoryName: string, subCategoryName: string) {
  const card = getCategoryCard(page, categoryName);
  const chip = card.locator('.MuiChip-root').filter({ hasText: subCategoryName });
  await chip.locator('.MuiChip-deleteIcon').click();
}
