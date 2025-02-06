import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';;
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
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
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
    setUser.mockClear();
  });

  it('renders child components for authenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({ user, setUser });
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
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <RouterProvider router={router}></RouterProvider>
        </I18nextProvider>
      </Provider>
    );

    const paragraphElement = screen.getByText('test');
    expect(paragraphElement).toBeDefined();
  });

  it('redirects to login page for unauthenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null, setUser });
    render(
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <ProtectedRoute />;
        </I18nextProvider>
      </Provider>
    );

    expect(mockNavigate).toHaveBeenCalledWith(config.user.loginPage);
  });
});
