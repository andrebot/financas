import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import Menu from './menu.jsx';

describe('<Menu />', function () {
  beforeEach(function () {
    this.handleItemClick = sinon.spy();
    this.location = {
      pathname: 'test'
    };
  });

  it('should render three menu links as `home`, `projections` and `details`', function () {
    const menu = mount(<Menu handleItemClick={this.handleItemClick } location={this.location}/>);

    const menuLinksWrapper = menu.find('a');
    menuLinksWrapper.length.should.be.eq(3);
    const linkTexts = menuLinksWrapper.map(link => link.text());
    linkTexts.should.include.members(['Home', 'Projections', 'Details']);
  });

  it('should trigger the click handler provided to it when we click in a menu item', function () {
    const menu = mount(<Menu handleItemClick={this.handleItemClick } location={this.location}/>);

    menu.find('a').first().simulate('click');
    this.handleItemClick.should.have.been.calledOnce;
  });

  it('should set the active menu\'s item class as `active`', function() {
    this.location.pathname = 'projections';
    const menu = mount(<Menu handleItemClick={this.handleItemClick } location={this.location}/>);

    menu.find('a.active').length.should.be.eq(1);
  });
});
