import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { RouterProvider, createMemoryRouter, createBrowserRouter } from 'react-router';
import { I18nextProvider } from 'react-i18next';
import { Provider } from 'react-redux';
import i18n from '../../../src/client/i18n';
import ProtectedRoute from '../../../src/client/routes/protectedRoute';
import { useAuth } from '../../../src/client/hooks/authContext';
import config from '../../../src/client/config/apiConfig';
import { store } from '../../../src/client/features/store';

jest.mock('../../../src/client/hooks/authContext', () => ({
  useAuth: jest.fn(),
}));

const mockNavigate = jest.fn();

jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet"><p>test</p></div>
}));

const user = {
  id: '1234567890',
  email: 'test@test.com',
  firstName: 'Andre',
  lastName: 'Almeida',
  role: 'user',
};

describe('ProtectedRoute', () => {
  const setUser = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setUser.mockClear();
  });

  it('renders child components for authenticated users', async () => {
    (useAuth as jest.Mock).mockReturnValue({ user, setUser });
    
    const router = createMemoryRouter([
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            index: true,
            element: <p>test</p>
          }
        ]
      }
    ], { initialEntries: ['/'] });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nextProvider>
      </Provider>
    );

    const paragraphElement = await screen.findByTestId('outlet');
    expect(paragraphElement).toBeDefined();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('redirects to login page for unauthenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, setUser });
    const router = createMemoryRouter([
      {
        path: '/',
        element: <ProtectedRoute />,
        children: [
          {
            path: '',
            index: true,
            element: <p>test</p>
          }
        ]
      }
    ], { initialEntries: ['/'] });

    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router} />
        </I18nextProvider>
      </Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith(config.user.loginPage);
  });
});
