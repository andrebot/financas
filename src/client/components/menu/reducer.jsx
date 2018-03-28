import { changePage, CHANGE_PAGE } from './actions.jsx';

const initialState = {
  page: 'home'
};

export default function menu(state = initialState, action) {
  switch (action.type) {
    case CHANGE_PAGE:
      return Object.assign({}, state, { activePage: action.page });
      break;
    default:
      return state;
  }
}
