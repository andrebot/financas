import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { clearAccessToken } from '../features/authSlice';
import { useAuth } from './authContext';
import { useLogoutMutation } from '../features/login';

/**
 * Handles the logout process. It will clear the access token,
 * the user and navigate to the login page even if the logout
 * fails.
 */
export function useLogout() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { setUser } = useAuth();
  const [logout, { isLoading }] = useLogoutMutation();

  /**
   * Handles the logout process. It will clear the access token,
   * the user and navigate to the login page even if the logout
   * fails.
   *
   * @remarks
   * shouldCallLogout is used to avoid calling the logout mutation in
   * case the user cannot be logged out (E.G.: the user was just deleted) but
   * we want to clean the user from the state and soft logout the user.
   *
   * @param shouldCallLogoutApi - Whether to call the logout mutation
   */
  const handleLogout = useCallback(async (shouldCallLogoutApi = true) => {
    try {
      if (shouldCallLogoutApi) {
        await logout();
      }
    } catch (error) {
      enqueueSnackbar(t('logoutFailed'), { variant: 'error' });
    } finally {
      setUser(undefined);
      dispatch(clearAccessToken());
      navigate('/login');
    }
  }, [enqueueSnackbar, t, dispatch, navigate, setUser]);

  return { handleLogout, isLoggingOut: isLoading };
}
