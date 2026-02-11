import {
  reducer,
  validateBankAccountForm,
} from '../../../../src/client/pages/bankAccounts/addBankAccountReducer';
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
    it('should set name when valid', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, 'My Account');

      expect(newState.name).toBe('My Account');
      expect(newState.nameError).toBe('');
    });

    it('should set error when name is empty', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, '');

      expect(newState.nameError).toBe('nameRequired');
    });

    it('should set error when name is only whitespace', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, '   ');

      expect(newState.nameError).toBe('nameRequired');
    });

    it('should set error when name contains special characters', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, 'Account@123');

      expect(newState.nameError).toBe('nameInvalid');
    });

    it('should accept name with spaces, hyphens and accents', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_NAME, 'São José-Pinhal');

      expect(newState.name).toBe('São José-Pinhal');
      expect(newState.nameError).toBe('');
    });
  });

  describe('SET_CURRENCY', () => {
    it('should set currency when valid', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_CURRENCY, 'USD');

      expect(newState.currency).toBe('USD');
      expect(newState.currencyError).toBe('');
    });

    it('should set error when currency is empty', () => {
      const initialState = createState();
      const newState = reduce(initialState, BankAccountActionType.SET_CURRENCY, '');

      expect(newState.currencyError).toBe('currencyRequired');
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

      expect(newState.accountNumberError).toBe('accountNumberRequired');
      expect(newState.accountNumber).toBe('');
    });

    it('should keep previous state when invalid (non numeric)', () => {
      const initialState = createState({ accountNumber: '1234', accountNumberError: '' });
      const newState = reduce(initialState, BankAccountActionType.SET_ACCOUNT_NUMBER, '12ab');

      expect(newState).toBe(initialState);
      expect(newState.accountNumber).toBe('1234');
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

      expect(newState.agencyError).toBe('agencyRequired');
      expect(newState.agency).toBe('');
    });

    it('should keep previous state when invalid (non numeric)', () => {
      const initialState = createState({ agency: '1234', agencyError: '' });
      const newState = reduce(initialState, BankAccountActionType.SET_AGENCY, '12ab');

      expect(newState).toBe(initialState);
      expect(newState.agency).toBe('1234');
    });
  });

  describe('VALIDATE', () => {
    it('should run full validation and set all errors when form is invalid', () => {
      const initialState = createState({
        name: '',
        currency: '',
        accountNumber: '',
        agency: '',
      });
      const newState = reducer(initialState, { type: BankAccountActionType.VALIDATE } as BankAccountAction);

      expect(newState.nameError).toBe('nameRequired');
      expect(newState.currencyError).toBe('currencyRequired');
      expect(newState.accountNumberError).toBe('accountNumberRequired');
      expect(newState.agencyError).toBe('agencyRequired');
    });

    it('should clear errors when form is valid', () => {
      const initialState = createState({
        name: 'My Account',
        currency: 'BRL',
        accountNumber: '12345',
        agency: '0001',
      });
      const newState = reducer(initialState, { type: BankAccountActionType.VALIDATE } as BankAccountAction);

      expect(newState.nameError).toBe('');
      expect(newState.currencyError).toBe('');
      expect(newState.accountNumberError).toBe('');
      expect(newState.agencyError).toBe('');
    });

    it('should set only invalid field errors on partial validation', () => {
      const initialState = createState({
        name: '',
        currency: 'BRL',
        accountNumber: '12345',
        agency: '0001',
      });
      const newState = reducer(initialState, { type: BankAccountActionType.VALIDATE } as BankAccountAction);

      expect(newState.nameError).toBe('nameRequired');
      expect(newState.currencyError).toBe('');
      expect(newState.accountNumberError).toBe('');
      expect(newState.agencyError).toBe('');
    });
  });

  it('should return current state for unknown action', () => {
    const initialState = createState({ name: 'Test' });
    const newState = reducer(initialState, { type: 'UNKNOWN' as never, payload: '' } as BankAccountAction);

    expect(newState).toBe(initialState);
    expect(newState.name).toBe('Test');
  });
});

describe('validateBankAccountForm', () => {
  it('should return validated state with all errors when form is empty', () => {
    const state = createState();
    const validatedState = validateBankAccountForm(state);

    expect(validatedState.nameError).toBe('nameRequired');
    expect(validatedState.currencyError).toBe('currencyRequired');
    expect(validatedState.accountNumberError).toBe('accountNumberRequired');
    expect(validatedState.agencyError).toBe('agencyRequired');
  });

  it('should return state with no errors when form is valid', () => {
    const state = createState({
      name: 'Valid Account',
      currency: 'EUR',
      accountNumber: '99999',
      agency: '1234',
    });
    const validatedState = validateBankAccountForm(state);

    expect(validatedState.nameError).toBe('');
    expect(validatedState.currencyError).toBe('');
    expect(validatedState.accountNumberError).toBe('');
    expect(validatedState.agencyError).toBe('');
  });

  it('should preserve id when present in state', () => {
    const state = createState({
      name: 'Valid Account',
      currency: 'EUR',
      accountNumber: '99999',
      agency: '1234',
      id: 'existing-id',
    });
    const validatedState = validateBankAccountForm(state);

    expect(validatedState.id).toBe('existing-id');
  });
});
