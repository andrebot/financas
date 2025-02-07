import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { CircularProgress } from '@mui/material';
import { useLoginMutation } from '../../features/login';
import { useAuth } from '../../hooks/authContext';
import {
  LoginImageContainer,
  LoginStyledWrapper,
  LoginPasswordField,
  LoginFormContainer,
  LoginContainer,
  LoginTextField,
  LoginMainDiv,
  LoginButton,
  LoginImage,
  ForgotLink,
} from './styledComponents';
import Money1 from '../../assets/monay1.png';
import Money2 from '../../assets/monay2.png';
import Money3 from '../../assets/monay3.png';

import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export default function Login(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { user, setUser, setAccessToken } = useAuth();

  /**
   * Redirects the user to the home page if they are already logged in.
   */
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user]);

  /**
   * Trigger the snack message for the errors.
   *
   * @param error - Error from login mutation
   */
  function handleError(error: FetchBaseQueryError | SerializedError) {
    if ('data' in error) {
      enqueueSnackbar((error.data as any).error, { variant: 'error' });
    } else {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Handle the login process.
   */
  async function handleLogin() {
    try {
      const response = await login({
        email,
        password,
      });

      if ('error' in response) {
        handleError(response.error);
      } else {
        setUser(response.data.user);
        setAccessToken(response.data.accessToken);
        enqueueSnackbar(t('loginSuccess'), { variant: 'success' });
      }
    } catch (error) {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Moves the user to the register page.
   */
  function handleRegister() {
    navigate('/register');
  }

  /**
   * Moves the user to the forgot password page.
   */
  function handleForgotPassword() {
    if (!isLoading) {
      navigate('/forgot-password');
    }
  }

  /**
   * Handles the enter key to login
   *
   * @param e - Keyboard event
   */
  function handleEnterKey(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter') {
      handleLogin();
    }
  }

  return (
    <LoginMainDiv>
      <LoginContainer>
        <LoginStyledWrapper>
          <LoginImageContainer>
            <LoginImage src={Money1} alt="Money1" />
            <LoginImage src={Money2} alt="Money2" />
            <LoginImage src={Money3} alt="Money3" />
          </LoginImageContainer>
          <div>
            <h1>{t('appName')}</h1>
            <h3>{t('welcomeMessage')}</h3>
          </div>
        </LoginStyledWrapper>
        <LoginFormContainer>
          <h1>{t('login')}</h1>
          <LoginTextField
            label={t('email')}
            variant="outlined"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleEnterKey}
          />
          <LoginPasswordField
            label={t('password')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleEnterKey}
          />
          <LoginButton aria-label="login" variant="contained" color="primary" disabled={isLoading} onClick={handleLogin}>
            {isLoading ? <CircularProgress size={20} color="inherit" /> : t('login')}
          </LoginButton>
          <LoginButton aria-label="register" variant="contained" color="secondary" disabled={isLoading} onClick={handleRegister}>
            {isLoading ? <CircularProgress size={20} color="inherit" /> : t('register')}
          </LoginButton>
          <p>
            <span>{t('forgotPassword')} </span>
            <ForgotLink onClick={handleForgotPassword}>
              {t('clickHere')}
            </ForgotLink>
          </p>
        </LoginFormContainer>
      </LoginContainer>
    </LoginMainDiv>
  );
}
