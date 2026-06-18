import {
  initialTransactionFormState,
  transactionFormReducer,
  validateTransactionFormState,
  hasTransactionFormErrors,
} from '../../../../../src/client/pages/transactions/addTransactionForm/TransactionFormReducer';
import { TRANSACTION_TYPES, TransactionFormActionType } from '../../../../../src/client/enums';
import type { Transaction } from '../../../../../src/client/types';

describe('transactionFormReducer', () => {
  describe('initialTransactionFormState', () => {
    it('has correct default values', () => {
      expect(initialTransactionFormState.name).toBe('');
      expect(initialTransactionFormState.value).toBe(0);
      expect(initialTransactionFormState.bankAccountId).toBe(0);
      expect(initialTransactionFormState.categoryId).toBe(0);
      expect(initialTransactionFormState.cardId).toBeUndefined();
      expect(initialTransactionFormState.isCardType).toBe(false);
      expect(initialTransactionFormState.date).toBeInstanceOf(Date);
      expect(initialTransactionFormState.type).toBeUndefined();
      expect(initialTransactionFormState.nameError).toBe('');
      expect(initialTransactionFormState.valueError).toBe('');
      expect(initialTransactionFormState.typeError).toBe('');
      expect(initialTransactionFormState.dateError).toBe('');
      expect(initialTransactionFormState.categoryError).toBe('');
      expect(initialTransactionFormState.bankAccountError).toBe('');
    });
  });

  describe('SET_NAME', () => {
    it('sets name when a valid name is provided', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_NAME,
        payload: 'Coffee',
      });
      expect(result.name).toBe('Coffee');
      expect(result.nameError).toBe('');
    });

    it('sets nameError to nameRequired when name is empty', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_NAME,
        payload: '',
      });
      expect(result.nameError).toBe('nameRequired');
    });

    it('sets nameError to nameRequired when name is whitespace only', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_NAME,
        payload: '   ',
      });
      expect(result.nameError).toBe('nameRequired');
    });

    it('sets nameError to nameInvalid when name fails regex', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_NAME,
        payload: '<script>alert(1)</script>',
      });
      expect(result.nameError).toBe('nameInvalid');
    });
  });

  describe('SET_VALUE', () => {
    it('sets value when a valid positive number is provided', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_VALUE,
        payload: 100,
      });
      expect(result.value).toBe(100);
      expect(result.valueError).toBe('');
    });

    it('sets valueError to valueMustBeGreaterThanZero when value is 0', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_VALUE,
        payload: 0,
      });
      expect(result.valueError).toBe('valueMustBeGreaterThanZero');
    });

    it('sets valueError to valueRequired when value is NaN', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_VALUE,
        payload: NaN,
      });
      expect(result.valueError).toBe('valueRequired');
    });

    it('sets valueError to valueRequired and value to 0 when payload is null', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_VALUE,
        payload: null,
      });
      expect(result.value).toBe(0);
      expect(result.valueError).toBe('valueRequired');
    });

    it('sets valueError to valueMustBeGreaterThanZero when value is negative', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_VALUE,
        payload: -10,
      });
      expect(result.valueError).toBe('valueMustBeGreaterThanZero');
    });
  });

  describe('SET_TYPE', () => {
    it('sets type to deposit', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_TYPE,
        payload: TRANSACTION_TYPES.DEPOSIT,
      });
      expect(result.type).toBe(TRANSACTION_TYPES.DEPOSIT);
      expect(result.typeError).toBe('');
    });

    it('sets isCardType to true for cardPurchase', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_TYPE,
        payload: TRANSACTION_TYPES.CARD_PURCHASE,
      });
      expect(result.isCardType).toBe(true);
    });

    it('sets isCardType to true for cardRefund', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_TYPE,
        payload: TRANSACTION_TYPES.CARD_REFUND,
      });
      expect(result.isCardType).toBe(true);
    });

    it('sets isCardType to false for non-card types', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_TYPE,
        payload: TRANSACTION_TYPES.WITHDRAW,
      });
      expect(result.isCardType).toBe(false);
    });

    it('clears cardId when switching from card type to non-card type', () => {
      const stateWithCard = { ...initialTransactionFormState, cardId: 5, isCardType: true };
      const result = transactionFormReducer(stateWithCard, {
        type: TransactionFormActionType.SET_TYPE,
        payload: TRANSACTION_TYPES.WITHDRAW,
      });
      expect(result.cardId).toBeUndefined();
    });

    it('preserves cardId when switching between card types', () => {
      const stateWithCard = { ...initialTransactionFormState, cardId: 5, isCardType: true };
      const result = transactionFormReducer(stateWithCard, {
        type: TransactionFormActionType.SET_TYPE,
        payload: TRANSACTION_TYPES.CARD_REFUND,
      });
      expect(result.cardId).toBe(5);
    });

    it('sets typeError to typeInvalid when type is not a known TRANSACTION_TYPES value', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_TYPE,
        payload: 'unknownType' as TRANSACTION_TYPES,
      });
      expect(result.typeError).toBe('typeInvalid');
    });
  });

  describe('SET_CATEGORY_ID', () => {
    it('sets categoryId', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_CATEGORY_ID,
        payload: 3,
      });
      expect(result.categoryId).toBe(3);
      expect(result.categoryError).toBe('');
    });

    it('sets categoryError to categoryRequired when value is 0', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_CATEGORY_ID,
        payload: 0,
      });
      expect(result.categoryError).toBe('categoryRequired');
    });
  });

  describe('SET_BANK_ACCOUNT_ID', () => {
    it('sets bankAccountId', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_BANK_ACCOUNT_ID,
        payload: 7,
      });
      expect(result.bankAccountId).toBe(7);
      expect(result.bankAccountError).toBe('');
    });

    it('sets bankAccountError to bankAccountRequired when value is 0', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_BANK_ACCOUNT_ID,
        payload: 0,
      });
      expect(result.bankAccountError).toBe('bankAccountRequired');
    });
  });

  describe('SET_CARD_ID', () => {
    it('sets cardId to a number', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_CARD_ID,
        payload: 42,
      });
      expect(result.cardId).toBe(42);
    });

    it('sets cardId to undefined', () => {
      const stateWithCard = { ...initialTransactionFormState, cardId: 42 };
      const result = transactionFormReducer(stateWithCard, {
        type: TransactionFormActionType.SET_CARD_ID,
        payload: undefined,
      });
      expect(result.cardId).toBeUndefined();
    });
  });

  describe('SET_DATE', () => {
    it('sets date when a valid past date is provided', () => {
      const pastDate = new Date('2020-01-01');
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_DATE,
        payload: pastDate,
      });
      expect(result.date).toEqual(pastDate);
      expect(result.dateError).toBe('');
    });

    it('sets dateError to dateRequired when payload is null', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_DATE,
        payload: null,
      });
      expect(result.dateError).toBe('dateRequired');
    });

    it('sets dateError to dateRequired when payload is undefined', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_DATE,
        payload: undefined,
      });
      expect(result.dateError).toBe('dateRequired');
    });

    it('sets dateError to dateMustNotBeInTheFuture for a future date', () => {
      const futureDate = new Date(Date.now() + 86400000 * 2);
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.SET_DATE,
        payload: futureDate,
      });
      expect(result.dateError).toBe('dateMustNotBeInTheFuture');
    });
  });

  describe('RESET', () => {
    it('returns initialTransactionFormState', () => {
      const modifiedState = {
        ...initialTransactionFormState,
        name: 'Coffee',
        value: 100,
        nameError: 'someError',
      };
      const result = transactionFormReducer(modifiedState, {
        type: TransactionFormActionType.RESET,
      });
      expect(result.name).toBe('');
      expect(result.value).toBe(0);
      expect(result.nameError).toBe('');
    });
  });

  describe('EDIT', () => {
    const mockTransaction: Transaction = {
      id: 10,
      name: 'Lunch',
      value: 25,
      type: TRANSACTION_TYPES.CARD_PURCHASE,
      date: '2024-03-15T12:00:00Z',
      accountId: 2,
      categoryId: 5,
      cardId: 7,
      userId: 1,
    };

    it('populates all fields from a Transaction object', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.EDIT,
        payload: mockTransaction,
      });
      expect(result.id).toBe(10);
      expect(result.name).toBe('Lunch');
      expect(result.value).toBe(25);
      expect(result.type).toBe(TRANSACTION_TYPES.CARD_PURCHASE);
      expect(result.bankAccountId).toBe(2);
      expect(result.categoryId).toBe(5);
      expect(result.cardId).toBe(7);
      expect(result.date).toEqual(new Date('2024-03-15T12:00:00Z'));
    });

    it('sets isCardType to true for cardPurchase', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.EDIT,
        payload: mockTransaction,
      });
      expect(result.isCardType).toBe(true);
    });

    it('sets isCardType to false for non-card type', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.EDIT,
        payload: { ...mockTransaction, type: TRANSACTION_TYPES.DEPOSIT },
      });
      expect(result.isCardType).toBe(false);
    });

    it('clears all error fields', () => {
      const stateWithErrors = {
        ...initialTransactionFormState,
        nameError: 'error',
        valueError: 'error',
        typeError: 'error',
        dateError: 'error',
        categoryError: 'error',
        bankAccountError: 'error',
      };
      const result = transactionFormReducer(stateWithErrors, {
        type: TransactionFormActionType.EDIT,
        payload: mockTransaction,
      });
      expect(result.nameError).toBe('');
      expect(result.valueError).toBe('');
      expect(result.typeError).toBe('');
      expect(result.dateError).toBe('');
      expect(result.categoryError).toBe('');
      expect(result.bankAccountError).toBe('');
    });
  });

  describe('VALIDATE', () => {
    it('populates all errors when state is blank', () => {
      const result = transactionFormReducer(initialTransactionFormState, {
        type: TransactionFormActionType.VALIDATE,
      });
      expect(result.nameError).toBeTruthy();
      expect(result.valueError).toBeTruthy();
      expect(result.typeError).toBeTruthy();
      expect(result.categoryError).toBeTruthy();
      expect(result.bankAccountError).toBeTruthy();
    });
  });

  describe('unknown action type', () => {
    it('returns state unchanged for unrecognised action', () => {
      const state = { ...initialTransactionFormState, name: 'test' };
      const result = transactionFormReducer(state, { type: 'UNKNOWN' as TransactionFormActionType } as any);
      expect(result).toBe(state);
    });
  });

  describe('validateTransactionFormState', () => {
    it('returns state with all errors populated for blank state', () => {
      const result = validateTransactionFormState(initialTransactionFormState);
      expect(result.nameError).toBeTruthy();
      expect(result.valueError).toBeTruthy();
      expect(result.typeError).toBeTruthy();
      expect(result.categoryError).toBeTruthy();
      expect(result.bankAccountError).toBeTruthy();
    });

    it('returns state with no errors when all fields are valid', () => {
      const validState = {
        ...initialTransactionFormState,
        name: 'Coffee',
        value: 10,
        type: TRANSACTION_TYPES.DEPOSIT,
        date: new Date('2020-01-01'),
        categoryId: 1,
        bankAccountId: 2,
      };
      const result = validateTransactionFormState(validState);
      expect(result.nameError).toBe('');
      expect(result.valueError).toBe('');
      expect(result.typeError).toBe('');
      expect(result.dateError).toBe('');
      expect(result.categoryError).toBe('');
      expect(result.bankAccountError).toBe('');
    });
  });

  describe('hasTransactionFormErrors', () => {
    it('returns true when nameError is set', () => {
      expect(hasTransactionFormErrors({ ...initialTransactionFormState, nameError: 'nameRequired' })).toBe(true);
    });

    it('returns true when valueError is set', () => {
      expect(hasTransactionFormErrors({ ...initialTransactionFormState, valueError: 'valueRequired' })).toBe(true);
    });

    it('returns true when typeError is set', () => {
      expect(hasTransactionFormErrors({ ...initialTransactionFormState, typeError: 'typeRequired' })).toBe(true);
    });

    it('returns true when dateError is set', () => {
      expect(hasTransactionFormErrors({ ...initialTransactionFormState, dateError: 'dateRequired' })).toBe(true);
    });

    it('returns true when categoryError is set', () => {
      expect(hasTransactionFormErrors({ ...initialTransactionFormState, categoryError: 'categoryRequired' })).toBe(true);
    });

    it('returns true when bankAccountError is set', () => {
      expect(hasTransactionFormErrors({ ...initialTransactionFormState, bankAccountError: 'bankAccountRequired' })).toBe(true);
    });

    it('returns false when all errors are empty', () => {
      const validState = {
        ...initialTransactionFormState,
        nameError: '',
        valueError: '',
        typeError: '',
        dateError: '',
        categoryError: '',
        bankAccountError: '',
      };
      expect(hasTransactionFormErrors(validState)).toBe(false);
    });
  });
});
