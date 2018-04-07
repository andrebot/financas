import React, { Component } from 'react';
import { Segment, Grid, Loader } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { fetchIncomeTransactions } from './actions.jsx';
import Table from '../table/table.jsx';

export default class DetailsPage extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    this.props.loadIncomeTransactions();
  }

  render() {
    const { incomeTransactions, isLoading, loadIncomeTransactions } = this.props;
    const headers = ['Item', 'Date', 'Bank', 'Value'];

    return (
      <Grid columns={2} padded={true}>
        <Grid.Row>
          <Grid.Column>
            <Segment>
              {isLoading ? (
                <Loader />
              ) : (
                <Table headers={headers} rows={incomeTransactions}/>
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
    date: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })).isRequired,
  loadIncomeTransactions: PropTypes.func.isRequired
};
