import React, { Component } from 'react';
import { List, makeSelectable } from 'material-ui/List';

let SelectableList = makeSelectable(List);

function wrapState(ComposedComponent) {
  return class SelectList extends Component {
    constructor(props) {
      super(props);
    }

    componentWillMount() {
      this.setState({
        selectedIndex: this.props.defaultValue
      });
    }

    handleRequestChange(event, index) {
      this.setState({
        selectedIndex: index
      });
    }

    render() {
      return <ComposedComponent
        value={this.state.selectedIndex}
        onChange={this.handleRequestChange.bind(this)}
      >
        { this.props.children }
      </ComposedComponent>
    }
  };
}

export default wrapState(SelectableList);
