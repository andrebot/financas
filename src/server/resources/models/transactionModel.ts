import {
  Schema,
  model,
  Document,
  ObjectId,
  Types,
} from 'mongoose';
import { ITransaction, TRANSACTION_TYPES, INVESTMENT_TYPES } from '../../types';

export interface ITransactionDocument extends Omit<ITransaction, 'id' | 'user' | 'goalsList' | 'account'>, Document {
  _id: Types.ObjectId;
  user: ObjectId;
  account: ObjectId;
  goalsList: {
    goal: Types.ObjectId;
    goalName: string;
    percentage: number;
  }[];
}

const TransactionSchema = new Schema<ITransactionDocument>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  parentCategory: { type: String, required: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: Object.values(TRANSACTION_TYPES), required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  investmentType: { type: String, enum: Object.values(INVESTMENT_TYPES), required: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  goalsList: {
    type: [{
      goal: { type: Schema.Types.ObjectId, ref: 'Goal', required: true },
      goalName: { type: String, required: true },
      percentage: {
        type: Number, default: 0, min: 0, max: 1,
      },
    }],
    default: [],
  },
});

export default model<ITransactionDocument>('Transaction', TransactionSchema);
