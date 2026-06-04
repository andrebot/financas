import { BUDGET_TYPES, BudgetFormActionType } from '../enums';
import { Category } from './categories';

export type Budget = {
  id?: number;
  name: string;
  value: number;
  type: BUDGET_TYPES;
  startDate: Date;
  endDate: Date;
  categories?: Category[];
  categoryIds?: number[];
  userId: number;
};

export type BudgetFormState = {
  id?: number;
  name: string;
  value: number;
  categoryIds: number[];
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
  type: BudgetFormActionType.SET_CATEGORY_IDS;
  payload: number[];
} | {
  type: BudgetFormActionType.VALIDATE;
} | {
  type: BudgetFormActionType.EDIT;
  payload: Budget;
} | {
  type: BudgetFormActionType.RESET;
};
