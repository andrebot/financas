import AccountModel, { IAccountDocument } from '../models/accountModel';
import Repository from './repository';
import { IAccount } from '../../types';

export default new Repository<IAccountDocument, IAccount>(AccountModel);
