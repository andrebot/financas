import { Model } from 'mongoose';
import UserModel, { IUserDocument } from '../models/userModel';
import Repository from './repository';
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
}

class UserRepo extends Repository<IUserDocument, IUser> {
  constructor(model: Model<IUserDocument> = UserModel) {
    super(model, errorHandler);
  }

  /**
   * Finds a user by email.
   *
   * @param email - The email of the user to find.
   * @returns The user.
   */
  findByEmail(email: string): Promise<IUser | null> {
    return this.Model.findOne({ email }).then((doc) => doc?.toObject() as IUser);
  }
}

export default new UserRepo();
