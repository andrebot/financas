import { LOADING_INCOME_TRANSACTIONS,
         LOADING_BILLS,
         LOADED_INCOME_TRANSACTIONS,
         LOADED_BILLS,
         NEXT_MONTH,
         ERROR_LOADING_TRANSACTIONS,
         EDIT_BILL } from './actions.jsx';
import MONTH_MAP from './monthMapper.jsx';

const today = new Date();
const initialState = {
  incomeTransactions: {
    isLoading: true,
    errors: [],
    data: []
  },
  bills: {
    isLoading: true,
    errors: [],
    data: []
  },
  currentDate: {
    monthNumber: today.getMonth(),
    monthName: MONTH_MAP[today.getMonth()],
    year: today.getFullYear()
  }
};

function loadingIncomeTransactionsHandler(toMergeincomeTransactions, state) {
  const incomeTransactions = Object.assign({}, state.incomeTransactions, toMergeincomeTransactions);

  return Object.assign({}, state, { incomeTransactions });
}

function loadingBillsHandler(toMergeBills, state) {
  const bills = Object.assign({}, state.bills, toMergeBills);

  return Object.assign({}, state, { bills });
}

function nextMonthHandler(date, state) {
  const currentDate = Object.assign({}, state.currentDate, date);

  return Object.assign({}, state, { currentDate });
}

function editBillHandler({ bill, index }, state) {
  const bills = Object.assign({}, state.bills);

  bills[index] = bill;
  return Object.assign({}, { bills });
}

export default function detailsPage(state = initialState, action) {
  switch (action.type) {
    case LOADING_INCOME_TRANSACTIONS:
    case LOADED_INCOME_TRANSACTIONS:
    case ERROR_LOADING_TRANSACTIONS:
      return loadingIncomeTransactionsHandler( action.incomeTransactions, state)
    case LOADING_BILLS:
    case LOADED_BILLS:
      return loadingBillsHandler(action.bills, state);
    case NEXT_MONTH:
      return nextMonthHandler(action.currentDate, state);
    case EDIT_BILL:
      return editBillHandler(action, state);
    default:
      return state;
  }
}
