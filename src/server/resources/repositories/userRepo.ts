import UserModel, { IUserDocument, IUser } from '../userModel';
import { Repository } from './repository';

export default new Repository<IUserDocument, IUser>(UserModel);
