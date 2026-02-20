import { GoalActionType, GoalsTableActionType } from '../enums';

export type Goal = {
  id: string;
  name: string;
  value: number;
  dueDate: Date;
  user: string;
  savedValue: number;
  progress: number;
}

export type GoalState = {
  name: string | undefined | null;
  value: number;
  dueDate: Date | undefined | null;
  nameError: string;
  valueError: string;
  dueDateError: string;
}

export type GoalsTableProps = {
  goals: Goal[];
  availableActions: GoalsTableActionType[];
}

export type GoalAction = {
  type: GoalActionType.SET_NAME;
  payload: string;
} | {
  type: GoalActionType.SET_VALUE;
  payload: number | undefined | null;
} | {
  type: GoalActionType.SET_DUE_DATE;
  payload: Date | undefined | null;
} | {
  type: GoalActionType.VALIDATE;
} | {
  type: GoalActionType.RESET;
}