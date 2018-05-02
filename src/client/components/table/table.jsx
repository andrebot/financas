import React from 'react';
import { Table, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { formatDate, formatCurrency } from './formatHelpers.jsx';

const formatValue = ({ value, type }, transform = function (toParse) { return toParse }) => {
  if (value == null) {
    return '';
  }

  switch(type) {
    case 'Date':
      return formatDate(transform(value));
    case 'Currency':
      return formatCurrency(transform(value));
    case 'Boolean':
      if (value) {
        return <Icon color='green' name='checkmark' size='large' />
      } else {
        return <Icon color='red' name='x' size='large' />
      }
    default:
      return transform(value);
  }
};

const createTableRow = function (object, index, headers) {
  return (
    <Table.Row key={index}>
      {headers.map(({ mapTo, transform }, columnIndex) => <Table.Cell key={columnIndex}>{formatValue(object[mapTo], transform)}</Table.Cell>)}
    </Table.Row>
  );
};

const AppTable = ({ headers = [], data = [] }) => {
  const showHeader = headers.some(function (header) {
    return header.title;
  });
  const tableBody = data.length > 0 ? (
    data.map((object, index) => createTableRow(object, index, headers))
  ) : (
    <Table.Row>
      <Table.Cell>No data to render</Table.Cell>
    </Table.Row>
  );

  return (
    <Table basic='very'>
     {showHeader && 
        <Table.Header>
          <Table.Row>
            {headers.map((header, index) => <Table.HeaderCell key={index}>{header.title}</Table.HeaderCell>)}
          </Table.Row>
        </Table.Header>
     }

      <Table.Body>
        {tableBody}
      </Table.Body>
    </Table>
  )
};

AppTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    mapTo: PropTypes.string.isRequired,
    transform: PropTypes.func
  })).isRequired,
  data: PropTypes.array
};

export default AppTable;
