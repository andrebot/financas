import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { Theme, useTheme } from '@mui/material/styles';
import InputAdornment from '@mui/material/InputAdornment';
import { SelectChangeEvent } from '@mui/material/Select';
import { useListCategoriesQuery } from '../../features/category';
import { 
  BudgetMain,
  BudgetRowInput,
  BudgetTypeSelect,
  CategorySelect,
  DatePickerSelect,
  SaveBudgetButton,
  CategoryFormControl,
} from './styledComponents';

import { BUDGET_TYPES } from '../../enums';

const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: 48 * 4.5 + 8,
      width: 250,
    },
  },
};

export default function Budget(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const [formattedCategories, setFormattedCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { data: categories = [] } = useListCategoriesQuery();

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

  useEffect(() => {
    setFormattedCategories(categories.reduce((acc, category) => {
      if (category.parentCategory) {
        acc.push(`${category.parentCategory} - ${category.name}`);
      }

      return acc;
    }, [] as string[]));
  }, [categories]);

  return (
    <BudgetMain>
      <Typography variant="h1">{t('budget')}</Typography>
      <BudgetRowInput>
        <TextField label={t('budgetName')} />
        <FormControl>
          <InputLabel id="budget-type-label">{t('type')}</InputLabel>
          <BudgetTypeSelect label={t('type')} labelId="budget-type-label">
            {Object.values(BUDGET_TYPES).map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </BudgetTypeSelect>
        </FormControl>
        <DatePickerSelect label={t('start')} views={['year', 'month']} format="MM/YY" />
        <DatePickerSelect label={t('end')} views={['year', 'month']} format="MM/YY" />
        <TextField
          label={t('budgetValue')}
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
      <SaveBudgetButton variant="contained" color="primary">{t('saveBudget')}</SaveBudgetButton>
    </BudgetMain>
  );
}

