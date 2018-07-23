import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { formatValue} from './formatHelpers.jsx';

export default class AppTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editingRows: {}
    };
  }

  createTableRow(object, index, headers) {
    return (
      <Table.Row key={index}>
        {headers.map(({ mapTo, transform }, columnIndex) => {
          const columnKey = `row${index}${columnIndex}`;
          const aha = (event, b) => {
            const editingRows = this.state.editingRows;

            editingRows[columnKey] = !editingRows[columnKey];
            this.setState({ editingRows })
          };

          if (this.state.editingRows[columnKey] === undefined) {
            this.state.editingRows[columnKey] = false;
          }

          return <Table.Cell onDoubleClick={aha} key={columnIndex}>{this.state.editingRows[columnKey] ? <input type='text' /> : formatValue(object[mapTo], transform)}</Table.Cell> 
        })}
      </Table.Row>
    );
  }

  render() {
    const { headers = [], data = [] } = this.props;
    const showHeader = headers.some(function (header) {
      return header.title;
    });
    const tableBody = data.length > 0 ? (
      data.map((object, index) => this.createTableRow(object, index, headers))
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
    );
  }
}

AppTable.propTypes = {
  headers: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
    mapTo: PropTypes.string.isRequired,
    transform: PropTypes.func
  })).isRequired,
  data: PropTypes.array
};
