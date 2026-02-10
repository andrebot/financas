import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import PlusIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import AccountBankItem from '../../components/accountBankItem';
import { useModal } from '../../components/modal/modal';
import AddBankAccountModal from './addBankAccountModal';
// import { enqueueSnackbar } from 'notistack';
import { 
  CreateAccountMain,
  AccountBankList,
  AddAccountButton,
} from './styledComponents';
import { BankAccount } from '../../types';

export default function CreateAccount(): React.JSX.Element {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    { name: 'Banco do Brasil', agency: '1234567890', accountNumber: '1234567890', cards: [
      { flag: 'visa', last4Digits: '1234', expirationDate: '01/2025' },
      { flag: 'master', last4Digits: '1234', expirationDate: '01/2025' },
      { flag: 'amex', last4Digits: '1234', expirationDate: '01/2025' },
      { flag: 'discover', last4Digits: '1234', expirationDate: '01/2025' },
      { flag: 'diners', last4Digits: '1234', expirationDate: '01/2025' },
      { flag: 'maestro', last4Digits: '1234', expirationDate: '01/2025' },
    ], currency: 'BRL', user: '1234567890' },
  ]);

  const addBankAccount = (bankAccount: BankAccount) => {
    setBankAccounts([...bankAccounts, bankAccount]);
  };

  const openAddBankAccountModal = () => {
    showModal(<AddBankAccountModal addBankAccount={addBankAccount} />);
  };

  return (
    <CreateAccountMain>
      <Typography variant="h2">{t('bankAccounts')}</Typography>
      <AccountBankList>
        <AddAccountButton title={t('createAccount')}>
          <IconButton aria-label={t('createAccount')} size="large" onClick={openAddBankAccountModal}>
            <PlusIcon />
          </IconButton>
        </AddAccountButton>
        {bankAccounts.map((bankAccount) => (
          <AccountBankItem key={bankAccount.accountNumber} bankAccount={bankAccount} />
        ))}
      </AccountBankList>
    </CreateAccountMain>
  );
}
