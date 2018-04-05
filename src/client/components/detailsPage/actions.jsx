import axios from 'axios';

export const LOADING_INCOME_TRANSACTIONS = 'LOADING_INCOME_TRANSACTIONS';
function loadingIncome() {
  return {
    type: LOADING_INCOME_TRANSACTIONS,
    status: {
      isLoading: true,
      hadError: false
    }
  };
}

export function fetchIncomeTransactions () {
  return function (dispatch) {
    dispatch(loadingIncome());

    return axios.get('/api/v1/transaction').then(function (response) {
      console.log(response.data.data);
    }).catch(function (error) {
      // handling error
    });
  }
}
