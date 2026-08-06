import {
  and, eq, sql, inArray, gte, lte, desc, count,
} from 'drizzle-orm';
import Repository from './repository';
import { getDb } from '../../utils/transaction';
import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { createLogger } from '../../utils/logger';
import { investments, transactionToInvestments, investmentToGoals } from '../models/investmentModel';
import { transactions } from '../models/transactionModel';
import type {
  IInvestment,
  IInvestmentGoalEntry,
  IInvestmentTransactionLink,
  IInvestmentListFilters,
  IPaginatedResult,
  ITransaction,
} from '../../types';

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

const logger = createLogger('Repository:Investment');
const investmentRepo = Repository<typeof investments, IInvestment>(investments, 'Investment', logger);

async function saveTransactionLink(
  transactionId: number,
  investmentId: number,
  quantity?: number,
  unitPrice?: number,
): Promise<void> {
  logger.info(`Linking transaction ${transactionId} to investment ${investmentId}`);

  await getDb().insert(transactionToInvestments).values({
    transactionId,
    investmentId,
    quantity: quantity !== undefined ? String(quantity) : null,
    unitPrice: unitPrice !== undefined ? String(unitPrice) : null,
  });
}

async function findTransactionLink(
  transactionId: number,
): Promise<IInvestmentTransactionLink | null> {
  logger.info(`Finding transaction link for transaction ${transactionId}`);

  const rows = await getDb()
    .select()
    .from(transactionToInvestments)
    .where(eq(transactionToInvestments.transactionId, transactionId))
    .limit(1);

  return rows.length > 0 ? rows[0] : null;
}

async function deleteTransactionLink(transactionId: number): Promise<void> {
  logger.info(`Deleting transaction link for transaction ${transactionId}`);

  await getDb()
    .delete(transactionToInvestments)
    .where(eq(transactionToInvestments.transactionId, transactionId));
}

async function saveGoalAllocations(
  investmentId: number,
  goals: IInvestmentGoalEntry[],
): Promise<void> {
  logger.info(`Saving goal allocations for investment ${investmentId}`);

  await getDb()
    .delete(investmentToGoals)
    .where(eq(investmentToGoals.investmentId, investmentId));

  if (goals.length === 0) return;

  await getDb().insert(investmentToGoals).values(
    goals.map((g) => ({
      investmentId,
      goalId: g.goalId,
      percentage: String(g.percentage),
    })),
  );
}

async function findGoalAllocations(investmentId: number): Promise<IInvestmentGoalEntry[]> {
  logger.info(`Finding goal allocations for investment ${investmentId}`);

  const rows = await getDb()
    .select()
    .from(investmentToGoals)
    .where(eq(investmentToGoals.investmentId, investmentId));

  return rows.map((r) => ({
    goalId: r.goalId,
    percentage: Number(r.percentage),
  }));
}

async function applyTransactionToPosition(
  investmentId: number,
  transaction: ITransaction,
  quantity?: number,
  unitPrice?: number,
): Promise<void> {
  const { type, value } = transaction;
  const txValue = Number(value);

  if (type === 'investmentBuy') {
    if (quantity !== undefined && unitPrice !== undefined) {
      const rows = await getDb()
        .select({
          quantity: investments.quantity,
          averagePrice: investments.averagePrice,
          totalInvested: investments.totalInvested,
        })
        .from(investments)
        .where(and(eq(investments.id, investmentId), getAutorizationDatabaseContext(investments)))
        .limit(1);

      if (rows.length === 0) return;

      const current = rows[0];
      const oldQty = Number(current.quantity ?? 0);
      const oldAvg = Number(current.averagePrice ?? 0);
      const newQty = oldQty + quantity;
      const newAvg = newQty > 0
        ? (oldQty * oldAvg + quantity * unitPrice) / newQty
        : unitPrice;

      await getDb().update(investments)
        .set({
          quantity: String(newQty),
          averagePrice: String(newAvg),
          totalInvested: String(Number(current.totalInvested) + txValue),
        })
        .where(and(eq(investments.id, investmentId), getAutorizationDatabaseContext(investments)));
    } else {
      await getDb().update(investments)
        .set({ totalInvested: sql`${investments.totalInvested} + ${txValue}` })
        .where(and(eq(investments.id, investmentId), getAutorizationDatabaseContext(investments)));
    }
  } else if (type === 'investmentSell') {
    if (!quantity) return;

    const rows = await getDb()
      .select({
        quantity: investments.quantity,
        averagePrice: investments.averagePrice,
        totalInvested: investments.totalInvested,
      })
      .from(investments)
      .where(and(eq(investments.id, investmentId), getAutorizationDatabaseContext(investments)))
      .limit(1);

    if (rows.length === 0) return;

    const current = rows[0];
    const oldQty = Number(current.quantity ?? 0);
    const oldAvg = Number(current.averagePrice ?? 0);
    const newQty = oldQty - quantity;
    const costBasis = quantity * oldAvg;
    const newTotalInvested = Math.max(0, Number(current.totalInvested) - costBasis);

    await getDb().update(investments)
      .set({
        quantity: String(newQty),
        totalInvested: String(newTotalInvested),
        archived: newQty <= 0,
      })
      .where(and(eq(investments.id, investmentId), getAutorizationDatabaseContext(investments)));
  }
}

async function recalculatePosition(investmentId: number): Promise<void> {
  logger.info(`Recalculating position for investment ${investmentId}`);

  const links = await getDb()
    .select({
      quantity: transactionToInvestments.quantity,
      unitPrice: transactionToInvestments.unitPrice,
      txType: transactions.type,
      txValue: transactions.value,
    })
    .from(transactionToInvestments)
    .innerJoin(transactions, eq(transactions.id, transactionToInvestments.transactionId))
    .where(eq(transactionToInvestments.investmentId, investmentId))
    .orderBy(transactions.date);

  type PositionAccum = {
    qty: number;
    avgPrice: number;
    totalInvested: number;
    hasDueDate: boolean;
    hasVariableIncome: boolean;
  };

  const position = links.reduce<PositionAccum>((acc, link) => {
    const txValue = Number(link.txValue);

    if (link.txType === 'investmentBuy') {
      const next = { ...acc, totalInvested: acc.totalInvested + txValue };

      if (link.quantity !== null && link.unitPrice !== null) {
        const linkQty = Number(link.quantity);
        const linkPrice = Number(link.unitPrice);
        const newQty = acc.qty + linkQty;
        next.hasVariableIncome = true;
        next.qty = newQty;
        next.avgPrice = newQty > 0
          ? (acc.qty * acc.avgPrice + linkQty * linkPrice) / newQty
          : linkPrice;
      }

      return next;
    }

    if (link.txType === 'investmentSell' && link.quantity !== null) {
      const linkQty = Number(link.quantity);
      return {
        ...acc,
        qty: acc.qty - linkQty,
        totalInvested: Math.max(0, acc.totalInvested - linkQty * acc.avgPrice),
      };
    }

    if (link.txType === 'investmentDueDate') {
      return { ...acc, hasDueDate: true };
    }

    return acc;
  }, {
    qty: 0, avgPrice: 0, totalInvested: 0, hasDueDate: false, hasVariableIncome: false,
  });

  const {
    qty, avgPrice, totalInvested, hasDueDate, hasVariableIncome,
  } = position;

  const archived = hasDueDate || (hasVariableIncome && qty <= 0 && links.length > 0);

  await getDb().update(investments)
    .set({
      quantity: hasVariableIncome && qty > 0 ? String(qty) : null,
      averagePrice: hasVariableIncome && qty > 0 && avgPrice > 0 ? String(avgPrice) : null,
      totalInvested: String(Math.max(0, totalInvested)),
      archived,
    })
    .where(and(
      eq(investments.id, investmentId),
      getAutorizationDatabaseContext(investments),
    ));
}

async function archiveInvestment(investmentId: number): Promise<void> {
  logger.info(`Archiving investment ${investmentId}`);

  await getDb().update(investments)
    .set({ archived: true })
    .where(and(
      eq(investments.id, investmentId),
      getAutorizationDatabaseContext(investments),
    ));
}

/**
 * Returns a filtered, paginated page of investments, scoped to the current
 * authorization context. pageSize is capped at {@link MAX_PAGE_SIZE}.
 *
 * @param filters - The page/pageSize and filter criteria to apply.
 * @returns The matching page of investments plus pagination metadata.
 */
async function listPaginated(
  filters: IInvestmentListFilters,
): Promise<IPaginatedResult<IInvestment>> {
  const {
    page = 1,
    pageSize = DEFAULT_PAGE_SIZE,
    investmentTypes,
    archived,
    createdAtStart,
    createdAtEnd,
    dueDateStart,
    dueDateEnd,
  } = filters;

  const cappedPageSize = Math.min(Math.max(pageSize, 1), MAX_PAGE_SIZE);
  const safePage = Math.max(page, 1);
  const offset = (safePage - 1) * cappedPageSize;

  logger.info(`Listing investments, page ${safePage} (size ${cappedPageSize})`);

  const whereClause = and(
    getAutorizationDatabaseContext(investments),
    investmentTypes && investmentTypes.length > 0
      ? inArray(investments.investmentType, investmentTypes as IInvestment['investmentType'][])
      : undefined,
    archived === undefined ? undefined : eq(investments.archived, archived),
    createdAtStart ? gte(investments.createdAt, createdAtStart) : undefined,
    createdAtEnd ? lte(investments.createdAt, createdAtEnd) : undefined,
    dueDateStart ? gte(investments.dueDate, dueDateStart) : undefined,
    dueDateEnd ? lte(investments.dueDate, dueDateEnd) : undefined,
  );

  const [data, [{ total }]] = await Promise.all([
    getDb()
      .select()
      .from(investments)
      .where(whereClause)
      .orderBy(desc(investments.createdAt))
      .limit(cappedPageSize)
      .offset(offset),
    getDb()
      .select({ total: count() })
      .from(investments)
      .where(whereClause),
  ]);

  return {
    data,
    page: safePage,
    pageSize: cappedPageSize,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / cappedPageSize),
  };
}

export default {
  ...investmentRepo,
  saveTransactionLink,
  findTransactionLink,
  deleteTransactionLink,
  saveGoalAllocations,
  findGoalAllocations,
  applyTransactionToPosition,
  recalculatePosition,
  archiveInvestment,
  listPaginated,
};
