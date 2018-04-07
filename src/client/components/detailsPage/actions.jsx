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
      const incomeTransactions = response.data.data.map(income => {
        if (income.date) {
          income.date = new Date(income.date);
        }

        return income;
      });


      dispatch(handleIncomeTransactionsResponse(incomeTransactions));
    }).catch(function (error) {
      // handling error
    });
  }
}
