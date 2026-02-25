import React, { useState, useMemo, useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Theme, useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import {
  BudgetFormHolder,
  BudgetRowInput,
  BudgetTypeSelect,
  DatePickerSelect,
  CategoryFormControl,
  CategorySelect,
  SaveBudgetButton,
} from './styledComponents';
import { useCreateBudgetMutation } from '../../features/budget';
import { useAuth } from '../../hooks/authContext';
import { budgetFormReducer, initialBudgetFormState } from './budgetFormReducer';

import { BUDGET_TYPES, BudgetFormActionType } from '../../enums';
import { Category } from '../../types/categories';
import dayjs from 'dayjs';
import { PickerValue } from '@mui/x-date-pickers/internals/models';

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
};

function formatCategories(categories: Category[]): string[] {
  return categories
    .reduce((acc, category) => {
      if (category.parentCategory) {
        acc.push(`${category.parentCategory.name} - ${category.name}`);
      }
      return acc;
    }, [] as string[])
    .sort();
}

export default function BudgetForm({ categories }: { categories: Category[] }): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const [budgetFormState, budgetFormDispatch] = useReducer(budgetFormReducer, initialBudgetFormState);
  const [createBudget] = useCreateBudgetMutation();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const formattedCategories = useMemo(
    () => formatCategories(categories),
    [categories],
  );

  const getStyles = (name: string, optionValue: string[], theme: Theme) => {
    return {
      fontWeight: optionValue.includes(name)
        ? theme.typography.fontWeightMedium
        : theme.typography.fontWeightRegular,
    }
  };

  const handleCategoryChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    setSelectedCategories(typeof value === 'string' ? value.split(',') : value as string[]);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_NAME, payload: event.target.value });
  };

  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_VALUE, payload: event.target.value });
  };

  const handleStartDateChange = (event: PickerValue) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_START_DATE, payload: event?.toDate() });
  };

  const handleEndDateChange = (event: PickerValue) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_END_DATE, payload: event?.toDate() });
  };

  const handleTypeChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    const type = value as BUDGET_TYPES;
    budgetFormDispatch({ type: BudgetFormActionType.SET_TYPE, payload: type });
  };

  const handleSaveBudget = async () => {
    if (budgetFormState.nameError
        || budgetFormState.valueError
        || budgetFormState.categoriesError
        || budgetFormState.typeError
        || budgetFormState.startDateError
        || budgetFormState.endDateError
      ) {
      enqueueSnackbar(t('fixErrorsBeforeSaving'), { variant: 'error' });
      return;
    }

    try {
      await createBudget({
        name: budgetFormState.name,
        value: budgetFormState.value,
        categories: selectedCategories,
        type: budgetFormState.type,
        startDate: budgetFormState.startDate!,
        endDate: budgetFormState.endDate!,
        user: user?.id,
      }).unwrap();

      budgetFormDispatch({ type: BudgetFormActionType.RESET });
      enqueueSnackbar(t('budgetCreated'), { variant: 'success' });
    } catch {
      enqueueSnackbar(t('budgetCreationFailed'), { variant: 'error' });
    }
  };

  return (
    <BudgetFormHolder>
      <BudgetRowInput>
        <TextField label={t('budgetName')} value={budgetFormState.name} onChange={handleNameChange} />
        <FormControl>
          <InputLabel id="budget-type-label">{t('type')}</InputLabel>
          <BudgetTypeSelect
            label={t('type')}
            labelId="budget-type-label"
            value={budgetFormState.type}
            onChange={handleTypeChange}
          >
            {Object.values(BUDGET_TYPES).map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </BudgetTypeSelect>
        </FormControl>
        <DatePickerSelect
          label={t('start')}
          views={['year', 'month']}
          format="MM/YY"
          value={budgetFormState.startDate ? dayjs(budgetFormState.startDate) : null}
          onChange={handleStartDateChange}
        />
        <DatePickerSelect
          label={t('end')}
          views={['year', 'month']}
          format="MM/YY"
          value={budgetFormState.endDate ? dayjs(budgetFormState.endDate) : null}
          onChange={handleEndDateChange}
        />
        <TextField
          label={t('budgetValue')}
          value={budgetFormState.value}
          onChange={handleValueChange}
          slotProps={{
            input: {
              inputMode: 'decimal',
              startAdornment: <InputAdornment position="start">{t('currencySymbol')}</InputAdornment>,
            },
          }}
        />
      </BudgetRowInput>
      <CategoryFormControl>
        <InputLabel id="budget-categories-label">{t('budgetCategories')}</InputLabel>
        <CategorySelect
          label={t('budgetCategories')}
          labelId="budget-categories-label"
          value={selectedCategories}
          onChange={handleCategoryChange}
          multiple
          input={<OutlinedInput id="budget-categories-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as string[]).map((value: string) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {formattedCategories.map((category) => (
            <MenuItem
              key={category} value={category}
              style={getStyles(category, selectedCategories, theme)}
            >
              {category}
            </MenuItem>
          ))}
        </CategorySelect>
      </CategoryFormControl>
      <SaveBudgetButton
        variant="contained"
        color="primary"
        onClick={handleSaveBudget}
      >
        {t('saveBudget')}
      </SaveBudgetButton>
    </BudgetFormHolder>
  );
}
