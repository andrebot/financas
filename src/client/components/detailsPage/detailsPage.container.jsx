import React from 'react';
import { connect } from 'react-redux';
import DetailsPage from './detailsPage.jsx';

const mapStateToProps = state => {
  return {
    incomeTransactions: state.detailsPage.incomeTransactions
  };
};

// const mapDispatchToProps = (dispatch, routerProps) => (
//   {
//     handleItemClick: page => {
//       routerProps.history.push(`/${page}`);

//       dispatch(changePage(page));
//     }
//   }
// );

export default connect(
  mapStateToProps
)(DetailsPage);
