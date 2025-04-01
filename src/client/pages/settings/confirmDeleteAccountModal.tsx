import React from 'react';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useModal } from '../../components/modal/modal';
import {
  ConfirmDeleteAccountContainer,
  HorizontalContainer,
  InfoButton,
  ConfirmDeleteAccountTitle,
} from './styledComponents';
import { useAuth } from '../../hooks/authContext';
import { useDeleteAccountMutation } from '../../features/login';

export default function ConfirmDeleteAccount({
  handleLogout,
}: {
  handleLogout: (shouldCallLogoutApi: boolean) => void;
}) {
  const { t } = useTranslation();
  const { closeModal } = useModal();
  const { user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  /**
   * Handles the delete account action.
   *
   * @remarks
   * It will call the delete account mutation and then logout the user.
   */
  const handleDeleteAccount = async () => {
    try {
      const result = await deleteAccount(user!.id);

      if ('data' in result) {
        enqueueSnackbar(t('accountDeleted'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('internalError'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    } finally {
      handleLogout(false);
      closeModal();
    }
  };

  return (
    <ConfirmDeleteAccountContainer elevation={3}>
      <ConfirmDeleteAccountTitle variant="h6">{t('confirmDeleteAccountTitle')}</ConfirmDeleteAccountTitle>
      <Typography variant="body1">{t('confirmDeleteAccountDescription')}</Typography>
      <HorizontalContainer>
        <InfoButton variant="outlined" onClick={closeModal} disabled={isLoading}>
          {t('cancel')}
        </InfoButton>
        <InfoButton variant="contained" color="error" onClick={handleDeleteAccount} disabled={isLoading}>
          {t('delete')}
        </InfoButton>
      </HorizontalContainer>
    </ConfirmDeleteAccountContainer>
  );
}
