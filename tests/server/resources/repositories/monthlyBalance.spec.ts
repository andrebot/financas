import chai from 'chai';
import sinon, { SinonStub } from 'sinon';
import monthlyBalanceRepo from '../../../../src/server/resources/repositories/monthlyBalanceRepo';
import * as databaseConnection from '../../../../src/server/utils/databaseConnection';
import { monthlyBalances } from '../../../../src/server/resources/models/monthlyBalanceModel';
import type { ITransaction } from '../../../../src/server/types';

describe('MonthlyBalanceRepo', function () {
  const dbHolder = databaseConnection as unknown as { db: { select: SinonStub } };

  let originalDb: unknown;
  let selectStub: SinonStub;
  let selectFromStub: SinonStub;
  let selectWhereStub: SinonStub;

  before(function () {
    originalDb = dbHolder.db;
  });

  beforeEach(function () {
    selectWhereStub = sinon.stub().resolves([]);
    selectFromStub = sinon.stub().returns({ where: selectWhereStub });
    selectStub = sinon.stub().returns({ from: selectFromStub });
    dbHolder.db = { select: selectStub };
  });

  afterEach(function () {
    dbHolder.db = originalDb as { select: SinonStub };
  });

  function buildTransaction(overrides: Partial<ITransaction> = {}): ITransaction {
    return {
      id: 1,
      name: 'Test Transaction',
      categoryId: null,
      accountId: 3,
      type: 'transferIn',
      date: new Date(2021, 0, 15),
      value: '0.00',
      userId: 1,
      createdAt: new Date(),
      updatedAt: null,
      investmentType: null,
      ...overrides,
    } as ITransaction;
  }

  it('should return the row when a monthly balance is found', async function () {
    const lookupDate = new Date(Date.UTC(2021, 5, 1, 15, 0, 0));
    const txn = buildTransaction({ accountId: 5 });
    const row = {
      id: 42,
      accountId: 5,
      date: '2021-06-01',
      openingBalance: '100.00',
      closingBalance: '100.00',
      totalIn: '0',
      totalOut: '0',
      transactionsJson: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    selectWhereStub.resolves([row]);

    const result = await monthlyBalanceRepo.findMonthlyBalance(txn, lookupDate);

    selectStub.should.have.been.calledOnce;
    selectFromStub.should.have.been.calledOnceWithExactly(monthlyBalances);
    selectWhereStub.should.have.been.calledOnce;
    chai.assert.exists(selectWhereStub.firstCall.args[0]);
    chai.expect(result).to.deep.equal(row);
  });

  it('should return null when no monthly balance matches', async function () {
    selectWhereStub.resolves([]);
    const result = await monthlyBalanceRepo.findMonthlyBalance(
      buildTransaction(),
      new Date(2024, 0, 1),
    );

    selectStub.should.have.been.calledOnce;
    chai.expect(result).to.be.null;
  });
});
