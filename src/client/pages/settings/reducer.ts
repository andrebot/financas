import { SettingsActionType } from '../../enums';
import type { SettingsAction } from '../../types';

export const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  emailError: '',
  firstNameError: '',
  lastNameError: '',
  isDirty: false,
};

/**
 * Reducer for the settings state.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export const reducer = (state: typeof initialState, action: SettingsAction) => {
  switch (action.type) {
    case SettingsActionType.SET_PROPERTY:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
        isDirty: true,
      };
    case SettingsActionType.RESET_STATE:
      return {
        ...state,
        firstName: action.payload.firstName,
        lastName: action.payload.lastName,
        email: action.payload.email,
        isDirty: false,
        emailError: '',
        firstNameError: '',
        lastNameError: '',
      };
    case SettingsActionType.SET_FIRST_NAME_ERROR:
      return { ...state, firstNameError: action.payload };
    case SettingsActionType.SET_LAST_NAME_ERROR:
      return { ...state, lastNameError: action.payload };
    case SettingsActionType.SET_IS_DIRTY:
      return { ...state, isDirty: action.payload };
    default:
      return state;
  }
};