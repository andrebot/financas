import {
  listBudgetQuery,
  createBudgetMutation,
  updateBudgetMutation,
  deleteBudgetMutation,
  getBudgetQuery,
  endpoints,
} from '../../../../src/client/features/budget';
import { BUDGET_TYPES } from '../../../../src/client/enums';
import type { Budget } from '../../../../src/client/types';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};

describe('budget endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');
  });

  describe('query/mutation builders', () => {
    it('should correctly prepare the list budget query request', () => {
      const result = listBudgetQuery();

      expect(result).toBeDefined();
      expect(result.url).toBe('/budget');
      expect(result.method).toBe('GET');
    });

    it('should correctly prepare the create budget mutation request', () => {
      const budget: Budget = {
        name: 'Monthly groceries',
        value: 1000,
        type: BUDGET_TYPES.MONTHLY,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        categories: [],
        userId: 1,
      };

      const result = createBudgetMutation(budget);

      expect(result).toBeDefined();
      expect(result.url).toBe('/budget');
      expect(result.method).toBe('POST');
      expect(result.body).toEqual(budget);
    });

    it('should correctly prepare the update budget mutation request', () => {
      const budget: Budget = {
        id: 1,
        name: 'Updated groceries',
        value: 1500,
        type: BUDGET_TYPES.MONTHLY,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-31'),
        categories: [],
        userId: 1,
      };

      const result = updateBudgetMutation(budget);

      expect(result).toBeDefined();
      expect(result.url).toBe('/budget/1');
      expect(result.method).toBe('PUT');
      expect(result.body).toEqual(budget);
    });

    it('should correctly prepare the delete budget mutation request', () => {
      const result = deleteBudgetMutation(1);

      expect(result).toBeDefined();
      expect(result.url).toBe('/budget/1');
      expect(result.method).toBe('DELETE');
    });

    it('should correctly prepare the get budget query request', () => {
      const result = getBudgetQuery(1);

      expect(result).toBeDefined();
      expect(result.url).toBe('/budget/1');
      expect(result.method).toBe('GET');
    });
  });

  describe('endpoints', () => {
    it('should have all budget endpoints', () => {
      const builtEndpoints = endpoints(mockBuilder as any);

      expect(builtEndpoints).toBeDefined();
      expect(builtEndpoints.listBudgets).toBeDefined();
      expect(builtEndpoints.listBudgetCategories).toBeDefined();
      expect(builtEndpoints.createBudget).toBeDefined();
      expect(builtEndpoints.updateBudget).toBeDefined();
      expect(builtEndpoints.deleteBudget).toBeDefined();
      expect(builtEndpoints.getBudget).toBeDefined();
      expect(mockBuilder.query).toHaveBeenCalledTimes(3);
      expect(mockBuilder.mutation).toHaveBeenCalledTimes(3);
    });
  });
});
