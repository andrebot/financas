import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { CircularProgress } from '@mui/material';
import PasswordField from '../../components/form/passwordField';
import { useAuth } from '../../hooks/authContext';
import { useRegisterMutation } from '../../features/login';
import { RegisterMainDiv, RegisterContainer, RowInput, TextFieldStyled } from './styledComponents';
import { regExpEmail, regExpPassword, regExpName } from '../../utils/validators';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export default function Register(): React.JSX.Element {
  const { t } = useTranslation();
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [isFirstNameValid, setIsFirstNameValid] = useState(true);
  const [firstNameError, setFirstNameError] = useState('');
  const [isLastNameValid, setIsLastNameValid] = useState(true);
  const [lastNameError, setLastNameError] = useState('');
  const [register, { isLoading, isSuccess }] = useRegisterMutation();
  const { setUser, setAccessToken } = useAuth();

  /**
   * Handles the error when the register fails, mainly for sending the error
   * message to the user through the toast messages.
   *
   * @param error - The error from the register mutation.
   */
  function handleError(error: FetchBaseQueryError | SerializedError) {
    if ('data' in error) {
      enqueueSnackbar(t((error.data as any).error), { variant: 'error' });
    } else {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Checks if the form is valid.
   *
   * @returns True if the form is valid, false otherwise.
   */
  function isFormValid(): boolean {
    return registerData.email.length > 0 &&
      registerData.password.length > 0 &&
      registerData.confirmPassword.length > 0 &&
      registerData.firstName.length > 0 &&
      registerData.lastName.length > 0 &&
      isEmailValid &&
      isPasswordValid &&
      isConfirmPasswordValid &&
      isFirstNameValid &&
      isLastNameValid;
  }

  /**
   * Registers the user and sets the user and access token in the state.
   *
   * @param response - The response from the register mutation.
   */
  function updateAppWithUser(response: any) {
    if ('data' in response) {
      const {
        user: {
          email,
          firstName,
          lastName,
          role,
          id,
        },
        accessToken,
      } = response.data;

      setUser({ email, firstName, lastName, role, id });
      setAccessToken(accessToken);
      enqueueSnackbar(t('registerSuccess'), { variant: 'success' });
    } else if ('error' in response) {
      handleError(response.error);
    } else {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Handles the register action, mainly for validating the data and sending
   * the data to the server.
   */
  async function handleRegister() {
    if (!isFormValid()) {
      checkPasswordConfirmation(registerData.confirmPassword);
      checkPasswordValidity(registerData.password);
      checkEmailValidity(registerData.email);
      checkFirstNameValidity(registerData.firstName);
      checkLastNameValidity(registerData.lastName);
      enqueueSnackbar(t('reviewDataProvided'), { variant: 'error' });

      return;
    }

    try {
      const { confirmPassword, ...formData } = registerData;
      const response = await register(formData);

      updateAppWithUser(response);
    } catch (error) {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Checks if the password is valid.
   * 
   * @param password - The password to check.
   */
  function checkPasswordValidity(password: string) {
    if (!regExpPassword.test(password)) {
      setIsPasswordValid(false);
      setPasswordError(t('passwordInvalid'));
    } else {
      setIsPasswordValid(true);
      setPasswordError('');
    }
  }

  /**
   * Checks if the password confirmation is valid.
   * 
   * @param confirmPassword - The password confirmation to check.
   */
  function checkPasswordConfirmation(confirmPassword: string) {
    if (registerData.password !== confirmPassword) {
      setIsConfirmPasswordValid(false);
      setConfirmPasswordError(t('passwordsDoNotMatch'));
    } else {
      setIsConfirmPasswordValid(true);
      setConfirmPasswordError('');
    }
  }

  /**
   * Checks if the email is valid.
   * 
   * @param email - The email to check.
   */
  function checkEmailValidity(email: string) {
    if (!regExpEmail.test(email)) {
      setIsEmailValid(false);
      setEmailError(t('emailInvalid'));
    } else {
      setIsEmailValid(true);
      setEmailError('');
    }
  }

  /**
   * Checks if the first name is valid.
   * 
   * @param firstName - The first name to check.
   */
  function checkFirstNameValidity(firstName: string) {
    if (firstName.length === 0) {
      setIsFirstNameValid(false);
      setFirstNameError(t('firstNameRequired'));
    } else if (!regExpName.test(firstName)) {
      setIsFirstNameValid(false);
      setFirstNameError(t('nameInvalid'));
    } else {
      setIsFirstNameValid(true);
      setFirstNameError('');
    }
  }

  /**
   * Checks if the last name is valid.
   * 
   * @param lastName - The last name to check.
   */
  function checkLastNameValidity(lastName: string) {
    if (lastName.length === 0) {
      setIsLastNameValid(false);
      setLastNameError(t('lastNameRequired'));
    } else if (!regExpName.test(lastName)) {
      setIsLastNameValid(false);
      setLastNameError(t('nameInvalid'));
    } else {
      setIsLastNameValid(true);
      setLastNameError('');
    }
  }

  /**
   * Handles the event for the input change.
   *
   * @param attribute - The attribute to check.
   * @param checkValidity - The validity check function.
   * 
   * @returns The event handler for the input change.
   */
  function handleEventForInputChange(attribute: keyof typeof registerData, checkValidity?: (value: string) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setRegisterData({ ...registerData, [attribute]: event.target.value });

      if (checkValidity) {
        checkValidity(event.target.value);
      }
    };
  }

  return (
    <RegisterMainDiv>
      <RegisterContainer>
        <h1>{t('register')}</h1>
        <RowInput>
          <TextFieldStyled
            error={!isFirstNameValid}
            helperText={firstNameError}
            label={t('firstName')}
            variant="outlined"
            type="text"
            value={registerData.firstName}
            onChange={handleEventForInputChange('firstName', checkFirstNameValidity)}
          />
          <TextFieldStyled
            error={!isLastNameValid}
            helperText={lastNameError}
            label={t('lastName')}
            variant="outlined"
            type="text"
            value={registerData.lastName}
            onChange={handleEventForInputChange('lastName', checkLastNameValidity)}
          />
        </RowInput>
        <TextField
          error={!isEmailValid}
          helperText={emailError}
          label={t('email')}
          variant="outlined"
          type="email"
          value={registerData.email}
          onChange={handleEventForInputChange('email', checkEmailValidity)}
        />
        <PasswordField
          error={!isPasswordValid}
          helperText={passwordError}
          label={t('password')}
          value={registerData.password}
          onChange={handleEventForInputChange('password', checkPasswordValidity)}
        />
        <PasswordField
          error={!isConfirmPasswordValid}
          helperText={confirmPasswordError}
          label={t('confirmPassword')}
          value={registerData.confirmPassword}
          onChange={handleEventForInputChange('confirmPassword', checkPasswordConfirmation)}
        />
        <Button aria-label="register" variant="contained" color="primary" disabled={isLoading || isSuccess} onClick={handleRegister}>
          {isLoading || isSuccess ? <CircularProgress size={20} /> : t('register')}
        </Button>
      </RegisterContainer>
    </RegisterMainDiv>
  );
}
