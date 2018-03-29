import React, { Component } from 'react';
import { Segment, Container, Menu } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const createMenuItem = (handleItemClick, activePage) => {
  return function (menuName, index) {
    return (
      <Menu.Item key={index} name={menuName} active={activePage === menuName} onClick={() => handleItemClick(menuName)} />
    );
  };
}

const MainMenu = ({ handleItemClick, activePage }) => {
  const menuItems = ['home', 'projections', 'details'];

  return (
    <div>
      <Segment>
        <Container text>
          <Menu pointing secondary>
            {menuItems.map(createMenuItem(handleItemClick, activePage))}
          </Menu>
        </Container>
      </Segment>
    </div>
  )
}

MainMenu.prototype = {
  handleItemClick: PropTypes.func.isRequired,
  activePage: PropTypes.string.isRequired
}

export default MainMenu;
