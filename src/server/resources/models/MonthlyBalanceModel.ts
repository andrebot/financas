import {
  Schema,
  model,
  Document,
  ObjectId,
} from 'mongoose';
import { IMonthlyBalance } from '../../types';

export interface IMonthlyBalanceDocument extends Omit<IMonthlyBalance, 'id' | 'user' | 'account' | 'transactions'>, Document {
  user: ObjectId;
  account: ObjectId;
  transactions: ObjectId[];
}

const MonthlyBalanceSchema = new Schema<IMonthlyBalanceDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number, required: true },
  transactions: { type: [Schema.Types.ObjectId], ref: 'Transaction', required: true },
});

export default model<IMonthlyBalanceDocument>('MonthlyBalance', MonthlyBalanceSchema);
