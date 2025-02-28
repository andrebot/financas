export const initialState = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  isDirty: false,
  newPasswordError: '',
  confirmPasswordError: '',
};

export enum ActionType {
  SET_PROPERTY = 'SET_PROPERTY',
  SET_NEW_PASSWORD_ERROR = 'SET_NEW_PASSWORD_ERROR',
  SET_CONFIRM_PASSWORD_ERROR = 'SET_CONFIRM_PASSWORD_ERROR',
};

export type Action = {
  type: ActionType.SET_PROPERTY;
  payload: { key: string; value: string };
} | {
  type: ActionType.SET_NEW_PASSWORD_ERROR;
  payload: string;
} | {
  type: ActionType.SET_CONFIRM_PASSWORD_ERROR;
  payload: string;
};

export const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case 'SET_PROPERTY':
      return { ...state, [action.payload.key]: action.payload.value, isDirty: true };
    case 'SET_NEW_PASSWORD_ERROR':
      return { ...state, newPasswordError: action.payload };
    case 'SET_CONFIRM_PASSWORD_ERROR':
      return { ...state, confirmPasswordError: action.payload };
    default:
      return state;
  }
};
