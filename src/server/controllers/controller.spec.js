const Controller = require('./controller');
const sinon = require('sinon');

describe('Controller', function () {
  beforeEach(function () {
    const fakePromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };

    const fakeCalls = {
      save: sinon.stub().returns(fakePromise)
    };

    this.fakeCalls = fakeCalls;
    this.fakePromise = fakePromise;

    this.fakeModel = function () {
      this.save = fakeCalls.save;
    };
    this.fakeModel.collection = { name: 'TestFake' };

    this.expressMocks = {
      request: {},
      response: {
        status: sinon.stub().returnsThis()
      }
    }

    this.controller = Controller(this.fakeModel);
  });

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

  it('should send the client an error if any goes wrong in the database while saving', function(done) {
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
});