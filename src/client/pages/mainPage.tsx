import React from 'react';
import { Outlet } from 'react-router';
import NavBar from '../components/navBar';

/**
 * Main application landing page.
 */
export default function mainPage(): React.JSX.Element {
  return (
    <>
      <NavBar />
      <Outlet />
    </>
  );
}
