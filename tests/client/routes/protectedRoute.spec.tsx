import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';;
import i18n from '../../../src/client/i18n';
import ProtectedRoute from '../../../src/client/routes/protectedRoute';
import { useAuth } from '../../../src/client/hooks/authContext';
import config from '../../../src/client/config/apiConfig';

jest.mock('../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('ProtectedRoute', () => {
  it('renders child components for authenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { name: 'John Doe' } });
    const router = createBrowserRouter([{
      path: '/',
      element: <ProtectedRoute />,
      children: [{
        path: '',
        element: <p>test</p>,
        children: [],
      }]
    }]);

    render(
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router}></RouterProvider>
      </I18nextProvider>
    );

    const paragraphElement = screen.getByText('test');
    expect(paragraphElement).toBeDefined();
  });

  it('redirects to login page for unauthenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(
      <I18nextProvider i18n={i18n}>
        <ProtectedRoute />);
      </I18nextProvider>
    );

    expect(mockNavigate).toHaveBeenCalledWith(config.user.loginPage);
  });

  it('renders LoadingPage while authentication status is being determined', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: undefined });
    render(
      <I18nextProvider i18n={i18n}>
        <ProtectedRoute />);
      </I18nextProvider>
    );

    expect(screen.getByText('Loading...'));
  });
});
