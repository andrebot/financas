import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import i18n from '../../../../src/client/i18n';
import i18nEn from '../../../../src/client/i18n/en';
import BudgetPage from '../../../../src/client/pages/budget';
import { BUDGET_TYPES } from '../../../../src/client/enums';
import { useListCategoriesQuery } from '../../../../src/client/features/category';
import {
  useCreateBudgetMutation,
  useDeleteBudgetMutation,
  useListBudgetsQuery,
  useUpdateBudgetMutation,
} from '../../../../src/client/features/budget';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useModal } from '../../../../src/client/components/modal/modal';
import type { Budget } from '../../../../src/client/types';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../src/client/features/category', () => ({
  useListCategoriesQuery: jest.fn(),
}));

jest.mock('../../../../src/client/features/budget', () => ({
  useCreateBudgetMutation: jest.fn(),
  useUpdateBudgetMutation: jest.fn(),
  useDeleteBudgetMutation: jest.fn(),
  useListBudgetsQuery: jest.fn(),
}));

/**
 * Creates a budget fixture for budget page component tests.
 *
 * @param overrides - Optional budget fields to override.
 * @returns A complete budget object.
 */
function createBudget(overrides: Partial<Budget> = {}): Budget {
  return {
    id: 1,
    name: 'Groceries',
    value: 500,
    type: BUDGET_TYPES.MONTHLY,
    startDate: new Date('2026-01-01'),
    endDate: new Date('2026-01-31'),
    categoryIds: [1],
    userId: 1,
    ...overrides,
  };
}

describe('BudgetPage', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      user: {
        id: '1',
        email: 'test@test.com',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      },
    });
    (useModal as jest.Mock).mockReturnValue({
      showModal: jest.fn(),
      closeModal: jest.fn(),
    });
    (useListCategoriesQuery as jest.Mock).mockReturnValue({ data: [] });
    (useListBudgetsQuery as jest.Mock).mockReturnValue({ data: [createBudget()] });
    (useCreateBudgetMutation as jest.Mock).mockReturnValue([jest.fn()]);
    (useUpdateBudgetMutation as jest.Mock).mockReturnValue([jest.fn()]);
    (useDeleteBudgetMutation as jest.Mock).mockReturnValue([jest.fn()]);
  });

  /**
   * Renders the budget page with the providers used by form controls.
   */
  const setup = (): void => {
    render(
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <I18nextProvider i18n={i18n}>
          <BudgetPage />
        </I18nextProvider>
      </LocalizationProvider>,
    );
  };

  it('should clear the budget form when Deselect is clicked after editing', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.edit }));

    expect((screen.getByLabelText(i18nEn.translation.budgetName) as HTMLInputElement).value).toBe('Groceries');
    expect(screen.getByRole('button', { name: i18nEn.translation.deselect })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.deselect }));

    expect((screen.getByLabelText(i18nEn.translation.budgetName) as HTMLInputElement).value).toBe('');
    expect(screen.getByRole('button', { name: i18nEn.translation.edit })).toBeInTheDocument();
  });
});
