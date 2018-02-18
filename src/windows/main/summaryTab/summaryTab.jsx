import React from 'react';
import Paper from 'material-ui/Paper';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import style from './style.jsx';

const createRow = ({title, value}, i) => {
  return (
    <TableRow key={i}>
      <TableRowColumn>{title}</TableRowColumn>
      <TableRowColumn>R$ {value}</TableRowColumn>
    </TableRow>
  );
}

const SummaryTab = () => {
  const data = [{
    title: 'Ganho do Mês',
    value: 123.43
  },{
    title: 'Gasto no Mês',
    value: 23.43
  },{
    title: 'Total Investido',
    value: 90
  },{
    title: 'Saldo Total',
    value: 10
  }];

  return (
    <Paper style={style.tablePaper} zDepth={2}>
      <Table selectable={false}>
        <TableBody displayRowCheckbox={false} stripedRows={true}>
          {data.map(createRow)}
        </TableBody>
      </Table>
    </Paper>
  );
};

export default SummaryTab;