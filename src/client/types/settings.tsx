import { ChangePasswordActionType, SettingsActionType } from '../enums';

export type ChangePasswordAction = {
  type: ChangePasswordActionType.SET_PROPERTY;
  payload: { key: string; value: string };
} | {
  type: ChangePasswordActionType.SET_NEW_PASSWORD_ERROR;
  payload: string;
} | {
  type: ChangePasswordActionType.SET_CONFIRM_PASSWORD_ERROR;
  payload: string;
};

export type SettingsAction = {
  type: SettingsActionType.SET_FIRST_NAME_ERROR;
  payload: string;
} | {
  type: SettingsActionType.SET_LAST_NAME_ERROR;
  payload: string;
} | {
  type: SettingsActionType.SET_PROPERTY;
  payload: {
    key: string;
    value: string;
  };
} | {
  type: SettingsActionType.SET_IS_DIRTY;
  payload: boolean;
} | {
  type: SettingsActionType.RESET_STATE;
  payload: {
    firstName: string;
    lastName: string;
    email: string;
  };
};
