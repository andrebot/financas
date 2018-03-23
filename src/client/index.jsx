import React, { Component } from 'react';
import { render } from 'react-dom';
import { Grid, Segment, Sidebar, Menu, Icon, Button } from 'semantic-ui-react';

class App extends Component {
  state = { visible: false }

  toggleVisibility = () => this.setState({ visible: !this.state.visible })

  render() {
    const { visible } = this.state;

    return (
      <div>
        <Sidebar.Pushable as={Segment}>
          <Segment>
            <Button icon='align justify' onClick={this.toggleVisibility} />
          </Segment>
          <Sidebar as={Menu} animation='overlay' width='thin' visible={visible} icon='labeled' vertical inverted>
            <Menu.Item name="Summary">
              <Icon name="home"/>
            </Menu.Item>
          </Sidebar>
        </Sidebar.Pushable>
      </div>
    )
  }
}

render(
  <App/>
  , document.getElementById('container')
);
