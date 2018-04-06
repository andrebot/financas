import React from 'react';
import { Table } from 'semantic-ui-react';
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
      <Table.Cell>{day}/{month}/{dateObj.getFullYear()}</Table.Cell>
      <Table.Cell>{to}</Table.Cell>
      <Table.Cell>R$ {value.toFixed(2)}</Table.Cell>
    </Table.Row>
  );
}

export default ({ headers, rows }) => {
  return (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          {headers.map((header, index) => <Table.HeaderCell key={index}>{header}</Table.HeaderCell>)}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {rows.map(createTableRow)}
      </Table.Body>
    </Table>
  )
}

Table.propTypes = {
  headers: PropTypes.arrayOf(String).isRequired,
  rows: PropTypes.array
}
