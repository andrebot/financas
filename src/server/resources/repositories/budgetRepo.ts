import BudgetModel from '../models/budgetModel';
import Repository from './repository';
import type {
  IBudget,
  IBudgetDocument,
  ITransaction,
  IBudgetRepo,
} from '../../types';

export class BudgetRepo extends Repository<IBudgetDocument, IBudget> implements IBudgetRepo {
  constructor(budgetModel: typeof BudgetModel = BudgetModel) {
    super(budgetModel);
  }

  /**
   * Updates the budgets by a new transaction. It updates the budgets that match the
   * transaction's categoryand parent category and that are active in the transaction's date.
   *
   * @param transaction - The transaction to update the budgets by
   */
  async updateBudgetsByNewTransaction(transaction: ITransaction): Promise<void> {
    this.logger.info(`Updating budgets in bulk by new transaction: ${transaction.id}`);

    await this.Model.updateMany({
      categories: {
        $in: [transaction.category, transaction.parentCategory],
      },
      startDate: {
        $lte: transaction.date,
      },
      endDate: {
        $gte: transaction.date,
      },
    }, { $inc: { value: transaction.value } });
  }
}

export default new BudgetRepo();
