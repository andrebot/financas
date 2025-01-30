import React from 'react';
import { createBrowserRouter, Outlet } from 'react-router-dom';
import apiConfig from '../config/apiConfig';
import ProtectedRoute from './protectedRoute';
import MainPage from '../pages/mainPage';
import Login from '../pages/login';
import Register from '../pages/register';

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
      }],
    }, {
      path: apiConfig.user.loginPage,
      element: <Login />,
    }, {
      path: apiConfig.user.registerPage,
      element: <Register />,
    }],
  },
]);
