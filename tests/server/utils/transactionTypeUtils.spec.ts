import { should } from 'chai';
import {
  isInflowType,
  transactionDirectionSign,
  isInvestmentType,
  isInvestmentCapitalIn,
  isInvestmentCapitalOut,
} from '../../../src/server/utils/transactionTypeUtils';
import type { ITransaction } from '../../../src/server/types';

should();

type TransactionType = ITransaction['type'];

describe('transactionTypeUtils', () => {
  describe('isInflowType', () => {
    const inflowTypes: TransactionType[] = [
      'deposit',
      'transferIn',
      'pixIn',
      'cardRefund',
      'investmentSell',
      'investmentDividend',
      'investmentInterest',
      'investmentDueDate',
    ];

    const outflowTypes: TransactionType[] = [
      'withdraw',
      'bankSlip',
      'pixOut',
      'cardPurchase',
      'transferOut',
      'investmentBuy',
    ];

    inflowTypes.forEach((type) => {
      it(`should return true for inflow type: ${type}`, () => {
        isInflowType(type).should.be.true;
      });
    });

    outflowTypes.forEach((type) => {
      it(`should return false for outflow type: ${type}`, () => {
        isInflowType(type).should.be.false;
      });
    });
  });

  describe('isInvestmentType', () => {
    const investmentTypes: TransactionType[] = [
      'investmentBuy',
      'investmentSell',
      'investmentDividend',
      'investmentInterest',
      'investmentDueDate',
      'investmentTax',
    ];

    const nonInvestmentTypes: TransactionType[] = [
      'deposit', 'withdraw', 'transferIn', 'transferOut', 'pixIn', 'pixOut', 'cardPurchase',
    ];

    investmentTypes.forEach((type) => {
      it(`should return true for investment type: ${type}`, () => {
        isInvestmentType(type).should.be.true;
      });
    });

    nonInvestmentTypes.forEach((type) => {
      it(`should return false for non-investment type: ${type}`, () => {
        isInvestmentType(type).should.be.false;
      });
    });
  });

  describe('isInvestmentCapitalIn', () => {
    it('should return true for investmentBuy', () => {
      isInvestmentCapitalIn('investmentBuy').should.be.true;
    });

    it('should return false for investmentDueDate', () => {
      isInvestmentCapitalIn('investmentDueDate').should.be.false;
    });

    it('should return false for investmentSell', () => {
      isInvestmentCapitalIn('investmentSell').should.be.false;
    });

    it('should return false for non-capital types', () => {
      isInvestmentCapitalIn('investmentInterest').should.be.false;
      isInvestmentCapitalIn('investmentDividend').should.be.false;
      isInvestmentCapitalIn('investmentTax').should.be.false;
    });
  });

  describe('isInvestmentCapitalOut', () => {
    it('should return true for investmentDueDate', () => {
      isInvestmentCapitalOut('investmentDueDate').should.be.true;
    });

    it('should return true for investmentSell', () => {
      isInvestmentCapitalOut('investmentSell').should.be.true;
    });

    it('should return false for investmentBuy', () => {
      isInvestmentCapitalOut('investmentBuy').should.be.false;
    });

    it('should return false for non-capital types', () => {
      isInvestmentCapitalOut('investmentInterest').should.be.false;
      isInvestmentCapitalOut('investmentDividend').should.be.false;
      isInvestmentCapitalOut('investmentTax').should.be.false;
    });
  });

  describe('transactionDirectionSign', () => {
    it('should return 1 for inflow types', () => {
      transactionDirectionSign('deposit').should.equal(1);
      transactionDirectionSign('transferIn').should.equal(1);
      transactionDirectionSign('pixIn').should.equal(1);
    });

    it('should return -1 for outflow types', () => {
      transactionDirectionSign('withdraw').should.equal(-1);
      transactionDirectionSign('cardPurchase').should.equal(-1);
      transactionDirectionSign('transferOut').should.equal(-1);
    });
  });
});
