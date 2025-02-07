
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useResetPasswordMutation } from '../../features/login';
import { ResetPasswordMain, ResetPasswordContainer } from './styledComponents';

export default function ResetPassword(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  /**
   * Makes a request to reset the password and deals with the response
   */
  async function handleResetPassword() {
    if (email === '') {
      enqueueSnackbar(t('emailRequired'), { variant: 'error' });
      setEmailError(t('emailRequired'));
      return;
    } else {
      setEmailError('');
    }

    try {
      const response = await resetPassword({ email });

      if ('data' in response) {
        enqueueSnackbar(t('resetPasswordSuccess'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('internalError'), { variant: 'error' });
      }
    } catch (error) {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  }

  /**
   * Handles the email change event to avoid empty email
   *
   * @param e - The change event
   */
  function onChangeEmail(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);

    if (e.target.value === '') {
      setEmailError(t('emailRequired'));
    } else {
      setEmailError('');
    }
  }

  return (
    <ResetPasswordMain>
      <ResetPasswordContainer>
        <h1>{t('resetPasswordTitle')}</h1>
        {isSuccess ? (
          <>
            <p>{t('waitForEmail')}</p>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/login')}
            >
              {t('backToLogin')}
            </Button>
          </>
        ) : (
          <>
            <TextField
              label={t('email')}
              variant="outlined"
              type="email"
              value={email}
              onChange={onChangeEmail}
              error={!!emailError}
              helperText={emailError}
            />
            <Button
              aria-label={t('resetPassword')}
              variant="contained"
              color="primary"
              onClick={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={20} /> : t('resetPassword')}
            </Button>
          </>
        )}
      </ResetPasswordContainer>
    </ResetPasswordMain>
  );
};