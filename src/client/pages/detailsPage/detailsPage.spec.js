import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import { Loader, Table } from 'semantic-ui-react';
import DetailsPage from './detailsPage';

describe('detailsPage', function () {
  beforeEach(function () {
    this.loadIncomeTransactions = sinon.spy();
    this.loadBills = sinon.spy();
  });

  it('should render loading status while loading data', function () {
    const params = {
      loadIncomeTransactions: this.loadIncomeTransactions,
      loadBills: this.loadBills,
      incomeTransactions: {
        isLoading: true
      },
      bills: {
        isLoading: true
      },
      currentDate: 1,
      currentMonth: 4
    };

    const page = mount(<DetailsPage {...params}/>);

    page.find(Loader).length.should.be.eq(2);
    page.find(Table).length.should.be.be.eq(0);

    this.loadIncomeTransactions.should.have.been.calledOnce;
  });

  it('should render the whole page if we have all data available', function () {
    const params = {
      isLoading: false,
      loadIncomeTransactions: this.loadIncomeTransactions,
      loadBills: this.loadBills,
      currentDate: {
        monthName: 'January',
        monthNumber: 1,
        year: 2018
      },
      incomeTransactions: {
        data: [{
          name: 'dummy',
          to: 'dummy',
          date: new Date(),
          value: 312
        }],
        isLoading: false
      },
      bills: {
        isLoading: false,
        data: [{
          name: 'dummy',
          value: 321,
          dueDay: 1,
          paidAt: [new Date()]
        }]
      }
    };

    const page = mount(<DetailsPage {...params}/>);

    page.find(Loader).length.should.be.eq(0);
    page.find(Table).length.should.be.be.eq(2);

    this.loadIncomeTransactions.should.have.been.calledOnce;
  });

  it('should always render loading status template if the isLoading is true', function () {
    const params = {
      isLoading: true,
      loadIncomeTransactions: this.loadIncomeTransactions,
      incomeTransactions: [{
        name: 'dummy',
        to: 'dummy',
        date: new Date(),
        value: 312
      }]
    };

    const page = mount(<DetailsPage {...params}/>);

    page.find(Loader).length.should.be.eq(1);
    page.find(Table).length.should.be.be.eq(0);

    this.loadIncomeTransactions.should.have.been.calledOnce;
  });
});