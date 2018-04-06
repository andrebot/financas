import axios from 'axios';

export const LOADING_INCOME_TRANSACTIONS = 'LOADING_INCOME_TRANSACTIONS';
function loadingIncome() {
  return {
    type: LOADING_INCOME_TRANSACTIONS,
    incomeTransactions: {
      isLoading: true,
      errors: []
    }
  };
}

export const LOADED_INCOME_TRANSACTIONS = 'LOADED_INCOME_TRANSACTIONS';
function handleIncomeTransactionsResponse(data) {
  return {
    type: LOADED_INCOME_TRANSACTIONS,
    incomeTransactions: {
      isLoading: false,
      errors: [],
      data
    }
  };
}

export function fetchIncomeTransactions () {
  return function (dispatch) {
    dispatch(loadingIncome());

    return axios.get('/api/v1/transaction').then(function (response) {
      dispatch(handleIncomeTransactionsResponse(response.data.data));
    }).catch(function (error) {
      // handling error
    });
  }
}
