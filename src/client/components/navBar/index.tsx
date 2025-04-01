import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import AccountIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import CustomListItem from './customListItem';
import {
  NavMenuIcon,
  NavTitle,
  DrawerContainer,
} from './styledComponents';
import { useAuth } from '../../hooks/authContext';
import useLogout from '../../hooks/useLogout';

export default function NavBar() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { handleLogout } = useLogout();

  /**
   * Closes the drawer.
   */
  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <NavMenuIcon edge="start" color="inherit" aria-label="menu" onClick={() => setIsDrawerOpen(true)}>
          <MenuIcon />
        </NavMenuIcon>
        <NavTitle variant="h6">
          Financas
        </NavTitle>
      </Toolbar>
      <Drawer anchor="left" open={isDrawerOpen} onClose={closeDrawer}>
        <DrawerContainer
          role="presentation"
          onClick={closeDrawer}
          onKeyDown={closeDrawer}
        >
          <List>
            <CustomListItem text={`${t('hello')}, ${user?.firstName}`}>
              <AccountIcon />
            </CustomListItem>
          </List>
          <Divider />
          <List>
            <CustomListItem text={t('transactions')}>
              <CompareArrowsIcon />
            </CustomListItem>
          </List>
          <Divider />
          <List>
            <CustomListItem text={t('settings')} onClick={() => navigate('/settings')}>
              <SettingsIcon />
            </CustomListItem>
            <CustomListItem text={t('logout')} onClick={handleLogout}>
              <LogoutIcon />
            </CustomListItem>
          </List>
        </DrawerContainer>
      </Drawer>
    </AppBar>
  );
}
