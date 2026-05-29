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
import { useCreateBudgetMutation } from '../../../../src/client/features/budget';

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/budget', () => ({
  useCreateBudgetMutation: jest.fn(),
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
  });

  const budgetFormJSX = (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <I18nextProvider i18n={i18n}>
        <BudgetForm categories={[]} />
      </I18nextProvider>
    </LocalizationProvider>
  );

  const setup = () => render(budgetFormJSX);

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

  it('should send userId when saving a budget', async () => {
    mockCreateBudget.mockReturnValue({ unwrap: () => Promise.resolve({ id: 1 }) });

    setup();
    fillRequiredBudgetFields();

    fireEvent.click(screen.getByRole('button', { name: i18nEn.translation.saveBudget }));

    await waitFor(() => {
      expect(mockCreateBudget).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Monthly groceries',
          value: 1000,
          userId: Number(mockUser.id),
        }),
      );
    });
  });
});
