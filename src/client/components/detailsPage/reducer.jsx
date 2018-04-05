import { LOADING_INCOME_TRANSACTIONS, LOADED_INCOME_TRANSACTIONS } from './actions.jsx';

const initialState = {
  incomeTransactions: {
    isLoading: true,
    errors: [],
    data: []
  }
};

export default function detailsPage(state = initialState, action) {
  switch (action.type) {
    case LOADING_INCOME_TRANSACTIONS:
    case LOADED_INCOME_TRANSACTIONS:
      incomeTransactions = action.incomeTransactions;
      return Object.assign({}, state, { incomeTransactions });
    default:
      return state;
  }
}
