import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, TableBody } from '@mui/material';
import ConfirmModal from '../../components/confirmModal';
import { useListCategoriesQuery } from '../../features/category';
import BudgetForm from './budgetForm';
import { budgetFormReducer, initialBudgetFormState } from './budgetFormReducer';
import { BudgetFormActionType } from '../../enums';
import {
  BudgetMain,
  BudgetTableWrapper,
  NoBudgetMessage,
} from './styledComponents';
import { useDeleteBudgetMutation, useListBudgetsQuery } from '../../features/budget';
import { useModal } from '../../components/modal/modal';
import { Budget } from '../../types';

export default function BudgetPage(): React.JSX.Element {
  const { t } = useTranslation();
  const { showModal, closeModal } = useModal();
  const { data: categories = [] } = useListCategoriesQuery();
  const { data: budgets = [] } = useListBudgetsQuery();
  const [deleteBudget] = useDeleteBudgetMutation();
  const [budgetFormState, budgetFormDispatch] = useReducer(
    budgetFormReducer,
    initialBudgetFormState,
  );

  const handleEdit = (budget: Budget) => {
    budgetFormDispatch({ type: BudgetFormActionType.EDIT, payload: budget });
  };

  const submitDeleteBudget = async (id: number) => {
    try {
      await deleteBudget(id).unwrap();
      enqueueSnackbar(t('budgetDeletedSuccessfully'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('budgetDeletedError'), { variant: 'error' });
    } finally {
      closeModal();
    }
  };

  const handleDeleteBudget = (id: number) => {
    showModal(
      <ConfirmModal
        title={t('deleteBudget')}
        confirmationText={t('deleteBudgetMessage')}
        onConfirm={() => submitDeleteBudget(id)}
        onCancel={() => closeModal()}
      />,
    );
  };

  return (
    <BudgetMain>
      <Typography variant="h1">{t('budget')}</Typography>
      <BudgetForm
        categories={categories}
        budgetFormState={budgetFormState}
        budgetFormDispatch={budgetFormDispatch}
      />
      <BudgetTableWrapper elevation={3}>
        {budgets.length > 0 ? (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('name')}</TableCell>
                <TableCell>{t('type')}</TableCell>
                <TableCell>{t('value')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>{budget.name}</TableCell>
                  <TableCell>{budget.type}</TableCell>
                  <TableCell>{budget.value}</TableCell>
                  <TableCell>
                    <IconButton aria-label={t('edit')} onClick={() => handleEdit(budget)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton aria-label={t('delete')} onClick={() => handleDeleteBudget(budget.id!)}>
                      <DeleteIcon color="error" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <NoBudgetMessage>
            <Typography variant="body1">{t('noBudgets')}</Typography>
          </NoBudgetMessage>
        )}
      </BudgetTableWrapper>
    </BudgetMain>
  );
}
