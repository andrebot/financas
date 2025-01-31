import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import jwt from 'jsonwebtoken';
import Cookies from 'js-cookie';
import { AuthProvider, useAuth } from '../../../src/client/hooks/authContext';

describe('AuthProvider and useAuth', () => {
  const TestComponent = () => {
    const { user, setUser } = useAuth();

    return (
      <>
        <div data-testid="user-name">{user?.firstName} {user?.lastName}</div>
        <button onClick={() => user && setUser({ 
          ...user, 
          firstName: 'Updated',
          lastName: user.lastName // Ensure lastName is always defined
        })}>Update Name</button>
      </>
    );
  };

  afterAll(() => {
    Cookies.remove('refreshToken');
  });

  it('should initialize the user context with empty values', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('');
  });

  it('should be able to fetch the user from the refresh token', () => {
    const refreshToken = jwt.sign({
      id: '1234567890',
      email: 'test@test.com',
      firstName: 'Andre',
      lastName: 'Almeida',
      role: 'user',
    }, '1234567890');
    Cookies.set('refreshToken', refreshToken);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Assert that the user's name is rendered
    expect(screen.getByText('Andre Almeida')).toBeInTheDocument();
  });

  it('allows user context to be updated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    act(() => {
      screen.getByRole('button', { name: /update name/i }).click();
    });

    expect(screen.getByText('Updated Almeida')).toBeInTheDocument();
  });

  it('throws an error when useAuth is used outside of AuthProvider', () => {
    // To test this, you'll need to handle the error being thrown by useAuth when it's used outside of AuthProvider
    // This can be done by temporarily overriding the error logging function and capturing the error message
    const originalError = console.error;
    console.error = jest.fn();

    // We expect this render to throw an error
    expect(() => render(<TestComponent />)).toThrow('useAuth should be used within a Auth.Provider');

    console.error = originalError;
  });

  it('should log the error when the refresh token is invalid', () => {
    const originalError = console.error;
    console.error = jest.fn();

    Cookies.set('refreshToken', 'invalid');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(console.error).toHaveBeenCalledWith('Failed to decode refresh token:', expect.any(Error));

    console.error = originalError;
  });
});
