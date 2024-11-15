import UserModel, { IUserDocument, IUser } from '../userModel';
import { Repository } from './IRepository';

export default new Repository<IUserDocument, IUser>(UserModel);
