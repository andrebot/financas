import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import BudgetForm from './budgetForm';
import BudgetTable from './budgetTable';
import { budgetFormReducer, initialBudgetFormState } from './budgetFormReducer';
import { BudgetMain } from './styledComponents';

/**
 * Displays the budget page with the budget form and budget table actions.
 *
 * @returns The budget page component.
 */
export default function BudgetPage(): React.JSX.Element {
  const { t } = useTranslation();
  const [budgetFormState, budgetFormDispatch] = useReducer(
    budgetFormReducer,
    initialBudgetFormState,
  );

  return (
    <BudgetMain>
      <Typography variant="h1">{t('budget')}</Typography>
      <BudgetForm
        budgetFormState={budgetFormState}
        budgetFormDispatch={budgetFormDispatch}
      />
      <BudgetTable
        budgetFormState={budgetFormState}
        budgetFormDispatch={budgetFormDispatch}
      />
    </BudgetMain>
  );
}
