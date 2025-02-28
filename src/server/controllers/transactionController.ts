import type { Response } from 'express';
import ContentController from './contentController';
import TransactionManager from '../managers/transactionManager';
import { checkVoidUser } from '../utils/misc';
import { handleError } from '../utils/responseHandlers';
import type { RequestWithUser, ITransaction } from '../types';

class TransactionController extends ContentController<ITransaction> {
  private transactionManager: typeof TransactionManager;

  constructor() {
    super(TransactionManager);

    this.transactionManager = TransactionManager;
  }

  getTransactionTypes(req: RequestWithUser, res: Response) {
    try {
      const { user } = req;

      checkVoidUser(user, this.transactionManager.modelName, 'get');
      return res.send(this.transactionManager.getTransactionTypes());
    } catch (error) {
      return handleError(error as Error, res);
    }
  }
}

export default new TransactionController();
