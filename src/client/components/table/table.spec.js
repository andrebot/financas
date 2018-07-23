import React from 'react';
import { mount } from 'enzyme';
import Table from './table.jsx';

describe('<Table />', function () {
  it('should render header and body accordingly', function () {
    const headers = [{title: 'dummy', mapTo: 'a'}];
    const data = [{ a: { value: 'dummy data', type: 'String' } }];
    const table = mount(<Table headers={headers} data={data}/>);

    table.find('tr').length.should.be.eq(2);
    table.find('th').length.should.be.eq(1);
    table.find('td').length.should.be.eq(1);
    table.find('th').text().should.be.eq(headers[0].title);
    table.find('td').text().should.be.eq(data[0].a.value);
  });

  it('should render data without headers', function () {
    const headers = [{ mapTo: 'a'}];
    const data = [{ a: { value: 'dummy data', type: 'String' } }];
    const table = mount(<Table headers={headers} data={data}/>);

    table.find('th').length.should.be.eq(0);
    table.find('tr').length.should.be.eq(1);
    table.find('td').length.should.be.eq(1);
    table.find('td').text().should.be.eq(data[0].a.value);
  });

  it('should render a no data row if no data is provided', function () {
    const table = mount(<Table />);

    table.find('th').length.should.be.eq(0);
    table.find('tr').length.should.be.eq(1);
    table.find('td').length.should.be.eq(1);
    table.find('td').text().should.be.eq('No data to render');
  });
});