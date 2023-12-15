import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Main application landing page.
 */
export default function mainPage(): React.JSX.Element {
  return (
    <>
      <p>Hi, I&apos;m the main page</p>
      <Outlet />
    </>
  );
}
