import React from 'react';
import { connect } from 'react-redux';
import { fetchIncomeTransactions, fetchBills, nextMonth } from './actions.jsx';
import DetailsPage from './detailsPage.jsx';

const mapStateToProps = state => {
  return state.detailsPage;
};

const mapDispatchToProps = (dispatch) => (
  {
    loadIncomeTransactions: () => {
      dispatch(fetchIncomeTransactions());
    },
    loadBills: () => {
      dispatch(fetchBills());
    },
    nextMonth: (monthNumber, year, isNext) => {
      dispatch(nextMonth(monthNumber, year, isNext));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailsPage);
