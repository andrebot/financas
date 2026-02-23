import { Schema, model } from 'mongoose';
import type { IMonthlyBalanceDocument } from '../../types';

const MonthlyBalanceSchema = new Schema<IMonthlyBalanceDocument>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  month: {
    type: Number, required: true, min: 1, max: 12,
  },
  year: { type: Number, required: true },
  openingBalance: { type: Number, required: true },
  closingBalance: { type: Number, required: true },
  transactions: { type: [Schema.Types.ObjectId], ref: 'Transaction', required: true },
}, {
  toJSON: {
    transform: (doc, ret) => {
      const newObject = { ...ret };

      newObject.id = newObject._id.toString();
      delete newObject._id;

      return newObject;
    },
  },
});

export default model<IMonthlyBalanceDocument>('MonthlyBalance', MonthlyBalanceSchema);
