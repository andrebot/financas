import {
  Schema,
  model,
  Document,
  ObjectId,
} from 'mongoose';
import { IBudget, BUDGET_TYPES } from '../../types';

export interface IBudgetDocument extends Omit<IBudget, 'id' | 'user'>, Document {
  user: ObjectId;
}

const BudgetSchema = new Schema<IBudgetDocument>({
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

export default model<IBudgetDocument>('Budget', BudgetSchema);
