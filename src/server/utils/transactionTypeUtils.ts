import type { ITransaction } from '../types';

type TransactionType = ITransaction['type'];

/**
 * Set of transaction types that represent money entering an account.
 * Any type absent from this set is treated as an outflow (money leaving the account).
 */
const INFLOW_TYPES = new Set<TransactionType>([
  'deposit',
  'transferIn',
  'pixIn',
  'cardRefund',
  'investmentSell',
  'investmentDividend',
  'investmentInterest',
  'investmentDueDate',
]);

/**
 * Returns true when the transaction type represents money entering the account.
 * Outflow types (withdraw, bankSlip, pixOut, cardPurchase, transferOut, investmentBuy)
 * represent money leaving the account and return false.
 *
 * @param type - The transaction type to classify.
 * @returns True for inflows, false for outflows.
 */
export function isInflowType(type: TransactionType): boolean {
  return INFLOW_TYPES.has(type);
}

/**
 * Returns +1 for inflow types and -1 for outflow types.
 * Multiply a positive transaction value by this to get the signed delta
 * that should be applied to a running balance.
 *
 * @param type - The transaction type to classify.
 * @returns 1 for inflows, -1 for outflows.
 */
export function transactionDirectionSign(type: TransactionType): 1 | -1 {
  return isInflowType(type) ? 1 : -1;
}
