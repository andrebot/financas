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
import DeselectIcon from '@mui/icons-material/Close';
import { IconButton, TableBody } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
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

/**
 * Formats a budget's hydrated category names for table display.
 *
 * @param budget - Budget returned by the API.
 * @returns A comma-separated category name list.
 */
function formatBudgetCategories(budget: Budget): string {
  return budget.categories?.map((category) => category.name).join(', ') ?? '';
}

/**
 * Displays the budget page with the budget form and budget table actions.
 *
 * @returns The budget page component.
 */
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
                <TableCell>{t('budgetCategories')}</TableCell>
                <TableCell>{t('actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id} selected={budgetFormState.id === budget.id}>
                  <TableCell>{budget.name}</TableCell>
                  <TableCell>{budget.type}</TableCell>
                  <TableCell>{budget.value}</TableCell>
                  <TableCell>{formatBudgetCategories(budget)}</TableCell>
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
    </BudgetMain>
  );
}
