import dayjs from 'dayjs';
import { regExpName } from '../../utils/validators';
import { GoalState, GoalAction } from '../../types';
import { GoalActionType } from '../../enums';

export const initialGoalState: GoalState = {
    name: '',
    value: 0,
    dueDate: undefined as Date | undefined | null,
    nameError: '',
    valueError: '',
    dueDateError: '',
}

/**
 * Validates the name of the goal and updates the state.
 * 
 * @remarks
 * The name must not be empty and must not contain special characters.
 *
 * @param state - The current state
 * @param payload - The payload to set the name
 * @returns The new state
 */
function setName(
    state: GoalState,
    payload: string | undefined | null,
): GoalState {
    const nextState: GoalState = { ...state, name: payload, nameError: '' };

    if (!payload || payload.trim().length === 0) {
        nextState.nameError = 'nameRequired';
    }

    if (payload && !regExpName.test(payload)) {
        nextState.nameError = 'nameInvalid';
    }

    return nextState;
}

/**
 * Validates the value of the goal and updates the state.
 * 
 * @remarks
 * The value must not be empty and must be greater than 0.
 *
 * @param state - The current state
 * @param payload - The payload to set the value
 * @returns The new state
 */
function setValue(
    state: GoalState,
    payload: number | undefined | null,
): GoalState {
    let nextValue: number = payload ?? 0;
    const nextState: GoalState = { ...state, value: nextValue, valueError: '' };

    if (isNaN(nextValue) || nextValue === 0) {
        nextState.valueError = 'valueRequired';
        nextState.value = 0;
    }

    if (nextValue < 0) {
        nextState.valueError = 'valueMustBeGreaterThanZero';
    }

    return nextState;
}

/**
 * Validates the due date of the goal and updates the state.
 * 
 * @remarks
 * The due date must not be empty and must be after today.
 *
 * @param state - The current state
 * @param payload - The payload to set the due date
 * @returns The new state
 */
function setDueDate(
    state: GoalState,
    payload: Date | undefined | null,
): GoalState {
    const nextState: GoalState = { ...state, dueDate: payload, dueDateError: '' };

    if (payload === undefined || payload === null) {
        nextState.dueDateError = 'dueDateRequired';
    }

    const dueDateStartOfDay = dayjs(payload).startOf('day');
    const todayStartOfDay = dayjs().startOf('day');

    if (dueDateStartOfDay.isBefore(todayStartOfDay)) {
        nextState.dueDateError = 'dueDateMustBeAfterToday';
    }

    return nextState;
}

/**
 * Reducer for the goal state.
 *
 * @param state - The current state
 * @param action - The action to perform
 * @returns The new state
 */
export const goalReducer = (state: GoalState, action: GoalAction): GoalState => {
    switch (action.type) {
        case GoalActionType.SET_NAME:
            return setName(state, action.payload);
        case GoalActionType.SET_VALUE:
            return setValue(state, action.payload);
        case GoalActionType.SET_DUE_DATE:
            return setDueDate(state, action.payload);
        case GoalActionType.RESET:
            return { ...initialGoalState };
        default:
            return state;
    }
}
