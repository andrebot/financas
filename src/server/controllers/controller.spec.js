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
      response: {}
    }

    this.controller = Controller(this.fakeModel);
  });

  it('should save successfully a generic model', function (done) {
    const { request, response } = this.expressMocks;
    const dummyData = 'hey';

    this.fakePromise.then.callsArgWith(0, { dummyData, _id: 1 });

    request.body = { dummyData };
    response.json = (result) => {
      this.fakeCalls.save.should.have.been.calledOnce;
      this.fakePromise.then.should.have.been.calledOnce;

      result.should.be.an('Object');
      result.should.have.property('data');
      result.data.should.exist;

      done();
    };

    this.controller.create(request, response);
  });
});
