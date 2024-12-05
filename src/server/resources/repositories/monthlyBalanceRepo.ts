import MonthlyBalanceModel, { IMonthlyBalanceDocument } from '../models/MonthlyBalanceModel';
import { Repository } from './repository';
import { IMonthlyBalance } from '../../types';

export default new Repository<IMonthlyBalanceDocument, IMonthlyBalance>(MonthlyBalanceModel);
