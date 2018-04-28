import React, { Component } from 'react';
import { Segment, Grid, Loader, Header } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { fetchIncomeTransactions } from './actions.jsx';
import Table from '../table/table.jsx';

const loadingStyle = { position: 'relative', height: '80px' };
export default class DetailsPage extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.loadIncomeTransactions();
  }

  render() {
    const { incomeTransactions, isLoading, loadIncomeTransactions } = this.props;
    const headers = [
      { title: 'Item', mapTo: 'name' },
      { title: 'Date', mapTo: 'date' },
      { title: 'Bank', mapTo: 'to' },
      { title: 'Value', mapTo: 'value' }
    ];
    const tableData = incomeTransactions.map(income => {
      const { name, to, date, value, ...remains } = income;

      return {
        name: { value: name, type: 'String' },
        to: { value: to, type: 'String' },
        date: { value: date, type: 'Date' },
        value: { value, type: 'Currency' }
      };
    });

    return (
      <Grid columns={2} padded={true}>
        <Grid.Row>
          <Grid.Column>
            <Segment>
              <Header textAlign='center' as='h1'>Income</Header>
              {isLoading ? (
                <div style={loadingStyle}><Loader active={true}>Fetching income...</Loader></div>
              ) : (
                <Table headers={headers} data={tableData}/>
              )}
            </Segment>
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}

DetailsPage.propTypes = {
  incomeTransactions: PropTypes.arrayOf(PropTypes.shape({
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    value: PropTypes.number.isRequired
  })).isRequired,
  loadIncomeTransactions: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};
