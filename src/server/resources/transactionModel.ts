import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';

/* eslint-disable no-unused-vars */
export enum TRANSACTION_TYPES {
  WITHDRAW = 'withdraw',
  DEPOSIT = 'deposit',
  TRANSFER = 'transfer',
  BANK_SLIP = 'bank_slip',
  CARD = 'card',
}

export enum INVESTMENT_TYPES {
  CDB = 'cdb',
  LCI = 'lci',
  LCA = 'lca',
  STOCK = 'stock',
  FUND = 'fund',
  CRA = 'cra',
  CRI = 'cri',
  DEBENTURE = 'debenture',
  CURRENCY = 'currency',
  LC = 'lc',
  LF = 'lf',
  FII = 'fii',
  TRESURY = 'tresury',
}
/* eslint-enable no-unused-vars */

export interface IGoalItem extends Document {
  goal: Types.ObjectId;
  goalName: string;
  percentage: number;
}

export interface ITransaction extends Document {
  name: string;
  category: string;
  parentCategory: string;
  account: Schema.Types.ObjectId;
  type: TRANSACTION_TYPES;
  date: Date;
  value: number;
  isCredit: boolean;
  investmentType: INVESTMENT_TYPES;
  user: Schema.Types.ObjectId;
  goalsList: IGoalItem[];
}

const TransactionSchema = new Schema<ITransaction>({
  name: { type: String, required: true },
  category: { type: String, required: true },
  parentCategory: { type: String, required: true },
  account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
  type: { type: String, enum: Object.values(TRANSACTION_TYPES), required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  isCredit: { type: Boolean, required: true },
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

export default model<ITransaction>('Transaction', TransactionSchema);
