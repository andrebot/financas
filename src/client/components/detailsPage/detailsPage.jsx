import React, { Component } from 'react';
import { Segment, Grid, Loader, Header, Icon, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { fetchIncomeTransactions } from './actions.jsx';
import Table from '../table/table.jsx';

const loadingStyle = { position: 'relative', height: '80px' };
export default class DetailsPage extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.loadIncomeTransactions(this.props.currentDate);
    this.props.loadBills(this.props.currentDate);
  }

  createIncomeTable(incomeTransactions) {
    const headers = [
      { title: 'Item', mapTo: 'name' },
      { title: 'Date', mapTo: 'date' },
      { title: 'Bank', mapTo: 'to' },
      { title: 'Value', mapTo: 'value' }
    ];
    const tableData = incomeTransactions.map(income => {
      const { name, to, date, value, ...remains } = income;

      return {
        name:  { value: name, type: 'String' },
        to:    { value: to, type: 'String' },
        date:  { value: date, type: 'Date' },
        value: { value, type: 'Currency' }
      };
    });

    return <Table headers={headers} data={tableData}/>
  }

  createBillsTable(bills, currentMonth) {
    const transform = function (value) {
      const date = new Date();
      date.setMonth(currentMonth);
      date.setDate(value);

      return date;
    };

    const headers = [
      { title: 'Paid', mapTo: 'paid' },
      { title: 'Name', mapTo: 'name' },
      { title: 'Due Date', mapTo: 'dueDate', transform },
      { title: 'Paid at', mapTo: 'paidAt' },
      { title: 'Value', mapTo: 'value' }
    ];
    const tableData = bills.map(bill => {
      const { paid, name, dueDate, paidAt, value, ...remains } = bill;

      return {
        paid:    { value: paid, type: 'Boolean' },
        name:    { value: name, type: 'String' },
        dueDate: { value: dueDate, type: 'Date' },
        paidAt:  { value: paidAt, type: 'Date' },
        value:   { value, type: 'Currency' }
      };
    });

    return <Table headers={headers} data={tableData}/>
  }

  createMonthNavigation({ monthName, monthNumber, year }, nextMonth) {
    const buttonStyle = {
      float: 'right'
    };

    return (
      <Grid.Row columns={5}>
        <Grid.Column>
        </Grid.Column>
        <Grid.Column>
          <Button icon style={buttonStyle} onClick={() => nextMonth(monthNumber, year, false)}>
            <Icon name="left arrow"></Icon>
          </Button>
        </Grid.Column>
        <Grid.Column>
          <Header textAlign='center' as='h1'>{monthName} / {year}</Header>
        </Grid.Column>
        <Grid.Column>
          <Button icon onClick={() => nextMonth(monthNumber, year, true)}>
            <Icon name="right arrow"></Icon>
          </Button>
        </Grid.Column>
        <Grid.Column>
        </Grid.Column>
      </Grid.Row>
    );
  }

  render() {
    const { incomeTransactions, bills, isLoading, currentDate, nextMonth } = this.props;

    return (
      <Grid columns={2} padded={true}>
        {this.createMonthNavigation(currentDate, nextMonth)}
        <Grid.Row>
          <Grid.Column>
            <Segment>
              <Header textAlign='center' as='h1'>Income</Header>
              { incomeTransactions.isLoading ? (
                <div style={loadingStyle}><Loader active={true}>Fetching income...</Loader></div>
              ) :
                this.createIncomeTable(incomeTransactions.data)
              }
            </Segment>
          </Grid.Column>
          <Grid.Column>
            <Segment>
              <Header textAlign='center' as='h1'>Bills</Header>
              { bills.isLoading ? (
                <div style={loadingStyle}><Loader active={true}>Fetching bills...</Loader></div>
              ) : this.createBillsTable(bills.data, currentDate.monthNumber)}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

DetailsPage.propTypes = {
  incomeTransactions: PropTypes.shape({
    errors: PropTypes.arrayOf(Error),
    isLoading: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.shape({
      from: PropTypes.string.isRequired,
      to: PropTypes.string.isRequired,
      date: PropTypes.instanceOf(Date).isRequired,
      value: PropTypes.number.isRequired
    })).isRequired
  }),
  loadIncomeTransactions: PropTypes.func.isRequired
};
