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

  createEventsHandler(value, columnKey, object, mapTo, index, editRow) {
    const toggleEdit = (evt) => {
      const editingRows = this.state.editingRows;
      const values = this.state.values;

      editingRows[columnKey] = !editingRows[columnKey];
      values[columnKey] = value;

      setTimeout(() => this.input.focus(), 1);

      this.setState({ editingRows })
    };

    const onChange = (evt) => {
      const values = this.state.values;

      values[columnKey] = evt.target.value;
      this.setState({ values });
    };

    const saveChange = () => {
      editRow(object[mapTo].attr, this.state.values[columnKey], index);
      const editingRows = this.state.editingRows;

      editingRows[columnKey] = !editingRows[columnKey];

      this.setState({ editingRows })
    };

    const onKeyPress = (evt) => {
      const key = evt.key;
  
      if (key === 'Enter') {
        saveChange();
      } else if (key === 'Escape') {
        toggleEdit();
      }
    };
  
    return {
      toggleEdit,
      onChange,
      saveChange,
      onKeyPress
    };
  }

  createTableRow(object, index, headers, editRow) {
    return (
      <Table.Row key={index}>
        {headers.map(({ mapTo, transform }, columnIndex) => {
          const columnKey = `row${index}${columnIndex}`;
          let value = formatValue(object[mapTo], transform);
          const { toggleEdit, onChange, saveChange, onKeyPress } = this.createEventsHandler(value, columnKey, object, mapTo, index, editRow);

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
                  <input ref={(input) => this.input = input} type='text' value={this.state.values[columnKey]} onChange={onChange} onKeyUp={onKeyPress}/>
                  <Icon color='green' name='save' size='large' onClick={saveChange}/>
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
    const { headers = [], data = [], editRow } = this.props;
    const showHeader = headers.some(function (header) {
      return header.title;
    });
    const tableBody = data.length > 0 ? (
      data.map((object, index) => this.createTableRow(object, index, headers, editRow))
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
