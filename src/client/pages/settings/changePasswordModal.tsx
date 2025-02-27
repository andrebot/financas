import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { ChangePasswordModalContainer, ChangePasswordModalTitle } from './styledComponents';
import { initialState, reducer, ActionType } from './changePasswordReducer';
import { regExpPassword } from '../../utils/validators';
import { useChangePasswordMutation } from '../../features/login';
import { useModal } from '../../components/modal/modal';
import CircularProgress from '@mui/material/CircularProgress';

const {
  SET_PROPERTY,
  SET_NEW_PASSWORD_ERROR,
  SET_CONFIRM_PASSWORD_ERROR,
} = ActionType;

export default function ChangePasswordModal() {
  const { t } = useTranslation();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const { enqueueSnackbar } = useSnackbar();
  const { closeModal } = useModal();
  const validatorMap = {
    newPassword: validateNewPassword,
    confirmPassword: validateConfirmPassword,
  };

  /**
   * Validates the new password field and updates the state.
   * 
   * @param newPassword - The new password value.
   */
  function validateNewPassword(newPassword: string) {
    if (!regExpPassword.test(newPassword)) {
      dispatch({ type: SET_NEW_PASSWORD_ERROR, payload: t('passwordInvalid') });
    } else if (newPassword === state.currentPassword) {
      dispatch({ type: SET_NEW_PASSWORD_ERROR, payload: t('passwordMustBeDifferent') });
    } else {
      dispatch({ type: SET_NEW_PASSWORD_ERROR, payload: '' });
    }
  }

  /**
   * Validates the confirm password field and updates the state.
   * 
   * @param confirmPassword - The confirm password value.
   */
  function validateConfirmPassword(confirmPassword: string) {
    if (confirmPassword !== state.newPassword) {
      dispatch({ type: SET_CONFIRM_PASSWORD_ERROR, payload: t('passwordsDoNotMatch') });
    } else {
      dispatch({ type: SET_CONFIRM_PASSWORD_ERROR, payload: '' });
    }
  }

  /**
   * Handles the change event for the input fields.
   * 
   * @remarks
   * This method expects the input fields to have a name attribute matching
   * the keys of the state object and the validationMap object.
   * ValidationMap is a map of the input field names to the validation functions.
   * 
   * @param e - The change event.
   */
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const key = e.target.name;
    const value = e.target.value;
    const validator = validatorMap[key as keyof typeof validatorMap];

    if (validator) {
      validator(value);
    }

    dispatch({ type: SET_PROPERTY, payload: { key, value } });
  }

  /**
   * Validates the form.
   * 
   * @returns true if the form is valid, false otherwise.
   */
  function validateForm() {
    return state.currentPassword &&
      state.newPassword &&
      state.confirmPassword &&
      state.newPassword === state.confirmPassword;
  }

  /**
   * Handles the change password action. Validates the form and then changes the password
   * by calling the changePassword endpoint.
   * 
   * @remarks
   * If any error occurs, the error message is displayed using the enqueueSnackbar function.
   */
  async function handleChangePassword() {
    if (!state.isDirty || !validateForm()) {
      validateConfirmPassword(state.confirmPassword);
      validateNewPassword(state.newPassword);

      return;
    }

    try {
      const result = await changePassword({
        oldPassword: state.currentPassword,
        newPassword: state.newPassword,
      });

      if ('data' in result) {
        enqueueSnackbar(t('passwordChangedSuccess'), { variant: 'success' });

        setTimeout(() => {
          closeModal();
        }, 1000);
      } else {
        enqueueSnackbar(t('internalError'), { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  return (
    <ChangePasswordModalContainer elevation={3}>
      <ChangePasswordModalTitle variant="h3">{t('changePassword')}</ChangePasswordModalTitle>
      <TextField
        fullWidth
        name="currentPassword"
        type="password"
        label={t('currentPassword')}
        onChange={handleChange}
      />
      <TextField
        fullWidth
        name="newPassword"
        type="password"
        label={t('newPassword')}
        onChange={handleChange}
        error={!!state.newPasswordError}
        helperText={state.newPasswordError}
      />
      <TextField
        fullWidth
        name="confirmPassword"
        type="password"
        label={t('confirmPassword')}
        onChange={handleChange}
        error={!!state.confirmPasswordError}
        helperText={state.confirmPasswordError}
      />
      <Button variant="contained"
        disabled={!state.isDirty || isLoading}
        onClick={handleChangePassword}
      >{isLoading ? <CircularProgress size={20} color="inherit" /> : t('changePassword')}</Button>
      <Button variant="outlined" onClick={closeModal}>{t('cancel')}</Button>
    </ChangePasswordModalContainer>
  );
}
