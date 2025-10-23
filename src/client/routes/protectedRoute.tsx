import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from '../hooks/authContext';
import LoginPage from '../pages/login';
import LoadingPage from '../pages/loadingPage';
import config from '../config/apiConfig';

/**
 * A component that protects a route by checking if the user is authenticated.
 * If the user is authenticated, it renders the child components defined by the `Outlet` component.
 * If the user is not authenticated, it redirects to the login page.
 */
export default function ProtectedRoute(): React.JSX.Element | undefined {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate(config.user.loginPage);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return <Outlet />;
}
