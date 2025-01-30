import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { TextField, Button } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/authContext';
import { useRegisterMutation } from '../../features/login';
import { RegisterMainDiv, RegisterContainer, RowInput, TextFieldStyled } from './styledComponents';
import { regExpEmail, regExpPassword } from '../../utils/validators';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export default function Register(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [passwordError, setPasswordError] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [register, { isLoading, isSuccess }] = useRegisterMutation();
  const { setUser, setAccessToken } = useAuth();

  /**
   * Checks if the password is valid every time the password is touched.
   */
  useEffect(() => {
    if (passwordTouched) {
      checkPasswordConfirmation();
      checkPasswordValidity();
    }
  }, [password, confirmPassword, passwordTouched]);

  /**
   * Checks if the email is valid every time the email is touched.
   */
  useEffect(() => {
    if (emailTouched) {
      checkEmailValidity();
    }
  }, [email, emailTouched]);

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
    return isEmailValid && isPasswordValid && isConfirmPasswordValid && email.length > 0 && password.length > 0 && confirmPassword.length > 0 && firstName.length > 0 && lastName.length > 0;
  }

  /**
   * Registers the user and sets the user and access token in the state.
   *
   * @param response - The response from the register mutation.
   */
  function registerUser(response: any) {
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
      setTimeout(() => {
        navigate('/');
      }, 2000);
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
      checkPasswordConfirmation();
      checkPasswordValidity();
      checkEmailValidity();
      enqueueSnackbar(t('reviewDataProvided'), { variant: 'error' });

      return;
    }

    try {
      const response = await register({ email, password, firstName, lastName });

      registerUser(response);
    } catch (error) {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Checks if the password is valid.
   */
  function checkPasswordValidity() {
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
   */
  function checkPasswordConfirmation() {
    if (password !== confirmPassword) {
      setIsConfirmPasswordValid(false);
      setConfirmPasswordError(t('passwordsDoNotMatch'));
    } else {
      setIsConfirmPasswordValid(true);
      setConfirmPasswordError('');
    }
  }

  /**
   * Checks if the email is valid.
   */
  function checkEmailValidity() {
    if (!regExpEmail.test(email)) {
      setIsEmailValid(false);
      setEmailError(t('emailInvalid'));
    } else {
      setIsEmailValid(true);
      setEmailError('');
    }
  }

  /**
   * Handles the event for the input change.
   *
   * @param setter - The setter for the input value.
   * @param touchedSetter - The setter for the input touched value.
   * @returns The event handler for the input change.
   */
  function handleEventForInputChange(setter: (value: string) => void, touchedSetter?: (value: boolean) => void) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);

      if (touchedSetter) {
        touchedSetter(true);
      }
    };
  }

  return (
    <RegisterMainDiv>
      <RegisterContainer>
        <h1>{t('register')}</h1>
        <RowInput>
          <TextFieldStyled
            label={t('firstName')}
            variant="outlined"
            type="text"
            value={firstName}
            onChange={handleEventForInputChange(setFirstName)}
          />
          <TextFieldStyled
            label={t('lastName')}
            variant="outlined"
            type="text"
            value={lastName}
            onChange={handleEventForInputChange(setLastName)}
          />
        </RowInput>
        <TextField
          error={!isEmailValid}
          helperText={emailError}
          label={t('email')}
          variant="outlined"
          type="email"
          value={email}
          onChange={handleEventForInputChange(setEmail, setEmailTouched)}
        />
        <TextField
          error={!isPasswordValid}
          helperText={passwordError}
          label={t('password')}
          variant="outlined"
          type="password"
          value={password}
          onChange={handleEventForInputChange(setPassword, setPasswordTouched)}
        />
        <TextField
          error={!isConfirmPasswordValid}
          helperText={confirmPasswordError}
          label={t('confirmPassword')}
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={handleEventForInputChange(setConfirmPassword)}
        />
        <Button variant="contained" color="primary" disabled={isLoading || isSuccess} onClick={handleRegister}>
          {isLoading || isSuccess ? <CircularProgress size={20} /> : t('register')}
        </Button>
      </RegisterContainer>
    </RegisterMainDiv>
  );
}
