import { Page } from '@playwright/test';
import i18nKeys from '../../src/client/i18n/en';
import { fillMuiMonthYear } from './datePickerUtils';

const createGoalsUser = (browser: string) => ({
  email: `delete.me.goals.${browser}@gmail.com`,
  firstName: 'John',
  lastName: 'Doe',
  password: '$2b$10$28bW5R9ZyYOe/I3erH71/e8nWKmgd1ddiKbpPSFBjhaFIJJFDYRcS',
  createdAt: new Date('2025-02-06T20:35:00.065Z'),
  updatedAt: new Date('2025-02-06T20:35:00.065Z'),
  __v: 0,
});

export const goalsUsers: Record<string, ReturnType<typeof createGoalsUser>> = {
  chromium: createGoalsUser('chromium'),
  firefox: createGoalsUser('firefox'),
  webkit: createGoalsUser('webkit'),
};

export const goalsUserPassword = 'Maro-cja99';

export function getGoalsUser(projectName: string) {
  return goalsUsers[projectName] ?? goalsUsers.chromium;
}

export async function goToGoalsPage(page: Page) {
  await page.getByRole('button', { name: /menu/i }).click();
  await page.getByRole('button', { name: i18nKeys.translation.goals }).click();
}

export type GoalFormData = {
  name: string;
  value: number;
  dueDate: string; // MM/YY
};

export async function fillGoalForm(
  page: Page,
  data: { name: string; value: number; dueDate: string },
) {
  await page.getByLabel(i18nKeys.translation.goalName).fill(data.name);
  await page.getByLabel(i18nKeys.translation.goalValue).fill(String(data.value));
  // MUI DatePicker: click the visible wrapper (role="group") to open picker; avoid getByLabel (strict mode).
  const dateField = page.getByRole('group', { name: i18nKeys.translation.goalDueDate });
  await dateField.click();
  await page.getByRole('spinbutton', { name: 'Month' }).waitFor({ state: 'visible' });
  await fillMuiMonthYear(page, data.dueDate);
  await page.keyboard.press('Escape');
}

export async function saveGoal(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.saveGoal }).click();
}

export function getGoalRow(page: Page, goalName: string) {
  return page.locator('tbody tr').filter({ hasText: goalName }).first();
}

export async function filterGoalsByName(page: Page, searchText: string) {
  await page.getByLabel(i18nKeys.translation.searchByName).fill(searchText);
}

export async function clickArchiveOnGoal(page: Page, goalName: string) {
  const row = getGoalRow(page, goalName);
  await row.getByRole('button', { name: i18nKeys.translation.archive }).click();
}

export async function clickDeleteOnGoal(page: Page, goalName: string) {
  const row = getGoalRow(page, goalName);
  await row.getByRole('button', { name: i18nKeys.translation.delete }).click();
}

export async function clickEditOnGoal(page: Page, goalName: string) {
  const row = getGoalRow(page, goalName);
  await row.getByRole('button', { name: i18nKeys.translation.edit }).click();
}

export async function clickDeselectOnGoal(page: Page, goalName: string) {
  const row = getGoalRow(page, goalName);
  await row.getByRole('button', { name: /deselect/i }).click();
}

export async function confirmDeleteGoal(page: Page) {
  await page.getByRole('button', { name: new RegExp(i18nKeys.translation.confirm, 'i') }).click();
}

export async function switchToArchivedTab(page: Page) {
  await page.getByRole('tab', { name: i18nKeys.translation.archived }).click();
}

export async function switchToActiveTab(page: Page) {
  await page.getByRole('tab', { name: i18nKeys.translation.active }).click();
}

export async function clickSortByValue(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.goalValue }).click();
}

export async function clickSortByDueDate(page: Page) {
  await page.getByRole('button', { name: i18nKeys.translation.goalDueDate }).click();
}
