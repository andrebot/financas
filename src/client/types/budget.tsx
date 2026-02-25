import { BUDGET_TYPES, BudgetFormActionType } from '../enums';

export type Budget = {
  id?: string;
  name: string;
  value: number;
  type: BUDGET_TYPES;
  startDate: Date;
  endDate: Date;
  categories: string[];
  user?: string;
};
  
export type BudgetFormState = {
  id?: string;
  name: string;
  value: number;
  categories: string[];
  type: BUDGET_TYPES;
  startDate: Date | undefined | null;
  endDate: Date | undefined | null;
  nameError: string;
  valueError: string;
  categoriesError: string;
  typeError: string;
  startDateError: string;
  endDateError: string;
};

export type BudgetFormAction = {
  type: BudgetFormActionType.SET_NAME;
  payload: string;
} | {
  type: BudgetFormActionType.SET_VALUE;
  payload: number | undefined | null;
} | {
  type: BudgetFormActionType.SET_START_DATE;
  payload: Date | undefined | null;
} | {
  type: BudgetFormActionType.SET_END_DATE;
  payload: Date | undefined | null;
} | {
  type: BudgetFormActionType.SET_TYPE;
  payload: BUDGET_TYPES;
} | {
  type: BudgetFormActionType.EDIT;
  payload: Budget;
} | {
  type: BudgetFormActionType.RESET;
};
