import UserModel, { IUserDocument } from '../models/userModel';
import { Repository } from './repository';
import { IUser } from '../../types';

export default new Repository<IUserDocument, IUser>(UserModel);
