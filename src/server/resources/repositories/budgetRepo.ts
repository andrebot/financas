import BudgetModel, { IBudgetDocument } from '../models/budgetModel';
import { Repository } from './repository';
import { IBudget, ITransaction } from '../../types';

class BudgetRepo extends Repository<IBudgetDocument, IBudget> {
  constructor() {
    super(BudgetModel);
  }

  /**
   * Updates the budgets by a new transaction. It updates the budgets that match the transaction's category
   * and parent category and that are active in the transaction's date.
   *
   * @param transaction - The transaction to update the budgets by
   */
  async updateBudgetsByNewTransaction(transaction: ITransaction): Promise<void> {
    await this.model.updateMany({
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
