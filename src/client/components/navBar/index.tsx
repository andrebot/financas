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
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import GoalsIcon from '@mui/icons-material/EmojiEvents';
import BudgetIcon from '@mui/icons-material/Wallet';
import CustomListItem from './customListItem';
import {
  NavMenuIcon,
  NavTitle,
  DrawerContainer,
} from './styledComponents';
import { useAuth } from '../../hooks/authContext';
import useLogout from '../../hooks/useLogout';

/**
 * This component is the nav bar for the application.
 *
 * @returns The nav bar component
 */
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
    <AppBar position="relative">
      <Toolbar>
        <NavMenuIcon edge="start" color="inherit" aria-label="menu" onClick={() => setIsDrawerOpen(true)}>
          <MenuIcon />
        </NavMenuIcon>
        <NavTitle variant="h6">
          {t('appName')}
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
            <CustomListItem text={t('bankAccounts')} onClick={() => navigate('/bank-accounts')}>
              <AccountBalanceIcon />
            </CustomListItem>
            <CustomListItem text={t('categories')} onClick={() => navigate('/categories')}>
              <CollectionsBookmarkIcon />
            </CustomListItem>
            <CustomListItem text={t('goals')} onClick={() => navigate('/goals')}>
              <GoalsIcon />
            </CustomListItem>
            <CustomListItem text={t('budget')} onClick={() => navigate('/budget')}>
              <BudgetIcon />
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
