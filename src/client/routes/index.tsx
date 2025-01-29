import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import apiConfig from '../config/apiConfig';
import ProtectedRoute from './protectedRoute';
import MainPage from '../pages/mainPage';
import Login from '../pages/login';

/**
 * Instanciating the routes
 */
export default createBrowserRouter([
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [{
      path: '',
      element: <MainPage />,
      children: [],
    }, {
      path: apiConfig.user.loginPage,
      element: <Login />,
    }],
  },
]);
