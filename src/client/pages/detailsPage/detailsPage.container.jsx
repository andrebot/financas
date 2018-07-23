import React from 'react';
import { connect } from 'react-redux';
import { fetchIncomeTransactions, fetchBills, nextMonth } from './actions.jsx';
import DetailsPage from './detailsPage.jsx';

const mapStateToProps = state => {
  return state.detailsPage;
};

const mapDispatchToProps = (dispatch) => (
  {
    loadIncomeTransactions: (currentDate) => {
      dispatch(fetchIncomeTransactions(currentDate));
    },
    loadBills: (currentDate) => {
      dispatch(fetchBills(currentDate));
    },
    nextMonth: (monthNumber, year, isNext) => {
      const today = new Date();

      if (year >= today.getFullYear() && today.getMonth() === monthNumber && isNext) {
        return;
      }

      let newMonth;
      let newYear = year;

      if (isNext) {
        newMonth = monthNumber + 1;

        if (newMonth > 11) {
          newMonth = 0;
          newYear = year + 1;
        }
      } else {
        newMonth = monthNumber - 1;

        if (newMonth < 0) {
          newMonth = 11;
          newYear = year - 1;
        }
      }

      dispatch(nextMonth(newMonth, newYear, isNext));
      dispatch(fetchIncomeTransactions({ monthNumber: newMonth, year: newYear }));
      dispatch(fetchBills({ monthNumber: newMonth, year: newYear }));
    }
  }
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DetailsPage);
