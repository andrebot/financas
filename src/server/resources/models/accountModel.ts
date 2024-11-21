import {
  Schema,
  model,
  Document,
  ObjectId,
} from 'mongoose';
import { IAccount, ICard } from '../../types';

export interface IAccountDocument extends Omit<IAccount, 'id' | 'user'>, Document {
  user: ObjectId;
}
export interface ICardDocument extends Omit<ICard, 'id'>, Document {}

/**
 * Schema for the Card
 */
const CardSchema = new Schema<ICardDocument>({
  number: { type: String, required: true },
  expirationDate: { type: String, required: true },
});

/**
 * Schema for the Account
 */
const AccountSchema = new Schema<IAccountDocument>({
  name: { type: String, required: true },
  currency: { type: String, required: true },
  agency: { type: String, required: true },
  accountNumber: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  cards: [CardSchema],
});

export default model<IAccountDocument>('Account', AccountSchema);
