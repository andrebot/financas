type InvestmentTypeLiteral = string;

const FIXED_INCOME_TYPES = new Set<InvestmentTypeLiteral>([
  'cdb', 'lf', 'lc', 'cri', 'cra', 'debenture', 'tresury',
]);

const EXEMPT_TYPES = new Set<InvestmentTypeLiteral>(['lci', 'lca']);

const IR_BRACKETS: Array<[number, number]> = [
  [180, 0.225],
  [360, 0.20],
  [720, 0.175],
  [Infinity, 0.15],
];

/**
 * Calculates the Brazilian IR (Imposto de Renda) tax owed on fixed income investment income.
 * Uses the regressive IR table based on holding period.
 * LCI and LCA are exempt. Variable income, crypto, and funds return 0 (phase 2).
 *
 * @param investmentType - The investment type enum value.
 * @param grossIncome - The profit earned (dueDate transaction value minus totalInvested).
 * @param holdingDays - The number of days the investment was held.
 * @returns The tax amount in BRL, rounded to 2 decimal places.
 */
export default function calculateTax(
  investmentType: InvestmentTypeLiteral,
  grossIncome: number,
  holdingDays: number,
): number {
  if (grossIncome <= 0) return 0;
  if (EXEMPT_TYPES.has(investmentType)) return 0;
  if (!FIXED_INCOME_TYPES.has(investmentType)) return 0;

  const bracket = IR_BRACKETS.find(([maxDays]) => holdingDays <= maxDays);
  if (!bracket) return 0;

  const [, rate] = bracket;

  return Math.round(grossIncome * rate * 100) / 100;
}
