import UserModel, { IUserDocument } from '../models/userModel';
import { Repository } from './repository';
import { IUser } from '../../types';

/**
 * Error handler for the user repository.
 * 
 * @remarks
 * This error handler is used to translate server errors to
 * client errors using i18n keys.
 *
 * @param error - The error to handle.
 * @returns The error.
 */
export function errorHandler(error: Error): Error {
  if ((error as any).code === 11000) {
    return new Error('duplicateUser');
  }

  return error;
};

export default new Repository<IUserDocument, IUser>(UserModel, errorHandler);
