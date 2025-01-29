import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';
import { CircularProgress } from '@mui/material';
import { useLoginMutation } from '../../features/login';
import {
  LoginMainDiv,
  LoginContainer,
  LoginStyledWrapper,
  LoginImageContainer,
  LoginImage,
  LoginFormContainer,
  LoginButton,
  LoginTextField,
  ForgotLink,
} from './styledComponents';
import Money1 from '../../assets/monay1.png';
import Money2 from '../../assets/monay2.png';
import Money3 from '../../assets/monay3.png';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

export default function Login(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleError(error: FetchBaseQueryError | SerializedError) {
    if ('data' in error) {
      enqueueSnackbar((error.data as any).error, { variant: 'error' });
    } else {
      enqueueSnackbar(t('loginInternalError'), { variant: 'error' });
    }
  }

  async function handleLogin() {
    try {
      const response = await login({
        email,
        password,
      });

      if ('error' in response) {
        handleError(response.error);
      }
    } catch (error) {
      enqueueSnackbar(t('loginInternalError'), { variant: 'error' });
    }
  }

  function handleRegister() {
    navigate('/register');
  }

  function handleForgotPassword() {
    if (!isLoading) {
      navigate('/forgot-password');
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
          />
          <LoginTextField
            label={t('password')}
            variant="outlined"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <LoginButton variant="contained" color="primary" disabled={isLoading} onClick={handleLogin}>
            {isLoading ? <CircularProgress size={20} color="inherit" /> : t('login')}
          </LoginButton>
          <LoginButton variant="contained" color="secondary" disabled={isLoading} onClick={handleRegister}>
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
