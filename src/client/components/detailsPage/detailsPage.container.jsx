import React from 'react';
import { connect } from 'react-redux';
import { fetchIncomeTransactions } from './actions.jsx';
import DetailsPageContainer from './detailsPage.jsx';

const mapStateToProps = state => {
  return {
    incomeTransactions: state.detailsPage.incomeTransactions
  };
};

const mapDispatchToProps = (dispatch) => (
  {
    loadIncomeTransactions: () => {
      dispatch(fetchIncomeTransactions());
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailsPageContainer);
