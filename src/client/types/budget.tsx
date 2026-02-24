import { BUDGET_TYPES } from '../enums';

export type Budget = {
  id?: string;
  name: string;
  value: number;
  type: BUDGET_TYPES;
  startDate: Date;
  endDate: Date;
  categories: string[];
  user: string;
};