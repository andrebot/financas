import { test, expect } from '@playwright/test';
import { login } from './authUtils';
import i18nKeys from '../../src/client/i18n/en';
import {
  goalsUserPassword,
  getGoalsUser,
  goToGoalsPage,
  fillGoalForm,
  saveGoal,
  filterGoalsByName,
  clickArchiveOnGoal,
  clickDeleteOnGoal,
  clickEditOnGoal,
  clickDeselectOnGoal,
  confirmDeleteGoal,
  switchToArchivedTab,
  switchToActiveTab,
  clickSortByValue,
  clickSortByDueDate,
  getGoalRow,
} from './goalsPageUtils';

test.describe.serial('Goals', () => {
  const getGoalNames = () => {
    const suffix = test.info().project.name;
    return {
      goal1: `Goal Alpha ${suffix}`,
      goal2: `Goal Beta ${suffix}`,
      goal3: `Goal Gamma ${suffix}`,
      goalToArchive: `Goal Archive Me ${suffix}`,
      goalToEdit: `Goal Edit Me ${suffix}`,
      goalToDeleteActive: `Goal Delete Active ${suffix}`,
      goalToDeleteArchived: `Goal Delete Archived ${suffix}`,
    };
  };

  const dueDateFuture = '12/27'; // MM/YY - Dec 2027

  test('should load page with no goals', async ({ page }) => {
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await expect(page.getByRole('heading', { name: i18nKeys.translation.goals })).toBeVisible();
    await expect(page.getByLabel(i18nKeys.translation.goalName)).toBeVisible();
    await expect(page.getByRole('button', { name: i18nKeys.translation.saveGoal })).toBeVisible();
    await expect(page.getByLabel(i18nKeys.translation.searchByName)).toBeVisible();
    await expect(page.getByRole('tab', { name: i18nKeys.translation.active })).toBeVisible();
    await expect(page.getByRole('tab', { name: i18nKeys.translation.archived })).toBeVisible();
    await expect(page.getByText(i18nKeys.translation.goalsListEmpty)).toBeVisible();
  });

  test('should add goal', async ({ page }) => {
    const { goal1 } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await fillGoalForm(page, { name: goal1, value: 1000, dueDate: dueDateFuture });
    await saveGoal(page);

    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();
    await expect(getGoalRow(page, goal1)).toBeVisible();
    await expect(page.getByText('1000')).toBeVisible();
  });

  test('should add multiple goals and table updates', async ({ page }) => {
    const { goal1, goal2, goal3 } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await fillGoalForm(page, { name: goal2, value: 2000, dueDate: dueDateFuture });
    await saveGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();

    await fillGoalForm(page, { name: goal3, value: 3000, dueDate: dueDateFuture });
    await saveGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();

    await expect(getGoalRow(page, goal1)).toBeVisible();
    await expect(getGoalRow(page, goal2)).toBeVisible();
    await expect(getGoalRow(page, goal3)).toBeVisible();
    await expect(page.getByText('1000')).toBeVisible();
    await expect(page.getByText('2000')).toBeVisible();
    await expect(page.getByText('3000')).toBeVisible();
  });

  test('should filter active goals by name', async ({ page }) => {
    const { goal1, goal2, goal3 } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, 'Beta');
    await expect(getGoalRow(page, goal2)).toBeVisible();
    await expect(getGoalRow(page, goal1)).not.toBeVisible();
    await expect(getGoalRow(page, goal3)).not.toBeVisible();
  });

  test('should sort goals by value and due date', async ({ page }) => {
    const { goal1, goal2, goal3 } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, ''); // clear filter to see all
    await clickSortByValue(page);
    const rowsByValue = page.locator('tbody tr');
    await expect(rowsByValue.first()).toContainText('1000');
    await clickSortByValue(page); // toggle to desc
    await expect(rowsByValue.first()).toContainText('3000');

    await clickSortByDueDate(page);
    await expect(rowsByValue).toHaveCount(3);
    await expect(getGoalRow(page, goal1)).toBeVisible();
    await expect(getGoalRow(page, goal2)).toBeVisible();
    await expect(getGoalRow(page, goal3)).toBeVisible();
  });

  test('should archive a goal', async ({ page }) => {
    const { goalToArchive } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, '');
    await fillGoalForm(page, { name: goalToArchive, value: 500, dueDate: dueDateFuture });
    await saveGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();

    await clickArchiveOnGoal(page, goalToArchive);
    await expect(page.getByText(i18nKeys.translation.goalArchived)).toBeVisible();
    await expect(getGoalRow(page, goalToArchive)).not.toBeVisible();

    await switchToArchivedTab(page);
    await expect(getGoalRow(page, goalToArchive)).toBeVisible();
  });

  test('should delete active goal', async ({ page }) => {
    const { goalToDeleteActive } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, '');
    await fillGoalForm(page, { name: goalToDeleteActive, value: 100, dueDate: dueDateFuture });
    await saveGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();

    await clickDeleteOnGoal(page, goalToDeleteActive);
    await confirmDeleteGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalDeleted)).toBeVisible();
    await expect(getGoalRow(page, goalToDeleteActive)).not.toBeVisible();
  });

  test('should edit an active goal', async ({ page }) => {
    const { goalToEdit, goal1 } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, '');
    await fillGoalForm(page, { name: goalToEdit, value: 999, dueDate: dueDateFuture });
    await saveGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();

    const newName = `Goal Edited ${test.info().project.name}`;
    const newValue = 1500;
    await clickEditOnGoal(page, goalToEdit);
    await page.getByLabel(i18nKeys.translation.goalName).fill(newName);
    await page.getByLabel(i18nKeys.translation.goalValue).fill(String(newValue));
    await saveGoal(page);

    await expect(page.getByText(i18nKeys.translation.goalSaved).first()).toBeVisible();
    await expect(getGoalRow(page, newName)).toBeVisible();
    await expect(getGoalRow(page, goalToEdit)).not.toBeVisible();
    await expect(page.getByText(String(newValue))).toBeVisible();
  });

  test('should cancel edit without saving', async ({ page }) => {
    const { goal1 } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, 'Alpha');
    await clickEditOnGoal(page, goal1);
    await page.getByLabel(i18nKeys.translation.goalName).fill('Should Not Save');
    await page.getByLabel(i18nKeys.translation.goalValue).fill('99999');
    await clickDeselectOnGoal(page, goal1);

    await expect(getGoalRow(page, goal1)).toBeVisible();
    await expect(page.getByText('1000')).toBeVisible();
    await expect(page.getByText('99999')).not.toBeVisible();
    await expect(page.getByText('Should Not Save')).not.toBeVisible();
  });

  test('should filter by name on active and archived tabs', async ({ page }) => {
    const { goal1, goalToArchive } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await switchToActiveTab(page);
    await filterGoalsByName(page, 'Alpha');
    await expect(getGoalRow(page, goal1)).toBeVisible();

    await filterGoalsByName(page, 'nonexistent');
    await expect(page.getByText(i18nKeys.translation.goalsListEmpty)).toBeVisible();

    await filterGoalsByName(page, '');
    await switchToArchivedTab(page);
    await filterGoalsByName(page, 'Archive');
    await expect(getGoalRow(page, goalToArchive)).toBeVisible();

    await filterGoalsByName(page, 'Alpha');
    await expect(page.getByText(i18nKeys.translation.goalsListEmpty)).toBeVisible();
  });

  test('should delete archived goal', async ({ page }) => {
    const { goalToDeleteArchived } = getGoalNames();
    await login(page, getGoalsUser(test.info().project.name).email, goalsUserPassword);
    await goToGoalsPage(page);

    await filterGoalsByName(page, '');
    await fillGoalForm(page, { name: goalToDeleteArchived, value: 200, dueDate: dueDateFuture });
    await saveGoal(page);
    await clickArchiveOnGoal(page, goalToDeleteArchived);
    await expect(page.getByText(i18nKeys.translation.goalArchived)).toBeVisible();

    await switchToArchivedTab(page);
    await expect(getGoalRow(page, goalToDeleteArchived)).toBeVisible();
    await clickDeleteOnGoal(page, goalToDeleteArchived);
    await confirmDeleteGoal(page);
    await expect(page.getByText(i18nKeys.translation.goalDeleted)).toBeVisible();
    await expect(getGoalRow(page, goalToDeleteArchived)).not.toBeVisible();
  });
});
