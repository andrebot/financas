import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';
import transactionModel, { ITransaction } from './transactionModel';

export enum BUDGET_TYPES {
  ANNUALY  = 'annualy',
  QUARTERLY = 'quarterly',
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  DAILY = 'daily',
}

export interface IBudget extends Document {
  /**
   * Budget's name
   */
  name: string;
  /**
   * Budget's target value
   */
  value: number;
  /**
   * Budget type
   */
  type: BUDGET_TYPES;
  /**
   * Budget's spent value
   */
  spent?: number;
  /**
   * Budget's start date
   */
  startDate: Date;
  /**
   * Budget's end date
   */
  endDate: Date;
  /**
   * Categories related to this budget
   */
  categories: string[];
  /**
   * Budget owner
   */
  user: Types.ObjectId;
  /**
   * Calculate the spent value of the budget by
   * querying the transactions related to the budget
   * by category and date
   *
   * @returns {Promise<number>} The spent value
   */
  calculateSpent: () => Promise<number>;
}

const BudgetSchema = new Schema<IBudget>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  type: { type: String, enum: Object.values(BUDGET_TYPES), required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categories: { 
    type: [String],
    validate: {
      validator: (v: string[]) => v.length > 0,
      message: 'Categories must not be empty',
    },
    default: [],
  },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

/**
 * Calculate the spent value of the budget
 *
 * @returns {Promise<number>} The spent value
 */
async function calculateSpent(this: IBudget): Promise<number> {
  return transactionModel.find({
    user: this.user,
    category: { $in: this.categories },
    date: { $gte: this.startDate, $lte: this.endDate },
  }).then(
    (transactionModels: ITransaction[]) => transactionModels.reduce(
      (acc, curr) => acc + curr.value, 0
    )
  ).catch((err) => 0);
};

BudgetSchema.methods.calculateSpent = calculateSpent;

export default model<IBudget>('Budget', BudgetSchema);
