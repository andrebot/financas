import dayjs from 'dayjs';
import { regExpOnlyNumbers } from '../../utils/validators';
import { CreditCardActionType } from '../../enums';
import type { CreditCardFormState, CreditCardFormAction } from '../../types';

const MAX_CARD_DIGITS = 16;

const initialState: CreditCardFormState = {
  number: '',
  expirationDate: undefined,
  flag: '',
  numberError: '',
  expirationDateError: '',
};

/**
 * Validates and sets the credit card number. Must not be empty and must contain only digits (regExpOnlyNumbers).
 * Allows spaces for formatting (e.g. "4111 1111"); rejects any other non-digit characters.
 *
 * @param state - The current state
 * @param payload - The number to set
 * @returns The new state
 */
function setNumber(state: CreditCardFormState, payload: string): CreditCardFormState {
  const digitsWithoutSpaces = payload.replace(/\s/g, '').slice(0, MAX_CARD_DIGITS);
  const nextState = { ...state, numberError: '' };

  if (!digitsWithoutSpaces || digitsWithoutSpaces.length === 0) {
    return { ...nextState, number: '', numberError: 'creditCardNumberRequired' };
  }

  if (!regExpOnlyNumbers.test(digitsWithoutSpaces)) {
    return { ...nextState, number: digitsWithoutSpaces, numberError: 'creditCardNumberInvalid' };
  }

  return { ...nextState, number: digitsWithoutSpaces };
}

/**
 * Validates and sets the expiration date. Must not be empty and must not be before today.
 *
 * @param state - The current state
 * @param payload - The expiration date to set
 * @returns The new state
 */
function setExpirationDate(
  state: CreditCardFormState,
  payload: Date | undefined
): CreditCardFormState {
  const nextState = { ...state, expirationDate: payload, expirationDateError: '' };

  if (!payload) {
    nextState.expirationDateError = 'expirationDateRequired';
    return nextState;
  }

  const expirationStartOfMonth = dayjs(payload).startOf('month');
  const todayStartOfMonth = dayjs().startOf('month');

  if (expirationStartOfMonth.isBefore(todayStartOfMonth)) {
    nextState.expirationDateError = 'expirationDateInvalid';
    return nextState;
  }

  return nextState;
}

/**
 * Runs full validation on the current state (e.g. on submit).
 *
 * @param state - The current state
 * @returns The new state with validation errors
 */
export function validateCreditCardForm(state: CreditCardFormState): CreditCardFormState {
  return setExpirationDate(setNumber(state, state.number), state.expirationDate);
}

/**
 * Reducer for the credit card form state with validation.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export function creditCardReducer(
  state: CreditCardFormState,
  action: CreditCardFormAction
): CreditCardFormState {
  switch (action.type) {
    case CreditCardActionType.SET_NUMBER:
      return setNumber(state, action.payload);
    case CreditCardActionType.SET_EXPIRATION_DATE:
      return setExpirationDate(state, action.payload);
    case CreditCardActionType.VALIDATE:
      return validateCreditCardForm(state);
    case CreditCardActionType.RESET:
      return { ...initialState };
    default:
      return state;
  }
}

export const initialCreditCardFormState: CreditCardFormState = { ...initialState };
