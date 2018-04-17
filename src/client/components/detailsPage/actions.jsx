import axios from 'axios';

export const LOADING_INCOME_TRANSACTIONS = 'LOADING_INCOME_TRANSACTIONS';
export function loadingIncome() {
  return {
    type: LOADING_INCOME_TRANSACTIONS,
    incomeTransactions: {
      isLoading: true,
      errors: [],
      data: []
    }
  };
}

export const LOADED_INCOME_TRANSACTIONS = 'LOADED_INCOME_TRANSACTIONS';
export function handleIncomeTransactionsResponse(data) {
  return {
    type: LOADED_INCOME_TRANSACTIONS,
    incomeTransactions: {
      isLoading: false,
      errors: [],
      data
    }
  };
}

export const ERROR_LOADING_TRANSACTIONS = 'ERROR_LOADING_TRANSACTIONS';
export function handleErrorWhileLoading(errors) {
  return {
    type: ERROR_LOADING_TRANSACTIONS,
    incomeTransactions: {
      isLoading: false,
      errors,
      data: []
    }
  }
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
      console.error('There was an error fetching income transactions');
      console.error(error);

      dispatch(handleErrorWhileLoading([ error ]));
    });
  }
}
