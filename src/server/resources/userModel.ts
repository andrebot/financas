import {
  Schema,
  model,
  Document,
  FlatRecord,
  Types,
} from 'mongoose';
import { regExpEmail } from '../utils/validators';

/**
 * Interface for the User
 */
export interface IUser {
  /**
   * Unique identifier of the user
   */
  id?: string; // Optional to account for new objects
  /**
   * Email of the user
   */
  email: string;
  /**
   * First name of the user
   */
  firstName: string;
  /**
   * Last name of the user
   */
  lastName: string;
  /**
   * Role of the user. Can be either 'admin' or 'user'
   */
  role: 'admin' | 'user';
  /**
   * Password of the user
   */
  password: string;
}

export interface IUserDocument extends Omit<IUser, 'id'>, Document {}

/**
 * Type for the User. It is a Document and a FlatRecord of the IUser to follow
 * the schema and a _id of type ObjectId on Mongoose
 */
type DocType = Document<unknown, unknown, FlatRecord<IUserDocument>> & FlatRecord<IUserDocument> & {
  _id: Types.ObjectId;
};

/**
 * Function to transform the user object by removing the password, since it should not be returned.
 * Also, it will convert the _id to id and remove it from the object.
 *
 * @param doc - Document of the user
 * @param ret - Record of the user
 * @returns - Record of the user
 */
function transformUserObject(doc: DocType, ret: Record<string, any>) {
  const { ...newObject } = ret;

  delete newObject.password;
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
