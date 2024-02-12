import { Schema, model, Document } from 'mongoose';
import { regExpEmail } from '../utils/validators';

export interface IUser extends Document{
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'user';
  password: string;
};

const UserModel = new Schema<IUser>({
  email: { type: String, match: regExpEmail, unique: true, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, required: true, enum: ['admin', 'user'], default: 'user' },
  password: { type: String, required: true },
}, {
  timestamps: true,
  toObject: {
    transform: function(doc, ret) {
      delete ret.password;
  
      return ret;
    },
  },
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
  
      return ret;
    },
  }
});

export default model<IUser>('user', UserModel);
