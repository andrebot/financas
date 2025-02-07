
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
  const [resetPassword, { isLoading, isSuccess }] = useResetPasswordMutation();

  /**
   * Makes a request to reset the password and deals with the response
   */
  async function handleResetPassword() {
    try {
      await resetPassword({ email });
      enqueueSnackbar(t('resetPasswordSuccess'), { variant: 'success' });
    } catch (error) {
      enqueueSnackbar(t('resetPasswordError'), { variant: 'error' });
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
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button
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