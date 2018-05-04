import { LOADING_INCOME_TRANSACTIONS,
         LOADING_BILLS,
         LOADED_INCOME_TRANSACTIONS,
         LOADED_BILLS,
         NEXT_MONTH,
         ERROR_LOADING_TRANSACTIONS } from './actions.jsx';

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
  currentMonth: {
    monthNumber: 4,
    monthName: 'May'
  }
};

export default function detailsPage(state = initialState, action) {
  switch (action.type) {
    case LOADING_INCOME_TRANSACTIONS:
    case LOADED_INCOME_TRANSACTIONS:
    case ERROR_LOADING_TRANSACTIONS:
      const toMergeincomeTransactions = action.incomeTransactions;
      const incomeTransactions = Object.assign({}, state.incomeTransactions, toMergeincomeTransactions);
      return Object.assign({}, state, { incomeTransactions });
    case LOADING_BILLS:
    case LOADED_BILLS:
      const toMergeBills = action.bills;
      const bills = Object.assign({}, state.bills, toMergeBills);
      return Object.assign({}, state, { bills });
    case NEXT_MONTH:
      const currentMonth = Object.assign({}, state.currentMonth, action.currentMonth);
      return Object.assign({}, state, {currentMonth});
    default:
      return state;
  }
}
