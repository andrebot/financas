import { regExpOnlyNumbers } from "../../utils/validators";
import { BankAccountState } from "../../types";
import { BankAccountActionType } from '../../enums';
import type { BankAccountAction } from '../../types';

/**
 * Sets the name of the bank account. The name must be between 2 and 20 characters.
 *
 * @param state - The current state
 * @param payload - The payload to set the name
 * @returns The new state
 */
function setName(state: BankAccountState, payload: string): BankAccountState {
  if (payload && payload.length > 0 && payload.length <= 20) {
    return { ...state, name: payload };
  }

  return { ...state, nameError: 'invalidName' };
}

/**
 * Sets the currency of the bank account.
 *
 * @param state - The current state
 * @param payload - The payload to set the currency
 * @returns The new state
 */
function setCurrency(state: BankAccountState, payload: string): BankAccountState {
  return { ...state, currency: payload };
}

/**
 * Sets the account number of the bank account. It cannot
 * be empty and must only contain numbers.
 *
 * @param state - The current state
 * @param payload - The payload to set the account number
 * @returns The new state
 */
function setAccountNumber(state: BankAccountState, payload: string): BankAccountState {
  const accNumbState = { ...state, accountNumber: payload, accountNumberError: '' };
      
  if (!payload || payload.length === 0) {
    accNumbState.accountNumberError = 'required';
  } else if (!regExpOnlyNumbers.test(payload)) {
    return state;
  }

  return accNumbState;
}

/**
 * Sets the agency of the bank account. It cannot be empty and must
 * only contain numbers.
 *
 * @param state - The current state
 * @param payload - The payload to set the agency
 * @returns The new state
 */
function setAgency(state: BankAccountState, payload: string): BankAccountState {
  const agencyState = { ...state, agency: payload, agencyError: '' };
      
  if (!payload || payload.length === 0) {
    agencyState.agencyError = 'required';
  } else if (!regExpOnlyNumbers.test(payload)) {
    return state;
  }

  return agencyState;
}

/**
 * Reducer for the bank account state.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export const reducer = (state: BankAccountState, action: BankAccountAction): BankAccountState => {
  const { payload, type } = action;

  switch (type) {
    case BankAccountActionType.SET_NAME:
      return setName(state, payload);
    case BankAccountActionType.SET_CURRENCY:
      return setCurrency(state, payload);
    case BankAccountActionType.SET_ACCOUNT_NUMBER:
      return setAccountNumber(state, payload);
    case BankAccountActionType.SET_AGENCY:
      return setAgency(state, payload);
    default:
      return state;
  }
}
