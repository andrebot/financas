import React from 'react';
import { Segment, Container, Menu } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const createMenuItem = (handleItemClick, pathName) => {
  return function (menuName, index) {
    const isHomePage = pathName === '/' && menuName === 'home';

    return (
      <Menu.Item key={index} name={menuName} active={pathName.includes(menuName) || isHomePage} onClick={() => handleItemClick(menuName)} />
    );
  };
}

const MainMenu = ({ handleItemClick, location }) => {
  const menuItems = ['home', 'projections', 'details'];

  return (
    <div>
      <Segment>
        <Container text>
          <Menu pointing secondary>
            {menuItems.map(createMenuItem(handleItemClick, location.pathname))}
          </Menu>
        </Container>
      </Segment>
    </div>
  )
}

MainMenu.propTypes = {
  handleItemClick: PropTypes.func.isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string.isRequired
  })
}

export default MainMenu;
