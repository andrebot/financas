import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { useSnackbar } from 'notistack';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import ConfirmDeleteAccountModal from '../../../../src/client/pages/settings/confirmDeleteAccountModal';
import { useDeleteAccountMutation } from '../../../../src/client/features/login';
import { useModal } from '../../../../src/client/components/modal/modal';
import { useAuth } from '../../../../src/client/hooks/authContext';

jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/login', () => ({
  useDeleteAccountMutation: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

describe('ConfirmDeleteAccountModal', () => {
  let mockDeleteAccountMutation = jest.fn();
  let mockSnackbar = jest.fn();
  let mockCloseModal = jest.fn();
  let mockHandleLogout = jest.fn();
  let mockUser = {
    id: '1',
    email: 'test@test.com',
    firstName: 'test',
    lastName: 'test',
  };

  beforeEach(() => {
    jest.resetAllMocks();

    (useDeleteAccountMutation as jest.Mock).mockReturnValue([mockDeleteAccountMutation, {}]);
    (useSnackbar as jest.Mock).mockReturnValue({
      enqueueSnackbar: mockSnackbar,
    });
    (useModal as jest.Mock).mockReturnValue({
      closeModal: mockCloseModal,
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  it('should render the modal', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ConfirmDeleteAccountModal handleLogout={mockHandleLogout} />
      </I18nextProvider>
    );

    expect(screen.getByText(i18nKeys.translation.confirmDeleteAccountTitle)).toBeInTheDocument();
    expect(screen.getByText(i18nKeys.translation.confirmDeleteAccountDescription)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nKeys.translation.cancel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nKeys.translation.delete })).toBeInTheDocument();
  });

  it('should handle the delete account action', async () => {
    mockDeleteAccountMutation.mockResolvedValue({
      data: {
        message: 'Account deleted successfully',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <ConfirmDeleteAccountModal handleLogout={mockHandleLogout} />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: i18nKeys.translation.delete }));

    await waitFor(() => {
      expect(mockDeleteAccountMutation).toHaveBeenCalledWith(mockUser.id);
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.accountDeleted, { variant: 'success' });
      expect(mockHandleLogout).toHaveBeenCalledWith(false);
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
  
  it('should show an error if the delete account mutation fails and logout the user', async () => {
    mockDeleteAccountMutation.mockRejectedValue(new Error('Failed to delete account'));

    render(
      <I18nextProvider i18n={i18n}>
        <ConfirmDeleteAccountModal handleLogout={mockHandleLogout} />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: i18nKeys.translation.delete }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
      expect(mockHandleLogout).toHaveBeenCalledWith(false);
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('should show an error if the delete account mutation fails on the server and logout the user', async () => {
    mockDeleteAccountMutation.mockResolvedValue({
      error: {
        message: 'Failed to delete account',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <ConfirmDeleteAccountModal handleLogout={mockHandleLogout} />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: i18nKeys.translation.delete }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
      expect(mockHandleLogout).toHaveBeenCalledWith(false);
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });
});
