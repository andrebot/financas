import dayjs from 'dayjs';
import {
  cleanPan,
  detectCardBrand,
  formatExpirationDate,
  isAmericanExpress,
  isDinersClub,
  isDiscover,
  isMaestro,
  isMasterCard,
  isVisa,
} from '../../../src/client/utils/creditCard';

describe('creditCard utils', () => {
  describe('formatExpirationDate', () => {
    it('should format a valid date as MM/YY', () => {
      const date = new Date(2025, 0, 15); // January 15, 2025

      const formatted = formatExpirationDate(date);

      expect(formatted).toBe(dayjs(date).format('MM/YY'));
    });

    it('should return empty string when date is undefined', () => {
      expect(formatExpirationDate(undefined)).toBe('');
    });
  });

  describe('brand detection helpers', () => {
    it('should detect Visa numbers', () => {
      expect(isVisa('4111111111111111')).toBe(true);
      expect(isVisa('5111111111111111')).toBe(false);
    });

    it('should detect MasterCard numbers for 51-55 range', () => {
      expect(isMasterCard('5100000000000000')).toBe(true);
      expect(isMasterCard('5599999999999999')).toBe(true);
      expect(isMasterCard('5099999999999999')).toBe(false);
      expect(isMasterCard('5600000000000000')).toBe(false);
    });

    it('should detect MasterCard numbers for 2221-2720 range', () => {
      expect(isMasterCard('2221000000000000')).toBe(true);
      expect(isMasterCard('2720990000000000')).toBe(true);
      expect(isMasterCard('2220000000000000')).toBe(false);
      expect(isMasterCard('2721000000000000')).toBe(false);
    });

    it('should detect American Express numbers', () => {
      expect(isAmericanExpress('340000000000000')).toBe(true);
      expect(isAmericanExpress('370000000000000')).toBe(true);
      expect(isAmericanExpress('360000000000000')).toBe(false);
    });

    it('should detect Discover numbers', () => {
      expect(isDiscover('6011000000000000')).toBe(true);
      expect(isDiscover('6500000000000000')).toBe(true);
      expect(isDiscover('6221260000000000')).toBe(true);
      expect(isDiscover('6229250000000000')).toBe(true);
      expect(isDiscover('6221250000000000')).toBe(false);
      expect(isDiscover('6229260000000000')).toBe(false);
    });

    it('should detect Diners Club numbers', () => {
      expect(isDinersClub('36000000000000')).toBe(true);
      expect(isDinersClub('38000000000000')).toBe(false);
      expect(isDinersClub('30000000000000')).toBe(false);
    });

    it('should detect Maestro numbers', () => {
      expect(isMaestro('5012345678901234')).toBe(true);
      expect(isMaestro('6011000000000000')).toBe(false);
    });
  });

  describe('cleanPan', () => {
    it('should remove all non-digit characters from the pan', () => {
      expect(cleanPan(' 4111-22a33 ')).toBe('41112233');
      expect(cleanPan('1235 1321 3215 3256')).toBe('1235132132153256');
      expect(cleanPan('abcd')).toBe('');
    });
  });

  describe('detectCardBrand', () => {
    it('detects Visa brand from a full pan', () => {
      expect(detectCardBrand('4111111111111111')).toBe('visa');
    });

    it('detects brand from a pan with spaces and dashes', () => {
      expect(detectCardBrand('4111 1111-1111 1111')).toBe('visa');
      expect(detectCardBrand('5100 0000-0000 0000')).toBe('master');
    });

    it('detects all supported brands', () => {
      expect(detectCardBrand('340000000000000')).toBe('amex');
      expect(detectCardBrand('6011000000000000')).toBe('discover');
      expect(detectCardBrand('36000000000000')).toBe('diners');
      expect(detectCardBrand('5012345678901234')).toBe('maestro');
      expect(detectCardBrand('2221000000000000')).toBe('master');
      expect(detectCardBrand('4100000000000000')).toBe('visa');
      expect(detectCardBrand('2220000000000000')).toBe('unknown');
    });

    it('returns unknown when brand cannot be determined', () => {
      expect(detectCardBrand('0000000000000000')).toBe('unknown');
      expect(detectCardBrand('')).toBe('unknown');
    });
  });
});

