import React, { useMemo } from 'react';
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
import FormHelperText from '@mui/material/FormHelperText';
import { Theme, useTheme } from '@mui/material/styles';
import { SelectChangeEvent } from '@mui/material/Select';
import dayjs from 'dayjs';
import { PickerValue } from '@mui/x-date-pickers/internals/models';
import {
  BudgetFormHolder,
  BudgetRowInput,
  BudgetTypeSelect,
  DatePickerSelect,
  CategoryFormControl,
  CategorySelect,
  SaveBudgetButton,
} from './styledComponents';
import { useCreateBudgetMutation, useUpdateBudgetMutation } from '../../features/budget';
import { useAuth } from '../../hooks/authContext';
import { BUDGET_TYPES, BudgetFormActionType } from '../../enums';
import { Category } from '../../types/categories';
import type { BudgetFormState, BudgetFormAction } from '../../types';
import { hasBudgetFormErrors, validateBudgetFormState } from './budgetFormReducer';

type FormattedBudgetCategory = {
  id: number;
  label: string;
};

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
};

/**
 * Formats child categories with their parent category names for display.
 *
 * @param categories - Categories returned by the API.
 * @returns Category ids and display labels in the format "Parent - Child".
 */
export function formatCategories(categories: Category[]): FormattedBudgetCategory[] {
  const categoryNamesById = new Map(
    categories.map((category) => [category.id, category.name]),
  );

  return categories
    .reduce((acc, category) => {
      const parentName = category.parentCategoryId
        ? categoryNamesById.get(category.parentCategoryId)
        : undefined;

      if (parentName && category.id !== undefined) {
        acc.push({ id: category.id, label: `${parentName} - ${category.name}` });
      }

      return acc;
    }, [] as FormattedBudgetCategory[])
    .sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Converts a MUI multi-select value to numeric category ids.
 *
 * @param value - Raw value from the select change event.
 * @returns Numeric category ids selected by the user.
 */
export function toCategoryIds(value: unknown): number[] {
  const values = typeof value === 'string' ? value.split(',') : value as Array<number | string>;

  return values.map((categoryId) => Number(categoryId));
}

/**
 * Finds the display label for a selected category id.
 *
 * @param categoryId - Selected category id.
 * @param formattedCategories - Category display options.
 * @returns The display label or the id if the option is no longer loaded.
 */
function getCategoryLabel(
  categoryId: number,
  formattedCategories: FormattedBudgetCategory[],
): string {
  return formattedCategories.find((category) => category.id === categoryId)?.label
    ?? String(categoryId);
}

/**
 * Budget form used for both budget creation and update flows.
 *
 * @param categories - Categories available for budget category selection.
 * @param budgetFormState - The current reducer-backed form state.
 * @param budgetFormDispatch - Dispatch function used to update the form state.
 * @returns The budget form component.
 */
export default function BudgetForm({
  categories,
  budgetFormState,
  budgetFormDispatch,
}: {
  categories: Category[],
  budgetFormState: BudgetFormState,
  budgetFormDispatch: React.Dispatch<BudgetFormAction>
}): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const [createBudget] = useCreateBudgetMutation();
  const [updateBudget] = useUpdateBudgetMutation();

  const formattedCategories = useMemo(
    () => formatCategories(categories),
    [categories],
  );

  /**
   * Gets the font weight for a category menu option based on selection state.
   *
   * @param categoryId - The category option id.
   * @param optionValue - The selected category ids.
   * @param muiTheme - The active MUI theme.
   * @returns The inline style for the option.
   */
  const getStyles = (categoryId: number, optionValue: number[], muiTheme: Theme) => ({
    fontWeight: optionValue.includes(categoryId)
      ? muiTheme.typography.fontWeightMedium
      : muiTheme.typography.fontWeightRegular,
  });

  /**
   * Handles category multi-select changes and stores numeric category ids.
   *
   * @param event - The category select change event.
   */
  const handleCategoryChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    budgetFormDispatch({
      type: BudgetFormActionType.SET_CATEGORY_IDS,
      payload: toCategoryIds(value),
    });
  };

  /**
   * Handles budget name input changes.
   *
   * @param event - The name input change event.
   */
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_NAME, payload: event.target.value });
  };

  /**
   * Handles budget value input changes.
   *
   * @param event - The value input change event.
   */
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    budgetFormDispatch({
      type: BudgetFormActionType.SET_VALUE,
      payload: Number(event.target.value),
    });
  };

  /**
   * Handles budget start date picker changes.
   *
   * @param event - The selected start date value.
   */
  const handleStartDateChange = (event: PickerValue) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_START_DATE, payload: event?.toDate() });
  };

  /**
   * Handles budget end date picker changes.
   *
   * @param event - The selected end date value.
   */
  const handleEndDateChange = (event: PickerValue) => {
    budgetFormDispatch({ type: BudgetFormActionType.SET_END_DATE, payload: event?.toDate() });
  };

  /**
   * Handles budget type select changes.
   *
   * @param event - The type select change event.
   */
  const handleTypeChange = (event: SelectChangeEvent<unknown>) => {
    const {
      target: { value },
    } = event;

    const type = value as BUDGET_TYPES;
    budgetFormDispatch({ type: BudgetFormActionType.SET_TYPE, payload: type });
  };

  /**
   * Validates and submits the budget form using create or update mutation.
   */
  const handleSaveBudget = async () => {
    const validatedState = validateBudgetFormState(budgetFormState);
    budgetFormDispatch({ type: BudgetFormActionType.VALIDATE });

    if (hasBudgetFormErrors(validatedState)) {
      enqueueSnackbar(t('fixErrorsBeforeSaving'), { variant: 'error' });
      return;
    }

    const action = budgetFormState.id ? updateBudget : createBudget;

    try {
      await action({
        id: budgetFormState.id,
        name: budgetFormState.name,
        value: budgetFormState.value,
        categoryIds: budgetFormState.categoryIds,
        type: budgetFormState.type,
        startDate: budgetFormState.startDate!,
        endDate: budgetFormState.endDate!,
        userId: Number(user!.id),
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
        <TextField
          label={t('budgetName')}
          value={budgetFormState.name}
          onChange={handleNameChange}
          error={!!budgetFormState.nameError}
          helperText={budgetFormState.nameError ? t(budgetFormState.nameError) : ''}
        />
        <FormControl error={!!budgetFormState.typeError}>
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
          {budgetFormState.typeError && (
            <FormHelperText>{t(budgetFormState.typeError)}</FormHelperText>
          )}
        </FormControl>
        <DatePickerSelect
          label={t('start')}
          views={['year', 'month']}
          format="MM/YY"
          value={budgetFormState.startDate ? dayjs(budgetFormState.startDate) : null}
          onChange={handleStartDateChange}
          slotProps={{
            textField: {
              error: !!budgetFormState.startDateError,
              helperText: budgetFormState.startDateError ? t(budgetFormState.startDateError) : '',
            },
          }}
        />
        <DatePickerSelect
          label={t('end')}
          views={['year', 'month']}
          format="MM/YY"
          value={budgetFormState.endDate ? dayjs(budgetFormState.endDate) : null}
          onChange={handleEndDateChange}
          slotProps={{
            textField: {
              error: !!budgetFormState.endDateError,
              helperText: budgetFormState.endDateError ? t(budgetFormState.endDateError) : '',
            },
          }}
        />
        <TextField
          label={t('budgetValue')}
          value={budgetFormState.value}
          onChange={handleValueChange}
          error={!!budgetFormState.valueError}
          helperText={budgetFormState.valueError ? t(budgetFormState.valueError) : ''}
          slotProps={{
            input: {
              inputMode: 'decimal',
              startAdornment: <InputAdornment position="start">{t('currencySymbol')}</InputAdornment>,
            },
          }}
        />
      </BudgetRowInput>
      <CategoryFormControl error={!!budgetFormState.categoriesError}>
        <InputLabel id="budget-categories-label">{t('budgetCategories')}</InputLabel>
        <CategorySelect
          label={t('budgetCategories')}
          labelId="budget-categories-label"
          value={budgetFormState.categoryIds}
          onChange={handleCategoryChange}
          multiple
          input={<OutlinedInput id="budget-categories-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {(selected as number[]).map((value: number) => (
                <Chip key={value} label={getCategoryLabel(value, formattedCategories)} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {formattedCategories.map((category) => (
            <MenuItem
              key={category.id}
              value={category.id}
              style={getStyles(category.id, budgetFormState.categoryIds, theme)}
            >
              {category.label}
            </MenuItem>
          ))}
        </CategorySelect>
        {budgetFormState.categoriesError && (
          <FormHelperText>{t(budgetFormState.categoriesError)}</FormHelperText>
        )}
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
