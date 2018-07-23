import React, { Component } from 'react';
import { Table, Icon } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { formatValue} from './formatHelpers.jsx';

export default class AppTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editingRows: {},
      values: {}
    };
  }

  createTableRow(object, index, headers) {
    return (
      <Table.Row key={index}>
        {headers.map(({ mapTo, transform }, columnIndex) => {
          const columnKey = `row${index}${columnIndex}`;
          let value = formatValue(object[mapTo], transform);

          const toggleEdit = () => {
            const editingRows = this.state.editingRows;
            const values = this.state.values;

            editingRows[columnKey] = !editingRows[columnKey];
            values[columnKey] = value;

            this.setState({ editingRows })
          };

          const onChange = (evt) => {
            const values = this.state.values;

            values[columnKey] = evt.target.value;
            this.setState({ values });
          };

          if (this.state.editingRows[columnKey] === undefined) {
            this.state.editingRows[columnKey] = false;
          }

          if (this.state.values[columnKey] === undefined) {
            this.state.values[columnKey] = value;
          }

          return (
            <Table.Cell key={columnIndex}>
              {this.state.editingRows[columnKey] ? 
                <div>
                  <input type='text' value={this.state.values[columnKey]} onChange={onChange}/>
                  <Icon color='green' name='save' size='large' />
                  <Icon color='red' name='trash' size='large' onClick={toggleEdit}/>
                </div> : 
                <div onDoubleClick={toggleEdit}>{value}</div>
              }
            </Table.Cell> 
          );
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
