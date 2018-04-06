import React from 'react';
import { connect } from 'react-redux';
import { fetchIncomeTransactions } from './actions.jsx';
import DetailsPage from './detailsPage.jsx';

const mapStateToProps = state => {
  const {data, errors, isLoading} = state.detailsPage.incomeTransactions;

  return {
    incomeTransactions: data,
    errors,
    isLoading
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
)(DetailsPage);
