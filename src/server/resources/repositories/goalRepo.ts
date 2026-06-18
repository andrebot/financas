import {
  eq, and, lte, sql, inArray,
} from 'drizzle-orm';
import { isInflowType } from '../../utils/transactionTypeUtils';
import Repository from './repository';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { goals } from '../models/goalModel';
import { transactions } from '../models/transactionModel';
import { transactionToInvestments, investmentToGoals } from '../models/investmentModel';
import { createLogger } from '../../utils/logger';
import type { IGoal, ITransaction } from '../../types';
import { getDb } from '../../utils/transaction';

const logger = createLogger('Repository:Goals');
const goalRepo = Repository<typeof goals, IGoal>(goals, 'Goals', logger);

/**
 * Updates the savedValue of all goals linked to a transaction's investment by the percentage
 * defined in the investmentToGoals junction table.
 * When shouldInvertValue is true, the contribution is subtracted (used on delete/revert).
 *
 * @param transaction - The transaction whose linked investment goals should be updated.
 * @param shouldInvertValue - Whether to subtract instead of add the contribution.
 */
async function updateGoalFromTransaction(
  transaction: ITransaction,
  shouldInvertValue: boolean = false,
): Promise<void> {
  logger.info(`Updating goal from transaction: ${transaction.id}`);

  const transactionValue = Number(transaction.value);
  const typeSign = isInflowType(transaction.type) ? 1 : -1;
  const invertSign = shouldInvertValue ? -1 : 1;
  const signedTransactionValue = typeSign * invertSign * transactionValue;

  const linkedInvestments = await getDb()
    .select({ investmentId: transactionToInvestments.investmentId })
    .from(transactionToInvestments)
    .where(eq(transactionToInvestments.transactionId, transaction.id!));

  if (linkedInvestments.length === 0) return;

  await getDb().update(goals)
    .set({
      savedValue: sql`${goals.savedValue} + (${signedTransactionValue} * ${investmentToGoals.percentage}::numeric / 100)`,
    })
    .from(investmentToGoals)
    .where(and(
      eq(investmentToGoals.goalId, goals.id),
      inArray(investmentToGoals.investmentId, linkedInvestments.map((r) => r.investmentId)),
      getAutorizationDatabaseContext(goals),
    ));
}

/**
 * Lists all non-archived goals with savedValue computed from investment transactions
 * that occurred on or before the last day of the given month.
 *
 * @param year - The four-digit year (e.g. 2026).
 * @param month - The month, 1-indexed (e.g. 1 = January).
 * @returns Goals with a month-scoped savedValue.
 */
async function listGoalsWithSavedValueUpTo(year: number, month: number): Promise<IGoal[]> {
  const lastDayOfMonth = new Date(year, month, 0);

  const rows = await getDb()
    .select({
      id: goals.id,
      name: goals.name,
      value: goals.value,
      savedValue: sql<string>`COALESCE(SUM(
        CASE WHEN ${transactions.type}::text = ANY(ARRAY[
          'investmentSell','investmentDividend','investmentInterest','investmentDueDate'
        ])
             THEN ${transactions.value}::numeric * ${investmentToGoals.percentage}::numeric / 100
             ELSE -${transactions.value}::numeric * ${investmentToGoals.percentage}::numeric / 100
        END
      ), 0)`,
      dueDate: goals.dueDate,
      archived: goals.archived,
      userId: goals.userId,
      createdAt: goals.createdAt,
      updatedAt: goals.updatedAt,
    })
    .from(goals)
    .leftJoin(investmentToGoals, eq(investmentToGoals.goalId, goals.id))
    .leftJoin(
      transactionToInvestments,
      eq(transactionToInvestments.investmentId, investmentToGoals.investmentId),
    )
    .leftJoin(
      transactions,
      and(
        eq(transactions.id, transactionToInvestments.transactionId),
        lte(transactions.date, lastDayOfMonth),
      ),
    )
    .where(getAutorizationDatabaseContext(goals))
    .groupBy(
      goals.id,
      goals.name,
      goals.value,
      goals.dueDate,
      goals.archived,
      goals.userId,
      goals.createdAt,
      goals.updatedAt,
    );

  return rows as IGoal[];
}

export default {
  ...goalRepo,
  updateGoalFromTransaction,
  listGoalsWithSavedValueUpTo,
};
