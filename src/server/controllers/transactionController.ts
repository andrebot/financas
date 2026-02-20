import { Response } from 'express';
import { AccountantManager } from '../managers/accountantManager';
import CommonController from './commonController';
import { checkVoidUser } from '../utils/misc';
import { createLogger } from '../utils/logger';
import { handleError } from '../utils/responseHandlers';
import type { IAccountantManager, ITransaction, RequestWithUser } from '../types';

const logger = createLogger('TransactionController');

/**
 * Get the transaction types
 *
 * @throws {Error} - If the user is not found.
 *
 * @param req - The request object
 * @param res - The response object
 * @param accountantManager - The accountant manager to use.
 * @param errorHandler - The error handler to use.
 * @returns The transaction types
 */
function getTransactionTypes(
  req: RequestWithUser,
  res: Response,
  accountantManager: IAccountantManager,
  errorHandler = handleError,
) {
  try {
    const { user } = req;

    checkVoidUser(user, 'Transaction', 'get');

    const transactionTypes = accountantManager.getTransactionTypes();

    logger.info(`Listed ${transactionTypes.investmentTypes.length} investment types and ${transactionTypes.transactionTypes.length} transaction types for user: ${user?.id}`);

    return res.send(transactionTypes);
  } catch (error) {
    logger.error(error);

    return errorHandler(error as Error, res);
  }
}

/**
 * Creates a new transaction controller.
 *
 * @param transactionRepo - The transaction repository to use.
 * @param monthlyBalanceRepo - The monthly balance repository to use.
 * @param goalRepo - The goal repository to use.
 * @param budgetRepo - The budget repository to use.
 * @param errorHandler - The error handler to use.
 * @returns The transaction controller.
 */
export function TransactionController(
  errorHandler = handleError,
) {
  const accountantManager = AccountantManager();
  const commonTransactionController = CommonController<ITransaction>({
    createContent: accountantManager.createTransaction,
    updateContent: accountantManager.updateTransaction,
    deleteContent: accountantManager.deleteTransaction,
    listContent: accountantManager.listTransactions,
    getContent: accountantManager.getTransaction,
  }, 'Transaction');

  return {
    ...commonTransactionController,
    getTransactionTypes: (req: RequestWithUser, res: Response) => getTransactionTypes(
      req,
      res,
      accountantManager,
      errorHandler,
    ),
  };
}

export default TransactionController(handleError);
