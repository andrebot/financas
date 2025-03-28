import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/authContext';
import LoginPage from '../pages/login';
import config from '../config/apiConfig';

/**
 * A component that protects a route by checking if the user is authenticated.
 * If the user is authenticated, it renders the child components defined by the `Outlet` component.
 * If the user is not authenticated, it redirects to the login page.
 */
export default function ProtectedRoute(): React.JSX.Element | undefined {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate(config.user.loginPage, { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return <LoginPage />;
  }

  return <Outlet />;
}
