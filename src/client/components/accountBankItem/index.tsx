import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import BankIcon from '@mui/icons-material/AccountBalance';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDownCircle';
import { AccountBankItemMain, AccountBankInfo } from './styledComponent';
import CreditCard from '../creditCard';
import { AccountBankItemProps } from '../../types';
import { CreditCardsList } from '../creditCard/styledComponents';
import { useDeleteBankAccountMutation } from '../../features/bankAccount';
import { enqueueSnackbar } from 'notistack';
import ConfirmModal from '../confirmModal';
import { useModal } from '../modal/modal';

export default function AccountBankItem({ bankAccount }: AccountBankItemProps): React.JSX.Element {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { showModal, closeModal } = useModal();
  const [deleteBankAccount, { isError, isSuccess }] = useDeleteBankAccountMutation();

  /**
   * Handles the click event for the anchor element. This makes the menu open.
   *
   * @param event - The click event
   */
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  /**
   * Handles the close event for the menu. This makes the menu close.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * Deletes the bank account by calling the deleteBankAccount mutation and closing the modal.
   */
  const handleDeleteBankAccount = () => {
    deleteBankAccount(bankAccount.id!);
    closeModal();
  };

  /**
   * Opens the confirm modal to delete the bank account.
   */
  const handleDelete = () => {
    setAnchorEl(null);
    showModal(
      <ConfirmModal
        title={t('bankAccountDeletionTitle')}
        confirmationText={t('bankAccountDeletionDescription')}
        onConfirm={handleDeleteBankAccount}
        onCancel={closeModal}
      />
    );
  };

  useEffect(() => {
    if (isSuccess) {
      enqueueSnackbar(t('bankAccountDeleted'), { variant: 'success' });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(t('bankAccountDeletionFailed'), { variant: 'error' });
    }
  }, [isError]);

  return (
    <AccountBankItemMain elevation={3}>
      <AccountBankInfo>
        <BankIcon sx={{ fontSize: 40 }} />
        <div style={{ flexGrow: 1 }}>
          <Typography variant="subtitle1">{bankAccount.name}</Typography>
          <AccountBankInfo>
            <Typography variant="subtitle1">{t('bankAccountNumber')}: {bankAccount.accountNumber}</Typography>
            <Typography variant="subtitle1">{t('bankAgencyNumber')}: {bankAccount.agency}</Typography>
          </AccountBankInfo>
        </div>
        <div>
          <Tooltip title={t('actionMenu')}>
            <IconButton
              id="basic-button"
              aria-controls={open ? 'basic-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
              onClick={handleClick}
            >
              <ArrowDropDownIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
          >
            <MenuItem onClick={handleClose}>{t('edit')}</MenuItem>
            <MenuItem onClick={handleDelete}>{t('delete')}</MenuItem>
          </Menu>
        </div>
      </AccountBankInfo>
      <CreditCardsList>
        {bankAccount.cards.map(({ flag, last4Digits, expirationDate, number }) => (
          <CreditCard
            key={last4Digits}
            flag={flag}
            last4Digits={number.slice(-4)}
            expirationDate={expirationDate}
            number={number}
          />
        ))}
      </CreditCardsList>
    </AccountBankItemMain>
  );
}