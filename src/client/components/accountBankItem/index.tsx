import React, { useState } from 'react';
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

export default function AccountBankItem({ bankAccount }: AccountBankItemProps): React.JSX.Element {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
            <MenuItem onClick={handleClose}>{t('delete')}</MenuItem>
          </Menu>
        </div>
      </AccountBankInfo>
      <CreditCardsList>
        {bankAccount.cards.map(({ flag, last4Digits, expirationDate }) => (
          <CreditCard
            key={last4Digits}
            flag={flag}
            last4Digits={last4Digits}
            expirationDate={expirationDate}
          />
        ))}
      </CreditCardsList>
    </AccountBankItemMain>
  );
}