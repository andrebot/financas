import React from 'react';
import { Loader, Header, Icon, Button } from 'semantic-ui-react';
import Table from '../table/table.jsx';
import propType from './propTypes.jsx';
import { dateTransformFactory, paidAtTransformFactory, isPaidTransformFactory } from './transforms.jsx';

// export default class BillsTable extends Component {}
const buttonStyle = {position: 'relative', float: 'right', top: '-50px'};
const loadingStyle = { position: 'relative', height: '80px' }; 

function createBillsTable(bills, currentMonth, editBill) {
  const dateTransform = dateTransformFactory(currentMonth);
  const paidAtTransform = paidAtTransformFactory(currentMonth);
  const isPaidTransform = isPaidTransformFactory(paidAtTransform);

  const headers = [
    { title: 'Paid', mapTo: 'paid', transform: isPaidTransform },
    { title: 'Name', mapTo: 'name' },
    { title: 'Due Date', mapTo: 'dueDate', transform: dateTransform },
    { title: 'Paid at', mapTo: 'paidAt', transform: paidAtTransform },
    { title: 'Value', mapTo: 'value' }
  ];
  const tableData = bills.map(bill => {
    const { name, dueDay, paidAt, value, ...remains } = bill;

    return {
      paid:    { value: paidAt, attr: 'paidAt', type: 'Boolean' },
      name:    { value: name, attr: 'name', type: 'String' },
      dueDate: { value: dueDay, attr: 'dueDay', type: 'Date' },
      paidAt:  { value: paidAt, attr: 'paidAt', type: 'Date' },
      value:   { value, attr: 'value', type: 'Currency' }
    };
  });

  return <Table headers={headers} data={tableData} editRow={editBill}/>
}

const BillsTable = ({ bills, currentDate, editBill }) => {
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
      ) : createBillsTable(bills.data, currentDate.monthNumber, editBill)}
    </div>
  );
}

BillsTable.propTypes = propType;

export default BillsTable;