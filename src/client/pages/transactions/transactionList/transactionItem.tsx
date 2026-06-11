import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import IconButton from '@mui/material/IconButton';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DepositIcon from '@mui/icons-material/FileDownload';
import WithdrawIcon from '@mui/icons-material/LocalAtm';
import BankSlipIcon from '@mui/icons-material/Article';
import TransferIcon from '@mui/icons-material/ImportExport';
import InvesetmentIcon from '@mui/icons-material/Savings';
import InvestmentDueDateIcon from '@mui/icons-material/Event';
import Tooltip from '@mui/material/Tooltip';
import PixIcon from '@mui/icons-material/Pix';
import { useModal } from '../../../components/modal/modal';
import ConfirmModal from '../../../components/confirmModal';
import { useDeleteTransactionMutation } from '../../../features/transaction';
import { formatValueToCurrency } from '../../../utils/money';
import {
  TransactionItem,
  TransactionItemTextWrapper,
  TransactionValueWrapper,
  TransactionBankAccount,
  TransactionItemActions,
} from './styledComponents';
import { TRANSACTION_TYPES } from '../../../enums';
import type { MouseEvent } from 'react';
import type { TransactionProps } from '../../../types';

/** Transaction types whose value should be displayed as positive (green, prefixed with `+`). */
const positiveTypes = [
  'transferIn',
  'deposit',
  'cardRefund',
  'investmentSell',
  'investmentDividend',
  'investmentInterest',
  'pixIn'
];

export const typeIconMap = {
  [TRANSACTION_TYPES.WITHDRAW]: <WithdrawIcon />,
  [TRANSACTION_TYPES.TRANSFER_IN]: <TransferIcon />,
  [TRANSACTION_TYPES.TRANSFER_OUT]: <TransferIcon />,
  [TRANSACTION_TYPES.DEPOSIT]: <DepositIcon />,
  [TRANSACTION_TYPES.BANK_SLIP]: <BankSlipIcon />,
  [TRANSACTION_TYPES.CARD_PURCHASE]: <CreditCardIcon />,
  [TRANSACTION_TYPES.CARD_REFUND]: <CreditCardIcon />,
  [TRANSACTION_TYPES.INVESTMENT_BUY]: <InvesetmentIcon />,
  [TRANSACTION_TYPES.INVESTMENT_SELL]: <InvesetmentIcon />,
  [TRANSACTION_TYPES.INVESTMENT_DIVIDEND]: <InvesetmentIcon />,
  [TRANSACTION_TYPES.INVESTMENT_INTEREST]: <InvesetmentIcon />,
  [TRANSACTION_TYPES.INVESTMENT_DUE_DATE]: <InvestmentDueDateIcon />,
  [TRANSACTION_TYPES.PIX_IN]: <PixIcon />,
  [TRANSACTION_TYPES.PIX_OUT]: <PixIcon />
};

/**
 * Renders a single transaction row with its type icon, name, bank account,
 * formatted value, and a slide-in actions panel with edit and delete buttons.
 *
 * @param props - {@link TransactionProps}
 */
export default function Transaction({
  transaction,
  selectedId,
  onSelect,
  editSelectTrigger,
}: TransactionProps) {
  const { t } = useTranslation();
  const { showModal, closeModal } = useModal();
  const [deleteTransaction] = useDeleteTransactionMutation();
  const isTransactionPositive = positiveTypes.includes(transaction.type);
  const [isSelected, setSelected] = useState(selectedId === transaction.id);

  /** Toggles selection: deselects if already selected, otherwise selects this row. */
  function onClick() {
    if (selectedId === transaction.id) {
      onSelect(0);
    } else {
      onSelect(transaction.id!);
    }
  }

  /**
   * Calls the delete mutation for the given transaction id and shows a
   * success or error snackbar depending on the outcome.
   *
   * @param id - The id of the transaction to delete
   */
  async function submitDeleteTransaction(id: number) {
    try {
      await deleteTransaction(id).unwrap();
      enqueueSnackbar(t('transactionDeletedSuccessfully'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('transactionDeletedError'), { variant: 'error' });
    } finally {
      closeModal();
    }
  }

  /**
   * Stops event propagation and opens a confirm modal before deleting the transaction.
   *
   * @param evt - The mouse click event from the delete button
   */
  function onDeleteClick(evt: MouseEvent) {
    evt.stopPropagation();

    showModal(
      <ConfirmModal
        title={t('deleteTransaction')}
        confirmationText={t('deleteTransactionMessage')}
        onConfirm={() => submitDeleteTransaction(transaction.id!)}
        onCancel={() => closeModal()}
      />,
    );
  }

  /**
   * Stops event propagation and triggers the edit flow for the current transaction.
   *
   * @param evt - The mouse click event from the edit button
   */
  function onEditClick(evt: MouseEvent) {
    evt.stopPropagation();
    editSelectTrigger(transaction);
  }

  useEffect(() => {
    setSelected(selectedId === transaction.id);
  }, [selectedId]);

  return (
    <TransactionItem
      key={transaction.id}
      className={isSelected ? 'selected' : ''}
      onClick={onClick}
    >
      <Tooltip title={t(transaction.type)}>
        {typeIconMap[transaction.type]}
      </Tooltip>
      <TransactionItemTextWrapper>
        {transaction.name}
        <TransactionBankAccount>
          {[transaction.accountName, transaction.categoryName].filter(Boolean).join(' - ')}
        </TransactionBankAccount>
      </TransactionItemTextWrapper>
      <TransactionValueWrapper className={isTransactionPositive ? 'positive' : 'negative'}>
        {isTransactionPositive ? '+' : '-'} {formatValueToCurrency(transaction.value, t('currencyFormat'))}
      </TransactionValueWrapper>
      <TransactionItemActions className={isSelected ? 'selected' : ''}>
        <IconButton onClick={onEditClick}>
          <EditIcon />
        </IconButton>
        <IconButton onClick={onDeleteClick}>
          <DeleteIcon color='error'/>
        </IconButton>
      </TransactionItemActions>
    </TransactionItem>
  );
};
