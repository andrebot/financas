import React from 'react';
import '@testing-library/jest-dom';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import i18n from '../../../../src/client/i18n';
import i18nKeys from '../../../../src/client/i18n/en';
import SettingsPage from '../../../../src/client/pages/settings/index';
import { useAuth } from '../../../../src/client/hooks/authContext';
import { useModal } from '../../../../src/client/components/modal/modal';
import { useUpdateUserMutation, useChangePasswordMutation } from '../../../../src/client/features/login';
import { fillUpSettingsForm } from './utils';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('notistack', () => ({
  useSnackbar: jest.fn(),
}));

jest.mock('../../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../../../../src/client/features/login', () => ({
  useUpdateUserMutation: jest.fn(),
  useChangePasswordMutation: jest.fn(),
}));

jest.mock('../../../../src/client/components/modal/modal', () => ({
  useModal: jest.fn(),
}));

describe('SettingsPage', () => {
  let mockNavigate = jest.fn();
  let mockUpdateUserMutation = jest.fn();
  let mockChangePasswordMutation = jest.fn();
  let mockSnackbar = jest.fn();
  let mockSetUser = jest.fn();
  let mockShowModal = jest.fn();
  let mockUser = {
    id: '1',
    email: 'test@test.com',
    firstName: 'test',
    lastName: 'test',
  };  

  beforeEach(() => {
    mockNavigate.mockReset();
    mockUpdateUserMutation.mockReset();
    mockChangePasswordMutation.mockReset();
    mockSetUser.mockReset();

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useUpdateUserMutation as jest.Mock).mockReturnValue([mockUpdateUserMutation, {}]);
    (useChangePasswordMutation as jest.Mock).mockReturnValue([mockChangePasswordMutation, {}]);
    (useModal as jest.Mock).mockReturnValue({
      showModal: mockShowModal,
    });
    (useSnackbar as jest.Mock).mockReturnValue({
      enqueueSnackbar: mockSnackbar,
    });
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      setUser: mockSetUser,
    });
  });

  it('should render the settings page', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    expect(screen.getByText(i18nKeys.translation.settingInfoTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nKeys.translation.firstName)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nKeys.translation.lastName)).toBeInTheDocument();
    expect(screen.getByLabelText(i18nKeys.translation.email)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nKeys.translation.cancel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: i18nKeys.translation.changePassword })).toBeInTheDocument();
  });
  
  it('should be able to update user info', async () => {
    mockUpdateUserMutation.mockResolvedValue({
      data: {
        id: mockUser.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm();

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateUserMutation).toHaveBeenCalledWith({
        id: mockUser.id,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });

      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.settingsUpdated, {
        variant: 'success',
      });

      expect(mockSetUser).toHaveBeenCalledWith({
        ...mockUser,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
      });
    });
  });

  it('should show an error if the server returns an error', async () => {
    mockUpdateUserMutation.mockResolvedValue({
      error: {
        data: {
          message: 'Error updating user',
        },
      },
    });

    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm();
    
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, {
        variant: 'error',
      });
    });
  });

  it('should show an error if the client throws an error', async () => {
    mockUpdateUserMutation.mockRejectedValue(new Error('Error updating user'));

    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm();

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockSnackbar).toHaveBeenCalledWith(i18nKeys.translation.internalError, {
        variant: 'error',
      });
    });
  });

  it('should not be able to save if the email is invalid', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm({
      ...mockUser,
      email: 'invalid-email',
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateUserMutation).not.toHaveBeenCalled();
    });
  });

  it('should not be able to save if the first name is invalid', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm({
      ...mockUser,
      firstName: '',
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateUserMutation).not.toHaveBeenCalled();
    });
  });
  
  it('should not be able to save if the last name is invalid', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm({
      ...mockUser,
      lastName: '',
    });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdateUserMutation).not.toHaveBeenCalled();
    });
  });

  it('should not be able to save if nothing is changed', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    const saveButton = screen.getByRole('button', { name: /save/i });

    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserMutation).not.toHaveBeenCalled();
      expect(saveButton).toBeDisabled();
    });
  });

  it('should reset the form when the cancel button is clicked', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fillUpSettingsForm();

    fireEvent.click(screen.getByRole('button', { name: i18nKeys.translation.cancel }));

    await waitFor(() => {
      expect(mockUpdateUserMutation).not.toHaveBeenCalled();
      expect(screen.getByLabelText(i18nKeys.translation.firstName)).toHaveValue(mockUser.firstName);
      expect(screen.getByLabelText(i18nKeys.translation.lastName)).toHaveValue(mockUser.lastName);
      expect(screen.getByLabelText(i18nKeys.translation.email)).toHaveValue(mockUser.email);
    });
  });

  it('should disable the save button if the form is loading', async () => {
    (useUpdateUserMutation as jest.Mock).mockReturnValue([mockUpdateUserMutation, { isLoading: true }]);
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    const saveButton = screen.getByRole('button', { name: /save/i });

    expect(saveButton).toBeDisabled();
  });

  it('should show the change password modal', async () => {
    render(
      <I18nextProvider i18n={i18n}>
        <SettingsPage />
      </I18nextProvider>
    );

    fireEvent.click(screen.getByRole('button', { name: i18nKeys.translation.changePassword }));

    await waitFor(() => {
      expect(mockShowModal).toHaveBeenCalled();
    });
  });
});
