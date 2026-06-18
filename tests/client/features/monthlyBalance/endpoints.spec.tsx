import {
  listMonthlyBalancesQuery,
  endpoints,
} from '../../../../src/client/features/monthlyBalance';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};

describe('monthlyBalance endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');
  });

  describe('query builders', () => {
    it('should correctly prepare the list monthly balances query request', () => {
      const result = listMonthlyBalancesQuery({ year: 2025, month: 1 });

      expect(result).toBeDefined();
      expect(result.url).toBe('/accountant/monthly-balance?year=2025&month=1');
      expect(result.method).toBe('GET');
    });

    it('should include year and month in the query URL', () => {
      const result = listMonthlyBalancesQuery({ year: 2024, month: 12 });

      expect(result.url).toContain('year=2024');
      expect(result.url).toContain('month=12');
    });
  });

  describe('endpoints', () => {
    it('should register the listMonthlyBalances query endpoint', () => {
      const builtEndpoints = endpoints(mockBuilder as any);

      expect(builtEndpoints).toBeDefined();
      expect(builtEndpoints.listMonthlyBalances).toBeDefined();
      expect(mockBuilder.query).toHaveBeenCalledTimes(1);
    });
  });
});
