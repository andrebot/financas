import { Repository } from './repository';
import TransactionModel, { ITransactionDocument } from '../models/transactionModel';
import { ITransaction } from '../../types';

export default new Repository<ITransactionDocument, ITransaction>(TransactionModel);
