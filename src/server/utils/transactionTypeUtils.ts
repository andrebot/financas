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

const INVESTMENT_TYPES = new Set<TransactionType>([
  'investmentBuy',
  'investmentSell',
  'investmentDividend',
  'investmentInterest',
  'investmentDueDate',
  'investmentTax',
]);

/** investmentBuy deploys capital — goal progress increases. */
const INVESTMENT_CAPITAL_IN_TYPES = new Set<TransactionType>(['investmentBuy']);

/** investmentDueDate and investmentSell return capital — goal progress decreases. */
const INVESTMENT_CAPITAL_OUT_TYPES = new Set<TransactionType>([
  'investmentDueDate',
  'investmentSell',
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
 * Returns true when the transaction type belongs to the investment family.
 *
 * @param type - The transaction type to classify.
 * @returns True for investment types, false otherwise.
 */
export function isInvestmentType(type: TransactionType): boolean {
  return INVESTMENT_TYPES.has(type);
}

/**
 * Returns true when the transaction deploys capital into an investment,
 * increasing goal progress (investmentBuy).
 *
 * @param type - The transaction type to classify.
 * @returns True when the type represents capital going in.
 */
export function isInvestmentCapitalIn(type: TransactionType): boolean {
  return INVESTMENT_CAPITAL_IN_TYPES.has(type);
}

/**
 * Returns true when the transaction returns capital from an investment,
 * decreasing goal progress (investmentDueDate, investmentSell).
 *
 * @param type - The transaction type to classify.
 * @returns True when the type represents capital coming out.
 */
export function isInvestmentCapitalOut(type: TransactionType): boolean {
  return INVESTMENT_CAPITAL_OUT_TYPES.has(type);
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
