
import React from 'react';
import { useTranslation } from 'react-i18next';
import { enqueueSnackbar } from 'notistack';
import { useNavigate } from 'react-router';
import { } from './styledComponents';

export default function CreateAccount(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('createAccount')}</h1>
    </div>
  );
};
