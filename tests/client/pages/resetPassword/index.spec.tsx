import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import ResetPasswordPage from '../../../../src/client/pages/resetPassword/index';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useResetPasswordMutation } from '../../../../src/client/features/login';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/login', () => ({
  useResetPasswordMutation: jest.fn(),
}));

describe('ResetPassword Component', () => {
  let mockNavigate = jest.fn();
  let mockResetPasswordMutation = jest.fn();
  let mockSetUser = jest.fn();
  let mockSetAccessToken = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      setUser: mockSetUser,
      accessToken: null,
      setAccessToken: mockSetAccessToken,
    });

    (useResetPasswordMutation as jest.Mock).mockReturnValue([
      mockResetPasswordMutation,
      { isLoading: false, isSuccess: false },
    ]);
  });

  it('should render the component', () => {
    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);
    expect(screen.getAllByText(i18nKeys.translation.resetPasswordTitle)).toHaveLength(2);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('should handle the reset password mutation', async () => {
    mockResetPasswordMutation.mockResolvedValue({ data: { message: i18nKeys.translation.resetPasswordSuccess } });

    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));
    expect(mockResetPasswordMutation).toHaveBeenCalledWith({ email: 'test@test.com' });

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.resetPasswordSuccess, { variant: 'success' });
    });
  });

  it('should show the email message if the mutation is successful', async () => {
    (useResetPasswordMutation as jest.Mock).mockReturnValue([
      mockResetPasswordMutation,
      { isLoading: false, isSuccess: true },
    ]);

    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    expect(screen.getByText(i18nKeys.translation.waitForEmail)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nKeys.translation.backToLogin })).toBeInTheDocument();
  });

  it('should send the user back to the login page if the button is clicked', async () => {
    (useResetPasswordMutation as jest.Mock).mockReturnValue([
      mockResetPasswordMutation,
      { isLoading: false, isSuccess: true },
    ]);

    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    fireEvent.click(screen.getByRole('button', { name: i18nKeys.translation.backToLogin }));

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should disable the button when the mutation is loading', () => {
    (useResetPasswordMutation as jest.Mock).mockReturnValue([
      mockResetPasswordMutation,
      { isLoading: true, isSuccess: false },
    ]);

    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    expect(screen.getByRole('button', { name: i18nKeys.translation.resetPassword })).toBeDisabled();
  });

  it('should show the error message if the mutation fails', async () => {
    (mockResetPasswordMutation as jest.Mock).mockRejectedValue({
      error: {
        data: {
          message: 'Error registering user',
        },
      },
    });

    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should show internal error if the mutation fails in the server', async () => {
    (mockResetPasswordMutation as jest.Mock).mockResolvedValue({
      error: {
        data: {
          message: 'Error registering user',
        },
      },
    });

    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@test.com' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should show the email required error if the email is empty', async () => {
    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /reset password/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.emailRequired, { variant: 'error' });
    });

    expect(screen.getByText(i18nKeys.translation.emailRequired)).toBeInTheDocument();
  });

  it('should show the email invalid error if the email is invalid', async () => {
    render(<I18nextProvider i18n={i18n}><ResetPasswordPage /></I18nextProvider>);

    const emailInput = screen.getByLabelText(/email/i);

    fireEvent.change(emailInput, { target: { value: 'a' } });
    fireEvent.change(emailInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.getByText(i18nKeys.translation.emailRequired)).toBeInTheDocument();
    });
  });
});
