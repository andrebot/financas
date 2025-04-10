import type { Response } from 'express';
import ContentController from './contentController';
import TransactionManager from '../managers/transactionManager';
import { checkVoidUser } from '../utils/misc';
import type { RequestWithUser, ITransaction } from '../types';

export class TransactionController extends ContentController<ITransaction> {
  private transactionManager: typeof TransactionManager;

  constructor(transactionManager: typeof TransactionManager = TransactionManager) {
    super(transactionManager, 'TransactionController');

    this.transactionManager = transactionManager;
  }

  /**
   * Get the transaction types
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The transaction types
   */
  getTransactionTypes(req: RequestWithUser, res: Response) {
    try {
      const { user } = req;

      checkVoidUser(user, this.transactionManager.modelName, 'get');

      const transactionTypes = this.transactionManager.getTransactionTypes();

      this.logger.info(`Listed ${transactionTypes.investmentTypes.length} investment types and ${transactionTypes.transactionTypes.length} transaction types for user: ${user?.id}`);

      return res.send(transactionTypes);
    } catch (error) {
      this.logger.error(error);

      return this.errorHandler(error as Error, res);
    }
  }
}

export default new TransactionController();
