import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Table from './table.jsx';

describe('<Table />', function () {
  it('renders', function () {
    const headers = [{title: 'dummy', mapTo: 'a'}];
    const data = [{a: 'dummy'}];
    const table = mount(<Table headers={headers} data={data}/>);
    table.find('tr').length.should.be.eq(2);
    
  });
});