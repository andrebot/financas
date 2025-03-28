import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import RegisterPage from '../../../../src/client/pages/register/index';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useRegisterMutation } from '../../../../src/client/features/login';
import { getFormInputs, populateFormInputs, mockRegisterData } from './utils';

jest.mock('react-router-dom', () => ({
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
  useRegisterMutation: jest.fn(),
}));

describe('Register Component', () => {
  let mockNavigate = jest.fn();
  let mockRegisterMutation = jest.fn();
  let mockSetUser = jest.fn();
  let mockSetAccessToken = jest.fn();
  let mockDispatch = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useAuth as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
      setAccessToken: mockSetAccessToken,
    });
    (useRegisterMutation as jest.Mock).mockReturnValue([mockRegisterMutation, { isLoading: false, isSuccess: false }]);
    (useDispatch as unknown as jest.Mock).mockReturnValue(mockDispatch);
  });

  it('renders the Register form correctly', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );
    const { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();

    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput).toHaveAttribute('type', 'text');
    expect(firstNameInput).toHaveValue('');
    expect(lastNameInput).toBeInTheDocument();
    expect(lastNameInput).toHaveAttribute('type', 'text');
    expect(lastNameInput).toHaveValue('');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveValue('');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveValue('');
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    expect(confirmPasswordInput).toHaveValue('');
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  it('should render an error message when the password is not valid', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInputs[0], { target: { value: '12345678' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '12345678' } });
    expect(screen.getByText(i18nKeys.translation.passwordInvalid)).toBeInTheDocument();
  });

  it('should render an error message when the password do not match', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );
    const passwordInputs = screen.getAllByLabelText(/password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

    fireEvent.change(passwordInputs[0], { target: { value: '12345678' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456789' } });
    expect(screen.getByText(i18nKeys.translation.passwordsDoNotMatch)).toBeInTheDocument();
  });

  it('should successfully register a user', async () => {
    mockRegisterMutation.mockResolvedValue({
      data: {
        user: {
          id: '1',
          email: 'john.doe@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
        accessToken: '1234567890',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );

    const { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();

    await populateFormInputs({ firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(mockRegisterMutation).toHaveBeenCalledWith({
        firstName: mockRegisterData.firstName,
        lastName: mockRegisterData.lastName,
        email: mockRegisterData.email,
        password: mockRegisterData.password,
      });
    });

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.registerSuccess, { variant: 'success' });
      expect(mockSetUser).toHaveBeenCalled();
    });
  });
  
  it('should render an error when there is an error in app while registering the user', async () => {
    mockRegisterMutation.mockRejectedValue({
      error: {
        data: {
          message: 'Error registering user',
        },
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );

    const { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();

    await populateFormInputs({ firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should render error when user tries to register with invalid information', async () => {
    const wrongEmail = 'wrong-email';
    const wrongPassword = 'wrong-password';

    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledTimes(1);
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
    });

    const { firstNameInput, lastNameInput, emailInput, passwordInput } = getFormInputs();

    fireEvent.change(firstNameInput, { target: { value: mockRegisterData.firstName } });
    fireEvent.change(lastNameInput, { target: { value: mockRegisterData.lastName } });
    fireEvent.change(emailInput, { target: { value: wrongEmail } });

    await waitFor(() => {
      expect(firstNameInput).toHaveValue(mockRegisterData.firstName);
      expect(lastNameInput).toHaveValue(mockRegisterData.lastName);
      expect(emailInput).toHaveValue(wrongEmail);
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledTimes(2);
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
    });

    fireEvent.change(emailInput, { target: { value: mockRegisterData.email } });
    fireEvent.change(passwordInput, { target: { value: wrongPassword } });

    await waitFor(() => {
      expect(emailInput).toHaveValue(mockRegisterData.email);
      expect(passwordInput).toHaveValue(wrongPassword);
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledTimes(3);
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
    });

    fireEvent.change(passwordInput, { target: { value: mockRegisterData.password } });

    await waitFor(() => {
      expect(passwordInput).toHaveValue(mockRegisterData.password);
    });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledTimes(4);
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
    });
  });

  it('should render an error when there is a handled error in server while registering the user', async () => {
    mockRegisterMutation.mockResolvedValue({
      error: {
        data: {
          error: 'unknownError',
        },
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );
    
    const { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();

    await populateFormInputs({ firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.unknownError, { variant: 'error' });
    });
  });

  it('should render the default error when there is a unhandled error in server while registering the user', async () => {
    mockRegisterMutation.mockResolvedValue({
      error: {
        message: 'unknownError',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );
    
    const { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();

    await populateFormInputs({ firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should render an error if the resgister response is empty', async () => {
    mockRegisterMutation.mockResolvedValue({});

    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );

    const { firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();

    await populateFormInputs({ firstNameInput, lastNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should render an error when the first name is not valid', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );

    const { lastNameInput, firstNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();
    const registerButton = screen.getByRole('button', { name: /register/i });
    await populateFormInputs({ lastNameInput, firstNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.change(firstNameInput, { target: { value: '1234567890' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(firstNameInput).toHaveValue('1234567890');
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
      expect(screen.getByText(i18nKeys.translation.nameInvalid)).toBeInTheDocument();
    });

    fireEvent.change(firstNameInput, { target: { value: '' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(firstNameInput).toHaveValue('');
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
      expect(screen.getByText(i18nKeys.translation.firstNameRequired)).toBeInTheDocument();
    });
  });

  it('should render an error when the last name is not valid', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <RegisterPage />
      </I18nextProvider>
    );

    const { lastNameInput, firstNameInput, emailInput, passwordInput, confirmPasswordInput } = getFormInputs();
    const registerButton = screen.getByRole('button', { name: /register/i });
    await populateFormInputs({ lastNameInput, firstNameInput, emailInput, passwordInput, confirmPasswordInput });

    fireEvent.change(lastNameInput, { target: { value: '1234567890' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(lastNameInput).toHaveValue('1234567890');
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
      expect(screen.getByText(i18nKeys.translation.nameInvalid)).toBeInTheDocument();
    });

    fireEvent.change(lastNameInput, { target: { value: '' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(lastNameInput).toHaveValue('');
      expect(enqueueSnackbar).toHaveBeenCalledWith(i18nKeys.translation.reviewDataProvided, { variant: 'error' });
      expect(screen.getByText(i18nKeys.translation.lastNameRequired)).toBeInTheDocument();
    });
  });

  it('should disable and show loading spinner if the register is in progress', async () => {
    (useRegisterMutation as jest.Mock).mockReturnValue([mockRegisterMutation, { isLoading: true, isSuccess: false }]);

    render(<I18nextProvider i18n={i18n}><RegisterPage /></I18nextProvider>);

    const registerButton = screen.getByRole('button', { name: /register/i });

    expect(registerButton).toBeDisabled();
  });
});
