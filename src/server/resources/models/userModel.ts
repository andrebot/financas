import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';
import { regExpEmail } from '../../utils/validators';
import { transformMongooseObject } from '../../utils/misc';
import { IUser } from '../../types';

export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  _id: Types.ObjectId;
}

/**
 * Schema for the User
 */
const UserModel = new Schema<IUserDocument>({
  email: {
    type: String, match: regExpEmail, unique: true, required: true,
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String, required: true, enum: ['admin', 'user'], default: 'user',
  },
  password: { type: String, required: true },
}, {
  timestamps: true,
  toObject: {
    transform: transformMongooseObject,
  },
  toJSON: {
    transform: transformMongooseObject,
  },
});

export default model<IUserDocument>('user', UserModel);
