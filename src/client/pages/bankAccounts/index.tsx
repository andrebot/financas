import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import PlusIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import AccountBankItem from '../../components/accountBankItem';
import { useModal } from '../../components/modal/modal';
import AddBankAccountModal from './addBankAccountModal';
import { useListBankAccountsQuery, useCreateBankAccountMutation } from '../../features/bankAccount';
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
  const { data: bankAccounts = [] } = useListBankAccountsQuery();
  const [createBankAccount] = useCreateBankAccountMutation();

  const addBankAccount = (bankAccount: BankAccount) => {
    createBankAccount({ ...bankAccount });
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
