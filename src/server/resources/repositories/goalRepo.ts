import Repository from './repository';
import { eq, and, sql } from 'drizzle-orm';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { goals } from '../models/goalModel';
import { transactionToGoals } from '../models/transactionModel';
import { createLogger } from '../../utils/logger';
import type { IMonthlyBalance, ITransaction } from '../../types';
import { db } from '../../utils/databaseConnection';

const logger = createLogger('Repository:Goals');
const goalRepo = Repository<typeof goals, IMonthlyBalance>(goals, 'Goals', logger);

async function updateGoalFromTransaction(transaction: ITransaction, shouldInvertValue: boolean = false): Promise<void> {
  logger.info(`Updating goal from transaction: ${transaction.id}`);

  const transactionValue = Number(transaction.value);

  await db.update(goals)
    .set({
      savedValue: sql`${goals.savedValue} ${shouldInvertValue ? '-' : '+'} ${transactionValue} * ${transactionToGoals.percentage}`,
    })
    .from(transactionToGoals)
    .where(and(
      eq(transactionToGoals.goalId, goals.id),
      eq(transactionToGoals.transactionId, transaction.id),
      getAutorizationDatabaseContext(goals),
    ));
}

export default {
  ...goalRepo,
  updateGoalFromTransaction,
};