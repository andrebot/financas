/**
 * Formats a numeric goal value using the configured currency.
 *
 * @param value - The goal value to format.
 * @returns The formatted currency string.
 */
export function formatValueToCurrency(value: number, currency: string) { 
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
}
