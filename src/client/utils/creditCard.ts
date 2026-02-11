import dayjs from "dayjs";
import type { CardBrand } from "../types";

/**
 * Checks if the pan starts with the given prefixes.
 *
 * @param pan - The pan to check.
 * @param prefixes - The prefixes to check.
 * @returns True if the pan starts with the given prefixes, false otherwise.
 */
const startsWith = (pan: string, ...prefixes: (string | number)[]) =>
  prefixes.some(p => pan.startsWith(String(p)));

/**
 * Checks if the pan is in the given range.
 *
 * @param pan - The pan to check.
 * @param start - The start of the range.
 * @param end - The end of the range.
 * @param digits - The number of digits to check.
 * @returns True if the pan is in the given range, false otherwise.
 */
const inRange = (pan: string, start: number, end: number, digits = 6) => {
  const n = parseInt(pan.slice(0, digits), 10);
  return !Number.isNaN(n) && n >= start && n <= end;
};

/**
 * Formats the expiration date to the format "MM/YY".
 *
 * @param date - The date to format.
 * @returns The formatted date.
 */
export function formatExpirationDate(date: Date | undefined): string {
  return date ? dayjs(date).format('MM/YY') : '';
}

/**
 * Checks if the pan is a Visa card.
 * 
 * @remarks
 * - Starts with 4: Visa
 *
 * @param pan - The pan to check.
 * @returns True if the pan is a Visa card, false otherwise.
 */
export function isVisa(pan: string): boolean {
  return pan.startsWith('4');
}

/**
 * Checks if the pan is a MasterCard card.
 * 
 * @remarks
 * - Starts with 51-55 or 2221-2720: MasterCard
 *
 * @param pan - The pan to check.
 * @returns True if the pan is a MasterCard card, false otherwise.
 */
export function isMasterCard(pan: string): boolean {
  return inRange(pan, 510000, 559999) || inRange(pan, 222100, 272099);
}

/**
 * Checks if the pan is an American Express card.
 * 
 * @remarks
 * - Starts with 34 or 37: American Express
 *
 * @param pan - The pan to check.
 * @returns True if the pan is an American Express card, false otherwise.
 */
export function isAmericanExpress(pan: string): boolean {
  return startsWith(pan, 34, 37);
}

/**
 * Checks if the pan is a Discover card.
 * 
 * @remarks
 * - Starts with 6011, 65, 644-649, 622126-622925 and first 3 digits are 644-649: Discover
 *
 * @param pan - The pan to check.
 * @returns True if the pan is a Discover card, false otherwise.
 */
export function isDiscover(pan: string): boolean {
  return startsWith(pan, 6011, 65) ||
    inRange(pan, 644000, 649999, 3) ||
    inRange(pan, 622126, 622925);
}

/**
 * Checks if the pan is a Diners Club card.
 * 
 * @remarks
 * - Starts with 300-305, 36, 38-39: Diners Club
 *
 * @param pan - The pan to check.
 * @returns True if the pan is a Diners Club card, false otherwise.
 */
export function isDinersClub(pan: string): boolean {
  return inRange(pan, 300000, 305999, 3) ||
    startsWith(pan, 36) ||
    inRange(pan, 380000, 399999, 2);
}

/**
 * Checks if the pan is a Maestro card.
 * 
 * @remarks
 * - Starts with 50, 56-69: Maestro (varies by region; overlaps with others)
 *
 * @param pan - The pan to check.
 * @returns True if the pan is a Maestro card, false otherwise.
 */
export function isMaestro(pan: string): boolean {
  return startsWith(pan, 50) || inRange(pan, 560000, 699999, 2);
}

/**
 * Cleans the pan by removing all non-numeric characters.
 *
 * @param pan - The pan to clean.
 * @returns The cleaned pan.
 */
export function cleanPan(pan: string): string {
  return pan.replace(/\D/g, '');
}

const CreditCardsValidators = [
  {
    name: 'visa',
    validator: isVisa,
  },
  {
    name: 'master',
    validator: isMasterCard,
  },
  {
    name: 'amex',
    validator: isAmericanExpress,
  },
  {
    name: 'discover',
    validator: isDiscover,
  },
  {
    name: 'diners',
    validator: isDinersClub,
  },
  {
    name: 'maestro',
    validator: isMaestro,
  },
];

/**
 * Detects the card brand from the given pan or prefix.
 *
 * @param panOrPrefix - The pan or prefix to detect the card brand from.
 * @returns The card brand.
 */
export function detectCardBrand(panOrPrefix: string): CardBrand {
  const pan = cleanPan(panOrPrefix);

  const validator = CreditCardsValidators.find(v => v.validator(pan));
  return validator?.name as CardBrand || 'unknown';
}
