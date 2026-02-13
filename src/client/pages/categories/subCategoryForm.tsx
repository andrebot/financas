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

export default function SubCategoryForm({ onAddSubCategory }: SubCategoryFormProps) {
  const { t } = useTranslation();
  const [subCategoryName, setSubCategoryName] = useState('');
  const anchorEl = useRef<HTMLButtonElement>(null);

  const handleAddSubCategory = () => {
    if (subCategoryName.length === 0) {
      return;
    }

    onAddSubCategory(subCategoryName);
    setSubCategoryName('');
    anchorEl.current?.focus();
  };

  return (
    <SubCategoryHolder>
      <SubCategoryTextField inputRef={anchorEl} label={t('subCategoryName')} variant="outlined" value={subCategoryName} onChange={(e) => setSubCategoryName(e.target.value)} />
      <Button variant="contained" color="primary" onClick={handleAddSubCategory}>
        {t('addSubCategory')}
      </Button>
    </SubCategoryHolder>
  );
}
