import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Table from './table.jsx';

describe('<Table />', function () {
  it('should render two rolls, one for header and one for data', function () {
    const headers = [{title: 'dummy', mapTo: 'a'}];
    const data = [{ a: { value: 'dummy data', type: 'String' } }];
    const table = mount(<Table headers={headers} data={data}/>);

    table.find('tr').length.should.be.eq(2);
    table.find('th').length.should.be.eq(1);
    table.find('td').length.should.be.eq(1);
    table.find('th').text().should.be.eq(headers[0].title);
    table.find('td').text().should.be.eq(data[0].a.value);
  });
});