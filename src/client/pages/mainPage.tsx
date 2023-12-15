import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * Main application landing page.
 */
export default function mainPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <p>{t('exampleText')}</p>
      <Outlet />
    </>
  );
}
