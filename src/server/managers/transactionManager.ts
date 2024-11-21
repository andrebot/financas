import ContentManager from './contentManager';
import transactionRepo from '../resources/repositories/transactionRepo';
import { TRANSACTION_TYPES, INVESTMENT_TYPES } from '../types';
import type { ITransaction } from '../types';

class TransactionManager extends ContentManager<ITransaction> {
  constructor() {
    super(transactionRepo);
  }

  getTransactionTypes(): {
    transactionTypes: string[];
    investmentTypes: string[];
  } {
    return {
      transactionTypes: Object.values(TRANSACTION_TYPES),
      investmentTypes: Object.values(INVESTMENT_TYPES),
    }
  }
}

export default new TransactionManager();
