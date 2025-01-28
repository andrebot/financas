import React, {
  ReactNode,
  useContext,
  useMemo,
  useState,
} from 'react';
import { UserType, AuthContextType } from '../types';

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
  const [user, setUser] = useState<UserType>({
    firstName: 'Andre',
    lastName: 'Almeida',
    role: 'admin',
    email: 'ab.rodriguesalmeida@gmail.com',
  });

  const authValue = useMemo(() => ({ user, setUser }), [user]);

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
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
