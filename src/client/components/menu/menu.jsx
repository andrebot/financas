import React, { Component } from 'react';
import { Segment, Container, Menu } from 'semantic-ui-react';

export default class MainMenu extends Component {
  state = { activeItem: 'home' }

  handleItemClick = (e, { name }) => this.setState({ activeItem: name })

  createMenuItem = (menuName, index) => {
    const { activeItem } = this.state;

    return (
      <Menu.Item key={index} name={menuName} active={activeItem === menuName} onClick={this.handleItemClick} />
    );
  }

  render() {
    const menuItems = ['home', 'projections', 'details'];

    return (
      <div>
        <Segment>
          <Container text>
            <Menu pointing secondary>
              {menuItems.map(this.createMenuItem)}
            </Menu>
          </Container>
        </Segment>
      </div>
    )
  }
}
