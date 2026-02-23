import React, { useRef, useState } from 'react';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import {
  SubCategoryHolder,
  SubCategoryTextField,
} from './styledComponents';

type SubCategoryFormProps = {
  onAddSubCategory: (subCategoryName: string) => void;
};

/**
 * Form to add a sub-category. It is a simple
 * TextField with a button to add the sub-category.
 *
 * @param onAddSubCategory - The function to add a sub-category
 * @returns The sub-category form
 */
export default function SubCategoryForm({ onAddSubCategory }: SubCategoryFormProps) {
  const { t } = useTranslation();
  const [subCategoryName, setSubCategoryName] = useState('');
  const anchorEl = useRef<HTMLButtonElement>(null);

  /**
   * Handles the addition of a sub-category.
   *
   * @remarks
   * After the save is done we focus the input field to allow the user to
   * quickly add another sub-category.
   */
  const handleAddSubCategory = () => {
    if (subCategoryName.length === 0) {
      return;
    }

    onAddSubCategory(subCategoryName);
    setSubCategoryName('');
    anchorEl.current?.focus();
  };

  /**
   * Handles the pressing of the enter key
   * to add the sub-category.
   *
   * @param e - The keyboard event
   */
  const handleEnterPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddSubCategory();
    }
  };

  return (
    <SubCategoryHolder>
      <SubCategoryTextField
        inputRef={anchorEl}
        label={t('subCategoryName')}
        variant="outlined"
        value={subCategoryName}
        onChange={(e) => setSubCategoryName(e.target.value)}
        slotProps={{
          input: { inputRef: anchorEl, onKeyDown: handleEnterPress },
        }}
      />
      <Button variant="contained" color="primary" onClick={handleAddSubCategory}>
        {t('addSubCategory')}
      </Button>
    </SubCategoryHolder>
  );
}
