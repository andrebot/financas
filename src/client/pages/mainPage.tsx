import React from 'react';
import { Outlet } from 'react-router';
import { styled } from '@mui/material/styles';
import NavBar from '../components/navBar';

const MainPageContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
}));

const MainOutlet = styled(Outlet)(() => ({
  flexGrow: 1,
  width: '100%',
}));

/**
 * Main application landing page.
 */
export default function mainPage(): React.JSX.Element {
  return (
    <MainPageContainer>
      <NavBar />
      <MainOutlet />
    </MainPageContainer>
  );
}
