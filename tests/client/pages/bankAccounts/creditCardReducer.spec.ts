import dayjs from 'dayjs';
import {
  creditCardReducer,
  validateCreditCardForm,
  initialCreditCardFormState,
} from '../../../../src/client/pages/bankAccounts/creditCardReducer';
import { CreditCardActionType } from '../../../../src/client/enums';
import type { CreditCardFormState, CreditCardFormAction } from '../../../../src/client/types';

const createState = (overrides: Partial<CreditCardFormState> = {}): CreditCardFormState => ({
  ...initialCreditCardFormState,
  ...overrides,
});

describe('creditCardReducer', () => {
  describe('SET_NUMBER', () => {
    it('should set number when valid', () => {
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_NUMBER,
        payload: '4111111111111111',
      });

      expect(newState.number).toBe('4111111111111111');
      expect(newState.numberError).toBe('');
    });

    it('should set error when number is empty', () => {
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_NUMBER,
        payload: '',
      });

      expect(newState.number).toBe('');
      expect(newState.numberError).toBe('creditCardNumberRequired');
    });

    it('should strip non-digits and set number', () => {
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_NUMBER,
        payload: '4111 1111 1111 1111',
      });

      expect(newState.number).toBe('4111111111111111');
      expect(newState.numberError).toBe('');
    });

    it('should reject and set error when payload contains non-digit characters', () => {
      const initialState = createState({ number: '1234', numberError: '' });
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_NUMBER,
        payload: '1234a',
      });

      expect(newState.number).toBe('1234');
      expect(newState.numberError).toBe('creditCardNumberInvalid');
    });

    it('should accept payload with spaces and strip them', () => {
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_NUMBER,
        payload: '4111 1111 1111 1111',
      });

      expect(newState.number).toBe('4111111111111111');
      expect(newState.numberError).toBe('');
    });
  });

  describe('SET_EXPIRATION_DATE', () => {
    it('should set expiration date when valid (future)', () => {
      const futureDate = dayjs().add(1, 'year').toDate();
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_EXPIRATION_DATE,
        payload: futureDate,
      });

      expect(newState.expirationDate).toEqual(futureDate);
      expect(newState.expirationDateError).toBe('');
    });

    it('should set error when expiration date is empty', () => {
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_EXPIRATION_DATE,
        payload: undefined,
      });

      expect(newState.expirationDateError).toBe('expirationDateRequired');
    });

    it('should set error when expiration date is in the past', () => {
      const pastDate = dayjs().subtract(1, 'month').toDate();
      const initialState = createState();
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.SET_EXPIRATION_DATE,
        payload: pastDate,
      });

      expect(newState.expirationDateError).toBe('expirationDateInvalid');
    });
  });

  describe('VALIDATE', () => {
    it('should run full validation and set errors when form is invalid', () => {
      const initialState = createState({ number: '', expirationDate: undefined });
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.VALIDATE,
      });

      expect(newState.numberError).toBe('creditCardNumberRequired');
      expect(newState.expirationDateError).toBe('expirationDateRequired');
    });

    it('should clear errors when form is valid', () => {
      const futureDate = dayjs().add(1, 'year').toDate();
      const initialState = createState({
        number: '4111111111111111',
        expirationDate: futureDate,
      });
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.VALIDATE,
      });

      expect(newState.numberError).toBe('');
      expect(newState.expirationDateError).toBe('');
    });
  });

  describe('RESET', () => {
    it('should reset to initial state', () => {
      const initialState = createState({
        number: '4111111111111111',
        expirationDate: new Date(),
      });
      const newState = creditCardReducer(initialState, {
        type: CreditCardActionType.RESET,
      });

      expect(newState.number).toBe('');
      expect(newState.expirationDate).toBeUndefined();
      expect(newState.numberError).toBe('');
      expect(newState.expirationDateError).toBe('');
    });
  });

  it('should return current state for unknown action', () => {
    const initialState = createState({ number: '1234' });
    const newState = creditCardReducer(initialState, {
      type: 'UNKNOWN' as never,
      payload: '',
    } as CreditCardFormAction);

    expect(newState).toBe(initialState);
    expect(newState.number).toBe('1234');
  });

  describe('validateCreditCardForm', () => {
    it('should set numberError when number contains invalid characters (regExpOnlyNumbers fails)', () => {
      const state = createState({
        number: '1234a',
        expirationDate: dayjs().add(1, 'year').toDate(),
      });
      const validatedState = validateCreditCardForm(state);

      expect(validatedState.number).toBe('1234a');
      expect(validatedState.numberError).toBe('creditCardNumberInvalid');
    });
  });
});
