import React from 'react';
import { Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { formatDate, formatCurrency } from './formatHelpers.jsx';

const formatValue = ({ value, type }) => {
  switch(type) {
    case 'Date':
      return formatDate(value);
    case 'Currency':
      return formatCurrency(value);
    default:
      return value;
  }
};

const createTableRow = function (columns, index) {
  return (
    <Table.Row key={index}>
      {columns.map(column, columnIndex => <Table.Cell key={columnIndex}>{formatValue(column)}</Table.Cell>)}
    </Table.Row>
  );
}

const AppTable = ({ headers, rows }) => {
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

AppTable.propTypes = {
  headers: PropTypes.arrayOf(String).isRequired,
  rows: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    type: PropTypes.oneOf(['Date', 'Currency'])
  }))
}

export default AppTable;
