import React from 'react';
import { combineReducers, createStore } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import MainMenu from './components/menu/menu.container.jsx';
import menu from './components/menu/reducer.jsx';
import { changePage } from './components/menu/actions.jsx';

const app = combineReducers({
  menu
});
const store = createStore(app);

render(
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route path='/' render={props => <MainMenu {...props} />} />
      </div>
    </BrowserRouter>
  </Provider>
  , document.getElementById('container')
);
