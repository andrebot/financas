import axios from 'axios';
import MONTH_MAP from './monthMapper.jsx';

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

export const LOADING_BILLS = 'LOADING_BILLS';
export function loadingBills() {
  return {
    type: LOADING_BILLS,
    bills: {
      isLoading: true,
      errors: [],
      data: []
    }
  };
}

export const LOADED_BILLS = 'LOADED_BILLS';
export function handleBillResponse(data) {
  return {
    type: LOADED_BILLS,
    bills: {
      isLoading: false,
      errors: [],
      data
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
export function handleIncomeErrorWhileLoading(errors) {
  return {
    type: ERROR_LOADING_TRANSACTIONS,
    incomeTransactions: {
      isLoading: false,
      errors,
      data: []
    }
  }
}

export const ERROR_LOADING_BILL = 'ERROR_LOADING_BILL';
export function handleBillErrorWhileLoading(errors) {
  return {
    type: ERROR_LOADING_BILL,
    bills: {
      isLoading: false,
      errors,
      data: []
    }
  }
}

export const NEXT_MONTH = 'NEXT_MONTH';
export function nextMonth(newMonth, newYear, isNext) {
  return {
    type: NEXT_MONTH,
    currentDate: {
      monthNumber: newMonth,
      monthName: MONTH_MAP[newMonth],
      year: newYear
    }
  }
}

export const EDIT_BILL = 'EDIT_BILL';
export function editBill(bill, index) {
  return {
    type: EDIT_BILL,
    bill,
    index
  }
}

export function fetchIncomeTransactions (currentDate) {
  return function (dispatch) {
    const { monthNumber, year } = currentDate;

    dispatch(loadingIncome());

    return axios.get(`/api/v1/transaction?month=${monthNumber}&year=${year}`).then(function (response) {
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

      dispatch(handleIncomeErrorWhileLoading([ error ]));
    });
  }
}

export function fetchBills (currentDate) {
  return function (dispatch) {
    const { monthNumber, year } = currentDate;

    dispatch(loadingBills());

    return axios.get(`/api/v1/bill?month=${monthNumber}&year=${year}`).then(function (response) {
      const bills = response.data.data.map(bill => {
        if (bill.paidAt && bill.paidAt.length > 0) {
          bill.paidAt = bill.paidAt.map(date => new Date(date));
        }

        if (bill.repeat && bill.repeat.until) {
          bill.repeat.until = new Date(bill.repeat.until);
        }

        return bill;
      });

      dispatch(handleBillResponse(bills));
    }).catch(function (error) {
      console.error('There was an error fetching bills');
      console.error(error);

      dispatch(handleBillErrorWhileLoading([ error ]));
    })
  }
}
