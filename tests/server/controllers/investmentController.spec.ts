import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { Response } from 'express';
import InvestmentController, {
  buildInvestmentFilters,
  listInvestments,
} from '../../../src/server/controllers/investmentController';
import type { IAccountantManager, RequestWithUser } from '../../../src/server/types';

chai.use(sinonChai);
chai.should();

type MockResponse = {
  send: sinon.SinonStub;
  status: sinon.SinonStub;
};

type MockRequest = {
  body?: Record<string, unknown>;
  params: Record<string, string>;
  query: Record<string, string>;
  user?: {
    id: string;
    role: 'admin' | 'user';
    email?: string;
  };
};

describe('InvestmentController', () => {
  let managerStub: {
    createInvestment: sinon.SinonStub;
    updateInvestment: sinon.SinonStub;
    deleteInvestment: sinon.SinonStub;
    getInvestment: sinon.SinonStub;
    listInvestments: sinon.SinonStub;
  };
  let controller: ReturnType<typeof InvestmentController>;
  let response: MockResponse;
  let request: MockRequest;

  beforeEach(() => {
    managerStub = {
      createInvestment: sinon.stub(),
      updateInvestment: sinon.stub(),
      deleteInvestment: sinon.stub(),
      getInvestment: sinon.stub(),
      listInvestments: sinon.stub(),
    };

    controller = InvestmentController(managerStub as unknown as IAccountantManager);

    response = {
      send: sinon.stub().returnsThis(),
      status: sinon.stub().returnsThis(),
    };

    request = {
      body: { name: 'CDB Itaú', investmentType: 'cdb' },
      params: { id: '1' },
      query: {},
      user: {
        id: 'user-123',
        role: 'user',
        email: 'user@test.com',
      },
    };
  });

  describe('buildInvestmentFilters', () => {
    it('should default page and pageSize when none are provided', () => {
      buildInvestmentFilters({}).should.deep.include({ page: 1, pageSize: 20 });
    });

    it('should use the provided page and pageSize', () => {
      buildInvestmentFilters({ page: '3', pageSize: '5' }).should.deep.include({
        page: 3, pageSize: 5,
      });
    });

    it('should default page when it is not a positive number', () => {
      buildInvestmentFilters({ page: '0' }).page!.should.equal(1);
      buildInvestmentFilters({ page: 'not-a-number' }).page!.should.equal(1);
    });

    it('should default pageSize when it is not a positive number', () => {
      buildInvestmentFilters({ pageSize: '-5' }).pageSize!.should.equal(20);
      buildInvestmentFilters({ pageSize: 'nope' }).pageSize!.should.equal(20);
    });

    it('should cap pageSize at 100', () => {
      buildInvestmentFilters({ pageSize: '500' }).pageSize!.should.equal(100);
    });

    it('should parse a comma-separated investmentType list', () => {
      buildInvestmentFilters({ investmentType: 'cdb, lci ,lca' }).investmentTypes!.should.deep.equal(
        ['cdb', 'lci', 'lca'],
      );
    });

    it('should leave investmentTypes undefined when not provided', () => {
      (buildInvestmentFilters({}).investmentTypes === undefined).should.be.true;
    });

    it('should parse archived=true and archived=false', () => {
      buildInvestmentFilters({ archived: 'true' }).archived!.should.equal(true);
      buildInvestmentFilters({ archived: 'false' }).archived!.should.equal(false);
    });

    it('should leave archived undefined for any other value', () => {
      (buildInvestmentFilters({ archived: 'maybe' }).archived === undefined).should.be.true;
      (buildInvestmentFilters({}).archived === undefined).should.be.true;
    });

    it('should parse valid ISO date range params', () => {
      const filters = buildInvestmentFilters({
        createdAtStart: '2026-01-01',
        createdAtEnd: '2026-12-31',
        dueDateStart: '2027-01-01',
        dueDateEnd: '2027-12-31',
      });

      filters.createdAtStart!.should.be.instanceOf(Date);
      filters.createdAtEnd!.should.be.instanceOf(Date);
      filters.dueDateStart!.should.be.instanceOf(Date);
      filters.dueDateEnd!.should.be.instanceOf(Date);
    });

    it('should leave date filters undefined when missing or invalid', () => {
      const filters = buildInvestmentFilters({ createdAtStart: 'not-a-date' });

      (filters.createdAtStart === undefined).should.be.true;
      (filters.createdAtEnd === undefined).should.be.true;
      (filters.dueDateStart === undefined).should.be.true;
      (filters.dueDateEnd === undefined).should.be.true;
    });
  });

  describe('listContent', () => {
    it('should list investments using filters parsed from the query', async () => {
      const page = {
        data: [{ id: 1, name: 'CDB Itaú' }], page: 1, pageSize: 20, total: 1, totalPages: 1,
      };
      managerStub.listInvestments.resolves(page);
      request.query = { investmentType: 'cdb' };

      await controller.listContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.listInvestments.should.have.been.calledOnce;
      const filtersArg = managerStub.listInvestments.firstCall.args[0];
      filtersArg.investmentTypes.should.deep.equal(['cdb']);
      response.send.should.have.been.calledWith(page);
    });

    it('should reject when user is not authenticated', async () => {
      request.user = undefined;

      await listInvestments(
        request as RequestWithUser,
        response as unknown as Response,
        managerStub as unknown as IAccountantManager,
      );

      managerStub.listInvestments.should.not.have.been.called;
      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({
        error: 'User not authenticated to list Investment',
      });
    });

    it('should handle manager errors', async () => {
      const error = new Error('List failed');
      managerStub.listInvestments.rejects(error);

      await listInvestments(
        request as RequestWithUser,
        response as unknown as Response,
        managerStub as unknown as IAccountantManager,
      );

      response.status.should.have.been.calledWith(500);
      response.send.should.have.been.calledWith({ error: error.message });
    });
  });

  describe('createContent', () => {
    it('should create an investment', async () => {
      const investment = { id: 1, name: 'CDB Itaú' };
      managerStub.createInvestment.resolves(investment);

      await controller.createContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.createInvestment.should.have.been.calledOnceWith(request.body);
      response.send.should.have.been.calledWith(investment);
    });
  });

  describe('updateContent', () => {
    it('should update an investment by id', async () => {
      const investment = { id: 1, name: 'CDB Itaú Updated' };
      managerStub.updateInvestment.resolves(investment);

      await controller.updateContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.updateInvestment.should.have.been.calledOnceWith(1, request.body);
      response.send.should.have.been.calledWith(investment);
    });
  });

  describe('deleteContent', () => {
    it('should delete an investment by id', async () => {
      const investment = { id: 1, name: 'CDB Itaú' };
      managerStub.deleteInvestment.resolves(investment);

      await controller.deleteContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.deleteInvestment.should.have.been.calledOnceWith(1);
      response.send.should.have.been.calledWith(investment);
    });
  });

  describe('getContent', () => {
    it('should retrieve an investment by id', async () => {
      const investment = { id: 1, name: 'CDB Itaú' };
      managerStub.getInvestment.resolves(investment);

      await controller.getContent(
        request as RequestWithUser,
        response as unknown as Response,
      );

      managerStub.getInvestment.should.have.been.calledOnceWith(1);
      response.send.should.have.been.calledWith(investment);
    });
  });
});
