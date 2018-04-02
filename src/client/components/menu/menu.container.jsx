import React from 'react';
import { connect } from 'react-redux';
import Menu from './menu.jsx';
import { changePage } from './actions.jsx';

const mapStateToProps = state => (
  {
    activePage: state.menu.activePage
  }
);

const mapDispatchToProps = (dispatch, routerProps) => (
  {
    handleItemClick: page => {
      routerProps.history.push(`/${page}`);

      dispatch(changePage(page));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Menu);
