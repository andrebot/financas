import { should } from 'chai';
import { isInflowType, transactionDirectionSign } from '../../../src/server/utils/transactionTypeUtils';
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
