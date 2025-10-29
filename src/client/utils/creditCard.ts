export type CardBrand =
  | 'visa'
  | 'master'
  | 'amex'
  | 'discover'
  | 'diners'
  | 'amazon'
  | 'maestro'
  | 'unknown';

const startsWith = (pan: string, ...prefixes: (string | number)[]) =>
  prefixes.some(p => pan.startsWith(String(p)));

const inRange = (pan: string, start: number, end: number, digits = 6) => {
  const n = parseInt(pan.slice(0, digits), 10);
  return !Number.isNaN(n) && n >= start && n <= end;
};

export function detectCardBrand(panOrPrefix: string): CardBrand {
  const pan = panOrPrefix.replace(/\D/g, '');

  // ——— Major networks ———
  if (pan.startsWith('4')) return 'visa';                                   // Visa: 4

  // MasterCard: 51–55, 2221–2720
  if (
    inRange(pan, 510000, 559999) ||
    inRange(pan, 222100, 272099)
  ) return 'master';

  // American Express: 34, 37
  if (startsWith(pan, 34, 37)) return 'amex';

  // Discover: 6011, 65, 644–649, 622126–622925
  if (
    startsWith(pan, 6011, 65) ||
    inRange(pan, 644000, 649999, 3) ||         // check first 3 for 644–649
    inRange(pan, 622126, 622925)
  ) return 'discover';

  // Diners Club: 300–305, 36, 38–39
  if (
    inRange(pan, 300000, 305999, 3) ||
    startsWith(pan, 36) ||
    inRange(pan, 380000, 399999, 2)
  ) return 'diners';

  // Maestro: 50, 56–69 (varies by region; overlaps with others)
  if (
    startsWith(pan, 50) ||
    inRange(pan, 560000, 699999, 2)
  ) return 'maestro';

  return 'unknown';
}
