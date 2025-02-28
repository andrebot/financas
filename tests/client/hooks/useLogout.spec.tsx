import React from 'react';
import '@testing-library/jest-dom';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { render, screen, act, renderHook } from '@testing-library/react';
import { useAuth } from '../../../src/client/hooks/authContext';
import { useLogoutMutation } from '../../../src/client/features/login';
import useLogout from '../../../src/client/hooks/useLogout';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: jest.fn(),
}));

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
}));

jest.mock('../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../src/client/features/login', () => ({
  useLogoutMutation: jest.fn(),
}));

describe('useLogout', () => {
  let mockNavigate: jest.Mock;
  let mockEnqueueSnackbar: jest.Mock;
  let mockSetUser: jest.Mock;
  let mockLogout: jest.Mock;
  let mockDispatch: jest.Mock;
  let mockT: jest.Mock;

  beforeEach(() => {
    jest.resetAllMocks();

    mockNavigate = jest.fn();
    mockEnqueueSnackbar = jest.fn();
    mockSetUser = jest.fn();
    mockLogout = jest.fn();
    mockDispatch = jest.fn();
    mockT = jest.fn();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useSnackbar as jest.Mock).mockReturnValue({
      enqueueSnackbar: mockEnqueueSnackbar,
    });
    (useAuth as jest.Mock).mockReturnValue({
      setUser: mockSetUser,
    });
    (useLogoutMutation as jest.Mock).mockReturnValue([mockLogout, { isLoading: false }]);
    (useDispatch as jest.Mock).mockReturnValue(mockDispatch);
    (useTranslation as jest.Mock).mockReturnValue({
      t: mockT,
    });
  });

  it('should return the logout function and the isLoggingOut state', () => {
    const { result } = renderHook(() => useLogout());

    expect(result.current.handleLogout).toBeDefined();
    expect(result.current.isLoggingOut).toBe(false);
  });

  it('should call the logout mutation and logout the user', async () => {
    mockLogout.mockResolvedValue({ data: { message: 'Logout successful' } });

    const { result } = renderHook(() => useLogout());

    await result.current.handleLogout();

    expect(mockLogout).toHaveBeenCalled();
    expect(mockSetUser).toHaveBeenCalledWith(undefined);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should soft logout the user if we set to not call the logout mutation', async () => {
    const { result } = renderHook(() => useLogout());

    await result.current.handleLogout(false);

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockSetUser).toHaveBeenCalledWith(undefined);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should show an error if the logout mutation fails', async () => {
    mockLogout.mockRejectedValue(new Error('Logout failed'));
    mockT.mockReturnValue('Logout failed');

    const { result } = renderHook(() => useLogout());

    await result.current.handleLogout();

    expect(mockEnqueueSnackbar).toHaveBeenCalledWith('Logout failed', { variant: 'error' });
    expect(mockSetUser).toHaveBeenCalledWith(undefined);
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
