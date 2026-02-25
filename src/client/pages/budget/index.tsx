import React from 'react';
import { useTranslation } from 'react-i18next';
import Typography from '@mui/material/Typography';
import { useListCategoriesQuery } from '../../features/category';
import BudgetForm from './budgetForm';
import { 
  BudgetMain,
} from './styledComponents';


export default function Budget(): React.JSX.Element {
  const { t } = useTranslation();
  const { data: categories = [] } = useListCategoriesQuery();

  return (
    <BudgetMain>
      <Typography variant="h1">{t('budget')}</Typography>
      <BudgetForm categories={categories} />
    </BudgetMain>
  );
}

