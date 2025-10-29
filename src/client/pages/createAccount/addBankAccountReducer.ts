import { regExpOnlyNumbers } from "../../utils/validators";
import { BankAccountState } from "../../types";

export enum ActionType {
  SET_NAME = 'SET_NAME',
  SET_CURRENCY = 'SET_CURRENCY',
  SET_ACCOUNT_NUMBER = 'SET_ACCOUNT_NUMBER',
  SET_AGENCY = 'SET_AGENCY',
}

export type Action = {
  type: ActionType.SET_NAME;
  payload: string;
} | {
  type: ActionType.SET_CURRENCY;
  payload: string;
} | {
  type: ActionType.SET_ACCOUNT_NUMBER;
  payload: string;
} | {
  type: ActionType.SET_AGENCY;
  payload: string;
}

export const reducer = (state: BankAccountState, action: Action): BankAccountState => {
  const { payload, type } = action;

  switch (type) {
    case ActionType.SET_NAME:
      if (payload && payload.length > 0 && payload.length <= 20) {
        return { ...state, name: payload };
      }

      return { ...state, nameError: 'invalidName' };
    case ActionType.SET_CURRENCY:
      return { ...state, currency: payload };
    case ActionType.SET_ACCOUNT_NUMBER:
      const accNumbState = { ...state, accountNumber: payload, accountNumberError: '' };
      
      if (!payload || payload.length === 0) {
        accNumbState.accountNumberError = 'required';
      } else if (!regExpOnlyNumbers.test(payload)) {
        return state;
      }

      return accNumbState;
    case ActionType.SET_AGENCY:
      const agencyState = { ...state, accountNumber: payload, agencyError: '' };
      
      if (!payload || payload.length === 0) {
        agencyState.agencyError = 'required';
      } else if (!regExpOnlyNumbers.test(payload)) {
        return state;
      }

      return agencyState;
    default:
      return state;
  }
}