import React from 'react';
import Paper from 'material-ui/Paper';
import {
  Table,
  TableBody,
  TableRow,
  TableRowColumn
} from 'material-ui/Table';
import { PieChart, Pie, Cell} from 'recharts';
import style from './style.jsx';

const label = (dados) => {
  const {cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value} = dados;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy  + radius * Math.sin(-midAngle * RADIAN);

  console.log(dados)

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {name}: R${value} ({`${(percent * 100).toFixed(0)}%`})
    </text>
  );
}

const SummaryTab = () => {
  const data = [{
    name: 'Gasto no Mês',
    value: 23.43
  },{
    name: 'Total Investido',
    value: 90
  },{
    name: 'Em Conta',
    value: 10
  }];
  const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Paper style={style.tablePaper} zDepth={2}>
      <PieChart width={800} height={400}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" fill="#8884d8" innerRadius={100} label={label} labelLine={false}>
          { data.map((entry,  index) => <Cell fill={colors[index % colors.length]} key={index}/>)}
        </Pie>
      </PieChart>
    </Paper>
  )
};

export default SummaryTab;