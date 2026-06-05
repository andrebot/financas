import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
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
  const showModalMock = jest.fn();
  const closeModalMock = jest.fn();
  const deleteBudgetMock = jest.fn();

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
      showModal: showModalMock,
      closeModal: closeModalMock,
    });
    (useListCategoriesQuery as jest.Mock).mockReturnValue({ data: [] });
    (useListBudgetsQuery as jest.Mock).mockReturnValue({ data: [createBudget()] });
    (useCreateBudgetMutation as jest.Mock).mockReturnValue([jest.fn()]);
    (useUpdateBudgetMutation as jest.Mock).mockReturnValue([jest.fn()]);
    (useDeleteBudgetMutation as jest.Mock).mockReturnValue([deleteBudgetMock]);
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

  it('should show the empty budget message when there are no budgets', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({ data: [] });

    setup();

    expect(screen.getByText(i18nEn.translation.noBudgets)).toBeInTheDocument();
  });

  it('should show hydrated category names in the budget table', () => {
    (useListBudgetsQuery as jest.Mock).mockReturnValue({
      data: [createBudget({ name: 'House', categories: [{ id: 2, name: 'Groceries', userId: 1 }] })],
    });

    setup();

    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('should delete a budget after confirmation', async () => {
    deleteBudgetMock.mockReturnValue({ unwrap: () => Promise.resolve() });
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));
    const modal = showModalMock.mock.calls[0][0];
    await modal.props.onConfirm();

    await waitFor(() => {
      expect(deleteBudgetMock).toHaveBeenCalledWith(1);
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        i18nEn.translation.budgetDeletedSuccessfully,
        { variant: 'success' },
      );
      expect(closeModalMock).toHaveBeenCalled();
    });
  });

  it('should show an error when budget deletion fails', async () => {
    deleteBudgetMock.mockReturnValue({ unwrap: () => Promise.reject(new Error('fail')) });
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));
    const modal = showModalMock.mock.calls[0][0];
    await modal.props.onConfirm();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(
        i18nEn.translation.budgetDeletedError,
        { variant: 'error' },
      );
      expect(closeModalMock).toHaveBeenCalled();
    });
  });

  it('should close the delete confirmation modal when cancellation is requested', () => {
    setup();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.delete }));
    const modal = showModalMock.mock.calls[0][0];
    modal.props.onCancel();

    expect(closeModalMock).toHaveBeenCalled();
  });

  it('should use empty lists while budget and category queries are loading', () => {
    (useListCategoriesQuery as jest.Mock).mockReturnValue({});
    (useListBudgetsQuery as jest.Mock).mockReturnValue({});

    setup();

    expect(screen.getByText(i18nEn.translation.noBudgets)).toBeInTheDocument();
  });
});
