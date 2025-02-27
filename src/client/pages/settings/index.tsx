import React, { useState, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { useSnackbar } from 'notistack';
import { useAuth } from '../../hooks/authContext';
import {
  HorizontalContainer,
  SettingsMain,
  SettingsSection,
  TextFieldStyled,
  InfoButton,
  ChangePasswordButton,
} from './styledComponents';
import { useUpdateUserMutation } from '../../features/login';
import { regExpEmail } from '../../utils/validators';
import { reducer, initialState, ActionType } from './reducer';
import { useModal } from '../../components/modal/modal';
import ChangePasswordModal from './changePasswordModal';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

const {
  SET_EMAIL_ERROR,
  SET_FIRST_NAME_ERROR,
  SET_LAST_NAME_ERROR,
  SET_PROPERTY,
  SET_IS_DIRTY,
  RESET_STATE,
} = ActionType;

export default function Settings(): React.JSX.Element {
  const { t } = useTranslation();
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
  } as typeof initialState);
  const { showModal } = useModal();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const validatorMap = {
    email: validateEmail,
    firstName: (value: string) => validateName(value, 'firstNameRequired', SET_FIRST_NAME_ERROR),
    lastName: (value: string) => validateName(value, 'lastNameRequired', SET_LAST_NAME_ERROR),
  };

  /**
   * Validates the email field.
   * 
   * @param email - The email value.
   * @returns true if the email is valid, false otherwise.
   */
  function validateEmail(email: string) {
    if (!regExpEmail.test(email)) {
      dispatch({ type: SET_EMAIL_ERROR, payload: t('emailInvalid') });
      return false;
    }

    return true;
  }

  /**
   * Validates the name field.
   * 
   * @param name - The name value.
   * @param key - The key of the error action.
   * @param errorAction - The error action.
   */
  function validateName(
    name: string,
    key: string,
    errorAction: ActionType.SET_FIRST_NAME_ERROR | ActionType.SET_LAST_NAME_ERROR,
  ) {
    if (name.length === 0) {
      dispatch({ type: errorAction, payload: t(key) });
      return false;
    }
    return true;
  }

  /**
   * Handles the change event for the input fields.
   * 
   * @remarks
   * This method expects the input fields to have a name attribute matching
   * the keys of the state object and the validatorMap object.
   * ValidatorMap is a map of the input field names to the validation functions.
   * 
   * @param e - The change event.
   */
  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const key = e.target.name;
    const value = e.target.value;
    const validator = validatorMap[key as keyof typeof validatorMap];

    if (validator) {
      validator(value);
    }

    dispatch({
      type: SET_PROPERTY,
      payload: { key, value },
    });
  }

  /**
   * Handles the cancel action. Resets the state to the initial state.
   */
  function handleCancel() {
    dispatch({
      type: RESET_STATE,
      payload: {
        firstName: user?.firstName!,
        lastName: user?.lastName!,
        email: user?.email!,
      },
    });
  }

  /**
   * Validates the form.
   * 
   * @returns true if the form is valid, false otherwise.
   */
  function validateForm() {
    return state.firstName && state.lastName && state.email && regExpEmail.test(state.email);
  }

  /**
   * Opens the change password modal.
   */
  function openChangePasswordModal() {
    showModal(<ChangePasswordModal />);
  }

  /**
   * Handles the save action. Validates the form and then updates the user in the state.
   * 
   * @remarks
   * If any error occurs, the error message is displayed using the enqueueSnackbar function.
   */
  async function handleSave() {
    if (!state.isDirty || !validateForm()) {
      return;
    }

    try {
      const updatedUser = {
        id: user?.id!,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
      };

      const result = await updateUser(updatedUser);

      if ('data' in result) {
        enqueueSnackbar(t('settingsUpdated'), { variant: 'success' });
        dispatch({ type: SET_IS_DIRTY, payload: false });
        setUser({
          ...user!,
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
        });
      } else {
        enqueueSnackbar(t('internalError'), { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  return (
    <SettingsMain>
      <SettingsSection elevation={3}>
        <Typography variant="h3">{t('settingInfoTitle')}</Typography>
        <HorizontalContainer>
          <TextFieldStyled
            label={t('name')}
            variant="outlined"
            value={state.firstName}
            name="firstName"
            onChange={handleFormChange}
            error={!!state.firstNameError}
            helperText={state.firstNameError}
          />
          <TextFieldStyled
            label={t('surname')}
            variant="outlined"
            value={state.lastName}
            name="lastName"
            onChange={handleFormChange}
            error={!!state.lastNameError}
            helperText={state.lastNameError}
          />
        </HorizontalContainer>
        <TextField
          fullWidth
          label={t('email')}
          variant="outlined"
          type="email"
          value={state.email}
          name="email"
          onChange={handleFormChange}
          error={!!state.emailError}
          helperText={state.emailError}
        />
        <ChangePasswordButton
          variant="contained"
          onClick={openChangePasswordModal}
        >
          {t('changePassword')}
        </ChangePasswordButton>
        <HorizontalContainer>
          <InfoButton
            variant="outlined"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {t('cancel')}
          </InfoButton>
          <InfoButton
            variant="contained"
            disabled={!state.isDirty || isLoading}
            onClick={handleSave}
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : t('save')}
          </InfoButton>
        </HorizontalContainer>
      </SettingsSection>
    </SettingsMain>
  );
}
