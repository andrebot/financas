import { createLogger } from '../utils/logger';
import calculateTax from '../engine/taxEngine';
import InvestmentRepo from '../resources/repositories/investmentRepo';
import type {
  IInvestment, IInvestmentRepo, IInvestmentTransactionEntry, ITransaction,
} from '../types';

const logger = createLogger('InvestmentManager');

/**
 * Applies an investment transaction entry to the position and goal tables.
 * Creates the investment inline if no id is provided in the entry.
 * Returns a tax transaction payload when the transaction is an investmentDueDate
 * with positive gross income. The caller is responsible for saving that transaction.
 *
 * @param transaction - The saved transaction being applied.
 * @param entry - The investment-specific data carried alongside the transaction.
 * @param investmentRepo - The investment repository to use.
 * @returns A partial tax transaction payload, or null when no tax applies.
 */
export async function applyInvestmentTransaction(
  transaction: ITransaction,
  entry: IInvestmentTransactionEntry,
  investmentRepo: IInvestmentRepo,
): Promise<Partial<ITransaction> | null> {
  const entryRef = entry.investment as { id?: number };
  let investmentId: number;

  if (entryRef.id) {
    investmentId = entryRef.id;
  } else {
    logger.info('Creating investment inline from transaction entry');

    const created = await investmentRepo.save({
      ...(entry.investment as Partial<IInvestment>),
      totalInvested: '0',
      archived: false,
    });

    investmentId = created.id!;
  }

  await investmentRepo.saveTransactionLink(
    transaction.id!,
    investmentId,
    entry.quantity,
    entry.unitPrice,
  );

  await investmentRepo.applyTransactionToPosition(
    investmentId,
    transaction,
    entry.quantity,
    entry.unitPrice,
  );

  if (entry.goals && entry.goals.length > 0) {
    await investmentRepo.saveGoalAllocations(investmentId, entry.goals);
  }

  if (transaction.type === 'investmentDueDate') {
    const investment = await investmentRepo.findById(investmentId);

    if (investment) {
      const grossIncome = Number(transaction.value) - Number(investment.totalInvested);
      const holdingMs = transaction.date.getTime() - new Date(investment.createdAt).getTime();
      const holdingDays = Math.floor(holdingMs / (1000 * 60 * 60 * 24));
      const taxAmount = calculateTax(investment.investmentType, grossIncome, holdingDays);

      await investmentRepo.archiveInvestment(investmentId);

      if (taxAmount > 0) {
        return {
          name: `IR - ${investment.name}`,
          type: 'investmentTax' as const,
          value: String(taxAmount),
          accountId: transaction.accountId,
          date: transaction.date,
          userId: transaction.userId,
          investmentType: investment.investmentType,
        };
      }
    }
  }

  return null;
}

/**
 * Reverts the investment impact of a transaction before it is deleted.
 * Pre-deletes the transactionToInvestments junction row so that recalculatePosition
 * sees the correct remaining state; the subsequent cascade delete becomes a no-op.
 *
 * @param transaction - The transaction being reverted.
 * @param investmentRepo - The investment repository to use.
 */
export async function revertInvestmentTransaction(
  transaction: ITransaction,
  investmentRepo: IInvestmentRepo,
): Promise<void> {
  const link = await investmentRepo.findTransactionLink(transaction.id!);
  if (!link) return;

  await investmentRepo.deleteTransactionLink(transaction.id!);
  await investmentRepo.recalculatePosition(link.investmentId);
}

/**
 * Creates an investment manager with CRUD operations and transaction hooks.
 *
 * @param investmentRepo - Repository for investment persistence.
 * @returns Investment CRUD actions and transaction lifecycle hooks.
 */
export function InvestmentManager(investmentRepo: IInvestmentRepo) {
  return {
    createInvestment: (investment: Partial<IInvestment>) => investmentRepo.save(investment),
    updateInvestment: (id: number, payload: Partial<IInvestment>) => (
      investmentRepo.update(id, payload)
    ),
    deleteInvestment: (id: number) => investmentRepo.deleteById(id),
    getInvestment: (id: number) => investmentRepo.findById(id),
    listInvestments: () => investmentRepo.listAll(),
    applyInvestmentTransaction: (
      transaction: ITransaction,
      entry: IInvestmentTransactionEntry,
    ) => applyInvestmentTransaction(transaction, entry, investmentRepo),
    revertInvestmentTransaction: (
      transaction: ITransaction,
    ) => revertInvestmentTransaction(transaction, investmentRepo),
  };
}

export default InvestmentManager(InvestmentRepo);
