import {
  listGoalQuery,
  listGoalForMonthQuery,
  createGoalMutation,
  updateGoalMutation,
  deleteGoalMutation,
  getGoalQuery,
  endpoints,
} from '../../../../src/client/features/goal';
import type { Goal } from '../../../../src/client/types/goals';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};

describe('goal endpoints', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');
  });

  describe('query/mutation builders', () => {
    it('should correctly prepare the list goal query request', () => {
      const result = listGoalQuery();

      expect(result).toBeDefined();
      expect(result.url).toBe('/goal');
      expect(result.method).toBe('GET');
    });

    it('should correctly prepare the create goal mutation request', () => {
      const goal: Goal = {
        name: 'My goal',
        value: 10000,
        dueDate: new Date('2026-12-31'),
        userId: 1,
        archived: false,
        savedValue: 0,
        progress: 0,
      };

      const result = createGoalMutation(goal);

      expect(result).toBeDefined();
      expect(result.url).toBe('/goal');
      expect(result.method).toBe('POST');
      expect(result.body).toEqual(goal);
    });

    it('should correctly prepare the update goal mutation request', () => {
      const goal: Goal = {
        id: 1,
        name: 'Updated goal',
        value: 15000,
        dueDate: new Date('2026-12-31'),
        userId: 1,
        archived: false,
        savedValue: 5000,
        progress: 33.33,
      };

      const result = updateGoalMutation(goal);

      expect(result).toBeDefined();
      expect(result.url).toBe('/goal/1');
      expect(result.method).toBe('PUT');
      expect(result.body).toEqual(goal);
    });

    it('should correctly prepare the delete goal mutation request', () => {
      const result = deleteGoalMutation(1);

      expect(result).toBeDefined();
      expect(result.url).toBe('/goal/1');
      expect(result.method).toBe('DELETE');
    });

    it('should correctly prepare the get goal query request', () => {
      const result = getGoalQuery(1);

      expect(result).toBeDefined();
      expect(result.url).toBe('/goal/1');
      expect(result.method).toBe('GET');
    });

    it('should correctly prepare the list goal for month query request', () => {
      const result = listGoalForMonthQuery({ year: 2025, month: 3 });

      expect(result).toBeDefined();
      expect(result.url).toBe('/goal?year=2025&month=3');
      expect(result.method).toBe('GET');
    });
  });

  describe('endpoints', () => {
    it('should have all goal endpoints', () => {
      const builtEndpoints = endpoints(mockBuilder as any);

      expect(builtEndpoints).toBeDefined();
      expect(builtEndpoints.listGoals).toBeDefined();
      expect(builtEndpoints.listGoalsForMonth).toBeDefined();
      expect(builtEndpoints.createGoal).toBeDefined();
      expect(builtEndpoints.updateGoal).toBeDefined();
      expect(builtEndpoints.deleteGoal).toBeDefined();
      expect(builtEndpoints.getGoal).toBeDefined();
      expect(mockBuilder.query).toHaveBeenCalledTimes(3);
      expect(mockBuilder.mutation).toHaveBeenCalledTimes(3);
    });
  });
});
