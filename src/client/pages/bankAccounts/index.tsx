import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import PlusIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/IconButton';
import { enqueueSnackbar } from 'notistack';
import AccountBankItem from '../../components/accountBankItem';
import { useModal } from '../../components/modal/modal';
import AddBankAccountModal from './addBankAccountModal';
import { useListBankAccountsQuery, useCreateBankAccountMutation } from '../../features/bankAccount';
import {
  CreateAccountMain,
  AccountBankList,
  AddAccountButton,
} from './styledComponents';
import { BankAccount } from '../../types';

/**
 * Page that displays the list of bank accounts. It also handles the
 * CRUD operations for the bank accounts.
 *
 * @returns The bank accounts page
 */
export default function BankAccounts(): React.JSX.Element {
  const { t } = useTranslation();
  const { showModal } = useModal();
  const { data: bankAccounts = [] } = useListBankAccountsQuery();
  const [createBankAccount, { isError, isSuccess }] = useCreateBankAccountMutation();

  /**
   * Adds a bank account by calling the createBankAccount mutation.
   *
   * @param bankAccount - The bank account to add
   */
  const addBankAccount = async (bankAccount: BankAccount) => {
    createBankAccount({ ...bankAccount });
  };

  /**
   * Opens the add bank account modal.
   */
  const openAddBankAccountModal = () => {
    showModal(<AddBankAccountModal saveBankAccount={addBankAccount} />);
  };

  useEffect(() => {
    if (isSuccess) {
      enqueueSnackbar(t('bankAccountCreated'), { variant: 'success' });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      enqueueSnackbar(t('bankAccountCreationFailed'), { variant: 'error' });
    }
  }, [isError]);

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
          <AccountBankItem key={bankAccount.id ?? bankAccount.name} bankAccount={bankAccount} />
        ))}
      </AccountBankList>
    </CreateAccountMain>
  );
}
