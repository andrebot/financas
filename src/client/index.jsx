import React from 'react';
import { combineReducers, createStore } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import MainMenu from './components/menu/menu.container.jsx';
import menu from './components/menu/reducer.jsx';
import { changePage } from './components/menu/actions.jsx';

const app = combineReducers({
  menu
});
const store = createStore(app);

render(
  <Provider store={store}>
    <MainMenu />
  </Provider>
  , document.getElementById('container')
);
