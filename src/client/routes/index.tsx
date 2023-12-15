import React from 'react';
import { createBrowserRouter } from 'react-router-dom';

import ProtectedRoute from './protectedRoute';
import MainPage from '../pages/mainPage';

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
    }],
  },
]);
