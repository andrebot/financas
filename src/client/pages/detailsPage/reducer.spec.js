import sinon from 'sinon';
import axios from 'axios';
import AxiosMockAdapter from 'axios-mock-adapter';
import reducer from './reducer.jsx';
import { fetchIncomeTransactions,
        loadingIncome,
        handleIncomeTransactionsResponse,
        LOADING_INCOME_TRANSACTIONS,
        ERROR_LOADING_TRANSACTIONS,
        LOADED_INCOME_TRANSACTIONS } from './actions.jsx';

const axiosMock = new AxiosMockAdapter(axios);

describe('Details Page', function () {
  beforeEach(function () {
    axiosMock.reset();
  });

  describe('Actions', function () {
    it('should fire the request to the server to fetch all income transactions', function (done) {
      const monthNumber = 1;
      const year = 2018;
      const actionFunction = fetchIncomeTransactions({ monthNumber, year });
      const dispatchMock = sinon.spy();
      const mockData = [{
        date: Date.now()
      }];

      axiosMock.onGet(`/api/v1/transaction?month=${monthNumber}&year=${year}`).reply(200, {
        data: mockData
      });

      actionFunction(dispatchMock).then(function () {
        dispatchMock.should.have.been.calledTwice;
        dispatchMock.should.have.been.calledWith({
          type: LOADING_INCOME_TRANSACTIONS,
          incomeTransactions: {
            isLoading: true,
            errors: [],
            data: []
          }
        });
        dispatchMock.should.have.been.calledWith({
          type: LOADED_INCOME_TRANSACTIONS,
          incomeTransactions: {
            isLoading: false,
            errors: [],
            data: mockData.map(income => ({date: new Date(income.date)}))
          }
        });

        done();
      }).catch(done);
    });

    it('should update the state accordingly if there is an error when fetching income', function (done) {
      const monthNumber = 1;
      const year = 2018;
      const actionFunction = fetchIncomeTransactions({ monthNumber, year });
      const dispatchMock = sinon.spy();
      const mockError = new Error('Request failed with status code 404');

      axiosMock.onGet(`/api/v1/transaction?month=${monthNumber}&year=${year}`).reply(function () {
        return new Promise((resolve, reject) => {
          reject(mockError);
        });
      });

      actionFunction(dispatchMock).then(function () {
        dispatchMock.should.have.been.calledTwice;
        dispatchMock.should.have.been.calledWith({
          type: LOADING_INCOME_TRANSACTIONS,
          incomeTransactions: {
            isLoading: true,
            errors: [],
            data:  []
          }
        });
        dispatchMock.should.have.been.calledWith({
          type: ERROR_LOADING_TRANSACTIONS,
          incomeTransactions: {
            isLoading: false,
            errors: [ mockError ],
            data: []
          }
        });

        done();
      }).catch(done);
    });
  });

  describe('Reducer', function () {
    it('should return a initial state with empty data and loading flag', function () {
      const state = reducer(undefined, { type: '' });

      state.should.not.be.empty;
      state.incomeTransactions.should.exist;
      state.incomeTransactions.isLoading.should.be.true;
      state.incomeTransactions.errors.should.be.an('array');
      state.incomeTransactions.errors.should.be.empty;
      state.incomeTransactions.data.should.be.an('array');
      state.incomeTransactions.data.should.be.empty;
    });

    it('should update state with LOADING_INCOME_TRANSACTIONS status', function () {
      const state = reducer(undefined, loadingIncome);

      state.should.not.be.empty;
      state.incomeTransactions.should.exist;
      state.incomeTransactions.isLoading.should.be.true;
      state.incomeTransactions.errors.should.be.an('array');
      state.incomeTransactions.errors.should.be.empty;
      state.incomeTransactions.data.should.be.an('array');
      state.incomeTransactions.data.should.be.empty;
    });

    it('should update state with LOADED_INCOME_TRANSACTIONS status', function () {
      const mockData = [{ name: 'dummy' }];
      const state = reducer(undefined, handleIncomeTransactionsResponse(mockData));

      state.should.not.be.empty;
      state.incomeTransactions.should.exist;
      state.incomeTransactions.isLoading.should.be.false;
      state.incomeTransactions.errors.should.be.an('array');
      state.incomeTransactions.errors.should.be.empty;
      state.incomeTransactions.data.should.be.an('array');
      state.incomeTransactions.data.should.not.be.empty;
    });
  });
});
