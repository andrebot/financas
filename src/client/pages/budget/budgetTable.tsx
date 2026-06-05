import React from 'react';
import { enqueueSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DeselectIcon from '@mui/icons-material/Close';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TableBody from '@mui/material/TableBody';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ConfirmModal from '../../components/confirmModal';
import { useModal } from '../../components/modal/modal';
import { useDeleteBudgetMutation, useListBudgetsQuery } from '../../features/budget';
import {
  BudgetTableWrapper,
  NoBudgetMessage,
  BudgetTableHeader,
  CategoryChipsHolder,
} from './styledComponents';
import { BudgetFormActionType } from '../../enums';
import { Budget, BudgetFormState, BudgetFormAction } from '../../types';

/**
 * Formats a budget's hydrated category names for table display.
 *
 * @param budget - Budget returned by the API.
 * @returns A list of category chips.
 */
function formatBudgetCategories(budget: Budget): React.JSX.Element[] {
  return budget.categories?.map((category) => (
    <Chip key={category.id} label={category.name} size="small" />
  )) ?? [];
}

/**
 * Displays the budget table with the list of budgets.
 *
 * @param budgetFormState - The current reducer-backed form state.
 * @param budgetFormDispatch - Dispatch function used to update the form state.
 * @returns The budget table component.
 */
export default function BudgetTable({
  budgetFormState,
  budgetFormDispatch,
}: {
  budgetFormState: BudgetFormState,
  budgetFormDispatch: React.Dispatch<BudgetFormAction>
}) {
  const { t } = useTranslation();
  const { showModal, closeModal } = useModal();
  const { data: budgets = [] } = useListBudgetsQuery();
  const [deleteBudget] = useDeleteBudgetMutation();

  /**
   * Populates the budget form with the selected budget data.
   *
   * @param budget - The budget selected for editing.
   */
  const handleEdit = (budget: Budget) => {
    budgetFormDispatch({ type: BudgetFormActionType.EDIT, payload: budget });
  };

  /**
   * Clears the current budget form selection and returns it to create mode.
   */
  const handleDeselectBudget = () => {
    budgetFormDispatch({ type: BudgetFormActionType.RESET });
  };

  /**
   * Deletes a budget through the API and shows the result feedback.
   *
   * @param id - The id of the budget to delete.
   */
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

  /**
   * Opens the confirmation modal before deleting a budget.
   *
   * @param id - The id of the budget to delete.
   */
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
    <BudgetTableWrapper elevation={3}>
      {budgets.length > 0 ? (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('name')}</TableCell>
              <BudgetTableHeader>{t('type')}</BudgetTableHeader>
              <BudgetTableHeader>{t('value')}</BudgetTableHeader>
              <TableCell>{t('budgetCategories')}</TableCell>
              <BudgetTableHeader>{t('actions')}</BudgetTableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {budgets.map((budget) => (
              <TableRow key={budget.id} selected={budgetFormState.id === budget.id}>
                <TableCell>{budget.name}</TableCell>
                <TableCell>{budget.type}</TableCell>
                <TableCell>{budget.value}</TableCell>
                <TableCell>
                  <CategoryChipsHolder>
                    {formatBudgetCategories(budget)}
                  </CategoryChipsHolder>
                </TableCell>
                <TableCell>
                  {budgetFormState.id ? (
                    <Tooltip title={t('deselect')}>
                      <IconButton aria-label={t('deselect')} onClick={handleDeselectBudget}>
                        <DeselectIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title={t('edit')}>
                      <IconButton aria-label={t('edit')} onClick={() => handleEdit(budget)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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
  );
}
