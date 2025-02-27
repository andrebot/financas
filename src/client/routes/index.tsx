import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import apiConfig from '../config/apiConfig';
import ProtectedRoute from './protectedRoute';
import MainPage from '../pages/mainPage';
import Login from '../pages/login';
import Register from '../pages/register';
import ResetPassword from '../pages/resetPassword';
import Settings from '../pages/settings';

/**
 * Instanciating the routes
 */
export default createBrowserRouter([
  {
    path: '/',
    element: <div><Outlet /></div>,
    children: [{
      path: '',
      element: <ProtectedRoute />,
      children: [{
        path: '',
        element: <MainPage />,
        children: [{
          path: 'settings',
          element: <Settings />,
        }],
      }],
    }, {
      path: apiConfig.user.loginPage,
      element: <Login />,
    }, {
      path: apiConfig.user.registerPage,
      element: <Register />,
    }, {
      path: apiConfig.user.resetPasswordPage,
      element: <ResetPassword />,
    }],
  },
]);
