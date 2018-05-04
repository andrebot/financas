import { LOADING_INCOME_TRANSACTIONS,
         LOADING_BILLS,
         LOADED_INCOME_TRANSACTIONS,
         LOADED_BILLS,
         NEXT_MONTH,
         ERROR_LOADING_TRANSACTIONS } from './actions.jsx';
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
      const currentDate = Object.assign({}, state.currentDate, action.currentDate);
      return Object.assign({}, state, {currentDate});
    default:
      return state;
  }
}
