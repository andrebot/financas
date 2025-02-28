import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '@testing-library/jest-dom';
import { useSnackbar } from 'notistack';
import { useDispatch } from 'react-redux';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import NavBar from '../../../../src/client/components/navBar';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useLogoutMutation } from '../../../../src/client/features/login';
import { clearAccessToken } from '../../../../src/client/features/authSlice';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/login', () => ({
  useLogoutMutation: jest.fn(),
}));

jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

describe('NavBar', () => {
  let logoutMutationMock = jest.fn();
  let navigateMock = jest.fn();
  let dispatchMock = jest.fn();
  let enqueueSnackbarMock = jest.fn();
  let setUserMock = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (useNavigate as jest.Mock).mockReturnValue(navigateMock);
    (useDispatch as jest.Mock).mockReturnValue(dispatchMock);
    (useLogoutMutation as jest.Mock).mockReturnValue([logoutMutationMock, { isLoading: false, isSuccess: false }]);
    (useSnackbar as jest.Mock).mockReturnValue({ enqueueSnackbar: enqueueSnackbarMock });
    (useAuth as jest.Mock).mockReturnValue({ user: { id: 1, firstName: 'John' }, setUser: setUserMock });
  });

  it('should render the component', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <NavBar />
      </I18nextProvider>
    );

    expect(screen.getByText('Financas')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'menu' }));

    expect(screen.getByText(`${i18nKeys.translation.hello}, John`)).toBeInTheDocument();
    expect(screen.getByText(i18nKeys.translation.transactions)).toBeInTheDocument();
    expect(screen.getByText(i18nKeys.translation.settings)).toBeInTheDocument();
    expect(screen.getByText(i18nKeys.translation.logout)).toBeInTheDocument();
  });

  it('should logout when the logout button is clicked', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <NavBar />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    fireEvent.click(screen.getByText(i18nKeys.translation.logout));

    await waitFor(() => {
      expect(logoutMutationMock).toHaveBeenCalled();
      expect(setUserMock).toHaveBeenCalledWith(undefined);
      expect(dispatchMock).toHaveBeenCalledWith(clearAccessToken());
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('should show internal error if the app fails at logout and log out anyway', async () => {
    logoutMutationMock.mockRejectedValue({
      error: {
        data: {
          error: 'Internal error',
        },  
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <NavBar />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    fireEvent.click(screen.getByText(i18nKeys.translation.logout));

    await waitFor(() => {
      expect(logoutMutationMock).toHaveBeenCalled();
      expect(enqueueSnackbarMock).toHaveBeenCalledWith(i18nKeys.translation.logoutFailed, { variant: 'error' });
      expect(setUserMock).toHaveBeenCalledWith(undefined);
      expect(dispatchMock).toHaveBeenCalledWith(clearAccessToken());
      expect(navigateMock).toHaveBeenCalledWith('/login');
    });
  });

  it('should go to the settings page when the settings button is clicked', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <NavBar />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: 'menu' }));
    fireEvent.click(screen.getByText(i18nKeys.translation.settings));

    expect(navigateMock).toHaveBeenCalledWith('/settings');
  });
});
