import dayjs from 'dayjs';
import { BUDGET_TYPES, BudgetFormActionType } from '../../enums';
import { regExpNameWithNumbers } from '../../utils/validators';
import type { BudgetFormState, BudgetFormAction, Budget } from '../../types';

export const initialBudgetFormState: BudgetFormState = {
  name: '',
  value: 0,
  categories: [],
  type: BUDGET_TYPES.ANNUALY,
  startDate: new Date(),
  endDate: new Date(),
  nameError: '',
  valueError: '',
  categoriesError: '',
  typeError: '',
  startDateError: '',
  endDateError: '',
};

/**
 * Validates and sets the name. Must not be empty, must contain at least one
 * letter and must not contain special characters.
 *
 * @param state - The current state
 * @param payload - The payload to set the name
 * @returns The new state
 */
function setName(state: BudgetFormState, payload: string): BudgetFormState {
  const nextState: BudgetFormState = { ...state, name: payload, nameError: '' };

  if (!payload || payload.trim().length === 0) {
    nextState.nameError = 'nameRequired';
  }

  if (!regExpNameWithNumbers.test(payload)) {
    nextState.nameError = 'nameInvalid';
  }

  return nextState;
}

/**
 * Validates and sets the value. Must not be empty and must be greater than zero.
 *
 * @param state - The current state
 * @param payload - The payload to set the value
 * @returns The new state
 */
function setValue(
  state: BudgetFormState,
  payload: number | undefined | null,
): BudgetFormState {
  const nextValue: number = payload ?? 0;
  const nextState: BudgetFormState = { ...state, value: nextValue, valueError: '' };

  if (Number.isNaN(nextValue) || nextValue === 0) {
    nextState.valueError = 'valueRequired';
    nextState.value = 0;
  }

  if (nextValue < 0) {
    nextState.valueError = 'valueMustBeGreaterThanZero';
  }

  return nextState;
}


/**
 * Validates and sets the start date. Must not be empty
 *
 * @param state - The current state
 * @param payload - The payload to set the start date
 * @returns The new state
 */
function setStartDate(
  state: BudgetFormState,
  payload: Date | undefined | null,
): BudgetFormState {
  const nextState: BudgetFormState = { ...state, startDate: payload, startDateError: '' };

  if (payload === undefined || payload === null) {
    nextState.startDateError = 'startDateRequired';
  }

  return nextState;
}

/**
 * Validates and sets the end date. Must not be empty and must be after the start date.
 *
 * @param state - The current state
 * @param payload - The payload to set the end date
 * @returns The new state
 */
function setEndDate(
  state: BudgetFormState,
  payload: Date | undefined | null,
): BudgetFormState {
  const nextState: BudgetFormState = { ...state, endDate: payload, endDateError: '' };
  const startDate = state.startDate;

  if (payload === undefined || payload === null) {
    nextState.endDateError = 'endDateRequired';
  }

  if (payload && startDate && dayjs(payload).isBefore(dayjs(startDate))) {
    nextState.endDateError = 'endDateMustBeAfterStartDate';
  }

  return nextState;
}

/**
 * Validates and sets the type. Must not be empty and must be a valid budget type.
 *
 * @param state - The current state
 * @param payload - The payload to set the type
 * @returns The new state
 */
function setType(
  state: BudgetFormState,
  payload: BUDGET_TYPES,
): BudgetFormState {
  const nextState: BudgetFormState = { ...state, type: payload, typeError: '' };
  
  if (payload === undefined || payload === null) {
    nextState.typeError = 'typeRequired';
  }

  if (!Object.values(BUDGET_TYPES).includes(payload)) {
    nextState.typeError = 'typeInvalid';
  }

  return nextState;
}

/**
 * Updates the state so the user can edit the budget
 *
 * @param state - The current state
 * @param payload - The payload to edit the budget
 * @returns The new state
 */
function editBudget(
  state: BudgetFormState,
  payload: Budget,
): BudgetFormState {
  return { 
    ...state,
    ...payload,
    nameError: '',
    valueError: '',
    categoriesError: '',
    typeError: '',
    startDateError: '',
    endDateError: '',
  };
}

/**
 * Reducer for the budget form state.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export const budgetFormReducer = (state: BudgetFormState, action: BudgetFormAction): BudgetFormState => {
  switch (action.type) {
    case BudgetFormActionType.SET_NAME:
      return setName(state, action.payload);
    case BudgetFormActionType.SET_VALUE:
      return setValue(state, action.payload);
    case BudgetFormActionType.SET_START_DATE:
      return setStartDate(state, action.payload);
    case BudgetFormActionType.SET_END_DATE:
      return setEndDate(state, action.payload);
    case BudgetFormActionType.SET_TYPE:
      return setType(state, action.payload);
    case BudgetFormActionType.EDIT:
      return editBudget(state, action.payload);
    case BudgetFormActionType.RESET:
      return { ...initialBudgetFormState };
    default:
      return state;
  }
};
