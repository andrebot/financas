import React from 'react';
import { Loader, Header, Icon, Button } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import Table from '../table/table.jsx';

// export default class BillsTable extends Component {}
const buttonStyle = {position: 'relative', float: 'right', top: '-50px'};
const loadingStyle = { position: 'relative', height: '80px' }; 

function createBillsTable(bills, currentMonth) {
  const transform = function (value) {
    const date = new Date();
    date.setMonth(currentMonth);
    date.setDate(value);

    return date;
  };
  const paidAtTransform = function (value) {
    let date = new Date();
    let firstDate = new Date();

    date.setHours(23, 59, 59, 999);
    firstDate.setMonth(currentMonth);
    firstDate.setDate(1);
    date = date.getTime();
    firstDate = firstDate.getTime();

    return value.find(function (element) {
      const elementMilli = element.getTime();
      return elementMilli >= firstDate && elementMilli <= date;
    });
  };

  const isPaidTransform = function (value) {
    const date = paidAtTransform(value);

    return (date) ? true : false;
  };

  const headers = [
    { title: 'Paid', mapTo: 'paid', transform: isPaidTransform },
    { title: 'Name', mapTo: 'name' },
    { title: 'Due Date', mapTo: 'dueDate', transform },
    { title: 'Paid at', mapTo: 'paidAt', transform: paidAtTransform },
    { title: 'Value', mapTo: 'value' }
  ];
  const tableData = bills.map(bill => {
    const { name, dueDay, paidAt, value, ...remains } = bill;

    return {
      paid:    { value: paidAt, type: 'Boolean' },
      name:    { value: name, type: 'String' },
      dueDate: { value: dueDay, type: 'Date' },
      paidAt:  { value: paidAt, type: 'Date' },
      value:   { value, type: 'Currency' }
    };
  });

  return <Table headers={headers} data={tableData}/>
}

const BillsTable = ({ bills, currentDate }) => {
  return (
    <div>
      <div>
        <Header textAlign='center' as='h1'>Bills</Header>
        <Button icon style={buttonStyle}>
          <Icon name='plus'></Icon>
          New Bill
        </Button>
      </div>
      { bills.isLoading ? (
        <div style={loadingStyle}><Loader active={true}>Fetching bills...</Loader></div>
      ) : createBillsTable(bills.data, currentDate.monthNumber)}
    </div>
  );
}

BillsTable.propTypes = {
  bills: PropTypes.shape({
    errors: PropTypes.arrayOf(Error),
    isLoading: PropTypes.bool,
    data: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string.isRequired,
      paidAt: PropTypes.arrayOf(PropTypes.instanceOf(Date)).isRequired,
      dueDay: PropTypes.number.isRequired,
      value: PropTypes.number.isRequired
    })).isRequired
  }),
  currentDate: PropTypes.shape({
    monthName: PropTypes.string.isRequired,
    monthNumber: PropTypes.number.isRequired,
    year: PropTypes.number.isRequired
  })
}

export default BillsTable;