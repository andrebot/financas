import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../../src/client/hooks/authContext';

describe('AuthProvider and useAuth', () => {
  const TestComponent = () => {
    const { user, setUser } = useAuth();

    return (
      <>
        <div>{user?.firstName} {user?.lastName}</div>
        <button onClick={() => user && setUser({ 
          ...user, 
          firstName: 'Updated',
          lastName: user.lastName // Ensure lastName is always defined
        })}>Update Name</button>
      </>
    );
  };

  it('provides user context to children', () => {
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
});
