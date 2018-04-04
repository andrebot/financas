import React from 'React';
import { Segment, Grid, Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const createTableRow = function ({ from, to, date, value }, index) {
  const dateObj = new Date(date);
  let day = dateObj.getDate();
  let month = dateObj.getMonth() + 1;

  if (day < 10) {
    day = `0${day}`;
  }

  if (month < 10) {
    month = `0${month}`;
  }

  return (
    <Table.Row key={index}>
      <Table.Cell>{from}</Table.Cell>
      <Table.Cell>{to}</Table.Cell>
      <Table.Cell>{day}/{month}/{dateObj.getFullYear()}</Table.Cell>
      <Table.Cell>R$ {value.toFixed(2)}</Table.Cell>
    </Table.Row>
  );
}

const IncomeTable = (data) => {
  return (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Item</Table.HeaderCell>
          <Table.HeaderCell>Date</Table.HeaderCell>
          <Table.HeaderCell>Bank</Table.HeaderCell>
          <Table.HeaderCell>Value</Table.HeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.data.map(createTableRow)}
      </Table.Body>
    </Table>
  )
}

const DetailsPage = ({ incomeTransactions }) => {
  return (
    <Grid columns={2} padded={true}>
      <Grid.Row>
        <Grid.Column>
          <Segment>
            <IncomeTable data={incomeTransactions}/>
          </Segment>
        </Grid.Column>
        <Grid.Column>
          <Segment>
            <IncomeTable data={incomeTransactions}/>
          </Segment>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

// DetailsPage.propTypes = {};

export default DetailsPage;