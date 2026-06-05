import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import BudgetForm, { formatCategories, toCategoryIds } from '../../../../src/client/pages/budget/budgetForm';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '../../../../src/client/features/budget';
import { budgetFormReducer, initialBudgetFormState } from '../../../../src/client/pages/budget/budgetFormReducer';
import { BUDGET_TYPES, BudgetFormActionType } from '../../../../src/client/enums';
import type { Category } from '../../../../src/client/types/categories';


jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/budget', () => ({
  useCreateBudgetMutation: jest.fn(),
  useUpdateBudgetMutation: jest.fn(),
}));

describe('BudgetForm', () => {
  const mockCreateBudget = jest.fn();
  const mockUpdateBudget = jest.fn();
  const parentCategory: Category = {
    id: 1,
    name: 'Food',
    userId: 1,
    parentCategoryId: null,
  };
  const childCategory: Category = {
    id: 2,
    name: 'Groceries',
    userId: 1,
    parentCategoryId: 1,
  };
  const uncategorizedCategory: Category = {
    id: 3,
    name: 'Ignored parentless category',
    userId: 1,
    parentCategoryId: null,
  };
  const mockUser = {
    id: '1',
    email: 'test@test.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ user: mockUser });
    (useCreateBudgetMutation as jest.Mock).mockReturnValue([
      mockCreateBudget,
      { isError: false, isSuccess: false },
    ]);
    (useUpdateBudgetMutation as jest.Mock).mockReturnValue([
      mockUpdateBudget,
      { isError: false, isSuccess: false },
    ]);
  });

  /**
   * Renders the budget form with reducer-backed state for interaction tests.
   *
   * @param initialStateOverride - Initial reducer state fields to override.
   */
  const setup = (initialStateOverride = {}, categories: Category[] = []) => {
    const TestWrapper = () => {
      const [budgetFormState, budgetFormDispatch] = React.useReducer(
        budgetFormReducer,
        { ...initialBudgetFormState, ...initialStateOverride },
      );
      return (
        <BudgetForm
          categories={categories}
          budgetFormState={budgetFormState}
          budgetFormDispatch={budgetFormDispatch}
        />
      );
    };

    return render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <I18nextProvider i18n={i18n}>
          <TestWrapper />
        </I18nextProvider>
      </LocalizationProvider>,
    );
  };

  /**
   * Opens a MUI select by its accessible label.
   *
   * @param label - The translated select label.
   */
  const openSelect = (label: string): void => {
    fireEvent.mouseDown(screen.getByLabelText(label));
  };

  /**
   * Fills the fields required by the budget save handler before submit.
   */
  const fillRequiredBudgetFields = (): void => {
    fireEvent.change(screen.getByLabelText(i18nEn.translation.budgetName), {
      target: { value: 'Monthly groceries' },
    });
    fireEvent.change(screen.getByLabelText(i18nEn.translation.budgetValue), {
      target: { value: '1000' },
    });
  };

  it('should not save a budget without a category', async () => {
    setup();
    fillRequiredBudgetFields();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(mockCreateBudget).not.toHaveBeenCalled();
    });
  });

  it('should send userId when saving a budget', async () => {
    mockCreateBudget.mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });

    setup({ categoryIds: [1], categoriesError: '' });
    fillRequiredBudgetFields();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: [1],
          name: 'Monthly groceries',
          value: 1000,
          userId: Number(mockUser.id),
        }),
      );
    });
  });

  it('should show required validation messages when submitting empty fields', async () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(screen.getByText(i18nEn.translation.nameRequired)).toBeInTheDocument();
      expect(screen.getByText(i18nEn.translation.valueRequired)).toBeInTheDocument();
      expect(screen.getByText(i18nEn.translation.budgetCategoriesRequired)).toBeInTheDocument();
      expect(mockCreateBudget).not.toHaveBeenCalled();
    });
  });

  it('should not save a budget with a negative value', async () => {
    setup({ categoryIds: [1], categoriesError: '' });
    fillRequiredBudgetFields();
    fireEvent.change(screen.getByLabelText(i18nEn.translation.budgetValue), {
      target: { value: '-100' },
    });

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(screen.getByText(i18nEn.translation.valueMustBeGreaterThanZero)).toBeInTheDocument();
      expect(mockCreateBudget).not.toHaveBeenCalled();
    });
  });

  it('should not save a budget with an end date before the start date', async () => {
    setup({
      categoryIds: [1],
      categoriesError: '',
      startDate: new Date('2026-12-01T00:00:00.000Z'),
      endDate: new Date('2026-01-01T00:00:00.000Z'),
    });
    fillRequiredBudgetFields();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(screen.getByText(i18nEn.translation.endDateMustBeAfterStartDate)).toBeInTheDocument();
      expect(mockCreateBudget).not.toHaveBeenCalled();
    });
  });

  it('should save selected child categories and selected budget type', async () => {
    mockCreateBudget.mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });
    setup({}, [uncategorizedCategory, childCategory, parentCategory]);
    fillRequiredBudgetFields();

    openSelect(i18nEn.translation.type);
    fireEvent.click(screen.getByRole('option', { name: BUDGET_TYPES.MONTHLY }));
    openSelect(i18nEn.translation.budgetCategories);
    fireEvent.click(screen.getByRole('option', { name: 'Food - Groceries' }));
    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget, hidden: true }));

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: [2],
          type: BUDGET_TYPES.MONTHLY,
        }),
      );
    });
  });

  it('should sort category options and convert selected category values', () => {
    expect(formatCategories([
      parentCategory,
      { id: 3, name: 'Utilities', userId: 1, parentCategoryId: 1 },
      childCategory,
    ])).toEqual([
      { id: 2, label: 'Food - Groceries' },
      { id: 3, label: 'Food - Utilities' },
    ]);

    expect(toCategoryIds('2,3')).toEqual([2, 3]);
    expect(toCategoryIds(['4', 5])).toEqual([4, 5]);
  });

  it('should update start and end dates from the date pickers', async () => {
    mockCreateBudget.mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });
    setup({ categoryIds: [1], categoriesError: '' });
    fillRequiredBudgetFields();

    fireEvent.change(screen.getAllByLabelText(i18nEn.translation.start)[1], {
      target: { value: '02/26' },
    });
    fireEvent.change(screen.getAllByLabelText(i18nEn.translation.end)[1], {
      target: { value: '03/26' },
    });
    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalled();
    });
  });

  it('should update an existing budget and show failure feedback when the mutation fails', async () => {
    mockUpdateBudget.mockReturnValue({ unwrap: () => Promise.reject(new Error('fail')) });
    setup({
      id: 10,
      name: 'Existing budget',
      value: 100,
      categoryIds: [2],
      categoriesError: '',
    }, [parentCategory, childCategory]);

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(mockUpdateBudget).toHaveBeenCalledWith(expect.objectContaining({ id: 10 }));
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        i18nEn.translation.budgetCreationFailed,
        { variant: 'error' },
      );
    });
  });

  it('should render type and date validation helper text from the form state', () => {
    setup({
      typeError: 'typeRequired',
      startDate: null,
      startDateError: 'startDateRequired',
      endDate: null,
      endDateError: 'endDateRequired',
    });

    expect(screen.getByText(i18nEn.translation.typeRequired)).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.startDateRequired)).toBeInTheDocument();
    expect(screen.getByText(i18nEn.translation.endDateRequired)).toBeInTheDocument();
  });
});

describe('budgetFormReducer', () => {
  it('should validate direct reducer actions and preserve unknown actions', () => {
    const invalidNameState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_NAME,
      payload: 'Invalid@Name',
    });
    const nullValueState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_VALUE,
      payload: null,
    });
    const missingStartState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_START_DATE,
      payload: null,
    });
    const missingEndState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_END_DATE,
      payload: null,
    });
    const missingTypeState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_TYPE,
      payload: null as unknown as BUDGET_TYPES,
    });
    const undefinedTypeState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_TYPE,
      payload: undefined as unknown as BUDGET_TYPES,
    });
    const invalidTypeState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_TYPE,
      payload: 'invalid' as BUDGET_TYPES,
    });
    const emptyCategoriesState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.SET_CATEGORY_IDS,
      payload: [],
    });
    const unknownState = budgetFormReducer(initialBudgetFormState, {
      type: 'unknown' as BudgetFormActionType,
    } as never);

    expect(invalidNameState.nameError).toBe('nameInvalid');
    expect(nullValueState.valueError).toBe('valueRequired');
    expect(missingStartState.startDateError).toBe('startDateRequired');
    expect(missingEndState.endDateError).toBe('endDateRequired');
    expect(missingTypeState.typeError).toBe('typeInvalid');
    expect(undefinedTypeState.typeError).toBe('typeInvalid');
    expect(invalidTypeState.typeError).toBe('typeInvalid');
    expect(emptyCategoriesState.categoriesError).toBe('budgetCategoriesRequired');
    expect(unknownState).toBe(initialBudgetFormState);
  });

  it('should derive category ids when editing hydrated budgets', () => {
    const editedState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.EDIT,
      payload: {
        id: 1,
        name: 'Hydrated budget',
        value: 200,
        type: BUDGET_TYPES.MONTHLY,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-02-01'),
        userId: 1,
        categories: [
          { id: 4, name: 'Bills', userId: 1 },
          { name: 'No id', userId: 1 },
        ],
      },
    });
    const emptyCategoriesState = budgetFormReducer(initialBudgetFormState, {
      type: BudgetFormActionType.EDIT,
      payload: {
        id: 2,
        name: 'Empty categories',
        value: 100,
        type: BUDGET_TYPES.MONTHLY,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-02-01'),
        userId: 1,
      },
    });

    expect(editedState.categoryIds).toEqual([4]);
    expect(editedState.categoriesError).toBe('');
    expect(emptyCategoriesState.categoryIds).toEqual([]);
    expect(emptyCategoriesState.categoriesError).toBe('budgetCategoriesRequired');
  });
});
