import {
  listBankAccountQuery,
  createBankAccountMutation,
  updateBankAccountMutation,
  deleteBankAccountMutation,
  getBankAccountQuery,
  endpoints,
} from '../../../../src/client/features/bankAccount';
import type { BankAccount } from '../../../../src/client/types/bankAccounts';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};

describe('bankAccount endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');
  });

  describe('query/mutation builders', () => {
    it('should correctly prepare the list bank account query request', () => {
      const result = listBankAccountQuery();

      expect(result).toBeDefined();
      expect(result.url).toBe('/account');
      expect(result.method).toBe('GET');
    });

    it('should correctly prepare the create bank account mutation request', () => {
      const bankAccount: BankAccount = {
        name: 'My account',
        agency: '0001',
        accountNumber: '123456',
        cards: [],
        currency: 'BRL',
        user: 'user-1',
      };

      const result = createBankAccountMutation(bankAccount);

      expect(result).toBeDefined();
      expect(result.url).toBe('/account');
      expect(result.method).toBe('POST');
      expect(result.body).toEqual(bankAccount);
    });

    it('should correctly prepare the update bank account mutation request', () => {
      const bankAccount: BankAccount = {
        id: 'account-1',
        name: 'Updated account',
        agency: '0001',
        accountNumber: '123456',
        cards: [],
        currency: 'USD',
        user: 'user-1',
      };

      const result = updateBankAccountMutation(bankAccount);

      expect(result).toBeDefined();
      expect(result.url).toBe('/account/account-1');
      expect(result.method).toBe('PUT');
      expect(result.body).toEqual(bankAccount);
    });

    it('should correctly prepare the delete bank account mutation request', () => {
      const result = deleteBankAccountMutation('account-1');

      expect(result).toBeDefined();
      expect(result.url).toBe('/account/account-1');
      expect(result.method).toBe('DELETE');
    });

    it('should correctly prepare the get bank account query request', () => {
      const result = getBankAccountQuery('account-1');

      expect(result).toBeDefined();
      expect(result.url).toBe('/account/account-1');
      expect(result.method).toBe('GET');
    });
  });

  describe('endpoints', () => {
    it('should have all bank account endpoints', () => {
      const builtEndpoints = endpoints(mockBuilder as any);

      expect(builtEndpoints).toBeDefined();
      expect(builtEndpoints.listBankAccounts).toBeDefined();
      expect(builtEndpoints.createBankAccount).toBeDefined();
      expect(builtEndpoints.updateBankAccount).toBeDefined();
      expect(builtEndpoints.deleteBankAccount).toBeDefined();
      expect(builtEndpoints.getBankAccount).toBeDefined();
      expect(mockBuilder.query).toHaveBeenCalledTimes(2);
      expect(mockBuilder.mutation).toHaveBeenCalledTimes(3);
    });
  });
});
