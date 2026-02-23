import dayjs from 'dayjs';
import {
  goalReducer,
  initialGoalState,
} from '../../../../src/client/pages/goals/goalReducer';
import { GoalActionType } from '../../../../src/client/enums';
import type { GoalState, GoalAction, Goal } from '../../../../src/client/types';

const createState = (overrides: Partial<GoalState> = {}): GoalState => ({
  ...initialGoalState,
  ...overrides,
});

const createGoal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'goal-1',
  name: 'Save for trip',
  value: 10000,
  dueDate: new Date('2026-12-31'),
  user: 'user-1',
  archived: false,
  savedValue: 0,
  progress: 0,
  ...overrides,
});

describe('goalReducer', () => {
  describe('SET_NAME', () => {
    it('should set name and clear error when valid', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_NAME,
        payload: 'My goal',
      });

      expect(newState.name).toBe('My goal');
      expect(newState.nameError).toBe('');
    });

    it('should set nameError to nameRequired when payload is empty', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_NAME,
        payload: '',
      });

      expect(newState.name).toBe('');
      expect(newState.nameError).toBe('nameRequired');
    });

    it('should set nameError to nameRequired when payload is only whitespace', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_NAME,
        payload: '   ',
      });

      expect(newState.name).toBe('   ');
      expect(newState.nameError).toBe('nameRequired');
    });

    it('should set nameError to nameInvalid when payload contains invalid characters', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_NAME,
        payload: 'Goal 123',
      });

      expect(newState.name).toBe('Goal 123');
      expect(newState.nameError).toBe('nameInvalid');
    });

    it('should accept name with letters, spaces, hyphens and accents', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_NAME,
        payload: 'Viagem à Paris',
      });

      expect(newState.name).toBe('Viagem à Paris');
      expect(newState.nameError).toBe('');
    });
  });

  describe('SET_VALUE', () => {
    it('should set value and clear error when valid', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_VALUE,
        payload: 5000,
      });

      expect(newState.value).toBe(5000);
      expect(newState.valueError).toBe('');
    });

    it('should set valueError to valueRequired and value to 0 when payload is 0', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_VALUE,
        payload: 0,
      });

      expect(newState.value).toBe(0);
      expect(newState.valueError).toBe('valueRequired');
    });

    it('should set valueError to valueRequired when payload is NaN', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_VALUE,
        payload: Number.NaN,
      });

      expect(newState.value).toBe(0);
      expect(newState.valueError).toBe('valueRequired');
    });

    it('should set valueError to valueMustBeGreaterThanZero when payload is negative', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_VALUE,
        payload: -100,
      });

      expect(newState.value).toBe(-100);
      expect(newState.valueError).toBe('valueMustBeGreaterThanZero');
    });

    it('should treat null/undefined as 0 and set valueRequired', () => {
      const initialState = createState();
      const newStateNull = goalReducer(initialState, {
        type: GoalActionType.SET_VALUE,
        payload: null,
      });
      const newStateUndefined = goalReducer(initialState, {
        type: GoalActionType.SET_VALUE,
        payload: undefined,
      });

      expect(newStateNull.value).toBe(0);
      expect(newStateNull.valueError).toBe('valueRequired');
      expect(newStateUndefined.value).toBe(0);
      expect(newStateUndefined.valueError).toBe('valueRequired');
    });
  });

  describe('SET_DUE_DATE', () => {
    it('should set dueDate and clear error when date is in the future', () => {
      const futureDate = dayjs().add(1, 'year').toDate();
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_DUE_DATE,
        payload: futureDate,
      });

      expect(newState.dueDate).toEqual(futureDate);
      expect(newState.dueDateError).toBe('');
    });

    it('should set dueDateError to dueDateRequired when payload is undefined', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_DUE_DATE,
        payload: undefined,
      });

      expect(newState.dueDate).toBeUndefined();
      expect(newState.dueDateError).toBe('dueDateRequired');
    });

    it('should set dueDateError to dueDateRequired when payload is null', () => {
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_DUE_DATE,
        payload: null,
      });

      expect(newState.dueDate).toBeNull();
      expect(newState.dueDateError).toBe('dueDateRequired');
    });

    it('should set dueDateError to dueDateMustBeAfterToday when date is in the past', () => {
      const pastDate = dayjs().subtract(1, 'day').toDate();
      const initialState = createState();
      const newState = goalReducer(initialState, {
        type: GoalActionType.SET_DUE_DATE,
        payload: pastDate,
      });

      expect(newState.dueDate).toEqual(pastDate);
      expect(newState.dueDateError).toBe('dueDateMustBeAfterToday');
    });
  });

  describe('EDIT', () => {
    it('should merge goal payload into state', () => {
      const initialState = createState();
      const goal = createGoal({
        id: 'goal-2',
        name: 'Updated goal',
        value: 20000,
        dueDate: new Date('2027-06-30'),
      });

      const newState = goalReducer(initialState, {
        type: GoalActionType.EDIT,
        payload: goal,
      });

      expect(newState.id).toBe('goal-2');
      expect(newState.name).toBe('Updated goal');
      expect(newState.value).toBe(20000);
      expect(newState.dueDate).toEqual(new Date('2027-06-30'));
    });
  });

  describe('RESET', () => {
    it('should return initial state', () => {
      const initialState = createState({
        name: 'Some goal',
        value: 5000,
        dueDate: new Date(),
        nameError: 'nameRequired',
        valueError: 'valueRequired',
        dueDateError: 'dueDateRequired',
      });

      const newState = goalReducer(initialState, {
        type: GoalActionType.RESET,
      });

      expect(newState).toEqual(initialGoalState);
      expect(newState.name).toBe('');
      expect(newState.value).toBe(0);
      expect(newState.dueDate).toBeUndefined();
      expect(newState.nameError).toBe('');
      expect(newState.valueError).toBe('');
      expect(newState.dueDateError).toBe('');
    });
  });

  it('should return current state for unknown action', () => {
    const initialState = createState({ name: 'Test', value: 1000 });
    const newState = goalReducer(initialState, {
      type: 'UNKNOWN' as GoalAction['type'],
      payload: '',
    } as GoalAction);

    expect(newState).toBe(initialState);
    expect(newState.name).toBe('Test');
    expect(newState.value).toBe(1000);
  });
});
