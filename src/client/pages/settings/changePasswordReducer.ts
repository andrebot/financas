import { ChangePasswordActionType } from '../../enums';
import type { ChangePasswordAction } from '../../types';

export const initialState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  isDirty: false,
  newPasswordError: '',
  confirmPasswordError: '',
};

/**
 * Reducer for the change password state.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export const reducer = (state: typeof initialState, action: ChangePasswordAction) => {
  switch (action.type) {
    case ChangePasswordActionType.SET_PROPERTY:
      return { ...state, [action.payload.key]: action.payload.value, isDirty: true };
    case ChangePasswordActionType.SET_NEW_PASSWORD_ERROR:
      return { ...state, newPasswordError: action.payload };
    case ChangePasswordActionType.SET_CONFIRM_PASSWORD_ERROR:
      return { ...state, confirmPasswordError: action.payload };
    default:
      return state;
  }
};
