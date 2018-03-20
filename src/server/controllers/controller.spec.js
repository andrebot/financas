const Controller = require('./controller');
const sinon = require('sinon');

describe('Controller', function () {
  let throwNewError = false;

  beforeEach(function () {
    const fakePromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };

    const fakeCalls = {
      save: sinon.stub().returns(fakePromise),
      find: sinon.stub().returns(fakePromise)
    };

    this.fakeCalls = fakeCalls;
    this.fakePromise = fakePromise;

    this.fakeModel = function () {
      this.save = fakeCalls.save;

      if (throwNewError) {
        throw new Error('This is a creation error');
      }
    };
    this.fakeModel.collection = { name: 'TestFake' };
    this.fakeModel.find = fakeCalls.find;

    this.expressMocks = {
      request: {},
      response: {
        status: sinon.stub().returnsThis()
      }
    }

    this.controller = Controller(this.fakeModel);
    throwNewError = false;
  });

  describe('create', function () {
    it('should save successfully a generic model', function (done) {
      const { request, response } = this.expressMocks;
      const dummyData = 'hey';

      this.fakePromise.then.callsArgWith(0, { dummyData, _id: 1 });

      request.body = { dummyData };
      response.json = result => {
        this.fakeCalls.save.should.have.been.calledOnce;
        this.fakePromise.then.should.have.been.calledOnce;
        this.fakePromise.catch.should.have.not.been.called;

        result.should.be.an('Object');
        result.should.have.property('data');
        result.data.should.exist;

        done();
      };

      this.controller.create(request, response);
    });

    it('should send the client an error if anything goes wrong in the database while saving', function(done) {
      const { request, response } = this.expressMocks;
      const dummyData = 'hey';

      this.fakePromise.catch.callsArgWith(0, new Error('Dumb error'));
      request.body = { dummyData };
      response.send = message => {
        this.fakeCalls.save.should.have.been.calledOnce;
        this.fakePromise.catch.should.have.been.calledOnce;

        message.should.be.a('String');
        message.should.not.be.empty;

        done();
      };

      this.controller.create(request, response);
    });

    it('should send the client an error if the info provided does not match', function(done) {
      const { request, response } = this.expressMocks;

      throwNewError = true;

      response.send = message => {
        this.fakeCalls.save.should.have.not.been.called;
        this.fakePromise.catch.should.have.not.been.called;
  
        response.status.should.have.been.calledWith(500);
        message.should.exist;
        message.should.be.an('string');
        message.should.not.be.empty;

        done();
      }

      this.controller.create(request, response);
    });
  });

  describe('list all', function () {
    it('should list all documents of a model', function (done) {
      const { request, response } = this.expressMocks;
      const dummyResult = [{dummyData: 'hey'}];

      this.fakePromise.then.callsArgWith(0, dummyResult);

      response.json = result => {
        result.should.exist;
        result.should.be.an('object');
        result.should.own.property('data');
        result.data.should.be.an('array');
        result.data.should.not.be.empty;
        result.data.length.should.be.eq(dummyResult.length);

        done();
      };

      this.controller.listAll(request, response);
    });
  });
});
