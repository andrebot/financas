import { LOADING_INCOME_TRANSACTIONS } from './actions.jsx';

const initialState = {
  incomeTransactions: [
    {
      from: 'Dummy Bank',
      to: 'Other Bank',
      date: Date.now(),
      value: 10.0000
    },
    {
      from: 'Dummy Bank',
      to: 'Other Bank',
      date: Date.now(),
      value: 10.0000
    },
    {
      from: 'Dummy Bank',
      to: 'Other Bank',
      date: Date.now(),
      value: 10.0000
    },
    {
      from: 'Dummy Bank',
      to: 'Other Bank',
      date: Date.now(),
      value: 10.0000
    },
    {
      from: 'Dummy Bank',
      to: 'Other Bank',
      date: Date.now(),
      value: 10.0000
    },
  ]
};

export default function detailsPage(state = initialState, action) {
  switch (action.type) {
    case LOADING_INCOME_TRANSACTIONS:
      return Object.assign({}, state, action.status);
      break;
    default:
      return state;
  }
}
