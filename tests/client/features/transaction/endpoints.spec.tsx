import {
  listTransactionQuery,
  createTransactionMutation,
  updateTransactionMutation,
  deleteTransactionMutation,
  getTransactionQuery,
  endpoints,
} from '../../../../src/client/features/transaction';
import { TRANSACTION_TYPES } from '../../../../src/client/enums';
import type { Transaction } from '../../../../src/client/types';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};

describe('transaction endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');
  });

  describe('query/mutation builders', () => {
    it('should correctly prepare the list transaction query request', () => {
      const result = listTransactionQuery();

      expect(result).toBeDefined();
      expect(result.url).toBe('/accountant');
      expect(result.method).toBe('GET');
    });

    it('should correctly prepare the create transaction mutation request', () => {
      const transaction: Transaction = {
        name: 'Coffee',
        value: 5.5,
        type: TRANSACTION_TYPES.CARD_PURCHASE,
        date: '2025-01-10T10:00:00Z',
        accountId: 1,
        userId: 1,
      };

      const result = createTransactionMutation(transaction);

      expect(result).toBeDefined();
      expect(result.url).toBe('/accountant');
      expect(result.method).toBe('POST');
      expect(result.body).toEqual(transaction);
    });

    it('should correctly prepare the update transaction mutation request', () => {
      const transaction: Transaction = {
        id: 1,
        name: 'Coffee',
        value: 5.5,
        type: TRANSACTION_TYPES.CARD_PURCHASE,
        date: '2025-01-10T10:00:00Z',
        accountId: 1,
        userId: 1,
      };

      const result = updateTransactionMutation(transaction);

      expect(result).toBeDefined();
      expect(result.url).toBe('/accountant/1');
      expect(result.method).toBe('PUT');
      expect(result.body).toEqual(transaction);
    });

    it('should correctly prepare the delete transaction mutation request', () => {
      const result = deleteTransactionMutation(1);

      expect(result).toBeDefined();
      expect(result.url).toBe('/accountant/1');
      expect(result.method).toBe('DELETE');
    });

    it('should correctly prepare the get transaction query request', () => {
      const result = getTransactionQuery(1);

      expect(result).toBeDefined();
      expect(result.url).toBe('/accountant/1');
      expect(result.method).toBe('GET');
    });
  });

  describe('endpoints', () => {
    it('should have all transaction endpoints', () => {
      const builtEndpoints = endpoints(mockBuilder as any);

      expect(builtEndpoints).toBeDefined();
      expect(builtEndpoints.listTransactions).toBeDefined();
      expect(builtEndpoints.createTransaction).toBeDefined();
      expect(builtEndpoints.updateTransaction).toBeDefined();
      expect(builtEndpoints.deleteTransaction).toBeDefined();
      expect(builtEndpoints.getTransaction).toBeDefined();
      expect(mockBuilder.query).toHaveBeenCalledTimes(2);
      expect(mockBuilder.mutation).toHaveBeenCalledTimes(3);
    });
  });
});
