import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

export default function Transaction({
  id,
  selectedId,
  name,
  value,
  type,
}: TransactionProps) {
  const { t } = useTranslation();
  const isTransactionPositive = positiveTypes.includes(type);
  const [isSelected, setSelected] = useState(selectedId === id);

  function onClick() {
    setSelected(!isSelected);
  }

  function onDeleteClick(evt: MouseEvent) {
    evt.stopPropagation();
  }

  function onEditClick(evt: MouseEvent) {
    evt.stopPropagation();
  }

  return (
    <TransactionItem
      key={id}
      className={isSelected ? 'selected' : ''}
      onClick={onClick}
    >
      <Tooltip title={t(type)}>
        {typeIconMap[type]}
      </Tooltip>
      <TransactionItemTextWrapper>
        {name}
        <TransactionBankAccount>
          Conta de banco - Categoria 1
        </TransactionBankAccount>
      </TransactionItemTextWrapper>
      <TransactionValueWrapper className={isTransactionPositive ? 'positive' : 'negative'}>
        {isTransactionPositive ? '+' : '-'} {formatValueToCurrency(value, t('currencyFormat'))}
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
