import { regExpOnlyNumbers, regExpName } from '../../utils/validators';
import { BankAccountState } from '../../types';
import { BankAccountActionType } from '../../enums';
import type { BankAccountAction } from '../../types';

/**
 * Sets the name of the bank account. Must not be empty and must not contain special characters.
 *
 * @param state - The current state
 * @param payload - The payload to set the name
 * @returns The new state
 */
function setName(state: BankAccountState, payload: string): BankAccountState {
  const nextState = { ...state, name: payload, nameError: '' };

  if (!payload || payload.trim().length === 0) {
    nextState.nameError = 'nameRequired';
    return nextState;
  }

  if (!regExpName.test(payload)) {
    nextState.nameError = 'nameInvalid';
    return nextState;
  }

  return nextState;
}

/**
 * Sets the currency of the bank account. Must not be empty.
 *
 * @param state - The current state
 * @param payload - The payload to set the currency
 * @returns The new state
 */
function setCurrency(state: BankAccountState, payload: string): BankAccountState {
  const nextState = { ...state, currency: payload, currencyError: '' };

  if (!payload || payload.length === 0) {
    nextState.currencyError = 'currencyRequired';
    return nextState;
  }

  return nextState;
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
  const nextState = { ...state, accountNumberError: '' };

  if (!payload || payload.length === 0) {
    nextState.accountNumberError = 'accountNumberRequired';
    nextState.accountNumber = payload;
    return nextState;
  }

  if (!regExpOnlyNumbers.test(payload)) {
    return state;
  }

  nextState.accountNumber = payload;
  return nextState;
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
  const nextState = { ...state, agencyError: '' };

  if (!payload || payload.length === 0) {
    nextState.agencyError = 'agencyRequired';
    nextState.agency = payload;
    return nextState;
  }

  if (!regExpOnlyNumbers.test(payload)) {
    return state;
  }

  nextState.agency = payload;
  return nextState;
}

/**
 * Runs full validation on the current state (e.g. on submit).
 *
 * @param state - The current state
 * @returns The new state with validation errors
 */
export function validateBankAccountForm(state: BankAccountState): BankAccountState {
  let nextState = setName(state, state.name);
  nextState = setCurrency(nextState, state.currency);
  nextState = setAccountNumber(nextState, state.accountNumber);
  nextState = setAgency(nextState, state.agency);
  return nextState;
}

/**
 * Reducer for the bank account state.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export const reducer = (state: BankAccountState, action: BankAccountAction): BankAccountState => {
  if (action.type === BankAccountActionType.VALIDATE) {
    return validateBankAccountForm(state);
  }

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
