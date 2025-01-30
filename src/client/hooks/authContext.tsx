import React, {
  ReactNode,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import type { UserType, AuthContextType } from '../types';

type AuthProviderProps = {
  children: ReactNode;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

/**
 * Initializes the authorization context with the logged user and returns the
 * provider
 *
 * @param {AuthProviderProps} props React props
 * @returns The provider component for the authorization feature
 */
function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserType | undefined>();
  const [accessToken, setAccessToken] = useState<string | undefined>();

  useEffect(() => {
    try {
      const refreshToken = Cookies.get('refreshToken');

      if (refreshToken) {
        const {
          id,
          email,
          firstName,
          lastName,
          role,
        }: UserType = jwtDecode(refreshToken);

        setUser({
          id,
          email,
          firstName,
          lastName,
          role,
        });
      }
    } catch (error) {
      console.error('Failed to decode refresh token:', error);
    }
  }, []);

  return <AuthContext.Provider value={{ user, setUser, accessToken, setAccessToken }}>{children}</AuthContext.Provider>;
}

/**
 * This hook will provide the context for the user logged into the application
 *
 * @returns {Object} the user that is logged in
 */
function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth should be used within a Auth.Provider');
  }

  return context;
}

export {
  AuthProvider,
  useAuth,
};
