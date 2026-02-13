import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';
import { CreateCategoryModal } from './styledComponents';
import { useModal } from '../../components/modal/modal';
import { Category } from '../../types';

type AddCategoryModalProps = {
  onSaveCategory: (categoryName: string) => void;
  category?: Category;
};

/**
 * Modal to add a category. This was created to de-clutter the Categories page.
 *
 * @param onSaveCategory - The function to save the category
 * @param category - The category to edit
 * @returns The add category modal
 */
export default function AddCategoryModal({ onSaveCategory, category }: AddCategoryModalProps) {
  const { t } = useTranslation();
  const { closeModal } = useModal();

  const [categoryName, setCategoryName] = useState(category?.name || '');

  /**
   * Handles the saving of the category.
   */
  const handleSaveCategory = () => {
    onSaveCategory(categoryName);
    closeModal();
  };

  return (
    <CreateCategoryModal elevation={6}>
      <TextField label={t('categoryName')} variant="outlined" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleSaveCategory}>{t('saveCategory')}</Button>
      <Button variant="contained" color="error" onClick={closeModal}>{t('cancel')}</Button>
    </CreateCategoryModal>
  );
}
