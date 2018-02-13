import React, { Component } from 'react';
import Drawer from 'material-ui/Drawer';
import Subheader from 'material-ui/Subheader';
import { ListItem } from 'material-ui/List';
import SelectableList from '../selectableList/selectableList.jsx';

export default class MainMenu extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Drawer open={true} width={170}>
        <SelectableList defaultValue={1}>
          <Subheader>Menu</Subheader>
          <ListItem value={1} primaryText="Acccount Summary" />
        </SelectableList>
      </Drawer>
    )
  }
}
