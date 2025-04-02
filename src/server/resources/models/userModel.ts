import {
  Schema,
  model,
  Document,
  FlatRecord,
  Types,
} from 'mongoose';
import { regExpEmail } from '../../utils/validators';
import { IUser } from '../../types';

export interface IUserDocument extends Omit<IUser, 'id'>, Document {
  _id: Types.ObjectId;
}

/**
 * Function to transform the user object by removing the password, since it should not be returned.
 * Also, it will convert the _id to id and remove it from the object.
 *
 * @param doc - Document of the user
 * @param ret - Record of the user
 * @returns - Record of the user
 */
function transformUserObject(
  doc: Document<unknown, {}, FlatRecord<unknown>>,
  ret: Record<string, any>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: any,
) {
  const { ...newObject } = ret;

  newObject.id = newObject._id.toString();
  delete newObject._id;

  return newObject;
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
    transform: transformUserObject,
  },
  toJSON: {
    transform: transformUserObject,
  },
});

export default model<IUserDocument>('user', UserModel);
