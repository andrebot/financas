import {
  Schema,
  model,
  Document,
} from 'mongoose';

/**
 * Interface for the Card
 */
export interface ICard extends Document {
  /**
   * Number of the card
   */
  number: string;
  /**
   * Expiration date of the card
   */
  expirationDate: string;
}

/**
 * Interface for the Account
 */
export interface IAccount extends Document {
  /**
   * Name of the account
   */
  name: string;
  /**
   * Agency of the account
   */
  agency: string;
  /**
   * Account number
   */
  accountNumber: string;
  /**
   * Currency of the account
   */
  currency: string;
  /**
   * User of the account
   */
  user: Schema.Types.ObjectId;
  /**
   * Cards of the account
   */
  cards: ICard[];
}

/**
 * Schema for the Card
 */
const CardSchema = new Schema<ICard>({
  number: {
    type: String,
    required: true,
  },
  expirationDate: {
    type: String,
    required: true,
  },
});

/**
 * Schema for the Account
 */
const AccountSchema = new Schema<IAccount>({
  name: {
    type: String,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  agency: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cards: [CardSchema],
});

export default model<IAccount>('Account', AccountSchema);
