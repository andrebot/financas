export const initialState = {
  firstName: '',
  lastName: '',
  email: '',
  emailError: '',
  firstNameError: '',
  lastNameError: '',
  isDirty: false,
};

export enum ActionType {
  SET_FIRST_NAME_ERROR = 'SET_FIRST_NAME_ERROR',
  SET_LAST_NAME_ERROR = 'SET_LAST_NAME_ERROR',
  SET_PROPERTY = 'SET_PROPERTY',
  SET_IS_DIRTY = 'SET_IS_DIRTY',
  RESET_STATE = 'RESET_STATE',
}

export type Action = {
  type: ActionType.SET_FIRST_NAME_ERROR;
  payload: string;
} | {
  type: ActionType.SET_LAST_NAME_ERROR;
  payload: string;
} | {
  type: ActionType.SET_PROPERTY;
  payload: {
    key: string;
    value: string;
  };
} | {
  type: ActionType.SET_IS_DIRTY;
  payload: boolean;
} | {
  type: ActionType.RESET_STATE;
  payload: {
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const reducer = (state: typeof initialState, action: Action) => {
  switch (action.type) {
    case 'SET_PROPERTY':
      return {
        ...state,
        [action.payload.key]: action.payload.value,
        isDirty: true,
      };
    case 'RESET_STATE':
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
    case 'SET_FIRST_NAME_ERROR':
      return { ...state, firstNameError: action.payload };
    case 'SET_LAST_NAME_ERROR':
      return { ...state, lastNameError: action.payload };
    case 'SET_IS_DIRTY':
      return { ...state, isDirty: action.payload };
    default:
      return state;
  }
};