import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import BudgetForm from '../../../../src/client/pages/budget/budgetForm';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '../../../../src/client/features/budget';
import { budgetFormReducer, initialBudgetFormState } from '../../../../src/client/pages/budget/budgetFormReducer';


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
      jest.fn(),
      { isError: false, isSuccess: false },
    ]);
  });

  /**
   * Renders the budget form with reducer-backed state for interaction tests.
   *
   * @param initialStateOverride - Initial reducer state fields to override.
   */
  const setup = (initialStateOverride = {}) => {
    const TestWrapper = () => {
      const [budgetFormState, budgetFormDispatch] = React.useReducer(
        budgetFormReducer,
        { ...initialBudgetFormState, ...initialStateOverride },
      );
      return (
        <BudgetForm
          categories={[]}
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
});
