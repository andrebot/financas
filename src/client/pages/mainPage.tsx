import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import NavBar from '../components/navBar';

/**
 * Main application landing page.
 */
export default function mainPage(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
