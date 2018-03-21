const Controller = require('./controller');
const sinon = require('sinon');
const mongoose = require('mongoose');

describe('Controller', function () {
  let throwNewError = undefined;

  beforeEach(function () {
    const fakePromise = {
      then: sinon.stub().returnsThis(),
      catch: sinon.stub().returnsThis()
    };

    const fakeCalls = {
      save: sinon.stub().returns(fakePromise),
      find: sinon.stub().returns(fakePromise),
      findById: sinon.stub().returns(fakePromise),
      findByIdAndUpdate: sinon.stub().returns(fakePromise)
    };

    this.fakeCalls = fakeCalls;
    this.fakePromise = fakePromise;

    this.fakeModel = function () {
      this.save = fakeCalls.save;

      if (throwNewError) {
        throw new throwNewError('This is an error');
      }
    };
    this.fakeModel.collection = { name: 'TestFake' };
    this.fakeModel.find = fakeCalls.find;
    this.fakeModel.findById = fakeCalls.findById;
    this.fakeModel.findByIdAndUpdate = fakeCalls.findByIdAndUpdate;

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

    it('should send a 500 error to the client if anything goes wrong in the database while saving', function(done) {
      const { request, response } = this.expressMocks;
      const dummyData = 'hey';
      const dumbError = new Error('Dumb error');

      this.fakePromise.catch.callsArgWith(0, dumbError);
      request.body = { dummyData };
      response.send = message => {
        this.fakeCalls.save.should.have.been.calledOnce;
        this.fakePromise.catch.should.have.been.calledOnce;

        response.status.should.have.been.calledWith(500);
        message.should.exist;
        message.should.not.be.empty;
        message.should.be.a('String');
        message.should.include('Type:');
        message.should.include(dumbError.name);

        done();
      };

      this.controller.create(request, response);
    });

    it('should send a 404 error if the info provided does not match the document\'s schema', function(done) {
      const { request, response } = this.expressMocks;

      throwNewError = mongoose.Error.ValidationError;

      response.send = message => {
        this.fakeCalls.save.should.have.not.been.called;
        this.fakePromise.catch.should.have.not.been.called;

        response.status.should.have.been.calledWith(404);
        message.should.exist;
        message.should.not.be.empty;
        message.should.be.an('string');
        message.should.include('Type:');
        message.should.include('ValidationError');

        done();
      }

      this.controller.create(request, response);
    });

    it('should send a 404 error if the info provided is with wrong types', function(done) {
      const { request, response } = this.expressMocks;

      throwNewError = mongoose.Error.CastError;

      response.send = message => {
        this.fakeCalls.save.should.have.not.been.called;
        this.fakePromise.catch.should.have.not.been.called;
  
        response.status.should.have.been.calledWith(404);
        message.should.exist;
        message.should.not.be.empty;
        message.should.be.an('string');
        message.should.include('Type:');
        message.should.include('CastError');

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
        this.fakeCalls.find.should.have.been.calledOnce;
        this.fakePromise.then.should.have.been.calledOnce;

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

    it('should return an empty array if no document is found', function (done) {
      const { request, response } = this.expressMocks;
      const dummyResult = [];

      this.fakePromise.then.callsArgWith(0, dummyResult);

      response.json = result => {
        this.fakeCalls.find.should.have.been.calledOnce;
        this.fakePromise.then.should.have.been.calledOnce;

        result.should.exist;
        result.should.be.an('object');
        result.should.own.property('data');
        result.data.should.be.an('array');
        result.data.should.be.empty;

        done();
      };

      this.controller.listAll(request, response);
    });

    it('should send a 500 error to the client if anything goes wrong in the database while listing', function (done) {
      const { request, response } = this.expressMocks;

      this.fakePromise.catch.callsArgWith(0, new Error('Dumb error'));

      response.send = message => {
        this.fakeCalls.find.should.have.been.calledOnce;
        this.fakePromise.catch.should.have.been.calledOnce;

        response.status.should.have.been.calledWith(500);

        message.should.exist;
        message.should.not.be.empty;
        message.should.be.a('String');
        message.should.include('Type:');
        message.should.include('Error');

        done();
      };

      this.controller.listAll(request, response);
    });
  });

  describe('get by id', function () {
    it('should get an document by id', function (done) {
      const { request, response } = this.expressMocks;

      request.params = {
        id: 1 
      };

      this.fakePromise.then.callsArgWith(0, {test: 'dummy'});

      response.json = result => {
        this.fakeCalls.findById.should.have.been.calledOnce;
        this.fakePromise.then.should.have.been.calledOnce;

        result.should.exist;
        result.should.be.an('object');
        result.should.own.property('data');
        result.data.should.be.an('object');

        done();
      };

      this.controller.getById(request, response);
    });

    it('should return empty if no document is found', function (done) {
      const { request, response } = this.expressMocks;

      request.params = {
        id: 1 
      };

      this.fakePromise.then.callsArgWith(0, null);

      response.json = result => {
        this.fakeCalls.findById.should.have.been.calledOnce;
        this.fakePromise.then.should.have.been.calledOnce;

        result.should.exist;
        result.should.be.an('object');
        result.should.own.property('data');
        result.data.should.be.an('object');

        done();
      };

      this.controller.getById(request, response);
    });

    it('should send a 500 error to the client if there is any error with the database while retrieving', function (done) {
      const { request, response } = this.expressMocks;

      request.params = {
        id: 1 
      };

      this.fakePromise.catch.callsArgWith(0, new Error('Dumb error'));

      response.send = message => {
        this.fakeCalls.findById.should.have.been.calledOnce;
        this.fakePromise.catch.should.have.been.calledOnce;

        response.status.should.have.been.calledWith(500);

        message.should.exist;
        message.should.not.be.empty;
        message.should.be.a('String');
        message.should.include('Type:');
        message.should.include('Error');

        done();
      };

      this.controller.getById(request, response);
    });

    it('should send a 404 error to the client if there is no id', function (done) {
      const { request, response } = this.expressMocks;

      request.params = {};

      this.fakePromise.catch.callsArgWith(0, new Error('Dumb error'));

      response.send = message => {
        this.fakeCalls.findById.should.have.not.been.called;

        response.status.should.have.been.calledWith(404);

        message.should.exist;
        message.should.not.be.empty;
        message.should.be.a('String');
        message.should.include('Type:');
        message.should.include('Error');

        done();
      };

      this.controller.getById(request, response);
    });
  });

  describe('update', function () {
    it('should update a model successfully', function (done) {
      const { request, response } = this.expressMocks;

      request.params = { id: 1 };

      this.fakePromise.then.callsArgWith(0, { dummyData: 'hey' });

      response.json = result => {
        this.fakeCalls.findByIdAndUpdate.should.have.been.calledOnce;
        this.fakePromise.then.should.have.been.calledOnce;

        result.should.exist;
        result.should.be.an('object');
        result.should.own.property('data');
        result.data.should.exist;
        result.data.should.be.an('object');

        done();
      };

      this.controller.update(request, response);
    });

    it('should send a 404 error to the client if there is no id');
    it('should send a 404 error to the client if there is no data');
    it('should send a 404 error to the client if the data is not valid');
    it('should send a 500 error to the client if there is any error with the database while updating');
  });
});
