import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import apiConfig from '../config/apiConfig';
import ProtectedRoute from './protectedRoute';
import MainPage from '../pages/mainPage';
import Login from '../pages/login';
import Register from '../pages/register';
import ResetPassword from '../pages/resetPassword';
import Settings from '../pages/settings';

export default function routes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute />} >
          <Route path="/" element={<MainPage />} >
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path={apiConfig.user.loginPage} element={<Login />} />
        <Route path={apiConfig.user.registerPage} element={<Register />} />
        <Route path={apiConfig.user.resetPasswordPage} element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}