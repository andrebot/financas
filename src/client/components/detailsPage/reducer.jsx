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
      const toMergeincomeTransactions = action.incomeTransactions;
      const incomeTransactions = Object.assign({}, state.incomeTransactions, toMergeincomeTransactions);
      return Object.assign({}, state, { incomeTransactions });
    default:
      return state;
  }
}
