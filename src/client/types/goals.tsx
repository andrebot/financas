import { GoalActionType, GoalsTableActionType } from '../enums';

export type Goal = {
  id?: number;
  name: string;
  value: number;
  dueDate: Date;
  userId: number;
  archived: boolean;
  savedValue: number;
  progress: number;
}

export type GoalState = {
  id?: number;
  name: string | undefined | null;
  value: number;
  dueDate: Date | undefined | null;
  nameError: string;
  valueError: string;
  dueDateError: string;
}

export type GoalsTableProps = {
  goals: Goal[];
  activeGoalId: number | undefined | null;
  availableActions: GoalsTableActionType[];
  onArchiveGoal: (goal: Goal) => void;
  onUnarchiveGoal: (goal: Goal) => void;
  onDeleteGoal: (goal: Goal) => void;
  onEditGoal: (goal: Goal) => void;
  onDeselectGoal: () => void;
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
} | {
  type: GoalActionType.EDIT;
  payload: Goal;
}
