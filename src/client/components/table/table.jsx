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

const createTableRow = function (object, index, headers) {
  return (
    <Table.Row key={index}>
      {headers.map(({ mapTo }, columnIndex) => <Table.Cell key={columnIndex}>{formatValue(object[mapTo])}</Table.Cell>)}
    </Table.Row>
  );
}

const AppTable = ({ headers, data }) => {
  return (
    <Table basic='very'>
      <Table.Header>
        <Table.Row>
          {headers.map((header, index) => <Table.HeaderCell key={index}>{header.title}</Table.HeaderCell>)}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {data.map((object, index) => createTableRow(object, index, headers))}
      </Table.Body>
    </Table>
  )
}

AppTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    mapTo: PropTypes.string.isRequired
  })).isRequired,
  data: PropTypes.array
};

export default AppTable;
