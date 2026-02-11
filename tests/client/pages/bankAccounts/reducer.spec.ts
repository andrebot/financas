import { reducer } from '../../../../src/client/pages/bankAccounts/addBankAccountReducer';
import { BankAccountActionType } from '../../../../src/client/enums';
import type { BankAccountState, BankAccountAction } from '../../../../src/client/types';

const createState = (overrides: Partial<BankAccountState> = {}): BankAccountState => ({
  name: '',
  currency: '',
  accountNumber: '',
  agency: '',
  nameError: '',
  currencyError: '',
  accountNumberError: '',
  agencyError: '',
  ...overrides,
});

const reduce = (state: BankAccountState, type: BankAccountActionType, payload: string): BankAccountState =>
  reducer(state, { type, payload } as BankAccountAction);

describe('addBankAccountReducer', () => {
  describe('SET_NAME', () => {
    it('should set name when length is valid', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, 'My Account');

      expect(newState.name).toBe('My Account');
      expect(newState.nameError).toBe('');
    });

    it('should set error when name is empty', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, '');

      expect(newState.nameError).toBe('invalidName');
    });

    it('should set error when name is too long', () => {
      const initialState = createState();
      const longName = 'a'.repeat(21);
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, longName);

      expect(newState.nameError).toBe('invalidName');
    });
  });

  describe('SET_CURRENCY', () => {
    it('should set currency', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_CURRENCY, 'USD');

      expect(newState.currency).toBe('USD');
    });
  });

  describe('SET_ACCOUNT_NUMBER', () => {
    it('should set account number when valid', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_ACCOUNT_NUMBER, '123456');

      expect(newState.accountNumber).toBe('123456');
      expect(newState.accountNumberError).toBe('');
    });

    it('should set required error when empty', () => {
      const initialState = createState({ accountNumberError: '' });
      const newState = reduce(initialState, BankAccountActionType.SET_ACCOUNT_NUMBER, '');

      expect(newState.accountNumberError).toBe('required');
    });

    it('should keep previous state when invalid (non numeric)', () => {
      const initialState = createState({ accountNumber: '1234', accountNumberError: '' });
      const newState = reduce(initialState, BankAccountActionType.SET_ACCOUNT_NUMBER, '12ab');

      expect(newState).toBe(initialState);
    });
  });

  describe('SET_AGENCY', () => {
    it('should set agency when valid', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_AGENCY, '9876');

      expect(newState.agency).toBe('9876');
      expect(newState.agencyError).toBe('');
    });

    it('should set required error when empty', () => {
      const initialState = createState({ agencyError: '' });
      const newState = reduce(initialState, BankAccountActionType.SET_AGENCY, '');

      expect(newState.agencyError).toBe('required');
    });

    it('should keep previous state when invalid (non numeric)', () => {
      const initialState = createState({ agency: '1234', agencyError: '' });
      const newState = reduce(initialState, BankAccountActionType.SET_AGENCY, '12ab');

      expect(newState).toBe(initialState);
    });
  });

  it('should return current state for unknown action', () => {
    const initialState = createState();
    const newState = reducer(initialState, { type: 'UNKNOWN' as never, payload: '' } as BankAccountAction);

    expect(newState).toBe(initialState);
  });
});

