import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { useSnackbar } from 'notistack';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import ChangePasswordModal from '../../../../src/client/pages/settings/changePasswordModal';
import { useChangePasswordMutation } from '../../../../src/client/features/login';
import { useModal } from '../../../../src/client/components/modal/modal';

jest.mock('react-router', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

jest.mock('../../../../src/client/features/login', () => ({
  useChangePasswordMutation: jest.fn(),
}));

describe('ChangePasswordModal', () => {
  let mockChangePasswordMutation = jest.fn();
  let mockSnackbar = jest.fn();
  let mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    (useChangePasswordMutation as jest.Mock).mockReturnValue([mockChangePasswordMutation, {}]);
    (useModal as jest.Mock).mockReturnValue({
      closeModal: mockCloseModal,
    });
    (useSnackbar as jest.Mock).mockReturnValue({
      enqueueSnackbar: mockSnackbar,
    });
  });

  it('should render the change password modal', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    expect(screen.getByRole('heading', { name: i18nKeys.translation.changePassword })).toBeInTheDocument();
    expect(screen.getByLabelText(i18nKeys.translation.newPassword)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nKeys.translation.confirmPassword)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /change-password-button/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nKeys.translation.cancel })).toBeInTheDocument();
  });

  it('should be able to change password', async () => {
    mockChangePasswordMutation.mockResolvedValue({
      data: {
        message: 'Password changed successfully',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.currentPassword), { target: { value: 'Maru-cjim90' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'Maru-cjim91' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.confirmPassword), { target: { value: 'Maru-cjim91' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    await waitFor(() => {
      expect(mockChangePasswordMutation).toHaveBeenCalled();
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.passwordChangedSuccess, { variant: 'success' });
    });

    await waitFor(() => {
      expect(mockCloseModal).toHaveBeenCalled();
    });
  });

  it('should not be able to change password if the new password is invalid', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.confirmPassword), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    expect(mockChangePasswordMutation).not.toHaveBeenCalled();
  });

  it('should not be able to change password if the confirm password is invalid', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'Maru-cjim90' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.confirmPassword), { target: { value: 'Maru-cjim91' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    expect(mockChangePasswordMutation).not.toHaveBeenCalled();
  });

  it('should not be able to change password if the new password is not confirmed', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'Maru-cjim90' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    expect(mockChangePasswordMutation).not.toHaveBeenCalled();
  });

  it('should not be able to change password if the new password is the same as the current password', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.currentPassword), { target: { value: 'Maru-cjim90' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'Maru-cjim90' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.confirmPassword), { target: { value: 'Maru-cjim90' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    expect(mockChangePasswordMutation).not.toHaveBeenCalled();
  });

  it('should show an error if there is a client error', async () => {
    mockChangePasswordMutation.mockRejectedValue({
      error: {
        message: 'Client error',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.currentPassword), { target: { value: 'Maru-cjim90' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'Maru-cjim91' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.confirmPassword), { target: { value: 'Maru-cjim91' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should show an error if there is a server error', async () => {
    mockChangePasswordMutation.mockResolvedValue({
      error: {
        message: 'Server error',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    fireEvent.change(screen.getByLabelText(i18nKeys.translation.currentPassword), { target: { value: 'Maru-cjim90' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.newPassword), { target: { value: 'Maru-cjim91' } });
    fireEvent.change(screen.getByLabelText(i18nKeys.translation.confirmPassword), { target: { value: 'Maru-cjim91' } });

    fireEvent.click(screen.getByRole('button', { name: /change-password-button/i }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, { variant: 'error' });
    });
  });

  it('should disable the change password button if the form is loading', () => {
    (useChangePasswordMutation as jest.Mock).mockReturnValue([mockChangePasswordMutation, { isLoading: true }]);

    render(
      <I18nextProvider i18n={i18n}>
        <ChangePasswordModal />
      </I18nextProvider>
    );

    expect(screen.getByRole('button', { name: /change-password-button/i })).toBeDisabled();
  });
});
