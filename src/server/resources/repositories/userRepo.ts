import UserModel, { IUserDocument } from '../models/userModel';
import { Repository } from './repository';
import { IUser } from '../../types';

function errorHandler(error: Error): Error {
  if ((error as any).code === 11000) {
    return new Error('duplicateUser');
  }

  return new Error('unknownError');
};

export default new Repository<IUserDocument, IUser>(UserModel, errorHandler);
