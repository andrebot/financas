import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';

export enum BUGET_TYPES {
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
  type: BUGET_TYPES;
  /**
   * Budget's spent value
   */
  spent: number;
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
}

const BudgetSchema = new Schema<IBudget>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  type: { type: String, enum: Object.values(BUGET_TYPES), required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  categories: { type: [String], default: [] },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// create a virtual field to calculate the spent value based in the categories
BudgetSchema.virtual('spent').get(function getSpent(this: IBudget) {
  /// do this later
});


export default model<IBudget>('Budget', BudgetSchema);
