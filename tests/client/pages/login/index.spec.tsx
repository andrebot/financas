import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
import { setAccessToken } from '../../../../src/client/features/authSlice';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import Login from '../../../../src/client/pages/login'; // Adjust the path as necessary
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useLoginMutation } from '../../../../src/client/features/login';
import { loginWithMockData, mockLoginData, mockPassword } from './util';
import type { UserType } from '../../../../src/client/types/user';

jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('notistack', () => ({
  enqueueSnackbar: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/login', () => ({
  useLoginMutation: jest.fn(),
}));

jest.mock('../../../../src/client/features/authSlice', () => ({
  setAccessToken: jest.fn(),
}));

describe('LoadingPage', () => {
  let unmount: () => void;
  let mockNavigate = jest.fn();
  let mockLoginMutation = jest.fn();
  let mockSetUser = jest.fn();
  let mockDispatch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
    });
    (useLoginMutation as jest.Mock).mockReturnValue([mockLoginMutation, { isLoading: false, isSuccess: false }]);
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);

    const { unmount: unmountLogin } = render(<I18nextProvider i18n={i18n}><Login /></I18nextProvider>);

    unmount = unmountLogin;
  });

  it('should navigate to the home page if the user is logged in', async () => {
    const mockAccessToken = '1234567890';

    mockLoginMutation.mockResolvedValue({
      data: {
        user: mockLoginData,
        accessToken: mockAccessToken,
      },
    });

    loginWithMockData();

    await waitFor(() => {
      expect(mockLoginMutation).toHaveBeenCalledWith({
        email: mockLoginData.email,
        password: mockPassword,
      });
      expect(mockSetUser).toHaveBeenCalledWith(mockLoginData as UserType);
      expect(mockDispatch).toHaveBeenCalled();
      expect(setAccessToken).toHaveBeenCalledWith(mockAccessToken);
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.loginSuccess, { variant: 'success' });
    });
  });

  it('should show internal error if the app fails at login', async () => {
    mockLoginMutation.mockRejectedValue({
      error: {
        data: {
          error: 'Internal error',
        },
      },
    });

    loginWithMockData();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should show server error if it is a handled server error', async () => {
    const errorMessage = 'Server error';

    mockLoginMutation.mockReturnValue({
      error: {
        data: {
          error: errorMessage,
        },
      },
    });

    loginWithMockData();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(errorMessage, { variant: 'error' });
    });
  });

  it('should show internal error if it is a unhandled server error', async () => {
    const errorMessage = 'Server error';

    mockLoginMutation.mockReturnValue({
      error: {
        error: errorMessage,
      },
    });

    loginWithMockData();

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should go to the register page if the user clicks on the register button', async () => {
    const registerButton = screen.getByRole('button', { name: /register/i });

    fireEvent.click(registerButton);

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });

  it('should go to the forgot password page if the user clicks on the forgot password button', async () => {
    const forgotPasswordLink = screen.getByText(/click here/i);

    expect(forgotPasswordLink).toBeInTheDocument();

    fireEvent.click(forgotPasswordLink);

    expect(mockNavigate).toHaveBeenCalledWith('/reset-password');
  });

  it('should trigger login when enter key is pressed on the password input', async () => {
    const passwordInput = screen.getAllByLabelText(/password/i)[0];

    fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

    expect(mockLoginMutation).toHaveBeenCalled();
  });

  it('should navigate to the home page if the user is already logged in', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockLoginData,
    });

    unmount();
    render(<I18nextProvider i18n={i18n}><Login /></I18nextProvider>);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should disable and show loading spinner if the login is in progress', async () => {
    (useLoginMutation as jest.Mock).mockReturnValue([mockLoginMutation, { isLoading: true, isSuccess: false }]);

    unmount();
    render(<I18nextProvider i18n={i18n}><Login /></I18nextProvider>);

    const loginButton = screen.getByRole('button', { name: /login/i });
    const registerButton = screen.getByRole('button', { name: /register/i });

    expect(loginButton).toBeDisabled();
    expect(registerButton).toBeDisabled();
  });
});
