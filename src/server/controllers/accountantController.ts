import { Response } from 'express';
import AccountantManager from '../managers/accountantManager';
import CommonController from './commonController';
import { checkVoidUser, checkVoidPayload } from '../utils/misc';
import { createLogger } from '../utils/logger';
import { handleError } from '../utils/responseHandlers';
import type {
  IAccountantManager, ITransaction, ITransactionGoalEntry, RequestWithUser,
} from '../types';

const logger = createLogger('AccountantController');

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
export function getTransactionTypes(
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
 * Creates a new accountant controller for managing transactions.
 *
 * @param errorHandler - The error handler to use.
 * @returns The accountant controller.
 */
export function AccountantController(
  errorHandler = handleError,
) {
  const commonTransactionController = CommonController<ITransaction>({
    deleteContent: AccountantManager.deleteTransaction,
    listContent: AccountantManager.listTransactions,
    getContent: AccountantManager.getTransaction,
  }, 'Transaction');

  /**
   * Handles POST requests to create a new transaction with optional goal allocations.
   * Splits the `goals` array out of the request body before passing the remainder
   * to the accountant manager.
   *
   * @param req - The request object containing the transaction payload and optional goals.
   * @param res - The response object.
   * @returns The created transaction.
   */
  const createContent = async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      checkVoidUser(req.user, 'Transaction', 'create');
      checkVoidPayload(req.body, 'Transaction', 'create');

      const { goals, ...transactionPayload } = req.body as ITransaction & { goals: ITransactionGoalEntry[] };
      const content = await AccountantManager.createTransaction(transactionPayload, goals);

      logger.info('Transaction created');

      return res.send(content);
    } catch (error) {
      logger.error(error);

      return errorHandler(error as Error, res);
    }
  };

  /**
   * Handles PUT/PATCH requests to update an existing transaction with optional goal allocations.
   * Splits the optional `goals` array out of the request body before passing the remainder
   * to the accountant manager.
   *
   * @param req - The request object containing the transaction id and update payload.
   * @param res - The response object.
   * @returns The updated transaction.
   */
  const updateContent = async (req: RequestWithUser, res: Response): Promise<Response> => {
    try {
      const { id: contentId } = req.params;

      checkVoidUser(req.user, 'Transaction', 'update');
      checkVoidPayload(req.body, 'Transaction', 'update');

      const { goals, ...transactionPayload } = req.body as Partial<ITransaction> & { goals?: ITransactionGoalEntry[] };
      const content = await AccountantManager.updateTransaction(Number(contentId), transactionPayload, goals);

      logger.info('Transaction updated');

      return res.send(content);
    } catch (error) {
      logger.error(error);

      return errorHandler(error as Error, res);
    }
  };

  return {
    ...commonTransactionController,
    createContent,
    updateContent,
    getTransactionTypes: (req: RequestWithUser, res: Response) => getTransactionTypes(
      req,
      res,
      AccountantManager,
      errorHandler,
    ),
  };
}

export default AccountantController(handleError);
