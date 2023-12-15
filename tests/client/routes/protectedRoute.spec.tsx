import React from 'react';
import { render, screen } from '@testing-library/react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
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
      <RouterProvider router={router}></RouterProvider>
    );

    const paragraphElement = screen.getByText('test');
    expect(paragraphElement).toBeDefined();
  });

  it('redirects to login page for unauthenticated users', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: null });
    render(<ProtectedRoute />);

    expect(mockNavigate).toHaveBeenCalledWith(config.user.loginPage);
  });

  it('renders LoadingPage while authentication status is being determined', () => {
    (useAuth as jest.Mock).mockReturnValue({ user: undefined });
    render(<ProtectedRoute />);

    expect(screen.getByText('Loading...'));
  });
});
