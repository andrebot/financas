import { Schema, model } from 'mongoose';
import { transformMongooseObject } from '../../utils/misc';
import type {
  IAccountDocument,
  ICardDocument,
} from '../../types';
/**
 * Schema for the Card
 */
const CardSchema = new Schema<ICardDocument>({
  number: { type: String, required: true },
  expirationDate: { type: String, required: true },
}, {
  toObject: {
    transform: transformMongooseObject,
  },
  toJSON: {
    transform: transformMongooseObject,
  },
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
}, {
  toObject: {
    transform: transformMongooseObject,
  },
  toJSON: {
    transform: transformMongooseObject,
  },
});

export default model<IAccountDocument>('Account', AccountSchema);
