import {
  Schema,
  model,
  Document,
  FlatRecord,
  Types,
} from 'mongoose';
import { regExpEmail } from '../utils/validators';

export interface IUser extends Document{
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  password: string;
}

type DocType = Document<unknown, unknown, FlatRecord<IUser>> & FlatRecord<IUser> & {
  _id: Types.ObjectId;
};

function transformUserObject(doc: DocType, ret: Record<string, unknown>) {
  const { ...newObject } = ret;

  delete newObject.password;

  return newObject;
}

const UserModel = new Schema<IUser>({
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

export default model<IUser>('user', UserModel);
